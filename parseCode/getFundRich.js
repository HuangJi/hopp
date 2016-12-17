const request = require('request')
const cheerio = require('cheerio')
// const MongoClient = require('mongodb').MongoClient
const fs = require('fs')

// const mongodbUrl = 'mongodb://localhost:27017/fund'
const options = {
  url: 'https://apis.fundrich.com.tw/default/v1/funds',
  method: 'POST',
  body: {
          PageSize: 10000,
          PageIndex: 0,
          Sort: "Name",
          OrderDesc: false,
          Name: ""
        },
  json: true,
}
request(options, (error, response, body) => {
  if (error) {
    console.error(`error: ${error}`)
  }
  else {
    // console.log(JSON.stringify(body))
    for (fund of body.Items) {
      console.log(fund.FundId)
    }
  }
})
// function getOnePageFundRichData(i, fundRichDataList) {
//   if (i > 2) {
//     // console.log(fundRichDataList)
//     for (fund of fundRichDataList) {
//       console.log(fund)
//     }
//     return
//   }
//   else {
//     const options = {
//       url: 'https://apis.fundrich.com.tw/default/v1/funds',
//       method: 'POST',
//       body: {
//               PageSize: 10000,
//               PageIndex: i,
//               Sort: "Name",
//               OrderDesc: false,
//               Name: ""
//             },
//       json: true,
//     }
//     request(options, (error, response, body) => {
//       if (error) {
//         console.error(`error: ${error}`)
//         return []
//       }
//       else {
//         for (oneFund of body.Items) {
//           fundRichDataList.push({
//             fundRichId: oneFund.FundId,
//             fundRichName: oneFund.Name,
//           })
//         }
//         getOnePageFundRichData(i + 1, fundRichDataList)
//       }
//     })
//   }
// }

// let fundRichDataList = []
// getOnePageFundRichData(0, fundRichDataList)
