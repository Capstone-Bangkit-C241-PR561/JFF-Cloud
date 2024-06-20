const {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  updateDoc,
} = require("firebase/firestore");
const { getAuth } = require("firebase/auth");
const { db } = require("../config/firebaseApp");
const bucket = require("../config/cloudStorage");
const NotFoundError = require("../exceptions/NotFoundError");

class UsersService {
  constructor() {
    this._db = db;
    this._auth = getAuth();
  }

  // Add user to database
  async addUser({ uid, username, email }) {
    try {
      const userRef = doc(this._db, "users", uid);
      await setDoc(userRef, {
        uid,
        username,
        email,
        profileImg: "",
      });
    } catch (error) {
      throw new Error(`Failed to add user to Firestore: ${error}`);
    }
  }

  // Get user by username
  async getUserByUsername(username) {
    const userRef = collection(this._db, "users");
    const q = query(userRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new NotFoundError("User not found");
    }

    let userData;

    querySnapshot.forEach((docs) => {
      userData = docs.data();
    });
    return userData;
  }

  // Get user by uid
  async getUserById(uid) {
    const userRef = doc(this._db, "users", uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
      throw new NotFoundError("User not found");
    }

    const user = docSnap.data();
    return {
      uid: user.uid,
      username: user.username,
      email: user.email,
      profileImg: user.profileImg,
    };
  }

  // Upload profile img to bucket & database
  async uploadProfileImg(uid, image, imageData) {
    const userRef = doc(this._db, "users", uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      throw new NotFoundError("User not found");
    }

    const filename = +new Date() + imageData.filename;
    const path = bucket.file(`profile-images/${filename}`);
    const fileStream = path.createWriteStream({
      metadata: {
        contentType: imageData.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      image
        .pipe(fileStream)
        .on("finish", async () => {
          const imageUrl = `https://storage.googleapis.com/${bucket.name}/${path.name}`;

          try {
            await updateDoc(userRef, { profileImg: imageUrl });

            resolve(imageUrl);
          } catch (error) {
            reject(error);
          }
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  }
}

module.exports = UsersService;
