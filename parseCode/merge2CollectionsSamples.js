'use strict'

const fs = require('fs')
const MongoClient = require('mongodb').MongoClient
const _ = require('lodash')

const mongodbUrl = 'mongodb://wilson:Wil9999Wil9999Wil9999@SG-howfintechmongo-8817.servers.mongodirector.com:27017/source?ssl=true'
const ca = [fs.readFileSync('/Users/wilson/.ssh/scalegrid.crt')]
const serverOption = { server: { sslValidate: true, sslCA: ca } }
const collectionFRDetailName = 'FRDetail'
const collectionFRAllocationName = 'FRAllocation'

function getLatestDateString(dateStringArray) {
  const dateArray = _.map(dateStringArray, _.parseInt)
  const latestDate = _.max(dateArray)
  if (!latestDate) {
    return null
  }
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
  collectionFRDetail.find().toArray((error, docs) => {
    if (!error && docs) {
      for (const fund of docs) {
        const latestDateString = getLatestDateString(_.keys(fund.data))
        const latestName = fund.data[latestDateString].Name
        const targetFRId = fund.FRId
        collectionFRAllocation.find({ FRId: targetFRId }).toArray((e, r) => {
          if (!e && r.length) {
            const fundAllocation = r[0]
            const targetDateString = getLatestDateString(_.keys(fundAllocation.data.StockTop))
            if (targetDateString) {
              for (const stock of fundAllocation.data.StockTop[targetDateString]) {
                if (isValidDate(stock.TransDate)) {
                  console.log(`${targetFRId},${latestName},${stock.TransDate},${stock.ExternalName},${stock.InvRate}`)
                }
              }
              db.close()
            }
          } else {
            console.error(e)
            db.close()
          }
        })
      }
    } else {
      console.error(error)
      db.close()
    }
  })
})
