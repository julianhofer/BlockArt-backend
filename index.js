
const { conn } = require('./DBConnection.js');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const ethers = require('ethers');
const smartContract = require('./contracts/ArtWorkContract')

const provider = new ethers.providers.JsonRpcProvider('https://ropsten.infura.io/v3/6a9086d09c8a4e0e99c279571ee00bad');
const abi = smartContract.abi;
// var contractAddress = null;
// var privateKey = null;
// var publicKey = null;

// parse application/json
app.use(bodyParser.json());

//show all users
app.get('/api/users', (req, res) => {
    let sql = "SELECT * FROM users";
    let query = conn.query(sql, (err, results) => {
        if (err) throw err;
        res.send(JSON.stringify({ "status": 200, "error": null, "response": results }));
    });
});

//show single user by id
app.get('/api/users/:user_id', (req, res) => {
    let sql = "SELECT * FROM users WHERE user_id=" + req.params.user_id;
    let query = conn.query(sql, (err, results) => {
        if (err) throw err;
        res.send(JSON.stringify({ "status": 200, "error": null, "response": results }));
    });
});

//show single user by token where isOwner is true
app.get('/api/users/:user_token', (req, res) => {
    let sql = "SELECT * FROM users WHERE user_token=" + req.params.user_token + "AND isOwner = true";
    let query = conn.query(sql, (err, results) => {
        if (err) throw err;
        res.send(JSON.stringify({ "status": 200, "error": null, "response": results }));
    });
});

//show single user by pubKey
app.get('/api/users/pubKey/:pubKey', (req, res) => {
    let sql = "SELECT * FROM users WHERE pubKey=" + "'" + req.params.pubKey + "'";
    let query = conn.query(sql, (err, results) => {
        if (err) throw err;
        res.send(JSON.stringify({ "status": 200, "error": null, "response": results }));
    });
});

//add new user
app.post('/api/users', (req, res) => {

    let sql = "INSERT INTO users (`user_token`, `isOwner`, `pubKey`, `privKey`) VALUES ('" + req.body.user_token
        + "', '" + req.body.isOwner + "', '" + req.body.pubKey + "' , MD5('" + req.body.privKey + "') );";
    let query = conn.query(sql, (err, results) => {
        if (err) throw err;
        res.send(JSON.stringify({ "status": 200, "error": null, "response": results }));
    });
});

//update user Boolean isOwner
app.put('/api/users/:user_token', (req, res) => {
    let sql = "UPDATE users SET isOwner='" + req.body.isOwner
        + "' WHERE user_token=" + req.params.user_token;
    let query = conn.query(sql, (err, results) => {
        if (err) throw err;
        res.send(JSON.stringify({ "status": 200, "error": null, "response": results }));
    });
});

//Delete user
app.delete('/api/users/:user_id', (req, res) => {
    let sql = "DELETE FROM users WHERE user_id=" + req.params.user_id + "";
    let query = conn.query(sql, (err, results) => {
        if (err) throw err;
        res.send(JSON.stringify({ "status": 200, "error": null, "response": results }));
    });
});

// Get artHash and userToken from Ownership
app.get('/api/ownership/', (req, res) => {
    let sql = "SELECT user_token, artHash FROM ownership";
    let query = conn.query(sql, (err, results) => {
        if (err) throw err;
        res.send(JSON.stringify({ "status": 200, "error": null, "response": results }));
    });
});

// Get users with another or no artHash
app.get('/api/users/arthash/:arthash', (req, res) => {
    let sql = "SELECT username FROM users WHERE ( user_token != ( SELECT user_token FROM ownership WHERE ownership.artHash = " + "'" + req.params.arthash + "'))";
    let query = conn.query(sql, (err, results) => {
        if (err) throw err;
        res.send(JSON.stringify({ "status": 200, "error": null, "response": results }));
    });
});

