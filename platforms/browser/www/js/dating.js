// INFO: RETURNS WEEK NUMBER FROM DATE IN ISO FORMAT 'YYYY-mm-dd hh:mm:ss'
function weekFromISO(date) {

  var d = new Date(date);
  var f = new Date(d.getFullYear(),0,4);

  // INFO: SET HOURS TO ZEROES FOR CORRECT CALCULATION
  d.setHours(0,0,0,0);

  // INFO: GET THURSDAY IN CURRENT WEEK SHIFTED SO SUNDAY != 0
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);

  // INFO: RETURN CALCULATED WEEK NUMBER FROM 'd' AND 'f'
  return 1 + Math.round(((d.getTime() - f.getTime()) / 86400000 - 3 + (f.getDay() + 6) % 7) / 7);

}


// INFO: RETURN A FORMATTED STRING DESCRIBING DATE AND TIME FROM 'YYYY-mm-dd hh:mm:ss'
function dtFormat(datetime, kl=true) {

  var months = ['Januar','Februar','Marts','April','Maj','Juni','Juli','August','September','Oktober','November','December'];

  var year = datetime.substr(0,4);
  var month = months[parseInt(datetime.substr(5,2))-1].toLowerCase();
  var date = datetime.substr(8,2);

  var hours = datetime.substr(11,2);
  var minutes = datetime.substr(14,2);

  if (kl) {
    return date + '. ' + month + ' ' + year + ' kl. ' + hours + ':' + minutes;
  } else {
    return date + '. ' + month + ' ' + year + ' ' + hours + ':' + minutes;
  }

}
