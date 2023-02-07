const Router = require("express").Router();
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const authAdmin = require("../middlewares/authAdmin");
const adminSchema = require("../models/adminSchema");
const tokenSchema = require("../models/tokenSchema");
const userSchema = require("../models/usersSchema");
const { date } = require("joi");
const SALT = 10;
const secret_key = process.env.SECRET_KEY;

////////////////////////////////////////////////////////////////////////
var events = require('events');
var eventEmitter = new events.EventEmitter();

//Create an event handler:
var myEventHandler = function () {
    console.log('data entered!');
}

//Assign the event handler to an event:
eventEmitter.on('scream', myEventHandler);



/////////////////////////////////////////////////////////////////////////
///// Route For ADMIN_SIGN-UP //////
const signUpAdmin = Router.post("/signupadmin", async (req, res) => {
    try {
        const {
            fullName,
            email,
            password,
            phone,
        } = req.body;

        var value = Joi.object({
            fullName: Joi.string().min(2).max(255).required(),
            email: Joi.string().min(2).max(255).required(),
            password: Joi.string().min(6).max(25).required(),
            phone: Joi.string().min(10).max(11).required(),

        });
        let result = value.validate(req.body);
        if (result.error) {
            return res.status(400).json({ "Bad Request:": `${result.error}` });
        } else {
            try {
                let userAdminFound = await adminSchema.findOne({ email: email });
                if (userAdminFound) {
                    console.log("Please Try Another EMAIL");
                    return res.status(409).json({ "ALERT, Conflict": "Please Try Another Email" });
                }
                else {
                    console.log("User Not Found");
                    const hashpass = await bcrypt.hash(password, SALT);
                    console.log(hashpass);
                    let result = await adminSchema.create({
                        fullName: fullName,
                        email: email,
                        password: hashpass,
                        phone: phone,
                    });
                    if (result) {
                        //Fire the 'scream' event:
                        eventEmitter.emit('scream');
                        return res.status(201).json({ "ALERT": " Admin Signed_Up Successfully" });
                    } else {
                        return res.status(500).json({ "Error at creating Admin": "Not Created" });
                    }
                }

            }
            catch (error) {
                return res.status(500).json({ "ERROR from signDBAdmin": "error" });
            }
        }
    }
    catch (error) {
        return res.status(500).json({ "SignUp Admin Error": error });
    }
});
//////////// SignUp Ends Here //////////////////////////////////





///// Route For ADMIN_LOGIN //////
const loginAdmin = Router.post("/loginadmin", async (req, res) => {
    try {
        const { email, password } = req.body;
        let value = Joi.object({
            email: Joi.string().required(),
            password: Joi.string().required()
        });
        let result = value.validate(req.body);
        if (result.error) {
            return res.status(406).json({ "Error From Login Validation": "Please Enter Valid inputs" });
        }
        else {

            let userAdminFound = await adminSchema.findOne({ email: email });
            if (userAdminFound) {
                const confirmPass = await bcrypt.compare(password, userAdminFound.password);
                if (confirmPass) {

                    let token_found = await tokenSchema.findOne({ email: userAdminFound.email });
                    if (token_found) {
                        console.log(`User: ${userAdminFound.email} is already Logged_Inn.`);
                        return res.status(406).json({ "ALERT": `User is already Logged_Inn` });
                    }
                    else {
                        try {

                            const token = await jwt.sign({ email: userAdminFound.email }, secret_key, { expiresIn: "1y" });
                            let create_token = await tokenSchema.create({
                                token: token,
                                email: userAdminFound.email
                            });
                            if (create_token) {
                                loginReturns(res, 200, "ALERT", userAdminFound.email, token);
                                // return res.status(200).json({ "ALERT": `User ${userAdminFound.email} Logged Inn` });
                            }
                        }
                        catch (errors) {
                            return res.status(500).json({ "Login TokenDB Error Admin": `${errors}` });
                        }
                    }
                    return res.status(200).json({ "User Found": `${userAdminFound}` });
                }
                else {
                    const token = null
                    return_s(res, 401, "Error", "Please Try Correct Password");
                }
            }
            else {
                return_s(res, 404, "Un_Authorized Admin ", "404 User Not Found");
            }
        }

    }
    catch (error) {
        return res.status(500).json({ "ERROR From Login Admin Catch": `${error}` });
    }
});

/////////// User Login Ends Here ///////////////////////






///// Route For ADMIN_Get ALL users //////
const getAllUser = Router.get("/getalluser", authAdmin, async (req, res) => {
    try {
        ////////////////////////// pagination.../////////////////////////////

        // These values should get dynamically. //////////////////////
        const page = 1;
        const limit = 10;
        //  /////////////////////



        const skipIndex = (page - 1) * limit;

        try {
            const results = await userSchema.find().limit(limit).skip(skipIndex).exec();
            if (results) {
                return_s(res, 208, "Success: ", results);
            }
            else {
                return_s(res, 500, "DataBase Error: ", "Data Not Found");
            }

        } catch (e) {
            return res.status(500).json({ message: e });
        }
        ////////////////////////// pagination Ends.../////////////////////////////

    }
    catch (error) {
        return res.status(500).json({ "Error From Get All_User": `${error}` });
    }
});

/////////// User Login Ends Here ///////////////////////





///// Route For ADMIN_Serch 1 users //////
const getOneUser = Router.get("/getoneuser", authAdmin, async (req, res) => {
    try {

        const { email } = req.body;
        const resultForOneUser = await userSchema.findOne({ email });

        if (resultForOneUser) {
            return res.status(208).json({ "ALERT": `User: ${resultForOneUser}` });
        }
        else {
            return res.status(404).json({ "ALERT": `Requested Users Not Found` });
        }


    }
    catch (error) {
        return res.status(500).json({ "Error": `${error}` });
    }
});

/////////// User Login Ends Here ///////////////////////


///// Route For ADMIN_pdf print //////
const print_pdf = Router.get("/printpdf", authAdmin, async (req, res) => {
    try {
        var pdf = require("html-pdf");
        var option = { format: "A4" };
        res.render("demo", { data: req.body.name /*<= data from front_end */ }, (err, html) => {
            console.log("yaha tak start");
            const uniqueNAME = `report-${Date.now()}.pdf`
            pdf.create(html, option).toFile(`./pdf/${uniqueNAME}`, (err, result) => {
                console.log("yaha tak");
                if (err) { console.log(err) }
                else {
                    console.log("In Else");
                }
            });
            return res.status(201).json({ "ALERT": "PDF Generated Successfully - " + uniqueNAME });

        });
    }
    catch (error) {
        return res.status(500).json({ "Error from pdf": `${error}` });
    }
});

/////////// Route For ADMIN_PDF print  Ends Here ///////////////////////



module.exports = {
    signUpAdmin,
    loginAdmin,
    getAllUser,
    getOneUser,
    print_pdf

}

function loginReturns(res, statusCode, exceptionType, result, Token) {
    return res.status(statusCode).json({ "exceptionType": exceptionType, "result": result, "Token": Token });
};

function return_s(res, statusCode, exceptionType, result) {
    return res.status(statusCode).json({ "exceptionType": exceptionType, "result": result });
};