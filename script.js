// ==============================
// 1️⃣ Add your Firebase config here
// ==============================
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBpJ5BX9sljrlMKZ_uPoSUJ0ZL-yuGK7aQ",
  authDomain: "sharetradingjournal.firebaseapp.com",
  projectId: "sharetradingjournal",
  storageBucket: "sharetradingjournal.firebasestorage.app",
  messagingSenderId: "694473918046",
  appId: "1:694473918046:web:839ba95754c26c2a9856cf"
};

// 2️⃣ Initialize Firebase
// ==============================
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

let userId = null;
let symbols = [];
let data = {};

// ==============================
// 3️⃣ Authentication
// ==============================
document.getElementById("loginBtn").addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
        .then(cred => {
            userId = cred.user.uid;
            document.getElementById("loginDiv").style.display = "none";
            document.getElementById("appDiv").style.display = "block";
            loadData();
        })
        .catch(err => {
            // If login fails, try signup
            auth.createUserWithEmailAndPassword(email, password)
                .then(cred => {
                    userId = cred.user.uid;
                    document.getElementById("loginDiv").style.display = "none";
                    document.getElementById("appDiv").style.display = "block";
                    loadData();
                })
                .catch(e => alert("Auth error: " + e.message));
        });
});

// ==============================
// 4️⃣ Firestore CRUD
// ==============================
function loadData() {
    db.collection("users").doc(userId).get().then(doc => {
        if (doc.exists) {
            symbols = doc.data().symbols || [];
            data = doc.data().data || {};
        }
        render();
    });
}

function saveData() {
    db.collection("users").doc(userId).set({symbols, data});
}

// ==============================
// 5️⃣ Utility Functions
// ==============================
function today() {
    return new Date().toISOString().split("T")[0];
}

function addSymbol() {
    const input = document.getElementById("symbolInput");
    const sym = input.value.trim().toUpperCase();
    if (!sym || symbols.includes(sym)) return;

    symbols.push(sym);
    saveData();
    render();
    input.value = "";
}

function deleteSymbol(sym) {
    if (!confirm("Delete " + sym + " column?")) return;

    symbols = symbols.filter(s => s !== sym);
    Object.keys(data).forEach(d => { delete data[d][sym]; });
    saveData();
    render();
}

function addToday() {
    const d = today();
    if (!data[d]) {
        data[d] = {};
        saveData();
        render();
    }
}

function render() {
    const header = document.getElementById("headerRow");
    header.innerHTML = "<th>Date</th>";

    symbols.forEach(s => {
        const th = document.createElement("th");
        const span = document.createElement("span");
        span.textContent = s;
        const del = document.createElement("button");
        del.textContent = "❌";
        del.className = "delBtn";
        del.onclick = () => deleteSymbol(s);
        th.appendChild(span);
        th.appendChild(del);
        header.appendChild(th);
    });

    const body = document.getElementById("tableBody");
    body.innerHTML = "";

    Object.keys(data).sort().forEach(date => {
        const tr = document.createElement("tr");
        const tdDate = document.createElement("td");
        tdDate.textContent = date;
        tr.appendChild(tdDate);

        symbols.forEach(sym => {
            const td = document.createElement("td");
            const input = document.createElement("input");
            input.value = data[date][sym] || "";
            input.oninput = () => {
                data[date][sym] = input.value;
                saveData();
            };
            td.appendChild(input);
            tr.appendChild(td);
        });

        body.appendChild(tr);
    });
}

// ==============================
// 6️⃣ Attach Buttons
// ==============================
document.getElementById("addSymbolBtn").addEventListener("click", addSymbol);
document.getElementById("addTodayBtn").addEventListener("click", addToday);
