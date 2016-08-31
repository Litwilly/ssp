// Bring Mongoose into the project
var mongoose = require('mongoose');
// Build the connection string

var dbURI = 'mongodb://itlp:itlp@ds013486.mlab.com:13486/itlp';
// var dbURI = 'mongodb://localhost/EMCITLP'; //localhost can be changed to 127.0.0.1 if localhost will not start




// Create the database connection
mongoose.connect(dbURI);

//Setup Schemas

//Components - a subdocument of Products.
var componentsSchema = new mongoose.Schema({
    ComponentPrice: Number,
    ComponentDescription: String,
    ComponentPartNumber: String
});

//Products
var productsSchema = new mongoose.Schema({
    _id: Number,
    ProductName: String,
    Modality: String,
    ProductPrice: Number,
    ProductCost: Number,
    Components: [componentsSchema]
});

//Users
var usersSchema = new mongoose.Schema({
    _id: Number,
    RoleName: String,
    UserName: String,
    Password: String,
    FirstName: String,
    LastName: String,
    Street: String,
    City: String,
    Province: String,
    PostalCode: String,
    Email: {
        type: String,
        unique: true
    },
    Phone: String,
    CustomerName: String,
    CustomerType: String,
    ContractType: String,
    CountryName: String,
    RegionName: String,
    Position: String,
    LastLogin: Date,
    ThisLogin: Date
});

//Equipment
var equipmentSchema = new mongoose.Schema({
    _id: Number,
    _User: {
        type: Number,
        ref: 'User'
    },
    _Product: {
        type: Number,
        ref: 'Product'
    },
    StatusDescription: String,
    SerialNumber: String,
    Room: String,
    InstallDate: Date,
    NextPMDate: Date,
    NextPMDescription: String
});

//Status
var statusSchema = new mongoose.Schema({
    _id: Number,
    StatusDescription: String
});

//ProblemType
var problemTypeSchema = new mongoose.Schema({
    _id: Number,
    ProblemTypeDescription: String
});

//PmType
var pmTypeSchema = new mongoose.Schema({
    _id: Number,
    PMDescription: String
});

//Priority
var prioritySchema = new mongoose.Schema({
    _id: Number,
    PriorityDescription: String
});

//ServiceDetails
var serviceDetailsSchema = new mongoose.Schema({
    _id: Number,
    _User: {
      type: Number,
      ref: 'User',
    },
    StatusDescription: String,
    ApprovedDate: Date,
    AssignedDate: Date,
    AcceptedDate: Date,
    Checkin: Date,
    Checkout: Date,
    ActionNotes: String,
    ActualMinutes: Number
});

//ServiceOrder
var serviceOrderSchema = new mongoose.Schema({
  _id: Number,
  _CreatedBy: {
    type: Number,
    ref: 'User'
  },
  _AssignedTo: {
    type: Number,
    ref: 'User'
  },
  ProblemTypeDescription: String,
  PriorityDescription: String,
  OpenDate: {
    type: Date,
    default: Date.now
  },
  CloseDate: Date,
  CurrentStatus: String,
  TotalEstimatedMinutes: Number,
  Checkin: Number,
  ProblemNotes: String,
  ComponentDescription: String,
  LaborCost: Number,
  PartsCost: Number,
  CustomerContactInfo: {
    Name: String,
    Phone: String,
    Email: String
  },
  _Equipment: {
    type: Number,
    ref: 'Equipment'
  },
  _Product: {
    type: Number,
    ref: 'Product'
  },
  ReplacementParts: [replacementPartsSchema],
  ServiceDetails: [serviceDetailsSchema]
});

//ReplacementParts
var replacementPartsSchema = new mongoose.Schema({
    ComponentPrice: Number,
    ComponentDescription: String,
    PartNumber: String,
    Quanity: Number
});

// Create Models

mongoose.model('Product', productsSchema, 'products');
mongoose.model('User', usersSchema, 'users');
mongoose.model('Equipment', equipmentSchema, 'equipment');
mongoose.model('Status', statusSchema, 'status');
mongoose.model('ProblemType', problemTypeSchema, 'problemtype');
mongoose.model('PMType', pmTypeSchema, 'pmtype');
mongoose.model('Priority', prioritySchema, 'priority');
mongoose.model('ServiceOrder', serviceOrderSchema, 'serviceorders');


//Catch events

mongoose.connection.on('connected', function() {
    console.log('Mongoose Connect to ' + dbURI);
});

mongoose.connection.on('error', function(err) {
    console.log('Mongoose Connection Error ' + err);
});

mongoose.connection.on('disconnected', function() {
    console.log('Mongoose Disconnected');
});

process.on('SIGINT', function() {
    mongoose.connection.close(function() {
        console.log('Mongoose Disconnected Through App Termination');
        process.exit(0);
    });
});
