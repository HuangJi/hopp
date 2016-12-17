'use strict'

const fs = require('fs')
const MongoClient = require('mongodb').MongoClient
const _ = require('lodash')

const mongodbUrl = 'mongodb://wilson:Wil9999Wil9999Wil9999@SG-howfintechmongo-8817.servers.mongodirector.com:27017/source?ssl=true'
const ca = [fs.readFileSync('/Users/wilson/.ssh/scalegrid.crt')]
const serverOption = { server: { sslValidate: true, sslCA: ca } }
const collectionFRDetailName = 'FRDetail'
const targetFRId = '046002'
const collectionFRAllocationName = 'FRAllocation'

function getLatestDateString(dateStringArray) {
  const dateArray = _.map(dateStringArray, _.parseInt)
  const latestDate = _.max(dateArray)
  return latestDate.toString()
}

function isValidDate(dateString) {
  const dateInt = parseInt(dateString, 10)
  if (dateInt < 20160930 && dateInt > 20160101) {
    return true
  }
  return false
}

console.log('FRId,FRDetail.Name,TransDate,ExternalName,InvRate')
MongoClient.connect(mongodbUrl, serverOption, (err, db) => {
  const collectionFRAllocation = db.collection(collectionFRAllocationName)
  const collectionFRDetail = db.collection(collectionFRDetailName)
  collectionFRDetail.find({ FRId: targetFRId }).toArray((error, docs) => {
    if (!error && docs) {
      const latestDateString = getLatestDateString(Object.keys(docs[0].data))
      const latestName = docs[0].data[latestDateString].Name
      collectionFRAllocation.find({ FRId: targetFRId }).toArray((e, r) => {
        if (!e && r) {
          const fundAllocation = r[0]
          const targetDateString = getLatestDateString(Object.keys(fundAllocation.data.StockTop))
          for (const stock of fundAllocation.data.StockTop[targetDateString]) {
            if (isValidDate(stock.TransDate)) {
              console.log(`${targetFRId},${latestName},${stock.TransDate},${stock.ExternalName},${stock.InvRate}`)
            }
          }
          db.close()
        } else {
          console.error(e)
          db.close()
        }
      })
    } else {
      console.error(error)
      db.close()
    }
  })
})
