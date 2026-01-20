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
const auth = firebase.auth();
const db = firebase.firestore();

let userId = null;
let symbols = [];
let data = {};

// 3. Login & Sign-Up Logic
document.getElementById("loginBtn").addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || password.length < 6) {
        alert("Please enter a valid email and a password at least 6 characters long.");
        return;
    }

    // Try to Login first
    auth.signInWithEmailAndPassword(email, password)
        .then(cred => {
            console.log("Login Successful");
            setupApp(cred.user.uid);
        })
        .catch(error => {
            // If login fails because user doesn't exist or wrong creds, try to SIGN UP
            console.log("Login failed, attempting to register new user...");
            
            auth.createUserWithEmailAndPassword(email, password)
                .then(cred => {
                    alert("Account Created Successfully!");
                    setupApp(cred.user.uid);
                })
                .catch(signUpError => {
                    // This will show if the password is too weak or email is formatted wrong
                    alert("Authentication Error: " + signUpError.message);
                });
        });
});

function setupApp(uid) {
    userId = uid;
    document.getElementById("loginDiv").style.display = "none";
    document.getElementById("appDiv").style.display = "block";
    loadData();
}

// 4. Firestore Data Handling
function loadData() {
    db.collection("users").doc(userId).get().then(doc => {
        if (doc.exists) {
            symbols = doc.data().symbols || [];
            data = doc.data().data || {};
        }
        render();
    }).catch(err => {
        console.error("Error loading: ", err);
        // If you see a 'Permission Denied' error here, your Firestore Rules are blocking you.
    });
}

function saveData() {
    db.collection("users").doc(userId).set({ symbols, data })
        .catch(err => alert("Firestore Error: " + err.message));
}

// 5. App UI Logic
function addSymbol() {
    const input = document.getElementById("symbolInput");
    const sym = input.value.trim().toUpperCase();
    if (!sym || symbols.includes(sym)) return;
    symbols.push(sym);
    saveData();
    render();
    input.value = "";
}

function addToday() {
    const d = new Date().toISOString().split("T")[0];
    if (!data[d]) {
        data[d] = {};
        saveData();
        render();
    }
}

window.deleteSymbol = function(sym) {
    if (!confirm("Delete " + sym + "?")) return;
    symbols = symbols.filter(s => s !== sym);
    Object.keys(data).forEach(d => { delete data[d][sym]; });
    saveData();
    render();
};

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
    Object.keys(data).sort((a, b) => b.localeCompare(a)).forEach(date => {
        const tr = document.createElement("tr");
        const tdDate = document.createElement("td");
        tdDate.textContent = date;
        tr.appendChild(tdDate);
        symbols.forEach(sym => {
            const td = document.createElement("td");
            const input = document.createElement("input");
            input.value = data[date][sym] || "";
            input.onchange = () => {
                data[date][sym] = input.value;
                saveData();
            };
            td.appendChild(input);
            tr.appendChild(td);
        });
        body.appendChild(tr);
    });
}

document.getElementById("addSymbolBtn").addEventListener("click", addSymbol);
document.getElementById("addTodayBtn").addEventListener("click", addToday);