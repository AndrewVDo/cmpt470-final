const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const path = require('path')
const router = new express.Router();
const fs = require('fs')
const multer = require('multer')
const upload = multer({
    dest: './tmp/csv/',
})
const csv = require('fast-csv')
const ejs = require('ejs')
const md5 = require('md5')
const mysql = require('mysql2')
const pool = mysql.createPool({
    host: '35.227.146.173',
    user: 'readonlyuser',
    password: 'readonly',
    database: 'cmpt470',
})
const promisePool = pool.promise()

const app = express();
app.set('view engine', ejs)
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(session({
    secret: 'davie jones locker'
}))
app.use('upload-csv', router)

app.get('/', (req, res) => {
    res.render('./Login.ejs')
})

app.post('/login', async (req, res) => {
    let result = {
        success: false,
        msg: 'message in a bottle',
    }
    try {
        let [rows, fields] = await promisePool.query(`SELECT * from users where username="${req.body.username}"`)
        if (rows.length == 0) {
            result.msg = 'User does not exist'
        }
        else if (md5(req.body.password).toString() !== rows[0].password) {
            result.msg = 'Incorrect password'
        }
        else {
            result.success = true
            result.msg = 'Login success'
            req.session.username = req.body.username
        }
    }
    catch (e) {
        throw e
    }

    res.json(result);
})

app.get('/landing-page', (req, res) => {
    if(!req.session.username) {
        res.render('./Login.ejs')
        return
    }

    res.render('./LandingPage.ejs')
})

app.post('/upload-file', upload.single('file'), async (req, res) => {
    let promise = new Promise((resolve, result) => {
        let fileRows = []
        fs.createReadStream(path.resolve(__dirname, req.file.path))
            .pipe(csv.parse({ headers: true }))
                .on('error', error => console.error(error))
                .on('data', row => fileRows.push(row))
                .on('end', rowCount => {
                    resolve(fileRows)
                    console.log(path.resolve(__dirname, req.file.path))
                    fs.unlink(path.resolve(__dirname, req.file.path), (e) => {
                        if (e) throw e
                    })
                });
    })
    let result = await promise
    console.log(result)
})

app.listen(8080, () => console.log("Listening on 8080"))