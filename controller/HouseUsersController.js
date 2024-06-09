const BaseController = require('./BaseController');

class HouseUsersController extends BaseController {
    constructor(mqttClient, mongoClient, config) {
        super(mqttClient, '/house_users');
        this.mongoClient = mongoClient;
        this.config = config;
    }

    async handleMessage(message) {
        console.log("Received a message: " + message);
        try {
            console.log("Trying oh yeah");
            await this.mongoClient.connect();
            const database = this.mongoClient.db(this.config.mongodb.database);
            const users = database.collection("users");
            const jsonMessage = JSON.parse(String(message));

            console.log("This is a jsonMessage, sape: " + jsonMessage);

            const houseId = jsonMessage.houseId;

            console.log("houseId: " + houseId);

            const houseUsers = await users.find({ houseId: String(houseId) }).toArray();
            if (houseUsers) {
                // Create a new array that only contains the id and username of each user
                const usersInfo = houseUsers.map(user => ({ userId: user._id, username: user.username, isBlocked: user.isBlocked }));
                console.log(usersInfo);
                this.publish("/users_list", JSON.stringify(usersInfo));
            }
            else {
                console.log("Didn't find any users of the house");
            }
        } finally {
            await this.mongoClient.close();
        }
    }
}

module.exports = HouseUsersController;