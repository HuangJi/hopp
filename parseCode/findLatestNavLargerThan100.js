'use strict'

const fs = require('fs')
const MongoClient = require('mongodb').MongoClient
const _ = require('lodash')

const mongodbUrl = 'mongodb://wilson:Wil9999Wil9999Wil9999@SG-howfintechmongo-8817.servers.mongodirector.com:27017/source?ssl=true'
const ca = [fs.readFileSync('/Users/wilson/.ssh/scalegrid.crt')]
const serverOption = { server: { sslValidate: true, sslCA: ca } }
const collectionName = 'FRNav'

console.log('FRId,TransDate,nav')
MongoClient.connect(mongodbUrl, serverOption, (err, db) => {
  const collection = db.collection(collectionName)
  collection.find().toArray((e, docs) => {
    if (!e && docs) {
      for (const fund of docs) {
        const dateArray = _.map(Object.keys(fund.data), _.parseInt)
        const latestDate = _.max(dateArray)
        const latestNav = fund.data[latestDate.toString()].Price
        if (latestNav > 100.0) {
          console.log(`${fund.FRId},${latestDate},${latestNav}`)
        }
      }
      db.close()
    } else {
      console.error(e)
      db.close()
    }
  })
})

// for (var i = 1; i < docs.length; i++) {
//   docs[i]
// }
