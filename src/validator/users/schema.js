const Joi = require("joi");

const UserSignUpPayloadSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
});

const UserSignInPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

module.exports = { UserSignUpPayloadSchema, UserSignInPayloadSchema };
