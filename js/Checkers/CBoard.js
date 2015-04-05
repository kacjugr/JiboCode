//define(['require'], function (require) {
define( function () {
//define(["jquery", "jquery-ui"], function ($,ui) {
//require(["jquery"], function ($) {

	/*---------------------------------------------------------------------------------
	// SETUP FUNCTIONS
	//-------------------------------------------------------------------------------*/
	//var $ = require("jquery");
	
	/*---------------------------------------------------------------------------------
	// function: resetState
	// args: none
	// return: none
	// use: resets full game state
	//		call during initialization and when exiting game pane
	//-------------------------------------------------------------------------------*/
	resetState = function() {
		// Clear all data
		the_board = [];
		board_walked = [];
		$("#gameTableBody").html("");

		start_time = 0;
		elapsed_time = 0;
		paused_time = 0;
		executing = false;
		
		update_interval = 1000; // default = 1sec/update
		last_update = 0;
		the_running_game = undefined;

		playMode = false;
		startSelected = false;
		player_tile = { row: -1, column: -1 };
		
		total_table_height = -1;
		
		// Init which portions are shown/hidden
		$("#checkersInit").show();
		$("#checkersShuffle").hide();
		$("#checkersPlay").hide();
		$("#gameBoard").hide();
		
		// Fade to regular BG color
		$('#gameTableBody').animate({backgroundColor: '#d0e4fe'}, "slow");
		
		// Show initial instructions/encouragement
		// Don't fade on the first instruction, should be solid when it slides on
		if(record.last === undefined)
		{
			$('#playInstruc').html('Enter a height/width (min ' + board_size.min + ', max ' + board_size.max + ') \
			                        and press the button to initialize the board.');
		} else if(record.last == "loss") {
			if(record.wins > (record.losses + 5)) {
				$('#playInstruc').html('OK, last one was just a fluke. Try again.');
			} else if((record.wins + 5) < record.losses) {
				$('#playInstruc').html('OK, are you even trying? You know, you can individually rotate arrows.');
			} else {
				$('#playInstruc').html('It\'s a close race. You can do this.');
			}
		} else {
			if(record.wins > (record.losses + 5)) {
				$('#playInstruc').html('You\'re ahead of the game now. Keep it going!');
			} else if((record.wins + 5) < record.losses) {
				$('#playInstruc').html('OK, that was a good one. You can make a comeback. I know it.');
			} else {
				$('#playInstruc').html('That was a good one.');
			}
		}
		
		// Pause any current execution
		pauseGame();
	}

	
	/*---------------------------------------------------------------------------------
	// BOARD DATA (non-graphics) FUNCTIONS
	//-------------------------------------------------------------------------------*/
	var the_board = [];
	var board_walked = [];
	var board_size = { min: 5, max: 15 };

	/*---------------------------------------------------------------------------------
	// function: initBoard
	// args: width = columns, height = rows
	// return: none
	// use: creates the board data
	//		calls buildTable() to create the graphical representation
	//-------------------------------------------------------------------------------*/
	initBoard = function(width, height) {
		var row_idx, col_idx;
		
		// Create a board of size (width,height), and init all elements to 0
		the_board = [];
		board_walked = [];
		for(row_idx = 0; row_idx < height; row_idx++) {
			the_board.push(Array.apply(null, new Array(Math.floor(width))).map(Number.prototype.valueOf,0));
			board_walked.push(Array.apply(null, new Array(Math.floor(width))).map(Boolean.prototype.valueOf,false));
		}
		
		// Display it onscreen
		buildTable();

		// Update buttons and instructions
		fadeToText('#playInstruc','Shuffle board until satisfied. Click arrows to rotate them. Then press Play.');
		$("#checkersInit").slideUp("slow");
		$("#checkersShuffle").slideDown("slow");
	}
	
	/*---------------------------------------------------------------------------------
	// function: shuffleBoard
	// args: none
	// return: none
	// use: randomly resets the direction of each tile on the board
	//		calls updateImages() to update the graphical representation
	//-------------------------------------------------------------------------------*/
	shuffleBoard = function() {
		// Shuffle the board
		var height = the_board.length, width = the_board[0].length;
		var row_idx, cell_idx;
		for(row_idx = 0; row_idx < height; row_idx++) {
			for(cell_idx = 0; cell_idx < width; cell_idx++) {
				// Generate a random direction (0=up, 1=right, 2=down, 3=left)
				// I'm suspicious of the miniscule chance of rolling exactly 1.0, resulting in a 4.
				// But the w3schools didn't mention that risk, but I've had bad experiences with that in game dev.
				the_board[row_idx][cell_idx] = Math.min(3, Math.floor(Math.random() * 4));	
			}
		}
		
		// Then update all the images
		updateImages();
		
		// Play 'shuffle' audio
		playAudio("shuffleAudio");
	}
	
	/*---------------------------------------------------------------------------------
	// function: selectTile
	// args: row, column
	// return: none
	// use: either - rotates the selected tile by 90 degrees clockwise
	//          or - selects the starting position of the game
	//-------------------------------------------------------------------------------*/
	selectTile = function(row, column) {
		if(!playMode) {
			// When in initMode (!playMode), touching a tile rotates the direction 90deg clockwise
			the_board[row][column] = (the_board[row][column] + 1)%4;
			
			// Reload the correct arrow
			var arrow_name = "#arrow-" + row + "-" + column;
			$(arrow_name).attr("src",image_names_lo[(the_board[row][column])]);
			
			// Play 'turn' audio
			playAudio("turnAudio");
			//$("#turnAudio").trigger('play');
		} else/* if(!startSelected)*/ {
			// If player had previously selected a tile, reset that previous tile
			if(startSelected) {
				var prev_arrow_name = "#arrow-" + player_tile.row + "-" + player_tile.column;
				$(prev_arrow_name).attr("src",image_names_lo[(the_board[player_tile.row][player_tile.column])]);
				board_walked[player_tile.row][player_tile.column] = false;
			} else {
				// Validate starting spot
				fadeToText('#playInstruc','Now hit Start, or select a different arrow.');
			}

			// Record starting pos
			startSelected = true;
			player_tile.row = row;
			player_tile.column = column;
			board_walked[row][column] = true;
			
			// Load the correct arrow
			var arrow_name = "#arrow-" + row + "-" + column;
			$(arrow_name).attr("src",image_names_hi[(the_board[row][column])]);
			
			// Play 'select' audio
			playAudio("selectAudio");
		}
	}
	
	/*---------------------------------------------------------------------------------
	// function: resetGame
	// args: none
	// return: none
	// use: removes player position from game
	//      resets all the 'walked' flags
	//      resets the tile graphics
	//-------------------------------------------------------------------------------*/
	resetGame = function() {
		// Remove player position from game
		player_tile = { row: -1, column: -1 };
		player_last_tile = { row: player_tile.row, column: player_tile.column };
		startSelected = false;
	
		// Reset walked flags
		var row_idx, col_idx;
		var width = board_walked[0].length, height = board_walked.length;
		for(row_idx = 0; row_idx < height; row_idx++) {
			for(col_idx = 0; col_idx < width; col_idx++) {
				board_walked[row_idx][col_idx] = false;
			}
		}
		
		// Reset the tile graphics
		updateImages();
		
		// Reset the background color if it's been changed
		$('#gameTableBody').animate({backgroundColor: '#d0e4fe'}, "slow");
	}
	
	


	/*---------------------------------------------------------------------------------
	// CLOCK FUNCTIONS (Utility)
	//-------------------------------------------------------------------------------*/
	var start_time = 0, elapsed_time = 0, paused_time = 0;
	var executing = false;
	/*---------------------------------------------------------------------------------
	// function: initClock
	// args: time = Date()
	// return: none
	// use: initialize the start time for runGame()
	//-------------------------------------------------------------------------------*/
	initClock = function(time)			{ start_time = time.getTime(); }

	/*---------------------------------------------------------------------------------
	// function: updateClock
	// args: time = Date()
	// return: none
	// use: updates elapsed_time, for later use with newFrame()
	//-------------------------------------------------------------------------------*/
	updateClock = function(time)		{ elapsed_time = time.getTime() - start_time; }

	/*---------------------------------------------------------------------------------
	// function: getElapsed
	// args: none
	// return: elapsed_time
	// use: returns elapsed_time, for use with newFrame()
	//-------------------------------------------------------------------------------*/
	getElapsed = function()				{ return elapsed_time; }

	
	/*---------------------------------------------------------------------------------
	// UPDATE FUNCTIONS
	//-------------------------------------------------------------------------------*/
	var update_interval = 1000; // default 1sec
	var last_update = 0;
	var the_running_game;
	/*---------------------------------------------------------------------------------
	// function: setUpdateInterval
	// args: msec = Number ( 100 < msec < 10000 ) // min = 1/10sec, max = 10sec
	// return: none
	// use: set milliseconds between game frame updates
	//-------------------------------------------------------------------------------*/
	setUpdateInterval = function(msec) {
		
		if(isNaN(msec) || msec < 100 || msec > 10000) {
			return;					// Reject invalid input
		} else {
			update_interval = msec;	// set new interval
		}
	}

	/*---------------------------------------------------------------------------------
	// function: startGame
	// args: time = Date()
	// return: none
	// use: purges previous game instances
	//      begins execution of runGame()
	//-------------------------------------------------------------------------------*/
	startGame = function(time) {
		if(!startSelected) {
			// Validate starting spot
			fadeToText('#playInstruc','YOU HAVE NOT SELECTED A STARTING SPOT!<br>Click an arrow to select start point, then hit Start.');
		} else {
			// Purge any already-running game
			if(typeof the_running_game === 'number') {
				window.clearInterval(the_running_game);
				delete the_running_game;
			}
				
			initClock(time);
			paused_time = 0;
			last_update = 0;
			executing = true;
			the_running_game = window.setInterval(function() { runGame(); }, 100);
			
			// Start the audio
			playAudio("walkAudio");
//			$("#walkAudio").trigger('play');
		}
	}

	/*---------------------------------------------------------------------------------
	// function: pauseGame
	// args: none
	// return: none
	// use: halts execution of runGame()
	//      records pause time to use later in resumeGame()
	//-------------------------------------------------------------------------------*/
	pauseGame = function() {
		paused_time = new Date();
		executing = false;
		window.clearInterval(the_running_game);

		// Pause the audio
		$("#walkAudio").trigger('pause');
	}

	/*---------------------------------------------------------------------------------
	// function: resumeGame
	// args: none
	// return: none
	// use: resumes execution of runGame()
	//      adjusts start time to compensate for pause offset
	//-------------------------------------------------------------------------------*/
	resumeGame = function() {
		if(paused_time > 0) {
			start_time += (new Date() - paused_time);
			executing = true;
			the_running_game = window.setInterval(function() { runGame(); }, 100);
		}
		paused_time = 0;
		
		// Resume the audio
		playAudio("walkAudio");
	}
	
	/*---------------------------------------------------------------------------------
	// function: newFrame
	// args: time = Date()
	// return: Boolean
	// use: returns 'true' if full 'update_interval' has elapsed since last update
	//-------------------------------------------------------------------------------*/
	newFrame = function(time) {
		updateClock(time);
		
		// TODO: timer bar?
		
		if(elapsed_time - last_update > update_interval) {
			last_update = (Math.floor(elapsed_time/update_interval)) * update_interval ;
			//$("#lastupdatestring").html(last_update);
			return true;
		} else {
			return false;
		}
	}
	
	
	/*---------------------------------------------------------------------------------
	// CORE GAME FUNCTIONS
	//-------------------------------------------------------------------------------*/
	var playMode = false;
	var startSelected = false;
	var player_tile = { row: -1, column: -1 };
	var player_last_tile = { row: player_tile.row, column: player_tile.column };
	var record = { wins: 0, losses: 0, last: undefined };

	/*---------------------------------------------------------------------------------
	// function: runGame
	// args: none
	// return: none
	// use: updates the game while running
	//      start/pause/stop using utility functions in UPDATE FUNCTIONS section
	//-------------------------------------------------------------------------------*/
	runGame = function() {
		updateClock(new Date());
		//$("#elapsedstring").html(getElapsed());
		
		// Game logic
		if(newFrame(new Date())) {
			//$("#updatestring").html("UPDATE");
			
			// Animate the old arrow (fade to 50%)
			var row = player_tile.row, column = player_tile.column;
			var arrow_name = "#arrow-" + row + "-" + column;
			$(arrow_name).animate({opacity:0.5});

			// Move player
			var facing = the_board[player_tile.row][player_tile.column];
			player_last_tile = { row: player_tile.row, column: player_tile.column };
			if(facing === 0) {
				player_tile.row--;		// UP
			} else if(facing === 1) {
				player_tile.column++;	// RIGHT
			} else if(facing === 2) {
				player_tile.row++;		// DOWN
			} else if(facing === 3) {
				player_tile.column--;	// LEFT
			}
			
			
			if(player_tile.row < 0 || player_tile.row >= the_board.length || player_tile.column < 0 || player_tile.column >= the_board[0].length) {
				// You've stepped off the edge of the board
				pauseGame();
				record.wins++;
				record.last = "win";
				fadeToText('#playInstruc','CONGRATULATIONS! You\'ve escaped the labrynth!<br>Hit (Hide Checkers) to reset.');

				// Load the win arrow
				row = player_last_tile.row;
				column = player_last_tile.column;
				arrow_name = "#arrow-" + row + "-" + column;
				$(arrow_name).attr("src",image_names_win[(the_board[row][column])]);

				// Fade the background color
				$('#gameTableBody').animate({backgroundColor: '#66FF99'}, "slow");
				
				// Play the 'win' audio
				playAudio("winAudio");
				//$("#winAudio").trigger('play');

			} else if(board_walked[player_tile.row][player_tile.column]) {
				// You've stepped on a previously traversed tile
				pauseGame();
				record.losses++;
				record.last = "loss";
				fadeToText('#playInstruc','OH NO! You\'ve been on this tile before. You\'re doomed to wander forever!\
										   <br>Hit (Hide Checkers) to reset board size.');
										   
				// Load the fail arrow
				row = player_tile.row;
				column = player_tile.column;
				var arrow_name = "#arrow-" + row + "-" + column;
				$(arrow_name).attr("src",image_names_fail[(the_board[row][column])]);
				
				// Fade the background color
				$('#gameTableBody').animate({backgroundColor: '#CD3333'}, "slow");

				// Play the 'loss' audio
				playAudio("lossAudio");
				//$("#lossAudio").trigger('play');
			}
			
			if(executing) {
				// Mark the current location as "walked"
				board_walked[player_tile.row][player_tile.column] = true;
				
				// Reload the correct arrow
				row = player_tile.row;
				column = player_tile.column;
				arrow_name = "#arrow-" + row + "-" + column;
				$(arrow_name).attr("src",image_names_hi[(the_board[row][column])]);
			}
			
		} else {
			$("#updatestring").html("<br>");
		}
	}
	
	
	
	/*---------------------------------------------------------------------------------
	// DISPLAY FUNCTIONS
	//-------------------------------------------------------------------------------*/
	var image_names_hi   = ["graphics/up_arrow_hi.png","graphics/right_arrow_hi.png","graphics/down_arrow_hi.png","graphics/left_arrow_hi.png"];
	var image_names_lo   = ["graphics/up_arrow_lo.png","graphics/right_arrow_lo.png","graphics/down_arrow_lo.png","graphics/left_arrow_lo.png"];
	var image_names_fail = ["graphics/up_arrow_fail.png","graphics/right_arrow_fail.png","graphics/down_arrow_fail.png","graphics/left_arrow_fail.png"];
	var image_names_win  = ["graphics/up_arrow_win.png","graphics/right_arrow_win.png","graphics/down_arrow_win.png","graphics/left_arrow_win.png"];
	
	/*---------------------------------------------------------------------------------
	// function: loadCheckersZone
	// args: none
	// return: none
	// use: loads all the divisions, buttons and assets for the game
	//-------------------------------------------------------------------------------*/
	loadCheckersZone = function() {
		// Load the Checkers Zone (using JQuery, because appending to the DOM fragment should be faster than doing a javascript .innerHTML=, and having it rebuild the whole DOM)
		var checkers_zone = $("#checkersZone");
		checkers_zone.append("<br><h1>WELCOME TO THE CHECKERS ZONE</h1>");				// Checkers Zone title
		checkers_zone.append("<br><table align='center'><tr><td style='height:75px'>\
							  <p id='playInstruc'>Instructions Go Here</p></td></tr></table><br>");	// The play instructions
		
		// The 'Init' submenu
		checkers_zone.append("<div id='checkersInit'><\div>");							// The root of the 'checkersInit' menu
		var checkers_init = $("#checkersInit");
		checkers_init.append("<table id='submitInit' align='center'></table>");			// The nested root of the 'submitInit' text boxes
			var submit_init = $("#submitInit");
			submit_init.append("<tr><td>Enter Width:</td><td><input id='submitWidth' type='number'></td></tr>");   // 'submitWidth' text input
			submit_init.append("<tr><td>Enter Height:</td><td><input id='submitHeight' type='number'></td></tr>"); // 'submitWidth' text input
		checkers_init.append("<button id='initBoard'   >Init Board</button><br>");		// 'Init Board' button
		
		checkers_zone.append("<div id='checkersShuffle'><\div>");						// The root of the 'checkersShuffle' menu
		var checkers_shuf = $("#checkersShuffle");
		checkers_shuf.append("<button id='shuffleBoard'>Shuffle Board</button><br>");	// 'Shuffle Board' button
		checkers_shuf.append("<button id='playBoard'   >Play</button><br>");			// 'Play' button
	
		// The 'Game Board' (graphics for visualization)
		checkers_zone.append("<div id='gameBoard' class='centered' align='center'><\div>");			// The root of the 'gameBoard'
		$("#gameBoard").append("<table id='gameTable'><tbody id='gameTableBody'></tbody></table>");	// The actual table
			
		// The 'Play' submenu
		checkers_zone.append("<div id='checkersPlay'><\div>");							// The root of the 'checkersPlay' menu
		var checkers_play = $("#checkersPlay");
		checkers_play.append("<button id='startGame' >Start</button>");					// 'Start' button
		checkers_play.append("<button id='pauseGame' >Pause</button>");					// 'Pause' button
		checkers_play.append("<button id='resumeGame'>Resume</button>");				// 'Resume' button
		checkers_play.append("<button id='resetGame' >Reset</button><br><br>");			// 'Reset' button
/*
		// Preload one of each of the arrow graphics so they're in cache, and don't pop on during gameplay
		var image_idx;
		var num_images_per_type = image_names_hi.length;
		checkers_zone.append("<div id='checkersGfxCache'><\div>");						// The root of the 'checkersGfxCache'
		var gfx_cache = $('#checkersGfxCache');
		for(image_idx = 0; image_idx < num_images_per_type; image_idx++) {
			gfx_cache.append("<img src=" + image_names_hi[0] + "></img>");				// Preload an image
			gfx_cache.append("<img src=" + image_names_lo[0] + "></img>");				// Preload an image
			gfx_cache.append("<img src=" + image_names_fail[0] + "></img>");			// Preload an image
			gfx_cache.append("<img src=" + image_names_win[0] + "></img>");				// Preload an image
		
		}
		gfx_cache.hide();																// Then hide the whole thing
*/
		// Load the audio objects
		checkers_zone.append("<audio id='walkAudio' src='audio/footsteps_gravel_01.mp3' loop='true'></audio>");
		checkers_zone.append("<audio id='winAudio' src='audio/win.ogg'></audio>");
		checkers_zone.append("<audio id='lossAudio' src='audio/loss.ogg'></audio>");
		checkers_zone.append("<audio id='selectAudio' src='audio/select.ogg'></audio>");
		checkers_zone.append("<audio id='turnAudio' src='audio/tile_turn.ogg'></audio>");
		checkers_zone.append("<audio id='shuffleAudio' src='audio/shuffle.ogg'></audio>");

		// Clear all data, and init which portions are shown/hidden
		resetState();
		
		// Reset the player record
		record = { wins: 0, losses: 0, last: undefined };
		
		// Associate functions with buttons
		$(function(){
			$("#startGame").click(function(){
				// Validate game start
				if(record.last === undefined)
				{
					fadeToText('#playInstruc','YOU DID IT! YOU HIT \'Start\'!<br>Let the fun begin!');
				} else {
					fadeToText('#playInstruc','Here we go again!');
				}
			
				startGame(new Date());
			})
		})
		
		$(function(){
			$("#pauseGame").click(function(){
				fadeToText('#playInstruc','Oh man, this is so great. I can\'t wait to get back to it!');
				pauseGame(new Date());
			})
		})
		
		$(function(){
			$("#resumeGame").click(function(){
				fadeToText('#playInstruc','YES! Here we go again!');
				resumeGame(new Date());
			})
		})

		$(function(){
			$("#resetGame").click(function(){
				fadeToText('#playInstruc','Click an arrow to select start point, then hit Start.');
				resetGame(new Date());
			})
		})

		$(function(){
			$("#initBoard").click(function(){
				// Get the value of the input fields
				var submitWidth = $("#submitWidth").val();
				var submitHeight = $("#submitHeight").val();
				
				// Validate the inputs
				if(isNaN(submitWidth) || isNaN(submitHeight) ||
				   submitWidth > board_size.max || submitWidth < board_size.min ||
				   board_size.max > board_size.max || submitHeight < board_size.min) {
					fadeToText('#playInstruc','Please enter height/width values between ' + board_size.min + ' and ' + board_size.max + '.');
				} else {
					initBoard(submitWidth,submitHeight);
				}
			})
		})
			
		$(function(){
			$("#shuffleBoard").click(function(){
				shuffleBoard();
			})
		})
		
		$(function(){
			$("#playBoard").click(function(){
				// Validate that a board has been made
				if($("#gameTableBody").children().length !== 0) {

					// Reset the init block, then hide it
					$("#checkersInit").hide();
					$("#checkersShuffle").slideUp("slow");

					// Update instructions and play mode
					fadeToText('#playInstruc','Click an arrow to select start point, then hit Start.');
					playMode = true;

					// Show the Play controls
					$("#checkersPlay").slideDown("slow");
				} else {
					// Correct the player
					fadeToText('#playInstruc','YOU HAVE NOT MADE A BOARD!<br>\
											   Enter a height/width (min ' + board_size.min + ', max ' + board_size.max + ') \
											   and press the button to initialize the board.');
				}
			})
		})
	}
	
	
	// Values for adjusting img size
	var img_height = -1;
	var total_table_height = -1;
	var scale_adjust = -1;
	/*---------------------------------------------------------------------------------
	// function: buildTable
	// args: none
	// return: none
	// use: builds the graphical representation of the table for display
	//-------------------------------------------------------------------------------*/
	buildTable = function() {
		// Grab the table object
		var game_table_obj = $("#gameTableBody");
		
		// Purge the board if it already exists
		if(game_table_obj.children().length !== 0)
			game_table_obj.html("");
			
		// Build the display table
		var row_idx, cell_idx;
		var height = the_board.length;
		var width = the_board[0].length;
		for(row_idx = 0; row_idx < height; row_idx++) {
			game_table_obj.append("<tr id='row-" + row_idx + "'></tr>");
			game_row_obj = $("#row-" + row_idx);
			for(cell_idx = 0; cell_idx < width; cell_idx++) {
				game_row_obj.append("<td><img id='arrow-" + row_idx + "-" + cell_idx + "' src=" + image_names_lo[(the_board[row_idx][cell_idx])] +
				                    " onclick='selectTile(" + row_idx + "," + cell_idx + ")'></img></td>");

				// Check total img height, and set scaling factor (if necessary) (does once per load)
				var arrow_name = "#arrow-" + row_idx + "-" + cell_idx;
				if(total_table_height === -1)
				{
					total_table_height = 0;	// set to 0 so it doesn't repeatedly set up the function while img (0,0) is loading
					$(document).ready(function() {
						$(arrow_name).load(function() {
							// Determine correct scale for all arrow images
							determineScale($(this).height(), height);

							// Gets done after the load, so we're not scaling everything to 0
							rescaleImages();
						});
					});
				}
			}
		}
		
		// Slide open the game panel
		$("#gameBoard").slideDown("slow");
	}

	/*---------------------------------------------------------------------------------
	// function: determineScale
	// args: img_height = image height
	// return: none
	// use: determines correct scale for images, once first image is loaded
	//-------------------------------------------------------------------------------*/
	determineScale = function(img_height, table_rows) {
		// Calculate the total final table height (works because all images are a standard height)
		total_table_height = img_height * table_rows;	
		
		// If the total height is over max size, set scaling factor to adjust
		if(total_table_height > 380) {
			scale_adjust = 1.0 / (total_table_height/380);
		} else {
			scale_adjust = 1.0;
		}
		scale_adjust = (img_height * scale_adjust) + 'px';
	}
	
	/*---------------------------------------------------------------------------------
	// function: rescaleImages
	// args: none
	// return: none
	// use: updates all arrows after determining correct scale
	//-------------------------------------------------------------------------------*/
	rescaleImages = function() {
		var height = the_board.length, width = the_board[0].length;
		var row_idx, cell_idx;
		
		// Cycle through the whole board
		for(row_idx = 0; row_idx < height; row_idx++) {
			for(cell_idx = 0; cell_idx < width; cell_idx++) {
				// Update the arrow image to correct scale
				var arrow_name = "#arrow-" + row_idx + "-" + cell_idx;
				var the_arrow = $(arrow_name)
				the_arrow.css("width",scale_adjust);
				the_arrow.css("height",'auto');
			}
		}
	}
	
	/*---------------------------------------------------------------------------------
	// function: updateImages
	// args: none
	// return: none
	// use: updates all arrows after a shuffle
	//      saves fetch time for row objects by doing batch processing
	//-------------------------------------------------------------------------------*/
	updateImages = function() {
		var height = the_board.length, width = the_board[0].length;
		var row_idx, cell_idx;
		
		// Cycle through the whole board
		for(row_idx = 0; row_idx < height; row_idx++) {
			for(cell_idx = 0; cell_idx < width; cell_idx++) {
				// Update the arrow image to match direction
				var arrow_name = "#arrow-" + row_idx + "-" + cell_idx;
				var the_arrow = $(arrow_name)
				the_arrow.attr("src",image_names_lo[(the_board[row_idx][cell_idx])]);
				the_arrow.animate({opacity:1.0});
			}
		}
	}
	
	/*---------------------------------------------------------------------------------
	// UTILITY FUNCTIONS
	//-------------------------------------------------------------------------------*/
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
	/*---------------------------------------------------------------------------------
	// function: playAudio
	// args: key string
	// return: none
	// use: plays a single audio file
	//      will restart that file if is currently playing
	//-------------------------------------------------------------------------------*/
	playAudio = function(audioKey) {
		// Have to fetch the audio by regular javascript, because JQuery support for audio objects seems pretty weak. No changing the currentTime for a reset.
		var audio = document.getElementById(audioKey);

		if (audio.paused === true) {
			audio.play();
		}else{
			audio.currentTime = 0;
		}
	}
	
	
	return this;	
});
