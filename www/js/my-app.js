/** App initialization, dom-variable set, mainView set, Cordova ready **/
var myApp = new Framework7();
var $$ = Dom7;
var mainView = myApp.addView('.view-main', { dynamicNavbar: true });


/*
***** Login page functions *****
*/
function nokoLogin() {
	var i_user = $('#i_user').val();
	var i_pass = MD5($('#i_pass').val());

	if (i_user.length > 0 && i_pass.length > 0) {
		$$.post('http://noko.dk/ds/server_script.php', {request: 'index', p: i_pass}, function (d) {
			var obj = JSON.parse(d);
			try {
				var d_room = obj.room;
				var d_name = obj.name;
				var l_name = d_name.toLowerCase();
				var d_mail = obj.mail;
				var d_nr = obj.nr;

				if (d_name.localeCompare(i_user) == 0 || d_mail.localeCompare(i_user) == 0 || d_room.localeCompare(i_user) == 0 || d_nr.localeCompare(i_user) == 0 || d_name.indexOf(i_user) == 0 || l_name.localeCompare(i_user)) {
					localStorage.setItem('user', i_user);
					localStorage.setItem('pass', i_pass);
					localStorage.setItem('room', d_room);

					/*setCookie("user", i_user, 10000);
					setCookie("pass", i_pass, 10000);
					setCookie("room", d_room, 10000);*/

					frontPage();
				} else {
					$('#i_login .error').show();
				}
			} catch (e) {
				$('#i_login .error').show();
			}
		});
	} else {
		$('#i_login .error').show();
	}
}
function nokoLogout() {
	myApp.closePanel();

	localStorage.removeItem('user');
	localStorage.removeItem('pass');

	/*setCookie("user","",0);
	setCookie("pass","",0);*/

	$('#i_front').hide();
	$('#i_login').show();
	$('.panel.panel-left.panel-reveal .content-block').addClass('loggedind');

	frontPage();
}


