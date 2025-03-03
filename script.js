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
let balanceCapital = parseFloat(localStorage.getItem('balanceCapital')) || initialCapital;
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
  const tbody = document.getElementById('transactionHistory');
  tbody.innerHTML = transactions.length > 0
    ? transactions.map((transaction, index) => `
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
    `).join('')
    : "<tr><td colspan='8' class='text-center'>No transactions yet</td></tr>";
}

// **Take Profit**
document.getElementById('takeProfitForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('takeProfitAmount').value);

  if (amount > totalSellRevenue - totalBuyCost - totalTakenProfit) {
    alert("You cannot take more profit than available.");
    return;
  }

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

// **Export to CSV**
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
