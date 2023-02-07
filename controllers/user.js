const Router = require("express").Router();
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { env } = require("../server");
const auth = require("../middlewares/auth");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const userSchema = require("../models/usersSchema");
const tokenSchema = require("../models/tokenSchema");
const userExtraDataSchema = require("../models/userDataSchema");
const req = require("express/lib/request");

const app_email = process.env.email;
const app_pass = process.env.pass;
const forget_pass = process.env.FORGETPASS;

///// Route For USER_SIGN-UP //////
const signUp = Router.post("/signup", async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            lookingFor,
            password,
            currentState,
            budget
        } = req.body;

        var value = Joi.object({
            fullName: Joi.string().min(2).max(255).required(),
            email: Joi.string().min(2).max(255).required(),
            phone: Joi.string().min(10).max(11).required(),
            lookingFor: Joi.string().required(),
            password: Joi.string().min(6).max(25).required(),
            currentState: Joi.string().required(),
            budget: Joi.number().min(2).required()
        });
        let result = value.validate(req.body);
        if (result.error) {
            return res.status(400).json({ "Error From SignUp Validation:": `${result.error}` });
        } else {
            try {
                let userFound = await userSchema.findOne({ email: email });
                if (userFound) {
                    console.log("Please Try Another EMAIL");
                    return res.status(409).json({ "ALERT, Conflict": "Please Try Another Email" });
                }
                else {
                    console.log("User Not Found");
                    const hashpass = await bcrypt.hash(password, 10);
                    let result = await userSchema.create({
                        fullName: fullName,
                        email: email,
                        phone: phone,
                        lookingFor: lookingFor,
                        password: hashpass,
                        currentState: currentState,
                        budget: budget
                    });
                    if (result) {
                        return res.status(201).json({
                             "ALERT: SignUp Successfully": {
                                "Data":result
                            } 
                        });
                    } else {
                        return res.status(500).json({ "Error at creating": "Not Created" });
                    }
                }

            }
            catch (error) {
                return res.status(500).json({ "ERROR from signDB": error.message });
            }
        }
    }
    catch (error) {
        return res.status(500).json({ "SignUp Error": error });
    }
});
//////////// SignUp Ends Here //////////////////////////////////









///// Route For USER_LOGIN //////
const login = Router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        let value = Joi.object({
            email: Joi.string().required(),
            password: Joi.string().required()
        });
        let result = value.validate(req.body);
        if (result.error) {
            return res.status(406).json({ "Error From Login Validation": result.error.details[0].message });
        }
        else {

            let userFound = await userSchema.findOne({ email: email });
            if (userFound) {
                const confirmPass = await bcrypt.compare(password, userFound.password);
                if (confirmPass) {

                    let token_found = await tokenSchema.findOne({ email: userFound.email });
                    if (token_found) {
                        console.log(`User: ${userFound.email} is already Logged_Inn.`);
                        return res.status(406).json({ "ALERT": `User is already Logged_Inn` });
                    }
                    else {
                        try {

                            const token = await jwt.sign({ email: userFound.email }, process.env.SECRET_KEY, { expiresIn: "1y" });
                            let create_token = await tokenSchema.create({
                                token: token,
                                email: userFound.email
                            });
                            if (create_token) {
                                return res.status(200).json({ "ALERT": `User ${userFound.email} Logged Inn, Token Is:${token}` });
                            }
                        }
                        catch (errors) {
                            return res.status(500).json({ "Login TokenDB Error": `${errors}` });
                        }
                    }
                    return res.status(200).json({ "User Found": `${userFound}` });
                }
                else {
                    return res.status(401).json({ "Error": "Please Try Correct Password" });
                }
            }
            else {
                return res.status(401).json({ "ALERT": "User Not Found" });
            }
        }

    }
    catch (error) {
        return res.status(500).json({ "ERROR From Login Catch": error });
    }
});

/////////// User Login Ends Here ///////////////////////




///// Route For USER_PROFILE //////
const user_profile = Router.get("/userprofile", async (req, res) => {

    console.log(req.method);
    console.log(PORT);
    return res.status(200).json({ "ALERT": `user_profile is working ${PORT}` });
});
/////////// User USER_PROFILE Ends Here ///////////////////////


