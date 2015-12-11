'use strict';

var fs = require('fs');
var http = require('http');
var url = require('url');
var querystring = require('querystring');
var db = require('monk')('localhost/students');
var student = db.get('student');

function handleRequest(req, res) {

  var urlObj = url.parse(req.url);
  var pathname = urlObj.pathname;
  var query = urlObj.query;
  var queryObj = querystring.parse(query);
  var fName = queryObj.fname;
  var lName = queryObj.lname;
  var fpl = queryObj.fPL;
  console.log(queryObj);
  console.log(fName);
  console.log(lName);
  console.log(fpl);


  if (pathname === "/students" || pathname == "/") {

    student.find({}, function(err, data) {
      res.statusCode = 200;
      /// Write out Students currently in the database
      res.write("<h1>It's working</h1>");
      res.write("<p><strong>" + JSON.stringify(data) + "</p></strong>");
      res.end();

    });
  } else if (pathname == "/students/create") {

    student.insert(queryObj, function(err, doc) {
      if (err) {
        throw err;
      }
      res.statusCode = 200;
      // create new student and return a response to make sure that it was inserted into the db without errors
      console.log(doc);
      res.write("<h1>" + req.url + "</h1>");
      res.write("<p><strong>" + JSON.stringify(doc) + " Has been inserted </p></strong>");
      res.end();
    });

  } else if (pathname == "/students/delete") {

    //find specific student and then remove them from the database
    student.findOne(queryObj, function(err, doc) {
      console.log(doc);
      if (err || doc === null) {
        res.write("<h1>" + req.url + "</h1>");
        res.write("<p><strong>" + JSON.stringify(doc) + "Doesn't Exist! </p></strong>");
        res.end();
      } else {
        student.remove(queryObj, function(err, doc) {
          res.statusCode = 200;
          console.log(doc);
          res.write("<h1>" + req.url + "</h1>");
          res.write("<p><strong>" + JSON.stringify(doc) + "Has been removed </p></strong>");
          res.end();
        });
      }
    });

  } else if (pathname == "/students/update") {

    student.findOne({ fname : queryObj.fName, lname : queryObj.lName }, function(err, doc) {
      if (err || doc === null) {
        res.write("<h1>" + req.url + "</h1>");
        res.write("<p><strong>" + JSON.stringify(doc) + "Doesn't Exist! </p></strong>");
        res.end();
      } else {
        student.update( { fname : queryObj.fName, lname : queryObj.lName }, {fPL : queryObj.fpl}, function(){
        res.statusCode = 200;
        // create new student and return a response to make sure that it was inserted into the db without errors
        console.log(doc);
        res.write("<h1>" + req.url + "</h1>");
        res.write("<p><strong>" + JSON.stringify(doc) + "</p></strong>");
        res.end();
        });
      }
    });

  } else {

  res.statusCode = 404;
  res.write('<h1>This is not a page</h1>');
  urlObj = url.parse(req.url);
  //  console.log(urlObj);
  res.write("<p><strong>" + JSON.stringify(urlObj) + "</p></strong>");
  res.end();
}
}
// create a server using http
var server = http.createServer(handleRequest);
// start the server on port 8000
server.listen(8000, function() {
  console.log('starting server on 8000');
});
