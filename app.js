/**
 * Module dependencies.
 *
 *  2015.06.25 (dai) Merged with webapi, add session..
 *  2015.06.27 (dai) Use webapi(r11)
 *  2015.06.29 (dai) Use webapi(r12)
 */

var express = require('express')
  , routes = require('./routes')
  , server = require('./routes/server')
  , api = require('./routes/api')
  , files = require('./routes/files')
  , http = require('http')
  , path = require('path');

/**
var mongoStore = require('connect-mongo')(express);
**/

var app = express(); 
var apiBasePath = '/api';

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  /**
  app.use(express.session(
    {
      secret: 'sam',
      store: new mongoStore({
        db: 'session',
        host: 'localhost',
        clear_interval: 60 * 60
      }),
      cookie: {
        httpOnly: false,
        maxAge: 60 * 60 * 1000
      }
    }
  ));
 **/
 app.use(express.session({secret: 'secret_for_sign'}));
/** add for mori **/   
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var loginCheck = function(req, res, next) {
  console.log('> loginCheck()');
  if (req.session.uid) {
    console.log('> loginCheck() ok:', req.session.uid);
    next();
  }
  else {
    console.log('> loginCheck() NG');
    res.redirect('/login');
  }
};

//-- Front end --
//-- Front end --
app.get('/', loginCheck, routes.index);
app.get('/login', server.login);
app.post('/login.post', server.login.post);
app.get('/home', loginCheck, server.home);
app.get('/setting', loginCheck, server.setting);

app.get('/help', server.help);
app.get('/fieldData/:fid/:fname?', loginCheck, server.fieldData);
app.get('/fieldGraph/:did/:sid/:unit', loginCheck, server.fieldGraph);	
//app.get('/graphSetting/:did/:sid/:fname', server.graphSetting);
app.get('/graphSetting', loginCheck, server.graphSetting);
app.get('/fieldMap/:location', loginCheck, server.fieldMap); 
app.get('/photoList', loginCheck, server.photoList);

// Menu
app.get('/diaryList', loginCheck, server.diaries);
app.get('/diary/:yid', loginCheck, server.diary);
app.get('/diary/create', loginCheck, server.diary_create);
app.post('/diary.post/:yid?', server.diary.post);

//--remocon
app.get('/remocon', loginCheck, server.remocon);
app.get('/remoconConfirm', loginCheck, server.remoconConfirm);
//--alert
app.get('/alertList', loginCheck, server.alerts);
app.get('/alert/:aid', loginCheck, server.alert);
app.get('/alert/create', loginCheck, server.alert_create);
app.post('/alert.post', loginCheck, server.alert.post);
//--
app.get('/fieldInfo', loginCheck, server.fieldInfo);


//-- Web API --
  // fields
app.get(apiBasePath + '/groups/:gid/fields', api.listFields);
app.get(apiBasePath + '/fields/:fid', api.getField);
  // datastreams
app.get(apiBasePath + '/fields/:fid/datastreams', api.listDatastreams);
app.get(apiBasePath + '/datastream/:did/:sid', api.getDatastream);
  // data
app.get(apiBasePath + '/data/:did/:sid', api.getData);
  // diaries
app.get(apiBasePath + '/fields/:fid/diaries', api.listDiaries);
app.get(apiBasePath + '/diaries/:yid', api.getDiary);
app.put(apiBasePath + '/fields/:fid/diaries', api.createDiary);
app.post(apiBasePath + '/diaries/:yid', api.updateDiary);
app.delete(apiBasePath + '/diaries/:yid', api.removeDiary);
  // alerts
app.get(apiBasePath + '/fields/:fid/alerts', api.listAlerts);
app.get(apiBasePath + '/alerts/:aid', api.getAlert);
  // notices
app.get(apiBasePath + '/notices', api.listNotices);
  // choices
app.get(apiBasePath + '/fields/:fid/choices', api.listChoices);
  // files
app.get(apiBasePath + '/photos/:did/:day', files.listFiles);
app.get(apiBasePath + '/photos/:did/:day/:filename', files.getFile);

// create server and run
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

