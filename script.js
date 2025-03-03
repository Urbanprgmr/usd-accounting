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

// Payment Form Submission
document.getElementById('paymentForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const type = document.getElementById('paymentType').value;
  const amount = parseFloat(document.getElementById('paymentAmount').value);
  const remarks = document.getElementById('paymentRemarks').value;
  const timestamp = new Date().toLocaleString();

  if (type === 'In') {
    if (amountDeducted > 0) {
      const deductionAmount = Math.min(amountDeducted, amount);
      amountDeducted -= deductionAmount;
      balanceCapital += deductionAmount;
      totalPaymentIn += (amount - deductionAmount);
    } else {
      totalPaymentIn += amount;
    }
  } else {
    totalPaymentOut += amount;

    const netPayment = totalPaymentIn - totalPaymentOut;
    if (netPayment < 0) {
      const deductionAmount = Math.abs(netPayment);
      amountDeducted += deductionAmount;
      balanceCapital -= deductionAmount;
      totalPaymentOut = totalPaymentIn; // Reset payment out to match payment in
    }
  }

  transactions.push({ type: `Payment ${type}`, currency: 'MVR', amount, rate: 1, remarks, timestamp });

  saveToLocalStorage();
  updateUI();
});

// Capital Form Submission
document.getElementById('capitalForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const action = document.getElementById('capitalAction').value;
  const amount = parseFloat(document.getElementById('capitalAmount').value);
  const remarks = document.getElementById('capitalRemarks').value;
  const timestamp = new Date().toLocaleString();

  if (action === 'Set') {
    initialCapital = amount;
    balanceCapital = amount;
    amountDeducted = 0;
  } else if (action === 'Add') {
    balanceCapital += amount;
  } else if (action === 'Deduct') {
    balanceCapital -= amount;
  }

  transactions.push({ type: `Capital ${action}`, currency: 'MVR', amount, rate: 1, remarks, timestamp });

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

// Clear Payment Summary
function clearPaymentSummary() {
  totalPaymentIn = 0;
  totalPaymentOut = 0;
  saveToLocalStorage();
  updateUI();
}

// Add event listener for the Clear Payment button
document.getElementById('clearPayment').addEventListener('click', function (e) {
  e.preventDefault();
  if (confirm('Are you sure you want to clear the payment summary?')) {
    clearPaymentSummary();
  }
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
  // Update Buy Summary
  document.getElementById('totalPurchasedUSD').textContent = totalPurchased.USD.toFixed(2);
  document.getElementById('totalPurchasedEUR').textContent = totalPurchased.EUR.toFixed(2);
  document.getElementById('totalPurchasedUSDT').textContent = totalPurchased.USDT.toFixed(2);
  const avgPurchaseCost = totalBuyCost / (totalPurchased.USD + totalPurchased.EUR + totalPurchased.USDT) || 0;
  document.getElementById('avgPurchaseCost').textContent = avgPurchaseCost.toFixed(2);

  // Update Sell Summary
  document.getElementById('totalSoldUSD').textContent = totalSold.USD.toFixed(2);
  document.getElementById('totalSoldEUR').textContent = totalSold.EUR.toFixed(2);
  document.getElementById('totalSoldUSDT').textContent = totalSold.USDT.toFixed(2);
  const avgSellPrice = totalSellRevenue / (totalSold.USD + totalSold.EUR + totalSold.USDT) || 0;
  document.getElementById('avgSellPrice').textContent = avgSellPrice.toFixed(2);

  // Update Payment Summary
  document.getElementById('totalPaymentIn').textContent = totalPaymentIn.toFixed(2);
  document.getElementById('totalPaymentOut').textContent = totalPaymentOut.toFixed(2);
  const netPayment = totalPaymentIn - totalPaymentOut;
  document.getElementById('netPayment').textContent = netPayment.toFixed(2);

  // Update Capital Summary
  document.getElementById('initialCapital').textContent = initialCapital.toFixed(2);
  document.getElementById('amountDeducted').textContent = amountDeducted.toFixed(2);
  document.getElementById('balanceCapital').textContent = balanceCapital.toFixed(2);

  // Update Currency Balances
  const balanceUSD = totalPurchased.USD - totalSold.USD;
  const balanceEUR = totalPurchased.EUR - totalSold.EUR;
  const balanceUSDT = totalPurchased.USDT - totalSold.USDT;
  document.getElementById('balanceUSD').textContent = balanceUSD.toFixed(2);
  document.getElementById('balanceEUR').textContent = balanceEUR.toFixed(2);
  document.getElementById('balanceUSDT').textContent = balanceUSDT.toFixed(2);

  // Update Profit Calculations
  const grossProfit = transactions
    .filter(transaction => transaction.type === 'Sell')
    .reduce((total, transaction) => total + (transaction.profit || 0), 0);
  const netProfit = grossProfit - totalTakenProfit;
  document.getElementById('grossProfit').textContent = grossProfit.toFixed(2);
  document.getElementById('netProfit').textContent = netProfit.toFixed(2);
  document.getElementById('totalTakenProfit').textContent = totalTakenProfit.toFixed(2);

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

// Delete Transaction
function deleteTransaction(index) {
  const transaction = transactions[index];
  if (confirm('Are you sure you want to delete this transaction?')) {
    // Update totals based on the transaction type
    if (transaction.type.startsWith('Payment')) {
      if (transaction.type === 'Payment In') {
        totalPaymentIn -= transaction.amount;
      } else if (transaction.type === 'Payment Out') {
        totalPaymentOut -= transaction.amount;
      }

      // Recalculate net payment and adjust capital if necessary
      const netPayment = totalPaymentIn - totalPaymentOut;
      if (netPayment < 0) {
        const deductionAmount = Math.abs(netPayment);
        amountDeducted += deductionAmount;
        balanceCapital -= deductionAmount;
      } else {
        // If net payment is positive, reset amountDeducted and adjust balanceCapital
        amountDeducted = 0;
        balanceCapital = initialCapital;
      }
    } else if (transaction.type.startsWith('Capital')) {
      if (transaction.type === 'Capital Set') {
        initialCapital = 0;
        balanceCapital = 0;
        amountDeducted = 0;
      } else if (transaction.type === 'Capital Add') {
        balanceCapital -= transaction.amount;
      } else if (transaction.type === 'Capital Deduct') {
        balanceCapital += transaction.amount;
      }
    } else if (transaction.type === 'Buy') {
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

    // Recalculate all dependent values
    recalculateDependentValues();

    // Save updated data to localStorage and refresh the UI
    saveToLocalStorage();
    updateUI();
  }
}

// Recalculate Dependent Values
function recalculateDependentValues() {
  // Recalculate totalPurchased and totalSold
  totalPurchased = { USD: 0, EUR: 0, USDT: 0 };
  totalSold = { USD: 0, EUR: 0, USDT: 0 };
  totalBuyCost = 0;
  totalSellRevenue = 0;

  transactions.forEach(transaction => {
    if (transaction.type === 'Buy') {
      totalPurchased[transaction.currency] += transaction.amount;
      totalBuyCost += transaction.amount * transaction.rate;
    } else if (transaction.type === 'Sell') {
      totalSold[transaction.currency] += transaction.amount;
      totalSellRevenue += transaction.amount * transaction.rate;
    }
  });

  // Recalculate balanceCapital and amountDeducted
  const netPayment = totalPaymentIn - totalPaymentOut;
  if (netPayment < 0) {
    amountDeducted = Math.abs(netPayment);
    balanceCapital = initialCapital - amountDeducted;
  } else {
    amountDeducted = 0;
    balanceCapital = initialCapital;
  }
}

// Export to CSV
document.getElementById('exportCSV').addEventListener('click', () => {
  const headers = ['Type', 'Currency', 'Amount', 'Rate (MVR)', 'Remarks', 'Timestamp'];
  const rows = transactions.map(transaction => [
    transaction.type,
    transaction.currency,
    transaction.amount.toFixed(2),
    transaction.rate.toFixed(2),
    transaction.remarks,
    transaction.timestamp,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'transactions.csv';
  link.click();
});
