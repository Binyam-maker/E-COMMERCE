const Product = require('../models/Product');
const {StatusCodes} = require('http-status-codes')
const customError = require('../errors');
const path = require('path');



const createProduct = async (req, res) => {

    req.body.user = req.user.userId;

    const product = await Product.create(req.body);

    res.status(StatusCodes.CREATED).json({product});


}

const getAllProducts = async (req, res) => {

    const products = await Product.find({});
    res.status(StatusCodes.OK).json({products});
    
}

const getSingleProduct = async (req, res) => {

    const {id} = req.params;

    const product = await Product.findById(id).populate({path: 'reviews', select: 'rating'});

    if(!product){
        throw new customError.NotFoundError(`No product found with id: ${id}`);
     }

    res.status(StatusCodes.OK).json({product});
}

const updateProduct = async (req, res) => {
    const {id} = req.params;

    const product = await Product.findByIdAndUpdate(id, req.body, {new: true, runValidators: true});

    if(!product){
        throw new customError.BadRequestError(`No product found with id: ${id}`);
     }

    res.status(StatusCodes.OK).json({product});
    
}

const deleteProduct = async (req, res) => {
   const {id} = req.params;

   const product = await Product.findById(id);

   if(!product){
       throw new customError.BadRequestError(`No product found with id: ${id}`);
    }

    await product.remove();

   res.status(StatusCodes.OK).json({msg: "Product Removed"});


}

const uploadImage = async (req, res) => {
    console.log(req.files);
    const productImage = req.files.image;

    if(!productImage){
        throw new customError.BadRequestError("No file uploaded");
    }

    if(!productImage.mimetype.startsWith('image')) {
        
        throw new customError.BadRequestError("No image uploaded");
    }

    if (productImage.size > process.env.MAX_IMAGE_SIZE){

        throw new customError.BadRequestError("Please upload image smaller than 3MB");
    }

    const imagePath = path.join(__dirname, "../public/uploads/" + `${productImage.name}`);

    await productImage.mv(imagePath);
    
    res.status(StatusCodes.OK).json({image: `uploads/${productImage.name}`});
}




module.exports = {uploadImage, deleteProduct, updateProduct, getAllProducts, getSingleProduct, createProduct};