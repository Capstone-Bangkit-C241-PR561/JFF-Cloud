require("dotenv").config();

const Hapi = require("@hapi/hapi");
const Inert = require("@hapi/inert");
const ClientError = require("./exceptions/ClientError");
const users = require("./api/users");
const UsersService = require("./services/usersService");
const UsersValidator = require("./validator/users/index");

(async () => {
  const usersService = new UsersService();

  const server = Hapi.server({
    port: process.env.PORT || 8080,
    host: process.env.HOST !== "localhost" ? "0.0.0.0" : "localhost",
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  await server.register([Inert]);

  await server.register([
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
  ]);

  server.ext("onPreResponse", (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: "fail",
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      const newResponse = h.response({
        status: "error",
        message: "Server error!",
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server start at: ${server.info.uri}`);
})();
