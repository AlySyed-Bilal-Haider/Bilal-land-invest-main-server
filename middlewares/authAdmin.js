const jwt = require("jsonwebtoken");
const adminSchema = require("../models/adminSchema");
const secret_key = process.env.SECRET_KEY;

const authAdmin = async function auth_token(req, res, next) {
    try {
        const header = req.headers["authorization"];
        const token = header && header.split(" ")[1];
        console.log("token: " + token);

        if (token == null) return res.status(501).json({ "ALERT": "Token Not Found" });
        jwt.verify(token, secret_key, async (err, user) => {

            if (err) return res.status(501).json({ "Message": "Invalid Token" });
            else {
                req.userEmail = user.email;
                console.log(`User.email: ${user.email}`);
                const admin_found = await adminSchema.findOne({ email: user.email });
                // console.log(`admin_found: ${admin_found}`);
                if (admin_found) {
                    console.log("Authorized User");
                    next();
                }
                else {
                    return res.status(404).json({ "ERROR": "Unauthorized User" });
                }
            }



        });


    }
    catch (error) {
        return res.status(500).json({ "ERROR from authAdmin": `${error}` });
    }
}

module.exports = authAdmin;

