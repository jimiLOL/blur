const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Addresses = {};

const connectionDB = require('../model/connection');


function DynamicSchema(nameCollection, db) {

    // const groupActive = new Schema({
    //   id: String,
    //   name: String,
    //   userCount: Number,
    //   theme: String
    // })
    const userReaction = new Schema({
        userId: String,
        emoticon: String,
        date_reaction: Number
    });

    const schemaReaction = new Schema({
        _id: mongoose.Types.ObjectId,
        chat_id: {
            type: Number,
            required: true,
        },
        message_id: {
            type: Number,
            required: true,
        },
        username: String,
        userId: String,
        message_text: String,
        userReaction: [userReaction],
        count_reaction: Number,

    });


    return db.model(nameCollection, schemaReaction);

}

// const TelegramSession = mongoose.model(
//   "TelegramSession",
//   shemaTelegram
// );
// module.exports = TelegramSession;


function getModelTelegramReaction(connection, prefix = 'messageReaction') {


    return new Promise((resolve, reject) => {
        if (!Addresses[prefix]) {
            if (!connectionDB()) {
                setTimeout(() => {
                    console.log('await connect ...');
                    getModelTelegramReaction(connection, prefix).then(res => {
                        resolve(res)
                    })
                }, 1000);

            } else {
                Addresses[prefix] = new DynamicSchema(prefix, connectionDB());

                resolve(Addresses[prefix])


            }
        } else {
            resolve(Addresses[prefix])

        }
    })



}

module.exports = { getModelTelegramReaction };
