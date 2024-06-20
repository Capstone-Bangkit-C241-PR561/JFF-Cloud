const tf = require("@tensorflow/tfjs-node");
const haversine = require("haversine-distance");
const NotFoundError = require("../exceptions/NotFoundError");

class RestaurantService {
  constructor(model) {
    this._model = model;
    this._restaurants = [];
  }

  // Load restaurants from dataset
  async loadRestaurantsData(url) {
    try {
      console.log("Loaded restaurant dataset...");
      const res = await fetch(url);
      const data = await res.json();

      const mapRestaurantModel = ({
        id,
        "Nama Restoran": name,
        "Preferensi Makanan": foodPreference,
        "Harga Rata-Rata Makanan di Toko (Rp)": avgPrice,
        "Rating Toko": rating,
        "Jenis Suasana": atmosphereType,
        "Variasi Makanan": foodVariety,
        "All You Can Eat atau Ala Carte": diningType,
        Latitude: latitude,
        Longitude: longitude,
      }) => ({
        id,
        name,
        foodPreference,
        avgPrice,
        rating,
        atmosphereType,
        foodVariety,
        diningType,
        latitude,
        longitude,
      });

      const mappedRestaurants = data.restaurants.map(mapRestaurantModel);

      // Store mapped restaurant data
      this._restaurants.push(...mappedRestaurants);
      console.log("Successfully loaded dataset");
    } catch (error) {
      console.error("Error loaded restaurant dataset");
      console.error(error);
    }
  }

  // Get all restaurant
  async getAllRestaurant() {
    const mappedRestaurants = this._restaurants.map((restaurant) => ({
      id: restaurant.id,
      name: restaurant.name,
      avgPrice: restaurant.avgPrice,
      rating: restaurant.rating,
      foodVariety: restaurant.foodVariety,
      diningType: restaurant.diningType,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
    }));
    return mappedRestaurants;
  }

  // Predict recommendation score from given price
  async predictRecommendation(price) {
    const input = [price, 1, 2];

    const tensor = tf.tensor2d([input], [1, 3]);

    const prediction = this._model.predict(tensor);
    const score = (await prediction.data())[0];

    return score;
  }

  // Get recommended restaurants based on recommendation price and distance
  getRecommendedRestaurants(userCoords, score) {
    try {
      const tolerance = 0.1 * score;
      const filteredRestaurants = this._restaurants.filter((restaurant) => {
        const avgPrice = parseFloat(restaurant.avgPrice);
        return avgPrice <= score + tolerance;
      });

      // Mapping restaurants
      const mappedRestaurants = filteredRestaurants.map((restaurant) => ({
        id: restaurant.id,
        name: restaurant.name,
        avgPrice: restaurant.avgPrice,
        rating: restaurant.rating,
        foodVariety: restaurant.foodVariety,
        diningType: restaurant.diningType,
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
      }));

      // Calculate restaurant distance (Km)
      const restaurantsDistance = mappedRestaurants.map((restaurant) => {
        // Get restaurant coordinates
        const restaurantCoords = {
          latitude: restaurant.latitude,
          longitude: restaurant.longitude,
        };

        // Calculate distance
        const distance = haversine(userCoords, restaurantCoords) / 1000;
        return {
          ...restaurant,
          distance: parseFloat(distance.toFixed(2)),
        };
      });

      // Sort restaurants by distance
      const sortedRestaurants = restaurantsDistance.sort(
        (a, b) => a.distance - b.distance
      );

      return sortedRestaurants;
    } catch (error) {
      console.error("Error getting recommended restaurants");
      console.error(error);
      return [];
    }
  }

  // Get detailed restaurant by id
  getRestaurantById(id) {
    const restaurant = this._restaurants.find((r) => r.id == id);

    if (!restaurant) {
      throw new NotFoundError("Restaurant not found");
    }

    return restaurant;
  }
}

module.exports = RestaurantService;
