const routes = (handler) => [
  {
    method: "POST",
    path: "/signup",
    handler: handler.postSignUpHandler,
  },
  {
    method: "POST",
    path: "/signin",
    handler: handler.postSignInHandler,
  },
  {
    method: "POST",
    path: "/signout",
    handler: handler.postSignOutHandler,
  },
  {
    method: "GET",
    path: "/users/{uid}",
    handler: handler.getUserByIdHandler,
  },
  {
    method: "POST",
    path: "/users/{uid}/profile-img",
    handler: handler.uploadProfileImgHandler,
    options: {
      payload: {
        output: "stream",
        parse: true,
        allow: "multipart/form-data",
        multipart: true,
      },
    },
  },
];

module.exports = routes;
