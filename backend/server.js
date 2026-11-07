require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const notesRoutes = require('./routes/notes')

const app = express()

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
    console.log(req.path, req.method)
    next();
})

app.use('/api/notes', notesRoutes)

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('Listening on port 4000')
        })
    })
    .catch((error) => { console.log(error) })

