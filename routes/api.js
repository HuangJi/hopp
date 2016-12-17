const express = require('express')
const MongoClient = require('mongodb').MongoClient
const scalegridConnect = require('../daemon/scalegridMongo').scalegridConnect
const scalegridPromiseConnect = require('../daemon/scalegridMongo').scalegridPromiseConnect
const howfundHelper = require('../parseCode/howfundHelper')
const co = require('co')
const _ = require('lodash')

const router = express.Router()
const mongodbUrl = 'mongodb://localhost:27017/fund'
const collectionName = 'rawFund'
const apiKey = '2c0a50b4a76d83d77cae1f859a40de55c0b07877'
const empty = '---'

let collection
let filter
let fields
let db

/* GET users listing. */
router.get('/docs', (req, res) => {
  res.render('apidocs', { title: 'API Docs' })
})

router.get('/v0/fund/info', (req, res) => {
  const queryName = req.query.name
  console.log(queryName)
  res.json({ name: queryName })
})

router.post('/v0/fund/info', (req, res) => {
  res.setHeader('X-Powered-By', 'Wilson Huang')
  if (req.headers.authorization !== apiKey) {
    res.setHeader('WWW-Authenticate', 'Invalid API Key.')
    res.status(401).json({
      code: 401,
      message: 'Invalid API Key.',
    })
  } else {
    console.log(req.headers.authorization)
    if (req.body.name === undefined || req.body.name === '') {
      res.status(400).json({
        code: 400,
        message: 'name cannot be empty. Remember to put your parameter into body.',
      })
    } else {
      MongoClient.connect(mongodbUrl, (err, database) => {
        db = database
        collection = db.collection('fundCollection')
        filter = {
          fundChineseName: new RegExp(req.body.name),
        }
        console.log(filter)
        collection.find(filter).toArray((error, docs) => {
          if (!error) {
            const responseObject = []
            for (const fund of docs) {
              const object = {}
              object.fundChineseName = fund.fundChineseName
              object.fundEnglishName = fund.fundEnglishName
              object.isinCode = fund.isinCode
              object.currencyType = fund.currencyType
              responseObject.push(object)
            }
            res.json(responseObject)
          }
        })
      })
    }
  }
})

router.post('/v0/fund/detail', (req, res) => {
  res.setHeader('X-Powered-By', 'Wilson Huang')
  if (req.headers.authorization !== apiKey) {
    res.setHeader('WWW-Authenticate', 'Invalid API Key.')
    res.status(401).json({
      code: 401,
      message: 'Invalid API Key.',
    })
  } else {
    console.log(req.headers.authorization)
    if (req.body.name === undefined || req.body.name === '') {
      res.status(400).json({
        code: 400,
        message: 'name cannot be empty.',
      })
    } else {
      MongoClient.connect(mongodbUrl, (err, database) => {
        db = database
        collection = db.collection(collectionName)
        filter = { fundChineseName: req.body.name }
        fields = {
          _id: 0,
          currencyType: 1,
          fundChineseName: 1,
          fundEnglishName: 1,
          isinCode: 1,
          'fundRich.detail.ManagementFee': 1,
          'fundRich.detail.InvestmentStrategy': 1,
          'fundRich.detail.Rr1M': 1,
          'fundRich.detail.Rr3M': 1,
          'fundRich.detail.RrThisYear': 1,
          'fundRich.detail.InceptionYmdOn': 1,
          'fundRich.detail.FundSize': 1,
        }
        collection.findOne(filter, fields, (error, docs) => {
          if (error) {
            res.status(505).json({ status: 'db error', message: error })
          } else {
            const object = _.cloneDeep(docs)
            const detailObject = {
              agentChineseName: empty,
              fundManager: empty,
              latestNavDate: empty,
              latestNav: empty,
              highestInYearNav: empty,
              lowestInYearNav: empty,
              returnRateDate: empty,
              returnRateFromM: docs.fundRich.detail.Rr1M,
              returnRateFromQ: docs.fundRich.detail.Rr3M,
              returnRateFromY: docs.fundRich.detail.RrThisYear,
              category: empty,
              initialAsset: empty,
              riskLevel: empty,
              foundDate: docs.fundRich.detail.InceptionYmdOn,
              region: empty,
              netAsset: docs.fundRich.detail.FundSize,
              totalAssetDate: empty,
              managementFee: docs.fundRich.detail.ManagementFee,
              costodianFee: empty,
              otherCurrencyType: [empty],
              fundShareholding: [empty],
              graph: {
                '3M': [],
                '6M': [],
                '1Y': [],
                '2Y': [],
                '3Y': [],
              },
              documentDownload: empty,
              bemchmark: empty,
              investmentStrategy: docs.fundRich.detail.InvestmentStrategy,
              service: empty,
            }
            _.merge(object, detailObject)
            delete object.fundRich
            res.json(object)
          }
        })
      })
    }
  }
})

