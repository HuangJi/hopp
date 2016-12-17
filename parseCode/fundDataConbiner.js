var request = require('request');
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');

var mongodbUrl = 'mongodb://localhost:27017/fund';
var count = 0;
function printFundData (fundIDList) {
	fundID = fundIDList.shift();

	MongoClient.connect(mongodbUrl, function(err, db) {
	    // Get a collection
	    if (!err) {
	    	var collection = db.collection('fundCollection');
		    filter = {
		    	fundID: fundID 
		    }
		    var cursor = collection.find(filter);
		    cursor.each(function (error, doc) {
		    	count += 1;
		    	console.log(count);
		    	console.log(doc);
		    	printFundData(fundIDList);
		    	db.close();
		    });
	    }
	    else {
	    	printFundData(fundIDList);
	    	db.close();
	    }
	});
}

	


fs.readFile('./fund_id', function (err, data) {
	if (err) throw err;
	var fundIDList = data.toString().split('\n');
	// console.log(fundIDList);
	
	fs.readFile('./user_agent', function (err, data) {
		var userAgentList = data.toString().split('\n');
		printFundData(fundIDList);
	});
});