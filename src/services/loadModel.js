require("dotenv").config();
const tf = require("@tensorflow/tfjs-node");

async function loadModel() {
  try {
    console.log("Loading model...");
    const model = await tf.loadLayersModel(process.env.MODEL_URL);
    console.log("Model loaded successfully");
    return model;
  } catch (error) {
    console.log(`Failed to load model: ${error}`);
  }
}

module.exports = loadModel;
