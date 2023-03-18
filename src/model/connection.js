const mongoose = require('mongoose');


require("dotenv/config");


class ConnectionDB {
  constructor() {
    this.connection = {}
  }
  async connect(db_url) {
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
    // console.log(this.connection);
    if (this.connection.hasOwnProperty(db_url)) {
      this.connection[db_url].db = await mongoose.createConnection(db_url);
      this.connection[db_url].connect = true;
      // console.log(this.connection);
      return this.connection[db_url].db
    } else if (this.connection.hasOwnProperty(db_url) && this.connection.db_url?.connect && this.connection[db_url].db) {
      return this.connection[db_url].db


    } else {
      this.connection[db_url] = {};
      this.connection[db_url].connect = false;
      return null
    }




  }
};



module.exports = ConnectionDB;