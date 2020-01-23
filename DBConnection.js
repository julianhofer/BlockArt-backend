const mysql = require('mysql');


const conn = mysql.createConnection({
    host: 'sql88.your-server.de',
    user: 'admin_db',
    password: 'bLXVbCZX3JUHvPGi',
    database: 'blockart'
});

module.exports = { conn };