const fs = require('fs');
const path = require('path');

const transData = JSON.parse(fs.readFileSync('tools/translations_data.json', 'utf8'));

let app = fs.readFileSync('app.js', 'utf8');

// 1. Replace goalsData definition and weeklyDishes and flyers with multilingual versions
const oldGoalsAndDishesRegex = /\/\/ --- PHYSICAL GOALS DATA[\s\S]*?\/\/ --- RENDER FLYERS[\s\S]*?\}\n  \}/;

const newGoalsDishesFlyers = `// --- PHYSICAL GOALS DATA (MULTILINGUAL) ---
  const goalsDataMultilingual = {
    es: {
      perdida_peso: {
        title: '1. Pérdida de Peso & Grasa',
        strategy: 'Déficit calórico limpio y controlado con saciedad mecánica alta. Doble volumen de verduras frescas y ensaladas crocantes para cero hambre.',
        prot: '180g (Pollo o Vacuno)',
        carbs: '50g secos (125g cocido)',
        veg: '300g (Doble Ensalada)'
      },
      definicion: {
        title: '2. Definición / Secado Atlético',
        strategy: 'Protección muscular máxima con aminoácidos y carbohidratos calculados post-entrenamiento para oxidar grasa manteniendo fuerza explosiva.',
        prot: '200 - 220g',
        carbs: '75g secos (185g cocido)',
        veg: '250g (Wok / Ensalada)'
      },
      mantenimiento: {
        title: '3. Mantenimiento (Regla de Oro Oficial)',
        strategy: 'Equilibrio metabólico exacto del Club Olimpo: 1/3 Proteínas, 1/3 Carbohidratos limpios y 1/3 Fibras & Fruta fresca para rendimiento constante.',
        prot: '200g (1/3 del Plato)',
        carbs: '100g secos (250g cocido)',
        veg: '200 - 250g + 1 Fruta'
      },
      ganancia_masa: {
        title: '4. Ganancia de Masa & Hipertrofia',
        strategy: 'Sobrecarga glucogénica limpia y alta densidad de aminoácidos para construcción muscular limpia y potencia demoledora en los rounds.',
        prot: '220g (Proteína pura)',
        carbs: '150g secos (375g cocido)',
        veg: '200g Verduras + Fruta'
      }
    },
    fr: {
      perdida_peso: {
        title: '1. Perte de Poids & Sèche Adipeuse',
        strategy: 'Déficit calorique propre et contrôlé avec une haute satiété mécanique. Double portion de crudités fraîches et salades croquantes pour zéro sensation de faim.',
        prot: '180g (Poulet ou Bœuf maigre)',
        carbs: '50g crus (125g cuit)',
        veg: '300g (Double Salade)'
      },
      definicion: {
        title: '2. Définition & Sèche Athlétique',
        strategy: 'Protection musculaire maximale avec acides aminés et glucides ciblés post-entraînement pour brûler le gras tout en préservant l\\'explosivité.',
        prot: '200 - 220g',
        carbs: '75g crus (185g cuit)',
        veg: '250g (Wok / Crudités)'
      },
      mantenimiento: {
        title: '3. Maintien Athlétique (Règle d\\'Or)',
        strategy: 'Équilibre métabolique exact du Complexe Olimpo : 1/3 Protéines, 1/3 Glucides propres et 1/3 Fibres & Fruit frais pour une endurance et vitalité constantes.',
        prot: '200g (1/3 de l\\'Assiette)',
        carbs: '100g crus (250g cuit)',
        veg: '200 - 250g + 1 Fruit frais'
      },
      ganancia_masa: {
        title: '4. Prise de Masse Musculaire Propre',
        strategy: 'Surplus glucidique sain et haute densité d\\'acides aminés pour bâtir de la fibre musculaire dense et générer une puissance destructrice sur le ring.',
        prot: '220g (Protéine pure)',
        carbs: '150g crus (375g cuit)',
        veg: '200g Légumes + Fruits'
      }
    },
    en: {
      perdida_peso: {
        title: '1. Weight Loss & Fat Shredding',
        strategy: 'Clean and controlled caloric deficit with high mechanical satiety. Double fresh crisp vegetables and garden salads for zero hunger pangs.',
        prot: '180g (Chicken or Lean Beef)',
        carbs: '50g raw (125g cooked)',
        veg: '300g (Double Salad)'
      },
      definicion: {
        title: '2. Athletic Cutting & Muscle Definition',
        strategy: 'Maximal muscle preservation with targeted amino acids and post-workout clean carbs to oxidize fat while maintaining explosive power.',
        prot: '200 - 220g',
        carbs: '75g raw (185g cooked)',
        veg: '250g (Wok / Salad)'
      },
      mantenimiento: {
        title: '3. Athletic Maintenance (Golden Rule)',
        strategy: 'Exact Olimpo metabolic balance: 1/3 Pure Protein, 1/3 Clean Carbs and 1/3 Fiber & Fresh Fruit for continuous high energy on the mats.',
        prot: '200g (1/3 of Plate)',
        carbs: '100g raw (250g cooked)',
        veg: '200 - 250g + 1 Fresh Fruit'
      },
      ganancia_masa: {
        title: '4. Muscle Growth & Hypertrophy',
        strategy: 'Clean glycogen surplus and dense amino acids for quality muscle hypertrophy and devastating striking impact across all rounds.',
        prot: '220g (Pure Protein)',
        carbs: '150g raw (375g cooked)',
        veg: '200g Vegetables + Fruit'
      }
    }
  };

  // --- WEEKLY DISHES DATA (MULTILINGUAL) ---
  const weeklyDishesData = {
    es: [
      {
        id: 'lunes_explosivo',
        day: 'Lunes',
        name: 'El Explosivo',
        sub: 'Pollo Plancha + Arroz Blanco + Ensalada',
        desc: 'Pechuga de pollo grillada 200g, arroz blanco al vapor (o mandioca de noche), ensalada fresca de tomates y lechuga con fruta de estación (naranja/manzana). Asimilación rápida y máxima energía.',
        img: 'stories/assets/new_menu/lunes_explosivo.jpg',
        badge: '25G',
        protein: '45g',
        carbs: '55g',
        fats: '8g',
        cal: '480 kcal',
        btnText: 'Pedir Plato'
      },
      {
        id: 'martes_sparring',
        day: 'Martes',
        name: 'El Sparring',
        sub: 'Fideos Salteados al Wok + Tiras de Carne',
        desc: 'Fideos con tiernas tiras de carne vacuna magra 180g, brócoli fresco, zanahorias y pimientos crujientes salteados en salsa ligera con toque de sésamo y manzana roja.',
        img: 'stories/assets/new_menu/martes_sparring.jpg',
        badge: '25G',
        protein: '48g',
        carbs: '65g',
        fats: '12g',
        cal: '560 kcal',
        btnText: 'Pedir Plato'
      },
      {
        id: 'miercoles_stroganoff',
        day: 'Miércoles',
        name: 'El Clásico Potencia',
        sub: 'Stroganoff Gourmet de Carne o Pollo',
        desc: 'Stroganoff tradicional con carne tierna dorada a fuego lento en salsa cremosa liviana con cebollas caramelizadas y perejil fresco, acompañado de arroz blanco y ensalada verde.',
        img: 'stories/assets/new_menu/miercoles_stroganoff.jpg',
        badge: '25G',
        protein: '46g',
        carbs: '58g',
        fats: '14g',
        cal: '540 kcal',
        btnText: 'Pedir Plato'
      },
      {
        id: 'jueves_dubai',
        day: 'Jueves',
        name: 'Especial Dubaï',
        sub: 'Tataki de Lomo Sellado en Abanico',
        desc: 'Tataki de carne roja 200g sellado a fuego vivo con centro rosado tierno, arroz blanco, cubos de piña fresca dorada, zanahorias glaseadas, chauchas salteadas y rabanitos crocantes.',
        img: 'stories/assets/new_menu/jueves_dubai.jpg',
        badge: '25G',
        protein: '50g',
        carbs: '60g',
        fats: '10g',
        cal: '530 kcal',
        btnText: 'Pedir Plato'
      },
      {
        id: 'viernes_guiso',
        day: 'Viernes',
        name: 'Guiso del Peleador',
        sub: 'Guiso Tradicional de Pollo y Fideos',
        desc: 'Guiso suculento tradicional con 200g de pollo jugoso, fideos, zanahorias, cebolla y arvejas en caldo caliente reconfortante con banana y naranja. Ideal recarga de glucógeno.',
        img: 'stories/assets/new_menu/viernes_guiso.jpg',
        badge: '25G',
        protein: '48g',
        carbs: '70g',
        fats: '11g',
        cal: '570 kcal',
        btnText: 'Pedir Plato'
      },
      {
        id: 'sabado_milanesa',
        day: 'Sábado',
        name: 'El Placer Atlético',
        sub: 'Milanesa Dorada de Pollo + Puré Casero',
        desc: 'Milanesa crocante dorada de pollo 200g con cremoso puré casero de papas a la manteca, ensalada fresca y gajo de limón. La recompensa glucémica post-semana de entrenamiento duro.',
        img: 'stories/assets/new_menu/sabado_milanesa.jpg',
        badge: '25G',
        protein: '47g',
        carbs: '62g',
        fats: '15g',
        cal: '580 kcal',
        btnText: 'Pedir Plato'
      }
    ],
    fr: [
      {
        id: 'lunes_explosivo',
        day: 'Lundi',
        name: 'El Explosivo',
        sub: 'Poulet Grillé + Riz Blanc + Salade',
        desc: 'Blanc de poulet grillé 200g, riz blanc vapeur (ou manioc le soir), salade fraîche tomates-laitue avec fruit de saison (orange/pomme). Assimilation rapide et énergie maximale.',
        img: 'stories/assets/new_menu/lunes_explosivo.jpg',
        badge: '25G',
        protein: '45g',
        carbs: '55g',
        fats: '8g',
        cal: '480 kcal',
        btnText: 'Commander'
      },
      {
        id: 'martes_sparring',
        day: 'Mardi',
        name: 'El Sparring',
        sub: 'Wok de Pâtes Sautées + Émincé de Bœuf',
        desc: 'Pâtes sautées avec tendres lamelles de bœuf maigre 180g, brocoli croquant, carottes et poivrons dans une sauce légère au sésame, accompagnés d\\'une pomme rouge croquante.',
        img: 'stories/assets/new_menu/martes_sparring.jpg',
        badge: '25G',
        protein: '48g',
        carbs: '65g',
        fats: '12g',
        cal: '560 kcal',
        btnText: 'Commander'
      },
      {
        id: 'miercoles_stroganoff',
        day: 'Mercredi',
        name: 'El Clásico Potencia',
        sub: 'Stroganoff Gourmet de Bœuf ou Poulet',
        desc: 'Stroganoff traditionnel avec viande tendre mijotée doucement dans une crème légère aux oignons fondants et persil frais, servi avec riz blanc vapeur et salade verte.',
        img: 'stories/assets/new_menu/miercoles_stroganoff.jpg',
        badge: '25G',
        protein: '46g',
        carbs: '58g',
        fats: '14g',
        cal: '540 kcal',
        btnText: 'Commander'
      },
      {
        id: 'jueves_dubai',
        day: 'Jeudi',
        name: 'Spécial Dubaï',
        sub: 'Tataki de Bœuf Saisi en Éventail',
        desc: 'Tataki de filet de bœuf 200g saisi vif au cœur tendre rosé, riz blanc vapeur, cubes d\\'ananas rôtis, carottes glacées, haricots verts sautés et radis croquants.',
        img: 'stories/assets/new_menu/jueves_dubai.jpg',
        badge: '25G',
        protein: '50g',
        carbs: '60g',
        fats: '10g',
        cal: '530 kcal',
        btnText: 'Commander'
      },
      {
        id: 'viernes_guiso',
        day: 'Vendredi',
        name: 'Guiso del Peleador',
        sub: 'Ragoût Traditionnel Poulet & Pâtes',
        desc: 'Guiso réconfortant du combattant avec 200g de poulet juteux, pâtes, carottes, oignons et petits pois dans un bouillon riche chaud, avec banane et orange. Recharge glycogénique idéale.',
        img: 'stories/assets/new_menu/viernes_guiso.jpg',
        badge: '25G',
        protein: '48g',
        carbs: '70g',
        fats: '11g',
        cal: '570 kcal',
        btnText: 'Commander'
      },
      {
        id: 'sabado_milanesa',
        day: 'Samedi',
        name: 'El Placer Atlético',
        sub: 'Milanaise Dorée de Poulet + Purée Maison',
        desc: 'Milanaise croustillante dorée au four de poulet 200g avec purée onctueuse maison de pommes de terre, salade fraîche et quartier de citron. La juste récompense après une semaine intense.',
        img: 'stories/assets/new_menu/sabado_milanesa.jpg',
        badge: '25G',
        protein: '47g',
        carbs: '62g',
        fats: '15g',
        cal: '580 kcal',
        btnText: 'Commander'
      }
    ],
    en: [
      {
        id: 'lunes_explosivo',
        day: 'Monday',
        name: 'The Explosive',
        sub: 'Grilled Chicken + White Rice + Fresh Salad',
        desc: 'Grilled chicken breast 200g, steamed white rice (or evening cassava), fresh tomato-lettuce salad with seasonal whole fruit (orange/apple). Quick absorption and peak athletic energy.',
        img: 'stories/assets/new_menu/lunes_explosivo.jpg',
        badge: '25G',
        protein: '45g',
        carbs: '55g',
        fats: '8g',
        cal: '480 kcal',
        btnText: 'Order Meal'
      },
      {
        id: 'martes_sparring',
        day: 'Tuesday',
        name: 'The Sparring',
        sub: 'Wok Sautéed Noodles + Sliced Lean Beef',
        desc: 'Stir-fried noodles with 180g tender lean beef strips, crisp broccoli, carrots, and sweet peppers in light sesame reduction, paired with a fresh red apple.',
        img: 'stories/assets/new_menu/martes_sparring.jpg',
        badge: '25G',
        protein: '48g',
        carbs: '65g',
        fats: '12g',
        cal: '560 kcal',
        btnText: 'Order Meal'
      },
      {
        id: 'miercoles_stroganoff',
        day: 'Wednesday',
        name: 'Classic Power',
        sub: 'Gourmet Beef or Chicken Stroganoff',
        desc: 'Traditional slow-simmered tender beef stroganoff in a delicate cream sauce with caramelized onions and fresh parsley, served with steamed white rice and garden salad.',
        img: 'stories/assets/new_menu/miercoles_stroganoff.jpg',
        badge: '25G',
        protein: '46g',
        carbs: '58g',
        fats: '14g',
        cal: '540 kcal',
        btnText: 'Order Meal'
      },
      {
        id: 'jueves_dubai',
        day: 'Thursday',
        name: 'Dubai Special',
        sub: 'Seared Beef Tenderloin Tataki',
        desc: 'Flame-seared 200g lean beef tataki with tender pink center, steamed rice, roasted golden pineapple cubes, glazed baby carrots, green beans, and crisp radish.',
        img: 'stories/assets/new_menu/jueves_dubai.jpg',
        badge: '25G',
        protein: '50g',
        carbs: '60g',
        fats: '10g',
        cal: '530 kcal',
        btnText: 'Order Meal'
      },
      {
        id: 'viernes_guiso',
        day: 'Friday',
        name: 'Fighter Stew',
        sub: 'Traditional Hearty Chicken & Pasta Stew',
        desc: 'Rich traditional fighter stew packed with 200g juicy chicken, pasta, sweet carrots, onions, and sweet peas in warming broth with banana and orange. Ideal glycogen reload.',
        img: 'stories/assets/new_menu/viernes_guiso.jpg',
        badge: '25G',
        protein: '48g',
        carbs: '70g',
        fats: '11g',
        cal: '570 kcal',
        btnText: 'Order Meal'
      },
      {
        id: 'sabado_milanesa',
        day: 'Saturday',
        name: 'Athletic Pleasure',
        sub: 'Golden Chicken Milanesa + Homemade Mash',
        desc: 'Golden crispy chicken breast milanesa 200g with rich buttery mashed potatoes, fresh crisp salad, and fresh lemon wedge. The ultimate clean glycemic reward post-training.',
        img: 'stories/assets/new_menu/sabado_milanesa.jpg',
        badge: '25G',
        protein: '47g',
        carbs: '62g',
        fats: '15g',
        cal: '580 kcal',
        btnText: 'Order Meal'
      }
    ]
  };

  // --- FLYERS DATA (MULTILINGUAL) ---
  const flyersDataMultilingual = {
    es: [
      {
        id: 1,
        side: 'Recto',
        tag: 'Página 1 • Recto',
        title: 'Menú Semanal & Packs de Suscripción',
        desc: 'Los 6 almuerzos completos (Lunes a Sábado), la regla de oro 1/3 y la grilla oficial de packs semanales y mensuales con beneficio de débito automático Bancard (-5%).',
        preview: 'stories/assets/flyer_recto_preview.png',
        btnZoom: '🔍 Zoom Vista Previa',
        btnPdf: '📄 Descargar PDF'
      },
      {
        id: 2,
        side: 'Verso',
        tag: 'Página 2 • Verso',
        title: 'Comida Rápida, Bebidas & Academia de Combate',
        desc: 'Línea de street-food proteico para ganancia muscular, bebidas funcionales de recuperación, horarios de cocina y sala de entrenamiento en Bristol de Areguá.',
        preview: 'stories/assets/flyer_verso_preview.png',
        btnZoom: '🔍 Zoom Vista Previa',
        btnPdf: '📄 Descargar PDF'
      }
    ],
    fr: [
      {
        id: 1,
        side: 'Recto',
        tag: 'Page 1 • Recto',
        title: 'Menu de la Semaine & Packs d\\'Abonnement',
        desc: 'Les 6 déjeuners complets (Lundi au Samedi), la règle d\\'or 1/3 et la grille officielle des packs hebdomadaires et mensuels avec remise débit automatique Bancard (-5%).',
        preview: 'stories/assets/flyer_recto_preview.png',
        btnZoom: '🔍 Aperçu Zoom',
        btnPdf: '📄 Télécharger le PDF'
      },
      {
        id: 2,
        side: 'Verso',
        tag: 'Page 2 • Verso',
        title: 'Street-Food, Boissons & Salle de Combat',
        desc: 'Ligne de street-food protéinée pour la prise musculaire, boissons de récupération, horaires de cuisine et de cours de combat à Bristol d\\'Areguá.',
        preview: 'stories/assets/flyer_verso_preview.png',
        btnZoom: '🔍 Aperçu Zoom',
        btnPdf: '📄 Télécharger le PDF'
      }
    ],
    en: [
      {
        id: 1,
        side: 'Front',
        tag: 'Page 1 • Front',
        title: 'Weekly Menu & Subscription Packs',
        desc: 'All 6 athletic lunches (Monday to Saturday), 1/3 golden rule, and official weekly and monthly pricing table with Bancard auto-debit benefit (-5%).',
        preview: 'stories/assets/flyer_recto_preview.png',
        btnZoom: '🔍 Zoom Preview',
        btnPdf: '📄 Download PDF'
      },
      {
        id: 2,
        side: 'Back',
        tag: 'Page 2 • Back',
        title: 'Street-Food, Drinks & Combat Gym',
        desc: 'High-protein street-food line for lean mass gain, recovery beverages, kitchen operating hours, and combat training facility in Bristol of Areguá.',
        preview: 'stories/assets/flyer_verso_preview.png',
        btnZoom: '🔍 Zoom Preview',
        btnPdf: '📄 Download PDF'
      }
    ]
  };

  // --- RENDER WEEKLY DISHES (MULTILINGUAL) ---
  function renderWeeklyDishes(lang) {
    const dishesGrid = document.getElementById('dishesGrid');
    if (!dishesGrid) return;
    const currentLang = lang || state.lang || 'es';
    const dishes = weeklyDishesData[currentLang] || weeklyDishesData.es;
    const macroLabels = {
      es: { prot: 'Prot:', gluc: 'Carb:', lip: 'Gras:', cal: 'Cal:' },
      fr: { prot: 'Prot:', gluc: 'Gluc:', lip: 'Lip:', cal: 'Cal:' },
      en: { prot: 'Prot:', gluc: 'Carbs:', lip: 'Fat:', cal: 'Cal:' }
    }[currentLang] || { prot: 'Prot:', gluc: 'Carb:', lip: 'Gras:', cal: 'Cal:' };

    dishesGrid.innerHTML = dishes.map((dish, idx) => \`
      <div class="dish-card" data-day="\${weeklyDishesData.es[idx].day}">
        <div class="card-lisere-top"></div>
        <div class="dish-img-wrap">
          <img src="\${dish.img}" alt="\${dish.name}" loading="lazy">
          <span class="dish-day-badge">\${dish.day}</span>
        </div>
        <div class="dish-body">
          <h3 class="dish-title">\${dish.name}</h3>
          <div class="dish-sub">\${dish.sub}</div>
          <p class="dish-desc">\${dish.desc}</p>
          <div class="dish-macros">
            <div class="macro-item"><span>\${macroLabels.prot}</span> <strong>\${dish.protein}</strong></div>
            <div class="macro-item"><span>\${macroLabels.gluc}</span> <strong>\${dish.carbs}</strong></div>
            <div class="macro-item"><span>\${macroLabels.lip}</span> <strong>\${dish.fats}</strong></div>
            <div class="macro-item"><span>\${macroLabels.cal}</span> <strong>\${dish.cal}</strong></div>
          </div>
          <div class="dish-footer">
            <span class="dish-price-val">25.000 ₲</span>
            <button class="btn-dish-order" onclick="window.openCheckout('plato_unico', '\${weeklyDishesData.es[idx].name}')">
              \${dish.btnText}
            </button>
          </div>
        </div>
      </div>
    \`).join('');
  }

  // --- RENDER FLYERS (MULTILINGUAL) ---
  function renderFlyers(lang) {
    const flyersGrid = document.getElementById('flyersGrid');
    if (!flyersGrid) return;
    const currentLang = lang || state.lang || 'es';
    const items = flyersDataMultilingual[currentLang] || flyersDataMultilingual.es;
    flyersGrid.innerHTML = items.map(flyer => \`
      <div class="flyer-thumb-card">
        <div class="card-lisere-top"></div>
        <div class="flyer-img-container" onclick="window.openFlyerLightbox('\${flyer.preview}', '\${flyer.title}')">
          <img src="\${flyer.preview}" alt="\${flyer.title}" class="flyer-thumb-img" loading="lazy">
          <span class="flyer-side-badge">\${flyer.tag}</span>
        </div>
        <div class="flyer-meta-bar">
          <div class="flyer-title">\${flyer.title}</div>
          <p class="flyer-desc-text">\${flyer.desc}</p>
          <div class="flyer-actions">
            <button type="button" class="btn-flyer-zoom" onclick="window.openFlyerLightbox('\${flyer.preview}', '\${flyer.title}')">
              \${flyer.btnZoom}
            </button>
            <a href="stories/assets/Menu_Oficial_Restaurante_del_Olimpo.pdf" target="_blank" rel="noopener noreferrer" class="btn-flyer-zoom btn-flyer-pdf">
              \${flyer.btnPdf}
            </a>
          </div>
        </div>
      </div>
    \`).join('');
  }

  // Initial renders
  renderWeeklyDishes(state.lang || 'es');
  renderFlyers(state.lang || 'es');`;

