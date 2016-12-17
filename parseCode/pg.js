const Sequelize = require('sequelize')

const dbUrl = 'postgres://wilsonhuang:andaler210@localhost:5432/wilsonhuang'
const connection = new Sequelize(dbUrl)

// connection
//   .authenticate()
//   .then((err) => {
//     console.log('Connection has been established successfully.')
//     console.err(err)
//   })
//   .catch((err) => {
//     console.log('Unable to connect to the database:', err)
//     console.error(err)
//   })

const User = connection.define('user', {
  firstName: {
    type: Sequelize.STRING,
  },
  lastName: {
    type: Sequelize.STRING,
  },
})

// force: true will drop the table if it already exists
User.sync().then(() => {
  // Table created
  // return User.create({
  //   firstName: 'Wilson',
  //   lastName: 'Huang'
  // })
  User.findAll().then((users) => {
    console.log(users)
  })
})
