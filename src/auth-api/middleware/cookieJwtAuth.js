const jwt = require("jsonwebtoken");
const jwt_key = require("../.jwt_key.js").key;

exports.cookieJwtAuth = (req, res, next) => {
    const token = req.cookies.authentication;
    try {

        const user = jwt.verify(token, jwt_key);
        req.user = user;

        if (Date.now() >= user.exp * 1000) {
            throw new error("Expired Token");
        }

        next();
    } catch (error) {
        res.clearCookie("authentication");
        return next();
    }
}
