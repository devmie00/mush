/*
 *  API functions
 */
var api = exports;
///api/groups/
api.listFields = function(req, res) {
  if (! req.params.gid) {
    console.log('> api.listFields(): no gid');
    res.send(400);
    return;
  }
  var gid = Number(req.params.gid);
  if (isNaN(gid)) {
    console.log('> api.listFields(): bad gid');
    res.send(400);
    return;
  }
  console.log('> api.listFields(): ', gid);
  var body = [
    { "fid": 100, "name": "テスト圃場100", "numberOfDatastreams": 1 },
    { "fid": 200, "name": "テスト圃場200", "numberOfDatastreams": 3 },
    { "fid": 300, "name": "テスト圃場300", "numberOfDatastreams": 1 },
    { "fid": 400, "name": "テスト圃場400", "numberOfDatastreams": 4 },
    { "fid": 500, "name": "テスト圃場500", "numberOfDatastreams": 1 }
  ];
  res.send(200, body);
  return;
};

api.getField = function(req, res) {
  if (! req.params.fid) {
    console.log('> api.getField(): no fid');
    res.send(400);
    return;
  }
  var fid = Number(req.params.fid);
  if (isNaN(fid)) {
    console.log('> api.getField(): bad fid');
    res.send(400);
    return;
  }
  console.log('> api.getField(): ', fid);
  var body = {
    "fid": fid,
    "gid": 3,
    "name": "何たら圃場",
    "address": "東京都中野区中野100",
    "contact": "03-0000-0000",
    "usage": "キノコ栽培",
    "location": "35.706272,139.665658",
    "date": "2015-05-31T20:07:50.000Z",
    "note": "テスト圃場",
    "dids": [ "2gV1ppKPzLUvJO226Z5W", "lqkRb3zaKoHn6wEgLzox", "vqPDB2A60AfnP7zXl6BZ" ]
  };
  res.send(200, body);
  return;
};

api.listDatastreams = function(req, res) {
  if (! req.params.fid) {
    console.log('> api.getDatastreams(): no fid');
    res.send(400);
    return;
  }
  var fid = Number(req.params.fid);
  if (isNaN(fid)) {
    console.log('> api.getDatastreams(): bad fid');
    res.send(400);
    return;
  }
  console.log('> api.getDatastreams(): ', fid);
  var body = [
    {
      "did": "2gV1ppKPzLUvJO226Z5W", "name": "親機", "kind": 0, "publicKey": "2gV1ppKPzLUvJO226Z5W",
      "sensors": [
        { "sid": "t", "name": "温度", "unit": "C", "value": 21.3 },
        { "sid": "h", "name": "湿度", "unit": "%", "value": 67.2 },
        { "sid": "i", "name": "照度", "unit": "lux", "value": 0 },
        { "sid": "co2", "name": "CO2濃度", "unit": "ppm", "value": 560 } ]
    },
    {
      "did": "lqkRb3zaKoHn6wEgLzox", "name": "子機1", "kind": 1, "publicKey": "lqkRb3zaKoHn6wEgLzox",
      "sensors": [
        { "sid": "t", "name": "温度", "unit": "C", "value": 23.1 },
        { "sid": "h", "name": "湿度", "unit": "%", "value": 47.1 },
        { "sid": "i", "name": "照度", "unit": "lux", "value": 1 }
      ]
    },
    {
      "did": "vqPDB2A60AfnP7zXl6BZ", "name": "子機2", "kind": 1, "publicKey": "vqPDB2A60AfnP7zXl6BZ",
      "sensors": [
        { "sid": "t", "name": "温度", "unit": "C", "value": 23.2 },
        { "sid": "h", "name": "湿度", "unit": "%", "value": 47.2 },
        { "sid": "i", "name": "照度", "unit": "lux", "value": 2 }
      ]
    }
  ];
  res.send(200, body);
  return;
};

api.getDatastream = function(req, res) {
  if (! req.params.did) {
    console.log('> api.getDatastream(): no did');
    res.send(400);
    return;
  }
  //var did = Number(req.params.did); mori
  //if (isNaN(did)) {
//    console.log('> api.getDatastream(): bad did');
//    res.send(400);
//    return;
//  }
  var did = String(req.params.did);  
  if (! req.params.sid) {
    console.log('> api.getDatastream(): no sid');
    res.send(400);
    return;
  }
  console.log('> api.getDatastream(): ', did);
  var body = {
    "sid": req.params.sid, "object": "気温", "name": "温度",
    "unit": "C", "accuracy": "+/-0.5C", "note": "SHT-21"
  };
  res.send(200, body);
  return;
};

