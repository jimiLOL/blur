const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConnectionDB = require('../model/connection');

let Addresses = null;

require("dotenv/config");



 

function DynamicSchema(nameCollection, db) {

  const cryptoWalletSchema = new Schema({
    _id: mongoose.Types.ObjectId,
    walletAddress: {
      type: String,
      required: true
    },
    secretKey: Object
   });

  // const schemaSession = new Schema({
  //     _id: mongoose.Types.ObjectId,
  //     wallet_publicKey: {
  //         type: String,
  //         required: true,
  //     },
  //     accessToken: String
    

  // });


  return db.model(nameCollection, cryptoWalletSchema);

}


const connectionDBInit = new ConnectionDB();


function getModelWallet(prefix='cryptoWallet') {


  return new Promise(async (resolve, reject) => {
    if (!Addresses) {
      const connect = await connectionDBInit.connect(process.env.MONGODB_URI_WALLET);
      // console.log(connect);
        if (!connect) {
            setTimeout(() => {
                console.log('await connect ...');
                getModelWallet(prefix).then(res => {
                    resolve(res)
                })
            }, 1000);

        } else {
            Addresses = DynamicSchema(prefix, await connectionDBInit.connect(process.env.MONGODB_URI_WALLET));

            resolve(Addresses)


        }
    } else {
        resolve(Addresses)

    }
})



}

module.exports = { getModelWallet };
