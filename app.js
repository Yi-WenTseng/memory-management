"use strict";
const bodyParser = require('body-parser');
const Note=require("./models/Note");
const Comment=require("./models/Comment");
const path = require('path');
const helpers = require('helpers');
const express = require("express"),
  app = express(),
  homeController = require("./controllers/homeController"),
  errorController = require("./controllers/errorController"),
  layouts = require("express-ejs-layouts");

const mongoose = require("mongoose");
require('dotenv').config({ path: 'env.sh' });

const mongoDB_URI = process.env.MONGODB_URI
mongoose.connect(mongoDB_URI, {useNewUrlParser:true})


const db = mongoose.connection;
  db.on('error',(x)=>console.log("connection error"+x))
  db.once('open',(x)=>console.log("We connected at "+new Date()+x))

const authRouter = require('./routes/authentication');
const isLoggedIn = authRouter.isLoggedIn;
app.use(authRouter)

app.set("view engine", "ejs");
app.set("port", process.env.PORT || 3000);
app.use(
  express.urlencoded({
    extended: false
  })
);
app.use(express.json());
app.use(layouts);
app.use(express.static("public"));


app.get("/", (req, res) => {
  res.render("index");
});


app.get("/courses", homeController.showCourses);
app.post("/courses", homeController.showSelectedCourses);
app.post("/note", homeController.postedSignUpForm);
app.get("/about", homeController.showAbout);


app.get("/jennifer", (req, res) => {
  res.render("jennifer");
});

app.get("/yi-wen", (req, res) => {
  res.render("yi-wen");
});

app.get("/Keyi", (req, res) => {
  res.render("Keyi");
});

app.get("/rating/:itemId",
  isLoggedIn,
  async(req, res, next) => {
    res.locals.note = await Note.findOne({_id:req.params.itemId})
    res.render("rating");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.post("/addRating/:itemId",
  async(req,res, next)=>{
    try{
      res.locals.note = await Note.findOne({_id:req.params.itemId})
      let comment = req.body.comment
      let rate= req.body.rate
      let createdAt=new Date()
      let user = req.user.googlename
      let userId = req.user._id
      let note = res.locals.note
      let newComment=new Comment({user:user,userId:userId,note:note,createdAt:createdAt, comment:comment,
        rate:rate
      })
      await newComment.save()
      res.redirect(`/showNoteInfo/${
          req.params.itemId}/`)
    }catch(e){
      console.dir(e);
      res.send("There was an error in /addRating")
      next(e)
    }
});

//Delete route for comments
app.get('/removeComment/:noteId/:itemId',
     isLoggedIn,
     async (req, res, next) => {
         await Comment.remove({_id:req.params.itemId});
         res.redirect(`/showNoteInfo/${
             req.params.noteId}`)
   });


app.get("/addNote",
  (req,res) =>{
    res.render("addNote")
  }
)
//route to adding a note page
app.get("/note/:subject/:courseID/:section/:term/:title",
  (req, res) => {
    res.render("note", req.params)
  }
)
//route for submitting the add-note form
app.post('/addNote',
  async (req,res) => {
    try {
      let authorID = req.user._id
      let author = req.user.googlename
      let authorEmail = req.user.googleemail
      let note = req.body.note
      let subject = req.body.subject
      let createdAt = new Date()
      let courseID = req.body.courseID
      let term= req.body.term
      let title=req.body.title
      let section = req.body.section
      let newNote = new Note({authorID:authorID, author:author, note:note,title:title,
        subject:subject,  courseID:courseID, createdAt:createdAt, authorEmail:authorEmail,
        term: term, section: section})
      await newNote.save()
      res.redirect(`/showNotes/${
          req.body.subject}/${
          req.body.courseID}/${
          req.body.section}/${
          req.body.term}` )
    }
    catch(e) {
      console.dir(e)
      res.send("error in /addNote")
    }
})

app.get("/showNotes/:subject/:courseID/:section/:term",
   async (req,res,next) => {
     try {
       const query={
        subject:req.params.subject,
        courseID:req.params.courseID,
        section:req.params.section,
        term:req.params.term,
      }
      res.locals.notes =await Note.find(query)
      res.locals.notes.sort((a,b) => b.createdAt - a.createdAt)
      //console.log(res.locals.notes)
       res.render('showNotes')
     }
     catch(e){
       console.dir(e)
       console.log("Error:")
       res.send("There was an error in /showNotes!")
       next(e)
     }
   });

app.get("/showFilteredNotes",
  async(req, res,next) => {
    try {
      let authorID = req.user._id
      const query={
        authorID:authorID
      }
      res.locals.notes =
          await Note.find(query)
      res.locals.notes.sort((a,b) => b.createdAt - a.createdAt)
      res.render('showNotes')
    } catch (e) {
      console.dir(e)
      console.log("Error:")
      res.send("There was an error in /showFilteredNotes!")
      next(e)
    }
  }

);

app.post("/addToFavorite/:itemId",
  async(req,res,next)=>{
    try{
      res.locals.note = await Note.findOne({_id:req.params.itemId})
      req.user.favorites.push(res.locals.note)
      await req.user.save()
      res.redirect(`/showNoteInfo/${
          req.params.itemId}`)
    }catch(e){
      res.send("There was an error in /addToFavorite")
      next(e)
    }
  }
)



app.get("/showFavorites",
  async(req, res,next) => {
    try {
      res.locals.notes = await Note.find({_id:req.user.favorites})
      res.locals.notes.sort((a,b) => b.createdAt - a.createdAt)
      res.render('showNotes')
    } catch (e) {
      console.dir(e)
      console.log("Error:")
      res.send("There was an error in /showFavorites!")
      next(e)
    }
  }
);



app.get("/showNoteInfo/:itemId",
  async(req, res, next) => {
    try {
      res.locals.note = await Note.findOne({_id:req.params.itemId})
      const query={
        note:req.params.itemId
      }
      res.locals.comments = await Comment.find(query)
      
      res.render('showNoteInfo')
    } catch (e) {
      next(e)
    }
  }
);
//Edit function
app.get('/editNote/:itemId',
    isLoggedIn,
    async(req, res, next) => {
      try {
        res.locals.note = await Note.findOne({_id:req.params.itemId})
        res.render('editNote')
      } catch (e) {
        next(e)
      }
    }
  )

app.post('/editNote/:itemId',
  isLoggedIn,
  async(req, res, next) => {
    try {
      let doc = await Note.findOne({_id:req.params.itemId})
      doc.createdAt = new Date()
      doc.note = req.body.note
      await doc.save()
      res.redirect(`/showNotes/${doc.subject}/${doc.courseID}/${doc.section}/${doc.term}`)
    } catch (e) {
      next(e)
    }
  }
)
//Delete route
app.get('/remove/:subject/:courseID/:section/:term/:itemId',
     isLoggedIn,
     async (req, res, next) => {
         await Note.remove({_id:req.params.itemId});
         res.redirect(`/showNotes/${
             req.params.subject}/${
             req.params.courseID}/${
             req.params.section}/${
             req.params.term}`)
});

//Routes for profile stuff
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
        req.user.university=req.body.university
        req.user.imageURL = req.body.imageURL
        await req.user.save()
        res.redirect('/profile')
      }catch (error) {
        next(error)
      }
})


app.onclick = function(event) {
   if (!event.target.matches('.dropbtn')) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
     }
   }
  }



app.use(errorController.pageNotFoundError);
app.use(errorController.internalServerError);

module.exports=app;
