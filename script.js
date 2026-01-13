// 1. Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBpJ5BX9sljrlMKZ_uPoSUJ0ZL-yuGK7aQ",
    authDomain: "sharetradingjournal.firebaseapp.com",
    projectId: "sharetradingjournal",
    storageBucket: "sharetradingjournal.firebasestorage.app",
    messagingSenderId: "694473918046",
    appId: "1:694473918046:web:839ba95754c26c2a9856cf"
};

// 2. Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

let userId = null;
let symbols = [];
let data = {};

// 3. Authentication Logic
document.getElementById("loginBtn").addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please enter both email and password");
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then(cred => {
            handleLogin(cred.user.uid);
        })
        .catch(err => {
            // If user doesn't exist, sign them up
            if (err.code === 'auth/user-not-found') {
                auth.createUserWithEmailAndPassword(email, password)
                    .then(cred => handleLogin(cred.user.uid))
                    .catch(e => alert("Signup error: " + e.message));
            } else {
                alert("Login error: " + err.message);
            }
        });
});

function handleLogin(uid) {
    userId = uid;
    document.getElementById("loginDiv").style.display = "none";
    document.getElementById("appDiv").style.display = "block";
    loadData();
}

// 4. Data Management
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
    db.collection("users").doc(userId).set({ symbols, data });
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
    const d = new Date().toISOString().split("T")[0];
    if (!data[d]) {
        data[d] = {};
        saveData();
        render();
    }
}

// 5. UI Rendering
function render() {
    const header = document.getElementById("headerRow");
    header.innerHTML = "<th>Date</th>";

    symbols.forEach(s => {
        const th = document.createElement("th");
        th.innerHTML = `${s} <button class="delBtn" onclick="deleteSymbol('${s}')">×</button>`;
        header.appendChild(th);
    });

    const body = document.getElementById("tableBody");
    body.innerHTML = "";

    // Sort dates descending (newest first)
    Object.keys(data).sort((a, b) => b.localeCompare(a)).forEach(date => {
        const tr = document.createElement("tr");
        const tdDate = document.createElement("td");
        tdDate.textContent = date;
        tr.appendChild(tdDate);

        symbols.forEach(sym => {
            const td = document.createElement("td");
            const input = document.createElement("input");
            input.value = data[date][sym] || "";
            input.onchange = () => { // Saves when user clicks away
                if (!data[date]) data[date] = {};
                data[date][sym] = input.value;
                saveData();
            };
            td.appendChild(input);
            tr.appendChild(td);
        });
        body.appendChild(tr);
    });
}

// 6. Event Listeners
document.getElementById("addSymbolBtn").addEventListener("click", addSymbol);
document.getElementById("addTodayBtn").addEventListener("click", addToday);