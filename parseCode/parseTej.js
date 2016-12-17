const csv = require('fast-csv');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;

const stream = fs.createReadStream('tej.csv');
const mongodbUrl = 'mongodb://localhost:27017/fund';

let collection;
let filter;
let db;

MongoClient.connect(mongodbUrl, (err, database) => {
  db = database;
  collection = db.collection('fundCollection');
  csv
    .fromStream(stream, { headers: true })
    .on('data', (data) => {
      // console.log(data);
      filter = {
        fundChineseName: data.fundChineseName,
      };
      collection.updateMany(filter, { $set: data }, { upsert: true }, (error) => {
        if (!error) {
          console.log(`${data.fundChineseName} done!`);
        } else {
          console.log('error!');
          console.log(error);
        }
      });
    })
  .on('end', () => {
    console.log('done');
    db.close();
  });
});
