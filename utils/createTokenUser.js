const createTokenUser = (user) => {

    // organize user data for token creation    
    return {userId: user._id, name: user.name, role: user.role};    

}

module.exports = createTokenUser