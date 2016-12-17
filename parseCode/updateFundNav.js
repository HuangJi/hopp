const scalegridConnect = require('./scalegridMongo').scalegridConnect

function getDateKeyObject(dateString, valueObject) {
  const object = {}
  const keyString = 'navDate.'.concat(dateString)
  object[keyString] = valueObject

  return object
}

function updateTejAttNav(db, tejId, howfundId) {
  db.collection('tejAtt').find({ tejId }).limit(1).next((e1, r1) => {
    if (!e1 && r1) {
      for (const dateKey of Object.keys(r1.data)) {
        const navDate = r1.data[dateKey].navDate
        const nav = r1.data[dateKey].nav
        const setObject = getDateKeyObject(navDate, { nav })
        // console.log(`setobject:${JSON.stringify(setObject)}`)
        db.collection('fundNav').updateMany({ howfundId },
          { $set: setObject },
          { upsert: true }, (e, r) => {
            if (!e && r) {
              console.log(`${howfundId} tej att update done!`)
            } else {
              console.log(e)
            }
          })
      }
    } else {
      console.log(`e1:${e1}`)
    }
  })
}

function updateTejOfattNav(db, tejId, howfundId) {
  db.collection('tejOfatt').find({ tejId }).limit(1).next((e1, r1) => {
    if (!e1 && r1) {
      for (const dateKey of Object.keys(r1.data)) {
        const navDate = r1.data[dateKey].navDate
        const nav = r1.data[dateKey].nav
        const setObject = getDateKeyObject(navDate, { nav })
        // console.log(`setobject:${JSON.stringify(setObject)}`)
        db.collection('fundNav').updateMany({ howfundId },
          { $set: setObject },
          { upsert: true }, (e, r) => {
            if (!e && r) {
              console.log(`${howfundId} tej att update done!`)
            } else {
              console.log(e)
            }
          })
      }
    } else {
      console.log(`e1:${e1}`)
    }
  })
}

function updateFundRichNav(db, FRId, howfundId) {
  db.collection('FRDetail').find({ FRId }).limit(1).next((e1, r1) => {
    if (!e1 && r1) {
      for (const dateKey of Object.keys(r1.data)) {
        const navDate = r1.data[dateKey].PriceTransDate
        const navObject = {
          nav: r1.data[dateKey].Price,
          Rr1w: r1.data[dateKey].Rr1w,
          Rr1M: r1.data[dateKey].Rr1M,
          Rr3M: r1.data[dateKey].Rr3M,
          Rr6M: r1.data[dateKey].Rr6M,
          RrThisYear: r1.data[dateKey].RrThisYear,
          Rr1Y: r1.data[dateKey].Rr1Y,
          Rr2Y: r1.data[dateKey].Rr2Y,
          Rr3Y: r1.data[dateKey].Rr3Y,
          Rr5Y: r1.data[dateKey].Rr5Y,
          Rr10Y: r1.data[dateKey].Rr10Y,
          RrFromEst: r1.data[dateKey].RrFromEst,
          Alpha1Y: r1.data[dateKey].Alpha1Y,
          Beta1Y: r1.data[dateKey].Beta1Y,
          Sharpe1Y: r1.data[dateKey].Sharpe1Y,
          StdDev1Y: r1.data[dateKey].StdDev1Y,
          Alpha3Y: r1.data[dateKey].Alpha3Y,
          Beta3Y: r1.data[dateKey].Beta3Y,
          Sharpe3Y: r1.data[dateKey].Sharpe3Y,
          StdDev3Y: r1.data[dateKey].StdDev3Y,
          Alpha5Y: r1.data[dateKey].Alpha5Y,
          Beta5Y: r1.data[dateKey].Beta5Y,
          Sharpe5Y: r1.data[dateKey].Sharpe5Y,
          StdDev5Y: r1.data[dateKey].StdDev5Y,
          Alpha10Y: r1.data[dateKey].Alpha10Y,
          Beta10Y: r1.data[dateKey].Beta10Y,
          Sharpe10Y: r1.data[dateKey].Sharpe10Y,
          StdDev10Y: r1.data[dateKey].StdDev10Y,
          delta: 0.0,
          oneDayProfitRate: 0.0,
        }
        const setObject = getDateKeyObject(navDate, navObject)
        db.collection('fundNav').updateMany({ howfundId },
          { $set: setObject },
          { upsert: true }, (e, r) => {
            if (!e && r) {
              console.log(`${howfundId} fundrich update done!`)
            } else {
              console.log(e)
            }
          })
      }
    } else {
      console.log(`e1:${e1}`)
    }
  })
}

function updateFromFundClearNav(db, FCId, howfundId) {
  console.log(`From FC ${FCId} ${howfundId}`)
  db.collection('FCNav').find({ FCId }).limit(1).next((e1, r1) => {
    if (!e1 && r1) {
      for (const dateKey of Object.keys(r1.data)) {
        const navDate = r1.data[dateKey].TransDate
        const nav = r1.data[dateKey].Price
        const setObject = getDateKeyObject(navDate, { nav })
        console.log(`in for setObject: ${JSON.stringify(setObject)} ${FCId}`)
        db.collection('fundNav').updateMany({ howfundId },
          { $set: setObject },
          { upsert: true }, (e, r) => {
            if (!e && r) {
              console.log(`${howfundId} ${FCId} ${navDate} fundclear update done!`)
            } else {
              console.log(e)
            }
          })
      }
    } else {
      console.log(`e1:${e1}`)
    }
  })
}

scalegridConnect((err, db) => {
  if (err) {
    console.error(err)
  } else {
    db.collection('fundCode').find({ FCId: { $ne: '' } }).toArray((e1, docs) => {
      if (!e1 && docs) {
        for (const fund of docs) {
          // const filter = { howfundId: fund.howfundId }
          // const navObject = {
          //   howfundId: fund.howfundId,
          //   navDate: {},
          // }
          // if (fund.tejId) {
          //   updateTejAttNav(db, fund.tejId, fund.howfundId)
          //   updateTejOfattNav(db, fund.tejId, fund.howfundId)
          // }
          // if (fund.FRId) {
          //   updateFundRichNav(db, fund.FRId, fund.howfundId)
          // }
          if (fund.FCId) {
            updateFromFundClearNav(db, fund.FCId, fund.howfundId)
          }
          // db.collection('fundNav').updateMany(filter,
          //   { $set: navObject },
          //   { upsert: true }, (e, r) => {
          //     if (!e && r) {
          //       console.log(`${fund.howfundId} set done!`)
          //       if (fund.tejId) {
          //         updateTejAttNav(db, fund.tejId, fund.howfundId)
          //         updateTejOfattNav(db, fund.tejId, fund.howfundId)
          //       }
          //       if (fund.FRId) {
          //         updateFundRichNav(db, fund.FRId, fund.howfundId)
          //       }
          //       if (fund.FCId) {
          //         updateFromFundClearNav(db, fund.FCId, fund.howfundId)
          //       }
          //     } else {
          //       console.log(e)
          //     }
          //   })
        }
        // db.close()
      } else {
        console.error(`error:${e1}`)
        db.close()
      }
    })
  }
})
