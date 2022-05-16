const customErrors = require('../errors');

const checkPermissions = (requestUser, resourceUserId) => {
   
    if (requestUser.role === 'admin') return;
    if (requestUser.userId === resourceUserId.toString()) return;
    throw new customErrors.UnauthorizedError('Not authorized to access this route');
}

module.exports = checkPermissions;