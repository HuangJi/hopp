const request = require('request')
const cheerio = require('cheerio')
const MongoClient = require('mongodb').MongoClient
const mongodbUrl = 'mongodb://localhost:27017/fund'

const fs = require('fs')

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time))

function getOneFundData(fundRichIdList) {
  sleep(parseInt((Math.random() * 0.01 * 1000) + (0.001 * 1000), 10)).then(() => {
    if (fundRichIdList.length <= 0) {
      return
    }
    const fundRichId = fundRichIdList.shift()
    const options = {
      method: 'GET',
      url: `https://apis.fundrich.com.tw/default/v1/funds/${fundRichId}`,
      json: true,
    }

    request(options, (error, response, body) => {
      if (error) {
        console.error(`error: ${error}`)
        getOneFundData(fundRichIdList)
      }
      else {
        // console.log(JSON.stringify(body))
        // process.stdout.write(`,`)

        MongoClient.connect(mongodbUrl, (err, db) => {
          // Get a collection
          const collection = db.collection('testFund');
          const filter = {
            fundChineseName: body.Name,
          };
          collection.updateMany(filter, { $set: { "fundRich.detail": body } }, { upsert: true }, (e, r) => {
            if (!error && r) {
              console.log(`${body.Name} done!`)
              db.close();
              getOneFundData(fundRichIdList);
            }
          });
        });
        // getOneFundData(fundRichIdList)
      }
    })
  })
}
// const mongodbUrl = 'mongodb://localhost:27017/fund'
// const options = {
//   url: 'https://apis.fundrich.com.tw/default/v1/funds',
//   method: 'POST',
//   body: {
//           PageSize: 10000,
//           PageIndex: 0,
//           Sort: "Name",
//           OrderDesc: false,
//           Name: ""
//         },
//   json: true,
// }
// request(options, (error, response, body) => {
//   if (error) {
//     console.error(`error: ${error}`)
//   }
//   else {
//     console.log(JSON.stringify(body))
//     for (fund of body.Items) {
//       console.log(fund.FundId)
//     }
//   }
// })


fs.readFile('../data/fundRichIdFullList', (err, data) => {
  if (err) throw err
  const fundRichIdList = data.toString().split('\n')
  // console.log(fundRichIdList)
  getOneFundData(fundRichIdList)
})
