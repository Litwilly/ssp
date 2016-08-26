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

exports.req_modal = function(req, res){
  res.render('modal-serv-req',{

  });
};

exports.svc_modal = function(req, res){
  res.render('modal-svc-order',{

  });
};

exports.getData = function(req, res){
  var myequipment = [];
  var prods = [];
  console.log("==Customer Queries==");
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
                "_id": yours._id,
                "SerialNumber": yours._Equipment.SerialNumber,
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
                      "ProductName": mine._Product.ProductName,
                      "NextPMDescription": mine.NextPMDescription,
                      "NextPMDate": mine.NextPMDate
                    });
                  });
                  callback();
                });
              }], function(err){
                if (err)return next(err);
                if (req.session.user.RoleName === "Customer")
                  res.render('customer',
                        { equipment: myequipment,
                          products:  prods,
                          firstname: req.session.user.FirstName});
                else if (req.session.user.RoleName === "Onsite Engineer")
                  res.render('engineer',
                        { equipment: myequipment,
                          products:  prods,
                          firstname: req.session.user.FirstName});
              }
            );
        };
