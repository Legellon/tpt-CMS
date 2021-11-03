const connection = require('./connection')
const queries = require('./table_queries')

const Table = class {
    constructor(database, table) {
        this._connection = connection(database)

        this.name = table
        this.database = database

        this.connection_codes = { FAILED: 0, SUCCESSFUL: 1 }
    }

    async initialize() {
        this._structure = await this._getStructure()
        this.publicStructure = this._structure.map(element => {
            return { 
                COLUMN_NAME: element.COLUMN_NAME, 
                COLUMN_TYPE: element.COLUMN_TYPE, 
                COLUMN_KEY: element.COLUMN_KEY,
                ORDINAL_POSITION: element.ORDINAL_POSITION,
            }
        })

        this._primary = this._structure.find(element => element.COLUMN_KEY === 'PRI')
        this.primaryName = this._primary.COLUMN_NAME
    }

    async _executeQuery(sql) {
        return new Promise((resolve) => {
            this._connection.execute(sql, (err, result) => {
                return resolve(result)
            })
        })
    }

    async buildORB() {
        const ORB = {
            source: this.database,
            name: this.name,

            structure: this.publicStructure,
            content: await this._getContent(),

            info: {
                keys: this.publicStructure.map(row => row.COLUMN_NAME),
                types: this.publicStructure.map(row => row.COLUMN_TYPE),
                structure_data: Object.keys(this.publicStructure.find(val => val ? true : false))
            }
        }

        return ORB
    }

    async changeOrder(column, position) {
        const currentState = this._structure.find(element => element.COLUMN_NAME === column)

        position = position < 0 ? 0 : position > this._structure.length ? this._structure.length - 1 : position
        const after = position === 0 ? 'FIRST' : this._structure.find(element => element.ORDINAL_POSITION === position).COLUMN_NAME

        return await this._executeQuery(queries.changeOrder(this, currentState, after))
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

    async _getStructure() {
        return await this._executeQuery(queries.getStructure(this))
    }

    async _getContent() {
        return await this._executeQuery(queries.getContent(this))
    }
}

module.exports = Table