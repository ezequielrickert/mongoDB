const BaseController = require('./BaseController');
const { ObjectId } = require('mongodb');

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
            const users = database.collection("users");
            const jsonMessage = JSON.parse(message);
            console.log(jsonMessage);

            const house = await houses.findOne({ houseId: jsonMessage.houseId });

            const user = await users.findOne({ _id: new ObjectId(String(jsonMessage.userId))});

            if (house) {
                const extractionLimit = house.limit === 0 ? house.amount : house.limit;
                if (user) {
                    if (!user.isBlocked) {
                        const amount = Number(jsonMessage.amount);
                        if (extractionLimit >= jsonMessage.amount) {
                            await houses.updateOne({houseId: jsonMessage.houseId}, {$inc: {amount: -amount}});
                            console.log(`Extracted ${jsonMessage.amount} from the safebox. New limit is ${Number(house.amount) - Number(jsonMessage.amount)}`);                            this.publish("/extraction_confirmation", {message: "Extraction completed"});
                        } else {
                            console.log('You are over the extraction limit');
                            this.publish("/extraction_confirmation", {message: "You are over the extraction limit"});
                        }
                    }
                    else {
                        console.log("You are not allowed to extract money");
                        this.publish("/extraction_confirmation", {message: "You are not allowed to extract money"});
                    }
                }
                else {
                    console.log("User not found");
                    this.publish("/extraction_confirmation", {message: "User not found"});
                }
            } else {
                console.log("House does not exist");
                this.publish("/extraction_confirmation", {message: "House does not exist"});
            }
        } finally {
            this.publish("/isValid", {isValid: false});
            await this.mongoClient.close();
        }
    }
}

module.exports = ExtractionController;