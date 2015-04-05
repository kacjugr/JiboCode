define( function () {
	// Do setup work here
	var local_data = {
		"test1": "test One",
		"test2": "test Two"
		};
	
	changeText = function() { document.getElementById("Jontext").innerHTML = "The button worked!"; }
	getTest1 = function() { return local_data["test1"]; }
	getTest2 = function() { return local_data["test2"]; }
	getAll = function() { return local_data; }
	document.getElementById("Jontext").innerHTML = "Hello Jon!";
	
	return this;	
});
