// ================= IMPORTS =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-check.js";

console.log("home-auth.js loaded");

// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyC1c89hLKibBXtXVwsj-Rdm_1XoLPKjn_U",
  authDomain: "auth-a5431.firebaseapp.com",
  projectId: "auth-a5431"
};

// ✅ Step 1: Initialize Firebase app
const app = initializeApp(firebaseConfig);

// ✅ Step 2: Initialize App Check BEFORE using Auth or Firestore
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider ('6LcN0pssAAAAAN3gn52IVS3dMmqZBNfo3Sxx67YA'), // your new site key
  isTokenAutoRefreshEnabled: true
});

console.log("home-auth.js: App Check initialized");

// ✅ Step 3: Initialize Auth and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

console.log("home-auth.js: Firebase initialized");

// ===== DOM Elements =====
const signinLink = document.getElementById("signin-link");
const signoutBtn = document.getElementById("signout-btn");
const displayUsername = document.getElementById("display-username");

console.log("home-auth.js: DOM elements loaded");

// ===== Auth State Listener =====
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("home-auth.js: User logged in", user.uid);

    signinLink.style.display = "none";
    signoutBtn.style.display = "inline-block";

    // Fetch username from Firestore
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        displayUsername.textContent = `Welcome, ${userData.username}`;
        console.log("home-auth.js: Username displayed", userData.username);
      } else {
        displayUsername.textContent = "";
        console.warn("home-auth.js: No user data found in Firestore");
      }
    } catch (error) {
      console.error("home-auth.js: Error fetching user data", error);
    }

  } else {
    console.log("home-auth.js: No user logged in");

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
