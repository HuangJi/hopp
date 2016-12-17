'use strict'

const MongoClient = require('mongodb').MongoClient
// const bluebird = require('bluebird')
const fs = require('fs')

const mongodbUrl = 'mongodb://wilson:Wil9999Wil9999Wil9999@SG-howfintechmongo-8817.servers.mongodirector.com:27017/source?ssl=true'
const ca = [fs.readFileSync('parseCode/scalegrid.crt')]
const serverOption = { server: { sslValidate: true, sslCA: ca } }
// const promisedMongoClient = bluebird.promisifyAll(MongoClient)
// {
//   promiseLibrary: require('bluebird')
// }
module.exports = {
  scalegridPromiseConnect: function scalegridPromiseConnect() {
    return MongoClient.connect(mongodbUrl, serverOption)
  },
  scalegridConnect: function scalegridConnect(callback) {
    MongoClient.connect(mongodbUrl, serverOption, (err, db) => {
      callback(err, db)
    })
  },
}
