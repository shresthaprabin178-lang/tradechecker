let symbols = JSON.parse(localStorage.getItem("symbols")) || [];
let data = JSON.parse(localStorage.getItem("data")) || {};

function save() {
    localStorage.setItem("symbols", JSON.stringify(symbols));
    localStorage.setItem("data", JSON.stringify(data));
}

function today() {
    return new Date().toISOString().split("T")[0];
}

function addSymbol() {
    const input = document.getElementById("symbolInput");
    const sym = input.value.trim().toUpperCase();
    if (!sym || symbols.includes(sym)) return;

    symbols.push(sym);
    save();
    render();
    input.value = "";
}

function addToday() {
    const d = today();
    if (!data[d]) {
        data[d] = {};
        save();
        render();
    }
}

function render() {
    const header = document.getElementById("headerRow");
    header.innerHTML = "<th>Date</th>";

    symbols.forEach(s => {
        const th = document.createElement("th");
        th.textContent = s;
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
            input.addEventListener("input", () => {
                data[date][sym] = input.value;
                save();
            });

            td.appendChild(input);
            tr.appendChild(td);
        });

        body.appendChild(tr);
    });
}

document.getElementById("addSymbolBtn").addEventListener("click", addSymbol);
document.getElementById("addTodayBtn").addEventListener("click", addToday);

addToday();
render();
