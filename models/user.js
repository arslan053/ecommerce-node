const { getDb } = require("../util/database");
const { ObjectId } = require('mongodb');

class User {
  constructor(name, email, cart, id){
    this.name = name,
    this.email = email
    this.cart = cart,
    this._id = new ObjectId(id)
  }

  save() {
    const db = getDb();
    db.collection('users').insertOne(this)
  }

  addToCart(prodId){
    const cartProductIndex = this.cart.items.findIndex(prod => prod.productId.toString() === prodId.toString())
    let updatedCartItems = [...this.cart.items];
    if(cartProductIndex >= 0){
      updatedCartItems[cartProductIndex].quantity = this.cart.items[cartProductIndex].quantity + 1
    } else {
      console.log(prodId)
      updatedCartItems.push({productId: new ObjectId(prodId), quantity: 1});
    }

    const updatedCart = {
      items: updatedCartItems
    }
    const db = getDb();

    return db.collection('users')
      .updateOne({_id: this._id}, {$set: {cart: updatedCart}})
      .then(result => console.log(result))
      .catch(err => {
        console.log('errr', err)
      })
  }

  getCart() {
    const productIds = this.cart.items.map(prod => {
      return prod.productId
    })

    const db = getDb();

    return db
    .collection('products')
    .find({_id: { $in: productIds }})
    .toArray()
    .then(products => {
       return products.map(prod => {
          return {
            ...prod, 
            quantity: this.cart.items.find(item => {
              return item.productId.toString() === prod._id.toString();
            }).quantity
          }
        })
    });
  }

  deleteItemFromCart(prodId){
    const updatedCartItems = this.cart.items.filter(item => (prodId !== item.productId.toString()));
    const updatedCart = {items: updatedCartItems}
    console.log(';;;;;', prodId)
    const db = getDb();
    return db
      .collection('users')
      .updateOne(
      {_id: new ObjectId(this._id)},
      {$set: {cart: updatedCart}}
    ) 
  }

  static findById(id){
    const db = getDb();
    return db
      .collection('users')
      .findOne({ _id:  new ObjectId(id)})  //.findOne without next
      // .then(result => result)
  }
}
module.exports = User;