router.get('/v0/fund/list', (req, res) => {
  res.setHeader('X-Powered-By', 'Wilson Huang')
  if (req.headers.authorization !== apiKey) {
    res.setHeader('WWW-Authenticate', 'Invalid API Key.')
    res.status(401).json({
      code: 401,
      message: 'Invalid API Key.',
    })
  } else {
    console.log(req.headers.authorization)
    MongoClient.connect(mongodbUrl, (err, database) => {
      db = database
      collection = db.collection(collectionName)
      filter = { fundRich: { $exists: true } }
      fields = {
        _id: 0,
        fundChineseName: 1,
        fundEnglishName: 1,
        currencyType: 1,
        isinCode: 1,
      }
      collection.find(filter, fields).toArray((error, docs) => {
        if (error) {
          res.status(505).json({ status: 'db error', message: error })
        } else {
          const validObjects = _.map(_.filter(docs, fund => !_.isEmpty(fund)), 'fundChineseName')
          res.json(validObjects)
        }
      })
    })
  }
})

router.get('/v1/fund/list', (req, res) => {
  res.setHeader('X-Powered-By', 'Wilson Huang')
  if (req.headers.authorization !== apiKey) {
    res.setHeader('WWW-Authenticate', 'Invalid API Key.')
    res.status(401).json({
      code: 401,
      message: 'Invalid API Key.',
    })
  } else {
    console.log(req.headers.authorization)
    scalegridConnect((err, scalegridDb) => {
      if (err) {
        console.error(err)
      } else {
        scalegridDb.collection('fundCode').find({ FRId: { $ne: '' }, FCId: { $ne: '' } }).toArray((e1, docs) => {
          if (!e1 && docs) {
            console.log(docs.length)
            res.json(_.map(docs, 'howfundId'))
            scalegridDb.close()
          } else {
            console.error(`error:${e1}`)
            scalegridDb.close()
          }
        })
      }
    })
  }
})

