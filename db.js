const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'mysql.railway.internal',
    user: 'root',
    password: 'gWlzILLyEYovHmYoQBlXkXMGyimqSEdu',
    database: 'railway',
    port: 3306
});

connection.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

module.exports = connection;