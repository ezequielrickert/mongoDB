const BaseController = require('./BaseController');

class RegisterController extends BaseController {
    constructor(mqttClient, mongoClient, config) {
        super(mqttClient, '/register');
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

            const user = {
                username: jsonMessage.username,
                password: jsonMessage.password,
                houseId: jsonMessage.houseId,
                role: "hijo"
            };

            const result = await users.insertOne(user);
            if (result.acknowledged) {
                console.log('User registered successfully');
            } else {
                console.log('Failed to register user');
            }
        } finally {
            await this.mongoClient.close();
        }
    }
}

module.exports = RegisterController;