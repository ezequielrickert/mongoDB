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
  mqttClient.subscribe("/login", (err) => {
    if (!err) {
      console.log("MQTT Client connected");
    }
  });
});

mqttClient.on("message", (topic, message) => {
  if (message != null) {
    message = JSON.parse(message); // Casting to string using String() constructor
    console.log(message);
    run(message);
  };
});


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