const csv = require('fast-csv');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;

const stream = fs.createReadStream('../data/pyxl.csv');
const mongodbUrl = 'mongodb://localhost:27017/fund';

let collection;
let filter;
let db;

// csv
//     .fromStream(stream, { headers: true })
//     .on('data', (data) => {
//       console.log(data);
      
//     })
//   .on('end', () => {
//     console.log('done');
//     // db.close();
//   });


MongoClient.connect(mongodbUrl, (err, database) => {
  db = database;
  collection = db.collection('fundCollection');
  csv
    .fromStream(stream, { headers: true })
    .on('data', (data) => {
      // console.log(data);
      filter = {
        tejId: data.tejId,
      };
      const dateString = data.date;
      const saveObject = JSON.parse(JSON.stringify(data));
      delete saveObject.tejId;
      delete saveObject.date;
      delete saveObject.fundTongYiNumber;
      const key = 'dateData.' + data.date.substring(0, 10);
      console.log(key);
      const updateObject = {};
      updateObject[key] = saveObject;
      // data.dateData = {};
      // data.dateData[dateString] = saveObject;
      collection.updateMany(
        filter,
        { $set: updateObject },
        { upsert: true },
        (error) => {
          if (!error) {
            console.log(`${data.tejId} done!`);
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
