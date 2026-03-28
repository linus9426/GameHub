import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
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

console.log("auth.js loaded");

// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyC1c89hLKibBXtXVwsj-Rdm_1XoLPKjn_U",
  authDomain: "auth-a5431.firebaseapp.com",
  projectId: "auth-a5431",
  appId: "1:383548464781:web:6f289215d0a4f4d9878cc4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
console.log("Firebase initialized");

// ================= ELEMENTS =================
const loginBtn = document.getElementById("login-btn");
const showSignupBtn = document.getElementById("show-signup-btn");
const signupBtn = document.getElementById("signup-btn");
const errorBox = document.getElementById("signup-error");
const title = document.querySelector(".login-section h2");
const loginForm = document.getElementById("login-form");

// ================= LOGIN FORM =================
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
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
    if (error.code === "auth/user-not-found") alert("Account not found.");
    else if (error.code === "auth/wrong-password") alert("Incorrect password.");
    else alert(error.message);
  }
});

// ================= SHOW SIGNUP =================
showSignupBtn.addEventListener("click", () => {
  console.log("Switching to Sign Up mode");
  document.getElementById("confirm-password").style.display = "block";
  document.getElementById("username").style.display = "block";
  signupBtn.style.display = "block";
  loginBtn.style.display = "none";
  showSignupBtn.style.display = "none";
  title.innerText = "Create Account";

  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
  document.getElementById("confirm-password").value = "";
  document.getElementById("username").value = "";
  errorBox.style.display = "none";
});

// ================= CHECK USERNAME =================
async function isUsernameTaken(username) {
  if (!username) return false;
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", "==", username));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

// ================= SIGNUP =================
signupBtn.addEventListener("click", async () => {
  console.log("Sign Up clicked");

  errorBox.innerText = "";
  errorBox.style.display = "none";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const username = document.getElementById("username").value.trim();

  console.log("Signup input:", { email, username, passwordLength: password.length });

  // Validate input
  if (!email || !password || !confirmPassword || !username) {
    errorBox.innerText = "Please fill all fields.";
    errorBox.style.display = "block";
    console.log("Validation failed: empty fields");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errorBox.innerText = "Please enter a valid email address.";
    errorBox.style.display = "block";
    console.log("Validation failed: invalid email");
    return;
  }

  if (username.length > 16) {
    errorBox.innerText = "Username must be 16 characters or less.";
    errorBox.style.display = "block";
    console.log("Validation failed: username too long");
    return;
  }

  if (password !== confirmPassword) {
    errorBox.innerText = "Passwords do not match.";
    errorBox.style.display = "block";
    console.log("Validation failed: passwords do not match");
    return;
  }

  try {
    if (await isUsernameTaken(username)) {
      errorBox.innerText = "Username already taken.";
      errorBox.style.display = "block";
      console.log("Validation failed: username taken");
      return;
    }

    console.log("Creating user in Firebase Auth...");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User created:", userCredential.user.uid);

    // Wait for user to be fully signed in
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("onAuthStateChanged fired. User:", user ? user.uid : null);

      if (user) {
        unsubscribe(); // stop listening

        console.log("Writing user data to Firestore...");
        try {
          await setDoc(doc(db, "users", user.uid), {
            email: email,
            username: username,
            createdAt: Date.now()
          });
          console.log("Firestore write succeeded");
          alert(`Account created successfully! Welcome, ${username}.`);
          // window.location.href = "index.html"; // commented out for debugging
        } catch (firestoreError) {
          console.error("Firestore write error:", firestoreError.code, firestoreError.message);
        }
      }
    });

  } catch (error) {
    console.error("Signup error:", error.code, error.message);
    if (error.code === "auth/email-already-in-use") errorBox.innerText = "Email already registered.";
    else if (error.code === "auth/weak-password") errorBox.innerText = "Password must be at least 6 characters.";
    else errorBox.innerText = error.message;
    errorBox.style.display = "block";
  }
});
