const express = require("express");
const app = express();
const user = require("../controllers/user");
const admin = require("../controllers/admin");

app.use("/api",user.signUp);
app.use("/api",user.login);
app.use("/api",user.user_profile);
app.use("/api",user.logout);
app.use("/api",user.stamp_duty5);
app.use("/api",user.stamp_duty10);
app.use("/api",user.stamp_duty15);
app.use("/api",user.forgot_Pass);
app.use("/api",user.forgot_Pass_link);
app.use("/api",user.saving_user_data);


app.use("/api",admin.signUpAdmin);
app.use("/api",admin.loginAdmin);
app.use("/api",admin.getAllUser);
app.use("/api",admin.getOneUser);
app.use("/api",admin.print_pdf);


module.exports = app;