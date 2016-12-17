'use strict'

const request = require('request')
const _ = require('lodash')

const sleep = time => new Promise(resolve => setTimeout(resolve, time))
const getRandomMiniSec = () => parseInt((Math.random() * 0.001 * 1000), 10)
let firstFlag = true

function getDetailData(fundRichIdList) {
  sleep(getRandomMiniSec()).then(() => {
    if (fundRichIdList.length <= 0) {
      return 0
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
        getDetailData(fundRichIdList)
      } else {
        if (firstFlag) {
          for (const key of _.keys(body)) {
            if (key === 'StopTradeType') {
              process.stdout.write(`"${key}"\n`)
              break
            }
            process.stdout.write(`"${key}",`)
          }
          firstFlag = false
        }
        for (const key of _.keys(body)) {
          if (key === 'StopTradeType') {
            process.stdout.write(`"${body[key]}"\n`)
            break
          } else {
            process.stdout.write(`"${body[key]}",`)
          }
        }
        getDetailData(fundRichIdList)
      }
    })
    return 'sleep return'
  })
}

function updateAll() {
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
      getDetailData(fundRichIdList)
    }
  })
}

updateAll()
