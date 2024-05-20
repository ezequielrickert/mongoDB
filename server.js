const mqtt = require("mqtt");
const { MongoClient } = require("mongodb");
const config = require("./config");

// MQTT setup
const mqttUri = 'mqtt://' + config.mqtt.hostname + ':' + config.mqtt.port;
const mqttClient = mqtt.connect(mqttUri);

// MongoDB setup
const mongoUri = 'mongodb://' + config.mongodb.hostname + ':' + config.mongodb.port;
const mongoClient = new MongoClient(mongoUri);

mqttClient.on("connect", () => {
  subscribeToTopic("/login");
  console.log("MQTT Client connected");
});
mqttClient.on("message", async (topic, message) => {
  if (message != null) {
    message = JSON.parse(String(message));
    console.log(message);
    switch (topic) {
      case '/login':
        await handleLogin(message);
        break;
        // Add more cases as needed for other topics
      default:
        console.log(`No handler for topic ${topic}`);
    }
  };
});

async function handleLogin(message) {
  try {
    await mongoClient.connect();
    const database = mongoClient.db(config.mongodb.database);
    const users = database.collection("users");

    // Assuming message contains a 'username' property
    const user = await users.findOne({ username: message.username });
    if (user) {
      // User exists, publish user_Id and house_Id
      mqttClient.publish('/user_data', JSON.stringify({ userId: user._id }));
    } else {
      console.log('User does not exist');
    }
  } finally {
    await mongoClient.close();
  }
}

function subscribeToTopic(topic) {
  mqttClient.subscribe(topic, (err) => {
    if (!err) {
      console.log(`Subscribed to topic: ${topic}`);
    } else {
      console.error(`Failed to subscribe to topic: ${topic}`);
    }
  });
}


async function run(msg) {
  try {
    await mongoClient.connect();
    const database = mongoClient.db(config.mongodb.database);
    const haiku = database.collection("message");

    const date_time = new Date();

    const result = await haiku.insertOne(JSON.parse(msg));
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } finally {
    await mongoClient.close();
  }
}