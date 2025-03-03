// Initialize Data from LocalStorage
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let totalPurchased = {
  USD: parseFloat(localStorage.getItem('totalPurchasedUSD')) || 0,
  EUR: parseFloat(localStorage.getItem('totalPurchasedEUR')) || 0,
  USDT: parseFloat(localStorage.getItem('totalPurchasedUSDT')) || 0,
};
let totalSold = {
  USD: parseFloat(localStorage.getItem('totalSoldUSD')) || 0,
  EUR: parseFloat(localStorage.getItem('totalSoldEUR')) || 0,
  USDT: parseFloat(localStorage.getItem('totalSoldUSDT')) || 0,
};
let totalBuyCost = parseFloat(localStorage.getItem('totalBuyCost')) || 0;
let totalSellRevenue = parseFloat(localStorage.getItem('totalSellRevenue')) || 0;
let totalPaymentIn = parseFloat(localStorage.getItem('totalPaymentIn')) || 0;
let totalPaymentOut = parseFloat(localStorage.getItem('totalPaymentOut')) || 0;
let initialCapital = parseFloat(localStorage.getItem('initialCapital')) || 0;
let amountDeducted = parseFloat(localStorage.getItem('amountDeducted')) || 0;
let balanceCapital = parseFloat(localStorage.getItem('balanceCapital')) || 0;
let totalTakenProfit = parseFloat(localStorage.getItem('totalTakenProfit')) || 0;

// Load saved data on page load
document.addEventListener('DOMContentLoaded', () => {
  updateUI();
});

// Save Data to LocalStorage
function saveToLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
  localStorage.setItem('totalPurchasedUSD', totalPurchased.USD);
  localStorage.setItem('totalPurchasedEUR', totalPurchased.EUR);
  localStorage.setItem('totalPurchasedUSDT', totalPurchased.USDT);
  localStorage.setItem('totalSoldUSD', totalSold.USD);
  localStorage.setItem('totalSoldEUR', totalSold.EUR);
  localStorage.setItem('totalSoldUSDT', totalSold.USDT);
  localStorage.setItem('totalBuyCost', totalBuyCost);
  localStorage.setItem('totalSellRevenue', totalSellRevenue);
  localStorage.setItem('totalPaymentIn', totalPaymentIn);
  localStorage.setItem('totalPaymentOut', totalPaymentOut);
  localStorage.setItem('initialCapital', initialCapital);
  localStorage.setItem('amountDeducted', amountDeducted);
  localStorage.setItem('balanceCapital', balanceCapital);
  localStorage.setItem('totalTakenProfit', totalTakenProfit);
}

// Update UI
function updateUI() {
  document.getElementById('balanceCapital').textContent = balanceCapital.toFixed(2);
  document.getElementById('totalProfit').textContent = (totalSellRevenue - totalBuyCost).toFixed(2);
  document.getElementById('totalTakenProfit').textContent = totalTakenProfit.toFixed(2);
  document.getElementById('remainingProfit').textContent = (totalSellRevenue - totalBuyCost - totalTakenProfit).toFixed(2);
  document.getElementById('totalPaymentIn').textContent = totalPaymentIn.toFixed(2);
  document.getElementById('totalPaymentOut').textContent = totalPaymentOut.toFixed(2);
  document.getElementById('netPayment').textContent = (totalPaymentIn - totalPaymentOut).toFixed(2);
  document.getElementById('initialCapital').textContent = initialCapital.toFixed(2);
  document.getElementById('amountDeducted').textContent = amountDeducted.toFixed(2);

  // Update Transaction History Table
  const tbody = document.querySelector('#transactionHistory tbody');
  tbody.innerHTML = transactions.length > 0 ? transactions.map((transaction, index) => `
    <tr>
      <td>${transaction.type}</td>
      <td>${transaction.currency}</td>
      <td>${transaction.amount.toFixed(2)}</td>
      <td>${transaction.rate.toFixed(2)}</td>
      <td>${transaction.remarks}</td>
      <td>${transaction.timestamp}</td>
      <td>${transaction.profit ? transaction.profit.toFixed(2) : '-'}</td>
      <td>
        <button class="btn btn-warning btn-sm" onclick="editTransaction(${index})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteTransaction(${index})">Delete</button>
      </td>
    </tr>
  `).join('') : "<tr><td colspan='8' class='text-center'>No transactions yet</td></tr>";
}

// **Buy Currency**
document.getElementById('buyForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const currency = document.getElementById('buyCurrency').value;
  const amount = parseFloat(document.getElementById('buyAmount').value);
  const rate = parseFloat(document.getElementById('buyRate').value);
  const remarks = document.getElementById('buyRemarks').value;
  const timestamp = new Date().toLocaleString();

  balanceCapital -= amount * rate;
  totalPurchased[currency] += amount;
  totalBuyCost += amount * rate;

  transactions.push({ type: 'Buy', currency, amount, rate, remarks, timestamp });

  saveToLocalStorage();
  updateUI();
});

// **Sell Currency**
document.getElementById('sellForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const currency = document.getElementById('sellCurrency').value;
  const amount = parseFloat(document.getElementById('sellAmount').value);
  const rate = parseFloat(document.getElementById('sellRate').value);
  const remarks = document.getElementById('sellRemarks').value;
  const timestamp = new Date().toLocaleString();

  const avgPurchaseCost = totalBuyCost / (totalPurchased.USD + totalPurchased.EUR + totalPurchased.USDT) || 0;
  const costOfSoldAmount = amount * avgPurchaseCost;
  const profit = (amount * rate) - costOfSoldAmount;

  balanceCapital += amount * rate;
  totalSold[currency] += amount;
  totalSellRevenue += amount * rate;

  transactions.push({ type: 'Sell', currency, amount, rate, remarks, timestamp, profit });

  saveToLocalStorage();
  updateUI();
});

// **Payment Handling**
document.getElementById('paymentForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const type = document.getElementById('paymentType').value;
  const amount = parseFloat(document.getElementById('paymentAmount').value);
  const timestamp = new Date().toLocaleString();

  if (type === 'In') {
    totalPaymentIn += amount;
  } else {
    totalPaymentOut += amount;
  }

  transactions.push({ type: `Payment ${type}`, currency: 'MVR', amount, rate: 1, timestamp });

  saveToLocalStorage();
  updateUI();
});

// **Take Profit**
document.getElementById('takeProfitForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('takeProfitAmount').value);
  totalTakenProfit += amount;
  balanceCapital -= amount;

  transactions.push({ type: 'Take Profit', currency: 'MVR', amount, rate: 1, timestamp: new Date().toLocaleString() });

  saveToLocalStorage();
  updateUI();
});

// **Delete Transaction**
function deleteTransaction(index) {
  transactions.splice(index, 1);
  saveToLocalStorage();
  updateUI();
}
