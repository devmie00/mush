/*
 * GET home page.
 *  2015.06.25  Merged with webapi
 */

//var api = require('./api');
var http = require('http');

var model = require('../models/users');
var User = model.User;
 
// display login
exports.login = function(req, res){
	console.log('req.session=', req.session);
  if (req.session.uid) {
    // clear session info
    delete req.session.email;
    delete req.session.uid;
    delete req.session.gid;
  }
  res.render('login', { message: null });  
};

// submit login
exports.login.post = function(req, res, next) {
   var email   = req.body.email || '';
   var password = req.body.pwd || '';
   var query = { email: email, password: password };
   console.log('query=', query);
   User.find(query, function (err, data) {
    if (err) {
      console.log('Auth error: ', err);
    }
    if (!data || data == '') {
      console.log('Auth failed');
      res.render('login', { message: 'ログインエラーです。再度ログインしてください。' });
    }
    else {
      console.log('Auth OK, data=', data);
      // set session info
      req.session.email = data[0].email;
      req.session.uid = data[0].uid;
      req.session.gid = data[0].gid; 
   	  console.log('req.session=', req.session);      
      res.redirect('/home');
    }
   });
};

// 直接home
exports.home = function(req, res, next) {
   console.log('in home')
   if (! req.session.uid || req.session.uid == '') {
      res.redirect('/login');
   }
   console.log('>home:', req.session.uid, req.session.gid)
   res.render('home', { gid: req.session.gid });
};

exports.setting = function(req, res){
  res.render('setting', { title: '設定' });  
};
exports.help = function(req, res){
	res.render('help', { title: 'help' });  
};　

// fieldData
exports.fieldData = function(req, res, next) {
   console.log('in fieldData'); 
   var fid = Number(req.params.fid);
   var fname = String(req.params.fname);

   req.session.field = {
   	 	fid: fid,
   	 	fname: fname
   };

   console.log('in fname:'+ fname); 
   // ここで本当はjsonオブジェクトを渡したい
   //app.getjson
   res.render('field', { fname: fname, fieldID: fid});
};

// graph
exports.fieldGraph = function(req, res, next) {
   var did = String(req.params.did);
   var sid = String(req.params.sid);
   var unit = String(req.params.unit);   
   req.session.graph = {
   	 	did: did,
   	 	sid: sid,
   	 	unit: unit,
   };   
   var fname = req.session.field.fname;   
   console.log('in fieldGrap:', did, sid);
   res.render('graph', { did: did, sid: sid, fname: fname });
};

// グラフ設定表示
exports.graphSetting = function(req, res){
	res.render('graphSetting');  
};
// 地図
exports.fieldMap = function(req, res, next) {
   var fname = String(req.session.field.fname);
   var location = String(req.params.location);   
   console.log('>in fieldMap:'+ fname);    
   res.render('map', { fname: fname, location: location});
};

// 日誌表示
exports.diary = function(req, res, next) {
   var fid = Number(req.session.field.fid);      
   var yid = Number(req.params.yid);
   req.session.diary = {
   	 	yid: yid
   };      
   console.log('>in diary:' + fid + ':' + yid);    
   res.render('diary', {fid:fid , yid : yid});
};

// 日誌作成
exports.diary_create = function(req, res, next) {

   var fid = Number(req.session.field.fid);      
   console.log('>in diary new:' + fid);    
   res.render('diary', {fid : fid, yid: null});
};

// 日誌登録
exports.diary.post = function(req, res, next) {
   var fid = Number(req.session.field.fid);         
   console.log('>in diary post:' + fid);   

   var yid = Number(req.body.yid);
      
   var input_date = req.body.input_date;
   var work  = req.body.work;
   var content  = req.body.content;   
   var memo = String(req.body.memo);
   
   console.log('>in daiary post ')
   console.log('>  yid:' + yid + ' fid:' + fid + ' memo:' + memo	+ ' : input_date:' + input_date);   
   if (yid) {  // UPDATE
    	api.updateDiary(req, res, res.redirect('/diaryList/'+ fid + '/'));
    } else {   // INSERT
    	api.createDiary(req, res, res.redirect('/diaryList/'+ fid +'/'));    
    }
};

// アラート表示
exports.alert = function(req, res, next) {
   var fid = Number(req.session.field.fid);   
   var aid = Number(req.params.aid);
   console.log('>in alert:', fid, aid);    

   res.render('alert', { fid: fid, aid: aid });
};

// アラート作成
exports.alert_create = function(req, res, next) {
   var fid = Number(req.session.field.fid);
   console.log('>in alert new:' + fid);    
   res.render('alert', {fid : fid});
};

// アラート登録
exports.alert.post = function(req, res, next) {

   console.log('>in alert post');
   /*
   var fid = Number(req.session.field.fid);  
   
   var aid = Number(req.body.aid);
   var input_date = req.body.input_date;
   var work  = req.body.work;
   var content  = req.body.content;   
   var memo = String(req.body.memo);
   console.log('>aid:' + aid + ' fid:' + fid + ' memo:' + memo	+ ' : input_date:' + input_date);   
   if (yid) {  // UPDATE
    	api.updatealert(req, res, res.redirect('/alertList/'+ fid + '/'));
    } else {   // INSERT
    	api.createalert(req, res, res.redirect('/alertList/'+ fid +'/'));    
    }
    */
};

// 写真リスト
exports.photoList = function(req, res){
	res.render('photoList');  
};　

// -------------------
// 圃場メニュー
// -------------------
exports.remocon = function(req, res){
   var fid = Number(req.session.field.fid);
	res.render('remocon', { fid : fid });  
};

exports.remoconConfirm = function(req, res){
	res.render('remoconConfirm');  
};

// 日誌一覧
exports.diaries = function(req, res){
   var fid = Number(req.session.field.fid);
   
   /*var today = new Date();
   var mm = ("0"+(today.getMonth()+1)).slice(-2);
   var dd = ("0"+(today.getDate()+1)).slice(-2);
   
   var last = [today.getFullYear(), mm , dd ].join('-');   
   */
   console.log('>in diaries:'+ req.query.last);      
   var last = null;
   if (req.query.last) {
    	last = String(req.query.last);
   }
   res.render('diaryList', { fid : fid, last : last});  
};

// アラート一覧
exports.alerts = function(req, res){
  var fid = Number(req.session.field.fid);
	res.render('alertList', { fid : fid });  
};

exports.fieldInfo = function(req, res){
 	var fid = Number(req.session.field.fid);
 	console.log('>in fieldinfo:' +fid );    
	res.render('fieldInfo', { fid : fid });  
};