/*
***** Page functions *****
*/
function frontPage() {
	if ( (localStorage.getItem("user") != null && localStorage.getItem("pass") != null) /*||
 				(getCookie("user").length > 0 && getCookie("pass").length > 0)*/ ) {

		/*if ( getCookie("user").length > 0 && getCookie("pass").length > 0 ) {
			var user = getCookie("user");
			var pass = getCookie("pass");
		} else {*/
			var user = localStorage.getItem("user");
			var pass = localStorage.getItem("pass");
		/*}*/

		$('.loggedind').removeClass('loggedind');
		$('#i_login').hide();
		$('#i_front').show();

		$$.post('http://noko.dk/ds/server_script.php', {request: 'index', p: pass}, function (data) {
			var obj = JSON.parse(data);
			var date = new Date();
			var day = ["mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag", "søndag"];
			var day_c = [true, true, true, true, true, true, true]
			var order = ["food", "kitchen", "wash", "party"];
			var href = ["madplan", "vagtplan", "vasketider", "kalender"];

			localStorage.setItem('room', obj.room);

			// CREATING CONTENT GRID
			$('#i_front').html('<div id="ip_cnt"></div>');
			for (var i = 0; i < 4; i++) {
				$('#ip_cnt').append('<a href="' + href[i] + '.html" id="ip_' + order[i] + '"><div></div></a>')
			}

			// MADPLAN CONTENT
			$('#ip_food div').append('<img src="res/icon_food.png"/><p></p>');
			if (obj.mad) {
				$('#ip_food p').append('I da skal du have <b>' + obj.mad.toLowerCase().replace(/\.$/, "") + '</b>  til aftensmad.');
			} else {
				$('#ip_food p').append('Der er ingen mad på menuen.');
			}

			// KITCHEN PLANS CONTENT
			$('#ip_kitchen div').append('<img src="res/icon_kitchen.png"/><p></p>');
			if (obj.vagter) {
				$('#ip_kitchen p').append('Dine køkkenvagter denne måned er den ');
				var vagter = obj.vagter.split('___');
				for (var i = 0; i < vagter.length-1; i++) {
					if (i > 0) { $('#ip_kitchen p').append(', '); }
					$('#ip_kitchen p').append( vagter[i].split('__')[1] );
				}
			} else {
				$('#ip_kitchen p').append('Denne måned har du ingen køkkenvagter.');
			}

			// LAUNDRY CONTENT
			$('#ip_wash div').append('<img src="res/icon_wash.png"/><p></p>');
			if (obj.vaske) {
				$('#ip_wash p').append('Husk dine vasketider ');
				var tider = obj.vaske.split('___');
				for (var i = 0; i < tider.length-1; i++) {
					if ( day_c[tider[i].split('_')[3]-1] ) {
						if (i > 0) { $('#ip_wash p').append(', '); }
						$('#ip_wash p').append( '<b>' + day[tider[i].split('_')[3]-1] + '</b>' );
						day_c[tider[i].split('_')[3]-1] = false;
					}
				}
				$('#ip_wash p').append(' i denne uge.');
			} else {
				$('#ip_wash p').append('Du har ikke booket nogen vasketider.');
			}

			// PARTY CONTENT
			$('#ip_party div').append('<img src="res/icon_party.png"/><p></p>');
			if (obj.event_n) {
				$('#ip_party p').append('Næste noko arrangement er <b>' + obj.event_n + '</b> den <b>' + obj.event_d.substr(8,2) + '/' + obj.event_d.substr(5,2) + '</b>.');
			} else {
				$('#ip_party p').append('Der er ingen Noko arrangementer i kalenderen.');
			}

			$('#splash_logo').hide();
			$('#i_login').hide();
			$('#i_front').show();

		});
	} else {

		$('#splash_logo').hide();
		$('#i_front').hide();
		$('#i_login').show();

		window.addEventListener('keypress', function(e) {
			if (event.keyCode == '13') {
				nokoLogin();
			}
		});

	}
}
function alumniPage(sort) {
	$$.post('http://noko.dk/ds/server_script.php', {request: 'alumni', sort: sort}, function (data) {
		var obj = JSON.parse(data);
		var table_content = table_json_2d(['Nr','Navn','Img'], obj);

		$('#alumni_server').append('<div id="as_bg"></div>');
		$('#alumni_server').append('<table></table>');
		$('#alumni_server table').append(table_content['thead']);
		$('#alumni_server table').append(table_content['tbody']);

		// Provides all titles with sorting links
		$('#alumni_server table thead td').each(function (i) {
			if (i < 2) {
				$(this).html('<a href="javascript:sortAlumni(' + (i+1) + ')">' + $(this).text() + '</a>');
			} else {
				$(this).html('<a href="javascript:onlyImg()">' + $(this).text() + '</a>');
			}
		});

		// Adds invisible prefixed zeroes
		$('#alumni_server table tbody td:nth-child(1)').each(function () {
			for ($i = $(this).text().length; $i < 4; $i++) {
				$(this).prepend('<i>0</i>');
			}
		});

		// Turns all alumni numbers into image sources
		$('#alumni_server table tbody td:nth-child(3)').each(function () {
			$(this).html('<img src="http://noko.dk/ds/alumner/' + $(this).text() + '.png" onerror="this.style.display=\'none\'" style=""/>');
		});

		// Photo zoom
		$('#alumni_server table img').click(function () {
			$(this).toggleClass('floater');
			$('#alumni_server #as_bg').toggle();
		});
	});
}
function calPage() {
	$$.post('http://noko.dk/ds/server_script.php', {request: 'calendar'}, function (data) {
		var obj = JSON.parse(data);
		var keys = Object.keys(obj);
		var table_content;

		// Populates the calendar page with the year as table title
		for (var key in keys) {
			table_content = table_json_2d([' ','Event','Arrangør'], obj[keys[key]]);
			$('#cal_server').append('<h2>' + keys[key] + '</h2><table></table>');
			$('#cal_server table').append(table_content['thead']);
			$('#cal_server table').append(table_content['tbody']);
		}
	});
}
function filesPage() {
	$$.post('http://noko.dk/ds/server_script.php', {request: 'files'}, function (data) {
		var obj = JSON.parse(data);
		var pos = 0;

		$('#files_server').append('<table><tbody></tbody></table>');

		for (var i = 2; i < obj.length; i++) {
			pos = obj[i].lastIndexOf(".");
			$('#files_server tbody').append("<tr><td><a href='http://noko.dk/ds/files/" + obj[i] + "'><img src='res/type_" + obj[i].substr(pos+1,3) + ".png'/>" + obj[i].substr(0,pos) + "</a></td></tr>");
		}

		$('#files_server a').each(function () {
			$(this).attr("onclick","window.open('" + $(this).attr("href") + "', '_system')");
			$(this).attr("data-rel","external");
			$(this).attr("href","");
		});
	});
}
function gamesPage(sort) {
	$$.post('http://noko.dk/ds/server_script.php', {request: 'games', sort: sort}, function (data) {
		var obj = JSON.parse(data);
		var keys = Object.keys(obj);

		$('#games_server').append('<table><thead><tr></tr></thead><tbody></tbody></table>');

		$('#games_server thead tr').append('<td><a href="javascript:gamesPage(\"name\")">Titel</a></td>');
		$('#games_server thead tr').append('<td><a href="javascript:gamesPage(\"min_players\")">Spillere</a></td>');
		$('#games_server thead tr').append('<td><a href="javascript:gamesPage(\"min_time\")">Tid</a></td>');

		for (var key in keys) {
			$('#games_server tbody').append('<tr></tr>');

			$('#games_server tbody tr:last-child').append("<td>" + obj[keys[key]].name + "</td>");
			$('#games_server tbody tr:last-child').append("<td>" + obj[keys[key]].p_min + "-" + obj[keys[key]].p_max + "</td>");
			$('#games_server tbody tr:last-child').append("<td>" + obj[keys[key]].t_min + "-" + obj[keys[key]].t_max + "</td>");

			$('#games_server tbody tr:last-child td').each(function() {
				$(this).text( $(this).text().replace(/9999/g, "") );
			});
		}
	});
}
function kontaktPage() {
	$$.post('http://noko.dk/ds/server_script.php', {request: 'kontakt'}, function (data) {
		var obj = JSON.parse(data);
		var title = ["Kontoret", "Netværk", "Styrelsen", "Alumnerep.", "Køkken"];
		var content = [1, 5, 2, 3, 7];

		for (var i = 0; i < 5; i++) {
			$('#kontakt_server').append('<h2>' + title[i] + '</h2><div class="text_box"></div>');
			$('#kontakt_server .text_box:last-child').append(eval('obj.t' + content[i]));
		}

		$('#kontakt_server a').each(function () {
			$(this).attr("onclick","window.open('" + $(this).attr("href") + "', '_system')");
			$(this).attr("data-rel","external");
			$(this).attr("href","");
		});
	});
}
function madPage() {
	$$.post('http://noko.dk/ds/server_script.php', {request: 'mad'}, function (data) {
		var obj = JSON.parse(data);
		var keys = Object.keys(obj);
		var table_content;

		// Creates menu tables for every week provided in the database
		for (var key in keys) {
			table_content = table_json_2d(['Dag','Ret'], obj[keys[key]]);
			$('#madplan_server').append('<h2>Uge '+((parseInt(keys[key].substring(1))-24)%52+1)+'</h2><table></table>');;
			$('#madplan_server table:last-child').append(table_content['tbody']);
		}
	});
}
function vagtPage() {
	$$.post('http://noko.dk/ds/server_script.php', {request: 'vagter'}, function (data) {
		var obj = JSON.parse(data);
		var keys = Object.keys(obj);
		var mnd = ["Januar", "Februar", "Marts", "April", "Maj", "Juni", "Juli", "August", "September", "Oktober", "November", "December"];
		var table_content;

		// Populates the kitchen shift table for every month available
		for (var key in keys) {
			table_content = table_json_2d([' ','Opvask','Servering','Tidlig','Sen'], obj[keys[key]]);
			$('#vagter_server').append('<h2>' + mnd[keys[key]-1] + '</h2><table></table>');
			$('#vagter_server table:last-child').append(table_content['thead']);
			$('#vagter_server table:last-child').append(table_content['tbody']);
		}
	});
}

