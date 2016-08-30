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
  var mypriority = [];
  var prods = [];
  var pmTypes = [];
  console.log("==========================Get Serivce Create Fields===============================");
  async.parallel([
    function(callback){
      PMType.find()
        .exec(function (err, p){
           p.forEach(function(pm){
             pmTypes.push({
               "_id": pm._id,
               "PMDescription": pm.PMDescription
             });
           });
           callback();
        });
    },

    function(callback){
      ProblemType.find()
          //.select('_id SerialNumber OpenDate ProblemTypeDescription ProductName CurrentStatus')
          .exec(function (err, serviceorders){
            serviceorders.forEach(function(yours){
              myequipment.push({
                "ProblemTypeDescription": yours.ProblemTypeDescription,
              });
            });
            callback();
          });
        },
    function(callback){
      Priority.find()
          //.select('_id SerialNumber OpenDate ProblemTypeDescription ProductName CurrentStatus')
          .exec(function (err, serviceorders){
            serviceorders.forEach(function(yours){
              mypriority.push({
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
                priorities:  mypriority,
                pmt: pmTypes,
                firstname: req.session.user.FirstName});
          }
        );
      };

  //Login Functions


  exports.update = function(req, res) {
    var maxId;
    EquipObj = JSON.parse(req.body.Equipment);
    async.series([
      function(callback){
        // find the max service _id
        ServiceOrder.aggregate( {$group: { _id: "", mymaxid: {$max: "$_id"}}})
          .exec(function (err, mymax) {
              var max = mymax[0];
              maxId = (max.mymaxid + 1);
              callback(null, 1);
              console.log(maxId);
              });
          },
        function(callback){
          if(req.body.PMType === null){
              ServiceOrder.create({
                _id: maxId,
                _Equipment: EquipObj.equipid,
                _Product: EquipObj.prodid,
                _CreatedBy: req.session.user._id,
                ProblemTypeDescription: req.body.ProblemType,
                PriorityDescription: req.body.Priority,
                CustomerContactInfo: {
                  Name: req.body.ContactName,
                  Email: req.body.ContactEmail,
                  Phone: req.body.ContactPhone,
                },
                ProblemNotes: req.body.ProblemNotes,
                OpenDate: req.body.Today,
                Checkin: 0,
                _AssignedTo: 83791,
                CurrentStatus: "Assigned, Waiting to be Accepted"
                // ServiceDetails: {_ID: 1, _User: req.session.user._id, StatusDescription: "Assigned, Waiting to be Accepted" }
              }, function (err, serviceorder) {
                callback();
              });
            }else {
              ServiceOrder.create({
                _id: maxId,
                _Equipment: EquipObj.equipid,
                _Product: EquipObj.prodid,
                _CreatedBy: req.session.user._id,
                ProblemTypeDescription: req.body.ProblemType,
                PMDescription: req.body.PMType,
                PriorityDescription: req.body.Priority,
                CustomerContactInfo: {
                  Name: req.body.ContactName,
                  Email: req.body.ContactEmail,
                  Phone: req.body.ContactPhone,
                },
                ProblemNotes: req.body.ProblemNotes,
                OpenDate: req.body.Today,
                Checkin: 0,
                _AssignedTo: 83791,
                CurrentStatus: "Assigned, Waiting to be Accepted"
                // ServiceDetails: {_ID: 1, _User: req.session.user._id, StatusDescription: "Assigned, Waiting to be Accepted" }
              }, function (err, serviceorder) {
                callback();
              });
            }
          },

        function(callback){
          console.log(maxId);
          ServiceOrder.findOne({ _id: maxId})
          .exec(function (err, serviceorder){
            serviceorder.ServiceDetails.push({ _id: 1, _User: req.session.user._id, StatusDescription: "Assigned, Waiting to be Accepted" });

                  // serviceorder.ServiceDetails.push({
                  //     _id: 1,
                  //     _User: req.session.user._id,
                  //     StatusDescription: "Assigned, Waiting to be Accepted"
                  // });
                  serviceorder.save(function (err, serviceorder){
                  });
            callback();
          });
        }], function(err){
        if (err)return next(err);
          console.log("works");
          res.redirect('/customer');
        });

  };
