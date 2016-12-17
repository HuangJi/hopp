'use strict'

const csv = require('csv-parser')
const iconv = require('iconv-lite')
const fs = require('fs')
const stringjs = require('string')
const Readable = require('stream').Readable
const MongoClient = require('mongodb').MongoClient

const mongodbUrl = 'mongodb://wilson:Wil9999Wil9999Wil9999@SG-howfintechmongo-8817.servers.mongodirector.com:27017/source?ssl=true'
const collectionName = 'tejOfatt'
const ca = [fs.readFileSync('/Users/wilson/.ssh/scalegrid.crt')]
const fileStr = fs.readFileSync('../data/wofatt.csv', { encoding: 'binary' })
const buf = new Buffer(fileStr, 'binary')
const str = iconv.decode(buf, 'Big5')
const stream = new Readable()
const serverOption = { server: { sslValidate: true, sslCA: ca } }

stream.push(str)    // the string you want
stream.push(null)      // indicates end-of-file basically - the end of the stream

// const sleep = time => new Promise(resolve => setTimeout(resolve, time))
// const getRandomMiniSec = () => parseInt((Math.random() * 0.1 * 1000), 10)
let database
let collection

function schemaModify(data) {
  // fundChineseName = stringjs(data['基金碼']).collapseWhitespace().s
  const modifiedData = {}
  Object.keys(data).forEach((key) => {
    if (typeof data[key] === 'string') {
      modifiedData[key] = stringjs(data[key]).collapseWhitespace().s
    }
  })
  const storedData = {
    howfundId: '',
    tejId: modifiedData['基金碼'],
    data: {},
  }
  storedData.data[modifiedData['淨值日']] = {
    navDate: modifiedData['淨值日'],
    nav: parseFloat(modifiedData['淨值']),
    isinCode: modifiedData['基金ISINCode'],
    chineseFullName: modifiedData['基金全稱'],
    englishFullName: modifiedData['基金英文全稱'],
    custodian: modifiedData['保管機構'],
    generalAgency: modifiedData['總代理機構'],
    issuingAgency: modifiedData['發行機構'],
    startDate: modifiedData['成立日'],
    enterDate: modifiedData['進場日'],
    registration: modifiedData['註冊地'],
    marketType: modifiedData['市場別'],
    regionType: modifiedData['區域別'],
    clearDate: modifiedData['清算/合併日'],
    withdrawDate: modifiedData['撤銷核備日'],
    clearDescription: modifiedData['清算/合併說明'],
    investment: modifiedData['投資標的'],
    tejCategory: modifiedData['TEJ分類'],
    guildCategory: modifiedData['公會分類'],
    riskLevel: modifiedData['風險收益等級'],
    majorFund: modifiedData['主基金標示'],
    majorFundId: modifiedData['主基金代碼'],
    startAsset: parseFloat(modifiedData['成立資產']),
    currencyType: modifiedData['幣別'],
    managementFeeUpperBound: parseFloat(modifiedData['經理費上限%']),
    managementFeeLowerBound: parseFloat(modifiedData['經理費下限%']),
    custodianFeeUpperBound: parseFloat(modifiedData['保管費上限%']),
    custodianFeeLowerBound: parseFloat(modifiedData['保管費下限%']),
    salesFeeUpperBound: parseFloat(modifiedData['銷售費上限%']),
    salesFeeLowerBound: parseFloat(modifiedData['銷售費下限%']),
    currentManagerA: modifiedData['現任經理人A'],
    currentManagerB: modifiedData['現任經理人B'],
    'req2-1FundScale': parseFloat(modifiedData['Req2-1基金規模']),
    req2FundScaleCurrencyType: modifiedData['Req2-基金規模幣別'],
    req2FundScaleDate: modifiedData['Req2-基金規模日期'],
    'req3-1Dividend': modifiedData['Req3-1配息方式'],
  }
  // storedData.map(x => stringjs(x).collapseWhitespace().s)
  return storedData
}

// const tejData = []
MongoClient.connect(mongodbUrl, serverOption, (err, db) => {
  if (err) {
    console.error(err)
  } else {
    database = db
    collection = db.collection(collectionName)

    stream
      .pipe(csv())
      .on('data', (data) => {
        // data.id = data['基金碼']
        // delete data['基金碼']
        // tejData.push(schemaModify(data))
        const storedData = schemaModify(data)
        const filter = {
          tejId: storedData.tejId,
        }
        collection.updateMany(filter, { $set: storedData }, { upsert: true }, (e, r) => {
          if (!e && r) {
            console.log(`${storedData.tejId} storing done`)
          }
        })
      })
      .on('end', () => {
        console.log('end')
        database.close()
      })
  }
})
