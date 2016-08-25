var mongoose = require('mongoose');
var User = mongoose.model('User');
var moment = require('moment');
var async = require('async');

//Login Functions

exports.loginForm = function(req, res) {
    res.render('login-form', {
        title: "Please Login to the J&J Service Portal",
        buttonText: "Login"
    });
};

exports.doLogin = function(req, res) {
    if (req.body.UserMail && req.body.Password) {
        var myQuery = User.findOne({
            'Email': req.body.UserMail
        });
        myQuery.where('Password').equals(req.body.Password);
        myQuery.exec(function(err, user) {
            if (!err) {
                if (!user) {
                    res.redirect('/login/error');
                } else {
                    req.session.user = {
                        "_id": user._id,
                        "RoleName": user.RoleName,
                        "FirstName": user.FirstName,
                        "LastName": user.LastName,
                        "Street": user.Street,
                        "City": user.City,
                        "Province": user.Province,
                        "PostalCode": user.PostalCode,
                        "Email": user.Email,
                        "Phone": user.Phone,
                        "CustomerName": user.CustomerName,
                        "CustomerType": user.CustomerType,
                        "ContractType": user.ContractType,
                        "CountryName": user.CountryName,
                        "RegionName": user.RegionName,
                        "Position": user.Position,
                        "Today": new Date("February 24, 2014 03:15:00")
                    }
                    req.session.loggedIn = true;
                    console.log('Logged in User: ' + user);
                    console.log('My Session worked because My name is: ' + req.session.user.FirstName);
                    if (user.RoleName === "Customer") {
                        res.redirect('/customer');
                    } else if (user.RoleName === "Onsite Engineer") {
                        res.redirect('/engineer');
                    } else {
                        res.redirect('/login/error');
                    }
                }
            } else {
                res.redirect('/login/error');
            }
        });
    } else {
        res.redirect('/login/error');
    }
};

exports.loginError = function(req, res) {
   res.render('login-form-error', {
        title: "Please Login to the J&J Service Portal",
        buttonText: "Login"
    });
};

exports.doLoginError = function(req, res) {
   res.render('login-form', {
        title: "Please Login to the J&J Service Portal",
        buttonText: "Login"
    });
};

exports.doLogout = function(req, res) {
   req.session.destroy();
   res.redirect('/login');
};
