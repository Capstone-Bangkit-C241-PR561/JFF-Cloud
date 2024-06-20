const autoBind = require("auto-bind");
const InvariantError = require("../../exceptions/InvariantError");

class RestaurantsHandler {
  constructor(service) {
    this._service = service;

    autoBind(this);
  }

  // Function get restaurants recommendation
  async postRecommendationHandler(request, h) {
    const { price, latitude, longitude } = request.payload;
    console.log(
      `Recommendation Payload: price: ${price}, lat: ${latitude}, long: ${longitude}`
    );

    if (typeof price !== "number") {
      throw new InvariantError("Invalid input. Price must be a number.");
    }

    if (!latitude && !longitude) {
      throw new InvariantError("Invalid input. Location is required");
    }

    const userCoords = { latitude, longitude };

    console.log("Predict score...");
    const score = await this._service.predictRecommendation(price);
    console.log("Predict successfully");
    console.log(`predict score: ${score}`);
    console.log("Loaded recommended restaurants...");
    const recommendedRestaurants =
      await this._service.getRecommendedRestaurants(userCoords, score);
    console.log("Successfully get recommended");

    const response = h.response({
      status: "success",
      message: "Recommendation successfully",
      data: recommendedRestaurants,
    });
    response.code(200);
    return response;
  }

  // Function get all restaurants
  async getRestaurantsHandler(request, h) {
    console.log("Loaded all restaurant...");
    const restaurants = await this._service.getAllRestaurant();
    console.log("Successfully get all restaurant");
    const response = h.response({
      status: "success",
      data: restaurants,
    });
    response.code(200);
    return response;
  }

  // Function get detailed restaurant
  async getRestaurantByIdHandler(request, h) {
    const { id } = request.params;
    console.log(`id resto: ${id}`);

    const restaurant = await this._service.getRestaurantById(id);
    const response = h.response({
      status: "success",
      data: restaurant,
    });
    response.code(200);
    return response;
  }
}

module.exports = RestaurantsHandler;
