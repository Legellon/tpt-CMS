const Table = require('../models/database/table')

let tableModel = new Table //create a virtual instance of Table for type defining of variable

module.exports = {
    async Render(req, res) {
        const { database, table } = req.params

        //if the table isn't real then construct it as real
        if (tableModel.type !== Table.types.real) {
            tableModel = new Table(database, table)
            await tableModel.initialize()
        }

        const T_ORB = {
            title: `${tableModel.name} CMS`,

            table: await tableModel.ORB(),

            connection: {
                codes: Table.connection_codes,
                status: Table.connection_codes.successful,
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
        const { [tableModel.primary_name]: primary } = req.body

        await tableModel.deleteRow(primary)

        return res.status(200).redirect('back')
    },

    async Save(req, res) {
        const { ...data } = req.body

        await tableModel.saveRow(data)

        return res.status(200).redirect('back')
    },

    async Edit(req, res) {
        const { [tableModel.primary_name]: primary, ...data} = req.body

        await tableModel.editRow(primary, data)

        return res.status(200).redirect('back')
    }
}