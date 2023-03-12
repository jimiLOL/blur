const mongoose = require('mongoose');


require("dotenv/config");


const connectionDB = () => {
    return connection
};
let connection = null;

(async () => {
    connection = await mongoose.createConnection(process.env.MONGODB_URI);


    mongoose.connection.on('error', err => {
        console.log(err);
      });
      mongoose.connection.on('connected', (ref) => {
        console.log('Open');
        console.log(ref);
        const collections = Object.keys(mongoose.connection.collections);
        console.log(collections);
      
        
      //   .listCollections().then((names) => {
      //     console.log(names);
      // })
      });
})()


module.exports = connectionDB;