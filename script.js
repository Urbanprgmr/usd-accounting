// Initialize data in localStorage if not already set
if (!localStorage.getItem('currencyAppData')) {
  const initialData = {
    budget: 0,
    currencies: { USD: 0, USDT: 0, EUR: 0 },
    transactions: [],
    totalProfit: 0
  };
  localStorage.setItem('currencyAppData', JSON.stringify(initialData));
}

// Helper function to get data from localStorage
function getData() {
  return JSON.parse(localStorage.getItem('currencyAppData'));
}

// Helper function to save data to localStorage
function saveData(data) {
  localStorage.setItem('currencyAppData', JSON.stringify(data));
}

// Update the UI with current data
function updateUI() {
  const data = getData();
  document.getElementById('budget').textContent = data.budget;
  document.getElementById('usdBalance').textContent = data.currencies.USD;
  document.getElementById('usdtBalance').textContent = data.currencies.USDT;
  document.getElementById('eurBalance').textContent = data.currencies.EUR;

  const transactionTable = document.getElementById('transactionHistory').getElementsByTagName('tbody')[0];
  transactionTable.innerHTML = ''; // Clear existing rows

  data.transactions.forEach((tx) => {
    const row = transactionTable.insertRow();
    row.insertCell().textContent = tx.type;
    row.insertCell().textContent = tx.currency;
    row.insertCell().textContent = tx.amount;
    row.insertCell().textContent = new Date(tx.timestamp).toLocaleString();
    row.insertCell().innerHTML = `<button onclick="editTransaction(${tx.id})">Edit</button> <button onclick="deleteTransaction(${tx.id})">Delete</button>`;
  });
}

// Set Budget
function setBudget() {
  const newBudget = parseFloat(document.getElementById('setBudget').value);
  if (isNaN(newBudget)) return alert('Please enter a valid number');

  const data = getData();
  data.budget = newBudget;
  saveData(data);
  updateUI();
}

// Buy Currency
function buyCurrency() {
  const currency = document.getElementById('currencyType').value;
  const amount = parseFloat(document.getElementById('amount').value);
  if (isNaN(amount)) return alert('Please enter a valid amount');

  const data = getData();
  const exchangeRate = getExchangeRate(currency); // Implement this function
  const cost = amount * exchangeRate;

  if (data.budget < cost) return alert('Insufficient budget');

  data.budget -= cost;
  data.currencies[currency] += amount;
  data.transactions.push({
    id: Date.now(),
    type: 'buy',
    currency,
    amount,
    timestamp: new Date().toISOString()
  });
  saveData(data);
  updateUI();
}

// Sell Currency
function sellCurrency() {
  const currency = document.getElementById('currencyType').value;
  const amount = parseFloat(document.getElementById('amount').value);
  if (isNaN(amount)) return alert('Please enter a valid amount');

  const data = getData();
  if (data.currencies[currency] < amount) return alert('Insufficient currency balance');

  const exchangeRate = getExchangeRate(currency); // Implement this function
  const earnings = amount * exchangeRate;

  data.budget += earnings;
  data.currencies[currency] -= amount;
  data.totalProfit += (earnings - (amount * getExchangeRate(currency))); // Calculate profit
  data.transactions.push({
    id: Date.now(),
    type: 'sell',
    currency,
    amount,
    timestamp: new Date().toISOString()
  });
  saveData(data);
  updateUI();
}

// Withdraw Profit
function withdrawProfit() {
  const amount = parseFloat(document.getElementById('withdrawAmount').value);
  if (isNaN(amount)) return alert('Please enter a valid amount');

  const data = getData();
  if (amount > data.totalProfit) return alert('Cannot withdraw more than total profit');

  data.budget -= amount;
  data.totalProfit -= amount;
  saveData(data);
  updateUI();
}

// Edit Transaction (placeholder)
function editTransaction(id) {
  alert('Edit functionality not implemented yet');
}

// Delete Transaction
function deleteTransaction(id) {
  const data = getData();
  data.transactions = data.transactions.filter((tx) => tx.id !== id);
  saveData(data);
  updateUI();
}

// Initialize UI on page load
updateUI();
