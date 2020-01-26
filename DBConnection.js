const mysql = require('mysql');


const db_config = {
    host: 'sql88.your-server.de',
    user: 'admin_db',
    password: 'bLXVbCZX3JUHvPGi',
    database: 'blockart'
};

var conn;

function handleDisconnect() {
    conn = mysql.createConnection(db_config);

    conn.connect(function (err) {
        console.log("MySql is connected...")
        if (err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
        }
    });

    conn.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect()

module.exports = {
    conn
};