// Get new owner by artHash(get contract), userToken(get privKey), username(get pubKey)
app.post('/api/ownership/newOwner', (req, res) => {

    var artHash = req.body.artHash;
    var userToken = req.body.user_token;
    var userName = req.body.userName;


    getContract(artHash).then(function (result1) {
        var contractAddress = result1;
        console.log("contractAdress: ", contractAddress)


        getPrivateKey(userToken).then(function (result2) {
            var privateKey = result2;
            console.log("privateKey: ", privateKey)

            // setTimeout(function () {
            //     console.log("wait a sek")

            // }, 500)

            getPublicKey(userName).then(function (result3) {
                try {
                    publicKey = result3;
                    console.log("publicKey: ", publicKey)
                } catch {
                    console.log("Error beim Aufruf der getPublicKey Methode")
                }


                var contract = new ethers.Contract(contractAddress, abi, provider);
                var wallet = new ethers.Wallet(privateKey, provider);
                var contractWithSigner = contract.connect(wallet);

                contract.on("OwnershipTransferred", (previousOwner, newOwner) => {
                    console.log("previousOwner: ", previousOwner)
                    console.log("newOwner: ", newOwner);
                    contract.artHash().then((artHash) => {
                        console.log("of Picture with artHash: ", artHash)
                    });

                    let sql = "UPDATE ownership SET user_token = (SELECT user_token FROM users WHERE users.pubKey= "
                        + "'" + newOwner + "') WHERE artHash = " + "'" + artHash + "'";
                    let updateQuery = conn.query(sql, (err, result) => {
                        if (err) {
                            console.log("contract.on: ", err);
                        }
                        let results = ["newOwner: ", newOwner, "artHash: ", artHash];
                        res.send(JSON.stringify({ "status": 200, "error": null, "response": results }));
                    })

                });

                async function transferOwner() {

                    // contract.owner().then((owner) => {
                    //     console.log("oldOwner: ", owner)
                    // });
                    try {
                        let transferOs = await contractWithSigner.transferOwnership(publicKey);
                        console.log("TransferHash: ", transferOs.hash);
                        // let results = ["artHash: ", artHash];
                        // res.send(JSON.stringify({ "status": 200, "error": null, "response": results }));
                        await transferOs.wait();
                        var newOwner = await contract.owner();

                    } catch (err) {
                        console.log("Error while transfering Ownership: ", err)
                    }
                };

                if (contract || wallet || contractWithSigner != null) {
                    transferOwner();
                }
                else {
                    console.log("SQL data came late. Check MySql Server Connection.")
                    setTimeout(transferOwner, 3000)
                }
            })

        })
    })



    function getContract(artHash) {
        return new Promise(function (resolve, reject) {
            try {
                let artSql = "SELECT contract_adress FROM ownership WHERE artHash=" + "'" + artHash + "'";
                let artQuery = conn.query(artSql, (err, contract) => {

                    if (err) {
                        reject(err);
                        console.log("Fehler bei dem Versuch die Contract Adresse von der Datenbank zu laden.")
                    }

                    var contractsAdress = Object.values(JSON.parse(JSON.stringify(contract[0])))
                    resolve(contractsAdress.toString());
                })
            } catch {
                console.log("Fehler bei dem Versuch die Contract Adresse von der Datenbank zu laden.")
            }
        });

    }

    function getPrivateKey(userToken) {
        return new Promise(function (resolve, reject) {
            try {
                let privSql = "SELECT privKey FROM users WHERE user_token=" + "'" + userToken + "'";

                let privQuery = conn.query(privSql, (err, privKey) => {
                    if (err) {
                        reject(err);
                        console.log("Fehler bei dem Versuch den PrivateKey von der Datenbank zu laden.")
                    }
                    var privatKey = Object.values(JSON.parse(JSON.stringify(privKey[0])))
                    resolve(privatKey.toString());
                })
            } catch {
                console.log("Fehler bei dem Versuch den PrivateKey von der Datenbank zu laden.")
            }
        })
    }

    function getPublicKey(userName) {
        return new Promise(function (resolve, reject) {

            try {
                let pubSql = "SELECT pubKey FROM users WHERE username=" + '"' + userName + '"';

                let pubQuery = conn.query(pubSql, (err, pubKey) => {
                    if (err) {
                        reject("Error: ", err);
                    }
                    console.log("pubKey die erste ", pubKey)
                    var publiKey = Object.values(JSON.parse(JSON.stringify(pubKey)));
                    console.log("pubKey die zweite ", publiKey)
                    console.log("pubKey die dritte ", publiKey.toString())
                    resolve(publiKey.toString());
                })
            } catch {
                console.log("Fehler bei dem Versuch den PublicKey von der Datenbank zu laden.")
            }
        })
    }

});



app.get('/', (req, res) => res.send('Working!!!'));

//Server listening
app.listen(process.env.PORT || 3000, function () {
    console.log('server running on port 3000', '');
});

const extendTimeoutMiddleware = (req, res, next) => {
    const space = ' ';
    let isFinished = false;
    let isDataSent = false;

    // Only extend the timeout for API requests
    if (!req.url.includes('/api')) {
        next();
        return;
    }

    res.once('finish', () => {
        isFinished = true;
    });

    res.once('end', () => {
        isFinished = true;
    });

    res.once('close', () => {
        isFinished = true;
    });

    res.on('data', (data) => {
        // Look for something other than our blank space to indicate that real
        // data is now being sent back to the client.
        if (data !== space) {
            isDataSent = true;
        }
    });

    const waitAndSend = () => {
        setTimeout(() => {
            // If the response hasn't finished and hasn't sent any data back....
            if (!isFinished && !isDataSent) {
                // Need to write the status code/headers if they haven't been sent yet.
                if (!res.headersSent) {
                    res.writeHead(202);
                }

                res.write(space);

                // Wait another 15 seconds
                waitAndSend();
            }
        }, 15000);
    };

    waitAndSend();
    next();
};

app.use(extendTimeoutMiddleware);