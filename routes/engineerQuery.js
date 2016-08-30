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
                "CustomerContactInfo": yours.CustomerContactInfo,
                "ProductName": yours._Product.ProductName,
                "SerialNumber": yours._Equipment.SerialNumber,
                "Location": yours._Equipment.Room,
                //***CHANGE: Added more Equipment Queries
                "ProblemTypeDescription": yours.ProblemTypeDescription,
                "PriorityDescription": yours.PriorityDescription,
                "CurrentStatus": yours.CurrentStatus,
                "Name": yours.CustomerContactInfo.Name,
                "Phone": yours.CustomerContactInfo.Phone,
                "Email": yours.CustomerContactInfo.Email
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
                    "CustomerContactInfo": mine.CustomerContactInfo,
                    "ProductName": mine._Product.ProductName,
                    "SerialNumber": mine._Equipment.SerialNumber,
                    "Location": mine._Equipment.Room,
                    //***CHANGE: Added more Equipment Queries
                    "ProblemNotes": mine.ProblemNotes,
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
                         firstname: req.session.user.FirstName});
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
                "ID": yours._Equipment._id,
                "ProblemNotes": yours.ProblemNotes,
                //***Stuart CHANGE: Added more Equipment Queries
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
    var ar;
    if (req.body.submit == "accept"){
      ar = "Accepted";
    }else if (req.body.submit == "reject"){
      ar = "Rejected";
    }
    console.log(ar);
    console.log("ba");
    ServiceOrder.findOne({ _id: req.body.reqid})
    .exec(function(err, so) {
       so.CurrentStatus = ar;
       so.save(function (err,so){
       });
    });
    res.redirect('/engineer');
  };

  exports.checkin = function(req, res){
    var c;
    if (req.body.submit == "checkout"){
      c = 0;
    }else if (req.body.submit == "checkin"){
      c = 1;
    }
    console.log("Checkin Var");
    console.log(c);
    ServiceOrder.findOne({ _id: req.body.reqid})
    .exec(function(err, so) {
       so.Checkin = c;
       so.save(function (err,so){
       });
    });
    // res.redirectgit(req.get('referer'));
    res.redirect('back');
  };

  // Failed attempt at ajax
  // exports.checkin = function(req, res){
  //   console.log("body goods");
  //   console.log(req.body);
  //   var c;
  //   if (req.body.inout === "0"){
  //     c = 1;
  //   }else if (req.body.inout === "1"){
  //     c = 0;
  //   }
  //   else {
  //     console.log("not working");
  //   }
  //   console.log("Checkin Var");
  //   console.log(c);
  //   ServiceOrder.findOne({ _id: req.body.reqid})
  //   .exec(function(err, so) {
  //      so.Checkin = c;
  //      so.save(function (err,so){
  //      });
  //   });
  //   // res.redirect('/engineer');
  //   res.redirect(req.get('referer'));
  // };

  exports.getWorkOffModal = function(req, res){
    res.render('workOffModal',
      {
        firstname: req.session.user.FirstName,
        reqid: req.query.reqid,
        reqprd: req.query.prd,
        reqpd: req.query.pd,
        reqstatus: req.query.status,
        reqname: req.query.name,
        reqemail: req.query.email,
        reqphone: req.query.phone
      });

  exports.postWorkOffModal = function(req, res){
    console.log(req.body.reqid);
    ServiceOrder.findOne({ _id: req.body.reqid})
    .exec(function(err, so) {
       so.CurrentStatus = req.body.Status;
       so.CloseDate = req.body.Today;
       so.save(function (err,so){
       });
    });
    res.redirect('/engineer');
  };
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
