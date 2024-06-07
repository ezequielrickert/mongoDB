const BaseController = require('./BaseController');

class LoginController extends BaseController {
    constructor(mqttClient, mongoClient, config) {
        super(mqttClient, '/login');
        this.mongoClient = mongoClient;
        this.config = config;
    }

    async handleMessage(message) {
        try {
            await this.mongoClient.connect();
            const database = this.mongoClient.db(this.config.mongodb.database);
            const users = database.collection("users");
            const jsonMessage = JSON.parse(JSON.parse(String(message)));
            console.log(jsonMessage);
            console.log(jsonMessage.username);
            console.log(jsonMessage.password);

            const user = await users.findOne({ username: jsonMessage.username });
            console.log(user);
            if (user) {
                console.log("comparing passwords!");
                if (user.password === jsonMessage.password && user.role === 'padre') {
                    console.log({houseId: user.houseId, userId: user._id});
                    this.publish("/user_data", {houseId: user.houseId, userId: user._id, message: "Welcome"});
                }
            } else {
                this.publish("/user_data", {houseId: user.houseId, userId: user._id, message: "Failed to login"})
                console.log('User does not exist');
            }
        } finally {
            await this.mongoClient.close();
        }
    }
}

module.exports = LoginController;


