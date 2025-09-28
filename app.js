// Day Closing Balance App - JavaScript

// Application State
let appState = {
    openingBalance: 0,
    transactions: [],
    currentDate: new Date()
};

// Sample data for demonstration
const sampleTransactions = [
    {
        id: 1,
        type: "cash_sale",
        amount: 500,
        description: "Medicine sale",
        timestamp: "2025-09-28T14:30:00"
    },
    {
        id: 2,
        type: "digital_sale", 
        amount: 750,
        description: "UPI payment",
        timestamp: "2025-09-28T15:15:00"
    },
    {
        id: 3,
        type: "expense",
        amount: 200,
        description: "Supplies purchase",
        timestamp: "2025-09-28T16:00:00"
    }
];

// Transaction type configurations
const transactionTypes = {
    cash_sale: { name: "Cash Sales", category: "income", icon: "💵" },
    digital_sale: { name: "Digital Sales", category: "income", icon: "💳" },
    expense: { name: "Cash Expenses", category: "expense", icon: "💸" },
    other_income: { name: "Other Income", category: "income", icon: "💰" }
};

// Utility Functions
function formatCurrency(amount) {
    return `₹${parseFloat(amount).toFixed(2)}`;
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

function formatTime(date) {
    return new Intl.DateTimeFormat('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function showMessage(message, type = 'success') {
    const container = document.getElementById('messageContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    container.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Calculation Functions
function calculateTotals() {
    const totals = {
        cashSales: 0,
        digitalSales: 0,
        otherIncome: 0,
        expenses: 0,
        totalSales: 0,
        totalIncome: 0,
        netCashFlow: 0,
        closingBalance: 0,
        physicalCashBalance: 0
    };

    appState.transactions.forEach(transaction => {
        const amount = parseFloat(transaction.amount);
        
        switch (transaction.type) {
            case 'cash_sale':
                totals.cashSales += amount;
                break;
            case 'digital_sale':
                totals.digitalSales += amount;
                break;
            case 'other_income':
                totals.otherIncome += amount;
                break;
            case 'expense':
                totals.expenses += amount;
                break;
        }
    });

    totals.totalSales = totals.cashSales + totals.digitalSales;
    totals.totalIncome = totals.cashSales + totals.digitalSales + totals.otherIncome;
    totals.netCashFlow = totals.totalIncome - totals.expenses;
    totals.closingBalance = appState.openingBalance + totals.netCashFlow;
    totals.physicalCashBalance = appState.openingBalance + totals.cashSales + totals.otherIncome - totals.expenses;

    return totals;
}

// UI Update Functions
function updateDashboard() {
    const totals = calculateTotals();
    
    // Update summary cards
    document.getElementById('totalSales').textContent = formatCurrency(totals.totalSales);
    document.getElementById('totalExpenses').textContent = formatCurrency(totals.expenses);
    document.getElementById('netCashFlow').textContent = formatCurrency(totals.netCashFlow);
    document.getElementById('closingBalance').textContent = formatCurrency(totals.closingBalance);

    // Update daily summary
    document.getElementById('summaryOpeningBalance').textContent = formatCurrency(appState.openingBalance);
    document.getElementById('summaryCashSales').textContent = formatCurrency(totals.cashSales);
    document.getElementById('summaryDigitalSales').textContent = formatCurrency(totals.digitalSales);
    document.getElementById('summaryOtherIncome').textContent = formatCurrency(totals.otherIncome);
    document.getElementById('summaryTotalIncome').textContent = formatCurrency(totals.totalIncome);
    document.getElementById('summaryCashExpenses').textContent = formatCurrency(totals.expenses);
    document.getElementById('summaryClosingBalance').textContent = formatCurrency(totals.closingBalance);
    document.getElementById('summaryPhysicalCash').textContent = formatCurrency(totals.physicalCashBalance);
}

function updateTransactionsList() {
    const container = document.getElementById('transactionsList');
    
    if (appState.transactions.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No transactions added yet</p></div>';
        return;
    }

    const transactionsHTML = appState.transactions
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .map(transaction => {
            const typeInfo = transactionTypes[transaction.type];
            const isIncome = typeInfo.category === 'income';
            const amountClass = isIncome ? 'positive' : 'negative';
            const amountPrefix = isIncome ? '+' : '-';
            
            return `
                <div class="transaction-item">
                    <div class="transaction-info">
                        <div class="transaction-type ${typeInfo.category}">
                            ${typeInfo.icon} ${typeInfo.name}
                        </div>
                        <div class="transaction-description">${transaction.description}</div>
                        <div class="transaction-time">${formatTime(new Date(transaction.timestamp))}</div>
                    </div>
                    <div class="transaction-amount ${amountClass}">
                        ${amountPrefix}${formatCurrency(transaction.amount)}
                    </div>
                    <div class="transaction-actions">
                        <button class="btn btn--outline btn--icon" onclick="deleteTransaction(${transaction.id})" title="Delete">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        }).join('');

    container.innerHTML = transactionsHTML;
}

// Main Functions
function setOpeningBalance() {
    const input = document.getElementById('openingBalance');
    const value = parseFloat(input.value) || 0;
    
    if (value < 0) {
        showMessage('Opening balance cannot be negative', 'error');
        return;
    }
    
    appState.openingBalance = value;
    updateDashboard();
    showMessage('Opening balance set successfully');
}

function addTransaction(event) {
    event.preventDefault();
    
    const form = document.getElementById('transactionForm');
    const formData = new FormData(form);
    
    const type = document.getElementById('transactionType').value;
    const amount = parseFloat(document.getElementById('transactionAmount').value);
    const description = document.getElementById('transactionDescription').value.trim();
    
    // Validation
    if (!type) {
        showMessage('Please select a transaction type', 'error');
        return;
    }
    
    if (!amount || amount <= 0) {
        showMessage('Please enter a valid amount', 'error');
        return;
    }
    
    if (!description) {
        showMessage('Please enter a description', 'error');
        return;
    }
    
    // Create transaction
    const transaction = {
        id: Date.now(),
        type: type,
        amount: amount,
        description: description,
        timestamp: new Date().toISOString()
    };
    
    appState.transactions.push(transaction);
    
    // Update UI
    updateDashboard();
    updateTransactionsList();
    
    // Clear form
    clearForm();
    
    const typeInfo = transactionTypes[type];
    showMessage(`${typeInfo.name} of ${formatCurrency(amount)} added successfully`);
}

function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        appState.transactions = appState.transactions.filter(t => t.id !== id);
        updateDashboard();
        updateTransactionsList();
        showMessage('Transaction deleted successfully');
    }
}

function clearForm() {
    document.getElementById('transactionForm').reset();
}

function clearAllTransactions() {
    if (confirm('Are you sure you want to clear all transactions? This action cannot be undone.')) {
        appState.transactions = [];
        updateDashboard();
        updateTransactionsList();
        showMessage('All transactions cleared');
    }
}

function loadSampleData() {
    appState.transactions = [...sampleTransactions];
    appState.openingBalance = 1000;
    document.getElementById('openingBalance').value = appState.openingBalance;
    updateDashboard();
    updateTransactionsList();
    showMessage('Sample data loaded');
}

function exportSummary() {
    const totals = calculateTotals();
    const date = formatDate(appState.currentDate);
    
    let summaryText = `DAY CLOSING BALANCE SUMMARY\n`;
    summaryText += `Date: ${date}\n`;
    summaryText += `${'='.repeat(40)}\n\n`;
    summaryText += `Opening Balance: ${formatCurrency(appState.openingBalance)}\n`;
    summaryText += `Cash Sales: ${formatCurrency(totals.cashSales)}\n`;
    summaryText += `Digital Sales: ${formatCurrency(totals.digitalSales)}\n`;
    summaryText += `Other Income: ${formatCurrency(totals.otherIncome)}\n`;
    summaryText += `Total Income: ${formatCurrency(totals.totalIncome)}\n`;
    summaryText += `Cash Expenses: ${formatCurrency(totals.expenses)}\n`;
    summaryText += `${'='.repeat(40)}\n`;
    summaryText += `Closing Balance: ${formatCurrency(totals.closingBalance)}\n`;
    summaryText += `Physical Cash Balance: ${formatCurrency(totals.physicalCashBalance)}\n\n`;
    
    if (appState.transactions.length > 0) {
        summaryText += `TRANSACTION DETAILS\n`;
        summaryText += `${'='.repeat(40)}\n`;
        appState.transactions.forEach(transaction => {
            const typeInfo = transactionTypes[transaction.type];
            const time = formatTime(new Date(transaction.timestamp));
            summaryText += `${time} - ${typeInfo.name}: ${formatCurrency(transaction.amount)}\n`;
            summaryText += `  Description: ${transaction.description}\n\n`;
        });
    }
    
    // Create and download the file
    const blob = new Blob([summaryText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `day-closing-balance-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showMessage('Summary exported successfully');
}

function startNewDay() {
    if (confirm('Are you sure you want to start a new day? All current data will be cleared.')) {
        appState = {
            openingBalance: 0,
            transactions: [],
            currentDate: new Date()
        };
        
        document.getElementById('openingBalance').value = '';
        clearForm();
        updateDashboard();
        updateTransactionsList();
        updateCurrentDate();
        
        showMessage('New day started. All data cleared.');
    }
}

function updateCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    dateElement.textContent = formatDate(appState.currentDate);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Set current date
    updateCurrentDate();
    
    // Set up form submission
    document.getElementById('transactionForm').addEventListener('submit', addTransaction);
    
    // Initial dashboard update
    updateDashboard();
    updateTransactionsList();
    
    // Load sample data for demonstration (optional)
    // Uncomment the line below to load sample data on startup
    // loadSampleData();
    
    console.log('Day Closing Balance App initialized');
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + Enter to submit form
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        const form = document.getElementById('transactionForm');
        const submitEvent = new Event('submit');
        form.dispatchEvent(submitEvent);
    }
    
    // Escape to clear form
    if (event.key === 'Escape') {
        clearForm();
    }
});