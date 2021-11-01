module.exports = {
    defaults: {
        SERVER_PORT: process.env.SERVER_PORT,
    },

    database: {
        fedotov_schema: {
            NAME: 'fedotov-schema',
            HOST: '127.0.0.1',
            USER: 'root',
            PASS: 'root11',
        },
    }
}