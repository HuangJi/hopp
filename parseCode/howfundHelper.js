'use strict'

const _ = require('lodash')
const co = require('co')

const empty = '---'

function getLatestDateString(dateStringArray) {
  return new Promise((resolve) => {
    const dateArray = _.map(dateStringArray, _.parseInt)
    const latestDate = _.max(dateArray)
    if (!latestDate) {
      return null
      // resolve('')
    }
    console.log(`latestDate:${latestDate}`)
    resolve(latestDate.toString())
    return 0
  })
}

function parseStockTopData(stockTopData) {
  return new Promise((resolve) => {
    co(function* __() {
      let content = ''
      const dateKey = yield getLatestDateString(Object.keys(stockTopData))
      console.log(`dateKey:${dateKey}`)
      if (dateKey) {
        const docs = stockTopData[dateKey]
        console.log(`docs:${docs}`)
        for (const x of docs) {
          content = content.concat(`${x.ExternalName} ${x.InvRate.toString()}\n`)
        }
      }
      resolve(content)
    })
  })
}

function parseFundNavData(fundNavData) {
  return new Promise((resolve) => {
    co(function* __() {
      console.log('parseFundNavData')
      const object = {}
      const dateKey = yield getLatestDateString(Object.keys(fundNavData))
      console.log(`dateKey:${dateKey}`)
      if (dateKey) {
        const doc = fundNavData[dateKey]
        object.navDate = doc.navDate
        object.nav = doc.nav
        object.dayChange = empty
        object.oneDayProfitRate = doc.oneDayProfitRate
        object.Sharpe1Y = doc.Sharpe1Y
        object.highestInYearNav = empty
        object.lowestInYearNav = empty
        object.Rr1M = doc.Rr1M
        object.Rr3M = doc.Rr3M
        object.RrThisYear = doc.RrThisYear
      }
      resolve(object)
    // return 0
    })
  })
}

function parseFRDetailData(frDetailData) {
  return new Promise((resolve) => {
    co(function* __() {
      console.log('parseFRDetailData')
      const object = {}
      const dateKey = yield getLatestDateString(Object.keys(frDetailData))
      if (dateKey) {
        const doc = frDetailData[dateKey]
        object.Name = doc.Name
        object.NameEng = doc.NameEng
        object.AgentCPName = doc.AgentCPName
        object.oneDayProfitRate = doc.oneDayProfitRate
        object.CategoryName = doc.CategoryName
        object.CurrencyCode = doc.CurrencyCode
        object.RiskRatingFromEst = 'RR'.concat(doc.RiskRatingFromEst.toString())
        object.InceptionYmdOn = doc.InceptionYmdOn
        object.FundSize = doc.FundSize
        object.SizeTransDate = doc.SizeTransDate
        object.ManagementFee = doc.ManagementFee
        object.Custodian = doc.Custodian
        object.DistnbutionStatus = doc.DistnbutionStatus
        object.InvestmentStrategy = doc.InvestmentStrategy
        object.otherCurrencyType = ''
      }
      resolve(object)
    // return 0
    })
  })
}

function parseTejData(tejData) {
  return new Promise((resolve) => {
    co(function* __() {
      console.log('parseTejData')
      const object = {}
      const dateKey = yield getLatestDateString(Object.keys(tejData))
      if (dateKey) {
        const doc = tejData[dateKey]
        console.log(`isinCode:${doc.isinCode}`)
        const managerList = []
        let managerString = ''
        if (doc.currentManagerA) { managerList.push(doc.currentManagerA) }
        if (doc.currentManagerB) { managerList.push(doc.currentManagerB) }
        for (const manager of managerList) { managerString = managerString.concat(`${manager};`) }
        object.isinCode = doc.isinCode
        object.currentManagerA = managerString.slice(0, -1)
        object.startAsset = doc.startAsset
        object.regionType = doc.regionType
      }
      resolve(object)
    // return 0
    })
  })
}

function getDailyDataFromHistoryData(data) {
  return new Promise((resolve) => {
    co(function* __() {
      const today = new Date()
      console.log(`Object.keys(data):${Object.keys(data)}`)
      const dateKeys = _.filter(Object.keys(data), x =>
        x.substring(0, 4) === today.getFullYear().toString()
      )
      const thisYearNavList = []
      // console.log(`dateKeys:${dateKeys}`)

      for (const x of dateKeys) { thisYearNavList.push(data[x].Price) }
      // const navList = _.map(data, x => x)
      // console.log(`thisYearNavList:${thisYearNavList}`)
      const maxNavInYear = _.max(thisYearNavList)
      const minNavInYear = _.min(thisYearNavList)
      const latestDateString = yield getLatestDateString(dateKeys)
      dateKeys.splice(-1, 1)
      // delete dateKeys[latestDateString]
      const secondLatestDateString = yield getLatestDateString(dateKeys)
      const dayChange = data[latestDateString].Price - data[secondLatestDateString].Price
      const dayChangeRate = (dayChange / data[secondLatestDateString].Price) * 100
      console.log(`data[latestDateString].Price:${data[latestDateString].Price}`)
      console.log(`data[secondLatestDateString].Price:${data[secondLatestDateString].Price}`)
      const returnObject = {
        maxNavInYear,
        minNavInYear,
        dayChange,
        dayChangeRate,
      }
      resolve(returnObject)
      // for (const x of Object.keys(data)) {
      //   _.filter()
      // }
    })
  })
}

function getOneYearNavData(data) {
  return new Promise((resolve) => {
    co(function* __() {
      const latestDateString = yield getLatestDateString(Object.keys(data))
      const thisYear = parseInt(latestDateString.substring(0, 4), 10)
      const lastYearStartDateString = (thisYear - 1).toString() + latestDateString.substring(4, 8)
      const todayInt = parseInt(latestDateString, 10)
      const lastYearStartDateInt = parseInt(lastYearStartDateString, 10)
      const returnObject = {}
      for (const k of Object.keys(data)) {
        const kInt = parseInt(k, 10)
        if (kInt < todayInt && kInt > lastYearStartDateInt) {
          returnObject[k] = data[k]
        }
      }
      resolve(returnObject)
    })
  })
}

module.exports = {
  getLatestDateString,
  parseStockTopData,
  parseFundNavData,
  parseFRDetailData,
  parseTejData,
  getDailyDataFromHistoryData,
  getOneYearNavData,
}
