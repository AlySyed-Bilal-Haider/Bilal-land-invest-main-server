const jwt = require("jsonwebtoken");
const userSchema = require("../models/usersSchema");
const adminSchema = require("../models/adminSchema");


const auth = async function auth_token(req, res, next) {
    const header = req.headers["authorization"];
    const token = header && header.split(" ")[1];
   

    if (token == null) return res.status(501).json({ "ALERT": "Token Not Found" });
    jwt.verify(token, process.env.SECRET_KEY, async (err, user) => {
        if (err) return res.status(501).json({ "Message": "Invalid Token" });
        req.userEmail = user.email;
        let user_found = await userSchema.findOne({ email: user.email });
        let admin_found = await adminSchema.findOne({ email: user.email });
        if (user_found || admin_found) {
            console.log("Authorized User");
        } else {
            return res.status(404).json({ "ERROR": "Unauthorized User" });
        }
    });

    next();
}

module.exports = auth;

