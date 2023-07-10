// const Sequelize = require('sequelize');

// const sequelize = new Sequelize('node_store', 'root', 'st34lthfr34k', {
//   dialect: 'mysql',
//   host: 'localhost'
// });

const mongo = require("mongodb");
const MongoClient = mongo.MongoClient;

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(
    "mongodb+srv://nodeuser:iv6ieHXdBfWww79R@cluster0.eyesdhv.mongodb.net/?retryWrites=true&w=majority"
  )
    .then((client) => {
      console.log("connected");
      _db = client.db("shop");
      callback();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No database found";
}
exports.mongoConnect = mongoConnect;

exports.getDb = getDb;
