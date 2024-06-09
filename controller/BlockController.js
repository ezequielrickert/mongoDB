const BaseController = require('./BaseController');

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
            console.log("After connecting mongo.")
            const database = this.mongoClient.db(this.config.mongodb.database);
            console.log("Algo de la db");
            const users = database.collection("users");
            console.log("dESPUES DE LA COLLECTION");
            const jsonMessage = JSON.parse(JSON.parse(String(message)));
            console.log("jsonMessage en block controller es: " + jsonMessage);
            for (const user of jsonMessage) {
                await users.updateOne(
                    { _id: user.userId }, // Filter
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