/*
***** JSON to HTML table *****
	Coverting parsed JSON data into a 2D html table with column titles.
	Takes titles array and data array as its input arguments.
*/

var table_json_2d = function (titles, data) {

	var thead = '<thead>';
	var tbody = '<tbody>';
	
	
	/* Creating the THEAD section */
	thead += '<tr>';
	for (var title in titles) {
		thead += '<td>';
		thead += titles[title];
		thead += '</td>';
	}
	thead += '</tr>';
	
	
	/* Creating the TBODY section */
	for (var row in data) {
		tbody += '<tr>';
		for (var cell in data[row]) {
			tbody += '<td>';
			tbody += data[row][cell];
			tbody += '</td>';
		}
		tbody += '</tr>';
	}
	
	
	thead += '</thead>';
	tbody += '</tbody>';
	
	return {thead: thead, tbody: tbody};

}