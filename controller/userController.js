const User = require('../models/User');
const {StatusCodes} = require('http-status-codes');
const customError = require('../errors');
const {createTokenUser, attachCookiesToResponse, checkPermissions} = require('../utils');


const getAllUsers = async(req,res) => {

    // get all whose role is 'users' without there password
    const users = await User.find({role : 'user'}).select('name email role');
    console.log(users);

    // check if users is empty    
    if(!users){
        throw new customError.NotFoundError('There are no users currently');
    }

    // send users data
    res.status(StatusCodes.OK).json({users: users});
   
}

const getSingleUser = async(req, res) => {

    // get id from request
    const {id} = req.params;

    // find user by id
    const user = await User.findById(id).select('name email role');

    // check if user is found
    if(!user){
        throw new customError.NotFoundError(`There is no user with this id : ${id}`);
    }


    checkPermissions(req.user, user._id);

    // send back data
    res.status(StatusCodes.OK).json({user: user});

}

   


const showCurrentUser = async(req, res) => {
    res.status(StatusCodes.OK).json({user: req.user});
}

const updateUser = async (req, res) => {

    console.log(req.body);
    const {name, email} = req.body;
    console.log(req.user);
    const {userId} = req.user;
    console.log(userId);

    if(!name || !email){
        throw new customError.BadRequestError("Please provide name and email");
    }

    // const user = await User.findOneAndUpdate({_id: userId}, {name, email}, {new: true, runValidators: true});

    // alternative path
    const user = await User.findById(userId);
    user.name = name;
    user.email = email;
    user.save();

    console.log(user);

     // organize user data for token creation    
    const tokenUser = createTokenUser(user);

     // create token and send it through a cookie
    attachCookiesToResponse(res, tokenUser);



    res.status(StatusCodes.OK).json({user: tokenUser});
}

const updateUserPassword = async (req, res) => {

    const {oldPassword, newPassword} = req.body;

    if(!oldPassword || !newPassword){
        throw new customError.BadRequestError("Please provide old and new password");
    }

    const user = await User.findById(req.user.userId);


      // check if submitted password is correct
      const isPasswordCorrect = await user.comparePassword(oldPassword);
      if(!isPasswordCorrect){
          throw new customError.UnauthenticatedError("Invalid Credentials");
      }

      // change password 
      user.password = newPassword;
      await user.save();
  


    res.status(StatusCodes.OK).json({msg: "Success! Password Updated"});
}

module.exports ={
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword
}