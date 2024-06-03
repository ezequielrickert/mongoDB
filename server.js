const mqtt = require("mqtt");
const { MongoClient } = require("mongodb");
const config = require("./config");

// MQTT setup
const mqttUri = 'mqtt://' + config.mqtt.hostname + ':' + config.mqtt.port;
const mqttClient = mqtt.connect(mqttUri);

// MongoDB setup
const mongoUri = 'mongodb://' + config.mongodb.hostname + ':' + config.mongodb.port;
const mongoClient = new MongoClient(mongoUri);

// Import controllers
const LoginController = require('/controller/LoginController');
const RegisterController = require('/controller/RegisterController');
const ExtractionController = require('/controller/ExtractionController');
const LimitController = require('/controller/LimitController');
const HouseController = require('/controller/HouseController');
const SafeLoginController = require('/controller/SafeLoginController');

// Create controller instances
const loginController = new LoginController(mqttClient, mongoClient, config);
const registerController = new RegisterController(mqttClient, mongoClient, config);
const extractionController = new ExtractionController(mqttClient, mongoClient, config);
const limitController = new LimitController(mqttClient, mongoClient, config);
const houseController = new HouseController(mqttClient, mongoClient, config);
const safeLoginController = new SafeLoginController(mqttClient, mongoClient, config);

// Controllers are now listening for their respective topics
console.log("Application started");