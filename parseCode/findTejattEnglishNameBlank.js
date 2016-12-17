const scalegridConnect = require('./scalegridMongo').scalegridConnect

console.log('tejId,date,chineseFullName')
scalegridConnect((err, db) => {
  if (err) {
    console.error(err)
  } else {
    db.collection('tejAtt').find().toArray((e1, docs) => {
      if (!e1 && docs) {
        for (let i = 0; i < docs.length; i += 1) {
          const keys = Object.keys(docs[i].data)
          for (let j = 0; j < keys.length; j += 1) {
            if (docs[i].data[keys[j]].englishFullName.length < 1) {
              console.log(`${docs[i].tejId},${keys[j]},${docs[i].data[keys[j]].chineseFullName}`)
            }
          }
        }

        db.close()
      } else {
        console.error(`error:${e1}`)
        db.close()
      }
    })
  }
})
