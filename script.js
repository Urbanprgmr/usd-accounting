let transactions = [];
let totalPurchased = 0;
let totalSold = 0;
let totalBuyCost = 0;
let totalSellRevenue = 0;

document.getElementById('buyForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('buyAmount').value);
  const rate = parseFloat(document.getElementById('buyRate').value);
  const remarks = document.getElementById('buyRemarks').value;

  transactions.push({ type: 'Buy', amount, rate, remarks });
  totalPurchased += amount;
  totalBuyCost += amount * rate;

  updateUI();
});

document.getElementById('sellForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('sellAmount').value);
  const rate = parseFloat(document.getElementById('sellRate').value);
  const remarks = document.getElementById('sellRemarks').value;

  transactions.push({ type: 'Sell', amount, rate, remarks });
  totalSold += amount;
  totalSellRevenue += amount * rate;

  updateUI();
});

function updateUI() {
  // Update Buy Summary
  document.getElementById('totalPurchased').textContent = totalPurchased.toFixed(2);
  const avgPurchaseCost = totalBuyCost / totalPurchased || 0;
  document.getElementById('avgPurchaseCost').textContent = avgPurchaseCost.toFixed(2);

  // Update Sell Summary
  document.getElementById('totalSold').textContent = totalSold.toFixed(2);
  const avgSellPrice = totalSellRevenue / totalSold || 0;
  document.getElementById('avgSellPrice').textContent = avgSellPrice.toFixed(2);
  const currentProfit = totalSellRevenue - (totalSold * avgPurchaseCost);
  document.getElementById('currentProfit').textContent = currentProfit.toFixed(2);

  // Update Transaction History
  const tbody = document.querySelector('#transactionHistory tbody');
  tbody.innerHTML = transactions.map(transaction => `
    <tr>
      <td>${transaction.type}</td>
      <td>${transaction.amount.toFixed(2)}</td>
      <td>${transaction.rate.toFixed(2)}</td>
      <td>${transaction.remarks}</td>
    </tr>
  `).join('');
}
