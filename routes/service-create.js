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
                pmt: pmTypes,
                firstname: req.session.user.FirstName});
          }
        );
      };

  //Login Functions


  exports.update = function(req, res, callback) {
    async.parallel([
      function(callback){
        // find the max service _id
        ServiceOrder.findOne()
          .sort('-_id')  // give me the max
          .select('_id')
          .exec(function (err, member) {
              var max = member._id;
                  console.log("====max====");
                  console.log(max);
                  console.log("====max====");
              });
              callback();
          },


        function(callback){
          var myQuery = new ServiceOrder({
              _id: max + 1,
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
              OpenDate: req.body.Today,
              ServiceDetails: {
                _id: 1,
                _User: req.session.user._id,
                StatusDescription: "Submitted By Customer"
              }
          });

          myQuery.save(function(err, myQuery) {
            if (err) return console.error(err);
            console.dir(myQuery);

          });
          callback();
        }], function(err){
        if (err)return next(err);
          console.log("works");
        }
      );

  };
