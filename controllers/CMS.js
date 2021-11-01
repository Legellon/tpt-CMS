const Table = require('../models/database/table')

let tableModel

module.exports = {
    async Render(req, res) {
        const {database, table} = req.params

        tableModel = new Table(database, table)
        await tableModel.initialize()

        const { structure, connection_codes } = tableModel
        const T_ORB = {
            title: `${tableModel.name} CMS`,

            table: {
                source: tableModel.database,
                name: tableModel.name,

                structure: structure,
                content: await tableModel.getContent(),

                info: {
                    keys: structure.map(row => row.COLUMN_NAME),
                    types: structure.map(row => row.COLUMN_TYPE),
                    structure_data: Object.keys(structure.find(val => val ? true : false))
                }
            },

            codes: connection_codes,
            status: connection_codes.SUCCESSFUL,
        }

        return res.status(200).render('cms/index', T_ORB)
    },

    async Delete(req, res) {
        const { id } = req.body

        await tableModel.deleteRow(id)

        return res.status(200).redirect('back')
    },

    async Save(req, res) {
        const { lang, count } = req.body

        await tableModel.saveRow({
            lang: lang,
            count: count
        })

        return res.status(200).redirect('back')
    },

    async Edit(req, res) {
        const { id, lang, count } = req.body

        await tableModel.editRow(id, {
            lang: lang,
            count: count
        })

        return res.status(200).redirect('back')
    }
}