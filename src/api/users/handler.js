const autoBind = require("auto-bind");
const {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
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

      // Check username already exists
      const usernameIsExists = await this._service
        .getUserByUsername(username)
        .then(() => true)
        .catch((error) => {
          if (error instanceof NotFoundError) {
            return false;
          }
        });
      if (usernameIsExists) {
        throw new InvariantError("Username already exists");
      }

      // Create a new user
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
      if (error instanceof InvariantError) {
        return error;
      }

      if (error.code === "auth/email-already-in-use") {
        throw new InvariantError("Email already exists");
      }
    }
  }

  // Signin
  async postSignInHandler(request, h) {
    try {
      this._validator.validateUserSignInPayload(request.payload);
      const { username, password } = request.payload;

      // Get email from user database
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
      if (error instanceof InvariantError || error instanceof NotFoundError) {
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
    const response = h.response({
      status: "success",
      message: "Signed out successfully",
    });
    response.code(200);
    return response;
  }

  // Get User by uid
  async getUserByIdHandler(request, h) {
    const { uid } = request.params;
    const user = await this._service.getUserById(uid);
    const response = h.response({
      status: "success",
      data: user,
    });
    response.code(200);
    return response;
  }

  // Upload Profile Image
  async uploadProfileImgHandler(request, h) {
    const { uid } = request.params;
    const { image } = request.payload;

    this._validator.validateImageHeaders(image.hapi.headers);

    // Get image metadata
    const imageData = image.hapi;

    const imageUrl = await this._service.uploadProfileImg(
      uid,
      image,
      imageData
    );

    const response = h.response({
      status: "success",
      message: "Profile image updated",
      data: {
        profileImg: imageUrl,
      },
    });
    response.code(200);
    return response;
  }

  async postUserChangePasswordHandler(request, h) {
    try {
      this._validator.validateChangePasswordPayload(request.payload);
      const { email, oldPassword, newPassword } = request.payload;
      const { uid } = request.params;

      await this._service.getUserById(uid);

      await signInWithEmailAndPassword(auth, email, oldPassword);
      const user = auth.currentUser;

      await updatePassword(user, newPassword);

      const response = h.response({
        status: "success",
        message: "Password updated successfully",
      });
      response.code(200);
      return response;
    } catch (error) {
      if (error instanceof InvariantError || error instanceof NotFoundError) {
        return error;
      }

      if (error.code === "auth/wrong-password") {
        throw new AuthenticationError("Invalid current password");
      }
    }
  }
}

module.exports = UsersHandler;
