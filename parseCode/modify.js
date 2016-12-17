const MongoClient = require('mongodb').MongoClient
const mongodbUrl = 'mongodb://localhost:27017/fund'

MongoClient.connect(mongodbUrl, (err, db) => {
  // Get a collection
  const collection = db.collection('fundCollection')
  const filter = {
    fundID: 'EMCIAU',
  }
  collection.find(filter).toArray((error, result) => {
    if (!error && result) {
      console.log(result)
      db.close()
    }
  })
})