app = app.replace(oldGoalsAndDishesRegex, newGoalsDishesFlyers);

// 2. Update Goals Display logic
const oldGoalsLogicRegex = /\/\/ --- PHYSICAL GOALS SELECTOR LOGIC[\s\S]*?goalButtons\.forEach\(btn => \{[\s\S]*?\}\);/;
const newGoalsLogic = `// --- PHYSICAL GOALS SELECTOR LOGIC (MULTILINGUAL) ---
  const goalButtons = document.querySelectorAll('.btn-goal-tab');
  const goalTitleElem = document.getElementById('goalTitle');
  const goalStrategyElem = document.getElementById('goalStrategy');
  const macroProtElem = document.getElementById('macroProt');
  const macroCarbsElem = document.getElementById('macroCarbs');
  const macroVegElem = document.getElementById('macroVeg');

  function updateGoalDisplay(lang) {
    const currentLang = lang || state.lang || 'es';
    const gLang = goalsDataMultilingual[currentLang] || goalsDataMultilingual.es;
    const goalKey = state.activeGoal || 'mantenimiento';
    const goal = gLang[goalKey] || gLang.mantenimiento;
    if (goalTitleElem) goalTitleElem.textContent = goal.title;
    if (goalStrategyElem) goalStrategyElem.textContent = goal.strategy;
    if (macroProtElem) macroProtElem.textContent = goal.prot;
    if (macroCarbsElem) macroCarbsElem.textContent = goal.carbs;
    if (macroVegElem) macroVegElem.textContent = goal.veg;
  }

  goalButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      goalButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const goalKey = btn.getAttribute('data-goal');
      state.activeGoal = goalKey;
      updateGoalDisplay(state.lang || 'es');
    });
  });
  updateGoalDisplay(state.lang || 'es');`;

