module.exports = {
    getStructure(TableModel) {
        return `SELECT COLUMN_NAME,COLUMN_TYPE,COLUMN_KEY,ORDINAL_POSITION FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='${TableModel.database}' AND TABLE_NAME='${TableModel.name}' ORDER BY ORDINAL_POSITION;`
    },

    getContent(TableModel) {
        return `SELECT * FROM \`${TableModel.database}\`.\`${TableModel.name}\`;`
    },

    saveRow(TableModel, data) {
        const wrapped_collumns = Object.keys(data).map(column => `\`${column}\``).join(', ')
        const wrapped_values = Object.values(data).map(value => `'${value}'`).join(', ')

        return `INSERT INTO \`${TableModel.database}\`.\`${TableModel.name}\` (${wrapped_collumns}) VALUES (${wrapped_values});`
    },

    deleteRow(TableModel, id) {
        return `DELETE FROM \`${TableModel.database}\`.\`${TableModel.name}\` WHERE (\`${TableModel.primary.COLUMN_NAME}\` = '${id}');`
    },

    editRow(TableModel, id, data) {
        const set_string = []

        const wrapped_collumns = Object.keys(data).map(column => `\`${column}\``)
        const wrapped_values = Object.values(data).map(value => `'${value}'`)

        for (let index in wrapped_collumns) {
            set_string.push(`${wrapped_collumns[index]} = ${wrapped_values[index]}`)
        }

        return `UPDATE \`${TableModel.database}\`.\`${TableModel.name}\` SET ${set_string.join(', ')} WHERE (\`${TableModel.primary.COLUMN_NAME}\` = '${id}');`
    }
}