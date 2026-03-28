import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-check.js";

console.log("home-auth.js loaded");

// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyC1c89hLKibBXtXVwsj-Rdm_1XoLPKjn_U",
  authDomain: "auth-a5431.firebaseapp.com",
  projectId: "auth-a5431",
  appId: "1:383548464781:web:6f289215d0a4f4d9878cc4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// App Check (non-Enterprise)
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LcN0pssAAAAAN3gn52IVS3dMmqZBNfo3Sxx67YA'),
  isTokenAutoRefreshEnabled: true
});

console.log("home-auth.js: App Check initialized");

const auth = getAuth(app);
const db = getFirestore(app);

// ===== DOM Elements =====
const signinLink = document.getElementById("signin-link");
const signoutBtn = document.getElementById("signout-btn");
const displayUsername = document.getElementById("display-username");

// ===== Auth State Listener =====
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("home-auth.js: User logged in", user.uid);
    signinLink.style.display = "none";
    signoutBtn.style.display = "inline-block";

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        displayUsername.textContent = `Welcome, ${userData.username}`;
        console.log("home-auth.js: Username displayed", userData.username);
      } else {
        displayUsername.textContent = "";
      }
    } catch (error) {
      console.error("home-auth.js: Error fetching user data", error);
    }

  } else {
    signinLink.style.display = "inline-block";
    signoutBtn.style.display = "none";
    displayUsername.textContent = "";
  }
});

// ===== Sign Out =====
signoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    console.log("home-auth.js: User signed out");
    signinLink.style.display = "inline-block";
    signoutBtn.style.display = "none";
    displayUsername.textContent = "";
  } catch (error) {
    console.error("home-auth.js: Error signing out", error);
  }
});
