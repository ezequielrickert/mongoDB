const BaseController = require('./BaseController');

class LimitController extends BaseController {
    constructor(mqttClient, mongoClient, config) {
        super(mqttClient, '/extraction_limit');
        this.mongoClient = mongoClient;
        this.config = config;
    }

    async handleMessage(message) {
        try {
            await this.mongoClient.connect();
            const database = this.mongoClient.db(this.config.mongodb.database);
            const houses = database.collection("houses");
            const jsonMessage = JSON.parse(JSON.parse(String(message)));

            const house = await houses.findOne({ houseId: jsonMessage.houseId });

            if (house) {
                await houses.updateOne({ houseId: jsonMessage.houseId }, { $set: { limit: parseInt(jsonMessage.amount) } });
                console.log(`The limit of the safebox was set to ${jsonMessage.amount}`);
            } else {
                console.log('House does not exist');
            }
        } finally {
            await this.mongoClient.close();
        }
    }
}

module.exports = LimitController;