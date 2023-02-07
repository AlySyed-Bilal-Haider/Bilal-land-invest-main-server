const db = require("../server");
const Schema = db.Schema;


const user = new Schema({
    fullName:{
        type:String,
        minlength:2,
        maxlength:255,
        required:true
    },
    email:{
        type:String,
        minlength:2,
        maxlength:255,
        required:true
    },
    phone:{
        type:String,
        minlength:10,
        maxlength:11,
        required:true
    },
    lookingFor:{
        type:String,
        enum:["house","investment"],
        required:true
    },
    password:{
        type:String,
        required:true
    },
    currentState:{
        type:String,
        minlength:2,
        maxlength:25,
        required:true
    },
    budget:{
        type:String,
        minlength:1,
        required:true
    }
});

module.exports = db.model("user",user);