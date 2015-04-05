//require(["jquery", "jquery-ui"], function ($,ui) {
define( function () {
	/*---------------------------------------------------------------------------------
	// function: loadFloydsZone
	// args: none
	// return: none
	// use: loads all the divisions, buttons and assets for the game
	//-------------------------------------------------------------------------------*/
	loadFloydsZone = function() {
		// Load the Checkers Zone (using JQuery, because appending to the DOM fragment should be faster than doing a javascript .innerHTML=, and having it rebuild the whole DOM)
		var floyds_zone = $("#floydsZone");
		floyds_zone.append("<br><h1>WELCOME TO FLOYD'S ALGORITHM</h1>");				// Floyd's Zone title
		floyds_zone.append("<br><table align='center'><tr><td style='height:75px'>\
							  <p id='floydInstruc'>Instructions Go Here</p></td></tr></table><br>");	// The play instructions
							  
		// The 'Init' submenu
		floyds_zone.append("<div id='floydsInit'><\div>");								// The root of the 'floydsInit' menu
		var floyds_init = $("#floydsInit");
		floyds_init.append("<button id='addNode' >Add Node</button>");					// 'Add Node' button
		floyds_init.append("<button id='startAlgo' >Start</button>");					// 'Start' button


		// The map for node-link matrix
		floyds_zone.append("<div id='mapDiv'><\div>");									// The root of the 'mapDiv'
		var floyds_map = $("#mapDiv");
		floyds_map.append("<table id='mapTable' align='center'></table>");				// The nested root of the 'mapTable' text boxes
			var floyds_map_table = $("#mapTable");
			floyds_map_table.append("<tr id='mapHead'><td></td></tr>");					// The header row for the table

			// Start with two nodes
			var initial_nodes = 2, node_num;
			for(node_num = 0; node_num < initial_nodes; node_num++) {
				addNodeToTable();
			}
		
						  
		// Initial instructions
		$('#floydInstruc').html('Each box represents a link between two nodes in the system. You can add up to 5 nodes.<br>\
								 Then enter positive numbers in each of the non-zero cells. Hit Start when you\'re ready to run the algorithm.');
		


		// Associate functions with buttons
		$(function(){
			$("#addNode").click(function(){
				fadeToText('#floydInstruc','Add up to 5, then enter positive numbers in each of the non-zero cells.');
				addNodeToTable();
			})
		})

		$(function(){
			$("#startAlgo").click(function(){
//				fadeToText('#playInstruc','Oh man, this is so great. I can\'t wait to get back to it!');
				startAlgo();
			})
		})

	}
	
	
	var row_count = 0;
	addNodeToTable = function() {
		var floyds_map_head = $("#mapHead");
		var floyds_map_table = $("#mapTable");
		
		// Re-fetch the row count
		row_count = ($("#mapTable tr").length)-1;	// Subtract one for the header row

		if(row_count < 5) {
		
			// Add an entry to the header (for new column)
			floyds_map_head.append("<th><font color='red'>" + (row_count+1) + "</font></th>");
			
			// Add a new column entry for each existing row
			var row_idx;
			for(row_idx = 0; row_idx < row_count; row_idx++) {
				var row_name = "#row-" + (row_idx+1);
				$(row_name).append(getInputBoxHTML(row_idx+1, row_count+1));
			}
			
			// Add a new row at the bottom
			var new_row_name = "row-" + (row_count+1);
			floyds_map_table.append("<tr id='" + new_row_name + "'><td><font color='red'>" + (row_count+1) + "</font></td></tr>");	// this includes the marker for the node number
			var column_idx;
			var new_row = $("#" + new_row_name);
			// Assemble the row
			for(column_idx = 0; column_idx < (row_count+1); column_idx++) {
				new_row.append(getInputBoxHTML(row_count+1, column_idx+1));
			}

			// Update the row count (for other uses)
			row_count++; 
		} else {
			fadeToText('#floydInstruc','Sorry, 5 nodes is the max for now.');
		}
	}

	getInputBoxHTML = function(row, column) {
		var read_only = (row === column) ? "readonly":"";
/*	
		return ("<td id='cell-" + row + "-" + column + "'>" + row + "-to-" + column + "<br>\
				 <input id='dist-" + row + "-" + column + "' type='number' \
				 value=" + ((row === column) ? 0:1) + " \
				 style='width: 10px; padding: 2px; border: 1px solid black' \
				 " + read_only + "></td>");
*/				 
		return ("<td id='cell-" + row + "-" + column + "'>\
		         <input id='dist-" + row + "-" + column + "' type='text' \
				 value=" + ((row === column) ? 0:1) + " \
				 style='width: 25px; height: 20px; padding: 2px; border: 1px solid black' \
				 " + read_only + "></td>");
	}

	var matrix = [];
	startAlgo = function() {
		// Copy all values to behind-the-scenes so they can't continue to alter them.
		var row_idx;
		for(row_idx = 0; row_idx < row_count; row_idx++) {
			var col_idx;
			var new_row = [];
			for(col_idx = 0; col_idx < row_count; col_idx++) {
				var box_name = "#dist-" + (row_idx+1) + "-" + (col_idx+1);
				var value = $(box_name).val();
				new_row.push(value);
			}
			matrix.push(new_row);
		}
		console.log(matrix);
		
		// Then replace all input boxes with raw numbers, so it's obvious they can't alter them.
		for(row_idx = 1; row_idx <= row_count; row_idx++) {
			for(col_idx = 1; col_idx <= row_count; col_idx++) {
				var cell_name = "#cell-" + row_idx + "-" + col_idx;
				$(cell_name).html(matrix[row_idx-1][col_idx-1]);
			}
		}
	}
	
	
	/*---------------------------------------------------------------------------------
	// function: fadeToText
	// args: none
	// return: none
	// use: executes a 1000ms fade from one text string to another on an HTML string
	//-------------------------------------------------------------------------------*/
	fadeToText = function(elementKey, newString) {
		$(elementKey).fadeOut(500, function() {
				$(this).html(newString).fadeIn(500);
			});		
	}


	
	return this;	
});
