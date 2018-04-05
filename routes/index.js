var express = require('express');
var multer = require('multer');
var bcrypt = require('bcrypt');
const expressValidator = require('express-validator');
var passport = require('passport');
var path = require('path');
var fs = require('fs');
var router = express.Router();

// set storage engine (manages uploading of images)
const storage = multer.diskStorage({
  destination: './public/displaypics',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));

  }
});

// global object containing current user's info
var currUser = {
  email: null,
  fname: null,
  lname: null,
  image: null,
  dept: null,
  type: null
}

// quick fix so that we can use delete method through <a> tag
router.use(function (req, res, next) {
  // this middleware will call for each requested
  // and we checked for the requested query properties
  // if _method was existed
  // then we know, clients need to call DELETE request instead
  if (req.query._method == 'DELETE') {
    // change the original METHOD
    // into DELETE method
    req.method = 'DELETE';
    // and set requested url to /user/12
    req.url = req.path;
  }
  next();
});

// custom middleware that collects user info and saves to global object currUser
router.use(function (req, res, next) {
  if (req.isAuthenticated()) { // only collect user info if logged in
    const db = require('../db.js'); // connect to db
    
    currUser.type = req.user.user_type; // save user type in global obj (student/faculty)

    db.query('SELECT first_name, last_name, photo FROM ' + currUser.type + ' WHERE ' + currUser.type + '_id = (?)', [req.user.user_id], (err, results, fields) => {
      if (err) throw err;
      // save user info into global obj
      currUser.image = results[0].photo;
      currUser.fname = results[0].first_name;
      currUser.lname = results[0].last_name;
    });
    // save dept of user in global obj
    db.query('SELECT department_name FROM department WHERE department_id = (SELECT dept_id FROM ' + currUser.type + ' WHERE ' + currUser.type + '_id = (?))', [req.user.user_id], (err, results, fields) => {
      currUser.dept = results[0].department_name;
    });
  }
  next(); // go to the next middleware/function
});

// part of image uploading middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }
}).single('pic');

// route to homepage
router.get('/', authenticationMiddleware(), function (req, res) {

  const db = require('../db.js');

  if (req.user.user_type == 'student') {
    db.query('SELECT * FROM course INNER JOIN student_course WHERE student_id = (?) AND student_course.course_id = course.course_id', [req.user.user_id], (err, results, fields) => {

      res.render('home', { title: 'Home', currUser: currUser, courses: results });

    });
  } else if (req.user.user_type == 'faculty') {
    db.query('SELECT * FROM course INNER JOIN faculty_course WHERE faculty_id = (?) AND faculty_course.course_id = course.course_id', [req.user.user_id], (err, results, fields) => {
      res.render('home', { title: 'Home', currUser: currUser, courses: results });

    });
  }
});




router.get('/login', function (req, res, next) {
  if (req.query.error == 1) { // if username/pw not found in database send login page with error
    res.render('login', { title: 'Login', error: 'Unable to login' });
  } else {
    if (req.isAuthenticated()) { // if already logged in then redirect to homepage
      res.redirect('/');
    } else { // if not logged in then render login page
      res.render('login', { title: 'Login', error: null });
    }
  }
});

// login route using post method
router.post('/login', passport.authenticate('local', { // passportjs authentication
  successRedirect: '/', // if successful, then go to homepage 
  failureRedirect: '/login?error=1' // if unsuccessful then go to login page with error=1 query
}));

router.get('/logout', function (req, res, next) {
  req.logout(); // logout from browser
  req.session.destroy(); // remove session record from database
  res.redirect('/login');
});

router.get('/signup', function (req, res, next) {
  if (req.isAuthenticated()) { 
    res.redirect('/'); // if logged in go to homepage
  } else {
    res.render('signup', { title: 'Signup', errors: null }); // else go to signup page
  }
});

const saltRounds = 10; // no. of iterations of hashing in bcrypt hashing algorithm

router.post('/signup', function (req, res) {

  upload(req, res, (err) => { // upload function from multer called, upload img before anything
    
    var pic = '';
    if (req.file == undefined)
      pic = 'default.jpg'; // if no pic then use default img
    else
      pic = req.file.filename; // else use selected pic

    console.log(req.file);

    // constraints to check signup form
    req.checkBody('fname', 'First name cannot be empty').notEmpty();
    req.checkBody('lname', 'Last name cannot be empty').notEmpty();
    req.checkBody('email', 'The email you entered is invalid. Please try again.').isEmail();
    req.checkBody('password', 'Password must be between 5-100 characters long.').len(5, 100);
    req.checkBody('password2', 'Passwords do not match, please try again.').equals(req.body.password);


    const errors = req.validationErrors(); // check for errors in validation

    // if there are errors
    if (errors) {
      // console.log(`errors: ${JSON.stringify(errors)}`);
      if (req.file != undefined) { // if user uploaded image, delete that image
        fs.unlink(path.join('public', 'displaypics', req.file.filename), (err) => {
          if (err) throw err;
        });
      }
      res.render('signup', { title: 'Signup', errors: errors }); // go back to signup form with errors
    } else {
      // collect data from form
      var fname = req.body.fname;
      var lname = req.body.lname;
      var password = req.body.password;
      var email = req.body.email;
      var dept = req.body.dept;
      var semester = req.body.semester;
      var usertype = req.body.usertype.toLowerCase();
      var sqlArr = [fname, lname, email, dept, pic];



      const db = require('../db.js'); // connect to db

      // insert user data into database
      
      if (usertype === 'student') {
        sqlArr.push(semester);
        var query = 'INSERT INTO student(first_name, last_Name, email, dept_id, photo, semester) VALUES (?, ?, ?, ?, ?, ?)';
      } else if (usertype === 'faculty') {
        var query = 'INSERT INTO faculty(first_name, last_Name, email, dept_id, photo) VALUES (?, ?, ?, ?, ?)';
      }

      db.query(query, sqlArr, function (error, results, fields) {
        if (error) {
          //console.log(error);
          if (error.errno == 1062) { // if sql returns already exist error
            var err = [{
              msg: "User already exists."
            }];
            if (req.file != undefined) {
              fs.unlink(path.join('public', 'displaypics', req.file.filename), (err) => { // remove uploaded pic
                if (err) throw err;
              });
            }
            res.render('signup', { title: 'Signup', errors: err }); // go back to signup page with msg
          }
        } else {
          // hash the password using bcrypt algorithm
          bcrypt.hash(password, saltRounds, function (err, hash) {
            // set value of password in user's record to hashed password
            db.query('UPDATE ' + usertype + ' SET password = (?) WHERE email = (?)', [hash, email], function (error, results, fields) {
              if (error) throw error;

              // get userid of last inserted user and redirect to homepage
              db.query('SELECT LAST_INSERT_ID() as user_id', function (error, results, fields) {
                if (error) throw error;
                const user_id = results[0];
                res.redirect('/');
              });

            });
          });
        }
      });
    }
  });


});

