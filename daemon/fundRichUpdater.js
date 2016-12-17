'use strict'

const fs = require('fs')
const mkdirp = require('mkdirp')
const request = require('request')
const scalegridMongo = require('./scalegridMongo')
const _ = require('lodash')

const collectionDetailName = 'FRDetail'
const collectionNavName = 'FRNav'
const collectionAllocationName = 'FRAllocation'
const collectionDividendName = 'FRDividend'
const dataPath = './staticData'

const sleep = time => new Promise(resolve => setTimeout(resolve, time))
const getRandomMiniSec = () => parseInt((Math.random() * 0.05 * 1000), 10)

function getFundRichIdList(callback) {
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
      callback(error, null)
    } else {
      const fundRichIdList = []
      for (const fund of result.Items) {
        fundRichIdList.push(fund.FundId)
      }
      callback(null, fundRichIdList)
    }
  })
}

function getMissIdList(source, type, date, callback) {
  if (source === 'fundClear' && type === 'FCNav') {
    fs.readdir(`${dataPath}/${source}/${date}${type}`, (readdirError, files) => {
      if (readdirError) {
        // console.error(`readdirError:${readdirError}`)
        callback(readdirError, null)
      } else {
        const idList = []
        for (const file of files) { idList.push(file.replace('.json', '')) }
        callback(null, idList)
        getFundRichIdList((error, results) => {
          const missIdList = _.difference(results, idList)
          callback(null, missIdList)
        })
      }
    })
  } else if (source === 'fundRich') {
    if (type === 'FRDividend') {
      fs.readdir(`${dataPath}/${source}/${date}${type}`, (readdirError, files) => {
        if (readdirError) {
          callback(readdirError, null)
        } else {
          const idList = []
          for (const file of files) { idList.push(file.replace('.json', '')) }
          scalegridMongo.connect((dbError, db) => {
            if (dbError) {
              console.error(`dbError:${dbError}`)
            } else {
              db.collection('FRDividend').find({}, { FRId: 1 }).toArray((colError, docs) => {
                if (colError) {
                  console.error(`colError:${colError}`)
                } else {
                  const results = _.map(docs, object => object.FRId)
                  const missIdList = _.difference(results, idList)
                  callback(null, missIdList)
                }
              })
            }
          })
        }
      })
    } else {
      fs.readdir(`${dataPath}/${source}/${date}${type}`, (readdirError, files) => {
        if (readdirError) {
          callback(readdirError, null)
        } else {
          const idList = []
          for (const file of files) { idList.push(file.replace('.json', '')) }
          getFundRichIdList((error, results) => {
            const missIdList = _.difference(results, idList)
            callback(null, missIdList)
          })
        }
      })
    }
  }
}

function updateOneFundRichDetailDataById(fundRichId, currentDateString) {
  sleep(getRandomMiniSec()).then(() => {
    const options = {
      method: 'GET',
      url: `https://apis.fundrich.com.tw/default/v1/funds/${fundRichId}`,
      json: true,
    }
    request(options, (error, response, body) => {
      if (error) {
        console.error(`error: ${error}`)
      } else {
        const path = `./staticData/fundRich/${currentDateString}FRDetail/${body.FundId}.json`
        fs.writeFile(path, JSON.stringify(body, null, 4), (writeError) => {
          if (writeError) throw writeError
          console.log(`write FRDetail ${fundRichId} second time!`)
        })
        scalegridMongo.connect((err, db) => {
          const storedData = _.cloneDeep(body)
          const collection = db.collection(collectionDetailName)
          const key = `data.${storedData.PriceTransDate}`
          const filter = { FRId: body.FundId }
          delete storedData.FundId
          const object = {}
          object[key] = storedData
          collection.updateMany(filter, { $set: object }, { upsert: true }, (e, r) => {
            if (!error && r) {
              console.log(`${storedData.Name} detail done!`)
              db.close()
            }
          })
        })
      }
    })
  })
}

