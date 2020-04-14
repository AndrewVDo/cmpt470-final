const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const ejs = require('ejs')

const app = express();
app.set('view engine', ejs)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/', (req,res)=> {
    res.render('./Login.ejs')
})


app.listen(8080, () => console.log("Listening on 8080"))