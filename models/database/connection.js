const mysql = require('mysql2')
const config = require('../../config/config')

const default_database = config.database.fedotov_schema

module.exports = {
    //enums
    codes: { 
        failed: 0, 
        successful: 1 
    },

    create(database = default_database.NAME, user = default_database.USER, password = default_database.PASS, host = default_database.HOST) {
        return mysql.createConnection({
            database: database,
            password: password,
                user: user,
                host: host,
        })
    }

}