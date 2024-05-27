class BaseController {
    constructor(mqttClient, topic) {
        this.mqttClient = mqttClient;
        this.topic = topic;

        this.mqttClient.subscribe(this.topic, (err) => {
            if (!err) {
                console.log(`Subscribed to topic: ${this.topic}`);
            } else {
                console.error(`Failed to subscribe to topic: ${this.topic}`);
            }
        });

        this.mqttClient.on('message', (receivedTopic, message) => {
            if (receivedTopic === this.topic) {
                this.handleMessage(JSON.parse(String(message)));
            }
        });
    }

    publish(message) {
        this.mqttClient.publish(this.topic, JSON.stringify(message));
    }

    handleMessage(message) {
        throw new Error('handleMessage method must be implemented by subclass');
    }
}

module.exports = BaseController;