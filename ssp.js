/**
 * Module dependencies.
 */

//ssp application
var express = require('express');
var dbstarter = require('./model/db_starter');
var routes = require('./routes');
var user = require('./routes/user');

var mainquery = require('./routes/mainquery');
var customerQuery = require('./routes/customerQuery');
var engineerQuery = require('./routes/engineerQuery');
var servicedetails = require('./routes/servicedetails');
var servicecreate = require('./routes/service-create');


var http = require('http');
var path = require('path');
var app = express();

// all environments
app.set('port', process.env.PORT || 3001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('S3CR3T'));
app.use(express.session({
	expires : new Date(Date.now() + 3600000)
}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

app.locals._      = require('underscore');
app.locals.moment = require('moment');
app.locals.accounting = require('accounting');
app.locals.numeral = require('numeral');
// app.locals.Today = new Date("August 1, 2016 03:15:00");

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);

// User Pages
app.get('/customer', customerQuery.getData);
app.get('/engineer', engineerQuery.getData);

app.get('/customer-ServiceOrderTab', customerQuery.getData);
app.get('/customer-EquipmentTab', customerQuery.getData);

// Modal pages
app.get('/modal-serv-req', mainquery.req_modal);
app.get('/modal-svc-order', mainquery.svc_modal);

// app.get('/servicedetails', function(req, res) {
//   res.send("Id is set to " + req.query.id);
// });
app.get('/servicedetails', servicedetails.getData);
app.get('/service-create', servicecreate.create);
app.post('/customer/create', servicecreate.update);
//Workoffer
app.get('/workOfferModal', engineerQuery.getWorkOfferModal);

//Login and Validate User Routes, Logout
app.get('/login', user.loginForm);							//Display Login Form
app.post('/login', user.doLogin);							//Accept Form Data, Execute Login Action
app.get('/login/error', user.loginError);
app.post('/login/error', user.doLoginError);
app.get('/logout', user.doLogout);							//Invalidate Session and Logout.


http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
