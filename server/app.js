const express = require('express')
const exphbs = require('express-handlebars')
const path = require('path')
const bodyparser = require('body-parser')
const methodOverride = require('method-override')
const redis = require('redis')
// const liveServer = require('live-server')
const app = express()

let client = redis.createClient()

client.on('connect', function() {
  console.log(`Connected to Redis...`)
})

app.engine('handlebars', exphbs({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:false}))

app.use(methodOverride('_method'))
app.get('/', function(req, res, next) {
  res.render('searchusers')
})

app.post('/users/search', function(req, res, next) {
  let id = req.body.id
  client.hgetall(id, function(err, obj) {
    if (!obj) {
      res.render('searchusers', {
        error: `User doesn't exist`
      })
    } else {
      obj.id = id
      res.render('details', {
        user: obj
      })
    }
  })
})

// Add User Page
app.get('/user/add', function(req, res, next) {
  res.render('adduser')
})

// Process Add User Page
app.post('/user/add', function(req, res, next) {
  let id = req.body.id
  let first_name = req.body.first_name
  let last_name = req.body.last_name
  let email = req.body.email
  let phone = req.body.phone

  client.hmset(id, [
    'first_name', first_name,
    'last_name', last_name,
    'email', email,
    'phone', phone
  ], function(err, reply) {
    if(err) {
      console.log(err)
    }
    console.log(reply)
    res.redirect('/')
  })
})

// Delete User
app.delete('/user/delete/:id', function(req, res, next) {
  client.del(req.params.id)
  res.redirect('/')
})


const port = 3000
app.listen(port, function(req, res) {
  console.log(`Server is running on port: ${port}`)
})