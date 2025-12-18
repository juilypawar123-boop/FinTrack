document.addEventListener('DOMContentLoaded', () => {

   
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    function formatAmount(amount) {
        return amount.toFixed(2) + "€";
    }

    const transactionForm = document.getElementById('transactionForm');
    const transactionList = document.getElementById('transactionList');
    const submitBtn = document.querySelector('.submit-btn');

    const totalIncomeEl = document.getElementById('totalIncome');
    const totalExpenseEl = document.getElementById('totalExpense');
    const balanceEl = document.getElementById('balance');
    const dashboardTable = document.getElementById('transactionTable');

    const historyTableBody = document.getElementById('historyTableBody');
    const filterCategory = document.getElementById('filterCategory');
    const filterType = document.getElementById('filterType');
    const filterMonth = document.getElementById('filterMonth');
    const searchKeyword = document.getElementById('searchKeyword');
    const exportCSVBtn = document.getElementById('exportCSV');

    const transactionChartCanvas = document.getElementById('transactionChart');
    const dashboardChartCanvas = document.getElementById('financeChart');

    let transactionChart = null;
    let financeChart = null;

    
    function initTransactionChart() {
        if (!transactionChartCanvas || transactionChart) return;

        transactionChart = new Chart(transactionChartCanvas.getContext('2d'), {
            type: 'pie',
            data: {
                labels: ['Income', 'Expense'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: ['#28a745', '#dc3545']
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }

    function initFinanceChart() {
        if (!dashboardChartCanvas || financeChart) return;

        financeChart = new Chart(dashboardChartCanvas.getContext('2d'), {
            type: 'pie',
            data: {
                labels: ['Income', 'Expense'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: ['#28a745', '#dc3545']
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }

    
    function updateTransactionChart() {
        if (!transactionChart) return;
        const income = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
        transactionChart.data.datasets[0].data = [income, expense];
        transactionChart.update();
    }

    function updateTransactionList() {
        if (!transactionList) return;
        transactionList.innerHTML = '';
        transactions.slice(-5).reverse().forEach(t => {
            const li = document.createElement('li');
            li.className = t.type.toLowerCase();
            li.innerHTML = `<span>${t.category}: ${formatAmount(t.amount)}</span><span>${t.date}</span>`;
            transactionList.appendChild(li);
        });
    }

    function updateDashboard() {
        
        if (totalIncomeEl && totalExpenseEl && balanceEl) {
            const income = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
            const expense = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
            totalIncomeEl.textContent = formatAmount(income);
            totalExpenseEl.textContent = formatAmount(expense);
            balanceEl.textContent = formatAmount(income - expense);
        }

        
        if (dashboardTable) {
            dashboardTable.innerHTML = '';
            transactions.slice(-5).reverse().forEach(t => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${t.date}</td><td>${t.category}</td><td>${t.type}</td><td>${formatAmount(t.amount)}</td>`;
                dashboardTable.appendChild(tr);
            });
        }

       
        if (financeChart) {
            const income = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
            const expense = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
            financeChart.data.datasets[0].data = [income, expense];
            financeChart.update();
        }
    }

    function renderHistoryTable(filteredTransactions = transactions) {
        if (!historyTableBody) return;
        historyTableBody.innerHTML = '';
        filteredTransactions.forEach(t => {
            const tr = document.createElement('tr');
            const amountClass = t.type === 'Income' ? 'amount-income' : 'amount-expense';
            tr.innerHTML = `<td>${t.date}</td><td>${t.category}</td><td>${t.type}</td><td class="${amountClass}">${formatAmount(t.amount)}</td><td>${t.note || ''}</td>`;
            historyTableBody.appendChild(tr);
        });
    }

    function applyHistoryFilters() {
        if (!historyTableBody) return;
        let filtered = [...transactions];
        if (filterCategory && filterCategory.value) filtered = filtered.filter(t => t.category === filterCategory.value);
        if (filterType && filterType.value) filtered = filtered.filter(t => t.type === filterType.value);
        if (filterMonth && filterMonth.value) filtered = filtered.filter(t => (new Date(t.date).getMonth() + 1) == filterMonth.value);
        if (searchKeyword && searchKeyword.value.trim()) {
            const keyword = searchKeyword.value.trim().toLowerCase();
            filtered = filtered.filter(t =>
                (t.note && t.note.toLowerCase().includes(keyword)) ||
                (t.category && t.category.toLowerCase().includes(keyword))
            );
        }
        renderHistoryTable(filtered);
    }

   
    if (transactionForm) {
        transactionForm.addEventListener('submit', e => {
            e.preventDefault();
            const amount = parseFloat(document.getElementById('amount').value);
            const category = document.getElementById('category').value;
            const type = document.getElementById('type').value;
            const date = document.getElementById('date').value;
            const note = document.getElementById('note').value;

            if (!amount || !category || !type || !date) {
                alert('Please fill in all required fields.');
                return;
            }

            transactions.push({ amount, category, type, date, note });
            saveTransactions();

            updateTransactionList();
            updateTransactionChart();
            updateDashboard();
            renderHistoryTable();

            
            if (submitBtn) {
                submitBtn.style.transform = 'scale(1.1)';
                setTimeout(() => submitBtn.style.transform = 'scale(1)', 150);
            }

            transactionForm.reset();
        });
    }

    
    if (filterCategory) filterCategory.addEventListener('change', applyHistoryFilters);
    if (filterType) filterType.addEventListener('change', applyHistoryFilters);
    if (filterMonth) filterMonth.addEventListener('change', applyHistoryFilters);
    if (searchKeyword) searchKeyword.addEventListener('input', applyHistoryFilters);

    if (exportCSVBtn) {
        exportCSVBtn.addEventListener('click', () => {
            let csvContent = "data:text/csv;charset=utf-8,Date,Category,Type,Amount,Note\n";
            transactions.forEach(t => {
                const row = [t.date, t.category, t.type, t.amount.toFixed(2), t.note || ''].join(",");
                csvContent += row + "\n";
            });
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `transactions_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

   
    initTransactionChart();
    initFinanceChart();

    updateTransactionList();
    updateTransactionChart();
    updateDashboard();
    renderHistoryTable();

});
