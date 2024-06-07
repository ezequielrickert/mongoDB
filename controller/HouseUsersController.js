const BaseController = require('./BaseController');

class HouseUsersController extends BaseController {
    constructor(mqttClient, mongoClient, config) {
        super(mqttClient, '/house_users');
        this.mongoClient = mongoClient;
        this.config = config;
    }

    async handleMessage(message) {
        try {
            await this.mongoClient.connect();
            const database = this.mongoClient.db(this.config.mongodb.database);
            const users = database.collection("users");
            const jsonMessage = JSON.parse(JSON.parse(String(message)));

            const houseId = jsonMessage.houseId;
            const houseUsers = await users.find({ houseId: houseId }).toArray();

            console.log(`Users in house ${houseId}:`, houseUsers);
            if (houseUsers) {
                console.log(houseUsers);
                this.publish("/users_list", JSON.stringify(houseUsers));
            }
            else {
                console.log("Didnt find any users of the house");
            }
        } finally {
            await this.mongoClient.close();
        }
    }
}

module.exports = HouseUsersController;