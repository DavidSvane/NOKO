<?php
header('Content-type: application/json');
header('Access-Control-Allow-Origin: *');

require 'medoo-1.5.6.php';

$args = [
	'database_type' => 'mysql',
	'database_name' => 'noko_web',
	'server' => 'mysql5.gigahost.dk',
	'username' => 'noko',
	'password' => '7@aahWhd3#^Wy8YF'
];
$db = new Medoo($args);

$servername;
$username;
$password;
$dbname;
$conn;

function login() {
	global $servername, $username, $password, $dbname, $conn;
	$servername = "mysql5.gigahost.dk";
	$username = "noko";
	$password = "7@aahWhd3#^Wy8YF";
	$dbname = "noko_web";

	$conn = new mysqli($servername, $username, $password, $dbname);
	if ($conn->connect_error) { die("Connection failed: " . $conn->connect_error); }
}
function logout() {
	global $conn;
	$conn->close();
}

$request = $_POST['request'];

if ($request == 'index') {

	login();
	$sql = "SELECT pass, name, mail, uid
			FROM users
			WHERE pass='" . $_POST['p'] . "'";
	$result = $conn->query($sql);
	if ($result->num_rows > 0) { while($row = $result->fetch_assoc()) {
		$output['name'] = utf8_encode($row['name']);
		$output['mail'] = utf8_encode($row['mail']);
		$output['uid'] = utf8_encode($row['uid']);
	}}

	if (strlen($output['name']) > 1) {
		$sql = "SELECT nr
				FROM alumni_fields
				WHERE (
					uid=" . $output['uid'] . "
					AND status=0
				)";
		$result = $conn->query($sql);
		if ($result->num_rows > 0) { while($row = $result->fetch_assoc()) { $output['nr'] = utf8_encode($row['nr']); }}

		$sql = "SELECT d" . date("N") . "
				FROM kitchen_plans
				WHERE week
				LIKE '" . date('Y-m-d', strtotime(date('Y') . 'W' . date('W'))) . "%'";
		$result = $conn->query($sql);
		if ($result->num_rows > 0) { while($row = $result->fetch_assoc()) { $output['mad'] = utf8_encode($row['d' . date("N")]); }}

		$sql = "SELECT room
				FROM alumni_fields
				WHERE id
				IN (
					SELECT MAX(id)
					FROM alumni_fields
					GROUP BY uid
				)
				AND status
				IN (0,2,3,6)
				AND uid=" . $output['uid'] . "
				ORDER BY nr";
		$result = $conn->query($sql);
		if ($result->num_rows > 0) { while($row = $result->fetch_assoc()) { $output['room'] = utf8_encode($row['room']); }}

		$date = date('Y-m-01 12:00:00', time());
		$sql = "SELECT day, pid
				FROM vagtplan_felter
				WHERE (d1=" . $output['room'] . " OR d2=" . $output['room'] . ")
				AND pid IN (
					SELECT id
					FROM vagtplan_sider
					WHERE month='" . $date . "'
				)";
		$result = $conn->query($sql);
		if ($result->num_rows > 0) { while($row = $result->fetch_assoc()) { $output['vagter'] .= utf8_encode($row['pid']) . '__' . utf8_encode($row['day']) . '___'; }}

		$week = new DateTime();
		$week->setISODate(date('Y', time()), date('W', time()), 1);
		$week = $week->format('Y-m-d');
		$sql = "SELECT SUBSTRING(week,1,10) AS week, nr, day, time
				FROM laundry
				WHERE (
					room=" . $output['room'] . "
					AND week>='" . $week . "'
					)
				ORDER BY SUBSTRING(week,1,10), nr, day, time ASC";
		$result = $conn->query($sql);
		if ($result->num_rows > 0) { while($row = $result->fetch_assoc()) { $output['vaske'] .= utf8_encode($row['week'] . '_' . $row['nr'] . '_' . $row['time'] . '_' . $row['day']) . '___'; }}

		$sql = "SELECT date, name
			FROM party
			WHERE date>='2018-03-22 00:00:00'
			LIMIT 1";
		$result = $conn->query($sql);
		if ($result->num_rows > 0) { while($row = $result->fetch_assoc()) {
			$output['event_d'] = utf8_encode($row['date']);
			$output['event_n'] = utf8_encode($row['name']);
		}}
	}

	echo(json_encode($output));
	logout();

} else if ($request == 'mad') {

	login();
	$days = array('Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'L�rdag', 'S�ndag');
	$sql = "SELECT id, d1, d2, d3, d4, d5, d6, d7
			FROM kitchen_plans
			WHERE id>=(
				SELECT id
				FROM kitchen_plans
				WHERE week
				LIKE '" . date('Y-m-d', strtotime(date('Y') . 'W' . date('W'))) . "%'
			)";
	$result = $conn->query($sql);
	if ($result->num_rows > 0) {
		while($row = $result->fetch_assoc()) {
			for ($i = 1; $i < 8; $i++) {
				$output['w'.$row['id']][$i]['n'] = utf8_encode($days[($i-1)]);
				$output['w'.$row['id']][$i]['d'] = utf8_encode($row['d'.$i]);
			}
		}
	}
	echo(json_encode($output));
	logout();

} else if ($request == 'calendar') {

	login();
	$now = date('Y-m-d 00:00:00', time());
	$sql = "SELECT date, name, who FROM party WHERE date>='" . $now . "'";
	$result = $conn->query($sql);
	if ($result->num_rows > 0) { while($row = $result->fetch_assoc()) {
		$output[substr($row['date'],0,4)][$row['date']]['date'] = utf8_encode(substr($row['date'],8,2) . '/' . substr($row['date'],5,2));
		$output[substr($row['date'],0,4)][$row['date']]['name'] = utf8_encode($row['name']);
		$output[substr($row['date'],0,4)][$row['date']]['who'] = utf8_encode($row['who']);
	}}
	echo(json_encode($output));
	logout();

} else if ($request == 'kontakt') {

	login();
	$sql = "SELECT id, text
			FROM news";
	$result = $conn->query($sql);
	if ($result->num_rows > 0) { while($row = $result->fetch_assoc()) { $output['t' . $row['id']] = utf8_encode($row['text']); }}
	echo(json_encode($output));
	logout();

} else if ($request == 'alumni') {

	login();
	$sql = "SELECT u.name AS name, u.mail AS mail, a.room AS room, a.nr AS nr
			FROM users AS u
			INNER JOIN alumni_fields AS a
			ON u.uid=a.uid
			WHERE a.id IN (
				SELECT MAX(id)
				FROM alumni_fields
				GROUP BY uid
			) AND a.status IN (0,2,3,6)
			ORDER BY u.name";
	$result = $conn->query($sql);
	$count = 0;
	if ($result->num_rows > 0) { while($row = $result->fetch_assoc()) {
		$output[$count]['room'] = utf8_encode($row['room']);
		$output[$count]['name'] = utf8_encode($row['name']);
		//$output[$count]['mail'] = utf8_encode($row['mail']);
		$output[$count]['nr'] = utf8_encode($row['nr']);
		$count++;
	}}
	echo(json_encode($output));
	logout();

} else if ($request == 'vagter') {

	$output;
	login();
	for ($i = date('n', time()); $i <= intval(date('n', time()))+1; $i++) {

		$mth = substr('00' . $i, -2);
		$date = date('Y-' . $mth . '-01 12:00:00', time());
		$sql = "SELECT f.day AS day, f.d1 AS d1, f.d2 AS d2
				FROM vagtplan_felter AS f
				WHERE f.pid
				IN (
					SELECT id
					FROM vagtplan_sider
					WHERE month='" . $date . "'
				)";
		$result = $conn->query($sql);
		if ($result->num_rows > 0) { while($row = $result->fetch_assoc()) {
			if (count($output[$i][$row['day']]) < 1) {
				$output[$i][$row['day']][count($output[$i][$row['day']])] = utf8_encode($row['day'] . '/' . $i);
			}
			$output[$i][$row['day']][count($output[$i][$row['day']])] = utf8_encode($row['d1']);
			$output[$i][$row['day']][count($output[$i][$row['day']])] = utf8_encode($row['d2']);
		}}

	}
	echo(json_encode($output));
	logout();

} else if ($request == 'vaskeri') {

	$week = new DateTime();
	$week->setISODate(date('Y', time()), date('W', time()), 1);
	$week = $week->format('Y-m-d');

	login();
	$sql = "SELECT DISTINCT SUBSTRING(week, 1, 10) AS week, nr, time, day, room, id
			FROM laundry
			WHERE week>='" . $week . "'
			ORDER BY SUBSTRING(week, 1, 10), nr, time, day ASC";
	$result = $conn->query($sql);
	if ($result->num_rows > 0) { while($row = $result->fetch_assoc()) {
		$output[(int)date('W', mktime(0, 0, 0, substr($row['week'], -5, 2), substr($row['week'], -2), substr($row['week'], 0, 4)))][$row['nr']][$row['time']][$row['day']] = utf8_encode($row['room']);
		$output[(int)date('W', mktime(0, 0, 0, substr($row['week'], -5, 2), substr($row['week'], -2), substr($row['week'], 0, 4))) . "_id"][$row['nr']][$row['time']][$row['day']] = utf8_encode($row['id']);
	}}
	echo(json_encode($output));
	logout();

} else if ($request == 'bookVaskeri') {

	login();
	$t_txt = $_POST['t'];
	$times = explode('___', $t_txt);

	for ($i = 0; $i < count($times); $i++) {
		$books[$i] = explode('_', $times[$i]);
	}

	// week --> date('Y-m-d 00:00:00', strtotime(date('Y', time()) . 'W' . sprintf('%02d', $books[0][0])))
	// nr	--> $books[0][1]
	// time --> $books[0][2]
	// day	--> $books[0][3]
	// room --> $books[0][4]

	for ($j = 0; $j < count($books); $j++) {
		$sql = "INSERT INTO laundry (week, nr, time, day, room)
				VALUES ('" . date('Y-m-d 00:00:00', strtotime(date('Y', time()) . 'W' . sprintf('%02d', $books[$j][0]))) . "'," . $books[$j][1] . "," . $books[$j][2] . "," . $books[$j][3] . "," . $books[$j][4] . ")";
		$conn->query($sql);
	}
	logout();

} else if ($request == 'removeVaskeri') {

	login();
	$id = intval($_POST['i']);
	if (strlen((String)$id) == 6) {
		$sql = "DELETE FROM laundry WHERE id=" . $id;
		$conn->query($sql);
	}
	logout();

} else {
	echo(json_encode('Request variablen indeholdt ikke noget brugbart!'));
}
?>
