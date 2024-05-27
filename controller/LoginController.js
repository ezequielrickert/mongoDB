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

            const user = await users.findOne({ username: message.username });
            if (user) {
                this.publish({ houseId: user.houseId });
            } else {
                console.log('User does not exist');
            }
        } finally {
            await this.mongoClient.close();
        }
    }
}

module.exports = LoginController;