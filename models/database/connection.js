const mysql = require('mysql2')
const config = require('../../config/config')

const default_database = config.database.fedotov_schema

const connection = (database = default_database.NAME, user = default_database.USER, password = default_database.PASS, host = default_database.HOST) => {
    return mysql.createConnection({
        database: database,
        password: password,
            user: user,
            host: host,
    })
}

module.exports = connection