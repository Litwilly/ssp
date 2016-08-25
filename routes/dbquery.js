var mongoose = require('mongoose');
var Product = mongoose.model('Product');
var User = mongoose.model('User');
var Equipment = mongoose.model('Equipment');
var ServiceOrder = mongoose.model('ServiceOrder');
var _ = require('underscore');
var async = require('async');

// find (using Query Builder) - Retrieve Multiple Rows and display all fields
exports.query1 = function(req, res){
      console.log("=========================================================================");
      console.log("==========================             ==================================");
      console.log("==========================   Query 1   ==================================");
      console.log("==========================             ==================================");
      console.log("=========================================================================");
    Equipment.find()
      .sort('InstallDate')
      .exec(function (err, equipment){
         equipment.forEach(function(equipment){
         console.log(equipment);
         });
      });
};


// find (using Query Builder) - Retrieve Multiple Rows, project specified fields
exports.query2 = function(req, res){
      console.log("=========================================================================");
      console.log("==========================             ==================================");
      console.log("==========================   Query 2   ==================================");
      console.log("==========================             ==================================");
      console.log("=========================================================================");
    User.find()
      .sort('RoleName')
      .select('_id UserName RoleName')
      .exec(function (err, users){
         users.forEach(function(users){
         console.log("UserID: " + users._id + " username: " + users.UserName + " rolename: " + users.RoleName);
         });
      });
};

// findone - Retrieve the first row where _id = 84714
exports.query3 = function(req, res){
      console.log("=========================================================================");
      console.log("==========================             ==================================");
      console.log("==========================   Query 3   ==================================");
      console.log("==========================             ==================================");
      console.log("=========================================================================");
    User.findOne({ _id: 84714} )
      .exec(function (err, users){
         console.log("UserID: " + users._id + " username: " + users.UserName);
         });
};

// findById (Using Query Builder) - Retrieve the row that matches Object ID (_id = 84714)
exports.query4 = function(req, res){
      console.log("=========================================================================");
      console.log("==========================             ==================================");
      console.log("==========================   Query 4   ==================================");
      console.log("==========================             ==================================");
      console.log("=========================================================================");
    User.findById(84714)
      .select ('_id UserName RoleName')
      .exec(function (err, users){
         console.log("UserID: " + users._id + " username: " + users.UserName);
         });
};

// find (using Query Builder) - Retrieve Multiple Rows where RoleName = "Customer" and State = "WA" and CustomerType = "Hospital"
exports.query5 = function(req, res){
      console.log("=========================================================================");
      console.log("==========================             ==================================");
      console.log("==========================   Query 5   ==================================");
      console.log("==========================             ==================================");
      console.log("=========================================================================");
    User.find()
      .where('RoleName').equals('Customer')
      .where('Province').equals('WA')
      .where("CustomerType").equals('Hospital')
      .select('_id RoleName Province CustomerType')
      .sort('_id')
      .exec(function (err, users){
         users.forEach(function(users){
         console.log("UserID: " + users._id + " RoleName: " + users.RoleName + " Province: " + users.Province + " CustomerType: " + users.CustomerType);
         });
      });
};

// find (using Query Builder) - Retrieve all rows of Product.  Product contains Component.  Display all fields.

exports.query6 = function(req, res){
      console.log("=========================================================================");
      console.log("==========================             ==================================");
      console.log("==========================   Query 6   ==================================");
      console.log("==========================             ==================================");
      console.log("=========================================================================");
    Product.find()
      .sort('ProductName')
      .exec(function (err, product){
         product.forEach(function(product){
         console.log(product);
         });
      });
};

// find (using Query Builder) - Retrieve all rows of Product.  Product contains Component.  Display all only the ProductName field.
exports.query7 = function(req, res){
      console.log("=========================================================================");
      console.log("==========================             ==================================");
      console.log("==========================   Query 7   ==================================");
      console.log("==========================             ==================================");
      console.log("=========================================================================");
    Product.find()
      .sort('ProductName')
      .select('Components.ComponentPrice')
      .exec(function (err, product){
         product.forEach(function(product){
         console.log(product);
         });
      });
};

