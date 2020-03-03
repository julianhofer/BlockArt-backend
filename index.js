
const { conn } = require('./DBConnection.js');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const ethers = require('ethers');

// wird benötigt um abi auszulesen welche man brauch um transaktionen durchzuführen
const smartContract = require('./contracts/ArtWorkContract')

// Für den Prototypen wurden vier Wallets im Ropsten Netz erstellt. Jedes Wallet hat 1 ETH als Testgeld. 
// Die priv- und pubKeys sind aktuell nur in der mySql DB zu sehen. Die Wallets wie auch die sql db (dump im Ordner backup) laufen auf Julian Hofer (jh187). 
// Hier brauch die HdM für ein vollwertiges Produkt eine eigene Wallet im prod ETH Netz. Deployment, Transaktionen, etc können jedoch weiterhin über Infura realisiert werden.
// API sollte neu strukturiert werden (models, controller, routes, etc). Dieser Aufabu wird nur einem funktionalen Prototypen gerecht.

// Um den Kauf und Weiterverkauf für den Endkunde so einfach wie möglich zu gestalten, kann es verschiedene Lösungen geben.
// Hier ein paar Ideen:
// - HdM besitzt eine Art admin oder main wallet welches ETH besitzt. Beim Kauf oder Verkauf eines Kunstwerks wird automatisch der entsprechende Gas Betrag auf das Owner wallet überwiesen.
// - Jeder App user/Art owner muss selbst Geld auf sein Wallet überweisen wenn er/sie das Bild verkaufen will. Wallet wird automatisch bei Registrierung angelegt. App liefert API oder Beschreibung wie der Kauf von ETH funktioniert
// - Kauf und Verkauf werden ebenfalls über Krypto (ETH) realisiert. 


// Verbindung zur Infura API
// API läuft aktuell auf Julian Hofer (jh187). Hier muss in Zukunft ein neutraler HdM Account erstellt werden.
// Alle Contracts sind im Ropsten Testnetzwerk deployt (Contract Adressen sind dem sql dump zu entnehmen).
const provider = new ethers.providers.JsonRpcProvider('https://ropsten.infura.io/v3/6a9086d09c8a4e0e99c279571ee00bad');
const abi = smartContract.abi;
var contractAddress = null;
var privateKey = null;
var publicKey = null;

// parse application/json
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Working!!!'));

//Server listening (Port gilt nur für lokale Umgebung)
app.listen(process.env.PORT || 3000, function () {
    console.log('server is running on port 3000', '');
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

// API wird aufgerufen wenn die changeOwner Methode länger als 30 Sekunden dauert
// Note: Die meisten Webserver brechen standardmäßig API Anfragen nach 30 Sek mit einem Fehler ab. 
// In diesem Aufruf wird nichts anderes gemacht, wie weiter auf Antwort vom SmartContract Event zu warten. 
// Note: Die updateOwnership in der MySql DB wird jedoch trotzdem im event listener der 'app.post('/api/ownership/newOwner')' durchgeführt
app.post('/api/ownership/newOwner/reload', (req, res) => {
    var artHash = req.body.artHash;

    getContract(artHash).then(function (result) {
        contractAddress = result;
        var contract = new ethers.Contract(contractAddress, abi, provider);

        contract.on("OwnershipTransferred", (previousOwner, newOwner) => {
            contract.artHash().then((artHash) => {
            });
            console.log("Note: Das minen des SmartContracts auf der Blockchain hat länger als 30 Sekunden gedauert.")

            let sqlread = "SELECT user_token, artHash FROM ownership";
            let query = conn.query(sqlread, (err, results) => {
                if (err) throw err;
                res.send(JSON.stringify({ "status": 200, "error": null, "response": results }));
            });
        });
    })
})

// Change owner of artwork and get new owner by 
// artHash(get contract), 
// userToken(get privKey), 
// username(get pubKey)
// after new owner was set on the contract
app.post('/api/ownership/newOwner', (req, res) => {

    var artHash = req.body.artHash;
    var userToken = req.body.user_token;
    var userName = req.body.userName;
    console.log("Bild soll an ", userName, " verkauft werden.")


    getContract(artHash).then(function (result1) {
        contractAddress = result1;
        console.log("contractAdress: ", contractAddress)

        getPublicKey(userName).then(function (result3) {
            try {
                publicKey = result3;
                console.log("publicKey: ", publicKey)
            } catch {
                console.log("Error beim Aufruf der getPublicKey Methode")
            }

            getPrivateKey(userToken).then(function (result2) {
                privateKey = result2;
                console.log("privateKey: ", privateKey)

                var contract = new ethers.Contract(contractAddress, abi, provider);
                var wallet = new ethers.Wallet(privateKey, provider);
                var contractWithSigner = contract.connect(wallet);

                contract.on("OwnershipTransferred", (previousOwner, newOwner) => {
                    console.log("previousOwner: ", previousOwner)
                    console.log("newOwner: ", newOwner);
                    contract.artHash().then((artHash) => {
                        console.log("of Picture with artHash: ", artHash)
                    });
                    // updates the ownership in db after ownership is changed on smartContract
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

                    try {
                        let transferOs = await contractWithSigner.transferOwnership(publicKey);
                        console.log("TransferHash: ", transferOs.hash);

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

});

// MySql querys to get data which are mendatory for the execution of the changeOwner function
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
            let pubSql = "SELECT pubKey FROM users WHERE username=" + "'" + userName + "'";

            let pubQuery = conn.query(pubSql, (err, pubKey) => {
                if (err) {
                    reject("Error: ", err);
                }

                var publiKey = Object.values(JSON.parse(JSON.stringify(pubKey[0])));
                resolve(publiKey.toString());
            })
        } catch {
            console.log("Fehler bei dem Versuch den PublicKey von der Datenbank zu laden.")
        }
    })
}



// Note: Alle folgenden APIs werden aktuell nicht genutzt, da Usermanagement ausgelagert wurde

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

// Methode um API respons über die standardmäßig limitierten 30 Sekunden herauszuzögern.
// Wir haben dies nun jedoch so abgefangen, indem wir aus dem frontend nach 30 sek einen weiteren API Aufruf in den catch block gepackt haben. (siehe Zeile 40)

// const extendTimeoutMiddleware = (req, res, next) => {
//     const space = ' ';
//     let isFinished = false;
//     let isDataSent = false;

//     // Only extend the timeout for API requests
//     if (!req.url.includes('/api')) {
//         next();
//         return;
//     }

//     res.once('finish', () => {
//         isFinished = true;
//     });

//     res.once('end', () => {
//         isFinished = true;
//     });

//     res.once('close', () => {
//         isFinished = true;
//     });

//     res.on('data', (data) => {
//         // Look for something other than our blank space to indicate that real
//         // data is now being sent back to the client.
//         if (data !== space) {
//             isDataSent = true;
//         }
//     });

//     const waitAndSend = () => {
//         setTimeout(() => {
//             // If the response hasn't finished and hasn't sent any data back....
//             if (!isFinished && !isDataSent) {
//                 // Need to write the status code/headers if they haven't been sent yet.
//                 if (!res.headersSent) {
//                     res.writeHead(202);
//                 }

//                 res.write(space);

//                 // Wait another 15 seconds
//                 waitAndSend();
//             }
//         }, 15000);
//     };

//     waitAndSend();
//     next();
// };

// app.use(extendTimeoutMiddleware);