api.listNotices = function(req, res) {
  if (! req.query.last) {
    console.log('> api.getNotices(): no last');
    res.send(400);
    return;
  }
  var last = Number(req.query.last);
  if (isNaN(last)) {
    console.log('> api.getNotices(): bad last');
    res.send(400);
    return;
  }
  console.log('> api.getNotices(): ', last);
  var body = [
    { "nid": 10, "from": "2015-05-30T00:00:00.000Z", "until": "2015-06-03T23:59:59.000Z", "notice": "サービス停止のお知らせ：来る5/30から6/3までサービスが停止しますのでお知らせします。" },
    { "nid": 11, "from": "2015-06-03T00:00:00.000Z", "until": "2015-06-05T23:59:59.000Z", "notice": "サービス停止のお知らせ：来る6/3から6/5までサービスが停止しますのでお知らせします。" }
  ];
  res.send(200, body);
  return;
};

api.getData = function(req, res) {
  if (req.query.last) {
    var last = req.query.last;
    console.log('> api.getData(): ', last);
  }
  else if (req.query.date) {
    var from = req.query.date;
    console.log('> api.getData(): ', from);
  }
  var body = [
    { "t": "20.0", "h": "40.0", "i": "0", "timestamp": "2015-05-31T10:00:00.000Z" },
    { "t": "20.1", "h": "40.1", "i": "1", "timestamp": "2015-05-31T10:05:00.000Z" },
    { "t": "20.2", "h": "40.2", "i": "2", "timestamp": "2015-05-31T10:10:00.000Z" },
    { "t": "20.3", "h": "40.3", "i": "3", "timestamp": "2015-05-31T10:10:00.000Z" },
    { "t": "20.4", "h": "40.4", "i": "4", "timestamp": "2015-05-31T10:15:00.000Z" },
    { "t": "20.5", "h": "40.5", "i": "5", "timestamp": "2015-05-31T10:20:00.000Z" },
    { "t": "20.6", "h": "40.6", "i": "6", "timestamp": "2015-05-31T10:25:00.000Z" },
    { "t": "20.7", "h": "40.7", "i": "7", "timestamp": "2015-05-31T10:30:00.000Z" },
    { "t": "20.8", "h": "40.8", "i": "8", "timestamp": "2015-05-31T10:35:00.000Z" },
    { "t": "20.9", "h": "40.9", "i": "9", "timestamp": "2015-05-31T10:40:00.000Z" }
  ];
  res.send(200, body);
  return;
};

//-- DIARY --
api.listDiaries = function(req, res) {
  if (! req.params.fid) {
    console.log('> api.getDiaries(): no fid');
    res.send(400);
    return;
  }
  var fid = Number(req.params.fid);
  if (isNaN(fid)) {
    console.log('> api.getDiaries(): bad fid');
    res.send(400);
    return;
  }
  console.log('> api.getDiaries(): ', fid);
  if (req.query.last) {
    var last = req.query.last;
    console.log('> api.getDiaries(): ', last);
  }
  else if (req.query.date) {
    var from = req.query.date;
    console.log('> api.getDiaries(): ', from);
  }
  else {
    console.log('> api.getDiaries(): no query');
    res.send(400);
    return;
  }

  var body = [
    { "yid": 100, "fid": fid, "date": "2015-06-06T10:30:00.000Z", "uid": 20, "work": 1, "content": "云たら農薬を30L", "memo": "暑い一日", "pid": 0 },
    { "yid": 101, "fid": fid, "date": "2015-06-07T15:00:00.000Z", "uid": 20, "work": 1, "content": "云たら農薬2を10L", "memo": "寒い一日", "pid": 0 },
    { "yid": 102, "fid": fid, "date": "2015-06-08T06:00:00.000Z", "uid": 20, "work": 4, "content": "沢山とったで", "memo": "長い一日", "pid": 0 }
  ];
  res.send(200, body);
  return;
};

api.getDiary = function(req, res) {
  if (! req.params.yid) {
    console.log('> api.getDiarie(): no yid');
    res.send(400);
    return;
  }
  var yid = Number(req.params.yid);
  if (isNaN(yid)) {
    console.log('> api.getDiary(): bad yid');
    res.send(400);
    return;
  }
  console.log('> api.getDiary(): ', yid);
  var fid = (yid / 10) + 1;
  var body = {
     "yid": yid, "fid": fid, "date": "2015-06-06T10:30:00.000Z", "uid": 20, "work": 3, "content": "云たら農薬を30L", "memo": "暑い一日", "pid": 0
  };
  res.send(200, body);
  return;
};

api.createDiary = function(req, res) {
  if (! req.params.fid) {
    console.log('> api.createDiary(): no fid');
    res.send(400);
    return;
  }
  var fid = Number(req.params.fid);
  if (isNaN(fid)) {
    console.log('> api.createDiary(): bad fid');
    res.send(400);
    return;
  }
  console.log('> api.createDiary(): ', fid);
  var yid = fid * 10;
  var body = {
    "yid": yid
  };
  res.send(200, body);
  return;
}

