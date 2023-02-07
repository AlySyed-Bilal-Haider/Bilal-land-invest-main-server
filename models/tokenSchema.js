const db = require("../server");
const Schema = db.Schema;


const usertoken = new Schema({
    token:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
});

module.exports = db.model("usertoken",usertoken);