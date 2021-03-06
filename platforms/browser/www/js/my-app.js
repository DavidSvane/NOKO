﻿/** App initialization, dom-variable set, mainView set, Cordova ready **/
var myApp = new Framework7();
var $$ = Dom7;
var mainView = myApp.addView('.view-main', { dynamicNavbar: true });


/* LOGIN PAGE */
function nokoLogin() {

	var user = $('#login_user').val();
	var pass = MD5($('#login_pass').val());

  if ( user.length < 1 || pass.length < 1 ) { return; }

  $.post('http://noko.dk/server/verify.php', {usr: user, pas: pass}, function (data) {

    if ( data.length < 42 ) { $('#cnt_login .error').show(); return; }

    var obj = JSON.parse(data);

    window.localStorage.setItem('user', obj[0].nr);
    window.localStorage.setItem('salt', obj.salt);
    window.localStorage.setItem('room', obj[0].room);

    $('#cnt_login').hide();
    $('#cnt_front').hide();
    $('#splash_logo').show();
    load('index');

  });

}
function nokoLogout() {

	myApp.closePanel();

	window.localStorage.removeItem('user');
	window.localStorage.removeItem('salt');

	$('#cnt_front').hide();
	$('#splash_logo').hide();
	$('#cnt_login').show();
	load('index');

}


/* SPECIAL FUNCTIONS */
function bookLaundry(week, day, nr, time) {

  book_id = week+'_'+day+'_'+nr+'_'+time;
  $.post('http://noko.dk/server/db.php', {page: "laundry_book", nr: window.localStorage.getItem('user'), room: window.localStorage.getItem('room'), bid: book_id}, function (data) {
    window.localStorage.setItem('active', $('#cnt_laundry div:visible').attr("tnt_tab"));
    load('laundry', true);
   });

}
function removeLaundry(book_id) {

  $.post('http://noko.dk/server/db.php', {page: "laundry_remove", nr: window.localStorage.getItem('user'), room: window.localStorage.getItem('room'), bid: book_id}, function (data) {
    window.localStorage.setItem('active', $('#cnt_laundry div:visible').attr("tnt_tab"));
    load('laundry', true);
  });

}
function toggleFoodFavorite(add, week, day) {

  var p = add ? "food_fav_add" : "food_fav_remove";

  $.post('http://noko.dk/server/db.php', {page: p, w: week, d: day, nr: localStorage.getItem('user'), ver: 1}, function (data) {

    $('#cnt_mash .mash_food i').toggle();

  });

}
function incr(n) {

  n = (n + 2) % 140;

  if (n < 2) {
    n += 1;
  }

  return n;

}



