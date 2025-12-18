document.addEventListener('DOMContentLoaded', () => {

    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    const form = document.getElementById('transactionForm');
    const transactionList = document.getElementById('transactionList');
    const submitBtn = document.querySelector('.submit-btn');

    const ctx = document.getElementById('transactionChart').getContext('2d');
    const transactionChart = new Chart(ctx, {
        type: 'pie',
        data: { labels: ['Income', 'Expense'], datasets: [{ data: [0, 0], backgroundColor: ['#28a745', '#dc3545'] }] },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });

    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    function updateChart() {
        const income = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
        transactionChart.data.datasets[0].data = [income, expense];
        transactionChart.update();
    }

    function updateTransactionsList() {
        transactionList.innerHTML = '';
        transactions.slice(-5).reverse().forEach(t => {
            const li = document.createElement('li');
            li.className = t.type.toLowerCase();
            li.innerHTML = `<span>${t.category}: ${t.amount.toFixed(2)}€</span><span>${t.date}</span>`;
            transactionList.appendChild(li);
        });
    }

    form.addEventListener('submit', e => {
        e.preventDefault();

        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const type = document.getElementById('type').value;
        const date = document.getElementById('date').value;
        const note = document.getElementById('note').value;

        if (!amount || !category || !type || !date) { alert('Please fill all fields'); return; }

        const transaction = { amount, category, type, date, note };
        console.log("Adding transaction:", transaction);

        transactions.push(transaction);
        saveTransactions();
        updateChart();
        updateTransactionsList();
        form.reset();

        submitBtn.style.transform = 'scale(1.1)';
        setTimeout(() => submitBtn.style.transform = 'scale(1)', 150);
    });

    updateChart();
    updateTransactionsList();

});
