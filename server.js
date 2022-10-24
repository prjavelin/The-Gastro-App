const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 2121
require('dotenv').config({path: './config/.env'})
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const connectDB = require('./config/db')
const todoRoutes = require('./routes/todos')

require('./config/passport')(passport)

connectDB()

let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'Gastro_app'

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })
    
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())




// SESSIONS
app.use(
    session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
      mongoUrl: process.env.DB_STRING
      
      })
      
    })
  )

// PASSPORT MIDDLEWARE
app.use(passport.initialize())
app.use(passport.session()) 

 
app.use('/auth', require('./routes/auth'))


app.get('/', (request, response)=>{
    response.render('login.ejs')
})



app.get('/events',async (request, response)=>{
    const todoItems = await db.collection('events').find().toArray()
    const itemsLeft = await db.collection('events').countDocuments({completed: false})
    response.render('events.ejs', { items: todoItems, left: itemsLeft })
    //estaba commented out
    // db.collection('events').find().toArray()
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('events.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    // .catch(error => console.error(error))
    //estaba commented out
})

app.post('/addEvent', (request, response) => {
    db.collection('events').insertOne({thing: request.body.todoItem, completed: false})
    .then(result => {
        console.log('Event Added')
        response.redirect('/')
    })
    .catch(error => console.error(error))
})

// app.put('/markComplete', (request, response) => {
//     db.collection('events').updateOne({thing: request.body.itemFromJS},{
//         $set: {
//             completed: true
//           }
//     },{
//         sort: {_id: -1},
//         upsert: false
//     })
//     .then(result => {
//         console.log('Marked Complete')
//         response.json('Marked Complete')
//     })
//     .catch(error => console.error(error))

// })

// app.put('/markUnComplete', (request, response) => {
//     db.collection('events').updateOne({thing: request.body.itemFromJS},{
//         $set: {
//             completed: false
//           }
//     },{
//         sort: {_id: -1},
//         upsert: false
//     })
//     .then(result => {
//         console.log('Marked Complete')
//         response.json('Marked Complete')
//     })
//     .catch(error => console.error(error))

// })

// app.delete('/deleteItem', (request, response) => {
//     db.collection('events').deleteOne({thing: request.body.itemFromJS})
//     .then(result => {
//         console.log('Todo Deleted')
//         response.json('Todo Deleted')
//     })
//     .catch(error => console.error(error))

// })
// app.use('/', mainRoutes)
app.use('/events', todoRoutes)



//login page
app.get('/', function(req, res) {
    res.render('pages/login');
  });

  app.get('/index', function(req, res) {
    res.render('index.ejs');
  });



// wish list page
app.get('/events', function(req, res) {
    res.render('events.ejs');
  });

  // library page
app.get('/about', function(req, res) {
    res.render('about.ejs');
  });

app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})