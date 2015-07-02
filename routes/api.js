/*
 *  API functions
 *
 *    2015.06.25  Web API(r9) and Models(r6)
 *    2015.06.30  Web API(r13) and Models(r8)
 */

var async = require('async');
var http = require('http');
var database = require('../models/database');
var api = exports;

/*
  Private functions
*/

// getLatestValues() -- Get latest datastream values from phant
function getLatestValues(publicKey, callback) {
  var urlOpts = {
    host: 'localhost',
    path: '/output/' + publicKey + '/latest.json',
    port: 8080
  };
  console.log('getLatestValues() from ', urlOpts);

  http.get(urlOpts, function (res) {
    var data = '';
    res.on('data', function (chunk) {
      data += chunk;
    }).on('end', function () {
      var s = data.toString();
      var jsonData = JSON.parse(s);
      console.log('getLatestValues(): ', s);
      if (jsonData['success'] === false) {
        callback(undefined);   // datastream not found
        return;
      }
      callback(jsonData[0]);
    });
  });
}

/*
  Fields api
*/

// listFields() -- List fields in the group
api.listFields = function(req, res) {
  if (! req.params.gid) {
    console.log('> api.listFields(): no gid');
    res.send(400, { message: 'No gid' });
    return;
  }
  var gid = Number(req.params.gid);
  if (isNaN(gid)) {
    console.log('> api.listFields(): bad gid');
    res.send(400, { message: 'Bad gid' });
    return;
  }
  console.log('> api.listFields(): ', gid);

  var fields = database.getFields();
  fields.listFields(gid, function (err, items) {
    fields.close();

    if (err && typeof err !== 'array') {
      console.log('fields.listFields() error: ', err);
      res.send(500, { message: 'Internal error' });
      return;
    }
    if (! items)
      items = err;

    console.log('> fields = ', items);
    res.json(200, items);
  });
};

// getField() -- Get the field information
api.getField = function(req, res) {
  if (! req.params.fid) {
    console.log('> api.getField(): no fid');
    res.send(400, { message: 'No fid' });
    return;
  }
  var fid = Number(req.params.fid);
  if (isNaN(fid)) {
    console.log('> api.getField(): bad fid');
    res.send(400, { message: 'Bad fid' });
    return;
  }
  console.log('> api.getField(): ', fid);

  var fields = database.getFields();
  fields.getField(fid, function (err, item) {
    fields.close();

    if (err) {
      console.log('fields.getField() error: ', err);
      res.send(500, { message: 'Internal error' });
      return;
    }
    if (! item) {
      console.log('fields.getField() not found: ', fid);
      res.send(404, { message: 'Not found' });
      return;
    }

    console.log('> field = ', item);
    res.json(200, item);
  });
};

/*
  Datastreams api
*/

// listDatastreams() -- List datastreams in the field
api.listDatastreams = function(req, res) {
  if (! req.params.fid) {
    console.log('> api.listDatastreams(): no fid');
    res.send(400, { message: 'No fid' });
    return;
  }
  var fid = Number(req.params.fid);
  if (isNaN(fid)) {
    console.log('> api.listDatastreams(): bad fid');
    res.send(400, { message: 'Bad fid' });
    return;
  }
  console.log('> api.listDatastreams(): ', fid);

  var datastreams = database.getDatastreams();
  datastreams.listDatastreams(fid, function (err, items) {
    datastreams.close();

    if (err && typeof err !== 'array') {
      console.log('fields.listDatastreams() error: ', err);
      res.send(500, { message: 'Internal error' });
      return;
    }
    if (! items || items.length === 0) {
      res.send(404, { message: 'Not found' });
      return;
    }
    console.log('> datastreams = ', items);

    var nCount = 0;

    // (1) execute sequential as follows:
    async.waterfall([
      // (1.1) manipulate data for all datastreams
      function (callback) {
        for (var i = 0; i < items.length; i++) {
          console.log('> datastreams[' + i + '/' + items.length + '] ', items[i]);
          var ii = i;

          // (2) execute sequential as follows:
          async.waterfall([
            // (2.1) eliminates unused properties
            function (callback) {
              delete items[ii]._id;
              delete items[ii].fid;
              delete items[ii].description;
              delete items[ii].deleteKey;
              callback(null, items, ii);
            },
            // (2.2) get latest values from phant
            function (items, ii, callback) {
              getLatestValues(items[ii].publicKey, function (data) {
                console.log('latestData = ', data);
                callback(null, items, data, ii);
              });
            },
            // (2.3) eliminates unused properties and add latest values
            function (items, latestData, ii, callback) {
              for (var j = 0; j < items[ii].sensors.length; j++) {
                delete items[ii].sensors[j].accuracy;
                delete items[ii].sensors[j].note;
                var sid = items[ii].sensors[j].sid;
                if (latestData !== undefined) {
                  if (latestData[sid] !== undefined)
                    items[ii].sensors[j].value = latestData[sid];
                }
              }
              callback(null, items, ii);
            }
          ],
            // (2.4) After everything has been completed, execute next step
            function (err, items, ii) {
              if (err)
                throw err;
              console.log('final items[' + ii + '] ', items[ii]);
              if (++nCount === items.length)
                callback(null, items);    // done manipulation
            }
          );   //-- end of inner async
        }   //-- end of for loop
      }
    ],
      // (1.2) return result as json
      function (err, items) {
        if (err)
          throw err;

        console.log('final items = ', items);
        res.json(200, items);
      }
    );  //-- end of outer async
  });
};

