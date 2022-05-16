const User = require('../models/User');
const customError = require('../errors');
const {StatusCodes} = require('http-status-codes');
const {attachCookiesToResponse, createTokenUser} = require('../utils');


const register = async (req, res) => {

    // destructure    
    const {name, email, password} = req.body;
    
    // is everythig provided
    if(!name || !email || !password) {
        throw new customError.BadRequestError('Please provide name, email and password');
    }

    // is email unique
    const possibleUser = await User.findOne({email})
    if(possibleUser){
        throw new customError.BadRequestError("Email already registerd, please provide unique email")
    }

    // only first user is admin
    const isFirstAccount = (await User.countDocuments()) === 0
    const role = isFirstAccount ? "admin" : "user";
    
    // create user on database
    const user = await User.create({name, email, password, role});

    // organize user data for token creation    
    const tokenUser = createTokenUser(user);  

     // create token and send it through a cookie
    attachCookiesToResponse(res, tokenUser);
    

    // send json data
    res.status(StatusCodes.CREATED).json({user: tokenUser});
}


const login = async (req, res) => {

    const {email, password} = req.body;

    // check if both email and password are provided
    if(!email || !password) {
        throw new customError.BadRequestError("Please provide email and password");
    }

    // find user through email on the database
    const user = await User.findOne({email: email});

    // send error if no user is found with the email provided
    if(!user){
        throw new customError.UnauthenticatedError("There is no user with this email");
    }

    // check if submitted password is correct
    const isPasswordCorrect = await user.comparePassword(password);
    if(!isPasswordCorrect){
        throw new customError.UnauthenticatedError("Password is incorrect");
    }

   
    // organize user data for token creation    
    const tokenUser = createTokenUser(user);    

     // create token and send it through a cookie
    attachCookiesToResponse(res, tokenUser);   

    res.status(StatusCodes.OK).json({user: tokenUser});

    
};

const logout = async(req, res) => {

    // send an expiring token cookie
    res.cookie('token', 'logout', {
        httpOnly: true,
        maxAge: 0
    });


    res.status(StatusCodes.OK).json({msg: 'User Logged Out'});
}



module.exports = {login, logout, register}