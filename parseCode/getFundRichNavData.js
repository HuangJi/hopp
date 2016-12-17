const request = require('request')
const MongoClient = require('mongodb').MongoClient
const mongodbUrl = 'mongodb://localhost:27017/fund'
const fs = require('fs')

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time))

function getOneFundData(fundRichIdList) {
  sleep(parseInt((Math.random() * 0.001 * 1000) + (0.001 * 1000), 10)).then(() => {
    if (fundRichIdList.length <= 0) {
      process.stdout.write(`]`)
      return
    }
    const fundRichId = fundRichIdList.shift()
    const options = {
      method: 'GET',
      url: `https://apis.fundrich.com.tw/default/v1/funds/navPrices/${fundRichId}?duration=est`,
      json: true,
    }

    request(options, (error, response, body) => {
      if (error) {
        console.error(`error: ${error}`)
        getOneFundData(fundRichIdList)
      }
      else {
        // let fundRichNavObject = { fundRichId: fundRichId }

        // fundRichNavObject.navList = body
        // console.log(JSON.stringify(fundRichNavObject))
        // process.stdout.write(`,`)

        MongoClient.connect(mongodbUrl, (err, db) => {
          // Get a collection
          const collection = db.collection('testFund')
          const filter = {
            "fundRich.detail.FundId": fundRichId,
          }
          collection.updateMany(filter, { $set: { "fundRich.nav": body } }, { upsert: true }, (e, r) => {
            if (!error && r) {
              console.log(`${fundRichId} done`)
              db.close()
              getOneFundData(fundRichIdList)
            }
          })
        })
      }
    })
  })
}

fs.readFile('../data/fundRichIdFullList', (err, data) => {
  if (err) throw err
  const fundRichIdList = data.toString().split('\n')
  process.stdout.write(`[`)
  getOneFundData(fundRichIdList)
})
