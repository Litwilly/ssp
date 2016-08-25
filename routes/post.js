var mongoose = require('mongoose');
var Product = mongoose.model('Product');
var User = mongoose.model('User');
var Equipment = mongoose.model('Equipment');
var ServiceOrder = mongoose.model('ServiceOrder');
var ProblemType = mongoose.model('ProblemType');
var PMType = mongoose.model('PMType');
var Priority = mongoose.model('Priority');
var Status = mongoose.model('Status');
var _ = require('underscore');
var moment = require('moment');
var async = require('async');

//Login Functions

exports.update = function(req, res) {
        var myQuery = new ServiceOrder({
            _id: "333343", 
            _Equipment: req.body.Equipment.equipid,
            _CreatedBy: req.session.user._id,
            ProblemTypeDescription: req.body.ProblemType,
            PriorityDescription: req.body.Priorty,
            CustomerContactInfo: {
              Name: req.body.ContactName,
              Email: req.body.ContactEmail,
              Phone: req.body.ContactPhone,
            },
            ProblemNotes: req.body.ProblemNotes,
            OpenDate: req.body.Today
        });

        myQuery.save(function(err, myQuery) {
          if (err) return console.error(err);
          console.dir(myQuery);
        });
};
