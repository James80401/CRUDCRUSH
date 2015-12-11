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
  var firstName = queryObj.fname;
  var lastName = queryObj.lname;
  var language = queryObj.fpl;

  console.log(queryObj);



  if (pathname === "/students" || pathname === "/") {

    student.find({}, function(err, data) {
      res.statusCode = 200;
      /// Write out Students currently in the database
      res.write("<h1>It's working</h1>");
      res.write("<p><strong>" + JSON.stringify(data) + "</p></strong>");
      res.end();
    });

  } else if (pathname === "/students/create") {

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

  } else if (pathname === "/students/delete") {

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

  } else if (pathname === "/students/update") {

    var nameObj = {};
    nameObj.fname = firstName;
    nameObj.lname = lastName;
    var langObj = {};
    langObj.fpl = language;

    student.findOne( nameObj , function(err, doc) {
      if (err || doc === null) {
        res.write("<h1>" + req.url + "</h1>");
        res.write("<p><strong>" + JSON.stringify(doc) + "Doesn't Exist! </p></strong>");
        res.end();
      } else {
        res.write("<h1>" + JSON.stringify(doc) + "</h1>");
        student.update(doc, {
          $set : langObj
        }, function(err , doc2) {
          res.statusCode = 200;
          console.log(doc2);
          res.write("<h1>" + req.url + "</h1>");
          res.write("<p><strong>" + JSON.stringify(doc2) + "</p></strong>");
          res.end();
        });
      }
    });

  } else {
    // route for returning a page when the url doesn't have a route
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
