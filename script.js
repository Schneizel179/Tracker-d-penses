let depenses = JSON.parse(localStorage.getItem('depenses')) || [];

function sauvegarder() {
    localStorage.setItem('depenses', JSON.stringify(depenses));
    afficherTout();
}

function ajouterDepense(e) {
    e.preventDefault();
    
    const montant = parseFloat(document.getElementById('montant').value);
    const categorie = document.getElementById('categorie').value;
    const date = document.getElementById('date').value;
    const note = document.getElementById('note').value;

    if (!montant || !categorie || !date) return;

    depenses.push({
        id: Date.now(),
        montant: montant,
        categorie: categorie,
        date: date,
        note: note
    });

    sauvegarder();
    document.getElementById('form-depense').reset();
}

function supprimerDepense(id) {
    if (confirm("Supprimer cette dépense ?")) {
        depenses = depenses.filter(d => d.id !== id);
        sauvegarder();
    }
}

function calculerTotalMois() {
    const maintenant = new Date();
    const moisActuel = maintenant.getMonth();
    const anneeActuelle = maintenant.getFullYear();

    const total = depenses
        .filter(d => {
            const date = new Date(d.date);
            return date.getMonth() === moisActuel && date.getFullYear() === anneeActuelle;
        })
        .reduce((sum, d) => sum + d.montant, 0);

    document.getElementById('total-mois').textContent = total.toFixed(2) + " €";
}

function afficherRepartition() {
    const parCategorie = {};
    depenses.forEach(d => {
        parCategorie[d.categorie] = (parCategorie[d.categorie] || 0) + d.montant;
    });

    let html = '';
    for (let cat in parCategorie) {
        html += `<div><strong>${cat}</strong> : ${parCategorie[cat].toFixed(2)} €</div>`;
    }
    document.getElementById('repartition').innerHTML = html || "<p>Aucune dépense encore.</p>";
}

function afficherListe() {
    const liste = document.getElementById('liste-depenses');
    liste.innerHTML = '';

    depenses.slice().reverse().forEach(dep => {
        const div = document.createElement('div');
        div.className = 'depense';
        div.innerHTML = `
            <div>
                <strong>${dep.montant.toFixed(2)} €</strong> - ${dep.categorie}<br>
                <small>${dep.date} ${dep.note ? '- ' + dep.note : ''}</small>
            </div>
            <button onclick="supprimerDepense(${dep.id})">×</button>
        `;
        liste.appendChild(div);
    });
}

function afficherTout() {
    calculerTotalMois();
    afficherRepartition();
    afficherListe();
}

function exporterCSV() {
    let csv = "Date;Montant;Catégorie;Note\n";
    depenses.forEach(d => {
        csv += `${d.date};${d.montant};${d.categorie};${d.note}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mes-depenses.csv';
    a.click();
}

function effacerTout() {
    if (confirm("Tout supprimer ? Cette action est irréversible.")) {
        depenses = [];
        sauvegarder();
    }
}

// Initialisation
document.getElementById('form-depense').addEventListener('submit', ajouterDepense);
afficherTout();