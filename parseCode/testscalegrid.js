// const scalegridConnect = require('./scalegridMongo').scalegridConnect
const scalegridPromiseConnect = require('../parseCode/scalegridMongo').scalegridPromiseConnect
const co = require('co')

co(function* __() {
  const scalegridDb = yield scalegridPromiseConnect()
  const docs = yield scalegridDb.collection('tejAtt').find({ tejId: '0050' }).toArray()
  console.log(docs[0])
  scalegridDb.close()
}).catch((err) => {
  console.log(err.stack)
})
// scalegridConnect((err, db) => {
//   if (err) {
//     console.error(err)
//   } else {
//     db.collection('tejAtt').find({ tejId: '0050' }).toArray().then((r1) => {
//       console.log(r1)
//       db.close()
//     })
//   }
// })