/* NEEDS CLEANING */
function vaskeriPage() {
	$$.post('http://noko.dk/ds/server_script.php', {request: 'vaskeri'}, function (data) {
		var obj = JSON.parse(data);
		var keys_w = [parseInt(Object.keys(obj)[0]), (parseInt(Object.keys(obj)[0])+1)%52, (parseInt(Object.keys(obj)[0])+2)%52];
		var txt = "";
		var room = localStorage.getItem("room");
		var date = new Date();
		var now = date.getHours()*60 + date.getMinutes();

		for (var w = 0; w < 3; w++) {
			$('#t_uge' + (w+1)).html('Uge ' + keys_w[w]);
			for (var n = 1; n < 4; n++) {
				//txt = '<p class="bookBtn"><a href="javascript:bookVaskeri()">Book</a></p>';
				txt = "<table class='text_box'><thead><tr class='titles'><td></td><td>M</td><td>T</td><td>O</td><td>T</td><td>F</td><td>L</td><td>S</td></tr></thead><tbody>";
				for (var t = 0; t < 18; t++) {
					txt += "<tr><td class='titles'>" + ("0" + parseInt(((360+(75*t))/60)%24)).slice(-2) + ":" + ("00" + parseInt((360+(75*t))%60)).slice(-2) + "</td>";
					for (var d = 1; d < 8; d++) {
						txt += "<td id="+keys_w[w]+"_"+n+"_"+t+"_"+d+">";
						try {
							if (obj[keys_w[w]][n][t][d] != undefined) {
								if (room == obj[keys_w[w]][n][t][d]) {
									txt += "<a href='javascript:removeVaskeri(" + obj[keys_w[w] + "_id"][n][t][d] + ")'>";
									txt += obj[keys_w[w]][n][t][d];
									txt += "</a>";
								} else {
									txt += obj[keys_w[w]][n][t][d];
								}
							} else {
								if (w == 0 && d < date.getDay() ) {
									txt += '<div class="bookBtnLate"></div>';
								} else {
									txt += '<div class="bookBtn" onclick="javascript:bookVaskeri(this)" id="'+String(keys_w[w])+'_'+String(n)+'_'+String(t)+'_'+String(d)+'_'+String(room)+'"></div>';
								}
							}
						} catch (e) {
							if (w == 0 && d < date.getDay() ) {
								txt += '<div class="bookBtnLate"></div>';
							} else {
								txt += '<div class="bookBtn" onclick="javascript:bookVaskeri(this)" id="'+String(keys_w[w])+'_'+String(n)+'_'+String(t)+'_'+String(d)+'_'+String(room)+'"></div>';
							}
						}
						txt += "</td>";
					}
					txt += "</tr>";
				}
				txt += "</tbody></table><br />";
				$('#mi_' + String(w+1) + String (n)).html(txt);
			}
		}
	});
}

