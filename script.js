// Initialize Data
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let totalPurchased = JSON.parse(localStorage.getItem('totalPurchased')) || { USD: 0, EUR: 0, USDT: 0 };
let totalSold = JSON.parse(localStorage.getItem('totalSold')) || { USD: 0, EUR: 0, USDT: 0 };
let totalBuyCost = parseFloat(localStorage.getItem('totalBuyCost')) || 0;
let totalSellRevenue = parseFloat(localStorage.getItem('totalSellRevenue')) || 0;
let totalProfit = parseFloat(localStorage.getItem('totalProfit')) || 0;
let balanceCapital = parseFloat(localStorage.getItem('balanceCapital')) || 0;
let totalTakenProfit = parseFloat(localStorage.getItem('totalTakenProfit')) || 0;
let balancePayments = parseFloat(localStorage.getItem('balancePayments')) || 0;

// Load saved data on page load
document.addEventListener('DOMContentLoaded', () => {
  updateUI();
});

// Save Data to LocalStorage
function saveToLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
  localStorage.setItem('totalPurchased', JSON.stringify(totalPurchased));
  localStorage.setItem('totalSold', JSON.stringify(totalSold));
  localStorage.setItem('totalBuyCost', totalBuyCost);
  localStorage.setItem('totalSellRevenue', totalSellRevenue);
  localStorage.setItem('totalProfit', totalProfit);
  localStorage.setItem('balanceCapital', balanceCapital);
  localStorage.setItem('totalTakenProfit', totalTakenProfit);
  localStorage.setItem('balancePayments', balancePayments);
}

// Update UI
function updateUI() {
  document.getElementById('balanceCapital').textContent = balanceCapital.toFixed(2);
  document.getElementById('totalProfit').textContent = totalProfit.toFixed(2);
  document.getElementById('balancePayments').textContent = balancePayments.toFixed(2);

  const tbody = document.getElementById('transactionHistory');
  tbody.innerHTML = transactions.map((transaction, index) => `
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
  `).join('');
}

// **Edit Capital**
function editCapital() {
  let newCapital = parseFloat(prompt("Enter new capital amount:", balanceCapital));
  if (!isNaN(newCapital)) {
    balanceCapital = newCapital;
    saveToLocalStorage();
    updateUI();
  }
}

// **Buy Currency - Deducts from Capital**
document.getElementById('buyForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const currency = document.getElementById('buyCurrency').value;
  const amount = parseFloat(document.getElementById('buyAmount').value);
  const rate = parseFloat(document.getElementById('buyRate').value);
  const remarks = document.getElementById('buyRemarks').value;
  const timestamp = new Date().toLocaleString();

  const totalCost = amount * rate;
  if (totalCost > balanceCapital) {
    alert("Insufficient balance to complete this purchase.");
    return;
  }

  balanceCapital -= totalCost;
  totalPurchased[currency] += amount;
  totalBuyCost += totalCost;

  transactions.push({ type: 'Buy', currency, amount, rate, remarks, timestamp });

  saveToLocalStorage();
  updateUI();
});

// **Sell Currency - Adds to Capital & Tracks Profit**
document.getElementById('sellForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const currency = document.getElementById('sellCurrency').value;
  const amount = parseFloat(document.getElementById('sellAmount').value);
  const rate = parseFloat(document.getElementById('sellRate').value);
  const remarks = document.getElementById('sellRemarks').value;
  const timestamp = new Date().toLocaleString();

  if (totalPurchased[currency] < amount) {
    alert("Insufficient purchased amount for sale.");
    return;
  }

  const avgPurchaseCost = totalBuyCost / (totalPurchased.USD + totalPurchased.EUR + totalPurchased.USDT);
  const costOfSoldAmount = amount * avgPurchaseCost;

  const revenue = amount * rate;
  const profit = revenue - costOfSoldAmount;
  totalProfit += profit;

  balanceCapital += revenue;
  totalSold[currency] += amount;
  totalSellRevenue += revenue;

  totalPurchased[currency] -= amount;
  totalBuyCost -= costOfSoldAmount;

  transactions.push({ type: 'Sell', currency, amount, rate, remarks, timestamp, profit });

  saveToLocalStorage();
  updateUI();
});

// **Take Profit - Limited to Available Profit**
document.getElementById('takeProfitForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('takeProfitAmount').value);

  if (amount > totalProfit) {
    alert("You cannot take more profit than available.");
    return;
  }

  totalTakenProfit += amount;
  balanceCapital -= amount;
  totalProfit -= amount;

  const timestamp = new Date().toLocaleString();
  transactions.push({ type: 'Take Profit', currency: 'MVR', amount, rate: 1, remarks: 'Profit Taken', timestamp });

  saveToLocalStorage();
  updateUI();
});

// **Manage Payments (Separate)**
document.getElementById('paymentForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const type = document.getElementById('paymentType').value;
  const amount = parseFloat(document.getElementById('paymentAmount').value);

  if (type === "in") {
    balancePayments += amount; // Payment received
  } else {
    if (amount > balancePayments) {
      alert("Insufficient balance to make this payment.");
      return;
    }
    balancePayments -= amount; // Payment made
  }

  saveToLocalStorage();
  updateUI();
});

// **Edit & Delete Transactions**
function editTransaction(index) {
  let transaction = transactions[index];

  let newAmount = parseFloat(prompt(`Edit amount for ${transaction.type} (${transaction.currency}):`, transaction.amount));
  let newRate = parseFloat(prompt(`Edit rate for ${transaction.type} (${transaction.currency}):`, transaction.rate));
  let newRemarks = prompt(`Edit remarks:`, transaction.remarks);

  if (isNaN(newAmount) || isNaN(newRate)) {
    alert("Invalid input. Transaction not updated.");
    return;
  }

  transaction.amount = newAmount;
  transaction.rate = newRate;
  transaction.remarks = newRemarks;

  saveToLocalStorage();
  updateUI();
}

function deleteTransaction(index) {
  transactions.splice(index, 1);
  saveToLocalStorage();
  updateUI();
}
