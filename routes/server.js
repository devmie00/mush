
/*
 * GET home page.
 */

var api = require('./api');
var http = require('http');
 
// display login
exports.login = function(req, res){
  res.render('login', { title: 'login' });  
};

// submit login
exports.login.post = function(req, res, next) {
   console.log('in login post')
   var name = req.body.name || '';
   var password = req.body.password || '';
   // 本来サーバ認証だが、これを飛ばしてホーム画面表示
   res.redirect('/home');
};

// 直接home
exports.home = function(req, res, next) {
   console.log('in home')
   res.render('home');
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
   /*
   req.session.field= {
   	 	fid: fid,
   	 	fname:fname
   };
   */ 
   console.log('in fname:'+ fname); 
   // ここで本当はjsonオブジェクトを渡したい
   //app.getjson
   res.render('field', { fname: fname, fieldID: fid});
};

// graph
exports.fieldGraph = function(req, res, next) {
   var did = String(req.params.did);
   var sid = String(req.params.sid);   
   var fname = String(req.params.fname);   
   console.log('in fieldGrap'+ did + ':' + sid);    
   res.render('graph', { did: did, sid: sid, fname:fname});
};

// グラフ設定表示
exports.graphSetting = function(req, res){
	res.render('graphSetting');  
};
// 地図
exports.fieldMap = function(req, res, next) {
   var fname = String(req.params.fname);   
   var location = String(req.params.location);   
   console.log('>in fieldMap:'+ fname);    
   res.render('map', { fname: fname, location: location});
};

// 日誌表示
exports.diary = function(req, res, next) {
   var fid = Number(req.params.fid);
   var yid = Number(req.params.yid);
   console.log('>in diary:' + fid + ':' + yid);    
   res.render('diary', {fid:fid , yid : yid});
};

// 日誌作成
exports.diary_create = function(req, res, next) {
   var fid = Number(req.params.fid);
   console.log('>in diary new:' + fid);    
   res.render('diary', {fid : fid, yid: null});
};

// 日誌登録
exports.diary.post = function(req, res, next) {
   var fid = Number(req.params.fid); 
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
/*
   var yid = Number(req.params.yid);
   console.log('>in alert:' + yid);    
   res.render('alert', {yid : yid});
   */
};

// アラート作成
exports.alert_create = function(req, res, next) {
/*
   var fid = Number(req.params.fid);
   console.log('>in alert new:' + fid);    
   res.render('alert', {fid : fid});
   */
};

// アラート登録
exports.alert.post = function(req, res, next) {

   console.log('>in alert post');
   /*
   var fid = Number(req.param.fid);  
   
   var yid = Number(req.body.yid);
   var input_date = req.body.input_date;
   var work  = req.body.work;
   var content  = req.body.content;   
   var memo = String(req.body.memo);
   console.log('>yid:' + yid + ' fid:' + fid + ' memo:' + memo	+ ' : input_date:' + input_date);   
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
   var fid = Number(req.params.fid);
	res.render('remocon', { fid : fid });  
};
exports.remoconConfirm = function(req, res){
	res.render('remoconConfirm');  
};
// 日誌一覧
exports.diaries = function(req, res){
   var fid = Number(req.params.fid);
   
   var today = new Date();
   var mm = ("0"+(today.getMonth()+1)).slice(-2);
   var last = [today.getFullYear(), mm , today.getDate()].join('-');   
   
   console.log('>in diaries:'+ req.query.last);      
   if (req.query.last) {
    	last = String(req.query.last);
   }
   res.render('diaryList', { fid : fid , last : last});  
};
// アラート一覧
exports.alerts = function(req, res){
   var fid = Number(req.params.fid);
	res.render('alertList', { fid : fid });  
};
exports.fieldInfo = function(req, res){
   	var fid = Number(req.params.fid);
   	console.log('>in fieldinfo:' +fid );    
	res.render('fieldInfo', { fid : fid });  
};

