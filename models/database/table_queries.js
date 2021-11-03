module.exports = {
    getStructure(TableModel) {
        return `SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='${TableModel.database}' AND TABLE_NAME='${TableModel.name}' ORDER BY ORDINAL_POSITION;`
    },

    getContent(TableModel) {
        return `SELECT * FROM \`${TableModel.database}\`.\`${TableModel.name}\`;`
    },

    changeOrder(TableModel, state, after) {
        const { COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA } = state

        const nullable = IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'
        const __default = COLUMN_DEFAULT !== null ? `DEFAULT '${COLUMN_DEFAULT}'` : ''
        const position = after !== 'FIRST' ? `AFTER \`${after}\`` : 'FIRST'

        const changeString = `COLUMN \`${COLUMN_NAME}\` \`${COLUMN_NAME}\` ${COLUMN_TYPE.toUpperCase()} ${nullable} ${__default}${EXTRA.toUpperCase()} ${position}`
        
        return `ALTER TABLE \`${TableModel.database}\`.\`${TableModel.name}\` CHANGE ${changeString};`
    },

    saveRow(TableModel, data) {
        const wrappedCollumns = Object.keys(data).map(column => `\`${column}\``).join(', ')
        const wrappedValues = Object.values(data).map(value => `'${value}'`).join(', ')

        return `INSERT INTO \`${TableModel.database}\`.\`${TableModel.name}\` (${wrappedCollumns}) VALUES (${wrappedValues});`
    },

    deleteRow(TableModel, id) {
        return `DELETE FROM \`${TableModel.database}\`.\`${TableModel.name}\` WHERE (\`${TableModel.primaryName}\` = '${id}');`
    },

    editRow(TableModel, id, data) {
        const wrappedCollumns = Object.keys(data).map(column => `\`${column}\``)
        const wrappedValues = Object.values(data).map(value => `'${value}'`)

        const setString = []

        for (let index in wrappedCollumns) {
            setString.push(`${wrappedCollumns[index]} = ${wrappedValues[index]}`)
        }

        const setCondition = setString.join(', ')

        return `UPDATE \`${TableModel.database}\`.\`${TableModel.name}\` SET ${setCondition} WHERE (\`${TableModel.primaryName}\` = '${id}');`
    }
}