app = app.replace(oldGoalsLogicRegex, newGoalsLogic);

// 3. Update calculateAffiliateEarnings to localize "personas" / "personnes" / "people"
const oldCalcAffRegex = /function calculateAffiliateEarnings\(\) \{[\s\S]*?valMeals\.textContent = `\$\{mealsCount\} personas`;[\s\S]*?valClub\.textContent = `\$\{clubCount\} personas`;/;
const newCalcAff = `function calculateAffiliateEarnings() {
    if (!sliderMeals || !sliderClub) return;
    const mealsCount = parseInt(sliderMeals.value, 10);
    const clubCount = parseInt(sliderClub.value, 10);

    const peopleWord = {
      es: 'personas',
      fr: 'personnes',
      en: 'people'
    }[state.lang || 'es'] || 'personas';

    valMeals.textContent = \`\${mealsCount} \${peopleWord}\`;
    valClub.textContent = \`\${clubCount} \${peopleWord}\`;`;

app = app.replace(oldCalcAffRegex, newCalcAff);

// 4. Localize getCheckoutCalculations labels
const oldCheckoutCalcRegex = /function getCheckoutCalculations\(\) \{[\s\S]*?let nutritionLabel = '';[\s\S]*?let clubLabel = '— Sin suscripción al club';[\s\S]*?if \(isCombo\) \{[\s\S]*?clubLabel = '✓ Club Kickboxing & Boxeo INCLUIDO en el Combo';[\s\S]*?\} else if \(state\.clubChoice === 'club_monthly'\) \{[\s\S]*?\} else if \(state\.clubChoice === 'club_trial'\) \{[\s\S]*?\} else if \(state\.clubChoice === 'club_already'\) \{[\s\S]*?\} else \{[\s\S]*?clubLabel = '— Sin suscripción al club';[\s\S]*?\}/;

const newCheckoutCalc = `function getCheckoutCalculations() {
    const packCycle = state.selectedCycle;
    const currentLang = state.lang || 'es';
    const cData = checkoutTranslations[currentLang] || checkoutTranslations.es;

    let nutritionBase = 0;
    let isCombo = false;
    let nutritionLabel = '';

    if (state.nutritionChoice === 'pack_fighter_pro_mensual' || (state.nutritionChoice === 'pack_fighter_pro' && packCycle === 'mensual')) {
      nutritionBase = 950000;
      nutritionLabel = cData.plans.pack_fighter_pro_mensual;
    } else if (state.nutritionChoice === 'pack_fighter_pro_semanal' || (state.nutritionChoice === 'pack_fighter_pro' && packCycle === 'semanal')) {
      nutritionBase = 260000;
      nutritionLabel = cData.plans.pack_fighter_pro_semanal;
    } else if (state.nutritionChoice === 'pack_1_plato_mensual' || (state.nutritionChoice === 'pack_1_plato' && packCycle === 'mensual')) {
      nutritionBase = 500000;
      nutritionLabel = cData.plans.pack_1_plato_mensual;
    } else if (state.nutritionChoice === 'pack_1_plato_semanal' || (state.nutritionChoice === 'pack_1_plato' && packCycle === 'semanal')) {
      nutritionBase = 140000;
      nutritionLabel = cData.plans.pack_1_plato_semanal;
    } else if (state.nutritionChoice === 'combo_elite_mensual' || (state.nutritionChoice === 'combo_elite' && packCycle === 'mensual')) {
      nutritionBase = 1100000;
      nutritionLabel = cData.plans.combo_elite_mensual;
      isCombo = true;
    } else if (state.nutritionChoice === 'combo_elite_semanal' || (state.nutritionChoice === 'combo_elite' && packCycle === 'semanal')) {
      nutritionBase = 300000;
      nutritionLabel = cData.plans.combo_elite_semanal;
      isCombo = true;
    } else if (state.nutritionChoice === 'plato_unico') {
      const selectedDishObj = availableDishesList.find(d => dishSelectElem && dishSelectElem.value === d.id) || availableDishesList[0];
      const singlePrice = selectedDishObj.price;
      const qty = state.plateQuantity || 1;
      nutritionBase = singlePrice * qty;
      const translatedDishName = (cData.singleDishes && cData.singleDishes[selectedDishObj.id])
        ? cData.singleDishes[selectedDishObj.id].split('(')[0].trim()
        : selectedDishObj.name.split('(')[0].trim();
      nutritionLabel = \`\${qty}x \${translatedDishName}\`;
    } else {
      nutritionBase = 0;
      nutritionLabel = cData.plans.none;
    }

    let clubBase = 0;
    let clubLabel = cData.clubChoices.club_none;

    const cycleUnit = packCycle === 'semanal' ? (currentLang === 'en' ? 'wk' : 'sem') : (currentLang === 'fr' ? 'mois' : currentLang === 'en' ? 'mo' : 'mes');

    if (isCombo) {
      clubBase = 0;
      clubLabel = {
        es: '✓ Club Kickboxing & Boxeo INCLUIDO en el Combo',
        fr: '✓ Club Kickboxing & Boxe INCLUS dans le Combo',
        en: '✓ Kickboxing & Boxing Club INCLUDED in Combo'
      }[currentLang] || '✓ Club Kickboxing & Boxeo INCLUIDO en el Combo';
    } else if (state.clubChoice === 'club_monthly') {
      clubBase = packCycle === 'semanal' ? 50000 : 150000;
      clubLabel = \`✓ Club Kickboxing & Boxeo (\${clubBase.toLocaleString('es-PY')} ₲/\${cycleUnit})\`;
    } else if (state.clubChoice === 'club_trial') {
      clubBase = 0;
      clubLabel = cData.clubChoices.club_trial;
    } else if (state.clubChoice === 'club_already') {
      clubBase = 0;
      clubLabel = cData.clubChoices.club_already;
    } else {
      clubBase = 0;
      clubLabel = cData.clubChoices.club_none;
    }`;

app = app.replace(oldCheckoutCalcRegex, newCheckoutCalc);

// 5. Replace translations, checkoutTranslations, updateCheckoutSelectorTranslations, applyLanguage
const oldTranslationsBlockRegex = /\/\/ ==========================================================================\n\s*\/\/ MULTILINGUAL ENGINE[\s\S]*?applyLanguage\(state\.lang \|\| 'es'\);/;

const newTranslationsBlock = `// ==========================================================================
  // MULTILINGUAL ENGINE (ESPAÑOL / FRANÇAIS / ENGLISH) - 100% AUDITED
  // ==========================================================================
  const translations = ${JSON.stringify(transData, null, 4)};

  const checkoutTranslations = {
    es: {
      clubChoices: {
        club_monthly: '🥊 Sí, sumar la Membresía Club Kickboxing & Boxeo (+150.000 ₲ / mes)',
        club_trial: '🆓 Reservar 1er Día de Prueba GRATIS en el Club (0 ₲)',
        club_already: '✓ Ya soy miembro activo del club (0 ₲)',
        club_none: '— No gracias, únicamente el programa de nutrición'
      },
      optgroups: {
        monthly: '📅 PACKS MENSUALES (Mes Completo • Lun a Sáb - Domingo Cerrado)',
        weekly: '⚡ PACKS SEMANALES (Semana • 6 Días Lun a Sáb)',
        single: '🍽️ PLATOS INDIVIDUALES & STREET-FOOD',
        none: '🥊 SOLO ENTRENAMIENTO'
      },
      plans: {
        pack_fighter_pro_mensual: '⭐ Fighter Pro Mensual (2 Platos/Día : Almuerzo + Cena) — 950.000 ₲ / mes',
        pack_1_plato_mensual: 'Pack 1 Plato/Día Mensual (Almuerzo o Cena) — 500.000 ₲ / mes',
        combo_elite_mensual: '🏆 Combo Fighter Elite Mensual (Club Boxeo + 2 Platos/Día) — 1.100.000 ₲ / mes',
        pack_fighter_pro_semanal: '⭐ Fighter Pro Semanal (2 Platos/Día : 12 Platos) — 260.000 ₲ / sem',
        pack_1_plato_semanal: 'Pack 1 Plato/Día Semanal (1 Plato/Día : 6 Platos) — 140.000 ₲ / sem',
        combo_elite_semanal: '🏆 Combo Fighter Elite Semanal (Pase Club + 2 Platos/Día) — 300.000 ₲ / sem',
        plato_unico: '🍽️ Plato Único del Día / Street-Food (Desde 7.000 ₲ a 25.000 ₲)',
        none: '— Ningún pack de comida (Únicamente membresía al Club)'
      },
      singleDishes: {
        lunes_explosivo: 'El Explosivo (Lunes - Pollo Grillado + Arroz + Ensalada) - 25.000 ₲',
        martes_sparring: 'El Sparring (Martes - Wok Fideos + Tiras de Carne) - 25.000 ₲',
        miercoles_stroganoff: 'El Clásico Potencia (Miércoles - Stroganoff de Carne/Pollo) - 25.000 ₲',
        jueves_dubai: 'Especial Dubaï (Jueves - Tataki de Lomo Sellado) - 25.000 ₲',
        viernes_guiso: 'Guiso del Peleador (Viernes - Guiso Pollo + Fideos) - 25.000 ₲',
        sabado_milanesa: 'El Placer Atlético (Sábado - Milanesa Pollo + Puré Casero) - 25.000 ₲',
        hamburguesa_olimpo: 'Hamburguesa Olimpo (Carne + Huevo + Queso) - 14.000 ₲',
        club_milanesa: 'Club Pollo Milanesa (Triple Piso Proteico) - 15.000 ₲',
        sandwich_pollo_repollo: 'Sándwich Pollo-Repollo (Pollo Desmenuzado) - 10.000 ₲',
        tostados_paraguayos: 'Tostados Paraguayos-Italianos (Mozzarella + Jamón) - 7.000 ₲'
      }
    },
    fr: {
      clubChoices: {
        club_monthly: '🥊 Oui, ajouter l\\'Abonnement Club Kickboxing & Boxe (+150.000 ₲ / mois)',
        club_trial: '🆓 Réserver un 1er Jour d\\'Essai GRATUIT au Club (0 ₲)',
        club_already: '✓ J\\'ai déjà mon abonnement au club / Déjà membre (0 ₲)',
        club_none: '— Non merci, uniquement le programme nutritif'
      },
      optgroups: {
        monthly: '📅 PACKS MENSUELS (Mois Complet • Lun à Sam - Dimanche Fermé)',
        weekly: '⚡ PACKS HEBDOMADAIRES (Semaine • 6 Jours Lun à Sam)',
        single: '🍽️ PLATS À L\\'UNITÉ & STREET-FOOD',
        none: '🥊 ENTRAÎNEMENT SEUL'
      },
      plans: {
        pack_fighter_pro_mensual: '⭐ Fighter Pro Mensuel (2 Plats/Jour : Midi + Soir) — 950.000 ₲ / mois',
        pack_1_plato_mensual: 'Pack 1 Plat/Jour Mensuel (Midi ou Soir) — 500.000 ₲ / mois',
        combo_elite_mensual: '🏆 Combo Fighter Elite Mensuel (Club Boxe + 2 Plats/Jour) — 1.100.000 ₲ / mois',
        pack_fighter_pro_semanal: '⭐ Fighter Pro Hebdo (2 Plats/Jour : 12 Plats) — 260.000 ₲ / sem',
        pack_1_plato_semanal: 'Pack 1 Plat/Jour Hebdo (1 Plat/Jour : 6 Plats) — 140.000 ₲ / sem',
        combo_elite_semanal: '🏆 Combo Fighter Elite Hebdo (Passe Club + 2 Plats/Jour) — 300.000 ₲ / sem',
        plato_unico: '🍽️ Plat Unique du Jour / Street-Food (Dès 7.000 ₲ à 25.000 ₲)',
        none: '— Aucun repas (Uniquement abonnement au Club)'
      },
      singleDishes: {
        lunes_explosivo: 'El Explosivo (Lundi - Poulet Grillé 200g + Riz + Salade) - 25.000 ₲',
        martes_sparring: 'El Sparring (Mardi - Wok Pâtes + Bœuf Sauté 180g) - 25.000 ₲',
        miercoles_stroganoff: 'El Clásico Potencia (Mercredi - Stroganoff Bœuf/Poulet) - 25.000 ₲',
        jueves_dubai: 'Spécial Dubaï (Jeudi - Tataki de Bœuf Saisi) - 25.000 ₲',
        viernes_guiso: 'Guiso del Peleador (Vendredi - Ragoût Poulet 200g + Pâtes) - 25.000 ₲',
        sabado_milanesa: 'El Placer Atlético (Samedi - Milanaise Poulet + Purée Maison) - 25.000 ₲',
        hamburguesa_olimpo: 'Burger Olimpo (Bœuf + Œuf + Cheddar) - 14.000 ₲',
        club_milanesa: 'Club Poulet Milanaise (Triple Étage Protéiné) - 15.000 ₲',
        sandwich_pollo_repollo: 'Sandwich Poulet-Chou (Poulet Effiloché) - 10.000 ₲',
        tostados_paraguayos: 'Toastés Paraguayens-Italiens (Mozzarella + Jamón) - 7.000 ₲'
      }
    },
    en: {
      clubChoices: {
        club_monthly: '🥊 Yes, add Kickboxing & Boxing Club Membership (+150,000 ₲ / mo)',
        club_trial: '🆓 Book 1st FREE Trial Day at the Club (0 ₲)',
        club_already: '✓ Already an active club member (0 ₲)',
        club_none: '— No thanks, nutrition program only'
      },
      optgroups: {
        monthly: '📅 MONTHLY PACKS (Full Month • Mon to Sat - Sun Closed)',
        weekly: '⚡ WEEKLY PACKS (6 Days • Mon to Sat)',
        single: '🍽️ SINGLE MEALS & STREET-FOOD',
        none: '🥊 TRAINING ONLY'
      },
      plans: {
        pack_fighter_pro_mensual: '⭐ Monthly Fighter Pro (2 Meals/Day: Lunch + Dinner) — 950,000 ₲ / mo',
        pack_1_plato_mensual: 'Monthly 1 Meal/Day Pack (Lunch or Dinner) — 500,000 ₲ / mo',
        combo_elite_mensual: '🏆 Monthly Elite Fighter Combo (Fight Club + 2 Meals/Day) — 1,100,000 ₲ / mo',
        pack_fighter_pro_semanal: '⭐ Weekly Fighter Pro (2 Meals/Day: 12 Meals) — 260,000 ₲ / wk',
        pack_1_plato_semanal: 'Weekly 1 Meal/Day Pack (1 Meal/Day: 6 Meals) — 140,000 ₲ / wk',
        combo_elite_semanal: '🏆 Weekly Elite Fighter Combo (Club Pass + 2 Meals/Day) — 300,000 ₲ / wk',
        plato_unico: '🍽️ Daily Single Meal / Street-Food (From 7,000 ₲ to 25,000 ₲)',
        none: '— No meals (Gym training membership only)'
      },
      singleDishes: {
        lunes_explosivo: 'The Explosive (Monday - Grilled Chicken 200g + Rice + Salad) - 25,000 ₲',
        martes_sparring: 'The Sparring (Tuesday - Wok Noodles + Sliced Beef 180g) - 25,000 ₲',
        miercoles_stroganoff: 'Classic Power (Wednesday - Beef/Chicken Stroganoff) - 25,000 ₲',
        jueves_dubai: 'Dubai Special (Thursday - Seared Beef Tataki) - 25,000 ₲',
        viernes_guiso: 'Fighter Stew (Friday - Chicken Stew 200g + Pasta) - 25,000 ₲',
        sabado_milanesa: 'Athletic Pleasure (Saturday - Crispy Chicken Milanesa + Puree) - 25,000 ₲',
        hamburguesa_olimpo: 'Olimpo Burger (Lean Beef + Egg + Cheese) - 14,000 ₲',
        club_milanesa: 'Club Chicken Milanesa (Triple-Decker Protein Sandwich) - 15,000 ₲',
        sandwich_pollo_repollo: 'Chicken-Cabbage Fit Sandwich (Shredded Chicken Breast) - 10,000 ₲',
        tostados_paraguayos: 'Paraguayan-Italian Fit Toasts (Mozzarella + Ham) - 7,000 ₲'
      }
    }
  };

  function updateCheckoutSelectorTranslations(lang) {
    const data = checkoutTranslations[lang] || checkoutTranslations.es;
    const planSelect = document.getElementById('checkoutPlanSelect');
    if (planSelect) {
      const optgroups = planSelect.querySelectorAll('optgroup');
      if (optgroups.length >= 4) {
        optgroups[0].label = data.optgroups.monthly;
        optgroups[1].label = data.optgroups.weekly;
        optgroups[2].label = data.optgroups.single;
        optgroups[3].label = data.optgroups.none;
      }
      for (const opt of planSelect.options) {
        if (data.plans[opt.value]) {
          opt.textContent = data.plans[opt.value];
        }
      }
    }

    const clubSelect = document.getElementById('checkoutClubChoice');
    if (clubSelect) {
      for (const opt of clubSelect.options) {
        if (data.clubChoices[opt.value]) {
          opt.textContent = data.clubChoices[opt.value];
        }
      }
    }

    const dishSelect = document.getElementById('dishSelect');
    if (dishSelect && data.singleDishes) {
      for (const opt of dishSelect.options) {
        if (data.singleDishes[opt.value]) {
          opt.textContent = data.singleDishes[opt.value];
        }
      }
    }
  }

  function applyLanguage(lang) {
    state.lang = lang;
    localStorage.setItem('olimpo_lang', lang);
    document.documentElement.lang = lang;

    const t = translations[lang] || translations.es;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) {
        el.innerHTML = t[key];
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (t[key] !== undefined) {
        el.placeholder = t[key];
      }
    });

    const langSelect = document.getElementById('langSelect');
    if (langSelect && langSelect.value !== lang) {
      langSelect.value = lang;
    }

    renderWeeklyDishes(lang);
    renderFlyers(lang);
    updateGoalDisplay(lang);
    updateCheckoutSelectorTranslations(lang);
    calculateAffiliateEarnings();
    updatePricingDisplay();
    recalculateCheckoutSummary();
  }

  const langSelect = document.getElementById('langSelect');
  if (langSelect) {
    langSelect.value = state.lang || 'es';
    langSelect.addEventListener('change', (e) => {
      applyLanguage(e.target.value);
    });
  }

  // Initial language application
  applyLanguage(state.lang || 'es');`;

app = app.replace(oldTranslationsBlockRegex, newTranslationsBlock);

fs.writeFileSync('app.js', app, 'utf8');
console.log('Successfully updated app.js with full multilingual system!');
