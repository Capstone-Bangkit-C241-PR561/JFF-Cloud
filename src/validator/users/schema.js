const Joi = require("joi");

const UserSignUpPayloadSchema = Joi.object({
  username: Joi.string().required().messages({
    "string.empty": "Username is not allowed to be empty",
    "any.required": "Username is required",
  }),
  email: Joi.string().required().messages({
    "string.empty": "Email is not allowed to be empty",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is not allowed to be empty",
    "any.required": "Password is required",
  }),
});

const UserSignInPayloadSchema = Joi.object({
  username: Joi.string().required().messages({
    "string.empty": "Username is not allowed to be empty",
    "any.required": "Username is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is not allowed to be empty",
    "any.required": "Password is required",
  }),
});

const imageHeadersSchema = Joi.object({
  "content-type": Joi.string()
    .valid(
      "image/apng",
      "image/avif",
      "image/gif",
      "image/jpeg",
      "image/png",
      "image/webp"
    )
    .required()
    .messages({
      "any.only": "Upload failed. Only image files are allowed",
      "any.required": "file upload is required",
    }),
}).unknown();

module.exports = {
  UserSignUpPayloadSchema,
  UserSignInPayloadSchema,
  imageHeadersSchema,
};