function updateOneFundRichDividendDataById(fundRichId, currentDateString) {
  sleep(getRandomMiniSec()).then(() => {
    const options = {
      method: 'GET',
      url: `https://apis.fundrich.com.tw/default/v1/funds/${fundRichId}?view=dividend`,
      json: true,
    }
    request(options, (error, response, body) => {
      if (error) {
        console.error(`error: ${error}`)
      } else if (body.length) {
        const path = `./staticData/fundRich/${currentDateString}FRDividend/${fundRichId}.json`
        fs.writeFile(path, JSON.stringify(body, null, 4), (writeError) => {
          if (writeError) throw writeError
          console.log(`write FRDividend ${fundRichId}!`)
        })
        scalegridMongo.connect((err, db) => {
          const collection = db.collection(collectionDividendName)
          const dividenData = {}
          const filter = {
            FRId: fundRichId,
          }
          for (const d of body) {
            const dateKey = d.TransDate
            delete d.TransDate
            dividenData[dateKey] = d
          }
          collection.updateMany(filter,
            { $set: { data: dividenData } },
            { upsert: true }, (e, r) => {
              if (!error && r) {
                console.log(`${fundRichId} dividen done!`)
                db.close()
              }
            })
        })
      } else {
        console.error('body.length error!')
      }
    })
    return 'sleep return'
  })
}

function updateOneFundRichAllocationDataById(fundRichId, currentDateString) {
  sleep(getRandomMiniSec()).then(() => {
    const options = {
      method: 'GET',
      url: `https://apis.fundrich.com.tw/default/v1/funds/${fundRichId}?view=allocation`,
      json: true,
    }
    request(options, (error, response, body) => {
      if (error) {
        console.error(`error: ${error}`)
      } else if (Object.keys(body).length) {
        const path = `./staticData/fundRich/${currentDateString}FRAllocation/${fundRichId}.json`
        fs.writeFile(path, JSON.stringify(body, null, 4), (writeError) => {
          if (writeError) throw writeError
          console.log(`write FRAllocation ${fundRichId} second time!`)
        })
        scalegridMongo.connect((err, db) => {
          const collection = db.collection(collectionAllocationName)
          const allocationData = {
            AssertAllocation: {},
            IndustryRatio: {},
            StockTop: {},
          }
          const filter = {
            FRId: fundRichId,
          }
          if (body.AssertAllocation.length > 0) {
            const allocationDataDate = body.AssertAllocation[0].TransDate
            allocationData.AssertAllocation[allocationDataDate] = body.AssertAllocation
          }
          if (body.IndustryRatio.length > 0) {
            const industryRatioDataDate = body.IndustryRatio[0].TransDate
            allocationData.IndustryRatio[industryRatioDataDate] = body.IndustryRatio
          }
          if (body.StockTop.length > 0) {
            const stockTopDataDate = body.StockTop[0].TransDate
            allocationData.StockTop[stockTopDataDate] = body.StockTop
          }
          collection.updateMany(filter,
            { $set: { data: allocationData } },
            { upsert: true }, (e, r) => {
              if (!error && r) {
                console.log(`${fundRichId} allocation done!`)
                db.close()
              }
            })
        })
      } else {
        console.error('Object.keys error!')
      }
    })
    return 'sleep return'
  })
}

function updateOneFundRichNavDataById(fundRichId, currentDateString) {
  sleep(getRandomMiniSec()).then(() => {
    const options = {
      method: 'GET',
      url: `https://apis.fundrich.com.tw/default/v1/funds/navPrices/${fundRichId}?duration=est`,
      json: true,
    }
    request(options, (error, response, body) => {
      if (error) {
        console.error(`error: ${error}`)
      } else if (body.length) {
        const path = `./staticData/fundRich/${currentDateString}FRNav/${fundRichId}.json`
        fs.writeFile(path, JSON.stringify(body, null, 4), (writeError) => {
          if (writeError) throw writeError
          console.log(`write FRNav ${fundRichId} second time!`)
        })
        scalegridMongo.connect((err, db) => {
          const collection = db.collection(collectionNavName)
          const navData = {}
          const filter = { FRId: fundRichId }
          for (const navObject of body) {
            const dateKey = navObject.TransDate
            navData[dateKey] = navObject
          }
          collection.updateMany(filter,
            { $set: { data: navData } },
            { upsert: true }, (e, r) => {
              if (!error && r) {
                console.log(`${fundRichId} nav done!`)
                db.close()
              }
            })
        })
      } else {
        console.error('body length error!')
      }
    })
    return 'sleep return'
  })
}

