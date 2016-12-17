var Sequelize = require('sequelize');
var sequelize = new Sequelize('wilsonhuang', 'wilsonhuang', 'andaler210', {
  host: 'localhost',
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});
sequelize
  .authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');
  })
  .catch(function (err) {
    console.log('Unable to connect to the database:', err);
  });

var User = sequelize.define('user', {
  firstName: {
    type: Sequelize.STRING
  },
  lastName: {
    type: Sequelize.STRING
  }
});

// force: true will drop the table if it already exists
// User.sync({force: true}).then(function () {
//   // Table created
//   return User.create({
//     firstName: 'Wilson',
//     lastName: 'Huang'
//   });
// });
User.findAll().then(function(users) {
  console.log(users)
})

// Or you can simply use a connection uri
// var sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname');
// sequelize
//   .authenticate()
//   .then(function(err) {
//     console.log('Connection has been established successfully.');
//   })
//   .catch(function (err) {
//     console.log('Unable to connect to the database:', err);
//   });

// var User = sequelize.define('User', {
//   firstName: Sequelize.STRING,
//   lastName: Sequelize.STRING
// });
// var Task = sequelize.define('Task', {
//   title: Sequelize.STRING,
//   description: Sequelize.STRING
// });
// User.sync({force: true}).then(function () {
//   // Table created
//   return User.create({
//     firstName: 'John',
//     lastName: 'Hancock'
//   });
// });
var userx = User.create({ first_name: "David", last_name: "Lin"});
// var taskx = Task.create({ title: "doing", description: "yo"});
// var user2 = User.build({ first_name: "Wilson", last_name: "Huang"});
// var user3 = User.build({ first_name: "Ji", last_name: "Tang"});

// taskx.save()
//   .error(function(err) {
//     // error callback
//   })

// User.findOne().then(function (user) {
//     console.log(user.get('firstName'));
// });