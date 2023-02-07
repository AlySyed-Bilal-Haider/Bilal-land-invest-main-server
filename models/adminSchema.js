const db = require("../server");
const Schema = db.Schema;


const useradmin = new Schema({
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
  
    password:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        minlength:10,
        maxlength:11,
        required:true
    },
});

module.exports = db.model("admin",useradmin);