//////// Requires ///////////////////
const express = require("express");
const app = express();
const server = express();
const env = require("dotenv").config();


const mongodb = require("mongoose");
module.exports = mongodb;
const url = process.env.URL;
const PORT = process.env.PORT || 3000;

   
//// Cors //////
const cors = require("cors");
server.use(cors());
////////////////////////////

server.set("view engine","ejs");
server.use(express.urlencoded({extended:false}));
server.use(express.json()); //For JSON Enable...

//////////// boss's code for parser////////////
const { fileParser } = require('express-multipart-file-parser');
server.use(
    fileParser({
      rawBodyOptions: {
        limit: '30mb', //file size limit
      },
      busboyOptions: {
        limits: {
          fields: 50, //Number text fields allowed
        },
      },
    })
  );
///////////////////////////////////////////////

/////// Mongoodb Connection ///////
mongodb.connect(url, { useNewUrlParser: true }).then(() => {
    console.log("MongoDB is Connected")
});

const routes = require("./routes/routes");
server.use(routes);



server.listen(PORT, () => {
    console.log(`Port ${PORT} Has Been Connected`);
});

module.exports = {
    env,
    PORT
}