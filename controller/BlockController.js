const BaseController = require('./BaseController');
const { ObjectId } = require('mongodb');

class BlockController extends BaseController {
    constructor(mqttClient, mongoClient, config) {
        super(mqttClient, '/blockState');
        this.mongoClient = mongoClient;
        this.config = config;
    }

    async handleMessage(message) {
        try {
            console.log("I'm frikin frakin block controller");
            console.log("message recibido es: " + message);
            await this.mongoClient.connect();
            const database = this.mongoClient.db(this.config.mongodb.database);
            const users = database.collection("users");
            const jsonMessage = JSON.parse(JSON.parse(String(message)));
            console.log("jsonMessage en block controller es: " + jsonMessage);
            console.log("let's check the first user:")
            console.log(jsonMessage[0]);
            for (const user of jsonMessage) {
                console.log(user);
                await users.updateOne(
                    { _id: new ObjectId(user.userId) }, // Filter
                    { $set: { isBlocked: user.isBlocked } } // Update
                );
            }
        } catch (error) {
            console.error('An error occurred:', error);
        } finally {
            await this.mongoClient.close();
        }
    }
}

module.exports = BlockController;