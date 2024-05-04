// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { /* connectFirestoreEmulator, */ getFirestore } from 'firebase/firestore';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { /* connectStorageEmulator, */ getStorage } from 'firebase/storage';
// import { isDev } from '../isDev';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    
        apiKey: "AIzaSyAIvdMRXSHuXdJvIncKXFx6D2iMkX4Jzzk",
        authDomain: "miniextension-challenge-d49c4.firebaseapp.com",
        projectId: "miniextension-challenge-d49c4",
        storageBucket: "miniextension-challenge-d49c4.appspot.com",
        messagingSenderId: "10388695496",
        appId: "1:10388695496:web:6e14ea0a4279817bcf78fd",
        measurementId: "G-JZET2FJKZ9"
         
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);

export const firestore = getFirestore(firebaseApp);
export const baseBucketName = 'miniextension-challenge';

/* if (isDev) {
    connectFirestoreEmulator(firestore, '127.0.0.1', 8081);
} */
