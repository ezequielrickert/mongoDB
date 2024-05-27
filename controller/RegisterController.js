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

            const user = {
                username: message.username,
                password: message.password,
                houseId: message.houseId,
                role: "hijo"
            };

            const result = await users.insertOne(user);
            if (result.insertedCount > 0) {
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