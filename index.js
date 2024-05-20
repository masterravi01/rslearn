const express = require('express')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 4000

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/rslearn', (req, res) => {
    res.send('<h1>Hello , Welcome to rs learn</h1>')
})

app.get('/gogi', (req, res) => {
    res.send('<h3>My name is master</h3>')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})