/* REMOVED UNTIL AN ONLINE UPDATE METHOD EXISTS */
function udvalgPage() {
	$$.post('http://noko.dk/ds/server_script.php', {request: 'udvalg'}, function (data) {
		var obj = JSON.parse(data);
		var keys = Object.keys(obj);
		var txt = "";

		txt += "<table><thead><td>Udvalg</td><td>Formand</td></thead><tbody>";
		for (var key in keys) {
			txt += "<tr>";
			txt += "<td><a href='https://www.facebook.com/groups/" + obj[keys[key]].fb + "'>" + obj[keys[key]].name + "</a></td>";
			txt += "<td>" + obj[keys[key]].leader + "</td>";
			txt += "</tr>";
		}
		txt += "</tbody></table>";

		$('#udvalg_server').html(txt);
		$('#udvalg_server a').each(function () {
			$(this).attr("onclick","window.open('" + $(this).attr("href") + "', '_system')");
			$(this).attr("data-rel","external");
			$(this).attr("href","");
		});
	});

	$$.post('http://noko.dk/ds/server_script.php', {request: 'poster'}, function (data) {
		var obj = JSON.parse(data);
		var keys = Object.keys(obj);
		var txt = "";

		txt += "<table><thead><td>Hverv</td><td>Alumner</td></thead><tbody>";
		for (var key in keys) {
			txt += "<tr>";
			txt += "<td>" + keys[key] + "</td>";
			txt += "<td>";
			if (obj[keys[key]].p1) { txt += obj[keys[key]].p1; }
			if (obj[keys[key]].p2) { txt += "<br />" + obj[keys[key]].p2; }
			if (obj[keys[key]].p3) { txt += "<br />" + obj[keys[key]].p3; }
			if (obj[keys[key]].p4) { txt += "<br />" + obj[keys[key]].p4; }
			txt += "</td>";
			txt += "</tr>";
		}
		txt += "</tbody></table>";

		$('#poster_server').html(txt);
	});
}
function plenumPage() {
	$("#p_referat .block").load("res/referat.htm");
}


/*
***** Booking and sorting functions *****
*/
function bookVaskeri(tid_id) {
	$$.post('http://noko.dk/ds/server_script.php', {request: 'bookVaskeri', t: $(tid_id).attr("id")}, function (data) { vaskeriPage(); });
}
function removeVaskeri(id) {
	$$.post('http://noko.dk/ds/server_script.php', {request: 'removeVaskeri', i: id}, function (data) { vaskeriPage(); });
}
function sortAlumni(col) {
	$("#alumni_server tbody tr").sortElements(function(a, b){
    return $(a).find("td:nth-child("+col+")").text() > $(b).find("td:nth-child("+col+")").text() ? 1 : -1;
	});
}
function onlyImg() {
	$('#alumni_server table').toggleClass('only_img');
}


/*
***** DeviceReady and PageInit functions  *****
*/
$$(document).on('deviceready', function() { frontPage(); });
$$(document).on('pageInit', function (e) {
    var page = e.detail.page;
    if (page.name === 'index') { mainView.router.back({ url: myApp.mainView.history[0], force: true }); frontPage();
	} else if (page.name === 'madplan') { madPage();
	} else if (page.name === 'kontakt') { kontaktPage();
	} else if (page.name === 'alumni') { alumniPage('u.name');
	} else if (page.name === 'vagter') { vagtPage();
	} else if (page.name === 'vaskeri') { vaskeriPage();
	} else if (page.name === 'kalender') { calPage();
	} else if (page.name === 'plenum') { plenumPage();
	} else if (page.name === 'games') { gamesPage('name');
	} else if (page.name === 'udvalg') { udvalgPage();
	} else if (page.name === 'files') { filesPage();
	}
});