/* PAGES */
function load(p, reload=false) {

  var user = window.localStorage.getItem('user');

  if ( window.localStorage.getItem('user') != null && window.localStorage.getItem('salt') != null ) {

    var user = window.localStorage.getItem('user');
    var room = window.localStorage.getItem('room');
    var salt = window.localStorage.getItem('salt');

    $.post('http://noko.dk/server/verify.php', {usr: user, sal: salt}, function (data) {

      if ( data.length < 42 ) { return; }

      $.post('http://noko.dk/server/app.php', {page: p, nr: user, rm: room}, function (data) {

        console.log(data);

        if ( data.length < 21 ) { return; }

        var obj = JSON.parse(data);
        var dage = ['Mandag','Tirsdag','Onsdag','Torsdag','Fredag','Lørdag','Søndag'];
        var mths = ['Januar','Februar','Marts','April','Maj','Juni','Juli','August','September','Oktober','November','December'];
        var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        var dinm = [31,28,31,30,31,30,31,31,30,31,30,31];

        switch(p) {

          case 'index':
            console.log(obj);
            var week_nr = weekFromISO(obj['food'][0]['week'].replace(/-/g,'/'));
            var day_nr = Object.keys(obj['food'][0])[2].substr(1);

            $('#cnt_front').html("");
            $('#cnt_front').append('<div id="cnt_mash"></div><div id="cnt_news"></div>');

            if (obj['food'][0][0] != null) {
              $('#cnt_mash').append('<div class="mash_food"><i class="material-icons">favorite_border</i><i class="material-icons">favorite</i><a href="food.html">I dag skal du have '+obj['food'][0][0]+'.</a></div>');

              $('#cnt_mash .mash_food i:first-of-type').click(function (e) { toggleFoodFavorite(true, week_nr, day_nr); });
              $('#cnt_mash .mash_food i:last-of-type').click(function (e) { toggleFoodFavorite(false, week_nr, day_nr); });

              $.post('http://noko.dk/server/db.php', {page: "food_favs", nr: localStorage.getItem('user'), ver: 1}, function (data) {

                var favs = JSON.parse(data)[0];
                console.log(favs);

                for (var i = 0; i < favs.length; i++) {
                  if (favs[i].week == week_nr && favs[i].day == day_nr) {
                    $('#cnt_mash .mash_food i').toggle();
                    break;
                  }
                }
              });

            } else {
              $('#cnt_mash').append('<a href="food.html" class="mash_food">I dag står der ingen mad på menuen.</a>');
            }

            if (obj['shifts'].length > 0) {
              $('#cnt_mash').append('<a href="shifts.html" class="mash_shifts">Husk dine køkkenvagter denne måned.</a>');
            } else {
              $('#cnt_mash').append('<a href="shifts.html" class="mash_shifts">Du har ingen køkkenvagter denne måned.</a>');
            }

            if (obj['laundry'].length > 0) {
              $('#cnt_mash').append('<a href="laundry.html" class="mash_laundry">Husk dine vasketider denne uge.</a>');
            } else {
              $('#cnt_mash').append('<a href="laundry.html" class="mash_laundry">Du har ingen bookede vasketider denne uge.</a>');
            }

            if (obj['party'][0][1] != null) {
              $('#cnt_mash').append('<a href="calendar.html" class="mash_party">Næste NOKO-arrangement er '+obj['party'][0][1]+' den '+obj['party'][0][0].substr(8,2)+'/'+obj['party'][0][0].substr(5,2)+'.</a>');
            } else {
              $('#cnt_mash').append('<a href="calendar.html" class="mash_party">Der er ingen NOKO-arrangementer den kommende tid.</a>');
            }

            $('#splash_logo').hide();
            $('#cnt_login').hide();
            $('#cnt_front').show();

            $.post('http://noko.dk/server/app.php', {page: 'news', ver: 1, nr: user}, function (data) {

              if ( data.length > 42 ) {

                var news = JSON.parse(data);
                console.log(news);
                var appendix = "";

                news.forEach(function (e) {

                  appendix = '<div ';
                  if (e.link != null) { appendix += 'onclick="javascript:window.open(\''+e.link+'\', \'_system\')"'; }
                  appendix += 'class="item news_block p'+e.priority+'"';
                  if (e.img != null) { appendix += ' style="background-image: url(\''+e.img+'\')"'; }
                  appendix += '><div class="information"><div class="titles dotdotdot">'+e.title+'</div>';
                  appendix += '<div id="ddd_'+e.id+'" class="descriptions multidots"></div>';
                  appendix += '<div class="spacetime dotdotdot">'+dtFormat(e.time)+' '+e.place+'</div></div></div>';

                  $('#cnt_news').append( appendix );
                });

              }

            });
            break;

          case 'food':
            $('#cnt_'+p).html("");

            obj.forEach(function (e) {
              $('#cnt_'+p).append('<h1>Uge '+weekFromISO(e['week'].replace(/-/g,'/'))+'</h1><table cellspacing=0></table>');
              for (var i = 0; i < 7; i++) { $('#cnt_'+p+' table:last-child').append('<tr><td>'+dage[i]+'</td><td>'+e['d'+(i+1)]+'</td></tr>'); }
            });
            break;

          case 'shifts':
            var year = obj[0].year;
            var month = obj[0].month - 1;
            var days = dinm[month];

            $('#cnt_'+p).html("<h1>"+mths[month]+" "+year+"</h1>");
            $('#cnt_'+p).append("<table><tr><td>Dato</td><td>Servering</td><td>Opvask</td><td>Tidlig</td><td>Sen</td></tr></table>");

            obj = JSON.parse(obj[0].setting);
            var alumni = obj.alumni;
            var closed = obj.closed;
            var extra = obj.extra;
            var only = obj.only;

            var a1 = parseInt(obj.saften);
            var a2 = a1 + 2;
            var mc = parseInt(obj.smorgen);

            for (var i = 0; i < days; i++) {
              $('#cnt_'+p+' table').append('<tr class="r_'+i+'"><td c_0>'+(i+1)+'.</td></tr>');
              for (var j = 1; j < 5; j++) {
                $('#cnt_'+p+' table tr:last-of-type').append('<td class="c_'+j+'"></td>');
              }
            }

            for (var i = 0; i < days; i++) {
              while (alumni.includes(a1)) { a1 = incr(a1); a2 = incr(a1); }
              while (alumni.includes(a2)) { a2 = incr(a2); }

              if (closed.includes(i+1)) { continue; }

              if (!only.includes(i+1)) {
                $('#cnt_'+p+' .r_'+i+' .c_1').html(a1);
                a1 = incr(a1);
                $('#cnt_'+p+' .r_'+i+' .c_2').html(a2);
                a2 = incr(a2);
              }

              var weekend = new Date(months[month]+" "+(i+1)+", "+year+" 12:00:00");
              if ((weekend.getDay() + 6) % 7 > 4 || extra.includes(i+1) || only.includes(i+1)) {
                while (alumni.includes(mc)) { mc = incr(mc); }
                $('#cnt_'+p+' .r_'+i+' .c_3').html(mc);
                mc = incr(mc);

                while (alumni.includes(mc)) { mc = incr(mc); }
                $('#cnt_'+p+' .r_'+i+' .c_4').html(mc);
                mc = incr(mc);
              }
            }

            console.log(obj);
            break;

          case 'laundry':
            var date = new Date();
            var week = weekFromISO(date);
            var ds = ["Tid","M","T","O","T","F","L","S"];
            var room = window.localStorage.getItem('room');
            var curr_day = date.getDay();
            var curr_time = Math.floor(((date.getHours()*60)+date.getMinutes()-360)/75)+2;
            var timer = 360;
            $('#cnt_'+p).html("");

            for (var i = week+2; i > week-1; i--) {
              $('#cnt_'+p).prepend('<h1><a href="javascript:$(\'#cnt_laundry div\').hide(); $(\'.w_'+i+'\').toggle();">Uge '+i+'</a></h1>');
              $('#cnt_'+p).append('<div class="w_'+i+'" tnt_tab="'+(i-week)+'"><h2>Uge '+i+'</h2></div>');
            }

            for (var j = 1; j < 4; j++) { $('#cnt_'+p+' div').append('<h3>Maskine '+j+'</h3><table class="m_'+j+'" tnt_table="'+(j-1)+'" cellspacing=0></table>'); }
            for (var j = 0; j < 19; j++) { $('#cnt_'+p+' table').append('<tr class="t_'+j+'" tnt_row="'+j+'"></tr>'); }
            for (var j = 0; j < 8; j++) { $('#cnt_'+p+' tr').append('<td class="d_'+j+'" tnt_col="'+j+'"></td>'); }

            for (var j = 0; j < 8; j++) { $('#cnt_'+p+' tr:first-child td:nth-child('+(j+1)+')').text( ds[j] ); }
            for (var j = 2; j < 20; j++) {
              $('#cnt_'+p+' tr:nth-child('+j+') td:first-child').text(('0'+Math.floor(timer/60)%24).substr(-2)+':'+('0'+timer%60).substr(-2));
              timer += 75;
            }

            obj.forEach(function (e) {
              if ( parseInt(e['user']) == room ) {
                $('#cnt_'+p+' .w_'+weekFromISO(e['week'].replace(/-/g,'/'))+' .m_'+e['nr']+' .t_'+(parseInt(e['time'])+1)+' .d_'+e['day']).html( '<a id="b_'+e['id']+'" class="owner" onclick="javascript:removeLaundry('+e['id']+')">'+e['user']+'</a>' );
              } else {
                $('#cnt_'+p+' .w_'+weekFromISO(e['week'].replace(/-/g,'/'))+' .m_'+e['nr']+' .t_'+(parseInt(e['time'])+1)+' .d_'+e['day']).text( e['user'] );
              }
            });

            // INFO: ADDING BOOKING BUTTONS
            $('#cnt_'+p+' td:empty').html('<a class="availables"></a>');
            $('.availables').each(function (e) {
              if ( $(this).closest("div").attr("tnt_tab") == 0 && (($(this).closest("td").attr("tnt_col") < curr_day) || ($(this).closest("td").attr("tnt_col") == curr_day && $(this).closest("tr").attr("tnt_row") < curr_time)) ) {
                $(this).remove();
              } else {
                $(this).click(function (e) {
                  bookLaundry(
                    parseInt($(this).closest("div").attr("tnt_tab")),
                    parseInt($(this).closest("td").attr("tnt_col")),
                    parseInt($(this).closest("table").attr("tnt_table"))+1,
                    parseInt($(this).closest("tr").attr("tnt_row")-1)
                  );
                });
              }
            });

            if (reload) {
              $('#cnt_'+p+' div').hide();
              $('#cnt_'+p+' .w_'+(parseInt(window.localStorage.getItem('active')) + week)).show();
            }
            break;

          case 'alumni':
            var gangs = ["Stuen Nord", "1. Nord", "2. Nord", "3. Nord", "4. Nord", "5. Nord", "Stuen Syd", "1. Syd", "2. Syd", "3. Syd", "4. Syd", "5. Syd"];
            var gang = {1:0, 3:0, 5:0, 7:0, 9:0, 11:0, 13:0, 15:0, 17:0, 19:0, 21:0, 23:0, 25:1, 27:1, 29:1, 31:1, 33:1, 35:1, 37:1, 39:1, 41:1, 43:2, 45:2, 47:2, 49:2, 51:2, 53:2, 55:2, 57:2, 59:2, 61:2, 63:2, 65:2, 67:3, 69:3, 71:3, 73:3, 75:3, 77:3, 79:3, 81:3, 83:3, 85:3, 87:3, 89:3, 91:3, 93:3, 95:3, 97:4, 99:4, 101:4, 103:4, 105:4, 107:4, 109:4, 111:4, 113:4, 115:4, 117:4, 119:4, 121:4, 123:4, 125:4, 127:5, 129:5, 131:5, 133:5, 135:5, 137:5, 139:5, 2:6, 4:6, 6:6, 8:6, 10:6, 12:6, 14:6, 16:6, 20:7, 22:7, 24:7, 26:7, 28:7, 30:7, 32:7, 34:7, 36:7, 38:7, 40:7, 42:7, 44:8, 46:8, 48:8, 50:8, 52:8, 54:8, 56:8, 58:8, 60:8, 62:8, 64:8, 66:8, 68:9, 70:9, 72:9, 74:9, 76:9, 78:9, 80:9, 82:9, 84:9, 86:9, 88:9, 90:9, 92:10, 94:10, 96:10, 98:10, 100:10, 102:10, 104:10, 106:10, 108:10, 110:10, 112:10, 114:10, 116:11, 118:11, 120:11, 122:11};

            $('#cnt_'+p).html("");

            gangs.forEach(function (g,i) {
              $('#cnt_'+p).append('<h1>'+g+'</h1><table class="gang_'+i+'" cellspacing=0></table>');
            });

            obj.forEach(function (e) {
              $('#cnt_'+p+' .gang_'+gang[e['room']]).append('<tr><td><img src="http://noko.dk/ds/alumner/'+e['nr']+'.jpg" onerror="javascript:$(this).remove()"/></td><td>'+e['room']+'</td><td>'+e['name']+'</td></tr>')
            });

            $('#cnt_'+p+' tr').each( function () { $(this).click( function () {
              $(this).find('img').toggleClass('big_view');
            })});
            break;

          case 'calendar':
            var year = "";
            var half = "";
            var h = ['Forår','Efterår'];

            $('#cnt_'+p).html("");

            obj.forEach(function (e) {
              if (e['date'].substr(0,4) != year) {
                year = e['date'].substr(0,4);
                $('#cnt_'+p).append('<h1>'+year+'</h1>');
              }

              if (Math.ceil(parseInt(e['date'].substr(5,2))/6) != half) {
                half = Math.ceil(parseInt(e['date'].substr(5,2))/6);
                $('#cnt_'+p).append('<h2>'+h[half-1]+'</h2>');
                $('#cnt_'+p).append('<table cellspacing=0></table>');
              }

              $('#cnt_'+p+' table:last-child').append('<tr><td>'+e['date'].substr(8,2)+'/'+e['date'].substr(5,2)+'</td><td>'+e['name']+'</td></tr>');
              if (e['who'].length > 0) { $('#cnt_'+p+' table:last-child tr:last-child td:last-child').append('<i> af '+e['who']+'</i>'); }
            });
            break;

          case 'guides':
            $('#cnt_'+p).html("");

            obj.forEach(function (e) {
              $('#cnt_'+p).append('<h1><a href="javascript:$(\'#guide_'+e['id']+'\').toggle()">'+e['title']+'</a></h1>');
              $('#cnt_'+p).append('<div id="guide_'+e['id']+'">'+e['content']+'</div>');
            });
            break;

        }

      });

    });

  } else {

    $('#splash_logo').hide();
		$('#cnt_front').hide();
		$('#cnt_login').show();

  }

}


/* DEVICE READY AND PAGE INITIALIZED */
$$(document).on('deviceready', function() { load('index'); });
$$(document).on('pageInit', function (e) {

  var page = e.detail.page.name;
  if (page == 'index') { mainView.router.back({ url: myApp.mainView.history[0], force: true }); }
  load(page);

});
