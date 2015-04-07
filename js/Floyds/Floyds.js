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
		floyds_zone.append("<div id='floydsInit'></div>");								// The root of the 'floydsInit' menu
		var floyds_init = $("#floydsInit");
		floyds_init.append("<button id='addNode' >Add Node</button>");					// 'Add Node' button
		floyds_init.append("<button id='startAlgo' >Start</button>");					// 'Start' button

		// The action zone during algorithm
		floyds_zone.append("<div id='floydsPlay'></div>");								// The root of the 'floydsPlay' menu
		var floyds_play = $('#floydsPlay');
		floyds_play.append("<button id='floydsStep'>Step</button>");					// The step button (this is used to take one more step in the sequence)
		$("#floydsPlay").hide();
		
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
		
		// The maps for D and S
		floyds_zone.append("<div id='floydsDS' align='center'></div>");					// The root of 'floydsDS' (filled in by createBoxes())
						  
		// Initial instructions
		$('#floydsInstruc').html('Each box represents a link between two nodes in the system. You can add up to 5 nodes.<br>\
								  Then enter positive numbers in each of the non-zero cells. Hit Start when you\'re ready to run the algorithm.');
		


		// Associate functions with buttons
		$(function(){
			$("#addNode").click(function(){
				fadeToText('#floydsInstruc','Add up to 5, then enter positive numbers in each of the non-zero cells.');
				addNodeToTable();
			})
		})

		$(function(){
			$("#startAlgo").click(function(){
				fadeToText('#floydsInstruc','Hit (Step) for all phases of algo.');
				$("#floydsInit").slideUp('slow');
				$("#floydsPlay").slideDown('slow');
				startAlgo();
			})
		})
		
		

		$(function(){
			$("#floydsStep").click(function(){
				floydsStep();
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
			fadeToText('#floydsInstruc','Sorry, 5 nodes is the max for now.');
		}
	}

	getInputBoxHTML = function(row, column) {
		var read_only = (row === column) ? "readonly":"";
		return ("<td id='cell-" + row + "-" + column + "'>\
		         <input id='dist-" + row + "-" + column + "' type='text' \
				 value=" + ((row === column) ? 0:1) + " \
				 style='width: 25px; height: 20px; padding: 2px; border: 1px solid black' \
				 " + read_only + "></td>");
	}

	var algoState = {
		initTable: 1,
		stepTable: 2,
		newTables: 3
	};
	var cur_algo_state;
	
	var D_matrix_list = [];
	var S_matrix_list = [];
	startAlgo = function() {
		// Copy all values to behind-the-scenes so they can't continue to alter them.
		var D_matrix = [];
		var row_idx, col_idx;
		for(row_idx = 0; row_idx < row_count; row_idx++) {
			var new_row = [];
			for(col_idx = 0; col_idx < row_count; col_idx++) {
				var box_name = "#dist-" + (row_idx+1) + "-" + (col_idx+1);
				var value = $(box_name).val();
				new_row.push(value);
			}
			D_matrix.push(new_row);
		}
		console.log(D_matrix);
		
		// Then replace all input boxes with raw numbers, so it's obvious they can't alter them.
		for(row_idx = 1; row_idx <= row_count; row_idx++) {
			for(col_idx = 1; col_idx <= row_count; col_idx++) {
				var cell_name = "#cell-" + row_idx + "-" + col_idx;
				$(cell_name).html(D_matrix[row_idx-1][col_idx-1]);
			}
		}
		
		// Add the D_matrix to the D_matrix_list
		D_matrix_list.push(D_matrix);

		
		// Create the first S_matrix
		var S_matrix = [];
		for(row_idx = 0; row_idx < row_count; row_idx++) {
			var new_row = [];
			for(col_idx = 0; col_idx < row_count; col_idx++) {
				new_row.push((row_idx === col_idx) ? -1:(col_idx+1));
			}
			S_matrix.push(new_row);
		}
		console.log(S_matrix);
		S_matrix_list.push(S_matrix);
		
		// Create the first D and S boxes
		createBoxes(0);
		
		// Set the first algo state
		cur_algo_state = algoState.initTable;
	}
	
	var f_i, f_j, f_k;	// The variables used in Floyd's Algo (annotated as 'f_i/j/k' to avoid confusion with regular iterators 'i/j/k')
	createBoxes = function(floyds_iteration)
	{
		// Set iterators to initial state for this pass (k) of the algorithm
		f_i = f_j = 0;
		f_k = floyds_iteration;

		// Set the stage for DS boxes
		var DS_iter_table = $("<table id='DS-" + f_k + "'></table>");
		$("#floydsDS").append(DS_iter_table);
		DS_iter_table.append("<tr></tr>");			// Create a row, which the D(k) and S(k) can go into
		var D_cell = $("<td></td>");
		DS_iter_table.append(D_cell);
		var S_cell = $("<td></td>");
		DS_iter_table.append(S_cell);
		
		// Add D box		
		var D_table = $("<table id='D-" + f_k + "'></table>");											// The D box for floyds_iteration (f_k)
		D_cell.append(D_table);
		var D_head = $("<tr id='Dhead-" + f_k + "'><td class='DS-box'>D<sub>" + f_k + "</sub></td></tr>");	// The table head with D(k) in the upper left corner
		D_table.append(D_head);	
		// Build the column labels
		var row_idx, col_idx;
		for(col_idx = 0; col_idx < row_count; col_idx++) {
			D_head.append("<td class='DS-box'><font color='red'>" + (col_idx+1) + "</font></td>");
		}
		// Build the table rows (with row labels)
		for(row_idx = 0; row_idx < row_count; row_idx++) {
			var D_row = $("<tr id='Drow-" + f_k + "-" + (row_idx+1) + "'>\
			              <td class='DS-box'><font color='red'>" + (row_idx+1) + "</font></td></tr>"); // The row with label on the left
			D_table.append(D_row);
			for(col_idx = 0; col_idx < row_count; col_idx++) {
				if(row_idx === col_idx) {
					D_row.append("<td class='DS-box' id='Dcell-" + f_k + "-" + (row_idx+1) + "-" + (col_idx+1) + "'>-</td>");
				} else {
					D_row.append("<td class='DS-box' id='Dcell-" + f_k + "-" + (row_idx+1) + "-" + (col_idx+1) + "'> </td>");
				}
			}
		}
		//console.log(document.getElementById("DS-0"));
	
		// Add S box	
		var S_table = $("<table id='S-" + f_k + "'></table>");						// The S box for floyds_iteration (f_k)
		S_cell.append(S_table);
		var S_head = $("<tr id='Shead-" + f_k + "'><td class='DS-box'>S<sub>" + f_k + "</sub></td></tr>");	// The table head with S(k) in the upper left corner
		S_table.append(S_head);	
		// Build the column labels
		var row_idx, col_idx;
		for(col_idx = 0; col_idx < row_count; col_idx++) {
			S_head.append("<td class='DS-box'><font color='red'>" + (col_idx+1) + "</font></td>");
		}
		// Build the table rows (with row labels)
		for(row_idx = 0; row_idx < row_count; row_idx++) {
			var S_row = $("<tr id='Srow-" + f_k + "-" + (row_idx+1) + "'>\
			              <td class='DS-box'><font color='red'>" + (row_idx+1) + "</font></td></tr>"); // The row with label on the left
			S_table.append(S_row);
			for(col_idx = 0; col_idx < row_count; col_idx++) {
				if(row_idx === col_idx) {
					S_row.append("<td class='DS-box' id='Scell-" + f_k + "-" + (row_idx+1) + "-" + (col_idx+1) + "'>-</td>");
				} else {
					S_row.append("<td class='DS-box' id='Scell-" + f_k + "-" + (row_idx+1) + "-" + (col_idx+1) + "'> </td>");
				}
			}
		}
		//console.log(document.getElementById("DS-0"));
	}
	
	floydsStep = function() {
		if(cur_algo_state === algoState.initTable) {
			console.log(cur_algo_state);
			console.log(f_k);
			if(f_k === 0) {
				fadeToText('#floydsInstruc','Let\'s set the initial iteration-0 values.<br>\
				                             D<sub>0</sub> is filled with all the values in the initialization matrix.<br>\
										     S<sub>0</sub> is filled by copying the column number all the way down each column.<br>\
										     In both D and S, cells where row = column are filled with \'-\'');
				var row_idx, col_idx;
				for(row_idx = 0; row_idx < row_count; row_idx++) {
					for(col_idx = 0; col_idx < row_count; col_idx++) {
						if(row_idx !== col_idx) {
							var D_box_cell = $("#Dcell-" + f_k + "-" + (row_idx+1) + "-" + (col_idx+1));
							var S_box_cell = $("#Scell-" + f_k + "-" + (row_idx+1) + "-" + (col_idx+1));
							
							D_box_cell.html(D_matrix_list[f_k][row_idx][col_idx]);
							S_box_cell.html(S_matrix_list[f_k][row_idx][col_idx]);
							
						
						}

//						$(this).html(newString).fadeIn(500);
					
					}
				}
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
