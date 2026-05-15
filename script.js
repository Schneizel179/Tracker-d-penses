let expenses = [];

const dateInput = document.getElementById('expenseDate');
const categorySelect = document.getElementById('expenseCategory');
const descInput = document.getElementById('expenseDesc');
const amountInput = document.getElementById('expenseAmount');
const addBtn = document.getElementById('addExpenseBtn');
const resetAllBtn = document.getElementById('resetAllDataBtn');
const monthFilter = document.getElementById('monthFilter');
const categoryFilter = document.getElementById('categoryFilter');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');
const totalSpan = document.getElementById('totalAmount');
const tableBody = document.getElementById('expenseTableBody');

function loadData() {
    const stored = localStorage.getItem('smart_tracker_expenses');
    if(stored) {
        expenses = JSON.parse(stored);
    } else {
        expenses = [
            { id: Date.now()+1, date: new Date().toISOString().slice(0,10), category: "Alimentation", description: "Courses supermarché", amount: 58.30 },
            { id: Date.now()+2, date: new Date().toISOString().slice(0,10), category: "Transport", description: "Ticket métro", amount: 2.10 }
        ];
    }
    if(!dateInput.value) {
        dateInput.value = new Date().toISOString().slice(0,10);
    }
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    if(!monthFilter.value) monthFilter.value = currentMonth;
    render();
}

function saveToLocal() {
    localStorage.setItem('smart_tracker_expenses', JSON.stringify(expenses));
}

function addExpense() {
    const date = dateInput.value.trim();
    const category = categorySelect.value;
    const description = descInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if(!date) { alert("Veuillez entrer une date"); return; }
    if(isNaN(amount) || amount <= 0) { alert("Montant invalide (>0)"); return; }
    if(description === "") { alert("Ajoutez une petite description"); return; }

    const newExpense = {
        id: Date.now(),
        date: date,
        category: category,
        description: description,
        amount: amount
    };
    expenses.push(newExpense);
    saveToLocal();
    render();
    descInput.value = "";
    amountInput.value = "";
}

function deleteExpense(id) {
    expenses = expenses.filter(exp => exp.id !== id);
    saveToLocal();
    render();
}

function editExpense(id) {
    const expense = expenses.find(exp => exp.id === id);
    if(!expense) return;
    const newAmount = parseFloat(prompt("Modifier le montant (€) :", expense.amount));
    if(isNaN(newAmount) || newAmount <= 0) { alert("Montant invalide"); return; }
    const newDesc = prompt("Modifier la description :", expense.description);
    if(newDesc === null) return;
    const newCategory = prompt("Nouvelle catégorie (Alimentation, Transport, Loisirs, Santé, Logement, Factures, Autre) :", expense.category);
    if(newCategory && ["Alimentation","Transport","Loisirs","Santé","Logement","Factures","Autre"].includes(newCategory)) {
        expense.category = newCategory;
    }
    expense.amount = newAmount;
    expense.description = newDesc.trim() || expense.description;
    saveToLocal();
    render();
}

function resetAll() {
    if(confirm("⚠️ Supprimer TOUTES les dépenses ? Cette action est irréversible.")) {
        expenses = [];
        saveToLocal();
        render();
    }
}

function getFilteredExpenses() {
    let filtered = [...expenses];
    const selectedMonth = monthFilter.value;
    if(selectedMonth) {
        filtered = filtered.filter(exp => exp.date.startsWith(selectedMonth));
    }
    const catFilter = categoryFilter.value;
    if(catFilter !== 'all') {
        filtered = filtered.filter(exp => exp.category === catFilter);
    }
    return filtered;
}

function computeTotal() {
    const filtered = getFilteredExpenses();
    const sum = filtered.reduce((acc, exp) => acc + exp.amount, 0);
    return sum;
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if(m === '&') return '&amp;';
        if(m === '<') return '&lt;';
        if(m === '>') return '&gt;';
        return m;
    });
}

function render() {
    const filtered = getFilteredExpenses();
    const total = computeTotal();
    totalSpan.innerText = total.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

    if(filtered.length === 0) {
        tableBody.innerHTML = `<tr class="no-data"><td colspan="5">Aucune dépense pour cette période.</td></tr>`;
        return;
    }

    let html = '';
    filtered.forEach(exp => {
        const formattedDate = exp.date.split('-').reverse().join('/');
        html += `
            <tr>
                <td>${formattedDate}</td>
                <td><span class="category-badge">${exp.category}</span></td>
                <td>${escapeHtml(exp.description)}</td>
                <td>${exp.amount.toFixed(2)} €</td>
                <td class="actions">
                    <button class="edit-btn" data-id="${exp.id}">✏️</button>
                    <button class="del-btn" data-id="${exp.id}">🗑️</button>
                </td>
            </tr>
        `;
    });
    tableBody.innerHTML = html;

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.getAttribute('data-id'));
            editExpense(id);
        });
    });
    document.querySelectorAll('.del-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.getAttribute('data-id'));
            deleteExpense(id);
        });
    });
}

function clearFilters() {
    const now = new Date();
    monthFilter.value = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    categoryFilter.value = 'all';
    render();
}

addBtn.addEventListener('click', addExpense);
resetAllBtn.addEventListener('click', resetAll);
monthFilter.addEventListener('change', () => render());
categoryFilter.addEventListener('change', () => render());
clearFiltersBtn.addEventListener('click', clearFilters);
amountInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') addExpense(); });
descInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') addExpense(); });

loadData();
