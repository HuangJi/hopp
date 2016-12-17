const csv = require('fast-csv')
const fs = require('fs')
const MongoClient = require('mongodb').MongoClient
const ws = fs.createWriteStream('log.csv')
const mongodbUrl = 'mongodb://localhost:27017/fund'

MongoClient.connect(mongodbUrl, (err, db) => {
  let readyToWriteData = [['_id',
                            'fund_chinese_name',
                            'fund_english_name',
                            'date',
                            'nav',
                            'currency',
                            'isin_code']]
  // const filter = {
  //   fundID: '000AMEGLEEE',
  // }
  const collection = db.collection('fundCollection')
  const cursor = collection.find({ dateData: { $exists: true } })
  cursor.each((error, fund) => {
    if (fund == null) {
      csv.write(readyToWriteData, { headers: true }).pipe(ws)
      db.close()
    } else {
      console.log(fund.fundChineseName)
      // const object = {
      //   _id: fund._id.toString(),
      //   dateData: fund.dateData,
      //   fundChineseName: fund.fundChineseName,
      //   fundEnglishName: fund.fundEnglishName,
      //   isinCode: fund.isinCode,
      // }
      // console.log(object)
      for (const row of Object.keys(fund.dateData)) {
        // console.log(`${row}: ${fund.dateData[row]}`)
        // console.log()
        readyToWriteData.push([ fund._id.toString(),
                                fund.fundChineseName,
                                fund.fundEnglishName,
                                row.replace(/\//g, '-'),
                                fund.dateData[row],
                                fund.currencyType,
                                fund.isinCode])
      }
    }
  })

  // collection.find({}).toArray((error, docs) => {
  //   // console.log()
  //   for (const fund of docs) {
  //     const object = {
  //       _id: fund._id.toString(),
  //       dateData: fund.dateData,
  //       fundChineseName: fund.fundChineseName,
  //       fundEnglishName: fund.fundEnglishName,
  //       isinCode: fund.isinCode,
  //     }
  //     // console.log(object)
  //     for (const row of Object.keys(object.dateData)) {
  //       console.log(`${row}: ${fund.dateData[row]}`)
  //       // console.log()
  //       readyToWriteData.push([ fund._id.toString(),
  //                               fund.fundChineseName,
  //                               fund.fundEnglishName,
  //                               row.replace(/\//g, '-'),
  //                               fund.dateData[row],
  //                               fund.isinCode])
  //     }
  //   }
  //   csv.write(readyToWriteData, { headers: true }).pipe(ws)
  // })
  // db.close()
})
