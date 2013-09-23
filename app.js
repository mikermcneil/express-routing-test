
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');
global['express'] = express;

app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);


//////////////////////////////////////////////////////////////////
//
// https://github.com/visionmedia/express/blob/master/lib/utils.js#L293
// https://github.com/visionmedia/express/blob/master/lib/router/route.js#L30
function addRoute (path, middleware, verb) {
	var Route = require('./node_modules/express/lib/router/route.js');
	var route = new Route(verb, path, [ middleware ], {});
	app.routes[verb].push(route);
}

function resetRoutes (verb) {
	if (!verb) {
		resetRoutes('get');
		resetRoutes('post');
		resetRoutes('put');
		resetRoutes('delete');
		return;
	}
	app.routes[verb] = [];
}
//
//
//////////////////////////////////////////////////////////////////



// (1) Build Intermediate Table
//
// Build intermediate table with controller.action as keys
// and a list of functions as values
// (to look up the list of functions, use the existence chain: 
// controller/action -> view -> blueprintable)

// Legacy support: Attach policy chains from policy map
// in front of the appropriate controller/actions in intermediate table.

// Now we have a definitive intermediate mapping of actions 
// to the appropriate middleware, policies and all!

// (2) Map Static Routes
// 
// Take everything in the route config, and replace any references
// to controllers/actions with a function chain from the intermediate table.
// Lookup the function for any additional policies 
// and replace it at the appropriate position in the chain.

// Now all static routes are mapped.

// (3) Map Dynamic Routes


// All actions are available through default resourceful URLs, 
// based on their controller/action identity, regardless of HTTP verb.

// For each action in the intermediate table, create a route.
// These routes will be applied after the static routes, so they'll only
// be called if a static route doesn't exist 
// (or the static handler calls next())

// This can be disabled by setting `autoRoute: false` in a controller.

// ====================================================
// If you name a controller's action `<VERB> foo`, only the <VERB>
// HTTP method will be automatically routed to that action.
// If you specify both `<VERB> foo` and `foo` actions, the version with
// a specified verb will be added to the router first.  This goes for routes as well.
// ====================================================


// (4) Map Blueprint Routes

// Blueprint routes are bound the same way as dynamic routes, 
// immediately afterwards.

// ====================================================
// If a model exists with the same name of a given controller,
// and that controller does not have `blueprint: false`,
// that controller will use a blueprint.  
// Like any other controllers, controllers which utilize blueprints
// can still have other actions-- they just get some extras automatically.
// These blueprint methods can be overridden by the controller.
// ====================================================

// Blueprint methods are:
// create(), update(), destroy(), find(), findOne(), and subscribe()

// Blueprints implicitly add the following routes:
/* 

 * get /:entity			-> Return models; Model.subscribe() to each of them
 * get /:entity/:id		-> Return model (:id); Model.subscribe() to it
 * post /:entity		-> Create a new model; Model.publishCreate()
 * put /:entity/:id		-> Update model (:id); Model.publishUpdate()
 * delete /:entity/:id	-> Destroy model (:id); Model.publishDestroy()

 * /:entity/subscribe	-> Model.subscribe()
*/

// Blueprints implicitly add the following routes ONLY in dev mode:
/*
 * /:entity/find		-> Return models; Model.subscribe() to each of them
 * /:entity/findOne/:id	-> Return model (:id); Model.subscribe() to it
 * /:entity/create		-> Create a new model; Model.publishCreate()
 * /:entity/update/:id	-> Update model (:id); Model.publishUpdate()
 * /:entity/destroy/:id	-> Destroy model (:id); Model.publishDestroy()
 */


////////////////////////////////////////////////////////
// Configure blueprints:
//
// true		=> use default
// false	=> disabled
// Function	=> override default with provided middleware
// omitted	=> disabled
//
// NOTE:
// Only the routes in this list will be injected as blueprints!
// So if you remove any of the defaults, they're gone 
// until you add them back in!
//
// TIP:
// The controller identity (e.g. `user`) comes in handy
// when you're overriding a blueprint method.
// With the default routes below, you can access it with:
// req.param('entity')
//
////////////////////////////////////////////////////////
/*

// e.g. Enable only RESTful blueprints, and subscribe()
//
sails.config.blueprint.methods = {
	'get /:entity'			: true,
	'get /:entity/:id'		: true,
	'post /:entity'			: true,
	'put /:entity/:id'		: true,
	'delete /:entity/:id'	: true,
	'put /:entity/subscribe': true,

	'/:entity/find'			: false,
	'/:entity/findOne/:id'	: false,
	'/:entity/create'		: false,
	'/:entity/update/:id'	: false,
	'/:entity/destroy/:id'	: false
};

// To completely disable blueprint routes, use an empty object:
sails.config.blueprint.methods = {};

// For backwards compatibility with projects built with earlier versions of Sails,
// Sails v0.9 defaults to the following:
sails.config.blueprint.methods = false;

// This means that all blueprints will be injected, but a deprecation warning will be issued.
// <history>blueprints were historically implicitly enabled, with no way to disable them</history>

*/

app.all('/user/create', function serveAction (req,res, next) {
	console.log('matching controller/action found');
	next();
});
app.all('/:entity/create', function createBlueprint (req,res, next) {
	console.log('create blueprint');
	res.send('blueprint would be served here.');
});
app.all('/user/create', function serveView (req,res, next) {
	console.log('view()- don\'t call next(), just respond.  You can only get here if a view exists.');
	res.send('view would be sent here');
});


// If development:
/*

First, automatically create routing table 
using explicit routes along with built-ins:

 * route exists (policies can be bundled here)
 * controller with matching action exists
 * view exists
 * blueprint-able controller with matching action + model exists 

Now prepend policy middleware to each route, 
if it wasn't already specified in the route.

*/

/*
// Cascade
'get /foo*': [''],


// Middleware chain
'get /admin': ['authenticated', 'admin.index']

// Redirect
'get /login': '/foo'
*/

var repl = require("repl");

repl.start({
  prompt: "test> ",
  input: process.stdin,
  output: process.stdout
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
