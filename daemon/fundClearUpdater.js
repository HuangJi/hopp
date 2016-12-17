'use strict'

const fs = require('fs')
const co = require('co')
const _ = require('lodash')
const mkdirp = require('mkdirp')
const request = require('request')
const cheerio = require('cheerio')
const moment = require('moment')
const scalegridMongo = require('./scalegridMongo')

const collectionName = 'FCNav'

let count = 0

const sleep = time => new Promise(resolve => setTimeout(resolve, time))
const getRandomMiniSec = () => parseInt((Math.random() * 0.02 * 1000), 10)

function getOneFundClearData(fundIDList, userAgentList, currentDateString) {
  sleep(getRandomMiniSec()).then(() => {
    if (fundIDList.length <= 0) {
      return
    }
    const fundID = fundIDList.shift()
    const options = {
      url: `http://announce.fundclear.com.tw/MOPSFundWeb/A01_11.jsp?fundId=${fundID}&navMonth=1`,
      headers: {
        'User-Agent': userAgentList[parseInt((Math.random() * 999) % userAgentList.length, 10)],
      },
    }
    request(options, (error, response, body) => {
      if (error) {
        console.error(`error: ${error}`)
        getOneFundClearData(fundIDList, userAgentList, currentDateString)
      } else {
        count += 1
        const $ = cheerio.load(body)
        let fundData = $('param[name=htNav]').attr('value')
        if (fundData === undefined) {
          getOneFundClearData(fundIDList, userAgentList, currentDateString)
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
              createdAt: moment().utcOffset('+0800').format('YYYYMMDD'),
              updatedAt: moment().utcOffset('+0800').format('YYYYMMDD'),
            }
          }
          const path = `./staticData/fundClear/${currentDateString}FCNav/${fundID}.json`
          fs.writeFile(path, JSON.stringify(dateData, null, 4), (writeError) => {
            if (writeError) throw writeError
            console.log(`write FCNav ${fundID}!`)
          })
          scalegridMongo.connect((err, db) => {
            const col = db.collection(collectionName)
            const filter = { FCId: fundID }
            co(function* __() {
              const updateObject = {}
              const fcNavObject = yield col.find(filter).limit(1).next()
              for (const dateKey of _.keys(dateData)) {
                const updateKey = `data.${dateKey}`
                if (!fcNavObject.data[dateKey]) {
                  updateObject[updateKey] = {
                    Price: dateData[dateKey].Price,
                    TransDate: dateData[dateKey].TransDate,
                    createdAt: moment().utcOffset('+0800').format('YYYYMMDD'),
                    updatedAt: moment().utcOffset('+0800').format('YYYYMMDD'),
                  }
                  const result = yield col.update(filter, { $set: updateObject }, { upsert: true })
                  if (result) console.log(`new result: ${result} ${filter.FCId} ${dateKey}`)
                } else if (fcNavObject.data[dateKey].Price !== dateData[dateKey].Price) {
                  updateObject[updateKey] = {
                    Price: dateData[dateKey].Price,
                    TransDate: dateData[dateKey].TransDate,
                    createdAt: fcNavObject.data[dateKey].createdAt,
                    updatedAt: moment().utcOffset('+0800').format('YYYYMMDD'),
                  }
                  const result = yield col.update(filter, { $set: updateObject }, { upsert: true })
                  if (result) console.log(`fundClear request success:${fundID} and done! count:${count}`)
                }
              }
            }).then(() => {
              db.close()
            }).catch((coError) => {
              console.log(coError.stack)
            })
            getOneFundClearData(fundIDList, userAgentList, currentDateString)
          })
        }
      }
    })
  })
}

function updateAll(currentDateString) {
  fs.readFile('data/fund_id', (err, data) => {
    if (err) throw err
    const fundIDList = data.toString().split('\n')
    fs.readFile('data/user_agent', (e, fundData) => {
      if (e) {
        console.error(e)
      } else {
        const userAgentList = fundData.toString().split('\n')
        mkdirp(`./staticData/fundClear/${currentDateString}FCNav`, (fsError) => {
          if (fsError) {
            console.error(`err:${err}`)
          } else {
            getOneFundClearData(fundIDList, userAgentList, currentDateString)
          }
        })
      }
    })
  })
}

module.exports = {
  updateAll,
}
