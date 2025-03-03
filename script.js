// Initialize data
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
  // Update Balance Capital
  document.getElementById('balanceCapital').textContent = balanceCapital.toFixed(2);

  // Update Transaction History
  const tbody = document.querySelector('#transactionHistory tbody');
  tbody.innerHTML = transactions.map((transaction, index) => `
    <tr>
      <td>${transaction.type}</td>
      <td>${transaction.currency}</td>
      <td>${transaction.amount.toFixed(2)}</td>
      <td>${transaction.rate.toFixed(2)}</td>
      <td>${transaction.remarks}</td>
      <td>${transaction.timestamp}</td>
      <td>
        <button class="action-button edit-button" onclick="editTransaction(${index})">Edit</button>
        <button class="action-button delete-button" onclick="deleteTransaction(${index})">Delete</button>
      </td>
    </tr>
  `).join('');
}

// Edit Transaction
function editTransaction(index) {
  const transaction = transactions[index];
  const newAmount = parseFloat(prompt(`Enter new amount for ${transaction.type} (${transaction.currency}):`, transaction.amount));
  const newRate = parseFloat(prompt(`Enter new rate for ${transaction.type} (${transaction.currency}):`, transaction.rate));
  const newRemarks = prompt(`Enter new remarks for ${transaction.type}:`, transaction.remarks);

  if (newAmount === null || newRate === null || isNaN(newAmount) || isNaN(newRate)) {
    alert('Invalid input. Transaction not updated.');
    return;
  }

  // Revert the old transaction's impact on totals
  if (transaction.type === 'Buy') {
    totalPurchased[transaction.currency] -= transaction.amount;
    totalBuyCost -= transaction.amount * transaction.rate;
    balanceCapital += transaction.amount * transaction.rate; // Add back to capital
  } else if (transaction.type === 'Sell') {
    totalSold[transaction.currency] -= transaction.amount;
    totalSellRevenue -= transaction.amount * transaction.rate;
    balanceCapital -= transaction.amount * transaction.rate; // Deduct from capital
  } else if (transaction.type === 'Take Profit') {
    totalTakenProfit -= transaction.amount;
    balanceCapital += transaction.amount; // Add back to capital
  }

  // Update the transaction with new values
  transaction.amount = newAmount;
  transaction.rate = newRate;
  transaction.remarks = newRemarks;

  // Apply the new transaction's impact on totals
  if (transaction.type === 'Buy') {
    totalPurchased[transaction.currency] += newAmount;
    totalBuyCost += newAmount * newRate;
    balanceCapital -= newAmount * newRate; // Deduct from capital
  } else if (transaction.type === 'Sell') {
    totalSold[transaction.currency] += newAmount;
    totalSellRevenue += newAmount * newRate;
    balanceCapital += newAmount * newRate; // Add to capital
  } else if (transaction.type === 'Take Profit') {
    totalTakenProfit += newAmount;
    balanceCapital -= newAmount; // Deduct from capital
  }

  // Save and update UI
  saveToLocalStorage();
  updateUI();
}

// Delete Transaction
function deleteTransaction(index) {
  const transaction = transactions[index];
  if (confirm('Are you sure you want to delete this transaction?')) {
    // Revert the transaction's impact on totals
    if (transaction.type === 'Buy') {
      totalPurchased[transaction.currency] -= transaction.amount;
      totalBuyCost -= transaction.amount * transaction.rate;
      balanceCapital += transaction.amount * transaction.rate; // Add back to capital
    } else if (transaction.type === 'Sell') {
      totalSold[transaction.currency] -= transaction.amount;
      totalSellRevenue -= transaction.amount * transaction.rate;
      balanceCapital -= transaction.amount * transaction.rate; // Deduct from capital
    } else if (transaction.type === 'Take Profit') {
      totalTakenProfit -= transaction.amount;
      balanceCapital += transaction.amount; // Add back to capital
    }

    // Remove the transaction from the list
    transactions.splice(index, 1);

    // Save and update UI
    saveToLocalStorage();
    updateUI();
  }
}

// Buy Form Submission
document.getElementById('buyForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const currency = document.getElementById('buyCurrency').value;
  const amount = parseFloat(document.getElementById('buyAmount').value);
  const rate = parseFloat(document.getElementById('buyRate').value);
  const remarks = document.getElementById('buyRemarks').value;
  const timestamp = new Date().toLocaleString();

  // Deduct amount from balanceCapital
  balanceCapital -= amount * rate;

  transactions.push({ type: 'Buy', currency, amount, rate, remarks, timestamp });
  totalPurchased[currency] += amount;
  totalBuyCost += amount * rate;

  saveToLocalStorage();
  updateUI();
});

// Sell Form Submission
document.getElementById('sellForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const currency = document.getElementById('sellCurrency').value;
  const amount = parseFloat(document.getElementById('sellAmount').value);
  const rate = parseFloat(document.getElementById('sellRate').value);
  const remarks = document.getElementById('sellRemarks').value;
  const timestamp = new Date().toLocaleString();

  // Calculate the cost of the sold amount based on the average purchase cost
  const avgPurchaseCost = totalBuyCost / (totalPurchased.USD + totalPurchased.EUR + totalPurchased.USDT) || 0;
  const costOfSoldAmount = amount * avgPurchaseCost;

  // Calculate the profit from this sell transaction
  const profit = (amount * rate) - costOfSoldAmount;

  // Add amount to balanceCapital
  balanceCapital += amount * rate;

  // Add the sell transaction to history
  transactions.push({ type: 'Sell', currency, amount, rate, remarks, timestamp, profit });

  // Update totals
  totalSold[currency] += amount;
  totalSellRevenue += amount * rate;

  saveToLocalStorage();
  updateUI();
});

// Take Profit Form Submission
document.getElementById('takeProfitForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('takeProfitAmount').value);

  // Deduct the take profit amount from the gross profit
  totalTakenProfit += amount;

  // Add the take profit transaction to history
  const timestamp = new Date().toLocaleString();
  transactions.push({ type: 'Take Profit', currency: 'MVR', amount, rate: 1, remarks: 'Profit Taken', timestamp });

  saveToLocalStorage();
  updateUI();
});
