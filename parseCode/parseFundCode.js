'use strict'

const csv = require('csv-parser')
const iconv = require('iconv-lite')
const fs = require('fs')
// const co = require('co')
const _ = require('lodash')

// const stringjs = require('string')
const Readable = require('stream').Readable
const MongoClient = require('mongodb').MongoClient

const mongodbUrl = 'mongodb://wilson:Wil9999Wil9999Wil9999@SG-howfintechmongo-8817.servers.mongodirector.com:27017/source?ssl=true'
const ca = [fs.readFileSync('/Users/wilson/.ssh/scalegrid.crt')]
const fileStr = fs.readFileSync('fundcode.csv', { encoding: 'binary' })
const buf = new Buffer(fileStr, 'binary')
const str = iconv.decode(buf, 'Big5')
const stream = new Readable()
const serverOption = { server: { sslValidate: true, sslCA: ca } }
// const collectionName = 'fundCode'
const collectionFRName = 'FRDetail'
const collectionTejAttName = 'tejAtt'
const collectionTejOfAttName = 'tejOfatt'
const collectionFDName = 'fundDJ'

stream.push(str)    // the string you want
stream.push(null)      // indicates end-of-file basically - the end of the stream

function unifyDateFormatWithSlash(dateString) {
  const list = dateString.split('/')
  let unifiedDateString = list[0]
  for (let i = 1; i < list.length; i += 1) {
    if (list[i].length < 2) {
      list[i] += '0'.concat(list[i])
    }
    unifiedDateString += list[i]
  }
  return unifiedDateString
}

function getLatestDateString(dateStringArray) {
  const dateArray = _.map(dateStringArray, _.parseInt)
  const latestDate = _.max(dateArray)
  if (!latestDate) {
    return null
  }
  return latestDate.toString()
}

function updateRecord(db, sourceCollection, howfundFilter, targetFilter) {
  db.collection(sourceCollection).find(targetFilter).limit(1).next((e1, r1) => {
    let record
    let name
    if (!e1 && r1) {
      if (getLatestDateString(_.keys(r1.data))) {
        if (sourceCollection === 'FRDetail') {
          name = r1.data[getLatestDateString(_.keys(r1.data))].Name
        } else {
          name = r1.data[getLatestDateString(_.keys(r1.data))].chineseFullName
        }
        record = {
          Name: name,
          Source: sourceCollection,
          Date: getLatestDateString(_.keys(r1.data)),
        }
        db.collection('fundCode').updateMany(howfundFilter,
          { $push: { number: record } },
          { upsert: true }, (e, r) => {
            if (!e && r) {
              console.log(`${howfundFilter.howfundId} push done!`)
            } else {
              console.log(e)
            }
          })
      } else if (sourceCollection === 'fundDJ') {
        record = {
          Name: r1.chineseFullName,
          Source: sourceCollection,
          Date: unifyDateFormatWithSlash(r1.fundValidDate),
        }
        db.collection('fundCode').updateMany(howfundFilter,
          { $push: { number: record } },
          { upsert: true }, (e, r) => {
            if (!e && r) {
              console.log(`${howfundFilter.howfundId} push done!`)
            } else {
              console.log(e)
            }
          })
      } else {
        console.log('no latestDateString!')
      }
    } else {
      console.log(`e1:${e1}, r1:${r1}, howfundId is:${howfundFilter.howfundId}`)
    }
  })
}

MongoClient.connect(mongodbUrl, serverOption, (err, db) => {
  if (err) {
    console.error(err)
  } else {
    stream
      .pipe(csv())
      .on('data', (data) => {
        const fundCodeData = _.cloneDeep(data)
        let frid = _.cloneDeep(fundCodeData.FRId)
        if (frid.length > 0) {
          while (frid.length < 6) { frid = '0'.concat(frid) }
          fundCodeData.FRId = frid
        }
        fundCodeData.number = []
        const filter = { howfundId: fundCodeData.howfundId }
        db.collection('fundCode').updateMany(filter,
          { $set: fundCodeData },
          { upsert: true }, (e, r) => {
            if (!e && r) {
              console.log(`${fundCodeData.howfundId} insert done!`)
              if (fundCodeData.tejId) {
                const targetFilter = { tejId: fundCodeData.tejId }
                updateRecord(db, collectionTejAttName, filter, targetFilter)
                updateRecord(db, collectionTejOfAttName, filter, targetFilter)
              }
              if (fundCodeData.FRId) {
                const targetFilter = { FRId: frid }
                updateRecord(db, collectionFRName, filter, targetFilter)
              }
              // if (fundCodeData.FCId) {
              //   const targetFilter = { FCId: fundCodeData.FCId }
              //   updateRecord(db, collectionTejAttName, filter, targetFilter)
              // }
              if (fundCodeData.FDId) {
                const targetFilter = { FDId: fundCodeData.FDId }
                updateRecord(db, collectionFDName, filter, targetFilter)
              }
            }
          })

        // if (fundCodeData.FRId) {
        //   console.log(`data:${data.FRId}`)
        //   // console.log(`${data.howfundId} if tejId!`)
        //   const target = { FRId: fundCodeData.FRId }
        //   db.collection(collectionFRName).find(target).limit(1).next((e1, r1) => {
        //     // console.log(r1.data)
        //     // const r1 = rs[0]
        //     let record
        //     if (!e1 && r1) {
        //       if (getLatestDateString(_.keys(r1.data))) {
        //         record = {
        //           Name: r1.data[getLatestDateString(_.keys(r1.data))].Name,
        //           Source: 'FRDetail',
        //           Date: getLatestDateString(_.keys(r1.data)),
        //         }
        //         db.collection(collectionName).updateMany(filter,
        //           { $push: { number: record } },
        //           { upsert: true }, (e, r) => {
        //             if (!e && r) {
        //               console.log(`${fundCodeData.howfundId} push done!`)
        //             } else {
        //               console.log(e)
        //             }
        //           })
        //       } else {
        //         console.log('no latestDateString!')
        //       }
        //       // console.log(record)
        //       // const filter = { howfundId: fundCodeData.howfundId }
        //     } else {
        //       console.log(`e1:${e1}, r1:${r1}, howfundId is:${fundCodeData.howfundId}`)
        //     }
        //   })
        // } else {
        //   console.log('no FRId')
        // }
        // if (data.FRId) { idList.fr = data.FRId }
        // if (data.FCId) { idList.fc = data.FCId }
        // if (data.FDId) { idList.fd = data.FDId }

        // co(function* _() {
        //
        //   return idList
        // }).then((object) => {
        //   console.log(object)
        // })

        // const storedData = schemaModify(data)
        // const filter = {
        //   tejId: storedData.tejId,
        // }
        // collection.updateMany(filter, { $set: storedData }, { upsert: true }, (e, r) => {
        //   if (!e && r) {
        //     console.log(`${storedData.tejId} storing done`)
        //   }
        // })
      })
      .on('end', () => {
        console.log('end')
        // database.close()
      })
  }
})
