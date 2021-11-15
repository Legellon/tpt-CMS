const express = require('express')
const dotenv = require('dotenv').config({ path: './config/.env' })
const config = require('./config/config')

const server = express()

const { SERVER_PORT } = config.defaults

server.set('view engine', 'ejs')
server.set('views', './public/views')

server.use(express.json())
server.use(express.urlencoded({ extended: false}))

server.use('/cms', require('./router/CMS'))

server.listen(SERVER_PORT, console.log(`Application started on port: ${SERVER_PORT}`))