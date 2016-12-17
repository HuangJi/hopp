'use strict'

const fs = require('fs')
const co = require('co')
const _ = require('lodash')
// const mkdirp = require('mkdirp')
// const csv = require('csv-parser')

const request = require('request')
const cheerio = require('cheerio')
const scalegridMongo = require('./scalegridMongo')

const moment = require('moment')
// const stream = fs.createReadStream('../data/cyidx.csv')
const cyidxJson = require('../data/cyidx')
const CyIdx = require('../models/cyIdx')

function getCyIdxData() {
  const options = { url: 'http://money.cnyes.com/pricemid.aspx' }
  request(options, (requestError, response, body) => {
    if (requestError) {
      console.error(`requestError:${requestError}`)
    } else {
      const $ = cheerio.load(body)
      // const kindListTable = $('.kindlist')
      const kindListTable = $('#container').children('#main4').children().next().next()
      const asiaBox = kindListTable.children().children()
      const asiaBoxTbody = asiaBox.children().children()
      // console.log(`asiaBoxTbody: ${asiaBoxTbody.children()}`)
      asiaBoxTbody.children().map((index, element) => {
        // console.log(element)
        // console.log(element.serializeArray())
        console.log(element)
        return $(this).text()
      })
      // console.log(`containers: ${containers.children('#main4').children().next().next()}`)
      // console.log(`$: ${$}`)
    }
  })
}

function storeTempDataToDb() {
  scalegridMongo.connect((scalegridError, db) => {
    _.map(cyidxJson, (marketIndex) => {
      const cyidxInstance = new CyIdx(marketIndex.name, marketIndex.type)
      cyidxInstance.pushDateData(moment().utcOffset('+0800').format('YYYYMMDD'),
                                marketIndex.quote,
                                marketIndex.change,
                                marketIndex.changePercent,
                                marketIndex.local)
      console.log(`cyidxInstance: ${JSON.stringify(cyidxInstance, null, 4)}`)
      const filter = { typeName: cyidxInstance.typeName }
      co(function* __() {
        const result = yield db.collection('cyIdx').update(filter,
                                                          { $set: cyidxInstance },
                                                          { upsert: true })
        if (result) console.log(`typeName: ${cyidxInstance.typeName}\nresult:${result}`)
      })
    })
    // const filter = { name:  }
  })
}

// storeTempDataToDb()
// console.log(cyidxJson)
// getCyIdxData()
