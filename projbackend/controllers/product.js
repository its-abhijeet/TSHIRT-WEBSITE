const Product = require("../models/product");
const formidable = require("formidable"); //to process form data to process images and stuff
const _ = require("lodash");
/* 
Lodash makes JavaScript easier by taking the hassle out of working with arrays, numbers, objects, strings, etc.
Lodash’s modular methods are great for:

Iterating arrays, objects, & strings
Manipulating & testing values
Creating composite functions

*/
const fs = require("fs"); //as we need to read the files from the system
const { sortBy } = require("lodash");
exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category")
    .exec((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Product not found",
        });
      }
      req.product = product;
      next();
    });
};
exports.createProduct = (req, res) => {
  let form = new formidable.IncomingForm(); //Read the docsof formidable properly else doomed and
  form.keepExtensions = true; //same goes for the multer and other alternatives to it .

  form.parse(req, (err, fields, file) => {
    // Syntax for the parsing of the function as it requires
    if (err) {
      // to process the data.
      return res.status(400).json({
        error: "Problem with image",
      });
    }
    //destructure the fields
    const { price, name, description, category, stock } = fields;
    if (!name || !price || !description || !stock || !category) {
      return res.status(400).json({
        error: "Please include all the fields",
      });
    }
    let product = new Product(fields); //handling field is just like handling the text

    //handle file here
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "File Size is too big!",
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }
    //console.log(product);

    //Save to the DB
    product.save((err, product) => {
      if (err) {
        res.status(400).json({
          error: "Saving tshirt In DB failed",
        });
      }
      res.json(product);
    });
  });
};
exports.getProduct = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
};
//middlewares
exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};
//delete controllers
exports.deleteProduct = (req, res) => {
  let product = req.product;
  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to delete the Product",
      });
    }
    res.json({
      message: "Delete is successful",
      deletedProduct,
    });
  });
};
//update Controllers
exports.updateProduct = (req, res) => {
  let form = new formidable.IncomingForm(); //Read the docsof formidable properly else doomed and
  form.keepExtensions = true; //same goes for the multer and other alternatives to it .

  form.parse(req, (err, fields, file) => {
    // Syntax for the parsing of the function as it requires
    if (err) {
      // to process the data.
      return res.status(400).json({
        error: "Problem with image",
      });
    }
    //destructure the fields
    // const { price, name, description, category, stock } = fields;
    // if (!name || !price || !description || !stock || !category) {
    //   return res.status(400).json({
    //     error: "Please include all the fields",
    //   });
    // }
    // cause we dont need the logic to update all the info parameters at once hence commenting the above code
    // let product = new Product(fields); //handling field is just like handling the text

    let product = req.product;
    //updation code
    product = _.extend(product, fields);

    //handle file here
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "File Size is too big!",
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }
    //console.log(product);

    //Save to the DB
    product.save((err, product) => {
      if (err) {
        res.status(400).json({
          error: "Updation of product failed",
        });
      }
      res.json(product);
    });
  });
};
//Product Listing
exports.getAllProducts = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 8;
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  Product.find()
    .select("-photo") //negative sign represents dont want to select these
    .populate("category")
    .sort([[sortBy, "asc"]]) //weird syntax :')
    .limit(limit)
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "No Product found",
        });
      }
      res.json(products);
    });
};
exports.getAllUniqueCategories = (req, res) => {
  Product.distinct("category", {}, (err, category) => {
    if (err) {
      return res.status(400).json({
        error: " No category found",
      });
    }
    res.json(category);
  });
};

exports.updateStock = (req, res, next) => {
  let myOperations = req.body.order.products.map((prod) => {
    return {
      updateOne: {
        filter: { _id: prod._id },
        update: { $inc: { stock: -prod.count, sold: +prod.count } },
      },
    };
  });
  Product.bulkWrite(myOperations, {}, (err, products) => {
    if (err) {
      return res.status(400).json({
        error: "Bulk Operations Failed",
      });
    }
    next();
  });
};
