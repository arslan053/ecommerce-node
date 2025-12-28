const getDb = require('../util/database').getDb
const mongodb = require('mongodb');

class Product{
  constructor(title, price, description, imageUrl, id, userId){
    this.title = title;
    this.price = price;
    this.imageUrl = imageUrl;
    this.description = description;
    this._id = id ? new mongodb.ObjectId(id) : null;
    this.userId = userId;
  }

  save() {
    const db = getDb();
    let dbOP;
    if (this._id) {
        dbOP = db.collection('products').updateOne({_id: this._id}, { $set: this })
    } else {
      dbOP = db.collection('products').insertOne(this)
    }
    return dbOP
      .then(result => {
        console.log(result)
      })
      .catch(error => {
        console.log(error)
      }) 
  }

  static fetchAll(id) {
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

  static deleteById(prodId){
    const db = getDb();
    return db
      .collection('products')
      .deleteOne({ _id: mongodb.ObjectId(prodId) })
      .then(result =>  
        console.log('Deleted Sucessfully'
      ))
      .catch((err) => {
        // console.log(err)
      })
  }
}

module.exports = Product;
 