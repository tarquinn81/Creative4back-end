const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function(req, res, next) {
	  res.header("Access-Control-Allow-Origin", "*");
	  res.header("Access-Control-Allow-Methods", "POST, GET, DELETE");
	  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	  next();
});
app.use(express.static('public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}));

// parse application/json
app.use(bodyParser.json());

const mongoose = require('mongoose');

// connect to the database
mongoose.connect('mongodb://localhost:27017/store', {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

const productSchema = new mongoose.Schema({
    name: String,
    price: String,
  });

// create a virtual paramter that turns the default _id field into id
productSchema.virtual('id')
  .get(function() {
    return this._id.toHexString();
  });

// Ensure virtual fields are serialised when we turn this into a JSON object
productSchema.set('toJSON', {
    virtuals: true
  });
  
// create a model
const Product = mongoose.model('Product', productSchema);

//functions
let cart = [];

//get all products
app.get('/api/products', async (req, res) => {
    try {
        let products = await Product.find();
        res.send({
            products: products
        });
      } catch (error) {
        console.log(error);
        res.sendStatus(500);
      }
});

//get one product
app.get('/api/products/:id', async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        res.send({
            product: product
        });
    } catch(error) {
        console.log(error);
        res.sendStatus(500);
    }
});

//create product
app.post('/api/products', async (req, res) => {
  const product = new Product({
    name: req.body.name,
    price: req.body.price
  });
  try {
    await product.save();
    res.send({
        product: product
    });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

//for updating ID
app.put('/api/products/:id', async (req, res) => {
    try {
        let product = await Product.findById(req.params.id)
        product.name = req.body.name;
        product.price = req.body.price;
        product.save;
        res.send(product);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});
//for deleting product
app.delete('/api/products/:id', async (req, res) => {
    try {
      await Product.deleteOne({
        _id: req.params.id
      });
      res.sendStatus(200);
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });

//CART functions
app.get('/api/cart', (req, res) => {
  console.log("In cart get");
  res.send(cart);
});

app.post('/api/cart/:id', (req, res) => {
  console.log("In cart post");
  id = parseInt(req.params.id);
  const foundItem = cart.find(item => item.id == id);
  if(foundItem) {
      foundItem.quantity += 1;
      res.send(foundItem);
  } else {
      let item = {
          id: id,
          quantity: 1
      };
      cart.push(item);
      res.send(item);
  }
});

app.put('/api/cart/:id/:quantity', (req, res) => {
    console.log("In cart Put");
    id = parseInt(req.params.id);
    console.log("ID parameter: " + id);
    quantity = parseInt(req.params.quantity);
    console.log("quantity parameter: " + quantity);
    const foundItem = cart.find(item => item.id == id);
    let removeIndex = cart.map(item => {
        return item.id
    }).indexOf(id);
    if(foundItem) {
        if(quantity != 0) {
          foundItem.quantity = quantity;
          console.log("New item quantity is: " + foundItem.quantity);
          res.send(foundItem);
        }
        else {
          foundItem.quantity = 0;
          console.log("Quantity has been changed to 0");
          res.send(foundItem);
          cart.splice(removeIndex, 1);
          res.sendStatus(200);
        }
    } 
    else {
      res.status(404)
          .send("Sorry, that product doesn't exist");
      return;
    }
});

 app.delete('/api/cart/:id', (req, res) => {
      console.log("In cart delete");
      let id = parseInt(req.params.id);
      console.log("This is the id to delete: " + id);
      let removeIndex = cart.map(item => {
          return item.id;
      })
      .indexOf(id);
      console.log("This is the removeIndex: " + removeIndex);
      if (removeIndex === -1) {
          res.status(404)
              .send("Sorry, that product doesn't exist");
          return;
      }
      cart.splice(removeIndex, 1);
      res.sendStatus(200);
 })


app.listen(3000, () => console.log('Server listening on port 3000!'));