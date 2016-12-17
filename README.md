# Howhoworg

<h1 align="center">
	<img width="720" src="public/images/biglogo.png" alt="awesome">
</h1>


> Howhoworg is a versatile server build from [Node.js](https://nodejs.org) and [MongoDB](https://www.mongodb.com). Not only updating nav and other fund data daily, automatically from several reliable sources, but also a stable API Server providing finance data.

## Requirements
- [Node.js](https://nodejs.org) **6.1+**
- [npm](https://www.npmjs.com) **3.10.3+** or [yarn](https://yarnpkg.com) **0.15.1+**

## Coding Style
We're using **[Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)** without semicolons. Let us refer you to [here](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb) to get eslint setup, then take a look at our [.eslintrc](https://github.com/HowFintech/howhoworg/blob/master/.eslintrc).

## Architecture

<h5 align="center">
	<img width="720" src="public/images/structure.png" alt="awesome">
</h5>

So called **MVC (Model-View-Controller)** architecture, we have several groups in the picture above.

### app.js
Entry point, start API Server and updaters to crawl market data from several sources. The production process manager we use is [pm2](http://pm2.keymetrics.io). It allows you to keep applications alive forever, to reload them without downtime and to facilitate common system admin tasks.

### test
Unit Test is matter! It helps you really understand the design of the code you are working on. Keep coverage higher as you can. Test framework we use are [Mocha](https://mochajs.org) and [Chai](http://chaijs.com). 

**Mocha** is a feature-rich JavaScript test framework running on Node.js and in the browser, making asynchronous testing simple and fun. Mocha tests run serially, allowing for flexible and accurate reporting, while mapping uncaught exceptions to the correct test cases., and **Chai** is a BDD / TDD assertion library for node and the browser that can be delightfully paired with any javascript testing framework.

### data
Some legacy temporary data, like fund clear id list, tej csv test files, and other json files.

### models
Schema, classes and its method we use in database would be here. About the MongoDB driver, our choice was [Mongo Native Driver](http://mongodb.github.io/node-mongodb-native/2.0/api/index.html) but [Mongoose](http://mongoosejs.com). Performance, flexibility, and learning cure are matter, here is the reason. For more, you could check this [comparison](http://voidcanvas.com/mongoose-vs-mongodb-native/) and feel free to propose question if you have any better idea.

### views & public
*.ejs files and web page static files. [Our API docs](http://howfintech.com/api/docs) are using open source api docs generator, called [slate](https://github.com/lord/slate). Slate could helps you create beautiful, intelligent, responsive API documentation in several minutes.

### routes
Web page routing and RESTFUL API stuff, including database connecting, data handling, and request authorization. Web framework we use is [Express](http://expressjs.com), with a myriad of HTTP utility methods and middleware at our disposal, creating a robust API is quick and easy. You can click [here](http://howfintech.com/api/docs) to check our API Docs now.

### daemon
Howhoworg has several updaters running constantly, and update market data to database everyday morning. Our database is located at East Asia, using [ScaleGrid](https://scalegrid.io), database as a service. You're able to look more detail in [scalegirdMongo.js](https://github.com/HowFintech/howhoworg/blob/master/daemon/scalegridMongo.js)

### parseCode
Legacy code, most of them are using for parsing api data and test data.

## Getting Started
Step 1. Click the top right `fork` button to fork this repository to your account.

Step 2. Clone this object on your client.

```
git clone https://github.com/<your_user_name>/howhoworg.git
```
Step 3. Check in your directory and install dependencies.

```
npm install
```
or

```
yarn
```

## Usage
```
node app
```

## Testing
```
npm test
```

## API Spec
Click [here](http://howfintech.com/api/docs) to see our API Docs.


## Trial
Go to [here](http://howfintech.com/example) to get alpha free trial.
