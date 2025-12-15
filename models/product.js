const getDb = require('../util/database').getDb
const mongodb = require('mongodb');

class Product{
  constructor(title, price, description, imageUrl){
    this.title = title;
    this.price = price;
    this.description = description;
    this.description = imageUrl;
  }

  save() {
    const db = getDb();
    return db.collection('products')
      .insertOne(this)
      .then(result => {
        console.log('results', result)
      })
      .catch(error => {
        console.log(error)
      }) 
  }

  static fetchAll() {
    const db = getDb();
    return db.collection('products')
      .find()
      .toArray()
      .then((products) => {
        return products
      }
      ).catch(); 
  }

  static fetchById(prodId) {
    const db = getDb();

    return db.collection('products')
      .find({_id: new mongodb.ObjectId(prodId)})
      .next()
      .then(product => {
        return product
      })
      .catch(err => {
        console.log(err);
      })
  }
}

module.exports = Product;
