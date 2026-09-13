import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCEAWzXg4Bwm94ltMGtps-5CT5uZs56qSl4",
  authDomain: "adarsh-rojina.firebaseapp.com",
  projectId: "adarsh-rojina",
  storageBucket: "adarsh-rojina.firebasestorage.app",
  messagingSenderId: "83226432176",
  appId: "1:83226432176:web:b48608b2f561319f7da175",
  measurementId: "G-T84YDBTMJR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const allowedEmails = [
  "adarshkumarmgr1234@gmail.com",
  "bhurirojina@gmail.com"
];

const $ = (id) => document.getElementById(id);
const loginScreen = $("loginScreen");
const appScreen = $("appScreen");
const loginForm = $("loginForm");
const emailInput = $("email");
const passwordInput = $("password");
const loginError = $("loginError");
const logoutBtn = $("logoutBtn");
const welcomeText = $("welcomeText");
const messagesDiv = $("messages");
const messageForm = $("messageForm");
const messageInput = $("messageInput");
const chatError = $("chatError");
const noteForm = $("noteForm");
const loveNoteInput = $("loveNoteInput");
const notesDiv = $("notes");
const noteError = $("noteError");
const quickMessageStatus = $("quickMessageStatus");

let unsubscribeMessages = null;
let unsubscribeNotes = null;

function showError(element, message) {
  element.textContent = message || "";
}

function currentUserIsAllowed() {
  return auth.currentUser && allowedEmails.includes(auth.currentUser.email);
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showError(loginError, "");
  const email = emailInput.value.trim().toLowerCase();
  try {
    const result = await signInWithEmailAndPassword(auth, email, passwordInput.value);
    if (!allowedEmails.includes(result.user.email.toLowerCase())) {
      await signOut(auth);
      showError(loginError, "Access denied. This space is only for Adarsh and Rojina ❤️");
    }
  } catch (error) {
    showError(loginError, "Login failed. Please check your email and password.");
    console.error(error);
  }
});

logoutBtn.addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, (user) => {
  if (user && allowedEmails.includes(user.email.toLowerCase())) {
    loginScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");
    welcomeText.textContent = `Welcome ${user.email.toLowerCase() === allowedEmails[0] ? "Adarsh ❤️" : "Rojina ❤️"}`;
    startRealtimeListeners();
  } else {
    appScreen.classList.add("hidden");
    loginScreen.classList.remove("hidden");
    stopRealtimeListeners();
  }
});

function startRealtimeListeners() {
  stopRealtimeListeners();

  const messagesRef = collection(db, "couples", "adarsh_rojina", "messages");
  const messagesQuery = query(messagesRef, orderBy("createdAt", "asc"));

  unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
    messagesDiv.replaceChildren();

    if (snapshot.empty) {
      messagesDiv.innerHTML = '<p class="empty-state">No messages yet. Send the first one ❤️</p>';
      return;
    }

    snapshot.forEach((docSnap) => {
      const message = docSnap.data();
      const messageElement = document.createElement("article");
      messageElement.className = "message";
      if (message.senderEmail === auth.currentUser?.email) {
        messageElement.classList.add("my-message");
      }

      const sender = document.createElement("div");
      sender.className = "message-sender";
      sender.textContent = message.senderName || "Us";

      const text = document.createElement("div");
      text.className = "message-text";
      text.textContent = message.text || "";

      messageElement.append(sender, text);
      messagesDiv.appendChild(messageElement);
    });

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }, (error) => {
    showError(chatError, "Chat error. Check your Firebase Firestore Rules.");
    console.error(error);
  });

  const notesRef = collection(db, "couples", "adarsh_rojina", "notes");
  const notesQuery = query(notesRef, orderBy("createdAt", "desc"));

  unsubscribeNotes = onSnapshot(notesQuery, (snapshot) => {
    notesDiv.replaceChildren();

    if (snapshot.empty) {
      notesDiv.innerHTML = '<p class="empty-state">No love notes yet. Write the first one 💌</p>';
      return;
    }

    snapshot.forEach((docSnap) => {
      const note = docSnap.data();
      const noteCard = document.createElement("article");
      noteCard.className = "note-card";

      const noteText = document.createElement("p");
      noteText.textContent = note.text || "";

      const noteAuthor = document.createElement("small");
      noteAuthor.textContent = `— ${note.senderName || "Us"}`;

      noteCard.append(noteText, noteAuthor);
      notesDiv.appendChild(noteCard);
    });
  }, (error) => {
    showError(noteError, "Notes error. Check your Firebase Firestore Rules.");
    console.error(error);
  });
}

function stopRealtimeListeners() {
  if (unsubscribeMessages) unsubscribeMessages();
  if (unsubscribeNotes) unsubscribeNotes();
  unsubscribeMessages = null;
  unsubscribeNotes = null;
}

async function sendMessage(text) {
  if (!currentUserIsAllowed()) return;
  await addDoc(collection(db, "couples", "adarsh_rojina", "messages"), {
    text,
    senderEmail: auth.currentUser.email,
    senderName: auth.currentUser.email.toLowerCase() === allowedEmails[0] ? "Adarsh" : "Rojina",
    createdAt: serverTimestamp()
  });
}

messageForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  showError(chatError, "");
  try {
    await sendMessage(text);
    messageInput.value = "";
  } catch (error) {
    showError(chatError, "Message could not be sent. Check Firebase Rules.");
    console.error(error);
  }
});

document.querySelectorAll(".love-action").forEach((button) => {
  button.addEventListener("click", async () => {
    quickMessageStatus.textContent = "Sending love... ❤️";
    try {
      await sendMessage(button.dataset.message);
      quickMessageStatus.textContent = "Love sent successfully ❤️";
    } catch (error) {
      quickMessageStatus.textContent = "Could not send. Check your connection.";
      console.error(error);
    }
  });
});

noteForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = loveNoteInput.value.trim();
  if (!text || !currentUserIsAllowed()) return;
  showError(noteError, "");
  try {
    await addDoc(collection(db, "couples", "adarsh_rojina", "notes"), {
      text,
      senderEmail: auth.currentUser.email,
      senderName: auth.currentUser.email.toLowerCase() === allowedEmails[0] ? "Adarsh" : "Rojina",
      createdAt: serverTimestamp()
    });
    loveNoteInput.value = "";
  } catch (error) {
    showError(noteError, "Note could not be saved. Check Firebase Rules.");
    console.error(error);
  }
});

document.querySelectorAll(".nav-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.target;
    document.querySelectorAll(".page-section").forEach((section) => {
      section.classList.toggle("active-section", section.id === target);
    });
    document.querySelectorAll(".nav-btn").forEach((navButton) => {
      navButton.classList.toggle("active", navButton === button);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
