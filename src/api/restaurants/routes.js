const routes = (handler) => [
  {
    method: "POST",
    path: "/recommendation",
    handler: handler.postRecommendationHandler,
  },
  {
    method: "GET",
    path: "/restaurants",
    handler: handler.getRestaurantsHandler,
  },
  {
    method: "GET",
    path: "/restaurants/{id}",
    handler: handler.getRestaurantByIdHandler,
  },
  {
    method: "GET",
    path: "/restaurants/best",
    handler: handler.getBestRestaurantsHandler,
  },
];

module.exports = routes;
