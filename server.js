// const http = require("http")
// const fs = require("fs")
// const { url } = require("inspector")
// const port = 3000

// const index = fs.readFileSync('index.html', 'utf-8')
// const form = fs.readFileSync('form.html', 'utf-8')
// http.createServer(function (req, res) {
//     res.writeHead(200, {
//         "content-type": "text/html"
//     })
//     switch (req.url) {
//         case '/':
//             res.end(index)
//             break;
//         case '/add':
//             res.end(form)
//             break;
//     }
// }).listen(port) 

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
const path = require('path')

// const sqlite3 = require('sqlite3').verbose();
// const db = new sqlite3.Database(
//     path.join(__dirname, 'db', 'data.db')
// );

const { Pool } = require('pg')

const db = new Pool({
    user: 'Andi',
    password: '12345',
    host: 'Localhost',
    port: '5432',
    database: 'datadb',
})


app.set('view engine', 'ejs')
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded())

// parse application/json
app.use(bodyParser.json())

app.use(express.static('public'))

app.get('/', (req, res) => {
    const { nis, name, address } = req.query

    let sql = "SELECT * FROM siswa"
    let queries = []

    if (nis) {
        queries.push(`nis = '${nis}'`)
    }

    if (name) {
        queries.push(`name ILIKE '%${name}%'`)
    }

    if (address) {
        queries.push(`address ILIKE '%${address}%'`)
    }

    if (queries.length > 0) {
        sql += " WHERE " + queries.join(" AND ")
    }

    console.log(sql)

    db.query(sql, (err, data) => {
        if (err) {
            console.error(err)
            return res.send("Terjadi error")
        }

        res.render('index', { data: data.rows, query: req.query })
    })
})

app.get('/add', (req, res) => {
    res.render('form', { item: {} })
})

app.post('/add', (req, res) => {
    db.query(
        "INSERT INTO siswa (nis, name, address) VALUES ($1,$2,$3)",
        [req.body.nis, req.body.name, req.body.address],
        (err) => {
            if (err) {
                console.log(err)
                return res.send("Gagal insert data")
            }
            res.redirect('/')
        }
    )
})
app.get('/edit/:nis', (req, res) => {
    db.query("SELECT * FROM siswa WHERE nis=$1 ", [req.params.nis], (err, items) => {
        if (err) {
            console.error(err);
            return res.send("Terjadi error");
        }
        res.render('form', { item: items.rows[0] })
    })
})

app.post('/edit/:nis', (req, res) => {
    db.query(
        "UPDATE siswa SET nis=$1, name=$2, address=$3 WHERE nis=$4",
        [req.body.nis, req.body.name, req.body.address, req.params.nis],
        (err) => {
            if (err) return console.log(err)
            res.redirect('/')
        }
    )
})

app.get('/delete/:nis', (req, res) => {
    db.query("DELETE FROM siswa WHERE nis=$1", [req.params.nis], (err) => {
        if (err) return console.log(err)
        res.redirect('/')

    })
})

app.listen(port, () => {
    console.log(`Web appa jalan di port ${port} `)
})
