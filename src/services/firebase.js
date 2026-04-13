import { initializeApp } from 'firebase/app';
import {
    getAuth,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyA28vUFz5dOjY94aeYSRXlBXzTzLuEDv7Q",
    authDomain: "vyaparos-prod.firebaseapp.com",
    projectId: "vyaparos-prod",
    storageBucket: "vyaparos-prod.firebasestorage.app",
    messagingSenderId: "794937891129",
    appId: "1:794937891129:web:d6c8d8da322d959c52b0e8",
    measurementId: "G-L29X9T2GKR"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Explicitly lock authentication state to the browser's local storage per requirements
setPersistence(auth, browserLocalPersistence)
    .then(() => {
        console.log('[FIREBASE] Session persistence set to LOCAL_SESSION');
    })
    .catch((error) => {
        console.error('[FIREBASE] Error setting persistence:', error);
    });
