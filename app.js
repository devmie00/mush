
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , server = require('./routes/server')
  , api = require('./routes/api')  
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// -- ROUTING IF--
app.get('/', routes.index);
app.get('/login', server.login);
app.post('/login.post', server.login.post);
app.get('/home', server.home);
app.get('/setting', server.setting);

app.get('/help', server.help);
app.get('/fieldData/:fid/:fname', server.fieldData);
app.get('/fieldGraph/:did/:sid/:fname', server.fieldGraph);	
//app.get('/graphSetting/:did/:sid/:fname', server.graphSetting);
app.get('/graphSetting', server.graphSetting);
app.get('/fieldMap/:location/:fname', server.fieldMap);  // �ޏ�n�}
app.get('/photoList', server.photoList);

// Menu
app.get('/diaryList/:fid', server.diaries);  // �����ꗗ
app.get('/diary/:fid/:yid', server.diary);  // �����\��
app.get('/diary/:fid/create', server.diary_create);  // �����쐬
app.post('/diary.post/:fid', server.diary.post);  // �����̓o�^�ƍX�V
//--
app.get('/remocon/:fid', server.remocon);  // �����R��
app.get('/remoconConfirm', server.remoconConfirm);
//--
app.get('/alertList/:fid', server.alerts);  // �Ď�����
app.get('/alert/:fid/:aid', server.alert);  // �A���[�g�X�V
app.get('/alert/:fid/create', server.alert_create);  // �A���[�g�쐬
app.post('/alert.post/:fid', server.alert.post);  // �A���[�g�̓o�^�ƍX�V

app.get('/fieldInfo/:fid', server.fieldInfo);  // �ޏ���

// -- ROUTING API --
app.get('/api/fields/:gid', api.getFields);
app.get('/api/field/:fid', api.getField);
app.get('/api/datastreams/:fid', api.getDatastreams);
app.get('/api/datastream/:did/:sid', api.getData);
app.get('/api/notices', api.getNotices);
app.get('/api/output/:did.json', api.getData);
app.get('/api/getWorkChoice', api.getWorkChoice);

  // diaries
//app.post('/diary/:fid/create', api.createDiary); �����Ή�
//app.post('/diary/:yid', api.updateDiary);  �����Ή�
//app.delete('/diary/:yid', api.deleteDiary);  �����Ή�
app.get('/api/diaries/:fid', api.getDiaries);
app.get('/api/diary/:yid', api.getDiary);


// alert
//app.put('/alert/:fid/create', api.createAlert); �����Ή�
//app.post('/alert/:aid', api.updateAlert);
//app.delete('/alert/:aid', api.deleteAlert);
app.get('/api/alerts/:fid', api.getAlerts);
app.get('/api/alert/:aid', api.getAlert);



http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
