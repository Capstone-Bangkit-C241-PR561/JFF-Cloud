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

const ImageHeadersSchema = Joi.object({
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

const ChangePasswordPayloadSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is not allowed to be empty",
    "any.required": "Email is required",
    "string.email": "Email must be a valid email address",
  }),
  oldPassword: Joi.string().required().messages({
    "string.empty": "Old Password is not allowed to be empty",
    "any.required": "Old Password is required",
  }),
  newPassword: Joi.string().required().messages({
    "string.empty": "New Password is not allowed to be empty",
    "any.required": "New Password is required",
  }),
});

module.exports = {
  UserSignUpPayloadSchema,
  UserSignInPayloadSchema,
  ImageHeadersSchema,
  ChangePasswordPayloadSchema,
};