router.get('/add-course', authenticationMiddleware(), function(req, res){

  const db = require('../db');

  var courses = {};
  db.query('SELECT * FROM course WHERE dept_id = 1', (err, results) => {
    if(err) throw err;
    courses.CS = results;
    db.query('SELECT * FROM course WHERE dept_id = 2', (err, results) => {
      if(err) throw err;
      courses.ME = results;
      db.query('SELECT * FROM course WHERE dept_id = 3', (err, results) => {
        if(err) throw err;
        courses.EE = results;
        db.query('SELECT * FROM course WHERE dept_id = 4', (err, results) => {
          if(err) throw err;
          courses.MS = results;
          res.render('add-course', { title: 'Add Course', currUser: currUser, allcourses: courses});
        });
      });
    });
  });
});

router.post('/add-course', authenticationMiddleware(), function(req, res){
  var cname = req.body.cname;
  var ccode = req.body.ccode;
  var chours = req.body.chours;
  var semester = req.body.semester;
  var dept = req.body.dept;

  const db = require('../db');

  db.query('INSERT INTO course(course_name, course_code, course_hours, semester, dept_id) VALUES((?), (?), (?), (?), (?))', [cname, ccode, chours, semester, dept], function(err, results){
    if(err) throw err;
    res.redirect('/add-course');
  });
});

router.get('/manage-course', authenticationMiddleware(), function (req, res) {
    const db = require('../db');

      // get enrolled courses of current student
    db.query('SELECT * FROM course INNER JOIN  ' + currUser.type + '_course WHERE  ' + currUser.type + '_id = (?) AND  ' + currUser.type + '_course.course_id = course.course_id', [req.user.user_id], function (err, results) {
      if (err) throw err;
      var courses = results;
      
    // get all courses student is eligible for
    var query = 'SELECT course_id, course_code, course_name from course inner join student on course.semester = student.semester AND course.dept_id = student.dept_id WHERE student.student_id = (?)';
    if(currUser.type == 'faculty')
      query = 'SELECT course_id, course_code, course_name from course inner join faculty on course.dept_id = faculty.dept_id WHERE faculty.faculty_id = (?)';
      db.query(query, [req.user.user_id], function (err, results) {
        if (err) throw err;
        res.render('manage-course', { title: 'Courses', courses: courses, allcourses: results, currUser: currUser });
      });
    });
});

router.get('/delete-course', authenticationMiddleware(), function (req, res) {
  const db = require('../db');

  // delete course from student_course to unenroll student
  db.query('DELETE FROM ' + currUser.type + '_course WHERE course_id = (?) AND ' + currUser.type + '_id = (?)', [req.query.courseid, req.user.user_id], function (err, results) {
    res.redirect('/manage-course');
  });
});

router.post('/enroll-course', authenticationMiddleware(), function (req, res) {
  
  // enroll student in course by adding course id to student_course table
  const db = require('../db');

  db.query('INSERT INTO  ' + currUser.type + '_course ( ' + currUser.type + '_id, course_id) VALUES((?), (?))', [req.user.user_id, req.body.id], function (err, results) {
    if (err) throw err;
    res.send(req.body);
  });
});

//inside course view
router.get('/:ccode', authenticationMiddleware(), function(req, res){

  const db = require('../db');
  var courseCode = req.params.ccode;
  db.query('SELECT course_name FROM course WHERE course_id IN (SELECT course_id from ' + currUser.type + '_course WHERE ' + currUser.type + '_id=(?) AND course_code=(?))', [req.user.user_id, courseCode], function(err, results) {
    
    if(results.length >= 1){
      var cname = results[0].course_name;
      //console.log(results);
      
      res.render('course_view', { title: cname, cname: cname, currUser: currUser });
    }else{
      res.render('404', { title: '404', currUser: currUser });
    }
  });
});

// part of passportjs middleware
passport.serializeUser(function (user_id, done) {
  done(null, user_id);
});

passport.deserializeUser(function (user_id, done) {
  done(null, user_id);
});

// middleware used to handle authenticated/unauthenticated users
function authenticationMiddleware() {
  return (req, res, next) => {
    // console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

    if (req.isAuthenticated()) return next();
    res.redirect('/login');
  }
}



module.exports = router;
