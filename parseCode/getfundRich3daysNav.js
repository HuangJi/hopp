'use strict'

const request = require('request')
// const _ = require('lodash')
const sleep = time => new Promise(resolve => setTimeout(resolve, time))
const getRandomMiniSec = () => parseInt((Math.random() * 0.001 * 1000), 10)

function getNavData(fundRichIdList) {
  sleep(getRandomMiniSec()).then(() => {
    if (fundRichIdList.length <= 0) {
      return 0
    }
    const fundRichId = fundRichIdList.shift()
    const options = {
      method: 'GET',
      url: `https://apis.fundrich.com.tw/default/v1/funds/navPrices/${fundRichId}?duration=3m`,
      json: true,
    }
    request(options, (error, response, bodys) => {
      if (error) {
        console.error(`error: ${error}`)
        getNavData(fundRichIdList)
      } else {
        let nav0909
        let nav0912
        let nav0913
        for (const nav of bodys) {
          if (nav.TransDate === '20160909') {
            nav0909 = nav.Price
          }
          if (nav.TransDate === '20160912') {
            nav0912 = nav.Price
          }
          if (nav.TransDate === '20160913') {
            nav0913 = nav.Price
          }
        }
        console.log(`${fundRichId},${nav0909},${nav0912},${nav0913}`)
        getNavData(fundRichIdList)
      }
    })
    return 'sleep return'
  })
}

function getAllFundRichId() {
  const options = {
    url: 'https://apis.fundrich.com.tw/default/v1/funds',
    method: 'POST',
    body: {
      PageSize: 10000,
      PageIndex: 1,
      Sort: 'Name',
      OrderDesc: false,
      Name: '',
    },
    json: true,
  }

  request(options, (error, response, result) => {
    if (error) {
      console.error(`error: ${error}`)
    } else {
      const fundRichIdList = []
      let fund
      for (fund of result.Items) {
        fundRichIdList.push(fund.FundId)
      }
      getNavData(fundRichIdList)
    }
  })
}
// rrra
getAllFundRichId()