// getDatastream() -- Get the datastream information
api.getDatastream = function(req, res) {
  if (! req.params.did) {
    console.log('> api.getDatastream(): no did');
    res.send(400, { message: 'No did' });
    return;
  }
  var did = req.params.did;
  if (! req.params.sid) {
    console.log('> api.getDatastream(): no sid');
    res.send(400, { message: 'No sid' });
    return;
  }
  var sid = req.params.sid;
  console.log('> api.getDatastream(): ', did, sid);

  var datastreams = database.getDatastreams();
  datastreams.getDatastream(did, sid, function (err, item) {
    datastreams.close();

    if (err) {
      console.log('datastreams.getDatastream() error: ', err);
      res.send(500, { message: 'Internal error' }); 
      return;
    }
    if (! item) {
      console.log('datastream.getDatastream(): not found');
      res.send(404, { message: 'Not found' });
      return;
    }
    console.log('> datastream = ', item);

    var sensor = null;
    for (var i in item.sensors) {
      if (sid === item.sensors[i].sid) {
        sensor = item.sensors[i];
        break;  // found
      }
    }
    if (! sensor) {
      console.log('> api.getDatastream(): sid not found');
      res.send(404, { message: 'Not found' });
      return;
    }

    console.log('> datastream.sensors = ', sensor);
    res.json(200, sensor);
  });
};

/*
  Notices
*/

// listNotices() -- List notices 'last' latest notices
api.listNotices = function(req, res) {
  if (! req.query.last) {
    console.log('> api.listNotices(): no last');
    res.send(400, { message: 'No last' });
    return;
  }
  var last = Number(req.query.last);
  if (isNaN(last)) {
    console.log('> api.listNotices(): bad last');
    res.send(400, { message: 'Bad last' });
    return;
  }
  console.log('> api.listNotices(): ', last);

  var notices = database.getNotices();
  notices.listNotices(last, function (err, items) {
    notices.close();

    if (err && typeof err !== 'array') {
      console.log('notices.listNotices() error: ', err);
      res.send(500, { message: 'Internal error' });
      return;
    }
    if (! items)
      items = err;

    console.log('> notices = ', items);
    res.json(200, items);
  });
};

/*
  DIARY
*/

// listDiaries() -- List diaries in the field
api.listDiaries = function(req, res) {
  if (! req.params.fid) {
    console.log('> api.listDiaries(): no fid');
    res.send(400, { message: 'No fid' });
    return;
  }
  var fid = Number(req.params.fid);
  if (isNaN(fid)) {
    console.log('> api.listDiaries(): bad fid');
    res.send(400, { message: 'Bad fid' });
    return;
  }
  console.log('> api.listDiaries(): ', fid);

  var last = null, date = null;
  if (req.query.last) {
    last = Number(req.query.last);
    console.log('> api.listDiaries(last): ', last);
    //@ check last value
  }
  else if (req.query.date) {
    date = req.query.date;
    console.log('> api.listDiaries(date): ', date);
    //@ check date format and value
  }
  else {
    console.log('> api.listDiaries(): no query');
    res.send(400, { message: 'No last and date' });
    return;
  }
  
  var diaries = database.getDiaries();
  diaries.listDiaries(fid, last, date, function (err, items) {
    diaries.close();

    if (err && typeof err !== 'array') {
      console.log('diaries.listDiaries() error: ', err);
      res.send(500, { message: 'Internal error' });
      return;
    }
    if (! items) {
      res.send(404, { message: 'No diaries' });
      return;
    }

    console.log('> diaries = ', items);
    res.json(200, items);
  });
};

// getDiary() -- Get the diary information
api.getDiary = function(req, res) {
  if (! req.params.yid) {
    console.log('> api.getDiarie(): no yid');
    res.send(400, { message: 'No yid' });
    return;
  }
  var yid = Number(req.params.yid);
  if (isNaN(yid)) {
    console.log('> api.getDiary(): bad yid');
    res.send(400, { message: 'Bad yid' });
    return;
  }

  console.log('> api.getDiary(): ', yid);
  var diaries = database.getDiaries();
  diaries.getDiary(yid, function (err, item) {
    diaries.close();

    if (err) {
      console.log('diaries.getDiary() error: ', err);
      res.send(500, { message: 'Internal error' });
      return;
    }
    if (! item) {
      res.send(404, { message: 'No diary' });
      return;
    }

    console.log('> diary = ', item);
    res.json(200, item);
  });
};

