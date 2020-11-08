const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const layouts = require("express-ejs-layouts");
const auth = require('./config/auth.js');
const Medicine = require("./models/Medicine");
const Task = require("./models/Task");


const mongoose = require( 'mongoose' );
//mongoose.connect( `mongodb+srv://${auth.atlasAuth.username}:${auth.atlasAuth.password}@cluster0-yjamu.mongodb.net/authdemo?retryWrites=true&w=majority`);
mongoose.connect( 'mongodb://localhost/memory-management');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we are connected!!!")
});

const authRouter = require('./routes/authentication');
const isLoggedIn = authRouter.isLoggedIn
const loggingRouter = require('./routes/logging');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const dbRouter = require('./routes/db');
//const toDoRouter = require('./routes/todo');



const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(layouts);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(authRouter)
app.use(loggingRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/db',dbRouter);
app.use('/dbdemo',
    (req,res) => res.render('dbdemo'))

app.use('/db',dbRouter);
//app.use('/todo',toDoRouter);
//
// app.get('/profiles',
//     isLoggedIn,
//     async (req,res,next) => {
//       try {
//         res.locals.profiles = await User.find({})
//         res.render('profiles')
//       }
//       catch(e){
//         next(e)
//       }
//     }
//   )
//
// app.use('/publicprofile/:userId',
//     async (req,res,next) => {
//       try {
//         let userId = req.params.userId
//         res.locals.profile = await User.findOne({_id:userId})
//         res.render('publicprofile')
//       }
//       catch(e){
//         console.log("Error in /profile/userId:")
//         next(e)
//       }
//     }
// )


//route for showing medication page
app.get('/medication',
  isLoggedIn,
  async(req, res,next) => {
    try {
      let authorID = req.user._id
      const query={
         authorID:authorID
      }
      console.log("Finding medications... ");
      res.locals.medications = await Medicine.find(query)
      //res.locals.notes.sort((a,b) => b.time - a.time)
      res.render('medication')
    } catch (e) {
      console.dir(e)
      console.log("Error:")
      res.send("There was an error in /medication!")
      next(e)
    }
  }
)

app.get("/addMedication",
  (req,res) =>{
    res.render("addMedication")
  }
)

app.post('/addMedication',
  async (req,res) => {
    try {
      let authorID = req.user._id
      let author = req.user.googlename
      let name = req.body.name
      let dose = req.body.dose
      let time = req.body.time
      let note = req.body.note
      let newMedicine = new Medicine({authorID:authorID, author:author,
      name:name, dose:dose, time:time, note:note})
      await newMedicine.save()
      res.redirect(`/medication/` )
    }
    catch(e) {
      console.dir(e)
      res.send("error in /addMedication")
    }
})

app.get('/remove/:itemId',
  isLoggedIn,
  async(req, res,next) =>{
      await Medicine.remove({_id:req.params.itemId});
      res.redirect('/medication/')
  }
)

//Edit function
app.get('/editMed/:itemId',
    isLoggedIn,
    async(req, res, next) => {
      try {
        res.locals.med = await Medicine.findOne({_id:req.params.itemId})
        res.render('editMed')
      } catch (e) {
        next(e)
      }
    }
  )

app.post('/editMed/:itemId',
  isLoggedIn,
  async(req, res, next) => {
    try {
      let doc = await Medicine.findOne({_id:req.params.itemId})
      doc.name = req.body.name
      doc.time = req.body.time
      doc.dose = req.body.dose
      doc.note = req.body.note
      await doc.save()
      res.redirect(`/medication/`)
    } catch (e) {
      next(e)
    }
  }
)

app.get('/tasks',
  isLoggedIn,
  async(req, res,next) => {
    try {
      let userId = req.user._id
      const query={
         userId:userId
      }
      console.log("Finding tasks... ");
      res.locals.tasks = await Task.find(query)
      //res.locals.notes.sort((a,b) => b.time - a.time)
      res.render('tasks')
    } catch (e) {
      console.dir(e)
      console.log("Error:")
      res.send("There was an error in /tasks!")
      next(e)
    }
  }
)

app.post('/tasks/addTask',
  isLoggedIn,
  async(req, res, next) => {
    try{
      let newTask = new Task({
        user:req.user.googlename,
        userId:req.user._id,
        time:req.body.time,
        activity:req.body.activity
      })
      console.log("saving a new task... ");
      await newTask.save();
      res.redirect('/tasks/')
    }catch(e){
      console.log("Error:")
      res.send("There was an error in posting tasks!")
      next(e)
    }
  }
)

app.get('/tasks/remove/:itemId',
  isLoggedIn,
  async(req, res,next) =>{
      await Task.remove({_id:req.params.itemId});
      res.redirect('/tasks/')
  }
)

//route for about page
app.get('/about',
  (req, res) => {
    try{
      console.log("about to show about!!")
      res.render("about")
    }catch(e){
      console.log("There is an error in /about!")
      next(e)
    }
  }
)
app.get("/jennifer", (req, res) => {
  res.render("jennifer");
});

app.get("/yi-wen", (req, res) => {
  res.render("yi-wen");
});
//route for alzheimer's page
app.get('/alzheimers',
  (req, res) => {
    try{
      console.log("about to show alzheimers")
      res.render("alzheimers")
    }catch(e){
      console.log("Error in /alzheimers")
      next(e)
    }
  });

app.get('/profile',
    isLoggedIn,
    (req,res) => {
      res.render('profile')
    })

app.get('/editProfile',
    isLoggedIn,
    (req,res) => res.render('editProfile'))

app.post('/editProfile',
    isLoggedIn,
    async (req,res,next) => {
      try {

        req.user.username = req.body.username
        req.user.age = req.body.age
        req.user.imageURL = req.body.imageURL
        req.user.phone = req.body.phone
        req.user.address = req.body.address
        await req.user.save()
        res.redirect('/profile')
      } catch (error) {
        next(error)
      }

    })


app.use('/data',(req,res) => {
  res.json([{a:1,b:2},{a:5,b:3}]);
})

const User = require('./models/User');

app.get("/test",async (req,res,next) => {
  try{
    const u = await User.find({})
    console.log("found u "+u)
  }catch(e){
    next(e)
  }

})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
