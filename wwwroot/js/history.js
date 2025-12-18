document.addEventListener('DOMContentLoaded', () => {

    
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    // DOM elements
    const tbody = document.getElementById('historyTableBody');
    const filterCategory = document.getElementById('filterCategory');
    const filterType = document.getElementById('filterType');
    const filterMonth = document.getElementById('filterMonth');
    const searchKeyword = document.getElementById('searchKeyword');
    const exportCSVBtn = document.getElementById('exportCSV');

    
    function renderTable(transactionsToRender) {
        tbody.innerHTML = '';

        transactionsToRender.forEach(t => {
            const tr = document.createElement('tr');

            
            const tDate = new Date(t.date);
            const month = tDate.getMonth() + 1;

            
            const amountClass = t.type === 'Income' ? 'amount-income' : 'amount-expense';

            tr.innerHTML = `
                <td>${t.date}</td>
                <td>${t.category}</td>
                <td>${t.type}</td>
                <td class="${amountClass}">${t.amount.toFixed(2)}€</td>
                <td>${t.note || ''}</td>
            `;

            tbody.appendChild(tr);
        });
    }

    // Initial render
    renderTable(transactions);

    
    function applyFilters() {
        let filtered = transactions;

        const cat = filterCategory.value;
        if (cat) filtered = filtered.filter(t => t.category === cat);

        const type = filterType.value;
        if (type) filtered = filtered.filter(t => t.type === type);

        const month = filterMonth.value;
        if (month) filtered = filtered.filter(t => {
            const tMonth = new Date(t.date).getMonth() + 1;
            return tMonth == month;
        });

        const keyword = searchKeyword.value.trim().toLowerCase();
        if (keyword) {
            filtered = filtered.filter(t =>
                (t.note && t.note.toLowerCase().includes(keyword)) ||
                (t.category && t.category.toLowerCase().includes(keyword))
            );
        }

        renderTable(filtered);
    }

   
    filterCategory.addEventListener('change', applyFilters);
    filterType.addEventListener('change', applyFilters);
    filterMonth.addEventListener('change', applyFilters);
    searchKeyword.addEventListener('input', applyFilters);

    
    exportCSVBtn.addEventListener('click', () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Date,Category,Type,Amount,Note\n";

        transactions.forEach(t => {
            const row = [t.date, t.category, t.type, t.amount.toFixed(2), t.note || ''].join(",");
            csvContent += row + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        const dateStr = new Date().toISOString().slice(0, 10);
        link.setAttribute("download", `transactions_${dateStr}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

});
