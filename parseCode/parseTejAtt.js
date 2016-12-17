'use strict'

const csv = require('csv-parser')
const iconv = require('iconv-lite')
const fs = require('fs')
const stringjs = require('string')
const Readable = require('stream').Readable
const MongoClient = require('mongodb').MongoClient

const mongodbUrl = 'mongodb://wilson:Wil9999Wil9999Wil9999@SG-howfintechmongo-8817.servers.mongodirector.com:27017/source?ssl=true'
const collectionName = 'tejAtt'
const ca = [fs.readFileSync('/Users/wilson/.ssh/scalegrid.crt')]
const fileStr = fs.readFileSync('../data/watt.csv', { encoding: 'binary' })
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
    serial: modifiedData['基金統編'],
    isinCode: modifiedData['基金ISINCode'],
    chineseFullName: modifiedData['基金全稱'],
    englishFullName: modifiedData['基金英文全稱'],
    agentCompany: modifiedData['經理公司'],
    custodian: modifiedData['保管機構'],
    guaranteeAgency: modifiedData['保證機構'],
    generalAgency: modifiedData['總代理機構'],
    issuingAgency: modifiedData['發行機構'],
    startDate: modifiedData['成立日'],
    enterDate: modifiedData['進場日'],
    onMarketDate: modifiedData['上市日'],
    registration: modifiedData['註冊地'],
    marketType: modifiedData['市場別'],
    regionType: modifiedData['區域別'],
    clearDate: modifiedData['清算/合併日'],
    withdrawDate: modifiedData['撤銷核備日'],
    clearDescription: modifiedData['清算/合併說明'],
    type: modifiedData['類型'],
    category: modifiedData['型態'],
    investment: modifiedData['投資標的'],
    tejCategory: modifiedData['TEJ分類'],
    guildCategory: modifiedData['公會分類'],
    riskLevel: modifiedData['風險收益等級'],
    majorFund: modifiedData['主基金標示'],
    majorFundId: modifiedData['主機金代碼'],
    isUmbrella: modifiedData['傘狀基金'],
    umbrella1: modifiedData['傘狀基金成員1'],
    umbrella2: modifiedData['傘狀基金成員2'],
    totalIssue: parseFloat(modifiedData['發行總數']),
    startAsset: parseFloat(modifiedData['成立資產']),
    currencyType: modifiedData['幣別'],
    txUnit: parseFloat(modifiedData['交易單位']),
    managementFeeUpperBound: parseFloat(modifiedData['經理費上限%']),
    managementFeeLowerBound: parseFloat(modifiedData['經理費下限%']),
    custodianFeeUpperBound: parseFloat(modifiedData['保管費上限%']),
    custodianFeeLowerBound: parseFloat(modifiedData['保管費下限%']),
    salesFeeUpperBound: parseFloat(modifiedData['銷售費上限%']),
    salesFeeLowerBound: parseFloat(modifiedData['銷售費下限%']),
    redeemFee: parseFloat(modifiedData['贖回費(元)']),
    meetingFee10k: parseFloat(modifiedData['受益人大會費用(萬元)']),
    firstRedeemDate: modifiedData['第一次定贖日'],
    turnOpenDate: modifiedData['轉開放日'],
    currentManagerA: modifiedData['現任經理人A'],
    managerAPastFund1: modifiedData['A曾經管理之基金1'],
    managerAPastFund2: modifiedData['A曾經管理之基金2'],
    currentManagerB: modifiedData['現任經理人B'],
    managerBPastFund1: modifiedData['B曾經管理之基金1'],
    managerBPastFund2: modifiedData['B曾經管理之基金2'],
    investment1: modifiedData['投資標的1'],
    investment2: modifiedData['投資標的2'],
    investment3: modifiedData['投資標的3'],
    investment4: modifiedData['投資標的4'],
    investment5: modifiedData['投資標的5'],
    investment6: modifiedData['投資標的6'],
    investment7: modifiedData['投資標的7'],
    investment8: modifiedData['投資標的8'],
    investment9: modifiedData['投資標的9'],
    investment10: modifiedData['投資標的10'],
    investment11: modifiedData['投資標的11'],
    investment12: modifiedData['投資標的12'],
    investment13: modifiedData['投資標的13'],
    investment14: modifiedData['投資標的14'],
    investment15: modifiedData['投資標的15'],
    investment16: modifiedData['投資標的16'],
    investment17: modifiedData['投資標的17'],
    investment18: modifiedData['投資標的18'],
    originalName: modifiedData['原基金名稱'],
    originalFoundDate: modifiedData['原基金成立日'],
    changeName1: modifiedData['改名1'],
    changeNameDate1: modifiedData['改名日期1'],
    changeName2: modifiedData['改名2'],
    changeNameDate2: modifiedData['改名日期2'],
    changeName3: modifiedData['改名3'],
    changeNameDate3: modifiedData['改名日期3'],
    changeName4: modifiedData['改名4'],
    changeNameDate4: modifiedData['改名日期4'],
    changeIdDescription1: modifiedData['換碼說明1'],
    changeIdDescription2: modifiedData['換碼說明2'],
    changeIdDescription3: modifiedData['換碼說明3'],
    'req2-1FundScale': parseFloat(modifiedData['Req2-1基金規模']),
    req2FundScaleDate: modifiedData['Req2-基金規模日期'],
    'req3-1Dividend': modifiedData['Req3-1配息方式'],
    'req3-2DividendFrequency': modifiedData['Req3-2配息頻率'],
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
