
const { conn } = require('./DBConnection.js');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const Methods = require('./ethers');

var transferOwner = Methods.transferOwner;
// var contract = Methods.contract;
// const mysql = require('mysql');


// parse application/json
app.use(bodyParser.json());


//connect to database
conn.connect((err) => {
    if (err) throw err;
    console.log('Mysql Connected...');
});

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

// Get users with another or no artHash
// SELECT username FROM blockart.users WHERE ( user_token != ( SELECT user_token FROM ownership WHERE arthash = 'dritterArthash'));

// Put new owner by artHash(get contract), userToken(get privKey), username(get pubKey)
app.get('/api/ownership/newOwner/', (req, res) => {

    var getChangeOwnerData = async function () {

        var artHash = req.body.artHash;
        var userToken = req.body.user_token;
        var userName = req.body.userName;
        let artSql = "";
        let privSql = "";
        let pubSql = "";
        try {
            let artQuery = await conn.query(artSql, (err, contract) => {
                if (err) throw err;
                return contract;
            });

            let privQuery = await conn.query(privSql, (err, privKey) => {
                if (err) throw err;
                return privKey;
            });

            let pubQuery = await conn.query(pubSql, (err, pubKey) => {
                if (err) throw err;
                return pubKey;
            });

        } catch (err) {
            logger.error("Error while getting the data from the mySql database")
        }





        artQuery.then((contract) => {

        })

    }
    // contract.owner().then((owner) => {

    //     if (req != owner) {
    //         transferOwner.then((newOwner) => {
    //             res.send(JSON.stringify({ "status": 200, "error": null, "response": newOwner }));
    //         })
    //     }
    // });
});


app.get('/', (req, res) => res.send('Working!!!'));

//Server listening
app.listen(process.env.PORT || 3000, function () {
    console.log('server running on port 3000', '');
});