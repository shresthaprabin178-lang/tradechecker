const form = document.getElementById('tradeForm');
const tableBody = document.querySelector('#tradeTable tbody');
const positiveCountEl = document.getElementById('positiveCount');
const negativeCountEl = document.getElementById('negativeCount');
const positivePercentEl = document.getElementById('positivePercent');
const negativePercentEl = document.getElementById('negativePercent');

let trades = JSON.parse(localStorage.getItem('trades')) || [];

function saveTrades() {
  localStorage.setItem('trades', JSON.stringify(trades));
}

function calculateTrade(trade) {
  trade.buyAmount = trade.buyPrice * trade.quantity;
  trade.sellAmount = trade.sellPrice ? trade.sellPrice * trade.quantity : 0;
  trade.profitLoss = trade.sellAmount - trade.buyAmount;
  trade.profitLossPercent = trade.buyAmount ? (trade.profitLoss / trade.buyAmount) * 100 : 0;
}

function updateSummary() {
  let positives = trades.filter(t => t.sellPrice >= (t.targetPrice || 0) && t.targetPrice > 0).length;
  let negatives = trades.filter(t => t.sellPrice <= (t.stopLoss || 0) && t.stopLoss > 0).length;
  let total = trades.filter(t => t.sellPrice > 0).length || 1;

  positiveCountEl.textContent = positives;
  negativeCountEl.textContent = negatives;
  positivePercentEl.textContent = ((positives / total) * 100).toFixed(1);
  negativePercentEl.textContent = ((negatives / total) * 100).toFixed(1);
}

function renderTable() {
  tableBody.innerHTML = '';
  trades.forEach((trade, index) => {
    calculateTrade(trade);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td contenteditable="true" data-field="stock">${trade.stock}</td>
      <td contenteditable="true" data-field="buyDate">${trade.buyDate}</td>
      <td contenteditable="true" data-field="buyPrice">${trade.buyPrice}</td>
      <td contenteditable="true" data-field="quantity">${trade.quantity}</td>
      <td contenteditable="true" data-field="sellPrice">${trade.sellPrice.toFixed(2)}</td>
      <td contenteditable="true" data-field="sellDate">${trade.sellDate}</td>
      <td contenteditable="true" data-field="targetPrice">${trade.targetPrice || ''}</td>
      <td contenteditable="true" data-field="stopLoss">${trade.stopLoss || ''}</td>
      <td>${trade.buyAmount.toFixed(2)}</td>
      <td>${trade.sellAmount.toFixed(2)}</td>
      <td class="${trade.profitLoss > 0 ? 'profit' : trade.profitLoss < 0 ? 'loss' : ''}">
        ${trade.profitLoss.toFixed(2)}
      </td>
      <td>${trade.profitLossPercent.toFixed(2)}%</td>
      <td contenteditable="true" data-field="remarks">${trade.remarks}</td>
      <td><button class="deleteBtn">❌</button></td>
    `;
    tableBody.appendChild(row);
  });

  updateSummary();
  saveTrades();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const newTrade = {
    stock: document.getElementById('stock').value,
    buyDate: document.getElementById('buyDate').value,
    buyPrice: parseFloat(document.getElementById('buyPrice').value),
    quantity: parseInt(document.getElementById('quantity').value),
    sellPrice: parseFloat(document.getElementById('sellPrice').value) || 0,
    sellDate: document.getElementById('sellDate').value,
    targetPrice: 0,
    stopLoss: 0,
    remarks: document.getElementById('remarks').value
  };

  trades.push(newTrade);
  form.reset();
  renderTable();
});

// Only update trade when user presses Enter, Tab, or leaves cell
tableBody.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === 'Tab') {
    e.preventDefault();
    e.target.blur(); // Trigger blur manually
  }
});

tableBody.addEventListener('blur', (e) => {
  if (!e.target.dataset.field) return;
  const row = e.target.closest('tr');
  const index = row.rowIndex - 1;
  const field = e.target.dataset.field;
  let value = e.target.textContent.trim();

  // Parse numeric fields safely
  if (['buyPrice', 'sellPrice', 'quantity', 'targetPrice', 'stopLoss'].includes(field)) {
    value = parseFloat(value) || 0;
  }

  trades[index][field] = value;

  calculateTrade(trades[index]);
  renderTable();
}, true);

tableBody.addEventListener('click', (e) => {
  if (e.target.classList.contains('deleteBtn')) {
    const index = e.target.closest('tr').rowIndex - 1;
    trades.splice(index, 1);
    renderTable();
  }
});

renderTable();
