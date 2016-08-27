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
  var workoffers = [];
  var workassigned = [];
  console.log("==Engineer Queries==");
  async.parallel([
    function(callback){
      ServiceOrder.find({CloseDate: {$exists: false} })
        .where('CurrentStatus').equals('Assigned, Waiting to be Accepted')
        // .populate('_CreatedBy')
        .populate('_Product')
        .populate('Priority')
        .populate('_Equipment')
        .populate('User')
          //.select('_id SerialNumber OpenDate ProblemTypeDescription ProductName CurrentStatus')
          .exec(function (err, serviceorders){
            serviceorders.forEach(function(yours){
              workoffers.push({
                "_id": yours._id,
                "_CreatedBy": yours._CreatedBy,
                "ProductName": yours._Product.ProductName,
                "SerialNumber": yours._Equipment.SerialNumber,
                "ProblemTypeDescription": yours.ProblemTypeDescription,
                "PriorityDescription": yours.PriorityDescription,
                "CurrentStatus": yours.CurrentStatus
              });
            });
            callback();
          });
        },
        function(callback){
          ServiceOrder.find({CloseDate: {$exists: false} })
            .where('CurrentStatus').equals('Accepted')
            // .populate('_CreatedBy')
            .populate('_Product')
            .populate('Priority')
            .populate('_Equipment')
            .populate('User')
              //.select('_id SerialNumber OpenDate ProblemTypeDescription ProductName CurrentStatus')
              .exec(function (err, serviceorders){
                serviceorders.forEach(function(mine){
                  workassigned.push({
                    "_id": mine._id,
                    "_CreatedBy": mine._CreatedBy,
                    "ProductName": mine._Product.ProductName,
                    "SerialNumber": mine._Equipment.SerialNumber,
                    "ProblemTypeDescription": mine.ProblemTypeDescription,
                    "PriorityDescription": mine.PriorityDescription,
                    "CurrentStatus": mine.CurrentStatus
                  });
                });
                callback();
              });
            }], function(err){
                if (err)return next(err);
                if (req.session.user.RoleName === "Customer")
                  res.render('customer',
                        { equipment: workoffers,
                          products:  workassigned,
                          firstname: req.session.user.FirstName});
                else if (req.session.user.RoleName === "Onsite Engineer")
                console.log("-----Work Offers");
                console.log(workoffers);
                console.log("-------------Assigned Work");
                console.log(workassigned);
                res.render('engineer',
                      { WorkOffers: workoffers,
                        WorkAssigned:  workassigned,
                         firstname: req.session.user.FirstName});
              }
            );
        };
