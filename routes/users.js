var express = require('express');
var router = express.Router();

var currUser;
router.use((req, res, next) => {
  var indexjs = require('./index');
  currUser = indexjs.currUser;
  next();
});

/* GET users listing. */
router.get('/', authenticationMiddleware(), (req, res, next) => {
  if(currUser.email === null) res.redirect('/');
  const db = require('../db');

  db.query('select student_id, CONCAT(first_name, " ", last_name) AS full_name from student where dept_id = (SELECT dept_id from student where student_id=(?)) AND semester = (SELECT semester from student where student_id = (?))', [req.user.user_id, req.user.user_id], function(err, results){
    if(err) throw err;
    res.render('users/users', {title: 'Users', currUser: currUser, users: results});
  });
});

router.get('/:user_id', authenticationMiddleware(), (req, res, next) => {
  
  if(currUser.email === null) res.redirect('/');

  const db = require('../db');

  var user_info = {};

  db.query('select CONCAT(first_name, " ", last_name) AS full_name, dept_id, semester, photo, email from student where student_id = (?)', [req.params.user_id], (err, results) => {
    if(err) throw err;
    user_info.name = results[0].full_name;
    var dept_id = results[0].dept_id;
    user_info.semester = results[0].semester;
    user_info.photo = results[0].photo;
    user_info.email = results[0].email;
    db.query('select department_name from department where department_id = (?)', [dept_id], (err, results) => {
      user_info.dept = results[0].department_name;
      db.query('select course_name, course_code from course where course_id in (select course_id from student_course where student_id = (?))', [req.params.user_id], (err, results) => {
        var courses = results;
        res.render('users/profile', {title: 'Shayan Mustafa', currUser: currUser, user_info: user_info, courses:courses});
      });
    });
  });
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
