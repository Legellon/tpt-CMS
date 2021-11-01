const connection = require('./connection')
const queries = require('./table_queries')

const Table = class {
    constructor(database, table) {
        this._connection = connection(database)

        this.name = table
        this.database = database

        this.connection_codes = {
            FAILED: 0,
            SUCCESSFUL: 1
        }
    }

    async initialize() {
        this.structure = await this._executeQuery(queries.getStructure(this))
        this.primary = this.structure.find(element => element.COLUMN_KEY === 'PRI')
    }

    async _executeQuery(sql) {
        return new Promise((resolve) => {
            this._connection.execute(sql, (err, result) => {
                return resolve(result)
            })
        })
    }

    async getContent() {
        return await this._executeQuery(queries.getContent(this))
    }

    async saveRow(data) {
        return await this._executeQuery(queries.saveRow(this, data))
    }

    async deleteRow(id) {
        return await this._executeQuery(queries.deleteRow(this, id))
    }

    async editRow(id, data) {
        return await this._executeQuery(queries.editRow(this, id, data))
    }
}

module.exports = Table