// ================= IMPORTS =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ===== APP CHECK IMPORT =====
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-check.js";

console.log("auth.js loaded");

// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyC1c89hLKibBXtXVwsj-Rdm_1XoLPKjn_U",
  authDomain: "auth-a5431.firebaseapp.com",
  projectId: "auth-a5431"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("Firebase initialized");

// ================= APP CHECK =================
// Use **normal reCAPTCHA v3** (free plan)
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LcN0pssAAAAAN3gn52IVS3dMmqZBNfo3Sxx67YA'), // <-- your new key
  isTokenAutoRefreshEnabled: true
});

console.log("App Check initialized");

// ================= ELEMENTS =================
const loginBtn = document.getElementById("login-btn");
const showSignupBtn = document.getElementById("show-signup-btn");
const signupBtn = document.getElementById("signup-btn");
const errorBox = document.getElementById("signup-error");
const title = document.querySelector(".login-section h2");
const loginForm = document.getElementById("login-form");

// ================= LOGIN FORM SUBMIT =================
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Prevent login if Sign Up mode is active
  if (signupBtn.style.display === "block") return;

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("Login successful");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Login error:", error.code);
    if (error.code === "auth/user-not-found") {
      alert("Account not found.");
    } else if (error.code === "auth/wrong-password") {
      alert("Incorrect password.");
    } else {
      alert(error.message);
    }
  }
});

// ================= SHOW SIGNUP MODE =================
showSignupBtn.addEventListener("click", () => {
  console.log("Switching to Sign Up mode");

  // Reveal Sign Up fields
  document.getElementById("confirm-password").style.display = "block";
  document.getElementById("username").style.display = "block";
  signupBtn.style.display = "block";

  // Hide Login buttons
  loginBtn.style.display = "none";
  showSignupBtn.style.display = "none";

  // Update title
  title.innerText = "Create Account";

  // Clear fields and previous errors
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
  document.getElementById("confirm-password").value = "";
  document.getElementById("username").value = "";
  errorBox.style.display = "none";
});

// ================= CHECK USERNAME =================
async function isUsernameTaken(username) {
  if (!username) return false; // safeguard
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", "==", username));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

// ================= SIGNUP =================
signupBtn.addEventListener("click", async () => {
  console.log("Sign Up clicked");

  // Clear previous error
  errorBox.innerText = "";
  errorBox.style.display = "none";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const username = document.getElementById("username").value.trim();

  // ================= VALIDATION =================
  if (!email || !password || !confirmPassword || !username) {
    errorBox.innerText = "Please fill all fields.";
    errorBox.style.display = "block";
    return;
  }

  // Email basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errorBox.innerText = "Please enter a valid email address.";
    errorBox.style.display = "block";
    return;
  }

  // Username length limit
  if (username.length > 16) {
    errorBox.innerText = "Username must be 16 characters or less.";
    errorBox.style.display = "block";
    return;
  }

  if (password !== confirmPassword) {
    errorBox.innerText = "Passwords do not match.";
    errorBox.style.display = "block";
    return;
  }

  try {
    // Check username uniqueness
    if (await isUsernameTaken(username)) {
      errorBox.innerText = "Username already taken.";
      errorBox.style.display = "block";
      return;
    }

    // Hide error box before creating account
    errorBox.style.display = "none";

    // ================= CREATE USER =================
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User created in Auth:", user.uid);

    // Store user in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: email,
      username: username,
      createdAt: Date.now()
    });

    console.log("User stored in Firestore");

    alert(`Account created successfully! Welcome, ${username}.`);
    window.location.href = "index.html";

  } catch (error) {
    console.error("Signup error:", error.code);

    if (error.code === "auth/email-already-in-use") {
      errorBox.innerText = "Email already registered.";
    } else if (error.code === "auth/weak-password") {
      errorBox.innerText = "Password must be at least 6 characters.";
    } else {
      errorBox.innerText = error.message;
    }

    errorBox.style.display = "block";
  }
});