///// Route For USER_LOGOUT //////
const logout = Router.get("/logout", auth, async (req, res) => {
    try {
        let header = req.headers["authorization"];
        let token = header && header.split(" ")[1];

        let auth_token_found = await tokenSchema.findOne({ token: token });
        if (auth_token_found) {
            try {
                await tokenSchema.findOneAndDelete({ token: auth_token_found.token });
                return res.status(201).json({ "ALERT": `${auth_token_found.email}: is logged out.` });
            } catch (error) {
                return res.status(500).json({ "Error from LOGOUT": error });
            }
        }
        else {
            console.log("The User Is Already Logged_Out");
            return res.status(404).json({ "ALERT: ": "The User Is Already Logged_Out" });
        }

    }


    catch (error) {
        return res.status(500).json({ "Error from LOGOUT OUTER CATCH": `${error}` });
    }
});
/////////// Ends Here ///////////////////////



///// Route For STAM-DUTY 5%//////
const stamp_duty5 = Router.get("/stampduty5", async (req, res) => {
    try {
        
        const { percent, total } = req.body;
        if (percent == 5) {
            const Stamp_Duty = (percent / 100) * total;
            console.log("Stamp Duty: " + Stamp_Duty);

            const fivePercent = (5 / 100) * total;
            console.log("fivePercent: " + fivePercent);

            let total5 = Stamp_Duty + fivePercent;
            return res.status(200).json({ "ALERT duty-stamp": `Total Deposit: ${total5}` });
        }
        if (percent == 10) {
            const Stamp_Duty = (percent / 100) * total;
            console.log("Stamp Duty: " + Stamp_Duty);
            const tenPercent = (10 / 100) * total;
            console.log("tenPercent: " + tenPercent);
            let total10 = Stamp_Duty + tenPercent;
            return res.status(200).json({ "ALERT duty-stamp": `Total Deposit: ${total10}` });

        }
        if (percent == 15) {
            const Stamp_Duty = (percent / 100) * total;
            console.log("Stamp Duty: " + Stamp_Duty);
            const fifteenPercent = (15 / 100) * total;
            console.log("fivePercent: " + fifteenPercent);
            let total15 = Stamp_Duty + fifteenPercent;
            return res.status(200).json({ "ALERT": `Total Deposit:${total15}` });
        }
        else {
            const Stamp_Duty = (percent / 100) * total;
            console.log("Stamp Duty: " + Stamp_Duty);
            const fifteenPercent = (15 / 100) * total;
            console.log("fivePercent: " + fifteenPercent);
            let total15 = Stamp_Duty + fifteenPercent;
            return res.status(200).json({ "ALERT": `Total Deposit:${total15}` });
        }


    } catch (error) {
        return res.status(500).json({ "ERROR duty-stamp5": `${error}` });
    }
});
/////////// Ends Here ///////////////////////

///// Route For STAM-DUTY 10%//////
const stamp_duty10 = Router.get("/stampduty10", async (req, res) => {
    try {
        const { percent, total } = req.body;
        const Stamp_Duty = (percent / 100) * total;
        console.log("Stamp Duty: " + Stamp_Duty);
        const tenPercent = (10 / 100) * total;
        console.log("tenPercent: " + tenPercent);
        let total10 = Stamp_Duty + tenPercent;
        return res.status(200).json({ "ALERT duty-stamp": `Total Deposit: ${total10}` });

    } catch (error) {
        return res.status(500).json({ "ERROR duty-stamp10": `${error}` });
    }
});
/////////// Ends Here ///////////////////////

