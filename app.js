import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCEAWzXg4Bwm94ltMGtps-5CTuZs56qSl4",
  authDomain: "adarsh-rojina.firebaseapp.com",
  projectId: "adarsh-rojina",
  storageBucket: "adarsh-rojina.firebasestorage.app",
  messagingSenderId: "83226432176",
  appId: "1:83226432176:web:b48608b2f561319f7da175",
  measurementId: "G-T84YDBTMJR"
};


// INITIALIZE FIREBASE
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// ONLY THESE TWO USERS
const allowedEmails = [
  "adarshkumarmgr1234@gmail.com",
  "bhurirojina@gmail.com"
];


// ELEMENTS
const loginScreen = document.getElementById("loginScreen");
const appScreen = document.getElementById("appScreen");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const loginError = document.getElementById("loginError");

const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const chatError = document.getElementById("chatError");

const welcomeText = document.getElementById("welcomeText");


// LOGIN
loginBtn.addEventListener("click", async () => {

  loginError.textContent = "";

  try {

    const result = await signInWithEmailAndPassword(
      auth,
      emailInput.value.trim(),
      passwordInput.value
    );

    if (!allowedEmails.includes(result.user.email)) {

      await signOut(auth);

      loginError.textContent =
        "Access denied. This is a private space for Adarsh and Rojina ❤️";

    }

  } catch (error) {

    loginError.textContent = error.message;

  }

});


// LOGOUT
logoutBtn.addEventListener("click", async () => {

  await signOut(auth);

});


// AUTH STATE
onAuthStateChanged(auth, (user) => {

  if (user && allowedEmails.includes(user.email)) {

    loginScreen.classList.add("hidden");

    appScreen.classList.remove("hidden");

    welcomeText.textContent =
      `Welcome ${user.email === "adarshkumarmgr1234@gmail.com"
        ? "Adarsh ❤️"
        : "Rojina ❤️"}`;

    loadMessages();

  } else {

    appScreen.classList.add("hidden");

    loginScreen.classList.remove("hidden");

  }

});


// SEND MESSAGE
sendBtn.addEventListener("click", async () => {

  const text = messageInput.value.trim();

  if (!text) return;

  chatError.textContent = "";

  try {

    await addDoc(
      collection(
        db,
        "couples",
        "adarsh_rojina",
        "messages"
      ),
      {
        text: text,
        senderEmail: auth.currentUser.email,
        senderName:
          auth.currentUser.email ===
          "adarshkumarmgr1234@gmail.com"
            ? "Adarsh"
            : "Rojina",
        createdAt: serverTimestamp()
      }
    );

    messageInput.value = "";

  } catch (error) {

    chatError.textContent = error.message;
    console.error(error);

  }

});


// REAL-TIME MESSAGES
function loadMessages() {

  const messagesRef = collection(
    db,
    "couples",
    "adarsh_rojina",
    "messages"
  );

  const q = query(
    messagesRef,
    orderBy("createdAt", "asc")
  );

  onSnapshot(
    q,
    (snapshot) => {

      messagesDiv.innerHTML = "";

      snapshot.forEach((doc) => {

        const message = doc.data();

        const messageElement =
          document.createElement("div");

        messageElement.classList.add("message");

        if (
          message.senderEmail ===
          auth.currentUser.email
        ) {
          messageElement.classList.add("my-message");
        }

        messageElement.innerHTML = `
          <div class="message-sender">
            ${message.senderName}
          </div>

          <div>
            ${message.text}
          </div>
        `;

        messagesDiv.appendChild(messageElement);

      });

      messagesDiv.scrollTop =
        messagesDiv.scrollHeight;

    },

    (error) => {

      chatError.textContent =
        "Chat error: " + error.message;

      console.error(error);

    }
  );

}


// ENTER TO SEND
messageInput.addEventListener("keydown", (event) => {

  if (event.key === "Enter") {

    event.preventDefault();

    sendBtn.click();

  }

});
