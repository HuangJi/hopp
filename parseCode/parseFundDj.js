'use strict'

const csv = require('csv-parser')
const iconv = require('iconv-lite')
const fs = require('fs')
const stringjs = require('string')
const Readable = require('stream').Readable
const MongoClient = require('mongodb').MongoClient

const mongodbUrl = 'mongodb://wilson:Wil9999Wil9999Wil9999@SG-howfintechmongo-8817.servers.mongodirector.com:27017/source?ssl=true'
const collectionName = 'fundDJ'
const ca = [fs.readFileSync('/Users/wilson/.ssh/scalegrid.crt')]
const fileStr = fs.readFileSync('../data/fundDJnew.csv', { encoding: 'binary' })
const buf = new Buffer(fileStr, 'binary')
const str = iconv.decode(buf, 'Big5')
const stream = new Readable()
const serverOption = { server: { sslValidate: true, sslCA: ca } }

stream.push(str)    // the string you want
stream.push(null)      // indicates end-of-file basically - the end of the stream

let database
let collection

function schemaModify(data) {
  const modifiedData = {}
  Object.keys(data).forEach((key) => {
    if (typeof data[key] === 'string') {
      modifiedData[key] = stringjs(data[key]).collapseWhitespace().s
    }
  })
  const storedData = {
    howfintechId: '',
    serial: parseFloat(modifiedData['序']),
    FDId: modifiedData[' DJ代號'],
    chineseFullName: modifiedData['基金名稱'],
    englishFullName: modifiedData['英文名稱'],
    offshoreCompany: modifiedData['海外發行公司'],
    taiwanGeneralAgency: modifiedData['台灣總代理'],
    startDate: modifiedData['成立日期'],
    fundValidDate: modifiedData['基金核准生效日'],
    fundScale: modifiedData['基金規模'],
    fundType: modifiedData['基金類型'],
    investment: modifiedData['投資標的'],
    managementFeeUpperBound: parseFloat(modifiedData['最高經理費(%)']),
    salesFeeUpperBound: parseFloat(modifiedData['最高銷售費(%)']),
    custodianFeeUpperBound: parseFloat(modifiedData['最高保管費(%)']),
    isinCode: modifiedData['ISIN CODE'],
    custodian: modifiedData['保管機構'],
    registration: modifiedData['註冊地'],
    generalValidDate: modifiedData['總代理基金生效日'],
    currencyType: modifiedData['計價幣別'],
    region: modifiedData['投資區域'],
    riskLevel: modifiedData['風險報酬等級'],
    ratings: modifiedData['基金評等'],
    manager: modifiedData['經理人'],
    isOnePrice: modifiedData['單一報價'],
    dividendFrequency: modifiedData['配息頻率'],
    isUmbrella: modifiedData['傘狀基金'],
    feeNote: modifiedData['費用備註'],
    docsDownload: modifiedData['文件下載'],
    benchmark: modifiedData['指標指數'],
    investmentStrategy: modifiedData['投資策略'],
    salesAgency: modifiedData['銷售機構'],
    linkProduct: modifiedData['基金連結保單'],
  }
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
        const storedData = schemaModify(data)
        const filter = {
          FDId: storedData.FDId,
        }
        collection.updateMany(filter, { $set: storedData }, { upsert: true }, (e, r) => {
          if (!e && r) {
            console.log(`${storedData.FDId} storing done`)
          }
        })
      })
      .on('end', () => {
        console.log('end')
        database.close()
      })
  }
})
