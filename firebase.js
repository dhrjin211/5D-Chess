import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBikWNVxx5YoF1eAabEaVa8SbMTnxk3qlM",
  authDomain: "d-chess-c4e7c.firebaseapp.com",
  databaseURL: "https://d-chess-c4e7c-default-rtdb.firebaseio.com",
  projectId: "d-chess-c4e7c",
  storageBucket: "d-chess-c4e7c.firebasestorage.app",
  messagingSenderId: "571088594227",
  appId: "1:571088594227:web:fb51d34f1dc7dd02de4a46"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
