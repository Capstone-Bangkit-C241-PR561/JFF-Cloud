const {
  UserSignUpPayloadSchema,
  UserSignInPayloadSchema,
  ImageHeadersSchema,
  ChangePasswordPayloadSchema,
} = require("./schema");
const InvariantError = require("../../exceptions/InvariantError");

const UsersValidator = {
  validateUserSignUpPayload: (payload) => {
    const validationResult = UserSignUpPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateUserSignInPayload: (payload) => {
    const validationResult = UserSignInPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateImageHeaders: (payload) => {
    const validationResult = ImageHeadersSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateChangePasswordPayload: (payload) => {
    const validationResult = ChangePasswordPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UsersValidator;
