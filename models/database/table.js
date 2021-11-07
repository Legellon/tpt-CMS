const connection = require('./connection')
const queries = require('./table_queries')

/** Data and behavior of the table form database */
const Table = class {
    /**
     * @constructor 
     * @param {string} database
     * @param {string} table
     */
    constructor(database, table) {
        this._connection = connection(database)

        this.name = table
        this.database = database

        this.connection_codes = { FAILED: 0, SUCCESSFUL: 1 }
    }

    /**
     * Generate a structure of table
     * @async
     */
    async initialize() {
        this._structure = await this._getStructure()

        this._primary = this._structure.find(element => element.COLUMN_KEY === 'PRI')
        this.primaryName = this._primary.COLUMN_NAME
    }

    /**
     * 
     * @async
     * @param {string} sql 
     * @returns {Promise}
     */
    async _executeQuery(sql) {
        return new Promise((resolve) => {
            this._connection.execute(sql, (err, result) => {
                return resolve(result)
            })
        })
    }
    
    /**
     * Get data about the table as a JSON object
     * @async
     * @returns {object}
     */
    async buildORB() {
        const publicStructure = this._structure.map(element => {
            return { 
                COLUMN_NAME: element.COLUMN_NAME, 
                COLUMN_TYPE: element.COLUMN_TYPE, 
                COLUMN_KEY: element.COLUMN_KEY,
                ORDINAL_POSITION: element.ORDINAL_POSITION,
            }
        })
        
        const ORB = {
            source: this.database,
            name: this.name,

            structure: publicStructure,
            content: await this._getContent(),

            info: {
                keys: publicStructure.map(row => row.COLUMN_NAME), //get column names
                types: publicStructure.map(row => row.COLUMN_TYPE), //get column types
                structure_data: Object.keys(publicStructure.find(val => val ? true : false)) //get types of data("COLUMN_NAME", etc...) about structure by the first founded row if it exists
            }
        }

        return ORB
    }

    /**
     * 
     * @async
     * @param {string} column 
     * @param {number} position 
     * @returns {Promise}
     */
    async changeOrder(column, position) {
        const currentState = this._structure.find(element => element.COLUMN_NAME === column)

        //a new position can't be lesser than 0(already first) and bigger than a count of elements in the table(already last).
        position = position < 0 ? 0 : position > this._structure.length ? this._structure.length - 1 : position

        //get the name of the element from the order by position if a position isn't first
        const after = position === 0 ? 'FIRST' : this._structure.find(element => element.ORDINAL_POSITION === position).COLUMN_NAME

        return await this._executeQuery(queries.changeOrder(this, currentState, after))
    }

    /**
     * 
     * @async
     * @param {object} data 
     * @returns {Promise}
     */
    async saveRow(data) {
        return await this._executeQuery(queries.saveRow(this, data))
    }

    /**
     * 
     * @async
     * @param {number} id 
     * @returns {Promise} 
     */
    async deleteRow(id) {
        return await this._executeQuery(queries.deleteRow(this, id))
    }

    /**
     * 
     * @async
     * @param {number} id 
     * @param {object} data 
     * @returns {Promise} 
     */
    async editRow(id, data) {
        return await this._executeQuery(queries.editRow(this, id, data))
    }

    /**
     * @async
     * @returns {Promise} 
     */
    async _getStructure() {
        return await this._executeQuery(queries.getStructure(this))
    }

    /**
     * @async
     * @returns {Promise}  
     */
    async _getContent() {
        return await this._executeQuery(queries.getContent(this))
    }
}

module.exports = Table