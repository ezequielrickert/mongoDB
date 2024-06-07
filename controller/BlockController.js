const BaseController = require('./BaseController');

class BlockController extends BaseController {
    constructor(mqttClient, mongoClient, config) {
        super(mqttClient, '/blockState');
        this.mongoClient = mongoClient;
        this.config = config;
    }

    async handleMessage(message) {
        await this.mongoClient.connect();
        const database = this.mongoClient.db(this.config.mongodb.database);
        const users = database.collection("users");
        const jsonMessage = JSON.parse(JSON.parse(String(message)));
        for (const user of jsonMessage) {
            await users.updateOne(
                { _id: user.userId }, // Filter
                { $set: { isBlocked: user.isBlocked } } // Update
            );
        }
    }
}

module.exports = BlockController;