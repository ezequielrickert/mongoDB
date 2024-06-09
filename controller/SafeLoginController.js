const BaseController = require('./BaseController');

class SafeLoginController extends BaseController {
    constructor(mqttClient, mongoClient, config) {
        super(mqttClient, '/safeLogin');
        this.mongoClient = mongoClient;
        this.config = config;
    }

    async handleMessage(message) {
        try {
            await this.mongoClient.connect();
            const database = this.mongoClient.db(this.config.mongodb.database);
            const users = database.collection("users");
            const jsonMessage = JSON.parse(message); 
            console.log(jsonMessage);
            console.log(jsonMessage.username);
            console.log(jsonMessage.password);

            const user = await users.findOne({ username: jsonMessage.username });
            console.log(user);
            if (user) {
                console.log("comparing passwords!");
                if (user.password === jsonMessage.password && jsonMessage.id === user.houseId) {
                    console.log({houseId: user.houseId, userId: user._id});
                    this.publish("/isValid", {isValid: true});
                    setTimeout(() => {
                        this.publish("/isValid", {isValid: false});
                    }, 10000);
                }
            } else {
                console.log('User does not exist');
            }
        } finally {
            await this.mongoClient.close();
        }
    }
}

module.exports = SafeLoginController;