exports.query8 = function(req, res){
      console.log("=========================================================================");
      console.log("==========================             ==================================");
      console.log("==========================   Query 8   ==================================");
      console.log("==========================             ==================================");
      console.log("=========================================================================");
      Equipment.find({ _User: 48243 })
         .populate('_Product')
         .sort('ProductName')
         .exec(function (err, equipment){
            equipment.forEach(function(equipment){
            console.log(equipment);
            console.log("=========================================================================");
         });
      });
};


exports.query9 = function(req, res){
      console.log("=========================================================================");
      console.log("==========================             ==================================");
      console.log("==========================   Query 9   ==================================");
      console.log("==========================             ==================================");
      console.log("=========================================================================");
      ServiceOrder.find({ CloseDate: { $exists: false } })
        //Only pull ServiceOrders for the logged in user's customer
        .where('_CreatedBy').equals(48243)
            .sort('OpenDate')
            .exec(function (err, serviceorders){
               serviceorders.forEach(function(serviceorders){
               console.log(serviceorders);
               console.log("=========================================================================");
             });
       });
};


exports.query10 = function(req, res){
      console.log("=========================================================================");
      console.log("==========================             ==================================");
      console.log("==========================   Query 10  ==================================");
      console.log("==========================             ==================================");
      console.log("=========================================================================");
      ServiceOrder.find({ CloseDate: { $exists: false } })
        //Only pull ServiceOrders for the logged in user's customer
        .where('_CreatedBy').equals(48243)
             //join over to the equipment collection fro equimnet details, Note:  Mongoose can't do more than one collection join.
            //join over to the user collection for user/customer details.
            .populate('_CreatedBy')
            //join over to the product collection for product details.
            .populate('_Product')
            //join over to the Equipment collection for product details.
            .populate('_Equipment')
            .sort('OpenDate')
            .exec(function (err, serviceorders){err
               serviceorders.forEach(function(serviceorders){
               console.log(serviceorders);
               console.log("=========================================================================");
             });
       });
};

exports.query11 = function(req, res){
      console.log("=========================================================================");
      console.log("==========================             ==================================");
      console.log("==========================   Query 11  ==================================");
      console.log("==========================             ==================================");
      console.log("=========================================================================");
      Equipment.aggregate( { $group: { _id: "$_User",
                                prodsPerUser: { $sum: 1 },
                                maxInstallDate: {$max: "$InstallDate"}
                                } } )
                .exec(function (err, mytotals){
                  console.log(mytotals);
                  console.log("=========================================================================");
                });
};

// 2 queries run at same time using async parallel and then printed to the console.
exports.query12 = function(req, res){
    var FirstName = "";
    var LastName = "";
    var myequipment = [];
    console.log("=========================================================================");
    console.log("==========================             ==================================");
    console.log("==========================   Query 12  ==================================");
    console.log("==========================             ==================================");
    console.log("=========================================================================");
    async.parallel([
      function(callback){
        User.findOne({ _id: 48243 })
        .exec(function (err, user){
          if (err){
            return callback(err);
          }
            console.log("1st Query---------------  " + user);
            FirstName = user.FirstName;
            LastName = user.LastName;
            callback();
        });
      },
      function(callback){
        Equipment.find({ _User: 48243 })
            .populate('_Product')
            .sort('NextPMDate')
            .exec(function (err, equipment){
              if (!err){
                equipment.forEach(function(myequip){
                  myequipment.push({
                    "_id": myequip._id,
                    "SerialNumber": myequip.SerialNumber,
                    "ProductName": myequip._Product.ProductName,
                    "pmType": myequip.NextPMDescription,
                    "pmDate": myequip.NextPMDate
                  });
                });
              }else {
                    return callback(err);
              }
                console.log("2nd Query -----------------      " + myequipment);
                callback();
            });
        }], function(err){
                if (err) return next(err);
                console.log("Here are the Two Outputs together.......  Name:" + FirstName + " " + LastName);
                console.log("Here are the equipment ........... " + myequipment);
            }
    );
};