router.post('/v1/fund/detail', (req, res) => {
  res.setHeader('X-Powered-By', 'Wilson Huang')
  if (req.headers.authorization !== apiKey) {
    res.setHeader('WWW-Authenticate', 'Invalid API Key.')
    res.status(401).json({
      code: 401,
      message: 'Invalid API Key.',
    })
  } else {
    console.log(req.headers.authorization)
    if (req.body.howfundId === undefined || req.body.howfundId === '') {
      res.status(400).json({
        code: 400,
        message: 'howfundId cannot be empty.',
      })
    } else {
      filter = { howfundId: req.body.howfundId }
      co(function* __() {
        const scalegridDb = yield scalegridPromiseConnect()
        const fundCodeData = yield scalegridDb.collection('fundCode').find(filter).limit(1).next()
        let frDetailData
        let frAllocationData
        let tejData
        let fundDjData

        if (fundCodeData.FRId) {
          frDetailData = yield scalegridDb.collection('FRDetail').find({ FRId: fundCodeData.FRId }).limit(1).next()
          frAllocationData = yield scalegridDb.collection('FRAllocation').find({ FRId: fundCodeData.FRId }).limit(1).next()
        }
        if (fundCodeData.tejId && req.body.howfundId.includes('F')) {
          console.log('offshore!!')
          tejData = yield scalegridDb.collection('tejOfatt').find({ tejId: fundCodeData.tejId }).limit(1).next()
        } else if (fundCodeData.tejId) {
          console.log('domestic!')
          tejData = yield scalegridDb.collection('tejAtt').find({ tejId: fundCodeData.tejId }).limit(1).next()
        }

        if (fundCodeData.FDId) {
          fundDjData = yield scalegridDb.collection('fundDJ').find({ FDId: fundCodeData.FDId }).limit(1).next()
        }
        const fundNavData = yield scalegridDb.collection('fundNav').find({ howfundId: fundCodeData.howfundId }).limit(1).next()
        const fundClearNavData = yield scalegridDb.collection('FCNav').find({ FCId: fundCodeData.FCId }).limit(1).next()
        const oneYearNavData = yield howfundHelper.getOneYearNavData(fundClearNavData.data)
        const fundNavObject = yield howfundHelper.parseFundNavData(fundNavData.navDate)
        const frDetailObject = yield howfundHelper.parseFRDetailData(frDetailData.data)
        const tejObject = yield howfundHelper.parseTejData(tejData.data)
        const shareHolding = yield howfundHelper.parseStockTopData(frAllocationData.data.StockTop)
        const dailyData = yield howfundHelper.getDailyDataFromHistoryData(fundClearNavData.data)
        console.log(`fundShareholding:${shareHolding}`)
        console.log(`dailyData:${JSON.stringify(dailyData, null, 4)}`)
        const detailObject = {
          chineseFullName: frDetailObject.Name,
          englishFullName: frDetailObject.NameEng,
          agentChineseName: frDetailObject.AgentCPName,
          isinCode: tejObject.isinCode,
          fundManager: tejObject.currentManagerA,
          categoryName: frDetailObject.CategoryName,
          startAsset: tejObject.startAsset,
          currencyCode: frDetailObject.CurrencyCode,
          riskLevel: frDetailObject.RiskRatingFromEst,
          inceptionYmdOn: frDetailObject.InceptionYmdOn,
          regionType: tejObject.regionType,
          fundSize: frDetailObject.FundSize,
          sizeTransDate: frDetailObject.SizeTransDate,
          managementFee: frDetailObject.ManagementFee,
          costodianFee: frDetailObject.Custodian,
          otherCurrencyType: frDetailObject.otherCurrencyType,
          distributionStatus: frDetailObject.DistnbutionStatus,
          bemchmark: fundDjData.benchmark,
          investmentStrategy: frDetailObject.InvestmentStrategy,
          latestNavDate: yield howfundHelper.getLatestDateString(Object.keys(fundNavData.navDate)),
          latestNav: fundNavObject.nav,
          dayChange: dailyData.dayChange || fundNavObject.dayChange,
          oneDayProfitRate: dailyData.dayChangeRate || fundNavObject.oneDayProfitRate,
          Sharpe1Y: fundNavObject.Sharpe1Y,
          highestInYearNav: dailyData.maxNavInYear || fundNavObject.highestInYearNav,
          lowestInYearNav: dailyData.minNavInYear || fundNavObject.lowestInYearNav,
          Rr1M: fundNavObject.Rr1M,
          Rr3M: fundNavObject.Rr3M,
          RrThisYear: fundNavObject.RrThisYear,
          fundShareholding: shareHolding,
          graph: oneYearNavData,
        }
        for (const key of Object.keys(detailObject)) {
          if (key !== 'dayChange' || key !== 'oneDayProfitRate') detailObject[key] = detailObject[key] || '---'
          if (detailObject[key] === '0') detailObject[key] = '---'
        }
        console.log(`frdetail name:${frDetailObject.Name}`)
        res.json(detailObject)
        scalegridDb.close()
      }).catch((err) => {
        console.log(err.stack)
      })
    }
  }
})

router.get('/v1/market/index', (req, res) => {
  res.setHeader('X-Powered-By', 'Wilson Huang')
  if (req.headers.authorization !== apiKey) {
    res.setHeader('WWW-Authenticate', 'Invalid API Key.')
    res.status(401).json({
      code: 401,
      message: 'Invalid API Key.',
    })
  } else {
    console.log(req.headers.authorization)
    scalegridConnect((err, scalegridDb) => {
      if (err) {
        console.error(err)
      } else {
        scalegridDb.collection('cyIdx').find().toArray((e1, docs) => {
          if (e1) {
            console.error(`error:${e1}`)
            scalegridDb.close()
          } else {
            const responseObjects = _.map(docs, (marketIndex) => {
              const dateIntArray = _.map(_.map(marketIndex.dateData, 'date'), _.parseInt)
              const latestDateString = _.max(dateIntArray).toString()
              for (const data of marketIndex.dateData) {
                if (data.date === latestDateString) {
                  return {
                    name: marketIndex.name,
                    type: marketIndex.type,
                    local: data.local,
                    quote: data.quote,
                    change: data.change,
                    changePercent: data.changePercent,
                    yearROI: parseFloat(parseFloat(data.yearROI).toFixed(4)) || '---',
                  }
                }
              }
              return {}
            })
            res.json(responseObjects)
            scalegridDb.close()
          }
        })
      }
    })
  }
})

module.exports = router
