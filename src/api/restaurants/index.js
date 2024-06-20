const RestaurantsHandler = require("./handler");
const routes = require("./routes");

const url = process.env.DATASET_URL;

module.exports = {
  name: "restaurants",
  version: "1.0.0",
  register: async (server, { service }) => {
    const Service = service;
    const { model } = server.app;
    const restaurantsService = new Service(model);
    await restaurantsService.loadRestaurantsData(url);
    const restaurantsHandler = new RestaurantsHandler(restaurantsService);
    server.route(routes(restaurantsHandler));
  },
};
