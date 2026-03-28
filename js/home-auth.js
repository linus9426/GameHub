// home-auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ===== Firebase Config =====
const firebaseConfig = {
  apiKey: "AIzaSyC1c89hLKibBXtXVwsj-Rdm_1XoLPKjn_U",
  authDomain: "auth-a5431.firebaseapp.com",
  projectId: "auth-a5431",
  appId: "1:383548464781:web:6f289215d0a4f4d9878cc4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("home-auth.js: Firebase initialized");

// Initialize Auth and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// ===== DOM Elements =====
const signinLink = document.getElementById("signin-link");
const signoutBtn = document.getElementById("signout-btn");
const displayUsername = document.getElementById("display-username");
console.log("home-auth.js: DOM elements loaded");

// ===== Auth State Listener =====
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("home-auth.js: User logged in", user.uid);

    // Hide sign in link, show sign out button
    if (signinLink) signinLink.style.display = "none";
    if (signoutBtn) signoutBtn.style.display = "inline-block";

    // Fetch username from Firestore
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (displayUsername) displayUsername.textContent = `Welcome, ${userData.username}`;
        console.log("home-auth.js: Username displayed", userData.username);
      } else {
        if (displayUsername) displayUsername.textContent = "";
        console.warn("home-auth.js: No user data found in Firestore");
      }
    } catch (error) {
      console.error("home-auth.js: Error fetching user data", error);
    }

  } else {
    console.log("home-auth.js: No user logged in");

    // Show sign in link, hide sign out button
    if (signinLink) signinLink.style.display = "inline-block";
    if (signoutBtn) signoutBtn.style.display = "none";
    if (displayUsername) displayUsername.textContent = "";
  }
});

// ===== Sign Out =====
if (signoutBtn) {
  signoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      console.log("home-auth.js: User signed out");

      // Reset UI
      if (signinLink) signinLink.style.display = "inline-block";
      if (signoutBtn) signoutBtn.style.display = "none";
      if (displayUsername) displayUsername.textContent = "";
    } catch (error) {
      console.error("home-auth.js: Error signing out", error);
    }
  });
}