// createDiary() -- Create a diary
api.createDiary = function(req, res) {
  if (! req.params.fid) {
    console.log('> api.createDiary(): no fid');
    res.send(400, { message: 'No fid' });
    return;
  }
  var fid = Number(req.params.fid);
  if (isNaN(fid)) {
    console.log('> api.createDiary(): bad fid');
    res.send(400, { message: 'Bad fid' });
    return;
  }
  var diary = {
    fid: fid,
    date: new Date(req.body.input_date),
    uid: req.session.uid,
    work: req.body.work_choice1,
    content: req.body.content,
    memo: req.body.memo,
    weather: '-',
    pid: 0
  };
  console.log('> api.createDiary(): ', diary);

  var diaries = database.getDiaries();
  diaries.createDiary(fid, diary, function (err, item) {
    diaries.close();

    if (err) {
      console.log('diaries.createDiary() error: ', err);
      res.send(500, { message: 'Internal error' });
      return;
    }
    if (! item) {
      console.log('diaries.createDiary() can not create');
      res.send(400, { message: 'Can not create' });
      return;
    }

    console.log('> result = ', item.result);
    res.redirect('/diaryList/' + fid);  //@ redirect to diary list page
  });
}

// updateDiary() -- Update the diary
api.updateDiary = function(req, res) {
  console.log('>> api.updateDiary()');
  if (! req.params.yid) {
    console.log('> api.updateDiary(): no yid');
    res.send(400, { message: 'No yid' });
    return;
  }
  var yid = Number(req.params.yid);
  if (isNaN(yid)) {
    console.log('> api.updateDiary(): bad yid');
    res.send(400, { message: 'Bad yid' });
    return;
  }
  var diary = {
    yid: yid,
    fid: req.session.field.fid,
    date: req.body.input_date,
    uid: req.session.uid,
    work: req.body.work_choice1,
    content: req.body.content,
    memo: req.body.memo,
    weather: req.body.weather,
    pid: 0
  };
  console.log('> api.updateDiary(): ', yid, diary);

  var diaries = database.getDiaries();
  diaries.updateDiary(yid, diary, function (err, item) {
    diaries.close();

    if (err) {
      console.log('diaries.updateDiary() error: ', err);
      res.send(500, { message: 'Internal error' });
      return;
    }
    if (! item) {
      console.log('diaries.updateDiary() can not update');
      res.send(404, { message: 'Can not update' });
      return;
    }

    console.log('> updated diary = ', item);
    res.redirect('/diaryList/' + fid);  //@ redirect to diary list page
    // res.send(200);
  });
}

api.deleteDiary = function(req, res) {
  if (! req.params.yid) {
    console.log('> api.deleteDiary(): no yid');
    res.send(400, { message: 'No yid' });
    return;
  }
  var yid = Number(req.params.yid);
  if (isNaN(yid)) {
    console.log('> api.deleteDiary(): bad yid');
    res.send(400, { message: 'Bad yid' });
    return;
  }
  console.log('> api.deleteDiary(): ', yid);

  var diaries = database.getDiaries();
  diaries.removeDiary(yid, function (err, numberOfRemovedDocs) {
    console.log('> diaries.removeDiary(callback): ', err);
    diaries.close();
    if (err) {
      console.log('diaries.removeDiary() error: ', err);
      res.send(500, { message: 'Internal error' });
      return;
    }
    if (numberOfRemovedDocs < 1) {
      res.send(404, { message: 'Can not remove' });
      return;
    }

    res.send(200);
  });
}

// -- ALERT -- 
api.listAlerts = function(req, res) {
  if (! req.params.fid) {
    console.log('> api.listAlerts(): no fid');
    res.send(400, { message: 'No fid' });
    return;
  }
  var fid = Number(req.params.fid);
  if (isNaN(fid)) {
    console.log('> api.listAlerts(): bad fid');
    res.send(400, { message: 'Bad fid' });
    return;
  }
  console.log('> api.listAlerts(): ', fid);

  var alerts = database.getAlerts();
  alerts.listAlerts(fid, function (err, items) {
    alerts.close();
    if (err && typeof err !== 'array') {
      console.log('alerts.listAlerts() error: ', err);
      res.send(500, { message: 'Internal error' });
      return;
    }
    if (! items) {
      res.send(404, { message: 'No alerts' });
      return;
    }

    console.log('> alerts = ', items);
    res.json(200, items);
  });
};

