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
  var workoffers = [];
  var workassigned = [];
  var historys = [];
  console.log("==Engineer Queries==");
  async.parallel([
    function(callback){
      ServiceOrder.find({CloseDate: {$exists: false} })
        .where('_AssignedTo').equals(req.session.user._id)
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
                "CustomerContactInfo": yours.CustomerContactInfo,
                "ProductName": yours._Product.ProductName,
                "SerialNumber": yours._Equipment.SerialNumber,
                "Location": yours._Equipment.Room,
                //***CHANGE: Added more Equipment Queries
                "ProblemTypeDescription": yours.ProblemTypeDescription,
                "ProblemNotes": yours.ProblemNotes,
                "PriorityDescription": yours.PriorityDescription,
                "CurrentStatus": yours.CurrentStatus,
                "Name": yours.CustomerContactInfo.Name
              });
            });
            callback();
          });
        },
        function(callback){
          ServiceOrder.find()
            .where('_AssignedTo').equals(req.session.user._id)
            .populate('_Product')
            .populate('Priority')
            .populate('_Equipment')
            .populate('User')
              //.select('_id SerialNumber OpenDate ProblemTypeDescription ProductName CurrentStatus')
              .exec(function (err, serviceorders){
                serviceorders.forEach(function(yours){
                  historys.push({
                    "_id": yours._id,
                    "CustomerContactInfo": yours.CustomerContactInfo,
                    "ProductName": yours._Product.ProductName,
                    "SerialNumber": yours._Equipment.SerialNumber,
                    "Location": yours._Equipment.Room,
                    "ProblemTypeDescription": yours.ProblemTypeDescription,
                    "ProblemNotes": yours.ProblemNotes,
                    "PriorityDescription": yours.PriorityDescription,
                    "CurrentStatus": yours.CurrentStatus,
                    "Name": yours.CustomerContactInfo.Name
                  });
                });
                callback();
              });
            },
        function(callback){
          ServiceOrder.find({CloseDate: {$exists: false} })
            .where('CurrentStatus').equals('Accepted')
            .where('_AssignedTo').equals(req.session.user._id)
            .populate('_Product')
            .populate('Priority')
            .populate('_Equipment')
            .populate('User')
              //.select('_id SerialNumber OpenDate ProblemTypeDescription ProductName CurrentStatus')
              .exec(function (err, serviceorders){
                serviceorders.forEach(function(mine){
                  workassigned.push({
                    "_id": mine._id,
                    "CustomerContactInfo": mine.CustomerContactInfo,
                    "ProductName": mine._Product.ProductName,
                    "Parts": mine._Product.Components[0],
                    "Parts1": mine._Product.Components[1],
                    "SerialNumber": mine._Equipment.SerialNumber,
                    "Equip_id": mine._Equipment._id,
                    "Location": mine._Equipment.Room,
                    //***CHANGE: Added more Equipment Queries
                    "ProblemNotes": mine.ProblemNotes,
                    "ActualMinutes": mine.ActualMinutes,
                    "ProblemTypeDescription": mine.ProblemTypeDescription,
                    "PriorityDescription": mine.PriorityDescription,
                    "CurrentStatus": mine.CurrentStatus,
                    "Name": mine.CustomerContactInfo.Name,
                    "Checkin": mine.Checkin
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
                        history:  historys,
                        firstname: req.session.user.FirstName,
                        rejected: req.query.rso,
                        accepted: req.query.aso,
                        checkin: req.query.cin,
                        checkout: req.query.cout});
              }
            );
        };
//Modal Functions
exports.getWorkOfferModal = function(req, res){
  var workoffers = [];
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
                "CustomerContactInfo": yours.CustomerContactInfo,
                "ProductName": yours._Product.ProductName,
                "SerialNumber": yours._Equipment.SerialNumber,
                "Location": yours._Equipment.Room,
                "Equip_id": yours._Equipment._id,
                "ProblemNotes": yours.ProblemNotes,
                "ProblemTypeDescription": yours.ProblemTypeDescription,
                "PriorityDescription": yours.PriorityDescription,
                "CurrentStatus": yours.CurrentStatuss
              });
            });
          });
          //***Stuart CHANGE: Reference Test modal
          res.render('workOffModal',
                { WorkOffers: workoffers,
                  firstname: req.session.user.FirstName});
        };

  exports.getWorkAssModal = function(req, res){
    res.render('workAssModal',
      { firstname: req.session.user.FirstName,
        reqid: req.query.reqid,
        reqproblemnotes: req.query.problemnotes,
        reqserial: req.query.snum,
        reqequipid: req.query.EquipID,
        reqproblemdescription: req.query.problemdescription,
        reqprd: req.query.prd,
        reqpd: req.query.pd,
        reqstatus: req.query.status,
        reqname: req.query.name
      });
    };

  exports.postWorkAssModal = function(req, res){
    console.log(req.body.reqid);
    ServiceOrder.findOne({ _id: req.body.reqid})
    .exec(function(err, so) {
       so.CurrentStatus = req.body.Status;
       so.save(function (err,so){
       });
    });
    res.redirect('/engineer');
  };

  exports.quickAcceptReject = function(req, res){
    console.log(req.body.reqid);
    if (req.body.submit == "accept"){
      ServiceOrder.findOne({ _id: req.body.reqid})
      .exec(function(err, so) {
         so.CurrentStatus = "Accepted";
         so.CloseDate = req.body.Today;
         so.save(function (err,so){
         });
      });
      res.redirect('/engineer?aso=' + req.body.reqid);
      // res.redirect(req.get('referer')+'?aso='+req.body.reqid);
    }else if (req.body.submit == "reject"){
      ServiceOrder.findOne({ _id: req.body.reqid})
      .exec(function(err, so) {
         so.CurrentStatus = "Rejected";
         so.save(function (err,so){
         });
      });
      res.redirect('/engineer?rso=' + req.body.reqid);
    }
  };

  exports.checkin = function(req, res){
  var c;
  if (req.body.submit == "checkout"){
    c = 0;
    ServiceOrder.findOne({ _id: req.body.reqid})
    .exec(function(err, so) {
       so.Checkin = c;
       so.save(function (err,so){
       });
    });
    res.redirect('/engineer?cout=' + req.body.reqid);
    // res.redirect('back');
  }else if (req.body.submit == "checkin"){
    c = 1;
    ServiceOrder.findOne({ _id: req.body.reqid})
    .exec(function(err, so) {
       so.Checkin = c;
       so.save(function (err,so){
       });
    });
    res.redirect('/engineer?cin=' + req.body.reqid);
    // res.redirect('back');
  }
  console.log("Checkin Var");
  console.log(c);

};

  exports.getWorkOffModal = function(req, res){
    res.render('workOffModal',
      {
        firstname: req.session.user.FirstName,
        reqid: req.query.reqid,
        reqproblemnotes: req.query.problemnotes,
        reqserial: req.query.snum,
        reqproblemdescription: req.query.problemdescription,
        reqprd: req.query.prd,
        reqequipid: req.query.EquipID,
        reqpd: req.query.pd,
        reqstatus: req.query.status,
        reqname: req.query.name
      });
    };

  exports.postWorkOffModal = function(req, res){
    console.log(req.body.reqid);
    ServiceOrder.findOne({ _id: req.body.reqid})
    .exec(function(err, so) {
       so.CurrentStatus = "Completed";
       so.CloseDate = req.body.Today;
       so.save(function (err,so){
       });
    });
    res.redirect('/engineer');

  };

  exports.postWorkOffModal = function(req, res){
    console.log(req.body.reqid);
    ServiceOrder.findOne({ _id: req.body.reqid})
    .exec(function(err, so) {
       so.CurrentStatus = req.body.Status;
       so.save(function (err,so){
       });
    });
    res.redirect('/engineer');
  };
