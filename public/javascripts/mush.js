//
//  mush.js -- 
//

(function () {

 // ------------------
 // ホーム画面
 // ------------------
 $(document).on("pagebeforeshow", "#page_home", function(event) {
   var gid = $('#page_home').attr('gid');

   // 取得したnotices情報からHTMLコード片を作成する
   function makeNotice(notice) {
     var html = '<li>' + notice.notice + '</li>';
     return html;
   }
    
   // リストビューの内容をクリアする
   $('#notices-listview').empty();

    // JSONでフィールド情報を取得する
   $.getJSON('/api/notices?last=3' , null, function (notices) {
      // 取得したnotices情報をリストビューに追加していく
      for (var i = 0; i < notices.length; i++) {
        var subItem = makeNotice(notices[i]);
        $('#notices-listview').append(subItem);
      }
      if (notices.length === 0 ) {
        $('#notices-title').append('<h3>お知らせ</h3>');
      }
      else {
        $('#notices-title').append('<h3>お知らせ<span "ui-li-count">' + notices.length + '</span></h3>');
	//  $('#notices-listview').append('<h3>お知らせ<span "ui-li-count">' + notices.length + '</span></h3>');
      }
      // リストビューを再描画する
     // $('#notices-listview').listview('refresh');
   })
   .error(function(jqXHR, textStatus, errorThrown) {
	console.log("[ERR]-" + textStatus + ":" + jqXHR.responseText);
   });

   // 取得したfield情報からHTMLコード片を作成する
   function markup(field) {
     var html = '<li>'
        + '<a href="fieldData/'+ field.fid + '/'+ field.name + '", '
        + ' data-tarnsition="flip">'
        + '<h3>' + field.name + '</h3>'
        + '</a></li>';
     return html;
   }
    
   // リストビューの内容をクリアする
   $('#fields-listview').empty();

    // JSONでフィールド情報を取得する
   $.getJSON('/api/groups/' + gid + '/fields', null, function (fields) {
      // 取得したフィールド情報をリストビューに追加していく
      for (var i = 0; i < fields.length; i++) {
        var subItem = markup(fields[i]);
        $('#fields-listview').append(subItem);
      }
      // リストビューを再描画する
      $('#fields-listview').listview('refresh');
   })
   .error(function(jqXHR, textStatus, errorThrown) {
	console.log("[ERR]-" + textStatus + ":" + jqXHR.responseText);
   });
 });

 // ------------------
 // 圃場画面
 // ------------------
 $(document).on("pagebeforeshow", "#page_field", function(event){
   // 取得したfield情報からHTMLコード片を作成する
   var fid = $('#page_field').attr('fieldID');
   var fname = $('#page_field').attr('fname');

   $('#field_title').val(fname);
   document.querySelector('#field_title').innerHTML=fname;

   // センサリスト
   function markup(did, sensor) {
     var html = '<li>'
       + '<a href="/fieldGraph/'+ did + '/'+ sensor.sid + '/'+ sensor.unit + '" ' 
       + 'data-tarnsition="flip" rel="external">' 
       + '<img src="/images/thumb/' + sensor.sid + '.png" class="ui-li-icon"/>'
       + '<big>' + sensor.name + '</big>'
       + '<span class="ui-li-aside">';
       if (! sensor.value)
         html += '<big>' + "- " + sensor.unit +  '</big>';
       else
         html += '<big>' + sensor.value + " " + sensor.unit +  '</big>';
       html += '</a></li>';
     return html;
   }
    
   // リストビューの内容をクリアする
   $('#fieldData-listview').empty();

   // JSONでデータストリーム情報を取得する
   $.getJSON('/api/fields/'+ fid +'/datastreams', null, function (datastreams) {
     // 取得したトピック情報をリストビューに追加していく
     for (var i = 0; i < datastreams.length; i++) {
	     // 親機子機
       var subItem = '<li data-role="list-divider">' + datastreams[i].name + '</li>';
       $('#fieldData-listview').append(subItem);
	     // 計測データ
       for (var j = 0; j < datastreams[i].sensors.length; j++) {
         var subItem2 = markup(datastreams[i].did, datastreams[i].sensors[j]);
	       $('#fieldData-listview').append(subItem2);
	     }
	     // 親なら写真
	     if (datastreams[i].kind === 0) {
         var phtml = '<li data-icon="star">'
           + '<a href="/photoList">'
           + '<img src="/images/thumb/camera.png" class="ui-li-icon"/>'
           + '<big>写真</big></a></li>';
         $('#fieldData-listview').append(phtml);
       }
     }
     // リストビューを再描画する
     $('#fieldData-listview').listview('refresh');

   })
   .error(function(jqXHR, textStatus, errorThrown) {
	console.log("[ERR]-" + textStatus + ":" + jqXHR.responseText);
   });
 });
   
 // ------------------
 // グラフ画面
 // ------------------
  $.jqplot.config.enablePlugins = true;

  $(document).on("pageshow", "#page_graph", function (event) {
    var did = $('#page_graph').attr('did');
    var sid = $('#page_graph').attr('sid');
    var fname = $('#page_graph').attr('fname');
    var opts = {
      title: sid + ' のグラフ(' + fname + ')',
      series: [
        {
          label: '計測値',
          showMarker: true
        }
      ],
      axes: {
        xaxis: {
          // label:'時刻',
          renderer: $.jqplot.DateAxisRenderer,
          tickOptions: {
            formatString: '%H:%M'
          }
        },
        yaxis: {
          // label: 'y軸ラベル',
          labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
          tickRenderer: $.jqplot.CanvasAxisTickRenderer,
        }
      },
      seriesColors: [
        'red'
      ],
      /**
      highlighter: {
        show: false,
        showMarker: true,
        tooltipLocation: 'n',
        tooltipAxes: 'xy'
      },
      **/
      /**
      cursor: {
        zoom: false,
        show: true,
        showTooltip: true,
        tooltipLocation: 'ne'
      }
      **/
    };

    // JSONで情報を取得する
    $.getJSON('/api/data/' + did + '/' + sid, null, function (data) {
      plot = $.jqplot("grapharea", data, opts);
   })
   .error(function(jqXHR, textStatus, errorThrown) {
	console.log("[ERR]-" + textStatus + ":" + jqXHR.responseText);
    });
  });

  $(window).on("orientationchange", function(e){
    plot.replot();
  });

  $(document).on("pagehide", "#page_graph", function(e){
    plot.destroy();
  });

 // ------------------
 // 圃場情報画面
 // ------------------
  $(document).on("pagebeforeshow", "#page_fieldInfo", function(event) {

    // リストビューの内容をクリアする
    $('#info-listview').empty();
      
    // JSONでフィールド情報を取得する
    var fid = $('#info-listview').attr('fid');
    $.getJSON('/api/fields/' + fid, null, function (info) {
      //document.querySelector('h1').innerHTML=fname;
      // 取得した項目をリストビューに追加していく
      $('#info-listview').append('<li><h3>圃場名</h3><p>' + info.name + '</p></li>');
      $('#info-listview').append('<li data-icon="star">'
        + '<a href="/fieldMap/'+ info.location + '" '
       	+ ' class="btn-icon-right" rel="external"><h3>住所</h3>' 
       	+ '<p>' + info.address + '</p></a></li>');
      $('#info-listview').append('<li data-icon="check">'
      	+ '<a href="tel:' + info.contact + '" class="ui-btn-icon-right"><h3>連絡先</h3>' 
       	+ '<p>' + info.contact + '</p></a></li>');
      $('#info-listview').append('<li><h3>モニタ対象</h3><p>' + info.usage + '</p></li>');                              
      $('#info-listview').append('<li><h3>モニタ開始日</h3><p>' + info.date +  '</p></li>');
      $('#info-listview').append('<li><h3>備考</h3><p>' + info.note + '</p></li>');          
     	// ヘッダに値をセット
     	document.querySelector('#fname_title').innerHTML=info.name;

     	//リストビューを再描画する
	    $('#info-listview').listview('refresh');
   })
   .error(function(jqXHR, textStatus, errorThrown) {
	console.log("[ERR]-" + textStatus + ":" + jqXHR.responseText);
    });
  }); 

  // ------------------
  // 地図画面
  // ------------------
  $(document).on("pagebeforeshow", "#page_map", function(event) {
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
  // 日誌一覧画面
  // ------------------
  $(document).on("pagebeforeshow", "#page_diaryList", function(event) {
    // 取得したfield情報からHTMLコード片を作成する
    var fid = $('#diary-listview').attr('fid');
    var last = $('#diary-listview').attr('last');    
    var pre_dateFormat = new DateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ");
    var post_dateFormat = new DateFormat("yyyy-MM-dd' 'HH:mm");	
	
	  //　表示開始日に今日を設定
	  $('#last').val(last);
	  var workArray = []; 
	  $.getJSON('/api/fields/' + fid + '/choices', null, function (workList) {
      for (var i = 0; i < workList.length; i++) {	
		    workArray.push(workList[i].label);
      }
     })
     .error(function(jqXHR, textStatus, errorThrown) {
	 console.log("[ERR]-" + textStatus + ":" + jqXHR.responseText);      
     });

    // 日誌データ
    function markup(diary) {
      var d_date = pre_dateFormat.parse(diary.date);
      var d_str = post_dateFormat.format(d_date); 
      var html = '<li>'
        + '<a href=/diary/' +  diary.yid + ' data-tarnsition="flip">'
        + '<h3>' + d_str    + '</h3>'
        + '<p>'   + diary.content + '</p>'
        + '<p class="ui-li-aside">'+ workArray[(diary.work-1)] + '</p>'
        + '</a>';
      return html;
    }
    
    // リストビューの内容をクリアする
    $('#diary-listview').empty();

    // JSONで日誌情報を取得する
    $.getJSON('/api/fields/'+ fid + '/diaries?last=' + last, null, function (diaryList) {
      // 取得した日誌情報をリストビューに追加していく
      for (var i = 0; i < diaryList.length; i++) {
   	    var subItem = markup(diaryList[i]);
        $('#diary-listview').append(subItem);
      }
      // リストビューを再描画する
      $('#diary-listview').listview('refresh');
   })
   .error(function(jqXHR, textStatus, errorThrown) {
	console.log("[ERR]-" + textStatus + ":" + jqXHR.responseText);
    });
  });
 
 // ------------------
 // 日誌画面
 // ------------------
  $(document).on("pagebeforeshow", "#page_diary", function(event) {
    // 取得したyid情報からHTMLコード片を作成する
      var fid = $('#page_diary').attr('fid');    
      var yid = $('#page_diary').attr('yid');    
      $('#fid').val(fid);

    // choice情報の取得
    var myselect = $("#work_choice1");
    myselect.empty();
    $.getJSON('/api/fields/' + fid +'/choices', null, function (workList) {
      for (var i = 0; i < workList.length; i++) {
		    myselect.append($('<option>').html(workList[i].label).val(workList[i].code));
      }
      myselect.selectmenu("refresh");
   })
   .error(function(jqXHR, textStatus, errorThrown) {
	console.log("[ERR]-" + textStatus + ":" + jqXHR.responseText);
    });
      if (! isNaN(yid)) {
 	  $.getJSON('/api/diaries/'+ yid, null, function (diary) {
	      // 取得した日誌情報を表示
	      $('#yid').val(yid);
	      //-日付
	      var pre_dateFormat = new DateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ");
	      var post_dateFormat = new DateFormat("yyyy-MM-dd");	
	      var d_date = pre_dateFormat.parse(diary.date);
	      var d_str = post_dateFormat.format(d_date); 
	      $('#input_date').val(d_str);
	      // writer
	      $('#writer').val(diary.uid);	      
	      //-作業
	      myselect.val(diary.work-1);
	      myselect.selectmenu("refresh");            
	      //- 内容と補足
	      document.querySelector('#content').innerHTML=diary.content;
	      document.querySelector('#memo').innerHTML=diary.memo;      
	    });
    }
  });   

 // ------------------
 // アラート一覧画面
 // ------------------
  $(document).on("pagebeforeshow", "#page_alertList", function(event) {
    // 取得したalert情報からHTMLコード片を作成する
    var fid = $('#alert-listview').attr('fid');

    // アラートデータ
    function markup(alert) {
      var html = '<li>'
        + '<a href=/alert/' + alert.aid + ' data-tarnsition="flip">'
        + '<h3>' + alert.subject    + '</h3>'
        + '<p>'   + alert.name + '</p>'
        + '</a>';
      return html;
    }
    
    // リストビューの内容をクリアする
    $('#alert-listview').empty();
  
    // JSONでトピック情報を取得する
    $.getJSON('/api/fields/'+ fid + '/alerts', null, function (alertList) {
      // 取得したアラート情報をリストビューに追加していく
      for (var i = 0; i < alertList.length; i++) {
        var subItem = markup(alertList[i]);
        $('#alert-listview').append(subItem);
      }
      // リストビューを再描画する
      $('#alert-listview').listview('refresh');
   })
   .error(function(jqXHR, textStatus, errorThrown) {
	console.log("[ERR]-" + textStatus + ":" + jqXHR.responseText);
    });
  });   
 
  // ------------------
  // アラート画面
  // ------------------
  $(document).on("pagebeforeshow", "#page_alert", function(event) {
    // 取得したyid情報からHTMLコード片を作成する
    var fid = $('#page_alert').attr('fid');    
    $('#fid').val(fid);
    
    var aid = $('#page_alert').attr('aid');    
    if (! isNaN(aid)) {    
	    $.getJSON('/api/alerts/'+ aid , null, function (alert) {
	      // 取得したアラート情報を表示
	      $('#aid').val(aid);
	      var condition = alert.conditions[0];
	      //-センサ１
	      var select1 = $("#sensor_choice1");
		select1.val(condition.sid);
		select1.selectmenu("refresh");            
	      //-大小
	      var select2 = $("#rel-choice1");

		select2.val(condition.relation);
		select2.selectmenu("refresh");            
	      // 閾値
	      document.querySelector('#threshold1').innerHTML=condtion.threshold;
	    })
	    .error(function(jqXHR, textStatus, errorThrown) {
		console.log("[ERR]-" + textStatus + ":" + jqXHR.responseText);
	    });
    }
  });   
  
// スコープ終了
}).apply(this);  

