const csv = require('fast-csv')
const fs = require('fs')
// const Iconv = require('iconv').Iconv

// const iconv = new Iconv('big5', 'utf-8')
const MongoClient = require('mongodb').MongoClient


const stream = fs.createReadStream('../data/f.csv')
const mongodbUrl = 'mongodb://localhost:27017/fund'

let collection
let filter
let db
let count = 0
MongoClient.connect(mongodbUrl, (err, database) => {
  db = database
  collection = db.collection('rawFund')
  csv
    .fromStream(stream, { headers: true })
    .on('data', (data) => {
      console.log(data)
      count += 1
      filter = {
        fundChineseName: data.fundChineseName,
      }

      collection.updateMany(filter, { $set: {
        fundChineseName: data.fundChineseName,
        fundEnglishName: data.fundEnglishName,
        currencyType: data.currencyType,
        isinCode: data.isinCode,
        isOffshore: true,
        fundClear: {
        fundId: data.fundId,
        generalAgentId: data.generalAgentId,
        generalAgentName: data.generalAgentName,
        offshoreInstitutionId: data.offshoreInstitutionId,
        offshoreInstitutionName: data.offshoreInstitutionName,
      } } }, { upsert: true }, (error) => {
        if (!error) {
          console.log(`${data.fundId} done!`)
        } else {
          console.log('error!')
          console.log(error)
        }
      })
    })
  .on('end', () => {
    console.log(`count is ${count}`)
    db.close()
  })
})
