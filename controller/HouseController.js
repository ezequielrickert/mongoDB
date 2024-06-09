const BaseController = require('./BaseController');

class HouseController extends BaseController {
    constructor(mqttClient, mongoClient, config) {
        super(mqttClient, '/add_money');
        this.mongoClient = mongoClient;
        this.config = config;
    }

    async handleMessage(message) {
        try {
            await this.mongoClient.connect();
            const database = this.mongoClient.db(this.config.mongodb.database);
            const houses = database.collection("houses");
            const jsonMessage = JSON.parse(JSON.parse(String(message)));
            console.log(jsonMessage);
            const house = await houses.findOne({ houseId: jsonMessage.houseId });

            if (house) {
                await houses.updateOne({ houseId: jsonMessage.houseId }, { $inc: { amount: +jsonMessage.amount } });
                console.log(`Added ${jsonMessage.amount} to the safebox. New limit is ${Number(house.amount) + Number(jsonMessage.amount)}`);
            } else {
                console.log('House does not exist');
            }
        } finally {
            await this.mongoClient.close();
        }
    }
}

module.exports = HouseController;