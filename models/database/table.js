const connection = require('./connection')
const queries = require('./table_queries')

/** Data and behavior of the table form database */
const Table = class {
    /**
     * Construct a table by name of the table and the database
     * @constructor 
     * @param {string} database Database name
     * @param {string} table Table name
     */
    constructor(database, table) {
        this._connection = connection(database)

        this.name = table
        this.database = database

        this.connection_codes = { FAILED: 0, SUCCESSFUL: 1 }
    }

    /**
     * Construct all async data of table
     * @async
     */
    async initialize() {
        this._structure = await this._getStructure()

        this._primary = this._structure.find(element => element.COLUMN_KEY === 'PRI')
        this.primaryName = this._primary.COLUMN_NAME
    }

    /**
     * Prepare and execute SQL query in async mode
     * @async
     * @param {string} sql Query
     * @returns {Promise} Result of execution
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
     * @returns {object} JSON object
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
     * Edit order of rows in the table
     * @async
     * @param {string} column A name of the column
     * @param {number} position A new position
     * @returns {Promise}
     */
    async changeOrder(column, position) {
        const currentState = this._structure.find(element => element.COLUMN_NAME === column)
        const rowsCount = this._structure.length //count of rows in the table

        //a new position can't be lesser than 0(already first) and bigger than a count of rows in the table(already last)
        position = position < 0 ? 0 : position > rowsCount ? rowsCount - 1 : position

        //get the name of the element from the order by position if a position isn't first
        const after = position === 0 ? 'FIRST' : this._structure.find(element => element.ORDINAL_POSITION === position).COLUMN_NAME

        return await this._executeQuery(queries.changeOrder(this, currentState, after))
    }

    /**
     * Save a new row in the table
     * @async
     * @param {object} data Data as a JSON object where keys match with names of table columns
     * @returns {Promise} Result of execution
     */
    async saveRow(data) {
        return await this._executeQuery(queries.saveRow(this, data))
    }

    /**
     * Delete a row from the table
     * @async
     * @param {number} id Primary key of row
     * @returns {Promise} Result of execution
     */
    async deleteRow(id) {
        return await this._executeQuery(queries.deleteRow(this, id))
    }

    /**
     * Edit a row in the table by primary key with data
     * @async
     * @param {number} id Primary key of row
     * @param {object} data Data as a JSON object where keys match with names of table columns
     * @returns {Promise} Result of execution
     */
    async editRow(id, data) {
        return await this._executeQuery(queries.editRow(this, id, data))
    }

    /**
     * Get data about the structure of the table
     * @async
     * @returns {Promise} Result of execution
     */
    async _getStructure() {
        return await this._executeQuery(queries.getStructure(this))
    }

    /**
     * Get all content from the table
     * @async
     * @returns {Promise} Result of execution
     */
    async _getContent() {
        return await this._executeQuery(queries.getContent(this))
    }
}

module.exports = Table