///// Route For STAM-DUTY 15% //////
const stamp_duty15 = Router.post("/stampduty", async (req, res) => {
    try {
        const { state, price } = req.body;
        

        console.log(typeof(state));
        //const string_state = toString(state);
        switch (state) {
            
            case "ACT":
                if (price > 0 && price <= 200000) {
                    const result = (price / 100) * 0.68;
                    return res.status(200).json({
                        "Result For ACT: ": result
                    });

                }
                else if (price > 200000 && price <= 300000) {
                    const minus = price - 200000;
                    const divide = minus / 100;
                    const multiply = divide * 2.20;
                    const plus = multiply + 1360;
                    return res.status(200).json({
                        "Result For ACT: ": plus
                    });
                }
                else if (price > 300000 && price <= 500000) {
                    const minus = price - 300000;
                    const divide = minus / 100;
                    const multiply = divide * 3.40;
                    const plus = multiply + 3560;
                    return res.status(200).json({
                        "Result For ACT: ": plus
                    });
                }
                else if (price > 500000 && price <= 750000) {
                    const minus = price - 500000;
                    const divide = minus / 100;
                    const multiply = divide * 4.32;
                    const plus = multiply + 10360;
                    return res.status(200).json({
                        "Result For ACT: ": plus
                    });
                }
                else if (price > 750000 && price <= 1000000) {
                    const minus = price - 750000;
                    const divide = minus / 100;
                    const multiply = divide * 5.90;
                    const plus = multiply + 21160;
                    return res.status(200).json({
                        "Result For ACT: ": plus
                    });
                }
                else if (price > 1000000 && price <= 1454999) {
                    const minus = price - 1000000;
                    const divide = minus / 100;
                    const multiply = divide * 6.40;
                    const plus = multiply + 35910;
                    return res.status(200).json({
                        "Result For ACT: ": plus
                    });
                }
                else if (price >= 1454999) {
                    const divide = price / 100;
                    const multiply = divide * 4.54;
                    return res.status(200).json({
                        "Result For ACT: ": multiply
                    });
                }


                break;
            case "NSW":

                if (price > 0 && price <= 14000) {
                    const result = (price / 100) * 1.25;
                    return res.status(200).json({
                        "Result For NSW: ": result
                    });

                }
                else if (price > 14000 && price <= 32000) {
                    const minus = price - 14000;
                    const divide = minus / 100;
                    const multiply = divide * 1.50;
                    const plus = multiply + 175;
                    return res.status(200).json({
                        "Result For NSW: ": plus
                    });
                }
                else if (price > 32000 && price <= 85000) {
                    const minus = price - 32000;
                    const divide = minus / 100;
                    const multiply = divide * 1.75;
                    const plus = multiply + 445;
                    return res.status(200).json({
                        "Result For NSW: ": plus
                    });
                }
                else if (price > 85000 && price <= 319000) {
                    const minus = price - 85000;
                    const divide = minus / 100;
                    const multiply = divide * 3.50;
                    const plus = multiply + 1372;
                    return res.status(200).json({
                        "Result For NSW: ": plus
                    });
                }
                else if (price > 319000 && price <= 1064000) {
                    const minus = price - 319000;
                    const divide = minus / 100;
                    const multiply = divide * 4.50;
                    const plus = multiply + 9562;
                    return res.status(200).json({
                        "Result For NSW: ": plus
                    });
                }
                else if (price > 1064000 && price <= 3194000) {
                    const minus = price - 1064000;
                    const divide = minus / 100;
                    const multiply = divide * 5.50;
                    const plus = multiply + 43083;
                    return res.status(200).json({
                        "Result For NSW: ": plus
                    });
                }
                else if (price >= 3194000) {
                    const divide = price / 100;
                    const multiply = divide * 7.00;
                    return res.status(200).json({
                        "Result For NSW: ": multiply
                    });
                }

                break;
            case "QLD": /// need consentration on calculation

                if (price > 0 && price <= 350000) {
                    const result = (price / 100);
                    return res.status(200).json({
                        "Result For QLD: ": result
                    });

                }
                // else if (price > 5000 && price <= 75000) {
                //     const result = price / 100
                //     return res.status(200).json({
                //         "Result For QLD: ": result
                //     });
                // }
                // else if (price > 32000 && price <= 85000) {
                //     const minus = price - 32000;
                //     const divide = minus / 100;
                //     const multiply = divide * 1.75;
                //     const plus = multiply + 445;
                //     return res.status(200).json({
                //         "Result For NSW: ": plus
                //     });
                // }
                // else if (price > 85000 && price <= 319000) {
                //     const minus = price - 85000;
                //     const divide = minus / 100;
                //     const multiply = divide * 3.50;
                //     const plus = multiply + 1372;
                //     return res.status(200).json({
                //         "Result For NSW: ": plus
                //     });
                // }
                // else if (price > 319000 && price <= 1064000) {
                //     const minus = price - 319000;
                //     const divide = minus / 100;
                //     const multiply = divide * 4.50;
                //     const plus = multiply + 9562;
                //     return res.status(200).json({
                //         "Result For NSW: ": plus
                //     });
                // }
                // else if (price > 1064000 && price <= 3194000) {
                //     const minus = price - 1064000;
                //     const divide = minus / 100;
                //     const multiply = divide * 5.50;
                //     const plus = multiply + 43083;
                //     return res.status(200).json({
                //         "Result For NSW: ": plus
                //     });
                // }
                // else if (price >= 3194000) {
                //     const divide = price / 100;
                //     const multiply = divide * 7.00;
                //     return res.status(200).json({
                //         "Result For NSW: ": multiply
                //     });
                // }
                break;

            case "NT":

                const V = (price/1000);
                const D = (0.06571441 * (V*V) ) + 15*V;
                return res.status(200).json({
                    "Result For NT: ": D
                });
                break;
            case "lab":

                console.log("LAB");
                break;
            case "lab":

                console.log("LAB");
                break;
        }

    }
    catch (error) {
        return res.status(500).json({ "ERROR duty-stamp15": `${error}` });
    }
});
/////////// Ends Here ///////////////////////



