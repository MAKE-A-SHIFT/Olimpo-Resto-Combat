const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\firet\\.gemini\\antigravity\\brain\\2b13232b-dfee-4314-8871-f08523636881';
const destDir = path.resolve(__dirname, '..', 'stories', 'assets', 'new_menu');

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

const brainFiles = fs.readdirSync(brainDir);

const map = [
  { prefix: 'new_dish_lunes_explosivo_', name: 'lunes_explosivo.jpg' },
  { prefix: 'new_dish_martes_sparring_', name: 'martes_sparring.jpg' },
  { prefix: 'el_clasico_potencia_stroganoff_', name: 'miercoles_stroganoff.jpg' },
  { prefix: 'especial_dubai_beef_tataki_', name: 'jueves_dubai.jpg' },
  { prefix: 'guiso_del_peleador_', name: 'viernes_guiso.jpg' },
  { prefix: 'el_placer_atletico_', name: 'sabado_milanesa.jpg' },
  { prefix: 'hamburguesa_club_olimpo_', name: 'fast_burger_club.jpg' },
  { prefix: 'olimpo_snacks_sandwich_', name: 'fast_sandwich_tostado.jpg' },
  { prefix: 'olimpo_recovery_drinks_', name: 'drinks_recovery_trio.jpg' }
];

map.forEach(m => {
  const match = brainFiles.find(f => f.startsWith(m.prefix) && (f.endsWith('.jpg') || f.endsWith('.png')));
  if (match) {
    const src = path.join(brainDir, match);
    const dest = path.join(destDir, m.name);
    fs.copyFileSync(src, dest);
    console.log(`Copied ${match} -> ${m.name} (${(fs.statSync(dest).size / 1024).toFixed(1)} KB)`);
  } else {
    console.warn(`Could not find file with prefix ${m.prefix}`);
  }
});
