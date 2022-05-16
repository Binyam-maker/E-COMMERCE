const Product = require('../models/Product');
const customError = require('../errors');
const {StatusCodes} = require('http-status-codes');
const Order = require('../models/Order');
const {checkPermissions} = require('../utils');

const fakeStripeAPI = async ({amount, currency}) => {
    const client_secret = 'someRandomValue';
    return {client_secret, amount};
}

const getAllOrders = async (req, res) => {
    
    const order = await Order.find({});
    res.status(StatusCodes.OK).json({order, count: order.length});

}

const getSingleOrder = async (req, res) => {
    const {id: orderId} = req.params

    const order = await Order.findById(orderId);

    if(!order) {
        throw new customError.NotFoundError(`No order with id: ${orderId}`);
    }

    checkPermissions(req.user, order.user);

    res.status(StatusCodes.OK).json({order});

}
    

const getCurrentUserOrders = async (req, res) => {
   const {userId} = req.user;
  
   const currentUserOrders = await Order.find({user: userId});   
  
   res.status(StatusCodes.OK).json({currentUserOrders, count: currentUserOrders.length});
}


const createOrder = async (req, res) => {
    const {items: cartItems, tax, shippingFee} = req.body;

    if (!cartItems || cartItems.length < 1) {
        throw new customError.BadRequestError('No cart items provided');        
    }

    if (!tax || !shippingFee) {
        throw new customError.BadRequestError('Please provided tax and shipping fee')
    }

    let orderItems = [];
    let subtotal = 0;

    for (const item of cartItems) {
        const dbProduct = await Product.findById(item.product);
        if(!dbProduct){
            throw new customError.NotFoundError(`No product with id: ${item.product}`);
        }
        
        const  {name, price, image, _id} = dbProduct;

        const singleOrderItem = {
            amount: item.amount,
            name,
            price,
            image,
            product: _id,
        };
    

        // add item to order
    orderItems = [...orderItems,  singleOrderItem];

    // calculate subtotal
    subtotal += item.amount * price       
    
    }

    // calculate total
    const total = tax + shippingFee + subtotal;

    //get client secret
    const paymentIntent = await fakeStripeAPI({
        amount: total,
        currency: 'usd',
    });

    const order = await Order.create({
        orderItems,
        total,
        subTotal: subtotal,
        tax,
        shippingFee, 
        clientSecret: paymentIntent.client_secret,
        user: req.user.userId
    });

    

    res.status(StatusCodes.CREATED).json({order, clientSecret: order.clientSecret});  

}

const updateOrder = async (req, res) => {

    const {id: orderId} = req.params;
    const {paymentIntentId} = req.body;
    

    const order = await Order.findById(orderId);

    if(!order) {
        throw new customError.NotFoundError(`No order with id: ${orderId}`);
    }

    checkPermissions(req.user, order.user);

    order.status = 'paid'
    order.paymentIntentId = paymentIntentId;

    order.save();


}

module.exports = {updateOrder, createOrder, getCurrentUserOrders, getSingleOrder, getAllOrders};