///// Route For Forgot Pass Link //////
const forgot_Pass_link = Router.post("/forgotpasslink", async (req, res) => {
    try {

        const { email } = req.body;
        console.log(email);
        let value = Joi.object({
            email: Joi.string().required(),
        });
        let result = value.validate(req.body);
        if (result.error) {
            return res.status(406).json({ "Error Validation": "Please Enter Valid inputs" });
        }
        else {
            const userFound = await userSchema.findOne({ email: email });
            if (userFound) {
                process.env.user_email = userFound.email;
                console.log("Email From Link: " + process.env.user_email);
                try {
                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: app_email,///enter email from email will be send
                            pass: app_pass///enter your email's password
                        }
                    });
                    //// Email Portion

                    var mailOption = {
                        from: 'Land Investment',
                        to: email,
                        subject: 'Reset Password',
                        text: "Click On the link to update Password for LandInvestment",
                        html: forget_pass
                    };

                    transporter.sendMail(mailOption, (error, info) => {
                        if (error) {
                            console.log(error);
                        }
                        else {
                            console.log(`Email sent:${info.response}`);
                        }
                    });

                    return res.status(200).json({ "ALERT": `The Mail Has Sent to EMAIL: ${email}` });

                } catch (error) {
                    return res.status(500).json({ "ERROR from email link": `${error}` });
                }

                //////////

            }
            else {
                return res.status(400).json({ "forgotpassLink": `user not found` });
            }



        }
    } catch (error) {
        return res.status(500).json({ "forgotpassLink": `${error}` });
    }
});
/////////// Ends Here ///////////////////////

///// Route For Forgot Pass //////
const forgot_Pass = Router.patch("/forgotpass", async (req, res) => {
    try {



        const { newPass } = req.body;
        console.log("Email From forgetPassword: " + process.env.user_email);
        var value = Joi.object({
            newPass: Joi.string().min(6).max(25).required(),
        });
        let validation = value.validate(req.body);
        if (validation.error) {
            return res.status(400).json({ "ERROR: Bad Request": `${validation.error}` });
        }
        else {
            const hashForgetPass = await bcrypt.hash(newPass, 10);
            let result = await userSchema.findOneAndUpdate({ email: process.env.user_email }, { password: hashForgetPass });
            if (result) {
                console.log("Pass Updated");
                return res.status(201).json({ "ALERT: ": `Password Updated Successfully For ${process.env.user_email}` });
            } else {
                return res.status(500).json({ "ERROR": `forgotpass not done` });
            }

        }

    } catch (error) {
        return res.status(500).json({ "forgotpass": `${error}` });
    }
});
/////////// Ends Here ///////////////////////





///// Route For ADMIN_Get ALL users //////
const saving_user_data = Router.post("/savinguserdata", auth, async (req, res) => {
    try {

        const {
            state,
            purposeOfProperty,
            firstHomeOwner,
            deposit,
            calculateLMI,
            typeOfProperty,
            purchasedPrice
        } = req.body;

        let user_result = await userExtraDataSchema.create({
            state: state,
            purposeOfProperty: purposeOfProperty,
            firstHomeOwner: firstHomeOwner,
            deposit: deposit,
            calculateLMI: calculateLMI,
            typeOfProperty: typeOfProperty,
            purchasedPrice: purchasedPrice,
            userEmail: req.userEmail
        });
        if (user_result) {
            return res.status(201).json({ "ALERT": `Extra Data Entered Succesfully ${user_result}` });
        }
        else {
            return res.status(404).json({ "ALERT": `Extra Data Not Entered` });
        }
    }
    catch (error) {
        return res.status(500).json({ "Error": `${error}` });
    }
});

/////////// User Login Ends Here ///////////////////////







module.exports = {
    signUp,
    login,
    user_profile,
    jwt,
    logout,
    stamp_duty5,
    stamp_duty10,
    stamp_duty15,
    forgot_Pass,
    forgot_Pass_link,
    saving_user_data
}