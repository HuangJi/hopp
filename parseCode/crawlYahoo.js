'use strict'

const MongoClient = require('mongodb').MongoClient

const mongodbUrl = 'mongodb://localhost:27017/fund'
const request = require('request')
const cheerio = require('cheerio')
const S = require('string')
const fs = require('fs')

const collectionName = 'rawFund'

function getRandomMiniSec() {
  return parseInt((Math.random() * 0.05 * 1000), 10)
}

const sleep = time => new Promise(resolve => setTimeout(resolve, time))
const yahooIdList = []

function getProviderFunds(yahooProviderUrlList, callback) {
  sleep(getRandomMiniSec()).then(() => {
    if (yahooProviderUrlList.length <= 0) {
      callback(yahooIdList)
      return 0
    }
    const url = yahooProviderUrlList.shift()
    const options = {
      url,
    }

    request(options, (error, response, body) => {
      if (error) {
        console.error(`error: ${error}`)
        getProviderFunds(yahooProviderUrlList, callback)
      } else {
        const $ = cheerio.load(body)
        // let table = $('.Bgc-w').children().next().next().children().attr('href')
        $('.Bgc-w').find('.Ta-start').children().map((i, element) => {
          const yahooId = element.attribs.href.split('/')[3]
          const fundName = element.children[0].data
          if (yahooId !== undefined) {
            console.log(`${yahooId} and ${fundName}`)
            console.error(`${yahooId} is done!`)
            yahooIdList.push(yahooId)
          }
        })
        getProviderFunds(yahooProviderUrlList, callback)
      }
    })
  })
}

function getNavByYahooId(yahooIdList) {
  sleep(getRandomMiniSec()).then(() => {
    if (yahooIdList.length <= 0) {
      return 0
    }
    const yahooId = yahooIdList.shift()
    const options = {
      url: `https://tw.money.yahoo.com/fund/summary/${yahooId}`,
    }

    request(options, (error, response, body) => {
      if (error) {
        console.error(`error: ${error}`)
        getNavByYahooId(yahooIdList)
      }
      else {
        const $ = cheerio.load(body)
        let fundChineseName = $('.mfund-header').children().children().first().text()
        const nav = $('.mfund-header').children().next().children().children().first().text()
        let dateString = $('.mfund-header').children().next().children().next().children().text()

        fundChineseName = S(fundChineseName).collapseWhitespace().s
        dateString = dateString.substring(0, 10)

        console.log(nav)
        console.log(dateString)
        // console.log(fundChineseName)

        MongoClient.connect(mongodbUrl, (err, db) => {
          const collection = db.collection(collectionName)
          const filter = {
            fundChineseName,
          }
          const navKey = `yahoo.nav.${dateString}`
          const updateObject = {
            'yahoo.yahooId': yahooId,
          }
          updateObject[navKey] = nav
          collection.updateMany(filter, { $set: updateObject }, { upsert: true }, (e, r) => {
            if (!e) {
              console.log(`${fundChineseName} update done!`)
              db.close()
              getNavByYahooId(yahooIdList)
            }
            else {
              console.log(e)
              db.close()
              getNavByYahooId(yahooIdList)
            }
          })
        })
        // let table = $('.Bgc-w').children().next().next().children().attr('href')
        // $('.Bgc-w').find('.Ta-start').children().map((i, element) => {
        //  const yahooId = element.attribs.href.split('/')[3]
        //  const fundName = element.children[0].data
        //  if (yahooId != undefined) {
        //    console.log(`${yahooId} and ${fundName}`)
        //    console.error(`${yahooId} is done!`)
        //  }
        // })
        // getNavByYahooId(yahooIdList)
      }
    })
  })
}


fs.readFile('../data/yahooProviderUrlList', (err, data) => {
  if (err) throw err
  const yahooProviderUrlList = data.toString().split('\n')
  getProviderFunds(yahooProviderUrlList, (yahooIdList) => {
    getNavByYahooId(yahooIdList)
  })
})
