const fs = require('fs');
const transData = JSON.parse(fs.readFileSync('tools/translations_data.json', 'utf8'));

// Common French indicator words to look for in ES and EN
const frenchIndicators = [
  'Poulet', 'Bœuf', 'Dès 18', 'Abonnement', 'Semaine (', 'Mois (',
  'Commander', 'Déjeuner', 'Entraînement', 'Guerrier', 'Lundi', 'Mardi',
  'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Règle d\'Or', 'Assiette',
  'Sèche', 'Filleuls', 'Gains Mensuels', 'Parrainage', 'Heures', 'Emplacement',
  'Fermé', 'Livraison', 'Moyen de Paiement', 'Conditions Légales'
];

console.log('--- Checking ES for accidental French remnants ---');
for (const [k, v] of Object.entries(transData.es)) {
  for (const fi of frenchIndicators) {
    if (v.includes(fi)) {
      console.log(`[ES WARNING] Key "${k}" has French token "${fi}": ${v.slice(0, 50)}...`);
    }
  }
}

console.log('--- Checking EN for accidental French remnants ---');
for (const [k, v] of Object.entries(transData.en)) {
  for (const fi of frenchIndicators) {
    if (v.includes(fi)) {
      console.log(`[EN WARNING] Key "${k}" has French token "${fi}": ${v.slice(0, 50)}...`);
    }
  }
}

console.log('\nRemnant check complete!');
