import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
    apiKey: "AIzaSyBcemcL6XHoOZaefYWvsU7SMeA-uCczfMA",
    authDomain: "aeshmanager.firebaseapp.com",
    projectId: "aeshmanager",
    storageBucket: "aeshmanager.appspot.com",
    messagingSenderId: "655057665330",
    appId: "1:655057665330:web:52c689822758a61cf8eb2b"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app)

export { auth, app, db };
