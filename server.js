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
const LoginController = require('./controller/LoginController.js');
const RegisterController = require('./controller/RegisterController.js');
const ExtractionController = require('./controller/ExtractionController.js');
const LimitController = require('./controller/LimitController.js');
const HouseController = require('./controller/HouseController.js');
const SafeLoginController = require('./controller/SafeLoginController.js');
const HouseUsersController = require('./controller/HouseUsersController.js');

// Create controller instances
const loginController = new LoginController(mqttClient, mongoClient, config);
const registerController = new RegisterController(mqttClient, mongoClient, config);
const extractionController = new ExtractionController(mqttClient, mongoClient, config);
const limitController = new LimitController(mqttClient, mongoClient, config);
const houseController = new HouseController(mqttClient, mongoClient, config);
const safeLoginController = new SafeLoginController(mqttClient, mongoClient, config);
const houseUsersController = new HouseUsersController(mqttClient, mongoClient, config);

// Controllers are now listening for their respective topics
console.log("Application started");