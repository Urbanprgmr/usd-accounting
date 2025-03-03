// Initialize Data
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let totalPurchased = JSON.parse(localStorage.getItem('totalPurchased')) || { USD: 0, EUR: 0, USDT: 0 };
let totalSold = JSON.parse(localStorage.getItem('totalSold')) || { USD: 0, EUR: 0, USDT: 0 };
let totalBuyCost = parseFloat(localStorage.getItem('totalBuyCost')) || 0;
let totalSellRevenue = parseFloat(localStorage.getItem('totalSellRevenue')) || 0;
let totalProfit = parseFloat(localStorage.getItem('totalProfit')) || 0;
let initialCapital = parseFloat(localStorage.getItem('initialCapital')) || 0;
let balanceCapital = parseFloat(localStorage.getItem('balanceCapital')) || initialCapital; // Set balance equal to initial on first load
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
  localStorage.setItem('totalBuyCost', totalBuyCost.toFixed(2));
  localStorage.setItem('totalSellRevenue', totalSellRevenue.toFixed(2));
  localStorage.setItem('totalProfit', totalProfit.toFixed(2));
  localStorage.setItem('initialCapital', initialCapital.toFixed(2));
  localStorage.setItem('balanceCapital', balanceCapital.toFixed(2));
  localStorage.setItem('totalTakenProfit', totalTakenProfit.toFixed(2));
  localStorage.setItem('balancePayments', balancePayments.toFixed(2));
}

// Update UI
function updateUI() {
  document.getElementById('initialCapital').textContent = initialCapital.toFixed(2);
  document.getElementById('balanceCapital').textContent = balanceCapital.toFixed(2);
  document.getElementById('totalProfit').textContent = totalProfit.toFixed(2);
  document.getElementById('balancePayments').textContent = balancePayments.toFixed(2);

  // Display total purchased & sold balances
  document.getElementById('totalPurchasedUSD').textContent = totalPurchased.USD.toFixed(2);
  document.getElementById('totalPurchasedEUR').textContent = totalPurchased.EUR.toFixed(2);
  document.getElementById('totalPurchasedUSDT').textContent = totalPurchased.USDT.toFixed(2);
  
  document.getElementById('totalSoldUSD').textContent = totalSold.USD.toFixed(2);
  document.getElementById('totalSoldEUR').textContent = totalSold.EUR.toFixed(2);
  document.getElementById('totalSoldUSDT').textContent = totalSold.USDT.toFixed(2);

  // Update transaction history
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

// **Edit Initial Capital**
function editInitialCapital() {
  let newCapital = parseFloat(prompt("Enter initial capital amount:", initialCapital));
  if (!isNaN(newCapital) && newCapital >= 0) {
    initialCapital = newCapital;
    balanceCapital = newCapital; // Reset balance to match initial capital
    saveToLocalStorage();
    updateUI();
  }
}

// **Buy Currency**
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

// **Sell Currency**
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

// **Take Profit**
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
