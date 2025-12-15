const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;
const mongoConnect = callback => {
  MongoClient.connect(
    'mongodb://127.0.0.1:27017/', { useUnifiedTopology: true }
  )
    .then(client => {
      _db = client.db('shop')
      callback();
    })
    .catch(err => {
      console.log(err);
    });
};

const getDb = () => {
  if(_db) {
    return _db
  } else {
    throw('db is not created')
  }
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
