const Table = require('../models/database/table')

let tableModel

module.exports = {
    async Render(req, res) {
        const { database, table } = req.params

        tableModel = new Table(database, table)
        await tableModel.initialize()

        const T_ORB = {
            title: `${tableModel.name} CMS`,

            table: await tableModel.buildORB(),

            connection: {
                codes: tableModel.connection_codes,
                status: tableModel.connection_codes.SUCCESSFUL,
            },
        }

        return res.status(200).render('cms/index', T_ORB)
    },

    async Up(req, res) {
        const { COLUMN_NAME, ORDINAL_POSITION } = req.body

        //need to get a position of the line near to the next line to take the place of the next line(ORDINAL_POSITION - 2)
        await tableModel.changeOrder(COLUMN_NAME, parseInt(ORDINAL_POSITION) - 2)

        res.status(200).redirect('back')
    },

    async Down(req, res) {
        const { COLUMN_NAME, ORDINAL_POSITION } = req.body

        //need to get a position of the previous line to take the place of the previous line(ORDINAL_POSITION + 1)
        await tableModel.changeOrder(COLUMN_NAME, parseInt(ORDINAL_POSITION) + 1)
        
        res.status(200).redirect('back')
    },

    async Delete(req, res) {
        //assign primary value from form by primary name into the table
        const { [tableModel.primaryName]: primary } = req.body

        await tableModel.deleteRow(primary)

        return res.status(200).redirect('back')
    },

    async Save(req, res) {
        const { ...data } = req.body

        await tableModel.saveRow(data)

        return res.status(200).redirect('back')
    },

    async Edit(req, res) {
        const { [tableModel.primaryName]: primary, ...data} = req.body

        await tableModel.editRow(primary, data)

        return res.status(200).redirect('back')
    }
}