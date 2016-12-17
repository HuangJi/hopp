var csv = require("fast-csv");
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
// var csvStream = csv.createWriteStream({headers: true}),
//     writableStream = fs.createWriteStream("my.csv");
var ws = fs.createWriteStream("000AMEGLEEE.csv");
var ws2 = fs.createWriteStream("20160701.csv");


// writableStream.on("finish", function(){
//   console.log("DONE!");
// });

var mongodbUrl = 'mongodb://localhost:27017/fund';

MongoClient.connect(mongodbUrl, function(err, db) {
    // Get a collection
    var collection = db.collection('fundCollection');
    filter = {
    	fundID: '000AMEGLEEE' 
    }
    collection.find(filter).toArray(function (error, docs) {
    	var oneFundDateData = docs[0]['dateData'];
    	console.log(docs[0]['dateData']['2016/07/01']);
    	var readyToWriteData = [['date', 'net']];

    	for (key in oneFundDateData) {
    		var list = [key, oneFundDateData[key]];
    		readyToWriteData.push(list);
    	}
    	console.log(readyToWriteData);
    	csv.write(readyToWriteData, {headers: true}).pipe(ws);
    	// writableStream.pipe(writableStream);

    	// csvStream.write(readyToWriteDate);
    	// csvStream.end();
    	db.close();
    });
});

MongoClient.connect(mongodbUrl, function(err, db) {
    // Get a collection
    var collection = db.collection('fundCollection');
    // filter = {
    // 	dateData:  
    // }
    var dateString = '2016/07/01';
	var readyToWriteData = [['fundID', 'net']];

    collection.find({}).toArray(function (error, docs) {
    	for (var i = 0; i < docs.length; i++) {
    		if (docs[i]['dateData'][dateString] != undefined) {
    			readyToWriteData.push([docs[i]['fundID'], docs[i]['dateData'][dateString]])
    		}
    	}

    	// console.log(readyToWriteData);
    	csv.write(readyToWriteData, {headers: true}).pipe(ws2);
    	// writableStream.pipe(writableStream);

    	// csvStream.write(readyToWriteData);
    	// csvStream.end();
    	db.close();
    });
});