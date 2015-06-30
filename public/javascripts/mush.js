

(function () {
   console.log('called mush.js')

 // ------------------
 // 農場一覧の動的生成
 // ------------------
 //$('#page_home').on('pagebeforeshow', function () {
 $(document).on("pagebeforeshow", "#page_home",function(event){
    // 取得したfield情報からHTMLコード片を作成する
    function markup(field) {
      var html = '<li>'
        //+ '<a href="fieldData/'+ field.fid + '", ' + 'data-tarnsition="flip">'
        + '<a href="fieldData/'+ field.fid + '/'+ field.name + '", '+ ' rel="external", data-tarnsition="flip">'
        + '<h3>' + field.name + '</h3>'
        + '</a></li>';
      return html;
    }
    
   // リストビューの内容をクリアする
   $('#fields-listview').empty();
    // JSONでトピック情報を取得する
   $.getJSON('/api/fields/100', null, function (fields) {
      // 取得したトピック情報をリストビューに追加していく
      for (var i = 0; i < fields.length; i++) {
        var subItem = markup(fields[i]);
        $('#fields-listview').append(subItem);
      }
      // リストビューを再描画する
      $('#fields-listview').listview('refresh');
   });
  });
 // ------------------
 // 農場の計測データ表示
 // ------------------
 $(document).on("pagebeforeshow", "#page_field", function(event){
    // 取得したfield情報からHTMLコード片を作成する
    var fieldID = $('#fieldData-listview').attr('fieldID');
    var fname = document.querySelector('title').text
    console.log('> page_field show fname:' + fname)
    // 計測データ
    function markup(did, fdata) {
       var html = '<li>'
        //+ '<a href="http://www.iot.blue:8087/#graph" data-transition="flip" rel="external">'
        + '<a href="/fieldGraph/'+ did + '/'+ fdata.sid + '/'+ fname + '" ' 
        + 'data-tarnsition="flip" rel="external">'               
        //+ '<a href="/fieldGraph/'+ did + '/'+ fdata.sid + '", ' + 'data-tarnsition="flip" rel="external">'        
        + '<img src="/images/thumb/' + fdata.sid + '.png" class="ui-li-icon"/>'
        + '<big>' + fdata.name+ '</big>'
        + '<span class="ui-li-aside">'
        + '<big>' + fdata.value + " " + fdata.unit +  '</big>'
        + '</a>';
        
      return html;
    }
    
   // リストビューの内容をクリアする
   $('#fieldData-listview').empty();
    // JSONでトピック情報を取得する

   $.getJSON('/api/datastreams/'+ fieldID, null, function (fieldData) {
      // 取得したトピック情報をリストビューに追加していく
      for (var i = 0; i < fieldData.length; i++) {
	    // 親機子機
        var subItem = '<li data-role="list-divider" data-icon="info">' + fieldData[i].name+ '</li>';
        $('#fieldData-listview').append(subItem);
	    // 計測データ
        for (var j = 0; j < fieldData[i].datastreams.length; j++) {
        	var subItem2 = markup(fieldData[i].did, fieldData[i].datastreams[j]);
	        $('#fieldData-listview').append(subItem2);
	    }
	    // 親なら写真
	    if (fieldData[i].kind==0) {
        	var phtml = '<li>'
        		+ '<a href="/photoList">'
        		+ '<big>写真</big></a>'
        	$('#fieldData-listview').append(phtml);
        }
        console.log ("> added field data");      
      }
      // リストビューを再描画する
      $('#fieldData-listview').listview('refresh');
   });
  });
   
 // ------------------
 // グラフデータ表示
 // ------------------
 
 $(document).on("pagebeforeshow", "#page_graph", function(event){
 
 	function drawChart() {
    	console.log("in did:" + did); 	
	    var public_key = 'BkJZJ8zlQmfMgB9m2LVpIzVQD2Z';
	    // JSONP request
	    //$.getJSON('/api/output/' + did + '/' + sid, null, function (graphData) {
	    $.getJSON('/api/output/' + did + '.json', null, function (graphData) {	    
	     var data = new google.visualization.DataTable();
	     data.addColumn('datetime', 'Time');
	     data.addColumn('number', 'h');
	     data.addColumn('number', 't');
	     data.addColumn('number', 'i');	     
	     $.each(graphData, function (i, row) {
 			console.log("graph:" + row.timestamp + ":" + row.h); 		     
	        data.addRow([
	          (new Date(row.timestamp)),
	          parseFloat(row.h),
	          parseFloat(row.t),
	          parseFloat(row.i)	          
	        ]);
	     });
	     var chart = new google.visualization.LineChart($('#grapharea').get(0));
	     chart.draw(data, {
	        title: '環境総合グラフ'
	     });
	    });
	 }


    // 取得したfield情報からHTMLコード片を作成する
    var did = $('#page_graph').attr('did');   
    var sid = $('#page_graph').attr('sid');       
    
	 // load chart lib
     google.load('visualization', '1', {
        packages: ['corechart']
     });
     // call drawChart once google charts is loaded
     google.setOnLoadCallback(drawChart);
    
  });
  
  // 
 // ------------------
 // 圃場情報表示
 // ------------------
  $(document).on("pagebeforeshow", "#page_fieldInfo",function(event){

      // リストビューの内容をクリアする
      $('#info-listview').empty();
      
      // JSONでトピック情報を取得する
      var fid = $('#info-listview').attr('fid');
      console.log(">mush info fid:"+ fid)
      $.getJSON('/api/field/' + fid, null, function (info) {
          fname = info.name;  
          console.log(">info fname:"+ fname)
          // 取得したトピック情報をリストビューに追加していく
          $('#info-listview').append('<li><h3>圃場名</h3><p>' + info.name + '</p></li>');
          var address = '<li data-icon="location">'
          		//+ '<a href="#page_map/'+ info.location + '/' + info.name + '" ' 
          		+ '<a href="/fieldMap/'+ info.location + '/' + info.name + '" '
          		+ ' class="ui-btn-icon-right" rel="external"><h3>住所</h3>' 
          		+ '<p>' + info.address + '</p></a></li>'
          $('#info-listview').append(address);
          var contact = '<li data-icon="phone">'
          		+ '<a href="tel:"' + info.contact + 'class="ui-btn-icon-right"><h3>連絡先</h3>' 
          		+ '<p>' + info.address + '</p></a></li>'
          $('#info-listview').append(contact);
          $('#info-listview').append('<li><h3>モニタ対象</h3><p>' + info.usage + '</p></li>');                              
          $('#info-listview').append('<li><h3>モニタ開始日</h3><p>' + info.date + '</p></li>');
          $('#info-listview').append('<li><h3>備考</h3><p>' + info.note + '</p></li>');          
     	 // ヘッダに値をセット
     	 document.querySelector('#fname_title').innerHTML=info.name;

     	 //リストビューを再描画する
	     $('#info-listview').listview('refresh');
     });
  }); 

 // ------------------
 // 地図表示
 // ------------------
 $(document).on("pagebeforeshow", "#page_map", function(event){
  //var address = '東京都新宿区西新宿1-1-1';
  var marker = null;
  //var geocoder = new google.maps.Geocoder();
  var options = {
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var location = $('#page_map').attr('location');  
  var fname = $('#page_map').attr('fname'); 
  document.querySelector('h1').innerHTML=fname;

  var map = new google.maps.Map(document.getElementById('map_canvas'), options);
  // ここで、地図情報から、地図描画
  //      var fid = $('#info-listview').attr('fid');
  //geocoder.geocode({ 'address': address }, function (results, status) {
      //if (status == google.maps.GeocoderStatus.OK) {
      //  var latlng = results[0].geometry.location;
          console.log('>in map show:' + location);
          var point = location.split(",");
          var latlng = new google.maps.LatLng(point[0], point[1]);
          map.setCenter(latlng);
          marker = new google.maps.Marker({
              map: map,
              position: latlng,
              title: fname
          });
      //} else {
      //   alert('Geocode was not successfull for the following reason: ' + status);
      //}
   }); 
   
 // ------------------
 // 日誌一覧表示
 // ------------------
 $(document).on("pagebeforeshow", "#page_diaryList", function(event){
    // 取得したfield情報からHTMLコード片を作成する
    var fid = $('#diary-listview').attr('fid');
    var last = $('#diary-listview').attr('last');    
	var pre_dateFormat = new DateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ");
	var post_dateFormat = new DateFormat("yyyy-MM-dd' 'HH:mm");	
	
	//　表示開始日に今日を設定
	$('#last').val(last);
	var workArray = []; 
	$.getJSON('/api/getWorkChoice', null, function (workList){
      	for (var i = 0; i < workList.length; i++) {	
			workArray.push(workList[i].label);
		}
	});
	
    // 日誌データ
    function markup(diary) {
       var d_date = pre_dateFormat.parse(diary.date);
       var d_str = post_dateFormat.format(d_date); 
       var html = '<li>'
        + '<a href=/diary/' + diary.fid + '/'+ diary.yid + ' data-tarnsition="flip">'
        + '<h3>' + d_str    + '</h3>'
        + '<p>'   + diary.content + '</p>'
        + '<p class="ui-li-aside">'+ workArray[diary.work] + '</p>'
        + '</a>';
      return html;
    }
    
   // リストビューの内容をクリアする
   $('#diary-listview').empty();
    // JSONでトピック情報を取得する

   $.getJSON('/api/diaries/'+ fid + '?last=' + last, null, function (diaryList) {
      // 取得した日誌情報をリストビューに追加していく
      for (var i = 0; i < diaryList.length; i++) {
       	var subItem = markup(diaryList[i]);
        $('#diary-listview').append(subItem);
      }
      // リストビューを再描画する
      $('#diary-listview').listview('refresh');
   });
  });   
 
// ------------------
 // 日誌表示
 // ------------------
 $(document).on("pagebeforeshow", "#page_diary", function(event){
    // 取得したyid情報からHTMLコード片を作成する

	// fid
	var fid = $('#diary').attr('fid');    
    $('#fid').val(fid);
    // diarychoice
     var myselect = $("#work_choice1");
     myselect.empty();
     $.getJSON('/api/getWorkChoice' , null, function (workList) {
        for (var i = 0; i < workList.length; i++) {
			myselect.append($('<option>').html(workList[i].label).val(workList[i].code));
        }
        myselect.selectmenu("refresh");
     });
    
    var yid = $('#diary').attr('yid');    

   if (isNaN(yid)==false) {
	   $.getJSON('/api/diary/'+ yid , null, function (diary) {
	     // 取得した日誌情報を表示
	     $('#yid').val(yid);
	     //-日付
		var pre_dateFormat = new DateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ");
		var post_dateFormat = new DateFormat("yyyy-MM-dd");	
        var d_date = pre_dateFormat.parse(diary.date);
        var d_str = post_dateFormat.format(d_date); 
	     $('#input_date').val(d_str);

	     //-作業
	     //- document.querySelector.('#work_choice'); choice
	     //var myselect = $("#work_choice1");
	     myselect[0].val = 2;
		 myselect.selectmenu("refresh");            
		 //- 内容と補足
	      document.querySelector('#content').innerHTML=diary.content;
	      document.querySelector('#memo').innerHTML=diary.memo;      
	   });
   }
  });   

 // ------------------
 // アラート一覧表示
 // ------------------
 $(document).on("pagebeforeshow", "#page_alertList", function(event){
    // 取得したfield情報からHTMLコード片を作成する
    var fid = $('#alert-listview').attr('fid');
    // アラートデータ
    
    function markup(alert) {
       var html = '<li>'
        + '<a href=/alert/' + alert.fid + '/' + alert.aid + ' data-tarnsition="flip">'
        + '<h3>' + alert.subject    + '</h3>'
        + '<p>'   + alert.name + '</p>'
        + '</a>';
      return html;
      
    }
    
   // リストビューの内容をクリアする
   $('#alert-listview').empty();
    // JSONでトピック情報を取得する

   $.getJSON('/api/alerts/'+ fid , null, function (alertList) {
      // 取得したアラート情報をリストビューに追加していく
      for (var i = 0; i < alertList.length; i++) {
       	var subItem = markup(alertList[i]);
        $('#alert-listview').append(subItem);
      }
      // リストビューを再描画する
      $('#alert-listview').listview('refresh');
   });
  });   
 
// ------------------
 // アラート表示
 // ------------------
 $(document).on("pagebeforeshow", "#page_alert", function(event){
    // 取得したyid情報からHTMLコード片を作成する
	// fid
	var fid = $('#diary').attr('fid');    
    $('#fid').val(fid);
    
    function markup(condition) {
	     //-センサ１
	     var select1 = $("#sensor_choice1");
	     select1[0].selectedValue = condition.sid;
		 select1.selectmenu("refresh");            
	     //-大小
	     var select2 = $("#rel-choice1");
	     select2[0].selectedIndex = condition.relation;
		 select2.selectmenu("refresh");            
	     // 閾値
	      document.querySelector('#threshold1').innerHTML=condition.threshold;
    }
    
    var aid = $('#alert').attr('aid');    
   if (isNaN(aid)==false) {    
	   $.getJSON('/api/alert/'+ aid , null, function (alert) {
	      //"aid": aid, "fid": fid, "uid": 20, "name": "Mie", "subject": "通知メールだよ", "conditions": [ { "did": "X01234567890123456789", "sid": "t", "relation": 0, "threshold": 30.0 } ]
	     // 取得したアラート情報を表示
	     $('#aid').val(aid);
	     
	     //-センサ１
	     var select1 = $("#sensor_choice1");
	     select1[0].selectedIndex = 2;
		 select1.selectmenu("refresh");            
	     //-大小
	     var select2 = $("#rel-choice1");
	     select2[0].selectedIndex = 2;
		 select2.selectmenu("refresh");            
	     // 閾値
	      document.querySelector('#threshold1').innerHTML=alert.threshold1;
	   });
   }
  });   
  
// スコープ終了
}).apply(this);  


