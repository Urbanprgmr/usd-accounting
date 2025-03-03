// Initialize Data
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
let totalProfit = parseFloat(localStorage.getItem('totalProfit')) || 0; // Track total profit
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
  localStorage.setItem('totalProfit', totalProfit);
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
  document.getElementById('totalProfit').textContent = totalProfit.toFixed(2);

  const tbody = document.querySelector('#transactionHistory tbody');
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
        <button class="action-button delete-button" onclick="deleteTransaction(${index})">Delete</button>
      </td>
    </tr>
  `).join('');
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

// **Delete Transaction**
function deleteTransaction(index) {
  const transaction = transactions[index];

  if (transaction.type === 'Buy') {
    balanceCapital += transaction.amount * transaction.rate;
    totalPurchased[transaction.currency] -= transaction.amount;
    totalBuyCost -= transaction.amount * transaction.rate;
  } else if (transaction.type === 'Sell') {
    balanceCapital -= transaction.amount * transaction.rate;
    totalSold[transaction.currency] -= transaction.amount;
    totalSellRevenue -= transaction.amount * transaction.rate;
    totalProfit -= transaction.profit;
  } else if (transaction.type === 'Take Profit') {
    balanceCapital += transaction.amount;
    totalProfit += transaction.amount;
  }

  transactions.splice(index, 1);
  saveToLocalStorage();
  updateUI();
}
