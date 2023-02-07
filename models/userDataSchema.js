const db = require("../server");
const Schema = db.Schema;


const userData = new Schema({
    state:{
        type:String,
        required:true
    },
    purposeOfProperty:{
        type:String,
        required:true
    },
  
    firstHomeOwner:{
        type:String,
        required:true
    },
    deposit:{
        type:String,
        required:true
    },
    calculateLMI:{
        type:String,
        required:true
    },
    typeOfProperty:{
        type:String,
        required:true
    },
    purchasedPrice:{
        type:String,
        required:true
    },
    userEmail:{
        type:String,
        required:true
    },
});

module.exports = db.model("userExtraData",userData);