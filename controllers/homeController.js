"use strict";


const courses = require("../private/courses.json");
//console.log(`courses.length = ${courses.length}`);
//console.log(JSON.stringify(courses[0],null,2));

exports.showAbout = (req, res) => {
  res.render("about");
};


exports.chat= (req, res) => {
res.render("chat");
};

/*exports.showForum = (req, res) => {
  res.render("forum");
};*/

exports.showCourses = (req, res) => {
  res.render("courses", {
    courses: [],
    term: "Fall19-Fall20",
    department:"any",
  });
};

exports.showSelectedCourses = (req, res) => {

  let subject = req.body.subject

  const selected_courses =
      courses.filter(course =>
        ( (! course['independent_study'])
        &&
        ( (!subject) || course['subject']==subject)
        &&
        (!req.body.term || course['term']==req.body.term)
      ))


    selected_courses.sort(
        (c1,c2) => {
          let a = c1.name.toLowerCase(),
              b = c2.name.toLowerCase();
              if(a<b){
                return -1;
              }
              if(a>b){
                return 1;
              }
              return 0;
        }
      )
      //console.log(selected_courses)
  res.render("courses", {
    courses: selected_courses,
    term: req.body.term
  });
};



exports.showSignUp = (req, res) => {
  res.render("addNote");
};

exports.postedSignUpForm = (req, res) => {
  let formData = req.body
  res.render("thanks",{formData:formData});
};