function updateOneFundRichDetailData(fundRichIdList, currentDateString) {
  sleep(getRandomMiniSec()).then(() => {
    if (fundRichIdList.length <= 0) {
      getMissIdList('fundRich', 'FRDetail', currentDateString, (missIdError, results) => {
        if (missIdError) {
          console.error(`missIdError:${missIdError}`)
        } else {
          console.log(`missId:${results}`)
          for (const id of results) {
            updateOneFundRichDetailDataById(id, currentDateString)
          }
        }
        return 0
      })
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
        updateOneFundRichDetailData(fundRichIdList, currentDateString)
      } else {
        const path = `./staticData/fundRich/${currentDateString}FRDetail/${body.FundId}.json`
        fs.writeFile(path, JSON.stringify(body, null, 4), (writeError) => {
          if (writeError) throw writeError
          console.log(`write FRDetail ${fundRichId}!`)
        })
        scalegridMongo.connect((err, db) => {
          const storedData = _.cloneDeep(body)
          const collection = db.collection(collectionDetailName)
          const key = `data.${storedData.PriceTransDate}`
          const filter = {
            FRId: body.FundId,
            howfundId: '',
          }
          delete storedData.FundId
          const object = {}
          object[key] = storedData
          collection.updateMany(filter, { $set: object }, { upsert: true }, (e, r) => {
            if (!error && r) {
              console.log(`${storedData.Name} detail done!`)
              db.close()
              updateOneFundRichDetailData(fundRichIdList, currentDateString)
            }
          })
        })
      }
    })
    return 'sleep return'
  })
}

function updateOneFundRichDividendData(fundRichIdList, currentDateString) {
  sleep(getRandomMiniSec()).then(() => {
    if (fundRichIdList.length <= 0) {
      getMissIdList('fundRich', 'FRDividend', currentDateString, (missIdError, results) => {
        if (missIdError) {
          console.error(`missIdError:${missIdError}`)
        } else {
          console.log(`missId:${results}`)
          for (const id of results) {
            updateOneFundRichDetailDataById(id, currentDateString)
          }
        }
        return 0
      })
    }
    const fundRichId = fundRichIdList.shift()
    const options = {
      method: 'GET',
      url: `https://apis.fundrich.com.tw/default/v1/funds/${fundRichId}?view=dividend`,
      json: true,
    }

    request(options, (error, response, body) => {
      if (error) {
        console.error(`error: ${error}`)
        updateOneFundRichDividendData(fundRichIdList, currentDateString)
      } else if (body.length) {
        const path = `./staticData/fundRich/${currentDateString}FRDividend/${fundRichId}.json`
        fs.writeFile(path, JSON.stringify(body, null, 4), (writeError) => {
          if (writeError) throw writeError
          console.log(`write FRDividend ${fundRichId}!`)
        })
        scalegridMongo.connect((err, db) => {
          const collection = db.collection(collectionDividendName)
          const dividenData = {}
          const filter = {
            FRId: fundRichId,
          }
          for (const d of body) {
            const dateKey = d.TransDate
            delete d.TransDate
            dividenData[dateKey] = d
          }
          collection.updateMany(filter,
            { $set: { data: dividenData } },
            { upsert: true }, (e, r) => {
              if (!error && r) {
                console.log(`${fundRichId} dividen done!`)
                db.close()
                updateOneFundRichDividendData(fundRichIdList, currentDateString)
              }
            })
        })
      } else {
        updateOneFundRichDividendData(fundRichIdList, currentDateString)
      }
    })
    return 'sleep return'
  })
}

function updateOneFundRichAllocationData(fundRichIdList, currentDateString) {
  sleep(getRandomMiniSec()).then(() => {
    if (fundRichIdList.length <= 0) {
      getMissIdList('fundRich', 'FRAllocation', currentDateString, (missIdError, results) => {
        if (missIdError) {
          console.error(`missIdError:${missIdError}`)
        } else {
          console.log(`missId:${results}`)
          for (const id of results) {
            updateOneFundRichDetailDataById(id, currentDateString)
          }
        }
        return 0
      })
    }
    const fundRichId = fundRichIdList.shift()
    const options = {
      method: 'GET',
      url: `https://apis.fundrich.com.tw/default/v1/funds/${fundRichId}?view=allocation`,
      json: true,
    }
    request(options, (error, response, body) => {
      if (error) {
        console.error(`error: ${error}`)
        updateOneFundRichAllocationData(fundRichIdList, currentDateString)
      } else if (Object.keys(body).length) {
        const path = `./staticData/fundRich/${currentDateString}FRAllocation/${fundRichId}.json`
        fs.writeFile(path, JSON.stringify(body, null, 4), (writeError) => {
          if (writeError) throw writeError
          console.log(`write FRAllocation ${fundRichId}!`)
        })
        scalegridMongo.connect((err, db) => {
          const collection = db.collection(collectionAllocationName)
          const allocationData = {
            AssertAllocation: {},
            IndustryRatio: {},
            StockTop: {},
          }
          const filter = {
            FRId: fundRichId,
          }
          if (body.AssertAllocation.length > 0) {
            const allocationDataDate = body.AssertAllocation[0].TransDate
            allocationData.AssertAllocation[allocationDataDate] = body.AssertAllocation
          }
          if (body.IndustryRatio.length > 0) {
            const industryRatioDataDate = body.IndustryRatio[0].TransDate
            allocationData.IndustryRatio[industryRatioDataDate] = body.IndustryRatio
          }
          if (body.StockTop.length > 0) {
            const stockTopDataDate = body.StockTop[0].TransDate
            allocationData.StockTop[stockTopDataDate] = body.StockTop
          }
          collection.updateMany(filter,
            { $set: { data: allocationData } },
            { upsert: true }, (e, r) => {
              if (!error && r) {
                console.log(`${fundRichId} allocation done!`)
                db.close()
                updateOneFundRichAllocationData(fundRichIdList, currentDateString)
              }
            })
        })
      } else {
        updateOneFundRichAllocationData(fundRichIdList, currentDateString)
      }
    })
    return 'sleep return'
  })
}

