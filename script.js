const tableBody = document.querySelector("#shareTable tbody");
const form = document.getElementById("shareForm");
const positiveCountEl = document.getElementById("positiveCount");
const negativeCountEl = document.getElementById("negativeCount");
const positivePercentEl = document.getElementById("positivePercent");
const negativePercentEl = document.getElementById("negativePercent");

let shares = JSON.parse(localStorage.getItem("shares")) || [];

// Save to localStorage
function saveData() {
  localStorage.setItem("shares", JSON.stringify(shares));
}

// Render the table
function renderTable() {
  tableBody.innerHTML = "";
  shares.forEach((item, index) => {
    const row = document.createElement("tr");

    // Serial number
    const snCell = document.createElement("td");
    snCell.textContent = index + 1;
    row.appendChild(snCell);

    // Editable cells - CORRECTED ORDER to match table headers
    const editableFields = ["stock","buyDate","buyPrice","quantity","targetPrice","stopLoss","sellPrice","sellDate"];
    editableFields.forEach(field => {
      const cell = document.createElement("td");
      cell.contentEditable = true;
      cell.dataset.field = field;
      cell.textContent = item[field] || "";
      row.appendChild(cell);

      // Only update value on Enter, Tab or blur
      cell.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          cell.blur();
        }
      });

      cell.addEventListener("blur", e => {
        let value = cell.textContent.trim();
        if (["buyPrice","quantity","sellPrice","targetPrice","stopLoss"].includes(field)) {
          // Parse as float, use 0 if invalid
          value = parseFloat(value) || 0; 
        }
        item[field] = value;
        calculateRow(index, row);
        saveData();
        updateTradeSummary();
      });
    });

    // Calculated cells: Buy Amount, Sell Amount, Profit/Loss, Profit %
    const buyAmountCell = document.createElement("td");
    const sellAmountCell = document.createElement("td");
    const profitCell = document.createElement("td");
    const profitPercentCell = document.createElement("td");
    row.appendChild(buyAmountCell);
    row.appendChild(sellAmountCell);
    row.appendChild(profitCell);
    row.appendChild(profitPercentCell);

    // Remarks cell - editable
    const remarksCell = document.createElement("td");
    remarksCell.contentEditable = true;
    remarksCell.textContent = item.remarks || "";
    remarksCell.addEventListener("blur", e => {
      item.remarks = remarksCell.textContent.trim();
      saveData();
    });
    row.appendChild(remarksCell);

    // Delete button
    const delCell = document.createElement("td");
    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.addEventListener("click", () => {
      shares.splice(index,1);
      saveData();
      renderTable();
    });
    delCell.appendChild(delBtn);
    row.appendChild(delCell);

    calculateRow(index, row);
    tableBody.appendChild(row);
  });

  updateTradeSummary();
}

// Calculate values for a single row
function calculateRow(index,row) {
  const item = shares[index];
  const buyPrice = parseFloat(item.buyPrice) || 0;
  const quantity = parseFloat(item.quantity) || 0;
  const sellPrice = parseFloat(item.sellPrice);

  const buyAmount = (buyPrice * quantity).toFixed(2);
  let sellAmount="", profit="", profitPercent="";

  if (!isNaN(sellPrice) && sellPrice > 0) {
    sellAmount = (sellPrice * quantity).toFixed(2);
    profit = (sellPrice*quantity - buyPrice*quantity).toFixed(2);
    
    // Check for division by zero (if buyAmount is 0)
    const totalBuyAmount = buyPrice * quantity;
    if (totalBuyAmount > 0) {
        profitPercent = ((profit / totalBuyAmount) * 100).toFixed(2);
    } else {
        profitPercent = (0).toFixed(2);
    }
  }

  // Cell index corresponds to the columns in the table:
  // 9: Buy Amount, 10: Sell Amount, 11: Profit/Loss, 12: P/L %
  row.cells[9].textContent = buyAmount;
  row.cells[10].textContent = sellAmount;
  row.cells[11].textContent = profit;
  row.cells[12].textContent = profitPercent + (profitPercent? "%":"");

  // Row color
  if (profit > 0) row.style.backgroundColor = "rgba(0,255,0,0.1)";
  else if (profit < 0) row.style.backgroundColor = "rgba(255,0,0,0.1)";
  else row.style.backgroundColor = "transparent";
}

// Update Positive/Negative trades
function updateTradeSummary() {
  let pos=0, neg=0, total=0;
  shares.forEach(item=>{
    const sell = parseFloat(item.sellPrice);
    const target = parseFloat(item.targetPrice);
    const stop = parseFloat(item.stopLoss);

    // Only count trades where all relevant prices are set (closed trade with rules)
    if (!isNaN(sell) && sell>0 && !isNaN(target) && !isNaN(stop)) {
      total++;
      if (sell >= target) pos++;
      else if (sell <= stop) neg++;
    }
  });
  
  positiveCountEl.textContent = pos;
  negativeCountEl.textContent = neg;
  
  const posPerc = total? ((pos/total)*100).toFixed(1):0;
  const negPerc = total? ((neg/total)*100).toFixed(1):0;
  
  positivePercentEl.textContent = posPerc;
  negativePercentEl.textContent = negPerc;
}

// Form submit
form.addEventListener("submit", e=>{
  e.preventDefault(); // <-- This is what prevents the page reload/reset

  // Ensure all required fields are valid before accessing .value
  const stock = document.getElementById("stock").value;
  const buyDate = document.getElementById("buyDate").value;
  const buyPrice = parseFloat(document.getElementById("buyPrice").value) || 0;
  const quantity = parseFloat(document.getElementById("quantity").value) || 0;
  const remarks = document.getElementById("remarks").value;

  // Add new share data with default editable fields set to 0 or ""
  shares.push({
    stock,
    buyDate,
    buyPrice,
    quantity,
    targetPrice: 0,
    stopLoss: 0,
    sellPrice: 0,
    sellDate: "",
    remarks
  });
  
  saveData();
  form.reset();
  renderTable();
});

// Initial call to load and render data
renderTable();