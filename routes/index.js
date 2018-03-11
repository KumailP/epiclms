var express = require('express');
var mysql = require("mysql");
var router = express.Router();

var connection = mysql.createConnection({
  host  : 'localhost',
  user  : 'root',
  password  : 'root',
  database: 'epiclms'
});

connection.connect(function(err){
  if(err){
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected to MySQL');
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'epicLMS - Login' });
});

router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'epicLMS - Signup' });
});

router.post('/signup', function(req, res){
  console.log(req.body);
  
  var dept = 1;
  if(req.body.dept === 'Computer Science'){
    dept = 1;
  }else if(req.body.dept === 'Mechanical Engineering'){
    dept = 2;
  }else if(req.body.dept === 'Electrical Engineering'){
    dept = 3;
  }else if(req.body.dept === 'BBA'){
    dept = 4;
  }
  var usertype = 1;
  if(req.body.usertype === 'teacher') usertype = 2;

  var semester;
  if(usertype === 2) semester = null;
  else semester = req.body.semester;

  var pic = '';
  if(req.body.pic === '') pic = 'default.jpg';
  else pic = req.body.pic;

  var sqlArr = [req.body.fname, req.body.lname, req.body.email, req.body.password, dept, pic, usertype, semester];

  connection.query('INSERT INTO students(first_name, last_Name, email, password, dept, pic, user_type, semester) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', sqlArr, function (error, results, fields) {
    if (error) throw error;
    res.send("Inserted " + req.body.fname + " " + req.body.lname);
  });
  
  
});

module.exports = router;