function updateOneFundRichNavData(fundRichIdList, currentDateString) {
  sleep(getRandomMiniSec()).then(() => {
    if (fundRichIdList.length <= 0) {
      getMissIdList('fundRich', 'FRNav', currentDateString, (missIdError, results) => {
        if (missIdError) {
          console.error(`missIdError:${missIdError}`)
        } else {
          console.log(`missId:${results}`)
          for (const id of results) {
            updateOneFundRichDetailDataById(id, currentDateString)
          }
        }
        return 0
      })
    }
    const fundRichId = fundRichIdList.shift()
    const options = {
      method: 'GET',
      url: `https://apis.fundrich.com.tw/default/v1/funds/navPrices/${fundRichId}?duration=est`,
      json: true,
    }

    request(options, (error, response, body) => {
      if (error) {
        console.error(`error: ${error}`)
        updateOneFundRichNavData(fundRichIdList, currentDateString)
      } else if (body.length) {
        const path = `./staticData/fundRich/${currentDateString}FRNav/${fundRichId}.json`
        fs.writeFile(path, JSON.stringify(body, null, 4), (writeError) => {
          if (writeError) throw writeError
          console.log(`write FRNav ${fundRichId}!`)
        })
        scalegridMongo.connect((err, db) => {
          const collection = db.collection(collectionNavName)
          const navData = {}
          const filter = { FRId: fundRichId }
          for (const navObject of body) {
            const dateKey = navObject.TransDate
            navData[dateKey] = navObject
          }
          collection.updateMany(filter,
            { $set: { data: navData } },
            { upsert: true }, (e, r) => {
              if (!error && r) {
                console.log(`${fundRichId} nav done!`)
                db.close()
                updateOneFundRichNavData(fundRichIdList, currentDateString)
              }
            })
        })
      } else {
        updateOneFundRichNavData(fundRichIdList, currentDateString)
      }
    })
    return 'sleep return'
  })
}

const updateAll = function updateAll(currentDateString) {
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
      // fundRich updating start
      mkdirp(`./staticData/fundRich/${currentDateString}FRDetail`, (err) => {
        if (err) {
          console.error(`err:${err}`)
        } else {
          updateOneFundRichDetailData(_.cloneDeep(fundRichIdList), currentDateString)
        }
      })

      mkdirp(`./staticData/fundRich/${currentDateString}FRDividend`, (err) => {
        if (err) {
          console.error(`err:${err}`)
        } else {
          updateOneFundRichDividendData(_.cloneDeep(fundRichIdList), currentDateString)
        }
      })

      mkdirp(`./staticData/fundRich/${currentDateString}FRAllocation`, (err) => {
        if (err) {
          console.error(`err:${err}`)
        } else {
          updateOneFundRichAllocationData(_.cloneDeep(fundRichIdList), currentDateString)
        }
      })

      mkdirp(`./staticData/fundRich/${currentDateString}FRNav`, (err) => {
        if (err) {
          console.error(`err:${err}`)
        } else {
          updateOneFundRichNavData(_.cloneDeep(fundRichIdList), currentDateString)
        }
      })
    }
  })
}

module.exports = {
  updateAll,
  updateOneFundRichDetailDataById,
  updateOneFundRichNavDataById,
  updateOneFundRichAllocationDataById,
  updateOneFundRichDividendDataById,
  getFundRichIdList,
  getMissIdList,
}
