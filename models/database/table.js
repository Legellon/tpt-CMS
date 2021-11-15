const connection = require('./connection')
const queries = require('./table_queries')

/** Data and behavior of the table form database */
const Table = class {
    //enums
    static types = { 
        virtual: 0,
        real: 1
    }
    static connection_codes = connection.codes

    //Private attributes
    #structure
    #primary_element
    #connection

    /**
     * Construct a table by name of the table and the database
     * 
     * Note: if you create a real instance, you MUST initialize() an object after creation if you are going to use it
     * @constructor 
     * @param {string} database Database name
     * @param {string} table Table name
     */
    constructor(database, table) {
        if(database && table) {
            this.#constructAsReal(database, table)
        } else {
            this.#constructAsVirtual()
        }
    }

    #constructAsReal(database, table) {
        this.#connection = connection.create(database)

        this.name = table
        this.database = database

        this.type = Table.types.real
    }

    #constructAsVirtual() {
        this.type = Table.types.virtual
    }

    /**
     * Generate state for the table in async mode
     * @async
     */
     async initialize() {
        this.#structure = await this.#getStructure()

        this.#primary_element = this.#structure.find(element => element.COLUMN_KEY === 'PRI')
        this.primary_name = this.#primary_element.COLUMN_NAME
    }

    /**
     * Prepare and execute SQL query in async mode
     * @async
     * @param {string} sql Query
     * @returns {Promise} Result of execution
     */
    async #executeQuery(sql) {
        return new Promise((resolve) => {
            this.#connection.execute(sql, (err, result) => {
                return resolve(result)
            })
        })
    }
    
    /**
     * Get data about the table as a JSON object
     * @async
     * @returns {object} JSON object
     */
    async ORB() {
        const publicStructure = this.#structure.map(element => {
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
            content: await this.#getContent(),

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
     */
    async changeOrder(column, position) {
        const currentState = this.#structure.find(element => element.COLUMN_NAME === column)
        const rowsCount = this.#structure.length //count of rows in the table

        //a new position can't be lesser than 0(already first) and bigger than a count of rows in the table(already last)
        position = position < 0 ? 0 : position > rowsCount ? rowsCount - 1 : position
        //get the name of the element from the order by position if a position isn't first
        const after = position === 0 ? 'FIRST' : this.#structure.find(element => element.ORDINAL_POSITION === position).COLUMN_NAME

        await this.#executeQuery(queries.changeOrder(this, currentState, after))
        await this.initialize() //method has a straight influence on the state of the table, so we need to reinitialize the table
    }

    /**
     * Save a new row in the table
     * @async
     * @param {object} data Data as a JSON object where keys match with names of table columns
     */
    async saveRow(data) {
        await this.#executeQuery(queries.saveRow(this, data))
    }

    /**
     * Delete a row from the table
     * @async
     * @param {number} id Primary key of row
     */
    async deleteRow(id) {
        await this.#executeQuery(queries.deleteRow(this, id))
    }

    /**
     * Edit a row in the table by primary key with data
     * @async
     * @param {number} id Primary key of row
     * @param {object} data Data as a JSON object where keys match with names of table columns
     */
    async editRow(id, data) {
        await this.#executeQuery(queries.editRow(this, id, data))
    }

    /**
     * Get data about the structure of the table
     * @async
     * @returns {Promise} Result of execution
     */
    async #getStructure() {
        return await this.#executeQuery(queries.getStructure(this))
    }

    /**
     * Get all content from the table
     * @async
     * @returns {Promise} Result of execution
     */
    async #getContent() {
        return await this.#executeQuery(queries.getContent(this))
    }
}

module.exports = Table