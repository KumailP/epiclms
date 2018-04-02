var express = require('express');
var multer = require('multer');
var bcrypt = require('bcrypt');
const expressValidator = require('express-validator');
var passport = require('passport');
var path = require('path');
var fs = require('fs');
var router = express.Router();

// set storage engine
const storage = multer.diskStorage({
  destination: './public/displaypics',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));

  }
});

var currUserEmail = null;
var currUserName = null;
var currUserImage = null;
var currUserDept = null;

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

router.use(function (req, res, next) {
  if (req.isAuthenticated()) {
    const db = require('../db.js');

    // console.log(req.user);

    if (req.user.user_type == 'student') {
      db.query('SELECT first_name, photo FROM student WHERE student_id = (?)', [req.user.user_id], (err, results, fields) => {
        if (err) throw err;
        currUserImage = results[0].photo;
        currUserName = results[0].first_name;

        db.query('SELECT department_name FROM department WHERE department_id = (SELECT dept_id FROM student WHERE student_id = (?))', [req.user.user_id], (err, results, fields) => {
          currUserDept = results[0].department_name;

          //console.log(results);
          next();
        });


      });
    } else if (req.user.user_type == 'faculty') {
      db.query('SELECT first_name, photo FROM faculty WHERE faculty_id = (?)', [req.user.user_id], (err, results, fields) => {
        if (err) throw err;

        currUserImage = results[0].photo;
        currUserName = results[0].first_name;
        next();

      });
    }
  } else {
    next();
  }
});


const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }
}).single('pic');

router.get('/', authenticationMiddleware(), function (req, res) {
  // console.log(req.user);
  // console.log(req.isAuthenticated());

  const db = require('../db.js');

  // console.log(req.user);

  if (req.user.user_type == 'student') {
    db.query('SELECT * FROM course INNER JOIN student_course WHERE student_id = (?) AND student_course.course_id = course.course_id', [req.user.user_id], (err, results, fields) => {

      var courses = results;
      //console.log(courses);
      res.render('home', { title: 'Home', pic: currUserImage, name: currUserName, usertype: req.user.user_type, courses: courses, dept: currUserDept });

    });


  } else if (req.user.user_type == 'faculty') {
    db.query('select course_name, course_code from course inner join faculty on course.faculty_id = (?)', [req.user.user_id], (err, results, fields) => {
      res.render('home', { title: 'Home', pic: currUserImage, name: currUserName, usertype: 'faculty', courses: results });

    });


  }


});

router.get('/login', function (req, res, next) {
  if (req.query.error == 1) {
    res.render('login', { title: 'Login', error: 'Unable to login' });
  } else {
    if (req.isAuthenticated()) {
      res.redirect('/');
    } else {
      res.render('login', { title: 'Login', error: null });
    }
  }
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login?error=1'
}));

router.get('/logout', function (req, res, next) {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

router.get('/signup', function (req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/');
  } else {
    res.render('signup', { title: 'Signup', errors: null });
  }
});

const saltRounds = 10;

router.post('/signup', function (req, res) {

  upload(req, res, (err) => {
    var pic = '';
    // console.log('img uploaded.');
    // console.log(req.file.filename);
    if (req.file == undefined)
      pic = 'default.jpg';
    else
      pic = req.file.filename;


    req.checkBody('fname', 'First name cannot be empty').notEmpty();
    req.checkBody('lname', 'Last name cannot be empty').notEmpty();
    req.checkBody('email', 'The email you entered is invalid. Please try again.').isEmail();
    req.checkBody('password', 'Password must be between 5-100 characters long.').len(5, 100);
    req.checkBody('password2', 'Passwords do not match, please try again.').equals(req.body.password);


    const errors = req.validationErrors();

    if (errors) {
      // console.log(`errors: ${JSON.stringify(errors)}`);
      if (req.file != undefined) {
        fs.unlink(path.join('public', 'displaypics', req.file.filename), (err) => {
          if (err) throw err;
        });
      }
      res.render('signup', { title: 'Signup', errors: errors });
    } else {
      // console.log(req.body);
      var fname = req.body.fname;
      var lname = req.body.lname;
      var password = req.body.password;
      var email = req.body.email;
      var dept = req.body.dept;
      var semester = req.body.semester;


      const db = require('../db.js');


      var usertype = req.body.usertype.toLowerCase();

      var sqlArr = [fname, lname, email, dept, pic];
      if (usertype === 'student') {
        sqlArr.push(semester);
        var query = 'INSERT INTO student(first_name, last_Name, email, dept_id, photo, semester) VALUES (?, ?, ?, ?, ?, ?)';
      } else if (usertype === 'faculty') {
        var query = 'INSERT INTO faculty(first_name, last_Name, email, dept_id, photo) VALUES (?, ?, ?, ?, ?)';
      }

      db.query(query, sqlArr, function (error, results, fields) {
        if (error) {
          //console.log(error);
          if (error.errno == 1062) {
            var err = [{
              msg: "User already exists."
            }];
            if (req.file != undefined) {
              fs.unlink(path.join('public', 'displaypics', req.file.filename), (err) => {
                if (err) throw err;
              });
            }
            res.render('signup', { title: 'Signup', errors: err });
          }
        } else {
          bcrypt.hash(password, saltRounds, function (err, hash) {
            db.query('UPDATE ' + usertype + ' SET password = (?) WHERE email = (?)', [hash, email], function (error, results, fields) {
              if (error) throw error;

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

router.get('/manage-course', authenticationMiddleware(), function (req, res) {
  if (currUserName === null) res.redirect('/');

  const db = require('../db');
  db.query('SELECT * FROM course INNER JOIN student_course WHERE student_id = (?) AND student_course.course_id = course.course_id', [req.user.user_id], function (err, results) {
    if (err) throw err;
    var courses = results;
    db.query('SELECT course_id, course_code, course_name from course inner join student on course.semester = student.semester AND course.dept_id = student.dept_id WHERE student.student_id = (?)', [req.user.user_id], function (err, results) {
      if (err) throw err;
      res.render('manage-course', { title: 'Courses', courses: courses, allcourses: results, pic: currUserImage, dept: currUserDept, name: currUserName, usertype: req.user.user_type });
    });
  });
});

router.get('/delete-course', authenticationMiddleware(), function (req, res) {
  const db = require('../db');

  db.query('DELETE FROM student_course WHERE course_id = (?) AND student_id = (?)', [req.query.courseid, req.user.user_id], function (err, results) {
    res.redirect('/manage-course');
  });
});

router.post('/enroll-course', authenticationMiddleware(), function (req, res) {
  var obj = {};
  //res.send(req.body);

  const db = require('../db');
  db.query('INSERT INTO student_course (student_id, course_id) VALUES((?), (?))', [req.user.user_id, req.body.id], function (err, results) {
    if (err) throw err;
    res.send(req.body);
  });
});

passport.serializeUser(function (user_id, done) {
  done(null, user_id);
});

passport.deserializeUser(function (user_id, done) {
  done(null, user_id);
});

function authenticationMiddleware() {
  return (req, res, next) => {
    // console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

    if (req.isAuthenticated()) return next();
    res.redirect('/login')
  }
}


/*var month_names = new Array("January", "February", "March", 
"April", "May", "June", "July", "August", "September", 
"October", "November", "December");
var d = new Date();
var month = d.getMonth();
var day = d.getDate();
var output = (day<10? '0' : '') + day + " " + month_names[month] + ", " + d.getFullYear();
console.log(output);*/
module.exports = router;
