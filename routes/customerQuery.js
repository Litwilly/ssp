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
var async = require('async');



exports.getData = function(req, res){
  var myequipment = [];
  var prods = [];
  var completes = [];
  var overdues = [];
  var checkin = [];
  var td = new Date();
  var ourtoday = td.toUTCString();
  console.log("==Customer Queries==");
  async.parallel([
    function(callback){
      ServiceOrder.find()
        .where('_CreatedBy').equals(req.session.user._id)
        // .where('CurrentStatus').equals('Completed')
        // .populate('_CreatedBy')
        .populate('_Product')
        .populate('_Equipment')
          //.select('_id SerialNumber OpenDate ProblemTypeDescription ProductName CurrentStatus')
          .exec(function (err, serviceorders){
            serviceorders.forEach(function(yours){
              myequipment.push({
                "_id": yours._id,
                "_User": yours._User,
                "StatusDescription": yours._StatusDescription,
                "ServiceDetails": yours._ServiceDetails,
                "SerialNumber": yours._Equipment.SerialNumber,
                "Room": yours._Equipment.Room,
                "InstallDate": yours._Equipment.InstallDate,
                "NextPMDate": yours._Equipment.NextPMDate,
                "NextPMDescription": yours._Equipment.NextPMDescription,
                "OpenDate": yours.OpenDate,
                "ProblemTypeDescription": yours.ProblemTypeDescription,
                "ProductName": yours._Product.ProductName,
                "CurrentStatus": yours.CurrentStatus
              });
            });
            callback();
          });
        },
    function(callback){
      ServiceOrder.find()
        .where('_CreatedBy').equals(req.session.user._id)
        .where('CurrentStatus').equals('Completed')
        .where('CloseDate').gt('2016-08-28T09:47:19.000Z')
        .populate('_Product')
        .populate('_Equipment')
          //.select('_id SerialNumber OpenDate ProblemTypeDescription ProductName CurrentStatus')
          .exec(function (err, serviceorders){
            serviceorders.forEach(function(yours){
              completes.push({
                "_id": yours._id,
                "_User": yours._User,
                "StatusDescription": yours._StatusDescription,
                "ServiceDetails": yours._ServiceDetails,
                "SerialNumber": yours._Equipment.SerialNumber,
                "Room": yours._Equipment.Room,
                "InstallDate": yours._Equipment.InstallDate,
                "NextPMDate": yours._Equipment.NextPMDate,
                "NextPMDescription": yours._Equipment.NextPMDescription,
                "OpenDate": yours.OpenDate,
                "ProblemTypeDescription": yours.ProblemTypeDescription,
                "ProductName": yours._Product.ProductName,
                "CurrentStatus": yours.CurrentStatus
              });
            });
            callback();
          });
        },
        function(callback){
          Equipment.find({ _User: req.session.user._id })
              .where('NextPMDate').lt(ourtoday)
              .populate('_CreatedBy')
              .populate('_Product')
              .populate('_Equipment')
                        //.sort('NextPMDate')
              //.select('_id SerialNumber ProductName NextPMDescription NextPMDate')
              .exec(function (err, equipment){
                  equipment.forEach(function(mine){
                    overdues.push({
                      "_id": mine._id,
                      "SerialNumber": mine.SerialNumber,
                      "StatusDescription": mine.StatusDescription,
                      "ProductName": mine._Product.ProductName,
                      "NextPMDescription": mine.NextPMDescription,
                      "NextPMDate": mine.NextPMDate
                    });
                });
                callback();
              });
            },
        function(callback){
          ServiceOrder.find()
            .populate('_CreatedBy')
            .where('_CreatedBy').equals(req.session.user._id)
            .where('CurrentStatus').ne('Completed')
            .where('Checkin').gt('2016-08-28T09:47:19.000Z')
            .populate('_Product')
            .populate('_Equipment')
            .exec(function (err, serviceorders){
              serviceorders.forEach(function(yours){
                checkin.push({
                  "_id": yours._id,
                  "_User": yours._User,
                  "FirstName": yours._User.FirstName,
                  "StatusDescription": yours._StatusDescription,
                  "ServiceDetails": yours._ServiceDetails,
                  "SerialNumber": yours._Equipment.SerialNumber,
                  "CreatedBy": yours.CreatedBy,
                  "Room": yours._Equipment.Room,
                  "InstallDate": yours._Equipment.InstallDate,
                  "NextPMDate": yours._Equipment.NextPMDate,
                  "NextPMDescription": yours._Equipment.NextPMDescription,
                  "OpenDate": yours.OpenDate,
                  "ProblemTypeDescription": yours.ProblemTypeDescription,
                  "ProductName": yours._Product.ProductName,
                  "CurrentStatus": yours.CurrentStatus,
                  "Checkin": yours._ServiceDetails.Checkin,
                  "Checkout": yours._ServiceDetails.Checkout,
                });
              });
              callback();
            });
        },
        function(callback){
          Equipment.find({ _User: req.session.user._id })
              .populate('_CreatedBy')
              .populate('_Product')
              .populate('_Equipment')
                        //.sort('NextPMDate')
              //.select('_id SerialNumber ProductName NextPMDescription NextPMDate')
              .exec(function (err, equipment){
                  equipment.forEach(function(mine){
                    prods.push({
                      "_id": mine._id,
                      "SerialNumber": mine.SerialNumber,
                      "StatusDescription": mine.StatusDescription,
                      "ProductName": mine._Product.ProductName,
                      "NextPMDescription": mine.NextPMDescription,
                      "NextPMDate": mine.NextPMDate
                    });
                  });
                  callback();
                });
              }], function(err){
                if (err)return next(err);
                console.log("our today");
                console.log(ourtoday);
                console.log("completed work");
                console.log(completes);
                console.log("prods");
                console.log(prods);
                console.log("myequipment");
                console.log(myequipment);
                console.log("overdues");
                console.log(overdues);
                  res.render('customer',
                        { equipment: myequipment,
                          products:  prods,
                          completed: completes,
                          overdue: overdues,
                          firstname: req.session.user.FirstName});
              });
        };
