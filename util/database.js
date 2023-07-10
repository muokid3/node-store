// const Sequelize = require('sequelize');

// const sequelize = new Sequelize('node_store', 'root', 'st34lthfr34k', {
//   dialect: 'mysql',
//   host: 'localhost'
// });

const mongo = require("mongodb");
const MongoClient = mongo.MongoClient;

function mongoConnect(callback) {
  MongoClient.connect(
    "mongodb+srv://nodeuser:iv6ieHXdBfWww79R@cluster0.eyesdhv.mongodb.net/?retryWrites=true&w=majority"
  )
    .then((client) => {
      callback(client);
    })
    .catch((err) => console.log(err));

  }
  module.exports = mongoConnect;
