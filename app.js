
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



var repl = require("repl");

repl.start({
  prompt: "test> ",
  input: process.stdin,
  output: process.stdout
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
