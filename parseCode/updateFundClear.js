'use strict'

const fs = require('fs')
// const stringjs = require('string')
const request = require('request')
const cheerio = require('cheerio')
const MongoClient = require('mongodb').MongoClient

const mongodbUrl = 'mongodb://wilson:Wil9999Wil9999Wil9999@SG-howfintechmongo-8817.servers.mongodirector.com:27017/source?ssl=true'
const ca = [fs.readFileSync('/Users/wilson/.ssh/scalegrid.crt')]
const serverOption = { server: { sslValidate: true, sslCA: ca } }
const collectionName = 'FCNav'

let count = 0

const sleep = time => new Promise(resolve => setTimeout(resolve, time))
const getRandomMiniSec = () => parseInt((Math.random() * 0.02 * 1000), 10)

function getOneFundClearData(fundIDList, userAgentList) {
  sleep(getRandomMiniSec()).then(() => {
    if (fundIDList.length <= 0) {
      return
    }
    const fundID = fundIDList.shift()
    const options = {
      url: `http://announce.fundclear.com.tw/MOPSFundWeb/A01_11.jsp?fundId=${fundID}&navMonth=240`,
      headers: {
        'User-Agent': userAgentList[parseInt((Math.random() * 999) % userAgentList.length, 10)],
      },
    }
    request(options, (error, response, body) => {
      if (error) {
        console.error(`error: ${error}`)
        getOneFundClearData(fundIDList, userAgentList)
      } else {
        count += 1
        const $ = cheerio.load(body)
        let fundData = $('param[name=htNav]').attr('value')
        if (fundData === undefined) {
          getOneFundClearData(fundIDList, userAgentList)
        } else {
          fundData = fundData.replace(/ /g, '')
          fundData = fundData.replace(/{/g, '')
          fundData = fundData.replace(/}/g, '')
          const fundDataList = fundData.split(',')
          const dateData = {}
          for (let i = 0; i < fundDataList.length; i += 1) {
            const keyValue = fundDataList[i].split('=')
            dateData[keyValue[0].replace(/\//g, '')] = {
              Price: parseFloat(keyValue[1]),
              TransDate: keyValue[0].replace(/\//g, ''),
            }
          }
          MongoClient.connect(mongodbUrl, serverOption, (err, db) => {
            const collection = db.collection(collectionName)
            const filter = {
              FCId: fundID,
              howfundId: '',
            }
            collection.updateMany(filter,
              { $set: { data: dateData } },
              { upsert: true }, (e, r) => {
                if (!error && r) {
                  console.log(`fundClear request success:${fundID} and done! count:${count}`)
                  db.close()
                  getOneFundClearData(fundIDList, userAgentList)
                }
              })
          })
        }
      }
    })
  })
}

function updateAll() {
  fs.readFile('../data/fund_id', (err, data) => {
    if (err) throw err
    const fundIDList = data.toString().split('\n')
    fs.readFile('../data/user_agent', (e, fundData) => {
      if (e) {
        console.error(e)
      } else {
        const userAgentList = fundData.toString().split('\n')
        getOneFundClearData(fundIDList, userAgentList)
      }
    })
  })
}

updateAll()
