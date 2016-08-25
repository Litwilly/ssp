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


exports.create = function(req, res){
  var myequipment = [];
  var prods = [];
  console.log("==========================workshop6===============================");
  async.parallel([
    function(callback){
      ServiceOrder.find({CloseDate: {$exists: false} })
        // .where('_CreatedBy').equals(48243)
        // .populate('_CreatedBy')
        .populate('_Product')
        .populate('_Equipment')
          //.select('_id SerialNumber OpenDate ProblemTypeDescription ProductName CurrentStatus')
          .exec(function (err, serviceorders){
            serviceorders.forEach(function(yours){
              myequipment.push({
                "ProblemTypeDescription": yours.ProblemTypeDescription,
                "PriorityDescription": yours.PriorityDescription
              });
            });
            callback();
          });
        },
        function(callback){
          Equipment.find({ _User: req.session.user._id })
              // .populate('_CreatedBy')
              .populate('_Product')
              .populate('_Equipment')
                        //.sort('NextPMDate')
              //.select('_id SerialNumber ProductName NextPMDescription NextPMDate')
              .exec(function (err, equipment){
                  equipment.forEach(function(mine){
                    prods.push({
                      "_id": mine._id,
                      "ProductID": mine._Product._id,
                      "SerialNumber": mine.SerialNumber,
                      "ProductName": mine._Product.ProductName,
                      "Room": mine.Room
                    });
                  });
                  callback();
                });
              }], function(err){
                if (err)return next(err);
                console.log(prods);
                res.render('service-create',
                  { equipments: myequipment,
                    products:  prods,
                    firstname: req.session.user.FirstName});
              }
            );
        };
