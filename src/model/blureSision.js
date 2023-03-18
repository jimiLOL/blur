const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require("dotenv/config");

const Addresses = {};

const connectionDB = require('../model/connection');


function DynamicSchema(nameCollection, db) {

    // const groupActive = new Schema({
    //   id: String,
    //   name: String,
    //   userCount: Number,
    //   theme: String
    // })
    // const userReaction = new Schema({
    //     userId: String,
    //     emoticon: String,
    //     date_reaction: Number
    // });

    const schemaSession = new Schema({
        _id: mongoose.Types.ObjectId,
        wallet_publicKey: {
            type: String,
            required: true,
        },
        accessToken: String
      

    });


    return db.model(nameCollection, schemaSession);

}

// const TelegramSession = mongoose.model(
//   "TelegramSession",
//   shemaTelegram
// );
// module.exports = TelegramSession;


function getModelBlurSession(connection, prefix = 'blurSession') {


    return new Promise(async (resolve, reject) => {
        if (!Addresses[prefix]) {
            if (!await connectionDB.connect(process.env.MONGODB_URI)) {
                setTimeout(() => {
                    console.log('await connect ...');
                    getModelBlurSession(connection, prefix).then(res => {
                        resolve(res)
                    })
                }, 1000);

            } else {
                Addresses[prefix] = new DynamicSchema(prefix, await connectionDB.connect(process.env.MONGODB_URI));

                resolve(Addresses[prefix])


            }
        } else {
            resolve(Addresses[prefix])

        }
    })



}

module.exports = { getModelBlurSession };