api.getAlert = function(req, res) {
  if (! req.params.aid) {
    console.log('> api.getAlert(): no aid');
    res.send(400, { message: 'No aid' });
    return;
  }
  var aid = Number(req.params.aid);
  if (isNaN(aid)) {
    console.log('> api.getAlert(): bad aid');
    res.send(400, { message: 'Bad aid' });
    return;
  }
  console.log('> api.getAlert(): ', aid);

  var alerts = database.getAlerts();
  alerts.getAlert(aid, function (err, item) {
    alerts.close();
    if (err) {
      console.log('alerts.getAlert() error: ', err);
      res.send(500, { message: 'Internal error' });
      return;
    }
    if (! item) {
      res.send(404, { message: 'No alert' });
      return;
    }

    console.log('> alert = ', item);
    res.json(200, item);
  });
};

api.createAlert = function(req, res) {
  if (! req.params.fid) {
    console.log('> api.createAlert(): no fid');
    res.send(400, { message: 'No fid' });
    return;
  }
  var fid = Number(req.params.fid);
  if (isNaN(fid)) {
    console.log('> api.createAlert(): bad fid');
    res.send(400, { message: 'Bad fid' });
    return;
  }
  console.log('> api.createAlert(): ', fid);

  var aid = fid * 100;
  var body = {
    "aid": aid
  };

  console.log('> body = ', body);
  res.send(200, body);
}

api.updateAlert = function(req, res) {
  if (! req.params.aid) {
    console.log('> api.updateAlert(): no aid');
    res.send(400, { message: 'No aid' });
    return;
  }
  var aid = Number(req.params.aid);
  if (isNaN(aid)) {
    console.log('> api.updateAlert(): bad aid');
    res.send(400, { message: 'Bad aid' });
    return;
  }
  console.log('> api.updateAlert(): ', aid);

  res.send(200);
}

api.deleteAlert = function(req, res) {
  if (! req.params.aid) {
    console.log('> api.deleteAlert(): no aid');
    res.send(400, { message: 'No aid' });
    return;
  }
  var aid = Number(req.params.aid);
  if (isNaN(aid)) {
    console.log('> api.deleteAlert(): bad aid');
    res.send(400, { message: 'Bad aid' });
    return;
  }
  console.log('> api.deleteAlert(): ', aid);

  res.send(200);
}

/** choices **/
api.listChoices = function(req, res) {
  if (! req.params.fid) {
    console.log('> api.listChoices(): no fid');
    res.send(400, { message: 'No fid' });
    return;
  }
  var fid = Number(req.params.fid);
  if (isNaN(fid)) {
    console.log('> api.listChoices(): bad fid');
    res.send(400, { message: 'Bad fid' });
    return;
  }
  console.log('> api.listChoices(): ', fid);

  var choices = database.getChoices();
  choices.listChoices(fid, function (err, items) {
    console.log('> listChoices(callback): ', err);
    choices.close();
    if (err && typeof err !== 'array') {
      console.log('choices.listChoices() error: ', err);
      res.send(500, { message: 'Internal error' });
      return;
    }
    if (! items)
      items = err;

    console.log('> choices = ', items);
    res.json(200, items);
  });
};

/** data **/
// Get datastream values from phant
function getSensorValues(publicKey, callback) {
  var urlOpts = {
    host: 'localhost',
    path: '/output/' + publicKey + '.json' + '?page=1',
    port: 8080
  };
  console.log('getSensorValues() from ', urlOpts, publicKey);

  http.get(urlOpts, function (res) {
    var data = '';
    res.on('data', function (chunk) {
      data += chunk;
    }).on('end', function () {
      var s = data.toString();
      var jsonData = JSON.parse(s);
      console.log('getSensorValues(): ', s);
      if (jsonData['success'] === false) {
        callback('can not get datastream', undefined);   // datastream not found
        return;
      }

      callback(null, jsonData);
    });
  });
}

api.getData = function(req, res) {
  if (! req.params.did) {
    console.log('> api.getData(): no did');
    res.send(400, { message: 'No did' });
    return;
  }
  var did = req.params.did;
  if (! req.params.sid) {
    console.log('> api.getData(): no sid');
    res.send(400, { message: 'No sid' });
    return;
  }
  var sid = req.params.sid;
  console.log('> api.getData(): ', did, sid);

  getSensorValues(did, function (err, items) {
    console.log('> getSensorValues(callback): ', err);
    if (err && typeof err !== 'array') {
      console.log('data.SensorValues() error: ', err);
      res.send(500, { message: 'Internal error' });
      return;
    }
    if (! items)
      items = err;
    console.log('> items = ', items);

    var data = [];
    for (var i = 0; i < items.length; i++) {
      var d = new Date();
      var item = [ Date.parse(items[i].timestamp), Number(items[i][sid]) ];
      data.push(item);
    }
    console.log('> data = ', [data]);

    res.send(200, [data]);
  });
};

// -END-
