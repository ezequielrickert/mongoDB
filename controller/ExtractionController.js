const BaseController = require('./BaseController');

class ExtractionController extends BaseController {
    constructor(mqttClient, mongoClient, config) {
        super(mqttClient, '/extract');
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

            const extractionLimit = house.limit === 0 ? house.capacity : house.limit;

            if (house) {
                const amount = Number(jsonMessage.amount);
                if (extractionLimit >= jsonMessage.amount) {
                    await houses.updateOne({houseId: jsonMessage.houseId}, {$inc: {capacity: -amount}});
                    console.log(`Extracted ${jsonMessage.amount} from the safebox. New limit is ${house.capacity - jsonMessage.amount}`);
                }
                else {
                    console.log('You are over the extraction limit');
                }
            } else {
                console.log("House does not exist");
            }
        } finally {
            await this.mongoClient.close();
        }
    }
}

module.exports = ExtractionController;