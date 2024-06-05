const autoBind = require("auto-bind");
const {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} = require("firebase/auth");
const { auth } = require("../../config/firebaseApp");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  // Signup
  async postSignUpHandler(request, h) {
    try {
      this._validator.validateUserSignUpPayload(request.payload);

      const { username, email, password } = request.payload;
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const { uid } = userCredential.user;

      // Save data to firestore
      await this._service.addUser({ uid, username, email });

      const response = h.response({
        status: "success",
        message: "User created",
        data: { uid },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        throw new InvariantError("Email already in use");
      }
    }
  }

  // Signin
  async postSignInHandler(request, h) {
    try {
      this._validator.validateUserSignInPayload(request.payload);

      const { username, password } = request.payload;

      // Get user by username
      const user = await this._service.getUserByUsername(username);
      const { email } = user;

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const { uid } = userCredential.user;
      const response = h.response({
        status: "success",
        message: "Signed in successfully",
        data: { uid },
      });
      response.code(200);
      return response;
    } catch (error) {
      if (error instanceof NotFoundError) {
        return error;
      }

      if (error.code === "auth/invalid-credential") {
        throw new AuthenticationError("Invalid password");
      }
    }
  }

  // Signout
  // eslint-disable-next-line class-methods-use-this
  async postSignOutHandler(request, h) {
    await signOut(auth);
    return h
      .response({
        status: "success",
        message: "Signed out successfully",
      })
      .code(200);
  }

  // Get User by uid
  async getUserByIdHandler(request, h) {
    const { uid } = request.params;
    const user = await this._service.getUserById(uid);
    return h
      .response({
        status: "success",
        data: user,
      })
      .code(200);
  }

  // Upload Profile Image
  async uploadProfileImgHandler(request, h) {
    try {
      const { uid } = request.params;
      const { image } = request.payload;

      // Get image metadata
      const imageData = image.hapi;

      const imageUrl = await this._service.uploadProfileImg(
        uid,
        image,
        imageData
      );

      const response = h.response({
        status: "success",
        message: "Profile Image updated",
        data: {
          profileImg: imageUrl,
        },
      });
      response.code(200);
      return response;
    } catch (error) {
      console.error(`Error while upload profile image: ${error.message}`);
    }
  }
}

module.exports = UsersHandler;
