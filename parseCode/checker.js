'use strict'

// const fs = require('fs')
// const stringjs = require('string')
const request = require('request')
const cheerio = require('cheerio')

const checkFundList = [
  {
    isOffshore: true,
    fundRichId: '101003',
    fundClearId: 'IE00BCDZ0720',
    yahooId: 'F00000SPU9:FO',
  },
  {
    isOffshore: true,
    fundRichId: '058050',
    fundClearId: 'IE00BQJZX317',
    yahooId: 'F00000UK2Q:FO',
  },
  {
    isOffshore: false,
    fundRichId: 'UBS003',
    yahooId: 'F00000WZCJ:FO',
  },
  {
    isOffshore: false,
    fundRichId: 'UBS005',
    yahooId: 'F00000WZCL:FO',
  },
]

class Checker {
  construtor(config) {
    this.name = config.name
    this.yesterday = null
    // this.yesterday = new Date()
  }
  // getTodayDateFormatByType(type) {
  //   // let name = this.name
  //   let dateString
  //   if (typeof type !== 'string') {
  //     console.error('Not right type!')
  //     dateString = ''
  //   } else if (type === 'slash') {
  //     dateString = new Date().toISOString().slice(0, 10).replace(/-/gi, '/')
  //   } else if (type === 'blank') {
  //     dateString = new Date().toISOString().slice(0, 10).replace(/-/gi, '')
  //   } else {
  //     console.error('Not right type!')
  //     dateString = ''
  //   }
  //   return dateString
  // }

  getYesterdayDateFormatByType(type) {
    // let name = this.name
    this.yesterday = new Date()
    this.yesterday.setDate(this.yesterday.getDate() - 1)
    let dateString
    if (typeof type !== 'string') {
      console.error('Not right type!')
      dateString = ''
    } else if (type === 'slash') {
      dateString = this.yesterday.toISOString().slice(0, 10).replace(/-/gi, '/')
    } else if (type === 'blank') {
      dateString = this.yesterday.toISOString().slice(0, 10).replace(/-/gi, '')
    } else {
      console.error('Not right type!')
      dateString = ''
    }
    return dateString
  }

  checkFundRichTodayNav(id) {
    const options = {
      method: 'GET',
      url: `https://apis.fundrich.com.tw/default/v1/funds/${id}`,
      json: true,
    }
    request(options, (error, response, body) => {
      if (error) {
        console.error(`error: ${error}`)
      } else if (!body.Recent30DPrice) {
        console.error('body.Recent30DPrice error!')
      } else {
        for (const nav of body.Recent30DPrice) {
          // console.log(this.getTodayDateFormatByType('blank'))
          if (nav.TransDate === this.getYesterdayDateFormatByType('blank')) {
            console.log(`#############\nfundRich ${id} ${new Date()}\n${this.getYesterdayDateFormatByType('slash')}, nav: ${nav.Price}\n#############\n`)
          } else {
            // console.log(`fundRich ${new Date()} nav: null`)
          }
        }
      }
    })
  }

  checkFundClearTodayNav(id) {
    const options = {
      url: `http://announce.fundclear.com.tw/MOPSFundWeb/A01_11.jsp?fundId=${id}&navMonth=1`,
    }
    request(options, (error, response, body) => {
      if (error) {
        console.error(`error: ${error}`)
      } else {
        const $ = cheerio.load(body)
        let fundData = $('param[name=htNav]').attr('value')
        if (fundData === undefined) {
          console.error('fundData is undefined')
        } else {
          fundData = fundData.replace(/ /g, '')
          fundData = fundData.replace(/{/g, '')
          fundData = fundData.replace(/}/g, '')
          const fundDataList = fundData.split(',')
          for (let i = 0; i < fundDataList.length; i += 1) {
            const keyValue = fundDataList[i].split('=')
            // console.log(keyValue)
            // console.log(this.getYesterdayDateFormatByType('slash'))
            // console.log(new Date())
            if (keyValue[0] === this.getYesterdayDateFormatByType('slash')) {
              console.log(`#############\nfundClear ${id} ${new Date()}\n${this.getYesterdayDateFormatByType('slash')}, nav: ${keyValue[1]}\n#############\n`)
            } else {
              // console.log(`fundClear ${new Date()} nav: null`)
            }
          }
        }
      }
    })
  }

  checkYahooTodayNav(id) {
    const options = {
      url: `https://tw.money.yahoo.com/fund/summary/${id}`,
    }
    request(options, (error, response, body) => {
      if (error) {
        console.error(`error: ${error}`)
      } else {
        const $ = cheerio.load(body)
        // console.log('yahoo response')
        // let fundChineseName = $('.mfund-header').children().children().first().text()
        const nav = $('.mfund-header').children().next().children().children().first().text()
        let dateString = $('.mfund-header').children().next().children().next().children().text()
        // fundChineseName = stringjs(fundChineseName).collapseWhitespace().s
        dateString = dateString.substring(0, 10)
        // console.log(`dateString: ${dateString}\nnav: ${nav}`)
        if (dateString === this.getYesterdayDateFormatByType('slash')) {
          console.log(`#############\nyahoo ${id} ${new Date()}\n${this.getYesterdayDateFormatByType('slash')}, nav: ${nav}\n#############\n`)
        } else {
          // console.log(`yahoo ${new Date()} nav: null`)
        }
      }
    })
  }

  dailyCheck() {
    for (const fund of checkFundList) {
      if (fund.isOffshore) {
        this.checkFundClearTodayNav(fund.fundClearId)
      }
      this.checkYahooTodayNav(fund.yahooId)
      this.checkFundRichTodayNav(fund.fundRichId)
    }
  }
}

module.exports = Checker
// console.log(getYesterdayDateFormatByType('33'))