api.updateDiary = function(req, res) {
// 暫定、yidもbodyに変更　mori
  if (! req.body.yid) {
    console.log('> api.updateDiary(): no yid');
    res.send(400);
    return;
  }
  var yid = Number(req.body.yid);
  if (isNaN(yid)) {
    console.log('> api.updateDiary(): bad yid');
    res.send(400);
    return;
  }
  console.log('> api.updateDiary(): ', yid);
  res.send(200);
  return;
}

api.deleteDiary = function(req, res) {
  if (! req.params.yid) {
    console.log('> api.deleteDiary(): no yid');
    res.send(400);
    return;
  }
  var yid = Number(req.params.yid);
  if (isNaN(yid)) {
    console.log('> api.deleteDiary(): bad yid');
    res.send(400);
    return;
  }
  console.log('> api.deleteDiary(): ', yid);
  res.send(200);
  return;
}

// -- ALERT -- 
api.listAlerts = function(req, res) {
  if (! req.params.fid) {
    console.log('> api.getAlerts(): no fid');
    res.send(400);
    return;
  }
  var fid = Number(req.params.fid);
  if (isNaN(fid)) {
    console.log('> api.getAlerts(): bad fid');
    res.send(400);
    return;
  }
  console.log('> api.getAlerts(): ', fid);
  var body = [
    { "aid": 8000, "fid": fid, "uid": 20, "name": "Mie", "subject": "通知メールだよ", "conditions": [ { "did": "X01234567890123456789", "sid": "t", "relation": 0, "threshold": 30.0 } ] },
    { "aid": 8001, "fid": fid, "uid": 20, "name": "Mie", "subject": "通知メールだよ", "conditions": [ { "did": "Y01234567890123456789", "sid": "h", "relation": 1, "threshold": 60.0 } ] },
    { "aid": 8002, "fid": fid, "uid": 20, "name": "Mie", "subject": "通知メールだよ(AND編)", "conditions": [
      { "did": "Y01234567890123456789", "sid": "h", "relation": 1, "threshold": 60.0 },
      { "did": "Z01234567890123456789", "sid": "i", "relation": 2, "threshold": 10000 }
      ]
    }
  ];
  res.send(200, body);
  return;
};

api.getAlert = function(req, res) {
  if (! req.params.aid) {
    console.log('> api.getAlert(): no aid');
    res.send(400);
    return;
  }
  var aid = Number(req.params.aid);
  if (isNaN(aid)) {
    console.log('> api.getAlert(): bad aid');
    res.send(400);
    return;
  }
  console.log('> api.getAlert(): ', aid);
  var fid = (aid / 10) + 1;
  var body = {
    "aid": aid, "fid": fid, "uid": 20, "name": "Mie", "subject": "通知メールだよ", "conditions": [ { "did": "X01234567890123456789", "sid": "t", "relation": 0, "threshold": 30.0 } ]
  };
  res.send(200, body);
  return;
};

api.createAlert = function(req, res) {
  if (! req.params.fid) {
    console.log('> api.createAlert(): no fid');
    res.send(400);
    return;
  }
  var fid = Number(req.params.fid);
  if (isNaN(fid)) {
    console.log('> api.createAlert(): bad fid');
    res.send(400);
    return;
  }
  console.log('> api.createAlert(): ', fid);
  var aid = fid * 100;
  var body = {
    "aid": aid
  };
  res.send(200, body);
  return;
}

api.updateAlert = function(req, res) {
  if (! req.params.aid) {
    console.log('> api.updateAlert(): no aid');
    res.send(400);
    return;
  }
  var aid = Number(req.params.aid);
  if (isNaN(aid)) {
    console.log('> api.updateAlert(): bad aid');
    res.send(400);
    return;
  }
  console.log('> api.updateAlert(): ', aid);
  res.send(200);
  return;
}

api.deleteAlert = function(req, res) {
  if (! req.params.aid) {
    console.log('> api.deleteAlert(): no aid');
    res.send(400);
    return;
  }
  var aid = Number(req.params.aid);
  if (isNaN(aid)) {
    console.log('> api.deleteAlert(): bad aid');
    res.send(400);
    return;
  }
  console.log('> api.deleteAlert(): ', aid);
  res.send(200);
  return;
}

api.listChoices = function(req, res) {
  console.log('> api.getWorkChoice(): ');
  var body = [ 
 	{"code":1, "label":"農薬散布" },
	{"code":2, "label":"水やり" },
	{"code":3,"label":"収穫"},
	{"code":4,"label":"草取り"},
	{"code":5,"label":"見回り"},
	{"code":6,"label":"その他"}
  ];
  
  res.send(200, body);
  return;
}


