require.config({
    baseUrl: 'js/',
    paths: {
        "jquery": "../node_modules/jquery/dist/jquery",
        "jquery-ui": "../node_modules/jquery-ui/jquery-ui",
		"checker-board" : "Checkers/CBoard",
 		"floyd-algo" : "Floyds/Floyds"
    },
    shim: {
        "../node_modules/jquery/dist/jquery-ui": ["jquery"]
    }
});

require(["jquery", "jquery-ui","checker-board", "floyd-algo"], function($,ui,CBoard,Floyds) {

	// Load control buttons to top
	$("#controlButtons").hide();	
	$("#controlButtons").ready(function(){
		// Checkers
		$("#controlButtons").append("<button id='showCheckers'>Play Checkers</button>");	
		$("#showCheckers").show();	
		$("#controlButtons").append("<button id='hideCheckers'>Hide Checkers</button>");
		$("#hideCheckers").hide();
		
		// Floyd's
		$("#controlButtons").append("<button id='showFloyds'>Play Floyd's</button>");	
		$("#showFloyds").show();	
		$("#controlButtons").append("<button id='hideFloyds'>Hide Floyd's</button>");
		$("#hideFloyds").hide();
		$("#controlButtons").show();	
	});

	// This is the hide/load/show area for the checkers game
	$(".checkersZone").hide();	// hide it before you load it, so it doesn't show up during load
	$("#checkersZone").ready(function(){
		CBoard.loadCheckersZone();
	});

	$("#checkersZone").ready(function(){
		$("#showCheckers").click(function(){
			CBoard.resetState();
			$(".checkersZone").slideDown("slow");
			$("#showCheckers").hide();
			$("#hideCheckers").show();	
			$("#showFloyds").hide();
		});
	});
	
	$("#checkersZone").ready(function(){
		$("#hideCheckers").click(function(){
			$(".checkersZone").slideUp("slow", function() { CBoard.resetState() });
			$("#showCheckers").show();
			$("#hideCheckers").hide();	
			$("#showFloyds").show();
		});
	});
	
	// This is the hide/load/show area for the floyds algorithm
	$(".floydsZone").hide();	// hide it before you load it, so it doesn't show up during load
	$("#floydsZone").ready(function(){
		Floyds.loadFloydsZone();
	});

	$("#floydsZone").ready(function(){
		$("#showFloyds").click(function(){
//			CBoard.resetState();
			$(".floydsZone").slideDown("slow");
			$("#showCheckers").hide();
			$("#showFloyds").hide();
			$("#hideFloyds").show();	
		});
	});
	
	$("#floydsZone").ready(function(){
		$("#hideFloyds").click(function(){
			$(".floydsZone").slideUp("slow", function() { CBoard.resetState() });
			$("#showCheckers").show();
			$("#showFloyds").show();
			$("#hideFloyds").hide();	
		});
	});
});