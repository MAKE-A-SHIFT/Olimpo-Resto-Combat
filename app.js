/**
 * RESTAURANTE & FIGHTING CLUB DE L'OLYMPE (OLIMPO TEAM KICKBOXING - AREGUÁ)
 * Core Interactive Application & CRO Optimization Engine (v3 Production)
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- APPLICATION STATE ---
  const state = {
    lang: localStorage.getItem('olimpo_lang') || 'es',
    selectedCycle: 'mensual', // 'semanal' or 'mensual'
    autoDebitActive: true,
    clubChoice: 'club_monthly', // 'club_monthly', 'club_trial', 'club_already', 'club_none'
    nutritionChoice: 'pack_fighter_pro', // 'pack_fighter_pro', 'pack_1_plato', 'plato_unico', 'none'
    currentDish: 'El Explosivo (Lunes)',
    plateQuantity: 1,
    currentGateway: 'bancard',
    affiliateRef: localStorage.getItem('olimpo_ref') || '',
    activeGoal: 'mantenimiento',
    activeDayFilter: 'all',
    activeStudentCode: localStorage.getItem('olimpo_active_student') || ''
  };

  // --- STUDENT / AMBASSADOR STORAGE HELPERS ---
  function getStudentsDB() {
    try {
      const raw = localStorage.getItem('olimpo_students_v1');
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveStudentsDB(db) {
    try {
      localStorage.setItem('olimpo_students_v1', JSON.stringify(db));
    } catch (e) {
      console.error('Could not save student DB:', e);
    }
  }

  // --- PARSE URL FOR AFFILIATE REF (?ref=... or ?aff=...) ---
  const urlParams = new URLSearchParams(window.location.search);
  const refParam = urlParams.get('ref') || urlParams.get('aff');
  if (refParam) {
    state.affiliateRef = refParam.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    localStorage.setItem('olimpo_ref', state.affiliateRef);

    // Increment click counter in local student DB if not already counted in this session
    const sessionClickKey = 'olimpo_clicked_' + state.affiliateRef;
    if (!sessionStorage.getItem(sessionClickKey)) {
      sessionStorage.setItem(sessionClickKey, '1');
      const db = getStudentsDB();
      if (!db[state.affiliateRef]) {
        db[state.affiliateRef] = {
          code: state.affiliateRef,
          name: state.affiliateRef,
          phone: '',
          pin: '',
          clicks: 1,
          referrals: [],
          paidOut: 0
        };
      } else {
        db[state.affiliateRef].clicks = (db[state.affiliateRef].clicks || 0) + 1;
      }
      saveStudentsDB(db);
    }
  }

  // Display referral banner & prefill checkout referral input if ref is present
  if (state.affiliateRef) {
    const banner = document.getElementById('affiliateBanner');
    const refCodeElem = document.getElementById('bannerRefCode');
    if (banner && refCodeElem) {
      refCodeElem.textContent = state.affiliateRef;
      banner.style.display = 'flex';
    }
    const custRefInput = document.getElementById('custRefCode');
    if (custRefInput && !custRefInput.value) {
      custRefInput.value = state.affiliateRef;
    }
  }

  // Handle direct scroll via ?scroll_to=...
  const scrollToParam = urlParams.get('scroll_to');
  if (scrollToParam) {
    setTimeout(() => {
      const targetEl = document.getElementById(scrollToParam);
      if (targetEl) targetEl.scrollIntoView({ behavior: 'instant', block: 'start' });
    }, 150);
  }

  // --- PRICING DATA (Official Paraguayan Guaraníes - Club 150k PYG) ---
  const pricingData = {
    semanal: {
      plato_unico: { price: 25000, perMeal: 25000, name: 'Plato Único del Día', meals: '1 comida' },
      pack_1_plato: { price: 140000, perMeal: 23333, name: 'Pack Semanal (1 Plato/Día)', meals: '6 comidas' },
      pack_fighter_pro: { price: 260000, perMeal: 21666, name: 'Pack Semanal Fighter Pro (2 Platos/Día)', meals: '12 comidas' },
      club_kickboxing: { price: 50000, perMeal: 8333, name: 'Pase Semanal Club Kickboxing & Boxe', meals: '6 días' },
      combo_elite: { price: 300000, perMeal: 16666, name: 'Combo Semanal Fighter Elite (Club + 2 Platos/Día)', meals: 'Total' }
    },
    mensual: {
      plato_unico: { price: 25000, perMeal: 25000, name: 'Plato Único del Día', meals: '1 comida' },
      pack_1_plato: { price: 500000, perMeal: 20833, name: 'Abono Mensual (1 Plato/Día)', meals: 'Mes completo (Lun a Sáb)' },
      pack_fighter_pro: { price: 950000, perMeal: 19791, name: 'Abono Mensual Fighter Pro (2 Platos/Día)', meals: 'Mes completo (2 platos/día)' },
      club_kickboxing: { price: 150000, perMeal: 6250, name: 'Membresía Mensual Club Libre (150k PYG)', meals: 'Mes completo' },
      combo_elite: { price: 1100000, perMeal: 16500, name: 'Combo Mensual Fighter Elite (Club + 2 Platos/Día)', meals: 'Total' }
    }
  };

  // --- DISHES LIST FOR SELECTOR ---
  const availableDishesList = [
    { id: 'lunes_explosivo', name: 'El Explosivo (Lunes - Pollo Grillado + Arroz + Ensalada)', price: 25000 },
    { id: 'martes_sparring', name: 'El Sparring (Martes - Wok Fideos + Tiras de Carne)', price: 25000 },
    { id: 'miercoles_stroganoff', name: 'El Clásico Potencia (Miércoles - Stroganoff de Carne/Pollo)', price: 25000 },
    { id: 'jueves_dubai', name: 'Especial Dubaï (Jueves - Tataki de Lomo Sellado)', price: 25000 },
    { id: 'viernes_guiso', name: 'Guiso del Peleador (Viernes - Guiso Pollo + Fideos)', price: 25000 },
    { id: 'sabado_milanesa', name: 'El Placer Atlético (Sábado - Milanesa Pollo + Puré Casero)', price: 25000 },
    { id: 'hamburguesa_olimpo', name: 'Hamburguesa Olimpo (Carne + Huevo + Queso)', price: 14000 },
    { id: 'club_milanesa', name: 'Club Pollo Milanesa (Triple Piso Proteico)', price: 15000 },
    { id: 'sandwich_pollo_repollo', name: 'Sándwich Pollo-Repollo (Pollo Desmenuzado)', price: 10000 },
    { id: 'tostados_paraguayos', name: 'Tostados Paraguayos-Italianos (Mozzarella + Jamón)', price: 7000 }
  ];

  // --- PHYSICAL GOALS DATA (MULTILINGUAL) ---
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
        strategy: 'Protection musculaire maximale avec acides aminés et glucides ciblés post-entraînement pour brûler le gras tout en préservant l\'explosivité.',
        prot: '200 - 220g',
        carbs: '75g crus (185g cuit)',
        veg: '250g (Wok / Crudités)'
      },
      mantenimiento: {
        title: '3. Maintien Athlétique (Règle d\'Or)',
        strategy: 'Équilibre métabolique exact du Complexe Olimpo : 1/3 Protéines, 1/3 Glucides propres et 1/3 Fibres & Fruit frais pour une endurance et vitalité constantes.',
        prot: '200g (1/3 de l\'Assiette)',
        carbs: '100g crus (250g cuit)',
        veg: '200 - 250g + 1 Fruit frais'
      },
      ganancia_masa: {
        title: '4. Prise de Masse Musculaire Propre',
        strategy: 'Surplus glucidique sain et haute densité d\'acides aminés pour bâtir de la fibre musculaire dense et générer une puissance destructrice sur le ring.',
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
        desc: 'Pâtes sautées avec tendres lamelles de bœuf maigre 180g, brocoli croquant, carottes et poivrons dans une sauce légère au sésame, accompagnés d\'une pomme rouge croquante.',
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
        desc: 'Tataki de filet de bœuf 200g saisi vif au cœur tendre rosé, riz blanc vapeur, cubes d\'ananas rôtis, carottes glacées, haricots verts sautés et radis croquants.',
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
        btnPdf: '📄 Ver el menú'
      },
      {
        id: 2,
        side: 'Verso',
        tag: 'Página 2 • Verso',
        title: 'Comida Rápida, Bebidas & Academia de Combate',
        desc: 'Línea de street-food proteico para ganancia muscular, bebidas funcionales de recuperación, horarios de cocina y sala de entrenamiento en Av. Las Residentas, Areguá.',
        preview: 'stories/assets/flyer_verso_preview.png',
        btnZoom: '🔍 Zoom Vista Previa',
        btnPdf: '📄 Ver el menú'
      }
    ],
    fr: [
      {
        id: 1,
        side: 'Recto',
        tag: 'Page 1 • Recto',
        title: 'Menu de la Semaine & Packs d\'Abonnement',
        desc: 'Les 6 déjeuners complets (Lundi au Samedi), la règle d\'or 1/3 et la grille officielle des packs hebdomadaires et mensuels avec remise débit automatique Bancard (-5%).',
        preview: 'stories/assets/flyer_recto_preview.png',
        btnZoom: '🔍 Aperçu Zoom',
        btnPdf: '📄 Voir le menu'
      },
      {
        id: 2,
        side: 'Verso',
        tag: 'Page 2 • Verso',
        title: 'Street-Food, Boissons & Salle de Combat',
        desc: 'Ligne de street-food protéinée pour la prise musculaire, boissons de récupération, horaires de cuisine et de cours de combat à Av. Las Residentas, Areguá.',
        preview: 'stories/assets/flyer_verso_preview.png',
        btnZoom: '🔍 Aperçu Zoom',
        btnPdf: '📄 Voir le menu'
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
        btnPdf: '📄 View the menu'
      },
      {
        id: 2,
        side: 'Back',
        tag: 'Page 2 • Back',
        title: 'Street-Food, Drinks & Combat Gym',
        desc: 'High-protein street-food line for lean mass gain, recovery beverages, kitchen operating hours, and combat training facility on Av. Las Residentas, Areguá.',
        preview: 'stories/assets/flyer_verso_preview.png',
        btnZoom: '🔍 Zoom Preview',
        btnPdf: '📄 View the menu'
      }
    ]
  };

  // --- PHYSICAL GOALS DISPLAY & INTERACTIVE TABS ---
  const goalButtons = document.querySelectorAll('.btn-goal-tab');
  const goalTitleElem = document.getElementById('goalTitle');
  const goalStrategyElem = document.getElementById('goalStrategy');
  const macroProtElem = document.getElementById('macroProt');
  const macroCarbsElem = document.getElementById('macroCarbs');
  const macroVegElem = document.getElementById('macroVeg');
  const goalDetailBox = document.getElementById('goalDetailBox');

  function updateGoalDisplay(lang) {
    const currentLang = lang || state.lang || 'es';
    const langGoals = goalsDataMultilingual[currentLang] || goalsDataMultilingual.es;
    const g = langGoals[state.activeGoal] || langGoals.mantenimiento;
    if (!g) return;
    if (goalTitleElem) goalTitleElem.textContent = g.title;
    if (goalStrategyElem) goalStrategyElem.textContent = g.strategy;
    if (macroProtElem) macroProtElem.textContent = g.prot;
    if (macroCarbsElem) macroCarbsElem.textContent = g.carbs;
    if (macroVegElem) macroVegElem.textContent = g.veg;
  }

  goalButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      goalButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const goalKey = btn.getAttribute('data-goal');
      if (goalKey) {
        state.activeGoal = goalKey;
        if (goalDetailBox) {
          goalDetailBox.style.opacity = '0.5';
          setTimeout(() => {
            goalDetailBox.style.opacity = '1';
          }, 120);
        }
        updateGoalDisplay(state.lang);
      }
    });
  });

  // --- FILTER DISHES BY DAY ---
  function filterDishesByDay(selectedDay) {
    state.activeDayFilter = selectedDay || 'all';
    const allCards = document.querySelectorAll('.dish-card');
    allCards.forEach(card => {
      if (state.activeDayFilter === 'all' || card.getAttribute('data-day') === state.activeDayFilter) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  const menuDayTabs = document.querySelectorAll('.btn-menu-tab');
  menuDayTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      menuDayTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const selectedDay = tab.getAttribute('data-filter') || 'all';
      filterDishesByDay(selectedDay);
    });
  });

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

    dishesGrid.innerHTML = dishes.map((dish, idx) => `
      <div class="dish-card" data-day="${weeklyDishesData.es[idx].day}">
        <div class="card-lisere-top"></div>
        <div class="dish-img-wrap">
          <img src="${dish.img}" alt="${dish.name}" loading="lazy">
          <span class="dish-day-badge">${dish.day}</span>
        </div>
        <div class="dish-body">
          <h3 class="dish-title">${dish.name}</h3>
          <div class="dish-sub">${dish.sub}</div>
          <p class="dish-desc">${dish.desc}</p>
          <div class="dish-macros">
            <div class="macro-item"><span>${macroLabels.prot}</span> <strong>${dish.protein}</strong></div>
            <div class="macro-item"><span>${macroLabels.gluc}</span> <strong>${dish.carbs}</strong></div>
            <div class="macro-item"><span>${macroLabels.lip}</span> <strong>${dish.fats}</strong></div>
            <div class="macro-item"><span>${macroLabels.cal}</span> <strong>${dish.cal}</strong></div>
          </div>
          <div class="dish-footer">
            <span class="dish-price-val">25.000 ₲</span>
            <button class="btn-dish-order" onclick="window.openCheckout('plato_unico', '${weeklyDishesData.es[idx].name}')">
              ${dish.btnText}
            </button>
          </div>
        </div>
      </div>
    `).join('');

    filterDishesByDay(state.activeDayFilter);
  }

  // --- RENDER FLYERS (MULTILINGUAL) ---
  function renderFlyers(lang) {
    const flyersGrid = document.getElementById('flyersGrid');
    if (!flyersGrid) return;
    const currentLang = lang || state.lang || 'es';
    const items = flyersDataMultilingual[currentLang] || flyersDataMultilingual.es;
    flyersGrid.innerHTML = items.map(flyer => `
      <div class="flyer-thumb-card">
        <div class="card-lisere-top"></div>
        <div class="flyer-img-container" onclick="window.openFlyerLightbox('${flyer.preview}', '${flyer.title}')">
          <img src="${flyer.preview}" alt="${flyer.title}" class="flyer-thumb-img" loading="lazy">
          <span class="flyer-side-badge">${flyer.tag}</span>
        </div>
        <div class="flyer-meta-bar">
          <div class="flyer-title">${flyer.title}</div>
          <p class="flyer-desc-text">${flyer.desc}</p>
          <div class="flyer-actions">
            <button type="button" class="btn-flyer-zoom" onclick="window.openFlyerLightbox('${flyer.preview}', '${flyer.title}')">
              ${flyer.btnZoom}
            </button>
            <a href="stories/assets/Menu_Oficial_Restaurante_del_Olimpo.pdf" target="_blank" rel="noopener noreferrer" class="btn-flyer-zoom btn-flyer-pdf">
              ${flyer.btnPdf}
            </a>
          </div>
        </div>
      </div>
    `).join('');
  }

  // --- PRICING TABLE CYCLE TOGGLE (SEMANAL vs MENSUAL) & DISPLAY ---
  const cycleToggles = document.querySelectorAll('.btn-cycle-toggle');
  cycleToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      cycleToggles.forEach(t => t.classList.remove('active'));
      toggle.classList.add('active');
      state.selectedCycle = toggle.getAttribute('data-cycle') || 'mensual';
      updatePricingDisplay();
    });
  });

  function updatePricingDisplay() {
    const currentData = pricingData[state.selectedCycle] || pricingData.mensual;
    const isDiscounted = state.autoDebitActive;
    const lang = state.lang || 'es';

    const priceUnitLabels = {
      es: { sem: '/sem', mes: '/mes', save: 'Ahorrás', perPlate: '/ plato', clubFree: 'Acceso Libre Ilimitado', comboSub: 'Club Ilimitado + 2 Platos/Día' },
      fr: { sem: '/sem', mes: '/mois', save: 'Économise', perPlate: '/ plat', clubFree: 'Accès Libre Illimité', comboSub: 'Club Illimité + 2 Plats/Jour' },
      en: { sem: '/wk', mes: '/mo', save: 'Save', perPlate: '/ meal', clubFree: 'Unlimited Gym Access', comboSub: 'Unlimited Club + 2 Meals/Day' }
    }[lang] || { sem: '/sem', mes: '/mes', save: 'Ahorrás', perPlate: '/ plato', clubFree: 'Acceso Libre Ilimitado', comboSub: 'Club Ilimitado + 2 Platos/Día' };

    const periodUnit = state.selectedCycle === 'semanal' ? priceUnitLabels.sem : priceUnitLabels.mes;

    ['pack_1_plato', 'pack_fighter_pro', 'club_kickboxing', 'combo_elite'].forEach(key => {
      const plan = currentData[key];
      if (!plan) return;

      const basePrice = plan.price;
      const finalPrice = isDiscounted ? Math.round(basePrice * 0.95) : basePrice;
      const savedAmount = basePrice - finalPrice;
      const perMealFinal = isDiscounted ? Math.round(plan.perMeal * 0.95) : plan.perMeal;

      const priceElem = document.getElementById(`price_${key}`);
      const strikeWrap = document.getElementById(`strikeWrap_${key}`);
      const perMealElem = document.getElementById(`perMeal_${key}`);

      if (priceElem) {
        priceElem.innerHTML = `${finalPrice.toLocaleString('es-PY')} ₲ <span>${periodUnit}</span>`;
      }
      if (strikeWrap) {
        if (isDiscounted) {
          strikeWrap.style.display = 'flex';
          strikeWrap.innerHTML = `
            <span class="old-price-line">${basePrice.toLocaleString('es-PY')} ₲</span>
            <span class="discount-save-pill">${priceUnitLabels.save} ${savedAmount.toLocaleString('es-PY')} ₲</span>
          `;
        } else {
          strikeWrap.style.display = 'none';
        }
      }
      if (perMealElem) {
        if (key === 'club_kickboxing') {
          perMealElem.textContent = priceUnitLabels.clubFree;
        } else if (key === 'combo_elite') {
          perMealElem.textContent = priceUnitLabels.comboSub;
        } else {
          perMealElem.textContent = `${perMealFinal.toLocaleString('es-PY')} ₲ ${priceUnitLabels.perPlate}`;
        }
      }
    });
  }

  // Initial renders
  renderWeeklyDishes(state.lang || 'es');
  renderFlyers(state.lang || 'es');
  updateGoalDisplay(state.lang || 'es');

  // Initial pricing update
  updatePricingDisplay();

  // --- INTERACTIVE AFFILIATE COMMISSION CALCULATOR ---
  const sliderMeals = document.getElementById('sliderMeals');
  const sliderClub = document.getElementById('sliderClub');
  const valMeals = document.getElementById('valMeals');
  const valClub = document.getElementById('valClub');
  const totalEarningsElem = document.getElementById('calcTotalEarnings');

  function calculateAffiliateEarnings() {
    if (!sliderMeals || !sliderClub) return;
    const mealsCount = parseInt(sliderMeals.value, 10);
    const clubCount = parseInt(sliderClub.value, 10);

    const peopleWord = {
      es: 'personas',
      fr: 'personnes',
      en: 'people'
    }[state.lang || 'es'] || 'personas';

    if (valMeals) valMeals.textContent = `${mealsCount} ${peopleWord}`;
    if (valClub) valClub.textContent = `${clubCount} ${peopleWord}`;

    // 10% on meal subscription (~50.000 ₲ / month / user)
    // 15% on club membership (15% of 150.000 = 22.500 ₲ / month / user)
    const mealIncome = mealsCount * 50000;
    const clubIncome = clubCount * 22500;
    const total = mealIncome + clubIncome;

    if (totalEarningsElem) {
      totalEarningsElem.textContent = `${total.toLocaleString('es-PY')} ₲`;
    }
  }

  if (sliderMeals && sliderClub) {
    sliderMeals.addEventListener('input', calculateAffiliateEarnings);
    sliderClub.addEventListener('input', calculateAffiliateEarnings);
    calculateAffiliateEarnings();
  }

  // --- FUNCTIONAL STUDENT & AMBASSADOR SPACE (#studentPortal) ---
  const studentAuthBox = document.getElementById('studentAuthBox');
  const studentDashboardBox = document.getElementById('studentDashboardBox');
  const aliasInput = document.getElementById('affAliasInput');
  const stuPhoneInput = document.getElementById('stuPhoneInput');
  const stuPinInput = document.getElementById('stuPinInput');
  const btnGenLink = document.getElementById('btnGenLink');
  const btnStudentLogout = document.getElementById('btnStudentLogout');

  const stuProfileName = document.getElementById('stuProfileName');
  const stuProfilePhone = document.getElementById('stuProfilePhone');
  const stuCodeBadge = document.getElementById('stuCodeBadge');
  const genLinkText = document.getElementById('genLinkText');
  const btnCopyLink = document.getElementById('btnCopyLink');
  const btnShareWa = document.getElementById('btnShareWa');

  const stuClicksVal = document.getElementById('stuClicksVal');
  const stuSignupsVal = document.getElementById('stuSignupsVal');
  const stuTotalEarnVal = document.getElementById('stuTotalEarnVal');
  const stuBalanceVal = document.getElementById('stuBalanceVal');

  const refFriendNameInput = document.getElementById('refFriendName');
  const refFriendPlanSelect = document.getElementById('refFriendPlan');
  const btnAddReferral = document.getElementById('btnAddReferral');
  const studentHistoryList = document.getElementById('studentHistoryList');

  const referralPlanConfig = {
    club_150k: {
      commission: 22500,
      label: { es: 'Membresía Club (150k)', fr: 'Abonnement Club (150k)', en: 'Club Membership (150k)' }
    },
    pack_1_mensual: {
      commission: 50000,
      label: { es: 'Pack 1 Plato/Día Mensual', fr: 'Pack 1 Plat/Jour Mensuel', en: 'Monthly 1 Meal/Day Pack' }
    },
    fighter_pro_mensual: {
      commission: 95000,
      label: { es: 'Pack Fighter Pro Mensual', fr: 'Pack Fighter Pro Mensuel', en: 'Monthly Fighter Pro Pack' }
    },
    combo_elite_mensual: {
      commission: 117500,
      label: { es: 'Combo Fighter Elite', fr: 'Combo Fighter Elite', en: 'Fighter Elite Combo' }
    },
    pack_semanal: {
      commission: 20000,
      label: { es: 'Pack Semanal', fr: 'Pack Semaine', en: 'Weekly Pack' }
    }
  };

  function getCurrentRewardMonth() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  // Automatic End-of-Month Profit Expiration Engine:
  // If a new calendar month starts and the member did not withdraw their profits at the end of the previous month,
  // unwithdrawn profits are automatically deleted/reset to 0 ₲ and the member must wait until the end of the new month.
  function checkAndApplyMonthlyProfitExpiration(student, db) {
    if (!student) return;
    const currentMonth = getCurrentRewardMonth();
    if (!student.rewardMonth) {
      student.rewardMonth = currentMonth;
      saveStudentsDB(db);
      return;
    }
    if (student.rewardMonth < currentMonth) {
      const refs = Array.isArray(student.referrals) ? student.referrals : [];
      const totalEarn = refs.reduce((acc, r) => acc + (r.commission || 0), 0);
      const unwithdrawn = Math.max(0, totalEarn - (student.paidOut || 0));
      if (unwithdrawn > 0) {
        student.expiredLastMonth = unwithdrawn;
        student.expiredMonthName = student.rewardMonth;
      }
      // Reset profits for the new month
      student.referrals = [];
      student.paidOut = 0;
      student.rewardMonth = currentMonth;
      saveStudentsDB(db);
      if (window.OlimpoFirebase) {
        window.OlimpoFirebase.syncMemberToCloud(student);
      }
    }
  }

  function renderStudentPortal() {
    const db = getStudentsDB();
    const activeCode = state.activeStudentCode;
    const student = activeCode && db[activeCode] ? db[activeCode] : null;
    const lang = state.lang || 'es';

    if (student) {
      checkAndApplyMonthlyProfitExpiration(student, db);
    }

    // 1. Update Navbar "JOIN" Buttons (Desktop Top-Left & Mobile Burger Replacement)
    // When logged out -> "JOIN" button
    // When logged in  -> Circular Profile Icon button (.logged-in)
    const btnJoinDesktop = document.getElementById('btnNavJoinDesktop');
    const btnJoinMobile = document.getElementById('btnNavJoinMobile');
    const txtJoinDesktop = document.getElementById('navJoinTextDesktop');
    const txtJoinMobile = document.getElementById('navJoinTextMobile');

    if (student) {
      if (btnJoinDesktop) {
        btnJoinDesktop.classList.add('logged-in');
        btnJoinDesktop.title = student.email || student.name || student.code;
      }
      if (btnJoinMobile) {
        btnJoinMobile.classList.add('logged-in');
        btnJoinMobile.title = student.email || student.name || student.code;
      }

      // Pre-fill Checkout Customer Name & Phone automatically when logged in
      const custNameEl = document.getElementById('custName');
      const custPhoneEl = document.getElementById('custPhone');
      if (custNameEl && !custNameEl.value && student.name) custNameEl.value = student.name;
      if (custPhoneEl && !custPhoneEl.value && student.phone) custPhoneEl.value = student.phone;
    } else {
      if (btnJoinDesktop) {
        btnJoinDesktop.classList.remove('logged-in');
        btnJoinDesktop.title = 'JOIN';
      }
      if (btnJoinMobile) {
        btnJoinMobile.classList.remove('logged-in');
        btnJoinMobile.title = 'JOIN';
      }
      if (txtJoinDesktop) txtJoinDesktop.textContent = 'JOIN';
      if (txtJoinMobile) txtJoinMobile.textContent = 'JOIN';
    }

    const baseUrl = window.location.origin + window.location.pathname;
    const link = student ? `${baseUrl}?ref=${student.code}` : `${baseUrl}?ref=OLIMPO`;
    const refs = student && Array.isArray(student.referrals) ? student.referrals : [];
    const totalEarn = refs.reduce((acc, r) => acc + (r.commission || 0), 0);
    const balance = Math.max(0, totalEarn - (student ? (student.paidOut || 0) : 0));

    const emptyMsg = {
      es: 'Aún no tenés afiliados registrados este mes. ¡Compartí tu enlace personal arriba!',
      fr: 'Aucun affilié enregistré ce mois-ci. Partage ton lien personnel ci-dessus !',
      en: 'No affiliates registered this month yet. Share your personal link above!'
    }[lang] || 'Aucun affilié enregistré.';

    const historyHtml = refs.length === 0
      ? `<div style="font-size: 12.5px; color: var(--text-dim); padding: 8px 4px;">${emptyMsg}</div>`
      : refs.map(r => {
          const planObj = referralPlanConfig[r.planKey];
          const planName = planObj ? (planObj.label[lang] || planObj.label.es) : r.planKey;
          return `
            <div class="student-history-item">
              <div>
                <strong>👤 ${r.friendName}</strong>
                <span style="color: var(--text-dim); margin-left: 8px;">• ${planName} (${r.date || ''})</span>
              </div>
              <div class="student-history-comm">+${(r.commission || 0).toLocaleString('es-PY')} ₲</div>
            </div>
          `;
        }).join('');

    // Calculate End-of-Month Withdrawal Window Status
    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();
    const daysLeft = Math.max(0, lastDayOfMonth - currentDay);
    const isWindowOpen = currentDay >= 25;

    const statusBadgeText = {
      es: isWindowOpen
        ? `🟢 Ventana de retiro ABIERTA (${daysLeft} días restantes antes del borrado)`
        : `⏳ Fin de mes en ${daysLeft} días (Retiro del 25 al ${lastDayOfMonth})`,
      fr: isWindowOpen
        ? `🟢 Retrait de fin de mois OUVERT (${daysLeft}j restants avant suppression)`
        : `⏳ Fin du mois dans ${daysLeft} jours (Retrait du 25 au ${lastDayOfMonth})`,
      en: isWindowOpen
        ? `🟢 Month-End Withdrawal OPEN (${daysLeft} days left before reset)`
        : `⏳ Month-end in ${daysLeft} days (Withdraw from 25th to ${lastDayOfMonth}th)`
    }[lang];

    // 2. Update Pop-up Member Modal (#memberAuthModal)
    const memAuthView = document.getElementById('memAuthView');
    const memDashboardView = document.getElementById('memDashboardView');
    if (memAuthView && memDashboardView) {
      if (student) {
        memAuthView.style.display = 'none';
        memDashboardView.style.display = 'block';
        const memDashName = document.getElementById('memDashName');
        const memDashMeta = document.getElementById('memDashMeta');
        const memDashCode = document.getElementById('memDashCode');
        const memDashLinkText = document.getElementById('memDashLinkText');
        const memKpiClicks = document.getElementById('memKpiClicks');
        const memKpiSignups = document.getElementById('memKpiSignups');
        const memKpiTotalEarn = document.getElementById('memKpiTotalEarn');
        const memKpiBalance = document.getElementById('memKpiBalance');
        const memModalHistoryList = document.getElementById('memModalHistoryList');
        const memMonthEndStatusBadge = document.getElementById('memMonthEndStatusBadge');
        const memExpiredAlert = document.getElementById('memExpiredAlert');

        if (memDashName) memDashName.textContent = student.email || student.name || student.code;
        if (memDashMeta) {
          const parts = [];
          if (student.email) parts.push(`✉️ ${student.email}`);
          if (student.phone) parts.push(`📱 ${student.phone}`);
          memDashMeta.textContent = parts.join('  •  ');
        }
        if (memDashCode) memDashCode.textContent = student.code;
        if (memDashLinkText) memDashLinkText.textContent = link;
        if (memKpiClicks) memKpiClicks.textContent = String(student.clicks || 0);
        if (memKpiSignups) memKpiSignups.textContent = String(refs.length);
        if (memKpiTotalEarn) memKpiTotalEarn.textContent = `${totalEarn.toLocaleString('es-PY')} ₲`;
        if (memKpiBalance) memKpiBalance.textContent = `${balance.toLocaleString('es-PY')} ₲`;
        if (memModalHistoryList) memModalHistoryList.innerHTML = historyHtml;
        if (memMonthEndStatusBadge) memMonthEndStatusBadge.textContent = statusBadgeText;

        if (memExpiredAlert) {
          if (student.expiredLastMonth && student.expiredLastMonth > 0) {
            const expStr = student.expiredLastMonth.toLocaleString('es-PY');
            memExpiredAlert.style.display = 'block';
            memExpiredAlert.textContent = {
              es: `⚠️ Tus ganancias no retiradas del mes pasado (${expStr} ₲) fueron eliminadas automáticamente. Deberás esperar a fin de este mes para retirar tus nuevos beneficios.`,
              fr: `⚠️ Tes profits non retirés du mois dernier (${expStr} ₲) ont été supprimés automatiquement. Tu dois attendre la fin de ce mois pour retirer tes nouveaux gains.`,
              en: `⚠️ Your unwithdrawn profits from last month (${expStr} ₲) were automatically deleted. You must wait until the end of this month to withdraw new profits.`
            }[lang];
          } else {
            memExpiredAlert.style.display = 'none';
          }
        }
      } else {
        memAuthView.style.display = 'block';
        memDashboardView.style.display = 'none';
      }
    }

    // 3. Update Section 6 On-Page Student Portal (#studentPortal)
    if (!studentAuthBox || !studentDashboardBox) return;
    if (!student) {
      studentAuthBox.style.display = 'block';
      studentDashboardBox.style.display = 'none';
      return;
    }

    studentAuthBox.style.display = 'none';
    studentDashboardBox.style.display = 'block';

    if (stuProfileName) stuProfileName.textContent = student.email || student.name || student.code;
    if (stuProfilePhone) stuProfilePhone.textContent = student.phone ? `• ${student.phone}` : '';
    if (stuCodeBadge) stuCodeBadge.textContent = student.code;
    if (genLinkText) genLinkText.textContent = link;

    if (stuClicksVal) stuClicksVal.textContent = String(student.clicks || 0);
    if (stuSignupsVal) stuSignupsVal.textContent = String(refs.length);
    if (stuTotalEarnVal) stuTotalEarnVal.textContent = `${totalEarn.toLocaleString('es-PY')} ₲`;
    if (stuBalanceVal) stuBalanceVal.textContent = `${balance.toLocaleString('es-PY')} ₲`;
    if (studentHistoryList) studentHistoryList.innerHTML = historyHtml;
  }

  // --- HELPER: ACTIVATE & SYNC LOGGED-IN MEMBER ---
  function activateMemberSession(memberObj) {
    if (!memberObj || !memberObj.code) return;
    const db = getStudentsDB();
    const currentMonth = getCurrentRewardMonth();
    db[memberObj.code] = {
      rewardMonth: currentMonth,
      ...(db[memberObj.code] || {}),
      ...memberObj
    };
    saveStudentsDB(db);
    state.activeStudentCode = memberObj.code;
    localStorage.setItem('olimpo_active_student', memberObj.code);

    renderStudentPortal();
    if (window.OlimpoFirebase) {
      window.OlimpoFirebase.syncMemberToCloud(db[memberObj.code]);
      window.OlimpoFirebase.subscribeToMember(memberObj.code);
    }
  }

  // --- POP-UP MEMBER AUTH MODAL (3D FLIP CARD & MEMBER SPACE) ---
  const memberAuthModal = document.getElementById('memberAuthModal');

  window.flipMemberAuthCard = function(toSignup) {
    const flipCard = document.getElementById('memFlipCard');
    if (!flipCard) return;
    if (toSignup) {
      flipCard.classList.add('is-flipped');
    } else {
      flipCard.classList.remove('is-flipped');
    }
  };

  window.switchMemberAuthTab = function(tab) {
    window.flipMemberAuthCard(tab === 'signup');
  };

  window.openMemberModal = function(defaultTab = 'login') {
    if (!memberAuthModal) return;
    if (!state.activeStudentCode) {
      window.flipMemberAuthCard(defaultTab === 'signup');
    }
    renderStudentPortal();
    memberAuthModal.classList.add('open');
  };

  window.closeMemberModal = function() {
    if (memberAuthModal) memberAuthModal.classList.remove('open');
  };

  if (memberAuthModal) {
    memberAuthModal.addEventListener('click', (e) => {
      if (e.target === memberAuthModal || e.target.classList.contains('mem-flip-scene')) {
        window.closeMemberModal();
      }
    });
  }

  // --- LOGIN FORM SUBMISSION (FRONT OF 3D CARD: #memLoginForm) ---
  const memLoginForm = document.getElementById('memLoginForm');
  if (memLoginForm) {
    memLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const lang = state.lang || 'es';
      const idInput = document.getElementById('loginIdentifier');
      const passInput = document.getElementById('loginPassword');
      const rawId = idInput ? idInput.value.trim() : '';
      const rawPass = passInput ? passInput.value.trim() : '';
      if (!rawId || !rawPass) return;

      const cleanCode = (rawId.includes('@') ? rawId.split('@')[0] : rawId).toUpperCase().replace(/[^A-Z0-9_-]/g, '');
      const db = getStudentsDB();
      let foundMember = null;

      // 1. Try Firebase Cloud Auth + Firestore lookup if connected
      if (window.OlimpoFirebase && window.OlimpoFirebase.isCloudConnected) {
        if (rawId.includes('@')) {
          await window.OlimpoFirebase.loginEmailAuth(rawId, rawPass);
        }
        foundMember = await window.OlimpoFirebase.fetchMemberFromCloud(rawId);
      }

      // 2. Try local DB lookup by code, email, or name
      if (!foundMember) {
        if (db[cleanCode]) {
          foundMember = db[cleanCode];
        } else {
          const allMembers = Object.values(db);
          foundMember = allMembers.find(m =>
            (m.email && m.email.toLowerCase() === rawId.toLowerCase()) ||
            (m.name && m.name.toLowerCase() === rawId.toLowerCase()) ||
            (m.code && m.code.toLowerCase() === rawId.toLowerCase())
          );
        }
      }

      if (foundMember) {
        if (foundMember.pin && foundMember.pin !== rawPass) {
          const errMsg = {
            es: '⚠️ Contraseña incorrecta.',
            fr: '⚠️ Mot de passe incorrect.',
            en: '⚠️ Incorrect password.'
          }[lang];
          showToast(errMsg);
          return;
        }
        activateMemberSession(foundMember);
        const welcomeMsg = {
          es: `✓ ¡Conectado como ${foundMember.email || foundMember.name}!`,
          fr: `✓ Connecté à ton espace membre (${foundMember.email || foundMember.name}) !`,
          en: `✓ Logged in as ${foundMember.email || foundMember.name}!`
        }[lang];
        showToast(welcomeMsg);
      } else {
        const newCode = cleanCode || 'MEMBRE';
        const newMember = {
          code: newCode,
          name: rawId.includes('@') ? rawId.split('@')[0].toUpperCase() : rawId,
          email: rawId.includes('@') ? rawId.toLowerCase() : '',
          phone: '',
          pin: rawPass,
          clicks: 1,
          referrals: [],
          paidOut: 0,
          rewardMonth: getCurrentRewardMonth()
        };
        activateMemberSession(newMember);
        const createdMsg = {
          es: `✓ ¡Conectado a tu Espacio Miembro (Código: ${newCode})!`,
          fr: `✓ Connecté à ton Espace Membre (Code : ${newCode}) !`,
          en: `✓ Logged in to your Member Space (Code: ${newCode})!`
        }[lang];
        showToast(createdMsg);
      }
    });
  }

  // --- SIGNUP FORM SUBMISSION (BACK OF 3D CARD: #memSignupForm) ---
  const memSignupForm = document.getElementById('memSignupForm');
  if (memSignupForm) {
    memSignupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const lang = state.lang || 'es';
      const emailVal = document.getElementById('regEmail')?.value.trim().toLowerCase() || '';
      const passVal = document.getElementById('regPassword')?.value.trim() || '';
      const passConfirmVal = document.getElementById('regPasswordConfirm')?.value.trim() || '';

      if (!emailVal || !passVal) return;

      if (passVal !== passConfirmVal) {
        const mismatchMsg = {
          es: '⚠️ Las contraseñas no coinciden. Verificalas.',
          fr: '⚠️ Les mots de passe ne correspondent pas.',
          en: '⚠️ Passwords do not match.'
        }[lang];
        showToast(mismatchMsg);
        document.getElementById('regPasswordConfirm')?.focus();
        return;
      }

      const prefix = emailVal.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '') || 'OLIMPO';
      const cleanCode = prefix.slice(0, 12);

      if (window.OlimpoFirebase && window.OlimpoFirebase.isCloudConnected) {
        await window.OlimpoFirebase.registerEmailAuth(emailVal, passVal);
      }

      const refByVal = (state.affiliateRef || '').toUpperCase().replace(/[^A-Z0-9_-]/g, '');
      const newMember = {
        code: cleanCode,
        name: prefix,
        email: emailVal,
        phone: '',
        pin: passVal,
        referredBy: refByVal,
        clicks: 1,
        referrals: [],
        paidOut: 0,
        rewardMonth: getCurrentRewardMonth(),
        createdAt: new Date().toISOString()
      };

      // Credit referrer if user signed up via an affiliate link (?ref=CODE)
      if (refByVal && refByVal !== cleanCode) {
        const db = getStudentsDB();
        if (!db[refByVal]) {
          db[refByVal] = { code: refByVal, name: refByVal, phone: '', pin: '', clicks: 1, referrals: [], paidOut: 0, rewardMonth: getCurrentRewardMonth() };
        }
        db[refByVal].referrals = db[refByVal].referrals || [];
        db[refByVal].referrals.unshift({
          friendName: emailVal,
          planKey: 'club_150k',
          commission: 22500,
          date: new Date().toLocaleDateString('es-PY')
        });
        saveStudentsDB(db);
        if (window.OlimpoFirebase) {
          window.OlimpoFirebase.syncMemberToCloud(db[refByVal]);
        }
      }

      activateMemberSession(newMember);

      const okMsg = {
        es: `🎉 ¡Cuenta creada! Tu icono de perfil y tu espacio miembro están activos (Código: ${cleanCode})`,
        fr: `🎉 Compte créé ! Ton icône de profil et ton espace membre sont actifs (Code : ${cleanCode})`,
        en: `🎉 Account created! Your profile icon and member space are active (Code: ${cleanCode})`
      }[lang];
      showToast(okMsg);
    });
  }

  window.logoutMemberAccount = function() {
    state.activeStudentCode = '';
    localStorage.removeItem('olimpo_active_student');
    window.flipMemberAuthCard(false);
    renderStudentPortal();
    const lang = state.lang || 'es';
    const msg = {
      es: 'Sesión cerrada correctamente.',
      fr: 'Session déconnectée avec succès.',
      en: 'Logged out successfully.'
    }[lang];
    showToast(msg);
  };

  window.copyMemberReferralLink = function() {
    const el = document.getElementById('memDashLinkText');
    if (!el) return;
    const text = el.textContent;
    const lang = state.lang || 'es';
    const copiedMsg = {
      es: '✓ ¡Enlace copiado al portapapeles!',
      fr: '✓ Lien copié dans le presse-papiers !',
      en: '✓ Link copied to clipboard!'
    }[lang];
    navigator.clipboard.writeText(text).then(() => showToast(copiedMsg)).catch(() => showToast(copiedMsg));
  };

  window.shareMemberReferralWa = function() {
    const el = document.getElementById('memDashLinkText');
    const link = el ? el.textContent : window.location.href;
    const lang = state.lang || 'es';
    const shareTexts = {
      es: `🥊 ¡Hola! Te invito a entrenar en Olimpo Team Kickboxing & Boxeo (Areguá) y a comer saludable en el restaurante del club.\nSumate con mi enlace oficial de embajador:\n👉 ${link}\n¡Nos vemos en el ring!`,
      fr: `🥊 Salut ! Je t'invite à t'entraîner au club Olimpo Team Kickboxing & Boxe (Areguá) et à manger sainement au restaurant du club.\nRejoins-nous via mon lien ambassadeur :\n👉 ${link}\nÀ très vite sur le ring !`,
      en: `🥊 Hey! Join me at Olimpo Team Kickboxing & Boxing Club (Areguá) and fuel up at the club's fit restaurant.\nSign up through my ambassador link:\n👉 ${link}\nSee you in the ring!`
    };
    window.open(`https://wa.me/?text=${encodeURIComponent(shareTexts[lang] || shareTexts.es)}`, '_blank');
  };

  window.addReferralFromModal = function() {
    const nameInput = document.getElementById('memModalFriendName');
    const planSelect = document.getElementById('memModalFriendPlan');
    if (!nameInput || !planSelect) return;
    if (refFriendNameInput) refFriendNameInput.value = nameInput.value;
    if (refFriendPlanSelect) refFriendPlanSelect.value = planSelect.value;
    nameInput.value = '';
    if (btnAddReferral) btnAddReferral.click();
  };

  // Initialize Firebase Cloud Service & Real-Time Listeners
  if (window.OlimpoFirebase) {
    window.OlimpoFirebase.onMemberUpdate((cloudMember) => {
      if (!cloudMember || !cloudMember.code) return;
      const db = getStudentsDB();
      db[cloudMember.code] = { ...(db[cloudMember.code] || {}), ...cloudMember };
      saveStudentsDB(db);
      renderStudentPortal();
    });
    window.OlimpoFirebase.init().then((connected) => {
      if (connected && state.affiliateRef) {
        window.OlimpoFirebase.incrementReferralClick(state.affiliateRef);
      }
      if (connected && state.activeStudentCode) {
        window.OlimpoFirebase.subscribeToMember(state.activeStudentCode);
      }
    });
  }

  if (btnGenLink && aliasInput) {
    btnGenLink.addEventListener('click', () => {
      const rawName = aliasInput.value.trim();
      const rawPhone = stuPhoneInput ? stuPhoneInput.value.trim() : '';
      const rawPin = stuPinInput ? stuPinInput.value.trim() : '';
      const lang = state.lang || 'es';

      if (!rawName) {
        const alertMsg = {
          es: '⚠️ Por favor ingresá tu nombre o alias deportivo.',
          fr: '⚠️ Merci d\'indiquer ton prénom ou pseudo sportif.',
          en: '⚠️ Please enter your first name or fighter alias.'
        }[lang];
        showToast(alertMsg);
        aliasInput.focus();
        return;
      }

      const cleanCode = rawName.toUpperCase().replace(/[^A-Z0-9_-]/g, '') || 'ATLETA';
      const db = getStudentsDB();

      if (db[cleanCode]) {
        // Existing student account
        if (db[cleanCode].pin && rawPin && db[cleanCode].pin !== rawPin) {
          const pinErr = {
            es: '⚠️ Código PIN incorrecto para esta cuenta de alumno.',
            fr: '⚠️ Code PIN incorrect pour ce compte élève.',
            en: '⚠️ Incorrect PIN code for this student account.'
          }[lang];
          showToast(pinErr);
          return;
        }
        if (rawPhone) db[cleanCode].phone = rawPhone;
        if (rawPin && !db[cleanCode].pin) db[cleanCode].pin = rawPin;
      } else {
        db[cleanCode] = {
          code: cleanCode,
          name: rawName,
          phone: rawPhone,
          pin: rawPin || '0000',
          clicks: 1,
          referrals: [],
          paidOut: 0
        };
      }

      saveStudentsDB(db);
      state.activeStudentCode = cleanCode;
      localStorage.setItem('olimpo_active_student', cleanCode);
      renderStudentPortal();
      if (window.OlimpoFirebase) {
        window.OlimpoFirebase.syncMemberToCloud(db[cleanCode]);
        window.OlimpoFirebase.subscribeToMember(cleanCode);
      }

      const okMsg = {
        es: `✓ ¡Espacio Alumno activado para ${rawName} (Código: ${cleanCode})!`,
        fr: `✓ Espace Élève activé pour ${rawName} (Code : ${cleanCode}) !`,
        en: `✓ Student Space activated for ${rawName} (Code: ${cleanCode})!`
      }[lang];
      showToast(okMsg);
    });
  }

  if (btnStudentLogout) {
    btnStudentLogout.addEventListener('click', () => {
      state.activeStudentCode = '';
      localStorage.removeItem('olimpo_active_student');
      renderStudentPortal();
    });
  }

  if (btnAddReferral) {
    btnAddReferral.addEventListener('click', () => {
      const lang = state.lang || 'es';
      const friendName = refFriendNameInput ? refFriendNameInput.value.trim() : '';
      const planKey = refFriendPlanSelect ? refFriendPlanSelect.value : 'club_150k';

      if (!friendName) {
        const msg = {
          es: '⚠️ Ingresá el nombre y apellido de tu referido.',
          fr: '⚠️ Indique le nom et prénom de ton filleul.',
          en: '⚠️ Please enter your referred friend\'s full name.'
        }[lang];
        showToast(msg);
        if (refFriendNameInput) refFriendNameInput.focus();
        return;
      }

      const activeCode = state.activeStudentCode;
      const db = getStudentsDB();
      if (!activeCode || !db[activeCode]) return;

      const planInfo = referralPlanConfig[planKey] || referralPlanConfig.club_150k;
      const today = new Date().toLocaleDateString('es-PY');

      db[activeCode].referrals = db[activeCode].referrals || [];
      db[activeCode].referrals.unshift({
        friendName,
        planKey,
        commission: planInfo.commission,
        date: today
      });

      saveStudentsDB(db);
      if (refFriendNameInput) refFriendNameInput.value = '';
      renderStudentPortal();
      if (window.OlimpoFirebase) {
        window.OlimpoFirebase.syncMemberToCloud(db[activeCode]);
      }

      const planTitle = planInfo.label[lang] || planInfo.label.es;
      const waMsg = encodeURIComponent(
        `🎓 *REGISTRO DE REFERIDO - ESPACIO ALUMNO OLIMPO*\n` +
        `----------------------------------------\n` +
        `👤 *Alumno Embajador :* ${db[activeCode].name} (Código: ${activeCode})\n` +
        `📱 *WhatsApp Embajador :* ${db[activeCode].phone || 'No especificado'}\n` +
        `🤝 *Nuevo Referido :* ${friendName}\n` +
        `📦 *Plan Suscrito :* ${planTitle}\n` +
        `💰 *Comisión Acreditada :* +${planInfo.commission.toLocaleString('es-PY')} ₲\n` +
        `----------------------------------------\n` +
        `¡Hola! Registro a mi referido para validar mi comisión en el club.`
      );
      window.open(`https://wa.me/595995620416?text=${waMsg}`, '_blank');
    });
  }

  if (btnCopyLink) {
    btnCopyLink.addEventListener('click', () => {
      const text = genLinkText.textContent;
      const lang = state.lang || 'es';
      const copiedMsg = {
        es: '✓ ¡Enlace copiado al portapapeles!',
        fr: '✓ Lien copié dans le presse-papiers !',
        en: '✓ Link copied to clipboard!'
      }[lang];
      navigator.clipboard.writeText(text).then(() => {
        showToast(copiedMsg);
      }).catch(() => {
        showToast(copiedMsg + ' ' + text);
      });
    });
  }

  if (btnShareWa) {
    btnShareWa.addEventListener('click', () => {
      const link = genLinkText.textContent;
      const lang = state.lang || 'es';
      const shareTexts = {
        es: `🥊 ¡Hola! Te invito a entrenar en Olimpo Team Kickboxing & Boxeo (Areguá) y a comer saludable en el restaurante del club.\nSumate con mi enlace oficial de embajador:\n👉 ${link}\n¡Nos vemos en el ring!`,
        fr: `🥊 Salut ! Je t'invite à t'entraîner au club Olimpo Team Kickboxing & Boxe (Areguá) et à manger sainement au restaurant du club.\nRejoins-nous via mon lien ambassadeur :\n👉 ${link}\nÀ très vite sur le ring !`,
        en: `🥊 Hey! Join me at Olimpo Team Kickboxing & Boxing Club (Areguá) and fuel up at the club's fit restaurant.\nSign up through my ambassador link:\n👉 ${link}\nSee you in the ring!`
      };
      const message = encodeURIComponent(shareTexts[lang] || shareTexts.es);
      window.open(`https://wa.me/?text=${message}`, '_blank');
    });
  }

  // Initial Student Portal render
  renderStudentPortal();

  // --- E-COMMERCE FAQ ACCORDION TOGGLE ---
  window.toggleFaqItem = function(btn) {
    if (!btn) return;
    const item = btn.closest('.faq-accordion-item');
    if (!item) return;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-accordion-item').forEach(el => el.classList.remove('open'));
    if (!isOpen) {
      item.classList.add('open');
    }
  };

  // --- DUAL WHATSAPP ROUTING HELPERS ---
  // 1) TRIAL SESSION -> +595 984 430018
  window.openTrialWhatsApp = function() {
    const lang = state.lang || 'es';
    const templates = {
      es: `🥊 ¡Hola Olimpo Team! Quiero reservar una *Sesión de Prueba Gratuita* en el Club de Combate en Areguá (Kickboxing / Boxeo).\n\n• Mi Nombre: \n• Horario preferido (Mañana / Mediodía / Tarde): \n\n¡Muchas gracias!`,
      fr: `🥊 Bonjour Olimpo Team ! Je souhaite réserver une *Séance d'Essai Gratuite* au Club de Combat à Areguá (Kickboxing / Boxe).\n\n• Mon Nom & Prénom : \n• Créneau souhaité (Matin / Midi / Soir) : \n\nMerci beaucoup !`,
      en: `🥊 Hello Olimpo Team! I would like to book a *Free Trial Session* at the Combat Club in Areguá (Kickboxing / Boxing).\n\n• My Name: \n• Preferred slot (Morning / Midday / Evening): \n\nThank you!`
    };
    const text = encodeURIComponent(templates[lang] || templates.es);
    window.open(`https://wa.me/595984430018?text=${text}`, '_blank');
  };

  // 2) GENERAL CONTACT / ORDERS -> +595 995 620416
  window.openGeneralWhatsApp = function() {
    const lang = state.lang || 'es';
    const templates = {
      es: `🏛️ ¡Hola Olimpo Team Areguá! Me comunico desde el sitio web oficial para consultar sobre los planes de nutrición y membresías del club.`,
      fr: `🏛️ Bonjour Olimpo Team Areguá ! Je vous contacte depuis le site officiel pour avoir des informations sur les packs nutrition et le club.`,
      en: `🏛️ Hello Olimpo Team Areguá! I am reaching out from the official website to inquire about nutrition packs and club memberships.`
    };
    const text = encodeURIComponent(templates[lang] || templates.es);
    window.open(`https://wa.me/595995620416?text=${text}`, '_blank');
  };

  // ==========================================================================
  // CHECKOUT & 2-STEP FLOW (CLUB 150K -> CITATION -> NUTRITION -> DELIVERY 20%)
  // ==========================================================================
  const checkoutModal = document.getElementById('checkoutModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const clubChoiceSelect = document.getElementById('checkoutClubChoice');
  const nutritionSelect = document.getElementById('checkoutPlanSelect');
  const singleDishGroup = document.getElementById('singleDishGroup');
  const dishSelectElem = document.getElementById('dishSelect');
  const plateQtyInput = document.getElementById('plateQuantity');
  const autoDebitCheckbox = document.getElementById('chkAutoDebit');
  const deliveryCheckbox = document.getElementById('chkDelivery');
  const doubleProteinCheckbox = document.getElementById('chkDoubleProtein');
  const gatewayTabs = document.querySelectorAll('.btn-gateway-tab');

  // Summary element references
  const sumClubName = document.getElementById('sumClubName');
  const sumClubPrice = document.getElementById('sumClubPrice');
  const sumPlanName = document.getElementById('sumPlanName');
  const sumPlanPrice = document.getElementById('sumPlanPrice');
  const sumDiscount = document.getElementById('sumDiscount');
  const sumDelivery = document.getElementById('sumDelivery');
  const sumExtraProtein = document.getElementById('sumExtraProtein');
  const sumTotal = document.getElementById('sumTotal');

  window.openCheckout = function(targetKey = 'pack_fighter_pro_mensual', dishName = '') {
    const cycle = state.selectedCycle || 'mensual';
    
    if (targetKey === 'club_kickboxing') {
      state.clubChoice = 'club_monthly';
      state.nutritionChoice = 'none';
    } else if (targetKey === 'combo_elite' || targetKey === 'combo_elite_mensual' || targetKey === 'combo_elite_semanal') {
      state.clubChoice = 'club_already';
      state.nutritionChoice = targetKey === 'combo_elite' ? (cycle === 'semanal' ? 'combo_elite_semanal' : 'combo_elite_mensual') : targetKey;
    } else if (targetKey === 'pack_fighter_pro' || targetKey === 'pack_fighter_pro_mensual' || targetKey === 'pack_fighter_pro_semanal') {
      state.nutritionChoice = targetKey === 'pack_fighter_pro' ? (cycle === 'semanal' ? 'pack_fighter_pro_semanal' : 'pack_fighter_pro_mensual') : targetKey;
    } else if (targetKey === 'pack_1_plato' || targetKey === 'pack_1_plato_mensual' || targetKey === 'pack_1_plato_semanal') {
      state.nutritionChoice = targetKey === 'pack_1_plato' ? (cycle === 'semanal' ? 'pack_1_plato_semanal' : 'pack_1_plato_mensual') : targetKey;
    } else if (targetKey === 'plato_unico') {
      state.clubChoice = 'club_already';
      state.nutritionChoice = 'plato_unico';
      if (dishName) state.currentDish = dishName;
    } else {
      state.nutritionChoice = targetKey;
    }

    if (clubChoiceSelect) clubChoiceSelect.value = state.clubChoice;
    if (nutritionSelect) nutritionSelect.value = state.nutritionChoice;

    if (dishSelectElem && dishName) {
      for (let i = 0; i < dishSelectElem.options.length; i++) {
        if (dishSelectElem.options[i].text.includes(dishName) || dishSelectElem.options[i].value.includes(dishName)) {
          dishSelectElem.selectedIndex = i;
          break;
        }
      }
    }

    toggleSingleDishVisibility();
    recalculateCheckoutSummary();
    if (checkoutModal) checkoutModal.classList.add('open');
  };

  // Support direct deep linking to specific checkout plan (e.g. ?checkout=pack_fighter_pro_semanal)
  if (urlParams.get('checkout')) {
    window.openCheckout(urlParams.get('checkout'));
  }

  if (btnCloseModal && checkoutModal) {
    btnCloseModal.addEventListener('click', () => {
      checkoutModal.classList.remove('open');
    });
  }

  function toggleSingleDishVisibility() {
    if (singleDishGroup) {
      if (state.nutritionChoice === 'plato_unico') {
        singleDishGroup.style.display = 'block';
      } else {
        singleDishGroup.style.display = 'none';
      }
    }
  }

  if (clubChoiceSelect) {
    clubChoiceSelect.addEventListener('change', (e) => {
      state.clubChoice = e.target.value;
      recalculateCheckoutSummary();
    });
  }

  if (nutritionSelect) {
    nutritionSelect.addEventListener('change', (e) => {
      state.nutritionChoice = e.target.value;
      if (state.nutritionChoice.endsWith('_semanal')) {
        state.selectedCycle = 'semanal';
      } else if (state.nutritionChoice.endsWith('_mensual')) {
        state.selectedCycle = 'mensual';
      }
      toggleSingleDishVisibility();
      recalculateCheckoutSummary();
    });
  }

  if (dishSelectElem) {
    dishSelectElem.addEventListener('change', (e) => {
      state.currentDish = e.target.options[e.target.selectedIndex].text;
      recalculateCheckoutSummary();
    });
  }

  if (plateQtyInput) {
    plateQtyInput.addEventListener('input', (e) => {
      state.plateQuantity = Math.max(1, parseInt(e.target.value, 10) || 1);
      recalculateCheckoutSummary();
    });
  }

  if (autoDebitCheckbox) {
    autoDebitCheckbox.addEventListener('change', (e) => {
      state.autoDebitActive = e.target.checked;
      recalculateCheckoutSummary();
      updatePricingDisplay();
    });
  }

  if (deliveryCheckbox) {
    deliveryCheckbox.addEventListener('change', recalculateCheckoutSummary);
  }

  if (doubleProteinCheckbox) {
    doubleProteinCheckbox.addEventListener('change', recalculateCheckoutSummary);
  }

  // --- COMPREHENSIVE CHECKOUT CALCULATION ENGINE (MULTILINGUAL) ---
  function getCheckoutCalculations() {
    let packCycle = state.selectedCycle || 'mensual';
    if (state.nutritionChoice.endsWith('_semanal')) {
      packCycle = 'semanal';
    } else if (state.nutritionChoice.endsWith('_mensual')) {
      packCycle = 'mensual';
    }

    const lang = state.lang || 'es';
    const labels = {
      es: {
        proMensual: '⭐ Pack Fighter Pro Mensual (2 Platos/Día • Mes Completo)',
        proSemanal: '⭐ Pack Fighter Pro Semanal (2 Platos/Día • 12 Comidas)',
        pack1Mensual: 'Pack 1 Plato/Día Mensual (Mes Completo • Lun a Sáb)',
        pack1Semanal: 'Pack 1 Plato/Día Semanal (6 Comidas • Lun a Sáb)',
        eliteMensual: '🏆 Combo Fighter Elite Mensual (Club Boxeo + 2 Platos/Día)',
        eliteSemanal: '🏆 Combo Fighter Elite Semanal (Pase Club + 2 Platos/Día)',
        noMeals: '— Ningún pack de comida (Solo club)',
        clubCombo: '✓ Club Kickboxing & Boxeo INCLUIDO en el Combo',
        clubPaid: (p, u) => `✓ Club Kickboxing & Boxeo (${p} ₲/${u})`,
        clubTrial: '✓ Primer Día de Prueba GRATIS en el Club (0 ₲)',
        clubAlready: '✓ Ya es Miembro Activo del Club',
        clubNone: '— Sin suscripción al club',
        sem: 'sem',
        mes: 'mes'
      },
      fr: {
        proMensual: '⭐ Pack Fighter Pro Mensuel (2 Plats/Jour • Mois Complet)',
        proSemanal: '⭐ Pack Fighter Pro Hebdo (2 Plats/Jour • 12 Repas)',
        pack1Mensual: 'Pack 1 Plat/Jour Mensuel (Mois Complet • Lun à Sam)',
        pack1Semanal: 'Pack 1 Plat/Jour Hebdo (6 Repas • Lun à Sam)',
        eliteMensual: '🏆 Combo Fighter Elite Mensuel (Club Boxe + 2 Plats/Jour)',
        eliteSemanal: '🏆 Combo Fighter Elite Hebdo (Pass Club + 2 Plats/Jour)',
        noMeals: '— Aucun pack repas (Club uniquement)',
        clubCombo: '✓ Club Kickboxing & Boxe INCLUS dans le Combo',
        clubPaid: (p, u) => `✓ Club Kickboxing & Boxe (${p} ₲/${u})`,
        clubTrial: '✓ 1er Jour d\'Essai GRATUIT au Club (0 ₲)',
        clubAlready: '✓ Déjà Membre Actif du Club',
        clubNone: '— Sans abonnement au club',
        sem: 'sem',
        mes: 'mois'
      },
      en: {
        proMensual: '⭐ Monthly Fighter Pro Pack (2 Meals/Day • Full Month)',
        proSemanal: '⭐ Weekly Fighter Pro Pack (2 Meals/Day • 12 Meals)',
        pack1Mensual: 'Monthly 1 Meal/Day Pack (Full Month • Mon to Sat)',
        pack1Semanal: 'Weekly 1 Meal/Day Pack (6 Meals • Mon to Sat)',
        eliteMensual: '🏆 Monthly Fighter Elite Combo (Fight Club + 2 Meals/Day)',
        eliteSemanal: '🏆 Weekly Fighter Elite Combo (Club Pass + 2 Meals/Day)',
        noMeals: '— No meal pack (Club only)',
        clubCombo: '✓ Kickboxing & Boxing Club INCLUDED in Combo',
        clubPaid: (p, u) => `✓ Kickboxing & Boxing Club (${p} ₲/${u})`,
        clubTrial: '✓ 1st FREE Trial Day at the Club (0 ₲)',
        clubAlready: '✓ Already an Active Club Member',
        clubNone: '— No club membership',
        sem: 'wk',
        mes: 'mo'
      }
    }[lang] || {};

    let nutritionBase = 0;
    let nutritionLabel = labels.noMeals;
    let isCombo = false;

    if (state.nutritionChoice === 'pack_fighter_pro_mensual' || (state.nutritionChoice === 'pack_fighter_pro' && packCycle === 'mensual')) {
      nutritionBase = 950000;
      nutritionLabel = labels.proMensual;
    } else if (state.nutritionChoice === 'pack_fighter_pro_semanal' || (state.nutritionChoice === 'pack_fighter_pro' && packCycle === 'semanal')) {
      nutritionBase = 260000;
      nutritionLabel = labels.proSemanal;
    } else if (state.nutritionChoice === 'pack_1_plato_mensual' || (state.nutritionChoice === 'pack_1_plato' && packCycle === 'mensual')) {
      nutritionBase = 500000;
      nutritionLabel = labels.pack1Mensual;
    } else if (state.nutritionChoice === 'pack_1_plato_semanal' || (state.nutritionChoice === 'pack_1_plato' && packCycle === 'semanal')) {
      nutritionBase = 140000;
      nutritionLabel = labels.pack1Semanal;
    } else if (state.nutritionChoice === 'combo_elite_mensual' || (state.nutritionChoice === 'combo_elite' && packCycle === 'mensual')) {
      nutritionBase = 1100000;
      nutritionLabel = labels.eliteMensual;
      isCombo = true;
    } else if (state.nutritionChoice === 'combo_elite_semanal' || (state.nutritionChoice === 'combo_elite' && packCycle === 'semanal')) {
      nutritionBase = 300000;
      nutritionLabel = labels.eliteSemanal;
      isCombo = true;
    } else if (state.nutritionChoice === 'plato_unico') {
      const selectedDishObj = availableDishesList.find(d => dishSelectElem && dishSelectElem.value === d.id) || availableDishesList[0];
      const singlePrice = selectedDishObj.price;
      const qty = state.plateQuantity || 1;
      nutritionBase = singlePrice * qty;
      const localizedDishText = dishSelectElem && dishSelectElem.options[dishSelectElem.selectedIndex]
        ? dishSelectElem.options[dishSelectElem.selectedIndex].text.split('(')[0].trim()
        : selectedDishObj.name.split('(')[0].trim();
      nutritionLabel = `${qty}x ${localizedDishText}`;
    } else {
      nutritionBase = 0;
      nutritionLabel = labels.noMeals;
    }

    let clubBase = 0;
    let clubLabel = labels.clubNone;

    if (isCombo) {
      clubBase = 0;
      clubLabel = labels.clubCombo;
    } else if (state.clubChoice === 'club_monthly') {
      clubBase = packCycle === 'semanal' ? 50000 : 150000;
      const u = packCycle === 'semanal' ? labels.sem : labels.mes;
      clubLabel = labels.clubPaid(clubBase.toLocaleString('es-PY'), u);
    } else if (state.clubChoice === 'club_trial') {
      clubBase = 0;
      clubLabel = labels.clubTrial;
    } else if (state.clubChoice === 'club_already') {
      clubBase = 0;
      clubLabel = labels.clubAlready;
    } else {
      clubBase = 0;
      clubLabel = labels.clubNone;
    }

    const subtotalBeforeDiscounts = clubBase + nutritionBase;

    // 5% discount if auto-debit is active and subscription is present
    let discount = 0;
    if (state.autoDebitActive && subtotalBeforeDiscounts > 0 && state.nutritionChoice !== 'plato_unico') {
      discount = Math.round(subtotalBeforeDiscounts * 0.05);
    }

    // Double protein: +10.000 ₲ per meal
    let extraProteinCost = 0;
    if (doubleProteinCheckbox && doubleProteinCheckbox.checked && state.nutritionChoice !== 'none') {
      if (state.nutritionChoice === 'plato_unico') {
        extraProteinCost = (state.plateQuantity || 1) * 10000;
      } else if (state.nutritionChoice.includes('1_plato')) {
        extraProteinCost = (packCycle === 'semanal' ? 6 : 24) * 10000;
      } else if (state.nutritionChoice.includes('fighter_pro') || state.nutritionChoice.includes('combo_elite')) {
        extraProteinCost = (packCycle === 'semanal' ? 12 : 48) * 10000;
      }
    }

    // Delivery: exactly +20% of subscription subtotal as specified
    let deliveryCost = 0;
    if (deliveryCheckbox && deliveryCheckbox.checked && subtotalBeforeDiscounts > 0) {
      deliveryCost = Math.round(subtotalBeforeDiscounts * 0.20);
    }

    const finalTotal = Math.max(0, subtotalBeforeDiscounts - discount + extraProteinCost + deliveryCost);

    return {
      packCycle,
      nutritionBase,
      nutritionLabel,
      isCombo,
      clubBase,
      clubLabel,
      subtotalBeforeDiscounts,
      discount,
      extraProteinCost,
      deliveryCost,
      finalTotal
    };
  }

  // --- RECALCULATE CHECKOUT SUMMARY (DOM SYNC) ---
  function recalculateCheckoutSummary() {
    const calc = getCheckoutCalculations();

    // Update DOM summary
    if (sumClubName) sumClubName.textContent = calc.clubLabel + ' :';
    if (sumClubPrice) sumClubPrice.textContent = `${calc.clubBase.toLocaleString('es-PY')} ₲`;
    if (sumPlanName) sumPlanName.textContent = calc.nutritionLabel + ' :';
    if (sumPlanPrice) sumPlanPrice.textContent = `${calc.nutritionBase.toLocaleString('es-PY')} ₲`;
    if (sumDiscount) {
      sumDiscount.textContent = calc.discount > 0 ? `-${calc.discount.toLocaleString('es-PY')} ₲ (5%)` : '0 ₲';
    }
    if (sumDelivery) {
      sumDelivery.textContent = calc.deliveryCost > 0 ? `+${calc.deliveryCost.toLocaleString('es-PY')} ₲ (+20%)` : '0 ₲';
    }
    if (sumExtraProtein) {
      sumExtraProtein.textContent = calc.extraProteinCost > 0 ? `+${calc.extraProteinCost.toLocaleString('es-PY')} ₲` : '0 ₲';
    }
    if (sumTotal) {
      sumTotal.textContent = `${calc.finalTotal.toLocaleString('es-PY')} ₲`;
    }
  }

  // --- GATEWAY TABS SWITCHER ---
  gatewayTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      gatewayTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.currentGateway = tab.getAttribute('data-gateway');

      document.querySelectorAll('.gw-content-panel').forEach(panel => {
        panel.style.display = 'none';
      });
      const activePanel = document.getElementById(`gwPanel_${state.currentGateway}`);
      if (activePanel) activePanel.style.display = 'block';
    });
  });

  // --- SIPAP CLIPBOARD COPY HELPER ---
  window.copySipapData = function() {
    const sipapInfo = `BANCO CONTINENTAL / BASA\nTitular: Olimpo Team Kickboxing & Sports Resto\nRUC: 80099562-4\nCaja de Ahorro Gs: 01-234567-89\nSede: Av. Las Residentas, Areguá`;
    const lang = state.lang || 'es';
    const msg = {
      es: '✓ ¡Datos SIPAP copiados al portapapeles!',
      fr: '✓ Coordonnées SIPAP copiées dans le presse-papiers !',
      en: '✓ SIPAP bank details copied to clipboard!'
    }[lang];
    navigator.clipboard.writeText(sipapInfo).then(() => {
      showToast(msg);
    }).catch(() => {
      showToast(msg);
    });
  };

  // ==========================================================================
  // PAYMENT PROCESSORS ARCHITECTURE (OLIMPO_PAYMENTS_CONFIG)
  // ==========================================================================
  const OLIMPO_PAYMENTS_CONFIG = {
    LIVE_MODE: false,
    BANCARD_VPOS: {
      ENVIRONMENT: 'staging',
      PUBLIC_KEY: 'pk_olimpo_staging_77a92b',
      PRIVATE_KEY: 'sk_olimpo_staging_33c84f',
      STAGING_URL: 'https://vpos.infonet.com.py/vpos/api/0.3/single_buy',
      PRODUCTION_URL: 'https://vpos.infonet.com.py/vpos/api/0.3/single_buy',
      TOKENIZE_CARD_URL: 'https://vpos.infonet.com.py/vpos/api/0.3/users/cards/new',
      processPayment: async function(paymentPayload) {
        console.log('[OLIMPO BANCARD] Dispatching vPOS transaction payload:', paymentPayload);
        return { success: true, authorizationCode: 'AUTH-' + Math.floor(Math.random() * 900000 + 100000), token: 'tok_card_' + Date.now() };
      }
    },
    SIPAP: {
      BANK_NAME: 'Banco Continental / Basa',
      ACCOUNT_NUMBER: '01-234567-89',
      RUC: '80099562-4',
      ACCOUNT_HOLDER: 'Olimpo Team Kickboxing & Sports Resto'
    },
    TIGO_MONEY: {
      MERCHANT_ID: 'TIGO-OLIMPO-AREGUA-595',
      SERVICE_ID: 'RECURRING_SUB_FITNESS',
      NOTIFICATION_URL: 'https://api.olimpoteam.py/webhook/tigo'
    },
    QR_SIMPLE_BANCARD: {
      EMVCO_PAYLOAD_ID: 'PY.COM.BANCARD.QR.80099562',
      MERCHANT_NAME: 'OLIMPO TEAM KICKBOXING AREGUA'
    }
  };

  window.OLIMPO_PAYMENTS_CONFIG = OLIMPO_PAYMENTS_CONFIG;

  // --- CHECKOUT FORM SUBMISSION & DUAL WHATSAPP TRANSMISSION ---
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const custName = document.getElementById('custName')?.value.trim() || 'Client';
      const custPhone = document.getElementById('custPhone')?.value.trim() || '';
      const custCI = document.getElementById('custCI')?.value.trim() || '';
      const custAddress = document.getElementById('custAddress')?.value.trim() || 'Retiro en el Club Areguá (Av. Las Residentas)';
      const custRefInputVal = document.getElementById('custRefCode')?.value.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '') || '';
      const effectiveRef = custRefInputVal || state.affiliateRef || '';

      const hasDelivery = deliveryCheckbox?.checked || false;
      const hasDoubleProt = doubleProteinCheckbox?.checked || false;
      const isAutoDebit = autoDebitCheckbox?.checked || false;

      const calc = getCheckoutCalculations();
      const finalAmount = calc.finalTotal;

      // Credit ambassador in local student DB if referral code is present
      if (effectiveRef && finalAmount > 0) {
        const db = getStudentsDB();
        if (!db[effectiveRef]) {
          db[effectiveRef] = {
            code: effectiveRef,
            name: effectiveRef,
            phone: '',
            pin: '',
            clicks: 1,
            referrals: [],
            paidOut: 0
          };
        }
        const commRate = state.nutritionChoice === 'none' ? 0.15 : 0.10;
        const commAmount = Math.round(calc.subtotalBeforeDiscounts * commRate);
        db[effectiveRef].referrals = db[effectiveRef].referrals || [];
        db[effectiveRef].referrals.unshift({
          friendName: custName,
          planKey: state.nutritionChoice !== 'none' ? state.nutritionChoice : 'club_150k',
          commission: commAmount,
          date: new Date().toLocaleDateString('es-PY')
        });
        saveStudentsDB(db);
        renderStudentPortal();
      }

      if (OLIMPO_PAYMENTS_CONFIG.LIVE_MODE) {
        showToast('Conectando con la pasarela de pago...');
        await OLIMPO_PAYMENTS_CONFIG.BANCARD_VPOS.processPayment({ amount: finalAmount, customer: custName, ci: custCI });
      }

      const gatewayNames = {
        bancard: 'Bancard vPOS (Tarjetas Crédito/Débito)',
        sipap: 'SIPAP (Transferencia Bancaria en Guaraníes)',
        tigo: 'Tigo Money (Billetera Móvil)',
        qr: 'QR Simple Bancard'
      };

      // Dual WhatsApp routing:
      // If user ONLY booked a Free Trial Session (club_trial + no meals), send to +595 984 430018
      // Otherwise send to +595 995 620416
      const isTrialOnly = state.clubChoice === 'club_trial' && state.nutritionChoice === 'none';
      const targetPhone = isTrialOnly ? '595984430018' : '595995620416';

      const waMessage = isTrialOnly
        ? `🥊 *RESERVA DE SESIÓN DE PRUEBA GRATUITA - OLIMPO TEAM AREGUÁ*\n` +
          `----------------------------------------\n` +
          `👤 *Atleta :* ${custName}\n` +
          `📱 *WhatsApp :* ${custPhone}\n` +
          `🆔 *C.I. :* ${custCI}\n` +
          (effectiveRef ? `🤝 *Invitado por (Código Alumno) :* ${effectiveRef}\n` : '') +
          `----------------------------------------\n` +
          `¡Hola! Quiero confirmar mi primera sesión de prueba gratuita en el Club de Combate Olimpo (Av. Las Residentas, Areguá).`
        : `🏛️ *NUEVA ORDEN / PEDIDO - OLIMPO TEAM AREGUÁ*\n` +
          `----------------------------------------\n` +
          `👤 *Cliente :* ${custName}\n` +
          `📱 *WhatsApp :* ${custPhone}\n` +
          `🆔 *C.I. / RUC :* ${custCI}\n` +
          `📍 *Dirección :* ${custAddress}\n` +
          (effectiveRef ? `🤝 *Referido por (Código Alumno) :* ${effectiveRef}\n` : '') +
          `----------------------------------------\n` +
          `🥊 *Paso 1 (Club) :* ${calc.clubLabel}\n` +
          `🥗 *Paso 2 (Nutrición) :* ${calc.nutritionLabel} (${calc.nutritionBase.toLocaleString('es-PY')} ₲)\n` +
          `🔄 *Débito Automático (-5%) :* ${isAutoDebit ? `SÍ (-${calc.discount.toLocaleString('es-PY')} ₲)` : 'No'}\n` +
          `🛵 *Delivery (+20%) :* ${hasDelivery ? `SÍ (+${calc.deliveryCost.toLocaleString('es-PY')} ₲)` : 'No (Retiro en el Club)'}\n` +
          `🥩 *Doble Proteína :* ${hasDoubleProt ? `SÍ (+${calc.extraProteinCost.toLocaleString('es-PY')} ₲)` : 'No'}\n` +
          `💳 *Medio de Pago :* ${gatewayNames[state.currentGateway] || state.currentGateway}\n` +
          `----------------------------------------\n` +
          `💰 *TOTAL A PAGAR :* *${calc.finalTotal.toLocaleString('es-PY')} ₲*\n` +
          `----------------------------------------\n` +
          `« Entrenar es el 50% del trabajo, la otra mitad es alimentarse como un campeón. »\n` +
          `_Enviado desde la web oficial Olimpo Team Kickboxing & Restaurante (Av. Las Residentas, Areguá)_`;

      const encodedWA = encodeURIComponent(waMessage);
      const waUrl = `https://wa.me/${targetPhone}?text=${encodedWA}`;

      showToast(`✓ ¡Confirmado! Redirigiendo a WhatsApp (+${targetPhone})...`);
      setTimeout(() => {
        window.open(waUrl, '_blank');
        if (checkoutModal) checkoutModal.classList.remove('open');
      }, 600);
    });
  }

  // ==========================================================================
  // LEGAL TERMS MODAL LOGIC
  // ==========================================================================
  const legalModal = document.getElementById('legalModal');
  const btnCloseLegalModal = document.getElementById('btnCloseLegalModal');

  window.openLegalModal = function() {
    if (legalModal) legalModal.classList.add('open');
  };

  window.closeLegalModal = function() {
    if (legalModal) legalModal.classList.remove('open');
  };

  if (btnCloseLegalModal) {
    btnCloseLegalModal.addEventListener('click', window.closeLegalModal);
  }

  if (legalModal) {
    legalModal.addEventListener('click', (e) => {
      if (e.target === legalModal) window.closeLegalModal();
    });
  }

  // ==========================================================================
  // LIGHTBOX MODAL FOR FLYERS
  // ==========================================================================
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDownloadBtn = document.getElementById('lightboxDownloadBtn');
  const btnCloseLightbox = document.getElementById('btnCloseLightbox');

  window.openFlyerLightbox = function(imgSrc, title) {
    if (!lightboxModal || !lightboxImg) return;
    lightboxImg.src = imgSrc;
    if (lightboxTitle) lightboxTitle.textContent = title;
    if (lightboxDownloadBtn) {
      lightboxDownloadBtn.href = imgSrc;
      lightboxDownloadBtn.setAttribute('download', title.replace(/[^a-zA-Z0-9]/g, '_') + '.png');
    }
    lightboxModal.classList.add('open');
  };

  if (btnCloseLightbox && lightboxModal) {
    btnCloseLightbox.addEventListener('click', () => {
      lightboxModal.classList.remove('open');
    });
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) lightboxModal.classList.remove('open');
    });
  }

  // ==========================================================================
  // AFFILIATE / MEMBER END-OF-MONTH PROFIT WITHDRAWAL REQUEST (-> +595 995 620416)
  // ==========================================================================
  window.openWithdrawModal = function() {
    const db = getStudentsDB();
    const activeCode = state.activeStudentCode;
    const student = activeCode && db[activeCode] ? db[activeCode] : null;
    const refs = student && Array.isArray(student.referrals) ? student.referrals : [];
    const totalEarn = refs.reduce((acc, r) => acc + (r.commission || 0), 0);
    const balance = Math.max(0, totalEarn - (student ? (student.paidOut || 0) : 0));

    const amountStr = balance.toLocaleString('es-PY');
    const codeStr = student ? student.code : (state.affiliateRef || 'MIEMBRO');
    const nameStr = student ? (student.email || student.name || codeStr) : codeStr;
    const phoneStr = student && student.phone ? student.phone : '';
    const rewardMonth = student && student.rewardMonth ? student.rewardMonth : getCurrentRewardMonth();

    const msg = encodeURIComponent(
      `💸 *RETIRO DE GANANCIAS DE FIN DE MES - ESPACIO MIEMBRO OLIMPO*\n` +
      `----------------------------------------\n` +
      `👤 *Miembro :* ${nameStr} (Código: ${codeStr})\n` +
      (phoneStr ? `📱 *WhatsApp :* ${phoneStr}\n` : '') +
      `📅 *Mes del Retiro :* ${rewardMonth}\n` +
      `🤝 *Afiliados Activos :* ${refs.length}\n` +
      `💰 *Ganancias a Retirar (Fin de Mes) :* ${amountStr} ₲\n` +
      `🏦 *Medio Preferido :* Transferencia SIPAP / Tigo Money / Efectivo en el Club\n` +
      `----------------------------------------\n` +
      `¡Hola! Solicito el retiro de mis ganancias de fin de mes antes del cierre mensual.`
    );
    window.open(`https://wa.me/595995620416?text=${msg}`, '_blank');
  };

  // ==========================================================================
  // TOAST NOTIFICATIONS HELPER
  // ==========================================================================
  let toastElem = document.getElementById('olimpoToast');
  if (!toastElem) {
    toastElem = document.createElement('div');
    toastElem.id = 'olimpoToast';
    toastElem.className = 'toast-box';
    document.body.appendChild(toastElem);
  }

  function showToast(msg) {
    if (!toastElem) return;
    toastElem.textContent = msg;
    toastElem.classList.add('show');
    setTimeout(() => {
      toastElem.classList.remove('show');
    }, 3500);
  }
  window.showToast = showToast;

  // ==========================================================================
  // MULTILINGUAL ENGINE (ESPAÑOL / FRANÇAIS / ENGLISH) - 100% AUDITED
  // ==========================================================================
  const translations = {
      "es": {
            "alertBar": "Cupo diario: 50 platos frescos cocinados cada mañana • Lunes a Sábado en Areguá • Sin Reserva previa",
            "navHome": "Inicio",
            "navFacility": "El Complejo",
            "navFightClub": "Fight Club",
            "navRestoFit": "Restaurante",
            "navFlyers": "Flyers",
            "navPricing": "Tarifas",
            "navAffiliates": "Afiliados",
            "navContact": "Acceso",
            "navJoin": "Unirse",
            "navBrandSub": "Club & Resto Fit",
            "heroTag": "Club de Combate & Nutrición Atlética • Areguá",
            "heroTitle1": "COMÉ, COMBATÍ, VIVÍ",
            "heroTitleWarrior": "GUERRERO",
            "heroTitle2": "POR EL",
            "heroTitleOlimpo": "¡OLIMPO!",
            "heroLead": "El primer complejo de Areguá que fusiona el rigor del Kickboxing y el Boxeo con una nutrición deportiva calibrada a los macronutrientes. Cocinado fresco en el lugar cada mañana.",
            "btnViewPacks": "Elegir Plan",
            "btnGoToClub": "📍 Ir al Gimnasio",
            "heroProofAthletes": "+50 Atletas",
            "heroProofCommunity": "Comunidad Olimpo",
            "heroDuoClubTitle": "Fighting Club",
            "heroDuoClubSub": "Kickboxing • Boxeo Inglés • 150k/mes",
            "heroDuoRestoTitle": "Restaurante Fit",
            "heroDuoRestoSub": "200g Pollo • Macros Pesados",
            "showcaseBadge": "Ecosistema Olimpo",
            "showcaseLive": "Abierto Lun - Sáb",
            "showcaseSub": "Pack Fighter Pro (2 Platos/Día)",
            "showcasePriceVal": "Desde 18.801 ₲ / plato",
            "btnShowcaseOrder": "Pedir Ahora",
            "facilityTag": "PROYECTO EN EXPANSIÓN & COMUNIDAD DE PELEA",
            "facilityTitle": "UN PROYECTO QUE CRECE CON VOS <span>• ¡EL CLUB YA ESTÁ ABIERTO Y OPERATIVO!</span>",
            "facilityPunchline1": "→ ¡Vení a entrenar a combatir!",
            "facilityPunchline2": "→ ¡Y alimentá tu cuerpo directamente después de tu sesión!",
            "facilityDesc": "En el Olimpo eliminamos la gran traba de los atletas: entrenar duro y arruinar el esfuerzo comiendo mal por falta de tiempo o comidas adaptadas. Nuestro complejo reúne bajo el mismo techo una sala de combate y una cocina deportiva.",
            "evolutionBadge": "📐 PLANOS DEL PROYECTO • CLUB 100% OPERATIVO",
            "facilityProjectNotice": "Estas imágenes corresponden a los <strong>planos arquitectónicos y la visión final de nuestro complejo</strong>. Estamos aún en fase de construcción y ampliación, pero <strong>el club está totalmente abierto y operativo para todos los entrenamientos diarios</strong> (Kickboxing K-1 y Boxeo Tradicional Inglés). ¡Vení a formar parte de los cimientos y de la evolución de nuestra comunidad!",
            "rotatorSlide1": "🥊 1. La Sala de Combate (Ring & Sacos) • Club Ya Abierto",
            "rotatorSlide2": "🥗 2. El Restaurante Atlético • En Obras de Terminación",
            "rotatorHint": "Planos del proyecto • Rotación auto",
            "facilityCard1Badge": "1. Corazón del Complejo",
            "facilityCard1Title": "🥊 La Sala de Combate (Fighting Club)",
            "facilityCard1Desc": "Un espacio pensado para la rigurosa disciplina pugilística. Sin máquinas innecesarias: un ring de combate, bolsas pesadas de golpeo para el acondicionamiento, superficies de apoyo firmes y entrenadores dedicados al <strong>Kickboxing K-1</strong> y al <strong>Boxeo Tradicional Inglés</strong>.",
            "facilityCard1Price": "Tarifa Membresía : 150.000 ₲ / mes • Día de prueba gratis disponible",
            "facilityCard2Badge": "2. Integrado al Gimnasio",
            "facilityCard2Title": "🥗 El Restaurante Atlético del Club",
            "facilityCard2Desc": "La cocina del club opera cada mañana desde las 06:00 para preparar los 50 platos del día. Cada plato respeta la Regla de Oro (1/3 Proteínas, 1/3 Carbohidratos limpios, 1/3 Fibras y fruta). Comés exactamente lo que tu metabolismo necesita para regenerar los tejidos y potenciar tu rendimiento.",
            "facilityCard2Quote": "« Entrenar es el 50% del trabajo, la otra mitad es alimentarse bien. »",
            "clubPill": "Academia de Combate",
            "clubTitle": "FIGHTING CLUB <span>OLIMPO TEAM</span>",
            "clubSubtitle": "Desarrollá una disciplina de acero, velocidad explosiva y potencia en el ring. Especialización estricta en Kickboxing K-1 Rules y Boxeo Tradicional Inglés. Cero suelo, cero grappling: pegada pura y esquives.",
            "schedHeaderTitle": "Horarios de las Sesiones de Combate",
            "schedHeaderSub": "Entrenamientos de Lunes a Sábado en el club (Av. Las Residentas, Areguá).",
            "btnBookTrial": "Reservar un Día de Prueba Gratis",
            "schedSlot1": "🌅 Mañana (07:00 – 08:30)",
            "schedClass1": "Acondicionamiento Físico & Bolsas de Golpeo",
            "schedMeta1": "Cardio de combate, fortalecimiento del core y combinaciones en bolsas pesadas.",
            "schedSlot2": "☀️ Mediodía (12:30 – 14:00)",
            "schedClass2": "Boxeo Tradicional Inglés",
            "schedMeta2": "Juego de piernas, esquives rotativos y trabajo técnico con manoplas de foco.",
            "schedSlot3": "🌙 Tarde / Noche (18:00 – 19:30)",
            "schedClass3": "Kickboxing K-1 Rules Colectivo",
            "schedMeta3": "Clase principal: puños, patadas, barridos, combinaciones y alta intensidad.",
            "schedSlot4": "🔥 Avanzados (19:30 – 21:00)",
            "schedClass4": "Guanteo Controlado & Perfeccionamiento",
            "schedMeta4": "Sparring técnico con protecciones completas y simulación táctica en ring.",
            "restoPill": "Nutrición Deportiva",
            "restoTitle": "RESTAURANTE DEL <span>OLIMPO</span>",
            "restoSubtitle": "La verdadera comida que tu cuerpo necesita después del esfuerzo. Platos frescos preparados cada mañana con ingredientes limpios, sin aceites industriales y pesados al gramo.",
            "goldenRuleTitle": "La Regla de Oro del Plato Atlético Olimpo",
            "goldenRuleSubtitle": "Equilibrio metabólico pensado para secar el tejido adiposo y reparar las fibras musculares.",
            "triadBadge1": "1/3 del Plato",
            "triadTitle1": "Proteínas Puras",
            "triadDesc1": "Pechuga de pollo grillada (200g), carne vacuna magra o huevos frescos para la reconstrucción muscular.",
            "triadBadge2": "1/3 del Plato",
            "triadTitle2": "Carbohidratos Limpios",
            "triadDesc2": "Arroz blanco al vapor, fideos salteados al wok o mandioca tierna para recargar el glucógeno.",
            "triadBadge3": "1/3 del Plato",
            "triadTitle3": "Fibras & Vitaminas",
            "triadDesc3": "Ensaladas frescas crocantes, verduras al wok y frutas de estación enteras (naranja, manzana, banana).",
            "goalsHeaderTitle": "Calibrá Tu Plato Según Tu Objetivo Actual",
            "goalsHeaderSub": "Hacé clic en tu perfil para ver cómo balanceamos tus porciones en cocina:",
            "goalTabWeightLoss": "1. Pérdida de Peso",
            "goalTabCutting": "2. Definición & Secado",
            "goalTabMaintenance": "3. Mantenimiento (Regla de Oro)",
            "goalTabBulking": "4. Ganancia de Masa",
            "macroLabelProt": "Proteína",
            "macroLabelCarbs": "Carbohidratos",
            "macroLabelVeg": "Fibras & Fruta",
            "tabAllDishes": "Todos los Platos",
            "tabMonday": "Lunes",
            "tabTuesday": "Martes",
            "tabWednesday": "Miércoles",
            "tabThursday": "Jueves",
            "tabFriday": "Viernes",
            "tabSaturday": "Sábado",
            "flyersPill": "Soporte Oficial para Imprimir",
            "flyersTitle": "FLYER OFICIAL <span>RECTO & VERSO (PDF)</span>",
            "flyersSubtitle": "Menú completo y planes de suscripción condensados en 1 sola hoja de doble cara (2 páginas A4 en PDF listo para imprimir o compartir).",
            "btnOpenPdf": "Ver el menú",
            "pdfHint": "Documento oficial en alta resolución • Formato A4 Recto/Verso",
            "pricingPill": "Tarifas & Membresías",
            "pricingTitle": "PLANES DE <span>SUSCRIPCIÓN</span>",
            "pricingSubtitle": "Elegí tu plan. Activá el <strong>débito automático Bancard</strong> para acceder a un 5% de descuento inmediato y asegurar tus comidas y entrenamientos sin interrupciones.",
            "cycleWeekly": "Semana (6 Días)",
            "cycleMonthly": "Mes Completo (Lun a Sáb)",
            "adControlTitle": "💳 Débito Automático Bancard :",
            "adControlDisc": "5% de Descuento Inmediato Incluido",
            "planTypeClub": "Academia de Combate",
            "planTitleClub": "Club Kickboxing & Boxeo",
            "planFeatClub1": "Acceso libre a las clases de <strong>Kickboxing K-1 Rules</strong>",
            "planFeatClub2": "Clases de <strong>Boxeo Tradicional Inglés</strong>",
            "planFeatClub3": "Acceso al ring, bolsas pesadas de 60kg y guanteo",
            "planFeatClub4": "1er Día de prueba gratis sin compromiso",
            "planFeatClub5": "Acompañamiento técnico por peleadores experimentados",
            "btnSelectClub": "Inscribirse al Club (150k)",
            "planType1Plato": "Nutrición Diaria",
            "planTitle1Plato": "Pack 1 Plato / Día",
            "planFeat1Plato1": "1 comida completa por día: Almuerzo o Cena",
            "planFeat1Plato2": "Recetas frescas rotativas de Lunes a Sábado",
            "planFeat1Plato3": "200g de proteína pura + carbohidratos limpios + ensalada",
            "planFeat1Plato4": "Frutas frescas de estación incluidas en cada comida",
            "planFeat1Plato5": "Retiro directo en el club o delivery (+20%)",
            "btnSelect1Plato": "Elegir 1 Plato/Día",
            "ribbonPopular": "⭐ Plan Más Popular",
            "planTypeFighterPro": "Atleta & Peleador",
            "planTitleFighterPro": "Fighter Pro (2 Platos)",
            "planFeatFighter1": "<strong>2 comidas completas por día:</strong> Almuerzo + Cena",
            "planFeatFighter2": "Cero compras, cero cocina después de entrenar duro",
            "planFeatFighter3": "Freno al catabolismo nocturno: recuperación máxima",
            "planFeatFighter4": "Platos calientes herméticos listos para llevar",
            "planFeatFighter5": "Precio ultra competitivo: menos de 19.000 ₲ por comida limpia",
            "btnSelectFighter": "Elegir Fighter Pro",
            "ribbonElite": "🏆 Transformación Total",
            "planTypeElite": "Pack Híbrido Definitivo",
            "planTitleElite": "Combo Fighter Elite",
            "planFeatElite1": "<strong>Acceso completo ilimitado</strong> a Kickboxing & Boxeo",
            "planFeatElite2": "<strong>2 comidas atléticas por día</strong> preparadas en el club",
            "planFeatElite3": "Seguimiento mensual de composición corporal y peso",
            "planFeatElite4": "Prioridad de atención en cocina y delivery",
            "planFeatElite5": "La experiencia total del Olimpo al mejor precio",
            "btnSelectElite": "Elegir Pack Elite",
            "affPill": "Ingresos Pasivos",
            "affTitle": "PROGRAMA DE <span>EMBAJADORES & AFILIADOS</span>",
            "affSubtitle": "¿Entrenás en el club o te encantan nuestros platos? Invitá a tus amigos, compañeros de combate y colegas y <strong>ganá hasta un 15% de comisión recurrente</strong> cada mes mientras sigan activos.",
            "affHowTitle": "¿Cómo Funciona el Sistema de Afiliados?",
            "affHowSteps": "1. Generá tu enlace de referido exclusivo abajo.<br>2. Compartilo en WhatsApp, Instagram o directamente en el club.<br>3. Apenas un referido pide su pack o se inscribe al club, tu comisión se acredita automáticamente.<br>4. Retirá tus ganancias cuando quieras por transferencia SIPAP, billetera Tigo Money o en efectivo en recepción.",
            "affStat1Label": "Comisiones Packs Nutrición",
            "affStat2Label": "Comisiones Membresías Club",
            "affStat3Num": "Mes tras Mes",
            "affStat3Label": "Ingresos Recurrentes",
            "affStat4Label": "Pago Directo en Paraguay",
            "calcTitle": "Simulador de Ganancias Mensuales por Referidos",
            "calcLabelMeals": "Amigos suscritos a las comidas (Packs de nutrición) :",
            "calcLabelClub": "Amigos inscritos a las clases de Kickboxing & Boxeo :",
            "calcResultLabel": "Ingresos Estimados Por Mes :",
            "calcResultNote": "¡Con unas pocas personas recomendadas, tu propia membresía y tus comidas te salen totalmente GRATIS y con dinero extra en el bolsillo!",
            "linkGenTitle": "Creá o Conectá Tu Espacio Alumno para Generar Tu Enlace",
            "linkGenSub": "Ingresá tu nombre/alias y tu WhatsApp para activar tu cuenta de embajador, generar tu enlace único y seguir a tus referidos reales:",
            "affAliasPlaceholder": "Ej: GUERRERO_ALEX",
            "btnGenLink": "🎓 Activar Mi Espacio & Mi Enlace",
            "btnCopyLink": "📋 Copiar el Enlace",
            "btnShareWa": "📲 Compartir en WhatsApp",
            "dashTitle": "Panel de Control de Tus Referidos Reales",
            "btnWithdraw": "💸 Solicitar Retiro de Ganancias",
            "dashClicks": "Clics en tu enlace",
            "dashSignups": "Referidos inscritos",
            "dashTotalEarn": "Comisiones totales",
            "dashBalance": "Saldo disponible",
            "contactPill": "Acceso & Contacto",
            "contactTitle": "SUMATE AL <span>OLIMPO EN AREGUÁ</span>",
            "contactSubtitle": "Dirección oficial: <strong>Av. Las Residentas, Areguá</strong>, Paraguay. Retiro directo en el club o servicio de delivery (+20%).",
            "contactHoursTitle": "Ubicación & Horarios del Club",
            "contactLocLabel": "📍 Ubicación :",
            "contactLocVal": "Av. Las Residentas, Areguá",
            "contactLunchLabel": "Servicio Almuerzo :",
            "contactDinnerLabel": "Servicio Cena :",
            "contactDaysLabel": "Días de Atención :",
            "contactDaysVal": "Lunes a Sábado",
            "contactSundayLabel": "Domingo :",
            "contactSundayVal": "Cerrado (Descanso del Guerrero)",
            "contactDeliveryLabel": "Servicio de Delivery :",
            "contactDeliveryVal": "+20% del monto del pedido",
            "btnGoogleMaps": "📍 Ver en Google Maps",
            "btnWaze": "🚗 Ver en Waze",
            "btnContactWa": "💬 Escribir al WhatsApp (+595 995 620416)",
            "faqTitle": "Preguntas Frecuentes",
            "faqQ1": "¿Es necesario reservar con anticipación para comer o entrenar?",
            "faqA1": "No. La regla oficial del complejo es <strong>Sin Reserva Previa</strong>. Vení directamente a la sede (Av. Las Residentas, Areguá) para tu primera clase de prueba o para disfrutar de tu plato del día.",
            "faqQ2": "¿Puedo pedir comidas sin estar inscrito en el club de combate?",
            "faqA2": "¡Totalmente! Podés suscribirte únicamente a un pack de nutrición (1 o 2 platos al día) o pedir platos individuales desde 7.000 ₲ hasta 25.000 ₲. ¡Por cada 5 platos comprados, el 6to es 100% GRATIS!",
            "faqQ3": "¿Cuánto cuesta la membresía al club de Kickboxing & Boxeo?",
            "faqA3": "La cuota mensual es de <strong>150.000 ₲ / mes</strong> (150k PYG) con acceso libre a todos los entrenamientos. El primer día de prueba es 100% gratis.",
            "faqQ4": "¿Cómo funciona el débito automático Bancard?",
            "faqA4": "Es procesado con seguridad por Bancard Paraguay bajo encriptación PCI-DSS. Accedés a un descuento inmediato del 5% en tu cuota y podés pausar o cancelar en cualquier momento sin costo alguno.",
            "modalTitle": "Inscripción & Pago Seguro (Paraguay)",
            "step1Badge": "Paso 1",
            "step1Title": "Entrenamiento en el Club de Combate (Areguá)",
            "step1Desc": "Kickboxing K-1 Rules & Boxeo Tradicional Inglés. Ring de combate y bolsas pesadas.",
            "quoteMain": "« Entrenar es el 50% del trabajo, la otra mitad es alimentarse bien. »",
            "quoteSub": "« ¡Entrenar duro sin comer bien es como remar sin remos! » — Regla de oro del Olimpo",
            "step2Badge": "Paso 2",
            "step2Title": "Elegí tu Programa Nutritivo (Cocina del Club)",
            "lblSelectDish": "Seleccioná tu Plato o Street-Food :",
            "lblPlateQuantity": "Cantidad de Platos (¡5 comprados = el 6to GRATIS!) :",
            "adTitle": "🔄 Activar Débito Automático Bancard (-5% de descuento)",
            "adSub": "Renovación automática cada mes. Cancelable en cualquier momento en 1 clic.",
            "blockServices": "3. Servicios & Delivery",
            "lblDelivery": "<strong>Servicio de Delivery a Domicilio (+20% del abono)</strong> — Retiro en el club gratis.",
            "lblDoubleProt": "Doble Porción de Proteína (+2x Carne/Pollo : +10.000 ₲ por comida)",
            "blockCustomer": "4. Tus Datos de Contacto",
            "lblCustName": "Nombre & Apellido *",
            "custNamePlaceholder": "Ej: Carlos Benítez",
            "lblCustPhone": "WhatsApp / Teléfono *",
            "lblCustCI": "C.I. o RUC (para la factura legal paraguaya) *",
            "lblCustAddress": "Dirección de Delivery o Retiro en el Club",
            "custAddressPlaceholder": "Ej: Retiro en el club de Areguá o dirección completa",
            "blockPayment": "5. Medio de Pago Localizado en Paraguay",
            "gwBancard": "Bancard vPOS",
            "gwSipap": "SIPAP Transferencia",
            "gwTigo": "Tigo Money",
            "gwQr": "QR Bancard",
            "txtBancardTitle": "🔒 Pasarela Oficial Bancard vPOS (Tarjetas de Crédito & Débito Paraguay)",
            "lblCardNum": "Número de Tarjeta (Visa, Mastercard, Panal, Cabal)",
            "lblCardExp": "Fecha de Expiración (MM/AA)",
            "lblCardCvv": "Código de Seguridad CVV",
            "txtBancardSecurity": "✓ Tokenización segura PCI-DSS certificada por Bancard Paraguay. Listo para débito automático.",
            "txtSipapTitle": "🏦 Datos Bancarios SIPAP (Transferencia Interbancaria en Guaraníes) :",
            "sipapBankLabel": "Banco :",
            "sipapHolderLabel": "Titular :",
            "sipapRucLabel": "RUC :",
            "sipapAccountLabel": "Caja de Ahorro Gs :",
            "sipapCityLabel": "Sede :",
            "btnCopySipap": "📋 Copiar Datos SIPAP para Transferir",
            "txtTigoTitle": "📱 Débito Instantáneo en Billetera Móvil (Tigo Money / Personal) :",
            "lblTigoPhone": "Número de Teléfono de Billetera (Paraguay)",
            "txtTigoNote": "Se enviará una notificación a tu teléfono para ingresar tu PIN y confirmar el pago.",
            "txtQrTitle": "📲 Escaneá desde la app de tu banco en Paraguay (QR Simple)",
            "txtQrCompatible": "Compatible con Itaú, Continental, Ueno, Familiar, Sudameris, Atlas y GNB.",
            "sumDiscountLabel": "Descuento Débito Automático (-5%) :",
            "sumDeliveryLabel": "Delivery Areguá (+20% del abono) :",
            "sumProtLabel": "Doble Porción de Proteína :",
            "sumTotalLabel": "TOTAL A PAGAR :",
            "lblLegalAccept": "Acepto las <a href=\"#\" onclick=\"window.openLegalModal(); return false;\" style=\"color: var(--brand-blue-light); text-decoration: underline;\">condiciones legales & sanitarias</a> aplicables a gimnasios y gastronomía en Paraguay.",
            "btnSubmitOrder": "Confirmar Pedido & Enviar a WhatsApp (+595 995 620416)",
            "legalModalTitle": "Condiciones Legales & Reglamentarias (Paraguay)",
            "legalArt1Title": "1. Identificación y Establecimiento (Areguá, Paraguay)",
            "legalArt1Text": "El complejo <strong>« Olimpo Team Kickboxing & Restaurante del Olimpo »</strong> está ubicado sobre la Avenida Las Residentas, ciudad de Areguá, Departamento Central, República del Paraguay. Teléfono oficial de contacto y WhatsApp: +595 995 620416.",
            "legalArt2Title": "2. Reglamentación Sanitaria & Alimentaria (INAN / MSPyBS)",
            "legalArt2Text": "Todas las preparaciones culinarias servidas por el Restaurante del Olimpo cumplen rigurosamente con las normativas sanitarias dictadas por el <strong>Instituto Nacional de Alimentación y Nutrición (INAN)</strong> y el Ministerio de Salud Pública y Bienestar Social del Paraguay. Los macronutrientes se pesan y se preparan frescos en el día. Se respeta estrictamente la cadena de frío para todas las carnes frescas y productos fermentados.",
            "legalArt3Title": "3. Aptitud Física & Práctica de Deportes de Combate (Ley N° 2874/06 del Deporte)",
            "legalArt3Text": "De conformidad con las leyes deportivas del Paraguay, cada socio de las clases de <strong>Kickboxing K-1 Rules</strong> y <strong>Boxeo Tradicional Inglés</strong> manifiesta encontrarse en óptimas condiciones físicas y cardiovasculares. El uso de protecciones personales reglamentarias (vendas, bucal, guantes de boxeo) es obligatorio en sesiones de guanteo.",
            "legalArt4Title": "4. Débito Automático Bancard & Cancelaciones",
            "legalArt4Text": "Las membresías con « Débito Automático » cuentan con un 5% de descuento contractual. Los cobros recurrentes son procesados por <strong>Bancard vPOS Paraguay</strong> con certificación PCI-DSS. Podés cancelar o pausar el débito en cualquier momento por WhatsApp (+595 995 620416) con 48 hs de anticipación sin ninguna penalidad.",
            "legalArt5Title": "5. Facturación Legal (Ley N° 6380/19 de Modernización Tributaria)",
            "legalArt5Text": "Todas las operaciones cuentan con Factura Legal oficial paraguaya con IVA incluido (10% y 5%). Los clientes proporcionan su número de RUC o Cédula de Identidad (C.I.) al confirmar su orden.",
            "legalArt6Title": "6. Servicio de Delivery a Domicilio",
            "legalArt6Text": "El servicio de delivery cubre Areguá y alrededores con un recargo del 20% del valor del pedido. Los retiros directos en el club (Av. Las Residentas, Areguá) son 100% gratuitos en horarios de servicio (11:00 a 13:00 y 18:00 a 20:30).",
            "btnLegalClose": "Entendido y Acepto",
            "btnLightboxPdf": "📄 Abrir PDF Completo",
            "btnLightboxPng": "⬇ PNG",
            "btnLightboxClose": "Cerrar",
            "mobileStickyHome": "Inicio",
            "mobileStickyClub": "Club (150k)",
            "mobileStickyMenu": "Menú",
            "mobileStickyGains": "Ganancias",
            "mobileStickyOrder": "Pedir",
            "footerDesc": "El primer complejo de Areguá que combina ring de Kickboxing K-1, Boxeo Tradicional Inglés y cocina deportiva saludable calibrada a los macronutrientes.",
            "footerLoc": "📍 Sede: Av. Las Residentas, Areguá, Paraguay",
            "footerWa": "WhatsApp : +595 995 620416 (¡Sin Reserva Previa!)",
            "footerCol1Title": "Fighting Club",
            "footerLnkClub1": "Kickboxing K-1 Rules",
            "footerLnkClub2": "Boxeo Tradicional Inglés",
            "footerLnkClub3": "Bolsas Pesadas & Manoplas",
            "footerLnkClub4": "Horarios de Entrenamiento",
            "footerLnkClub5": "Membresía Club (150.000 ₲)",
            "footerCol2Title": "Restaurante Fit",
            "footerLnkResto1": "La Regla de Oro (1/3, 1/3, 1/3)",
            "footerLnkResto2": "Menú de la Semana",
            "footerLnkResto3": "Street-Food Proteico",
            "footerLnkResto4": "Bebidas de Recuperación",
            "footerLnkResto5": "Descargar Flyers Oficiales",
            "footerCol3Title": "Afiliados & Legal",
            "footerLnkAff1": "Programa Embajadores (15%)",
            "footerLnkAff2": "Calculador de Ganancias",
            "footerLnkAff3": "Generar Enlace Rastreado",
            "footerLnkAff4": "Condiciones Legales (Paraguay)",
            "footerLnkAff5": "Atención al Cliente & WhatsApp",
            "footerCopyright": "© 2026 Olimpo Team Kickboxing & Restaurante del Olimpo. Av. Las Residentas, Areguá, Paraguay.",
            "footerCroTag": "Arquitectura de alto rendimiento deportivo y nutrición real.",
            "affBannerGuest": "🤝 Invitado oficial de:",
            "affBannerBenefit": "• Tu beneficio de descuento y fidelidad está activo en tu pedido.",
            "marqueeItem1": "+50 combatientes del Olimpo",
            "marqueeItem2": "Pago flexible y seguro",
            "marqueeItem3": "Más que un club, una familia",
            "marqueeItem4": "K1",
            "marqueeItem5": "Kickboxing",
            "marqueeItem6": "Low kick",
            "marqueeItem7": "Boxeo",
            "marqueeItem8": "Comida & Preparaciones Deportivas",
            "marqueeItem9": "Preparación de Competición",
            "stuPortalBadge": "🎓 Espacio Alumno & Embajador Oficial",
            "stuLblAlias": "Tu Nombre o Alias Deportivo *",
            "stuLblPhone": "Tu Número de WhatsApp *",
            "stuLblPin": "Código PIN (4 dígitos)",
            "stuConnectedBadge": "🟢 Espacio Alumno Activo",
            "stuCodeLabel": "Tu Código de Referido para tus amigos:",
            "btnStuLogout": "🔄 Cambiar de cuenta",
            "stuAddRefTitle": "➕ Registrar un Amigo Referido (Club o Pack de Comidas)",
            "stuAddRefDesc": "¿Trajiste a un amigo al club o pidió un pack? Registralo acá para acreditar tu comisión en tu espacio y enviar la validación por WhatsApp:",
            "stuRefFriendLbl": "Nombre & Apellido de tu Referido *",
            "stuRefFriendPlaceholder": "Ej: Lucas Martínez",
            "stuRefPlanLbl": "Suscripción elegida por tu Referido *",
            "stuRefOptClub": "🥊 Membresía Club (150.000 ₲) → Tu Comisión: +22.500 ₲ (15%)",
            "stuRefOptPack1": "🥗 Pack 1 Plato/Día Mensual (500.000 ₲) → Tu Comisión: +50.000 ₲ (10%)",
            "stuRefOptPro": "⭐ Pack Fighter Pro Mensual (950.000 ₲) → Tu Comisión: +95.000 ₲ (10%)",
            "stuRefOptElite": "🏆 Combo Fighter Elite (1.100.000 ₲) → Tu Comisión: +117.500 ₲",
            "stuRefOptWeekly": "⚡ Pack Semanal (140k - 260k ₲) → Tu Comisión: +20.000 ₲ (10%)",
            "btnAddReferral": "✅ Validar este Referido",
            "lblCustRefCode": "Código de Referido / Alumno Olimpo (Opcional)",
            "custRefCodePlaceholder": "Ej: ALEX",
            "stuPhonePlaceholder": "Ej: +595 981 123456",
            "custPhonePlaceholder": "Ej: 0981 123456",
            "custCIPlaceholder": "Ej: 4.567.890-1",
            "memModalTitle": "👤 Mi Espacio Miembro & Afiliados",
            "memCardLoginTitle": "Iniciar Sesión",
            "memCardLoginSub": "Accedé a tu espacio miembro Olimpo",
            "lblClassicLogin": "Email o Usuario",
            "classicEmailPlaceholder": "ejemplo@email.com",
            "lblClassicPass": "Contraseña",
            "btnClassicLogin": "Iniciar sesión",
            "memFlipToSignup": "¿Todavía no tenés cuenta? Registrate gratis",
            "memCardSignupTitle": "Registro Gratuito",
            "memCardSignupSub": "Creá tu cuenta miembro en segundos",
            "lblClassicEmail": "Email",
            "lblClassicPassConfirm": "Confirmar contraseña",
            "btnClassicSignup": "Registrarse gratis",
            "memFlipToLogin": "¿Ya tenés una cuenta? Iniciá sesión",
            "memMyLinkLabel": "🔗 Tu Enlace Personal de Afiliado (10% a 15% de comisión)",
            "memMonthEndTitle": "Retiro de Ganancias a Fin de Mes",
            "memMonthEndDesc": "Podés retirar tus ganancias <strong>a fin de mes (del 25 al último día del mes)</strong>. ⚠️ <strong>Atención:</strong> si no retirás tus ganancias antes de que termine el mes, <strong>se eliminarán automáticamente (vuelven a 0 ₲)</strong> y deberás esperar al mes siguiente para retirar tus nuevas ganancias.",
            "btnWithdrawMonthEnd": "💸 Retirar mis ganancias de fin de mes",
            "btnMemOrderPack": "🥗 Pedir un Pack",
            "btnMemLogout": "🚪 Cerrar Sesión"
      },
      "fr": {
            "alertBar": "Cuota del día : 50 plats frais cuisinés chaque matin • Lundi au Samedi à Areguá • Sans Réservation requise",
            "navHome": "Accueil",
            "navFacility": "Le Complexe",
            "navFightClub": "Fight Club",
            "navRestoFit": "Restaurant",
            "navFlyers": "Flyers",
            "navPricing": "Tarifs",
            "navAffiliates": "Affiliation",
            "navContact": "Accès",
            "navJoin": "Rejoindre",
            "navBrandSub": "Club & Resto Fit",
            "heroTag": "Club de Combat & Nutrition Athlétique • Areguá",
            "heroTitle1": "MANGE, COMBAT, VIE",
            "heroTitleWarrior": "GUERRIER",
            "heroTitle2": "POUR",
            "heroTitleOlimpo": "L'OLYMPE !",
            "heroLead": "Le premier complexe d'Areguá fusionnant la rigueur du Kickboxing et de la Boxe avec une nutrition sportive calibrée aux macronutriments. Cuisiné frais sur place chaque matin.",
            "btnViewPacks": "Choisir un Plan",
            "btnGoToClub": "📍 Se rendre au club",
            "heroProofAthletes": "+50 Athlètes",
            "heroProofCommunity": "Communauté Olimpo",
            "heroDuoClubTitle": "Fighting Club",
            "heroDuoClubSub": "Kickboxing • Boxe Anglaise • 150k/mois",
            "heroDuoRestoTitle": "Restaurant Fit",
            "heroDuoRestoSub": "200g Poulet • Macros Pesés",
            "showcaseBadge": "Écosystème Olimpo",
            "showcaseLive": "Ouvert Lun - Sam",
            "showcaseSub": "Pack Fighter Pro (2 Plats/Jour)",
            "showcasePriceVal": "Dès 18.801 ₲ / plat",
            "btnShowcaseOrder": "Commander",
            "facilityTag": "PROJET EN EXPANSION & COMMUNAUTÉ COMBAT",
            "facilityTitle": "UN PROJET QUI GRANDIT AVEC VOUS <span>• LE CLUB EST DÉJÀ OUVERT !</span>",
            "facilityPunchline1": "→ Viens t'entraîner à combattre !",
            "facilityPunchline2": "→ Et nourris ton corps directement après ta séance !",
            "facilityDesc": "À l'Olympe, nous avons éliminé le plus grand obstacle des athlètes : s'entraîner dur puis gâcher ses efforts par manque de temps ou de repas adaptés. Notre complexe réunit sous le même toit une salle de combat et une cuisine sportive.",
            "evolutionBadge": "📐 PLANS DU PROJET & CLUB 100% OPÉRATIONNEL",
            "facilityProjectNotice": "Ces visuels représentent les <strong>plans architecturaux et la vision finale de notre complexe</strong>. Nous sommes encore en cours de travaux et d'aménagement, mais <strong>le club est d'ores et déjà 100% ouvert et opérationnel</strong> pour tous tes entraînements de Kickboxing K-1 et de Boxe Traditionnelle Anglaise. Viens faire partie des pionniers et participe directement à l'évolution du club !",
            "rotatorSlide1": "🥊 1. La Salle de Combat (Ring & Sacs) • Club Déjà Ouvert",
            "rotatorSlide2": "🥗 2. Le Restaurant Athlétique • En Cours de Finition",
            "rotatorHint": "Plans du projet • Rotation auto",
            "facilityCard1Badge": "1. Cœur du Complexe",
            "facilityCard1Title": "🥊 La Salle de Combat (Fighting Club)",
            "facilityCard1Desc": "Un espace pensé pour la rigueur pugilistique. Pas de gadgets inutiles : un ring de combat, des sacs de frappe lourds pour le conditionnement, des surfaces d'appuis fermes et des entraîneurs chevronnés dédiés au <strong>Kickboxing K-1</strong> et à la <strong>Boxe Traditionnelle Anglaise</strong>.",
            "facilityCard1Price": "Tarif Adhésion : 150.000 ₲ / mois • Jour d'essai gratuit disponible",
            "facilityCard2Badge": "2. Intégré à la Salle",
            "facilityCard2Title": "🥗 Le Restaurant Athlétique du Club",
            "facilityCard2Desc": "La cuisine du club opère chaque matin dès 06h00 pour concocter les 50 repas du jour. Chaque assiette respecte la Règle d'Or (1/3 Protéines, 1/3 Glucides propres, 1/3 Fibres et fruit). Tu manges exactement ce que ton métabolisme réclame pour réparer les tissus et exploser tes performances.",
            "facilityCard2Quote": "« S'entraîner c'est 50% du travail, l'autre moitié c'est de bien se nourrir. »",
            "clubPill": "Académie de Combat",
            "clubTitle": "FIGHTING CLUB <span>OLIMPO TEAM</span>",
            "clubSubtitle": "Développe une discipline d'acier, une vitesse explosive et une puissance musculaire sur le ring. Spécialisation rigoureuse en Kickboxing K-1 Rules et Boxe Traditionnelle Anglaise. Aucun combat au sol ni grappling : frappe pure, esquives et puissance.",
            "schedHeaderTitle": "Planning des Séances de Combat",
            "schedHeaderSub": "Entraînements du Lundi au Samedi au club (Av. Las Residentas, Areguá).",
            "btnBookTrial": "Réserver un Essai Gratuit",
            "schedSlot1": "🌅 Matin (07:00 – 08:30)",
            "schedClass1": "Condition Physique & Sacs de Frappe",
            "schedMeta1": "Cardio combat, renforcement du tronc et combinaisons aux sacs lourds.",
            "schedSlot2": "☀️ Midi (12:30 – 14:00)",
            "schedClass2": "Boxe Traditionnelle Anglaise",
            "schedMeta2": "Jeu de jambes, esquives rotatives et travail technique aux pattes d'ours.",
            "schedSlot3": "🌙 Soir (18:00 – 19:30)",
            "schedClass3": "Kickboxing K-1 Rules Collectif",
            "schedMeta3": "Cours phare : poings-pieds, balayages, enchaînements et haute intensité.",
            "schedSlot4": "🔥 Avancé (19:30 – 21:00)",
            "schedClass4": "Sparring Contrôlé & Perfectionnement",
            "schedMeta4": "Assauts souples avec protections intégrales et mise en situation de ring.",
            "restoPill": "Nutrition Sportive",
            "restoTitle": "RESTAURANT DE L'<span>OLYMPE</span>",
            "restoSubtitle": "La vraie alimentation dont ton corps a besoin après l'effort. Des repas frais cuisinés chaque matin avec des ingrédients sains, sans huiles industrielles et pesés au gramme près.",
            "goldenRuleTitle": "La Règle d'Or de l'Assiette Athlétique Olympe",
            "goldenRuleSubtitle": "Équilibre métabolique pensé pour sécher le tissu adipeux et réparer les fibres musculaires.",
            "triadBadge1": "1/3 de l'Assiette",
            "triadTitle1": "Protéines Pures",
            "triadDesc1": "Blanc de poulet grillé (200g), bœuf maigre ou œufs frais pour la reconstruction musculaire.",
            "triadBadge2": "1/3 de l'Assiette",
            "triadTitle2": "Glucides Propres",
            "triadDesc2": "Riz blanc vapeur, pâtes au wok ou manioc fondant pour recharger les réserves de glycogène.",
            "triadBadge3": "1/3 de l'Assiette",
            "triadTitle3": "Fibres & Vitamines",
            "triadDesc3": "Salades croquantes fraîches, légumes sautés au wok et fruits de saison entiers (orange, pomme, banane).",
            "goalsHeaderTitle": "Calibre Ton Assiette Selon Ton Objectif Actuel",
            "goalsHeaderSub": "Clique sur ton profil pour voir comment nous équilibrons tes portions en cuisine :",
            "goalTabWeightLoss": "1. Perte de Poids",
            "goalTabCutting": "2. Sèche & Définition",
            "goalTabMaintenance": "3. Maintien (Règle d'Or)",
            "goalTabBulking": "4. Prise de Masse",
            "macroLabelProt": "Protéine",
            "macroLabelCarbs": "Glucides",
            "macroLabelVeg": "Fibres & Fruit",
            "tabAllDishes": "Tous les Plats",
            "tabMonday": "Lundi",
            "tabTuesday": "Mardi",
            "tabWednesday": "Mercredi",
            "tabThursday": "Jeudi",
            "tabFriday": "Vendredi",
            "tabSaturday": "Samedi",
            "flyersPill": "Support Officiel Imprimable",
            "flyersTitle": "FLYER OFFICIEL <span>RECTO & VERSO (PDF)</span>",
            "flyersSubtitle": "Menu complet et formules d'abonnement réunis sur 1 seule feuille recto/verso (PDF 2 pages A4 prêt à imprimer ou partager).",
            "btnOpenPdf": "Voir le menu",
            "pdfHint": "Document officiel en haute résolution • Format A4 Recto/Verso",
            "pricingPill": "Tarifs & Abonnements",
            "pricingTitle": "PLANS D'<span>ABONNEMENT</span>",
            "pricingSubtitle": "Choisis ton plan. Active le <strong>débit automatique Bancard</strong> pour bénéficier d'une remise fidélité de 5% et sécuriser tes entraînements et repas frais sans coupure.",
            "cycleWeekly": "Semaine (6 Jours)",
            "cycleMonthly": "Mois Complet (Lun au Sam)",
            "adControlTitle": "💳 Débit Automatique Bancard :",
            "adControlDisc": "5% de Remise Immédiate Incluse",
            "planTypeClub": "Académie de Combat",
            "planTitleClub": "Club Kickboxing & Boxe",
            "planFeatClub1": "Accès libre aux cours de <strong>Kickboxing K-1 Rules</strong>",
            "planFeatClub2": "Cours de <strong>Boxe Traditionnelle Anglaise</strong>",
            "planFeatClub3": "Accès au ring, sacs lourds de 60kg et leçons de frappe",
            "planFeatClub4": "Jour d'essai gratuit offert sans engagement",
            "planFeatClub5": "Encadrement technique par des combattants d'expérience",
            "btnSelectClub": "S'inscrire au Club (150k)",
            "planType1Plato": "Nutrition Quotidienne",
            "planTitle1Plato": "Pack 1 Plat / Jour",
            "planFeat1Plato1": "1 repas complet par jour : Déjeuner ou Dîner",
            "planFeat1Plato2": "Recettes tournantes fraîches du Lundi au Samedi",
            "planFeat1Plato3": "200g de protéine pure + glucides propres + salade",
            "planFeat1Plato4": "Fruits de saison frais inclus à chaque repas",
            "planFeat1Plato5": "Retrait direct à la salle ou livraison (+20%)",
            "btnSelect1Plato": "Choisir 1 Plat/Jour",
            "ribbonPopular": "⭐ Plan le Plus Populaire",
            "planTypeFighterPro": "Athlète & Combattant",
            "planTitleFighterPro": "Fighter Pro (2 Plats)",
            "planFeatFighter1": "<strong>2 repas complets par jour :</strong> Midi + Soir",
            "planFeatFighter2": "Zéro courses, zéro corvée de cuisine après l'entraînement",
            "planFeatFighter3": "Stop au catabolisme nocturne : récupération maximale",
            "planFeatFighter4": "Plats chauds hermétiques prêts à emporter",
            "planFeatFighter5": "Tarif ultra-compétitif : moins de 19.000 ₲ le repas sain",
            "btnSelectFighter": "Choisir Fighter Pro",
            "ribbonElite": "🏆 Transformation Totale",
            "planTypeElite": "Pack Hybride Ultime",
            "planTitleElite": "Combo Fighter Elite",
            "planFeatElite1": "<strong>Accès complet illimité</strong> aux cours de Kickboxing & Boxe",
            "planFeatElite2": "<strong>2 repas athlétiques par jour</strong> préparés à la salle",
            "planFeatElite3": "Suivi mensuel de composition corporelle et poids",
            "planFeatElite4": "Priorité de service en cuisine et à la livraison",
            "planFeatElite5": "L'expérience totale de l'Olympe au meilleur prix",
            "btnSelectElite": "Choisir le Pack Elite",
            "affPill": "Revenus Passifs",
            "affTitle": "PROGRAMME D'<span>AMBASSADEURS & AFFILIATION</span>",
            "affSubtitle": "Tu t'entraînes au club ou tu adores nos plats ? Invite tes amis, tes partenaires de combat et tes collègues et <strong>touche jusqu'à 15% de commission récurrente</strong> chaque mois tant qu'ils restent abonnés.",
            "affHowTitle": "Comment Fonctionne le Système d'Affiliation ?",
            "affHowSteps": "1. Génère ton lien de parrainage exclusif ci-dessous.<br>2. Partage-le sur WhatsApp, Instagram ou directement au club.<br>3. Dès qu'un filleul commande son pack de repas ou s'inscrit au club, ta commission est créditée automatiquement.<br>4. Retire tes gains quand tu veux par virement bancaire SIPAP, portefeuille Tigo Money ou en espèces à la réception du club.",
            "affStat1Label": "Commissions Packs Nutrition",
            "affStat2Label": "Commissions Abonnements Club",
            "affStat3Num": "Mois après Mois",
            "affStat3Label": "Rémunération Récurrente",
            "affStat4Label": "Paiement Direct au Paraguay",
            "calcTitle": "Simulateur de Gains Mensuels par Filleuls",
            "calcLabelMeals": "Amis abonnés aux repas (Packs de nutrition) :",
            "calcLabelClub": "Amis inscrits aux cours de Kickboxing & Boxe :",
            "calcResultLabel": "Revenus Estimés Par Mois :",
            "calcResultNote": "Avec quelques personnes parrainées, ton propre abonnement et tes repas te reviennent totalement GRATUITS avec de l'argent en plus !",
            "linkGenTitle": "Crée ou Connecte Ton Espace Élève pour Générer Ton Lien",
            "linkGenSub": "Inscris ton prénom/pseudo et ton WhatsApp pour activer ton compte ambassadeur, générer ton lien unique et suivre tes vrais filleuls :",
            "affAliasPlaceholder": "Ex: GUERRIER_ALEX",
            "btnGenLink": "🎓 Activer Mon Espace & Mon Lien",
            "btnCopyLink": "📋 Copier le Lien",
            "btnShareWa": "📲 Partager sur WhatsApp",
            "dashTitle": "Tableau de Bord de Tes Parrainages Réels",
            "btnWithdraw": "💸 Demander un Virement de Gains",
            "dashClicks": "Clics sur ton lien",
            "dashSignups": "Filleuls inscrits",
            "dashTotalEarn": "Commissions totales",
            "dashBalance": "Solde disponible",
            "contactPill": "Accès & Contact",
            "contactTitle": "REJOINS L'<span>OLYMPE À AREGUÁ</span>",
            "contactSubtitle": "Adresse officielle : <strong>Av. Las Residentas, Areguá</strong>, Paraguay. Retrait sur place au club ou service de livraison à domicile (+20%).",
            "contactHoursTitle": "Localisation & Horaires du Club",
            "contactLocLabel": "📍 Emplacement :",
            "contactLocVal": "Av. Las Residentas, Areguá",
            "contactLunchLabel": "Service Midi (Déjeuner) :",
            "contactDinnerLabel": "Service Soir (Dîner) :",
            "contactDaysLabel": "Jours d'Ouverture :",
            "contactDaysVal": "Lundi au Samedi",
            "contactSundayLabel": "Dimanche :",
            "contactSundayVal": "Fermé (Repos du Guerrier)",
            "contactDeliveryLabel": "Service Livraison :",
            "contactDeliveryVal": "+20% du montant de commande",
            "btnGoogleMaps": "📍 Voir dans Google Maps",
            "btnWaze": "🚗 Voir dans Waze",
            "btnContactWa": "💬 Écrire sur WhatsApp (+595 995 620416)",
            "faqTitle": "Questions Fréquentes",
            "faqQ1": "Faut-il réserver à l'avance pour manger ou s'entraîner ?",
            "faqA1": "Non. La règle officielle du complexe est <strong>Sans Réservation</strong>. Viens directement sur place (Av. Las Residentas, Areguá) pour ton premier cours d'essai ou pour manger ton plat du jour.",
            "faqQ2": "Puis-je commander des repas sans m'inscrire au club ?",
            "faqA2": "Tout à fait ! Tu peux souscrire à un pack de nutrition seul (1 ou 2 plats/jour) ou commander des plats à l'unité dès 7.000 ₲ à 25.000 ₲. Tous les 5 plats achetés, le 6ème est 100% OFFERT !",
            "faqQ3": "Combien coûte l'adhésion au club de Kickboxing & Boxe ?",
            "faqA3": "L'adhésion mensuelle est de <strong>150.000 ₲ / mois</strong> (150k PYG) en accès libre à tous les cours. Le premier jour d'essai est 100% gratuit.",
            "faqQ4": "Comment fonctionne le débit automatique Bancard ?",
            "faqA4": "Il est sécurisé par Bancard Paraguay avec cryptage PCI-DSS. Tu profites d'une remise immédiate de 5% sur ton abonnement et tu peux annuler ou suspendre à tout moment sans frais.",
            "modalTitle": "Inscription & Paiement Sécurisé (Paraguay)",
            "step1Badge": "Étape 1",
            "step1Title": "Entraînement au Club de Combat (Areguá)",
            "step1Desc": "Kickboxing K-1 Rules & Boxe Traditionnelle Anglaise. Ring de frappe et sacs lourds.",
            "quoteMain": "« S'entraîner c'est 50% du travail, l'autre moitié c'est de bien se nourrir. »",
            "quoteSub": "« S'entraîner dur sans bien manger, c'est comme ramer sans rames ! » — Règle d'or de l'Olympe",
            "step2Badge": "Étape 2",
            "step2Title": "Choisis ton Programme Nutritif (Cuisine du Club)",
            "lblSelectDish": "Sélectionne ton Plat ou Street-Food :",
            "lblPlateQuantity": "Nombre de Plats (5 achetés = le 6ème OFFERT !) :",
            "adTitle": "🔄 Activer le Débit Automatique Bancard (-5% de remise)",
            "adSub": "Renouvellement automatique chaque mois. Résiliable à tout moment en 1 clic.",
            "blockServices": "3. Services & Livraison",
            "lblDelivery": "<strong>Service Livraison à Domicile (+20% de l'abonnement)</strong> — Retrait au club gratuit sinon.",
            "lblDoubleProt": "Double Portion de Protéine (+2x Viande/Poulet : +10.000 ₲ par repas)",
            "blockCustomer": "4. Vos Coordonnées",
            "lblCustName": "Nom & Prénom *",
            "custNamePlaceholder": "Ex: Jean Dupont",
            "lblCustPhone": "WhatsApp / Téléphone *",
            "lblCustCI": "C.I. ou RUC (pour la facture paraguayenne) *",
            "lblCustAddress": "Adresse de Livraison ou Retrait au Club",
            "custAddressPlaceholder": "Ex: Retrait au club d'Areguá ou adresse complète",
            "blockPayment": "5. Moyen de Paiement Localisé au Paraguay",
            "gwBancard": "Bancard vPOS",
            "gwSipap": "SIPAP Virement",
            "gwTigo": "Tigo Money",
            "gwQr": "QR Bancard",
            "txtBancardTitle": "🔒 Passerelle Officielle Bancard vPOS (Cartes de Crédit & Débit Paraguay)",
            "lblCardNum": "Numéro de Carte (Visa, Mastercard, Panal, Cabal)",
            "lblCardExp": "Date d'expiration (MM/AA)",
            "lblCardCvv": "Code CVV",
            "txtBancardSecurity": "✓ Tokenisation sécurisée PCI-DSS certifiée par Bancard Paraguay. Prêt pour débit automatique.",
            "txtSipapTitle": "🏦 Coordonnées Bancaires SIPAP (Virement Interbancaire en Guaraníes) :",
            "sipapBankLabel": "Banque :",
            "sipapHolderLabel": "Titulaire :",
            "sipapRucLabel": "RUC :",
            "sipapAccountLabel": "Caisse d'Épargne Gs :",
            "sipapCityLabel": "Lieu :",
            "btnCopySipap": "📋 Copier les Données SIPAP pour Virer",
            "txtTigoTitle": "📱 Débit Instantané sur Portefeuille Mobile (Tigo Money / Personal) :",
            "lblTigoPhone": "Numéro de Téléphone Portefeuille (Paraguay)",
            "txtTigoNote": "Une notification push sera envoyée sur votre téléphone pour saisir votre code PIN et approuver le paiement.",
            "txtQrTitle": "📲 Scannez depuis l'application de votre banque au Paraguay (QR Simple)",
            "txtQrCompatible": "Compatible avec Itaú, Continental, Ueno, Familiar, Sudameris, Atlas et GNB.",
            "sumDiscountLabel": "Remise Débit Automatique (-5%) :",
            "sumDeliveryLabel": "Livraison Areguá (+20% abonnement) :",
            "sumProtLabel": "Double Portion Protéine :",
            "sumTotalLabel": "TOTAL À RÉGLER :",
            "lblLegalAccept": "J'accepte les <a href=\"#\" onclick=\"window.openLegalModal(); return false;\" style=\"color: var(--brand-blue-light); text-decoration: underline;\">conditions légales & sanitaires</a> applicables aux clubs de sport et à la restauration au Paraguay.",
            "btnSubmitOrder": "Valider la Commande & Transmettre sur WhatsApp (+595 995 620416)",
            "legalModalTitle": "Conditions Légales & Réglementaires (Paraguay)",
            "legalArt1Title": "1. Identification et Établissement (Areguá, Paraguay)",
            "legalArt1Text": "Le complexe <strong>« Olimpo Team Kickboxing & Restaurante del Olimpo »</strong> est situé sur l'Avenida Las Residentas, ville d'Areguá, Département Central, République du Paraguay. Téléphone officiel de contact et WhatsApp : +595 995 620416.",
            "legalArt2Title": "2. Réglementation Sanitaire & Alimentaire (INAN / MSPyBS)",
            "legalArt2Text": "Toutes les préparations culinaires servies par le Restaurante del Olimpo respectent les normes d'hygiène et de manipulation des aliments édictées par l'<strong>Instituto Nacional de Alimentación y Nutrición (INAN)</strong> et le Ministère de la Santé Publique et du Bien-être Social du Paraguay. Les macronutriments sont pesés et préparés le jour même. La chaîne du froid est strictement observée pour l'ensemble des viandes fraîches (poulet, bœuf) et produits laitiers (kéfir artisanal).",
            "legalArt3Title": "3. Aptitude Physique & Pratique des Sports de Combat (Ley N° 2874/06 del Deporte)",
            "legalArt3Text": "Conformément aux lois paraguayennes régissant les activités physiques et sportives, tout adhérent aux cours de <strong>Kickboxing K-1 Rules</strong> et de <strong>Boxe Traditionnelle Anglaise</strong> atteste être en bonne condition cardiovasculaire et apte à la pratique sportive d'intensité modérée à haute. Le port des protections individuelles (bandes, protège-dents, gants réglementaires) est obligatoire lors des séances de sparring contrôlé.",
            "legalArt4Title": "4. Débit Automatique Bancard & Modalités d'Annulation",
            "legalArt4Text": "Les abonnements souscrits avec l'option « Débit Automatique » bénéficient d'une réduction contractuelle de 5%. Les règlements sont opérés de manière récurrente via la plateforme sécurisée <strong>Bancard vPOS Paraguay</strong> (certifiée PCI-DSS). L'utilisateur peut suspendre ou annuler son prélèvement automatique à tout moment par simple message WhatsApp au +595 995 620416 au moins 48 heures avant la date de renouvellement, sans aucune pénalité de sortie.",
            "legalArt5Title": "5. Facturation Légale (Ley N° 6380/19 de Modernización Tributaria)",
            "legalArt5Text": "Toutes les opérations font l'objet d'une Factura Legal officielle (Tributación Paraguay - DNIT) avec TVA incluse (10% et 5%). Les adhérents et clients fournissent leur numéro de RUC ou Cédula de Identidad (C.I.) lors de la validation pour l'émission fiscale.",
            "legalArt6Title": "6. Service de Livraison à Domicile",
            "legalArt6Text": "Le service de livraison couvre le périmètre d'Areguá et environs immédiats avec un supplément de 20% du montant de l'abonnement ou commande. Les retraits directs au club (Av. Las Residentas, Areguá) sont 100% gratuits aux horaires de service (11h00-13h00 et 18h00-20h30).",
            "btnLegalClose": "J'ai compris et j'accepte",
            "btnLightboxPdf": "📄 Ouvrir le PDF Complet",
            "btnLightboxPng": "⬇ PNG",
            "btnLightboxClose": "Fermer",
            "mobileStickyHome": "Accueil",
            "mobileStickyClub": "Club (150k)",
            "mobileStickyMenu": "Menu",
            "mobileStickyGains": "Gains",
            "mobileStickyOrder": "Commander",
            "footerDesc": "Le premier complexe d'Areguá combinant ring de Kickboxing K-1, Boxe Traditionnelle Anglaise et cuisine saine calibrée aux macronutriments pour athlètes.",
            "footerLoc": "📍 Sede: Av. Las Residentas, Areguá, Paraguay",
            "footerWa": "WhatsApp : +595 995 620416 (¡Sans Réservation!)",
            "footerCol1Title": "Fighting Club",
            "footerLnkClub1": "Kickboxing K-1 Rules",
            "footerLnkClub2": "Boxe Traditionnelle Anglaise",
            "footerLnkClub3": "Sacs Lourds & Pattes d'Ours",
            "footerLnkClub4": "Planning des Entraînements",
            "footerLnkClub5": "Adhésion Club (150.000 ₲)",
            "footerCol2Title": "Restaurant Fit",
            "footerLnkResto1": "La Règle d'Or (1/3, 1/3, 1/3)",
            "footerLnkResto2": "Carte de la Semaine",
            "footerLnkResto3": "Street-Food Protéinée",
            "footerLnkResto4": "Boissons Récupération",
            "footerLnkResto5": "Télécharger les Flyers",
            "footerCol3Title": "Affiliation & Légal",
            "footerLnkAff1": "Programme Ambassadeur (15%)",
            "footerLnkAff2": "Calculateur de Gains",
            "footerLnkAff3": "Générer son Lien Tracké",
            "footerLnkAff4": "Conditions Légales (Paraguay)",
            "footerLnkAff5": "Service Client & WhatsApp",
            "footerCopyright": "© 2026 Olimpo Team Kickboxing & Restaurant de l'Olympe. Av. Las Residentas, Areguá, Paraguay.",
            "footerCroTag": "Architecture marketing CRO & alternance visuelle sobre.",
            "affBannerGuest": "🤝 Invité officiel de :",
            "affBannerBenefit": "• Ton avantage fidélité et remise est actif sur ta commande.",
            "marqueeItem1": "+50 combattants de l'Olimpo",
            "marqueeItem2": "Paiement flexible et sécurisé",
            "marqueeItem3": "Plus qu'un club, une famille",
            "marqueeItem4": "K1",
            "marqueeItem5": "Kickboxing",
            "marqueeItem6": "Low kick",
            "marqueeItem7": "Boxe",
            "marqueeItem8": "Nourriture & Préparations Sportives",
            "marqueeItem9": "Préparation Compétition",
            "stuPortalBadge": "🎓 Espace Élève & Ambassadeur Officiel",
            "stuLblAlias": "Ton Prénom ou Pseudo Sportif *",
            "stuLblPhone": "Ton Numéro WhatsApp *",
            "stuLblPin": "Code PIN (4 chiffres)",
            "stuConnectedBadge": "🟢 Espace Élève Actif",
            "stuCodeLabel": "Ton Code Parrain à donner à tes amis :",
            "btnStuLogout": "🔄 Changer de compte",
            "stuAddRefTitle": "➕ Enregistrer un Filleul Parrainé (Club ou Pack Repas)",
            "stuAddRefDesc": "Tu as amené un ami au club ou il a commandé un pack ? Enregistre-le ici pour créditer ta commission dans ton espace et envoyer la validation sur WhatsApp :",
            "stuRefFriendLbl": "Nom & Prénom de ton Filleul *",
            "stuRefFriendPlaceholder": "Ex: Lucas Martinez",
            "stuRefPlanLbl": "Abonnement souscrit par ton Filleul *",
            "stuRefOptClub": "🥊 Abonnement Club (150.000 ₲) → Ta Commission : +22.500 ₲ (15%)",
            "stuRefOptPack1": "🥗 Pack 1 Plat/Jour Mensuel (500.000 ₲) → Ta Commission : +50.000 ₲ (10%)",
            "stuRefOptPro": "⭐ Pack Fighter Pro Mensuel (950.000 ₲) → Ta Commission : +95.000 ₲ (10%)",
            "stuRefOptElite": "🏆 Combo Fighter Elite (1.100.000 ₲) → Ta Commission : +117.500 ₲",
            "stuRefOptWeekly": "⚡ Pack Semaine (140k - 260k ₲) → Ta Commission : +20.000 ₲ (10%)",
            "btnAddReferral": "✅ Valider ce Filleul",
            "lblCustRefCode": "Code Parrain / Élève Olimpo (Optionnel)",
            "custRefCodePlaceholder": "Ex: ALEX",
            "stuPhonePlaceholder": "Ex: +595 981 123456",
            "custPhonePlaceholder": "Ex: 0981 123456",
            "custCIPlaceholder": "Ex: 4.567.890-1",
            "memModalTitle": "👤 Mon Espace Membre & Affiliation",
            "memCardLoginTitle": "Connexion",
            "memCardLoginSub": "Accède à ton espace membre Olimpo",
            "lblClassicLogin": "Email ou Identifiant",
            "classicEmailPlaceholder": "exemple@email.com",
            "lblClassicPass": "Mot de passe",
            "btnClassicLogin": "Se connecter",
            "memFlipToSignup": "Pas encore de compte ? Inscris-toi gratuitement",
            "memCardSignupTitle": "Inscription Gratuite",
            "memCardSignupSub": "Crée ton compte membre en quelques secondes",
            "lblClassicEmail": "Email",
            "lblClassicPassConfirm": "Confirmer le mot de passe",
            "btnClassicSignup": "S'inscrire gratuitement",
            "memFlipToLogin": "Déjà un compte ? Connecte-toi",
            "memMyLinkLabel": "🔗 Ton Lien Personnel d'Affiliation (10% à 15% de commission)",
            "memMonthEndTitle": "Retrait des Profits en Fin de Mois",
            "memMonthEndDesc": "Tu peux venir retirer tes profits <strong>en fin de mois (du 25 au dernier jour du mois)</strong>. ⚠️ <strong>Attention :</strong> si tu ne retires pas tes profits avant la fin du mois, ils seront <strong>supprimés automatiquement à la fin du mois (remis à 0 ₲)</strong> et tu devras attendre la fin du mois prochain pour retirer tes nouveaux gains.",
            "btnWithdrawMonthEnd": "💸 Retirer mes profits de fin de mois",
            "btnMemOrderPack": "🥗 Commander un Pack",
            "btnMemLogout": "🚪 Déconnexion"
      },
      "en": {
            "alertBar": "Daily capacity: 50 fresh meals cooked every morning • Monday to Saturday in Areguá • No reservation required",
            "navHome": "Home",
            "navFacility": "The Complex",
            "navFightClub": "Fight Club",
            "navRestoFit": "Restaurant",
            "navFlyers": "Flyers",
            "navPricing": "Pricing",
            "navAffiliates": "Affiliates",
            "navContact": "Location",
            "navJoin": "Join Club",
            "navBrandSub": "Club & Fit Resto",
            "heroTag": "Combat Club & Athletic Nutrition • Areguá",
            "heroTitle1": "EAT, FIGHT, LIVE",
            "heroTitleWarrior": "BODY",
            "heroTitle2": "FOR",
            "heroTitleOlimpo": "OLIMPO!",
            "heroLead": "The first complex in Areguá fusing the rigor of Kickboxing and Boxing with sports nutrition calibrated to macronutrients. Cooked fresh on-site every morning.",
            "btnViewPacks": "Choose a Plan",
            "btnGoToClub": "📍 Get Directions (GPS)",
            "heroProofAthletes": "+50 Athletes",
            "heroProofCommunity": "Olimpo Community",
            "heroDuoClubTitle": "Fighting Club",
            "heroDuoClubSub": "Kickboxing • Boxing • 150k/mo",
            "heroDuoRestoTitle": "Fit Restaurant",
            "heroDuoRestoSub": "200g Chicken • Weighed Macros",
            "showcaseBadge": "Olimpo Ecosystem",
            "showcaseLive": "Open Mon - Sat",
            "showcaseSub": "Fighter Pro Pack (2 Meals/Day)",
            "showcasePriceVal": "From 18,801 ₲ / meal",
            "btnShowcaseOrder": "Order Now",
            "facilityTag": "EXPANDING PROJECT & ACTIVE FIGHT COMMUNITY",
            "facilityTitle": "A PROJECT GROWING WITH YOU <span>• THE CLUB IS ALREADY OPEN & ACTIVE!</span>",
            "facilityPunchline1": "→ Come train to fight!",
            "facilityPunchline2": "→ And fuel your body right after your session!",
            "facilityDesc": "At Olimpo, we eliminated the biggest obstacle for athletes: training hard and wasting efforts due to poor nutrition and lack of time. Our complex unites under one roof a fight club and athletic sports kitchen.",
            "evolutionBadge": "📐 MASTERPLAN BLUEPRINTS • CLUB 100% OPERATIONAL",
            "facilityProjectNotice": "These visuals showcase the <strong>architectural masterplan and final vision of our complex</strong>. We are actively finishing build-out, but <strong>the club is 100% open and fully operational for all daily fight workouts</strong> (K-1 Kickboxing & Traditional Boxing). Join the Olimpo community from day one and take part in the club’s evolution!",
            "rotatorSlide1": "🥊 1. Combat Training Gym (Ring & Bags) • Open Now",
            "rotatorSlide2": "🥗 2. Integrated Fit Restaurant • Finishing Works",
            "rotatorHint": "Project masterplan • Auto rotation",
            "facilityCard1Badge": "1. Heart of the Complex",
            "facilityCard1Title": "🥊 The Combat Gym (Fighting Club)",
            "facilityCard1Desc": "A space engineered for strict striking discipline. No useless gimmicks: an official boxing ring, heavy bags for conditioning, firm mat surfaces, and dedicated coaches in <strong>K-1 Kickboxing</strong> and <strong>Traditional Boxing</strong>.",
            "facilityCard1Price": "Membership Rate: 150,000 ₲ / month • Free trial day available",
            "facilityCard2Badge": "2. Integrated with the Gym",
            "facilityCard2Title": "🥗 The Club's Athletic Restaurant",
            "facilityCard2Desc": "The club kitchen begins at 06:00 every morning to cook the day's 50 fresh meals. Every plate follows the Golden Rule (1/3 Pure Protein, 1/3 Clean Carbs, 1/3 Fiber & Fruit). You get the exact metabolic fuel to repair muscle and elevate performance.",
            "facilityCard2Quote": "« Training is 50% of the work, the other half is proper nutrition. »",
            "clubPill": "Fight Academy",
            "clubTitle": "FIGHTING CLUB <span>OLIMPO TEAM</span>",
            "clubSubtitle": "Develop iron discipline, explosive speed and ring power. Strict specialization in K-1 Rules Kickboxing and Traditional Boxing. No ground combat, no grappling: pure striking and evasions.",
            "schedHeaderTitle": "Combat Training Schedule",
            "schedHeaderSub": "Workouts Monday to Saturday at the gym (Av. Las Residentas, Areguá).",
            "btnBookTrial": "Book a Free Trial Session",
            "schedSlot1": "🌅 Morning (07:00 – 08:30)",
            "schedClass1": "Physical Conditioning & Heavy Bags",
            "schedMeta1": "Combat cardio, core strengthening, and power combinations on heavy bags.",
            "schedSlot2": "☀️ Midday (12:30 – 14:00)",
            "schedClass2": "Traditional English Boxing",
            "schedMeta2": "Footwork drills, slipping and rolling, and focused mitt precision.",
            "schedSlot3": "🌙 Evening (18:00 – 19:30)",
            "schedClass3": "K-1 Rules Group Kickboxing",
            "schedMeta3": "Flagship class: punches, kicks, sweeps, combinations and high intensity.",
            "schedSlot4": "🔥 Advanced (19:30 – 21:00)",
            "schedClass4": "Controlled Sparring & Technique Refinement",
            "schedMeta4": "Light technical sparring with full protective gear and ring scenarios.",
            "restoPill": "Sports Nutrition",
            "restoTitle": "OLIMPO <span>RESTAURANT</span>",
            "restoSubtitle": "Real athletic nutrition your body needs after hard training. Fresh meals cooked every morning with clean ingredients, zero industrial fry oils and weighed to the gram.",
            "goldenRuleTitle": "The Golden Rule of the Olimpo Athlete Plate",
            "goldenRuleSubtitle": "Metabolic balance formulated to shed body fat and repair muscle fibers.",
            "triadBadge1": "1/3 of Plate",
            "triadTitle1": "Pure Proteins",
            "triadDesc1": "Grilled chicken breast (200g), lean beef, or fresh eggs for rapid muscle repair.",
            "triadBadge2": "1/3 of Plate",
            "triadTitle2": "Clean Carbs",
            "triadDesc2": "Steamed white rice, wok noodles, or tender cassava to replenish glycogen stores.",
            "triadBadge3": "1/3 of Plate",
            "triadTitle3": "Fibers & Vitamins",
            "triadDesc3": "Crisp fresh salads, sautéed wok vegetables, and whole seasonal fruit (orange, apple, banana).",
            "goalsHeaderTitle": "Calibrate Your Plate According to Your Goal",
            "goalsHeaderSub": "Click your profile to see how our kitchen balances your portions:",
            "goalTabWeightLoss": "1. Weight Loss",
            "goalTabCutting": "2. Cutting & Definition",
            "goalTabMaintenance": "3. Maintenance (Golden Rule)",
            "goalTabBulking": "4. Muscle & Mass Gain",
            "macroLabelProt": "Protein",
            "macroLabelCarbs": "Carbohydrates",
            "macroLabelVeg": "Fibers & Fruit",
            "tabAllDishes": "All Dishes",
            "tabMonday": "Monday",
            "tabTuesday": "Tuesday",
            "tabWednesday": "Wednesday",
            "tabThursday": "Thursday",
            "tabFriday": "Friday",
            "tabSaturday": "Saturday",
            "flyersPill": "Official Printable Asset",
            "flyersTitle": "OFFICIAL FLYER <span>FRONT & BACK (PDF)</span>",
            "flyersSubtitle": "Complete weekly menu and subscription packs consolidated on a single 2-sided sheet (2-page A4 PDF ready to print or share).",
            "btnOpenPdf": "View the menu",
            "pdfHint": "Official high-resolution document • A4 Front & Back format",
            "pricingPill": "Rates & Memberships",
            "pricingTitle": "SUBSCRIPTION <span>PLANS</span>",
            "pricingSubtitle": "Choose your plan. Activate <strong>Bancard auto-debit</strong> to get an immediate 5% discount and secure your uninterrupted workouts and fresh meals.",
            "cycleWeekly": "Weekly (6 Days)",
            "cycleMonthly": "Full Month (Mon to Sat)",
            "adControlTitle": "💳 Bancard Auto-Debit:",
            "adControlDisc": "5% Instant Discount Included",
            "planTypeClub": "Fight Academy",
            "planTitleClub": "Kickboxing & Boxing Club",
            "planFeatClub1": "Full access to <strong>K-1 Rules Kickboxing</strong> classes",
            "planFeatClub2": "<strong>Traditional Boxing</strong> training sessions",
            "planFeatClub3": "Access to official ring, 60kg heavy bags & pad work",
            "planFeatClub4": "1st Free trial day included without commitment",
            "planFeatClub5": "Technical coaching by experienced fighters",
            "btnSelectClub": "Join the Club (150k)",
            "planType1Plato": "Daily Nutrition",
            "planTitle1Plato": "1 Meal / Day Pack",
            "planFeat1Plato1": "1 complete athlete meal per day: Lunch or Dinner",
            "planFeat1Plato2": "Rotating fresh menu from Monday to Saturday",
            "planFeat1Plato3": "200g pure protein + clean carbs + fresh salad",
            "planFeat1Plato4": "Fresh seasonal fruits included with every meal",
            "planFeat1Plato5": "Direct club pickup or home delivery (+20%)",
            "btnSelect1Plato": "Choose 1 Meal/Day",
            "ribbonPopular": "⭐ Most Popular Plan",
            "planTypeFighterPro": "Athlete & Fighter",
            "planTitleFighterPro": "Fighter Pro (2 Meals)",
            "planFeatFighter1": "<strong>2 complete meals per day:</strong> Lunch + Dinner",
            "planFeatFighter2": "Zero grocery shopping, zero cooking after tough workouts",
            "planFeatFighter3": "Prevent nocturnal catabolism: maximum muscle recovery",
            "planFeatFighter4": "Sealed hot containers ready to eat or take away",
            "planFeatFighter5": "Ultra-competitive rate: under 19,000 ₲ per clean meal",
            "btnSelectFighter": "Choose Fighter Pro",
            "ribbonElite": "🏆 Total Transformation",
            "planTypeElite": "Ultimate Hybrid Pack",
            "planTitleElite": "Fighter Elite Combo",
            "planFeatElite1": "<strong>Full unlimited access</strong> to Kickboxing & Boxing",
            "planFeatElite2": "<strong>2 athletic meals per day</strong> cooked fresh at the gym",
            "planFeatElite3": "Monthly body composition and weight tracking",
            "planFeatElite4": "VIP service priority in kitchen and delivery",
            "planFeatElite5": "The complete Olimpo experience at the best price",
            "btnSelectElite": "Choose Elite Pack",
            "affPill": "Passive Income",
            "affTitle": "AMBASSADORS & <span>AFFILIATE PROGRAM</span>",
            "affSubtitle": "Training at the club or loving our meals? Invite your friends, gym partners, and colleagues and <strong>earn up to 15% recurring monthly commission</strong> for as long as they stay subscribed.",
            "affHowTitle": "How Does the Affiliate Program Work?",
            "affHowSteps": "1. Generate your custom affiliate referral link below.<br>2. Share it on WhatsApp, Instagram, or directly at the club.<br>3. When someone orders a meal pack or joins the club, your commission is automatically credited.<br>4. Withdraw your earnings anytime via SIPAP bank transfer, Tigo Money, or cash at reception.",
            "affStat1Label": "Nutrition Packs Commission",
            "affStat2Label": "Club Membership Commission",
            "affStat3Num": "Month after Month",
            "affStat3Label": "Recurring Monthly Income",
            "affStat4Label": "Direct Payout in Paraguay",
            "calcTitle": "Monthly Referral Earnings Simulator",
            "calcLabelMeals": "Friends subscribed to meals (Nutrition packs):",
            "calcLabelClub": "Friends enrolled in Kickboxing & Boxing classes:",
            "calcResultLabel": "Estimated Earnings Per Month:",
            "calcResultNote": "With just a few referrals, your own gym membership and meals become completely FREE plus extra cash in your pocket!",
            "linkGenTitle": "Create or Connect Your Student Space to Generate Your Link",
            "linkGenSub": "Enter your name/alias and WhatsApp to activate your ambassador account, generate your unique link, and track your real referrals:",
            "affAliasPlaceholder": "Ex: WARRIOR_ALEX",
            "btnGenLink": "🎓 Activate My Space & My Link",
            "btnCopyLink": "📋 Copy Link",
            "btnShareWa": "📲 Share on WhatsApp",
            "dashTitle": "Your Real Referrals Dashboard",
            "btnWithdraw": "💸 Request Earnings Payout",
            "dashClicks": "Clicks on your link",
            "dashSignups": "Referred signups",
            "dashTotalEarn": "Total commissions",
            "dashBalance": "Available balance",
            "contactPill": "Access & Contact",
            "contactTitle": "JOIN <span>OLIMPO IN AREGUÁ</span>",
            "contactSubtitle": "Official address: <strong>Av. Las Residentas, Areguá</strong>, Paraguay. Direct gym pickup or delivery service (+20%).",
            "contactHoursTitle": "Club Location & Hours",
            "contactLocLabel": "📍 Location:",
            "contactLocVal": "Av. Las Residentas, Areguá",
            "contactLunchLabel": "Lunch Service:",
            "contactDinnerLabel": "Dinner Service:",
            "contactDaysLabel": "Opening Days:",
            "contactDaysVal": "Monday to Saturday",
            "contactSundayLabel": "Sunday:",
            "contactSundayVal": "Closed (Warrior's Rest)",
            "contactDeliveryLabel": "Delivery Service:",
            "contactDeliveryVal": "+20% of order value",
            "btnGoogleMaps": "📍 View in Google Maps",
            "btnWaze": "🚗 View in Waze",
            "btnContactWa": "💬 Message on WhatsApp (+595 995 620416)",
            "faqTitle": "Frequently Asked Questions",
            "faqQ1": "Do I need to book in advance to eat or train?",
            "faqA1": "No. The official policy is <strong>No Advance Booking Required</strong>. Drop by directly at our gym (Av. Las Residentas, Areguá) for your first free trial workout or to pick up your daily athletic meal.",
            "faqQ2": "Can I order meal packs without joining the combat club?",
            "faqA2": "Absolutely! You can subscribe to a standalone nutrition pack (1 or 2 meals/day) or order individual dishes from 7,000 ₲ to 25,000 ₲. For every 5 meals purchased, the 6th is 100% FREE!",
            "faqQ3": "How much is the Kickboxing & Boxing club membership?",
            "faqA3": "The monthly membership is <strong>150,000 ₲ / month</strong> (150k PYG) with unlimited access to all sessions. The first trial day is 100% free.",
            "faqQ4": "How does Bancard auto-debit work?",
            "faqA4": "It is securely processed by Bancard Paraguay under PCI-DSS encryption. You receive an instant 5% discount and can pause or cancel anytime without fees.",
            "modalTitle": "Checkout & Secure Payment (Paraguay)",
            "step1Badge": "Step 1",
            "step1Title": "Fight Club Training (Areguá)",
            "step1Desc": "K-1 Rules Kickboxing & Traditional Boxing. Official ring and heavy bags.",
            "quoteMain": "« Training is 50% of the work, the other half is proper nutrition. »",
            "quoteSub": "« Training hard without eating well is like rowing without oars! » — Olimpo Golden Rule",
            "step2Badge": "Step 2",
            "step2Title": "Choose Your Nutrition Plan (Club Kitchen)",
            "lblSelectDish": "Select your Dish or Street-Food:",
            "lblPlateQuantity": "Number of Meals (Buy 5 = 6th FREE!):",
            "adTitle": "🔄 Enable Bancard Auto-Debit (5% instant discount)",
            "adSub": "Automatic renewal every month. Cancel anytime with 1 click.",
            "blockServices": "3. Services & Delivery",
            "lblDelivery": "<strong>Home Delivery Service (+20% of subscription)</strong> — Free pickup at the club otherwise.",
            "lblDoubleProt": "Double Protein Portion (+2x Meat/Chicken: +10,000 ₲ per meal)",
            "blockCustomer": "4. Your Contact Details",
            "lblCustName": "Full Name *",
            "custNamePlaceholder": "Ex: John Doe",
            "lblCustPhone": "WhatsApp / Phone *",
            "lblCustCI": "C.I. or RUC (for official Paraguay invoice) *",
            "lblCustAddress": "Delivery Address or Club Pickup",
            "custAddressPlaceholder": "Ex: Club pickup at Areguá or full delivery address",
            "blockPayment": "5. Payment Gateway in Paraguay",
            "gwBancard": "Bancard vPOS",
            "gwSipap": "SIPAP Bank Transfer",
            "gwTigo": "Tigo Money",
            "gwQr": "QR Bancard",
            "txtBancardTitle": "🔒 Official Bancard vPOS Gateway (Credit & Debit Cards Paraguay)",
            "lblCardNum": "Card Number (Visa, Mastercard, Panal, Cabal)",
            "lblCardExp": "Expiration Date (MM/YY)",
            "lblCardCvv": "Security CVV Code",
            "txtBancardSecurity": "✓ PCI-DSS certified tokenization by Bancard Paraguay. Ready for automatic debit.",
            "txtSipapTitle": "🏦 SIPAP Bank Details (Interbank Transfer in Guaraníes):",
            "sipapBankLabel": "Bank:",
            "sipapHolderLabel": "Account Holder:",
            "sipapRucLabel": "RUC Tax ID:",
            "sipapAccountLabel": "Savings Account Gs:",
            "sipapCityLabel": "Location:",
            "btnCopySipap": "📋 Copy SIPAP Details for Transfer",
            "txtTigoTitle": "📱 Instant Mobile Wallet Payment (Tigo Money / Personal):",
            "lblTigoPhone": "Mobile Wallet Phone Number (Paraguay)",
            "txtTigoNote": "A push notification will be sent to your phone to confirm with your security PIN.",
            "txtQrTitle": "📲 Scan from your bank app in Paraguay (Simple QR)",
            "txtQrCompatible": "Compatible with Itaú, Continental, Ueno, Familiar, Sudameris, Atlas and GNB.",
            "sumDiscountLabel": "Auto-Debit Discount (-5%):",
            "sumDeliveryLabel": "Areguá Delivery (+20%):",
            "sumProtLabel": "Double Protein Portion:",
            "sumTotalLabel": "TOTAL DUE:",
            "lblLegalAccept": "I accept the <a href=\"#\" onclick=\"window.openLegalModal(); return false;\" style=\"color: var(--brand-blue-light); text-decoration: underline;\">legal & sanitary terms</a> applicable to sports clubs and dining in Paraguay.",
            "btnSubmitOrder": "Confirm Order & Send to WhatsApp (+595 995 620416)",
            "legalModalTitle": "Legal & Regulatory Terms (Paraguay)",
            "legalArt1Title": "1. Identification & Establishment (Areguá, Paraguay)",
            "legalArt1Text": "The <strong>« Olimpo Team Kickboxing & Restaurante del Olimpo »</strong> sports complex is located on Avenida Las Residentas, City of Areguá, Central Department, Republic of Paraguay. Official phone & WhatsApp: +595 995 620416.",
            "legalArt2Title": "2. Health & Food Safety Regulation (INAN / MSPyBS)",
            "legalArt2Text": "All meal preparations served by Restaurante del Olimpo comply strictly with sanitation standards established by Paraguay's <strong>INAN</strong> and the Ministry of Public Health. Macronutrients are weighed and prepared fresh daily. Cold-chain safety is maintained for all meat and probiotic ingredients.",
            "legalArt3Title": "3. Physical Fitness & Combat Sports Practice (Law No. 2874/06)",
            "legalArt3Text": "In accordance with Paraguayan sports laws, all members attending <strong>K-1 Kickboxing</strong> and <strong>Traditional Boxing</strong> certify they are in sound cardiovascular condition. Mandatory protective gear (hand wraps, mouthguard, regulation gloves) is required during controlled sparring.",
            "legalArt4Title": "4. Bancard Auto-Debit & Cancellation Policy",
            "legalArt4Text": "Subscriptions with « Auto-Debit » benefit from an immediate 5% discount. Recurring payments are processed via <strong>Bancard vPOS Paraguay</strong> (PCI-DSS certified). You may pause or cancel anytime via WhatsApp (+595 995 620416) at least 48 hours prior to renewal, with zero cancellation fees.",
            "legalArt5Title": "5. Legal Tax Invoicing (Paraguay Law No. 6380/19)",
            "legalArt5Text": "All transactions are issued an official Paraguay Tax Invoice (Factura Legal) with VAT included (10% and 5%). Clients provide their RUC or Cédula (C.I.) during order confirmation.",
            "legalArt6Title": "6. Home Delivery Service",
            "legalArt6Text": "Delivery service covers Areguá and nearby areas with a 20% order fee. Direct pickups at the gym (Av. Las Residentas, Areguá) are 100% free during service hours (11:00 to 13:00 and 18:00 to 20:30).",
            "btnLegalClose": "I Understand and Agree",
            "btnLightboxPdf": "📄 Open Complete PDF",
            "btnLightboxPng": "⬇ PNG",
            "btnLightboxClose": "Close",
            "mobileStickyHome": "Home",
            "mobileStickyClub": "Club (150k)",
            "mobileStickyMenu": "Menu",
            "mobileStickyGains": "Earnings",
            "mobileStickyOrder": "Order",
            "footerDesc": "The first sports complex in Areguá combining K-1 Kickboxing, Traditional Boxing, and clean sports meals calibrated to exact athlete macronutrients.",
            "footerLoc": "📍 Gym: Av. Las Residentas, Areguá, Paraguay",
            "footerWa": "WhatsApp: +595 995 620416 (No Reservation Required!)",
            "footerCol1Title": "Fighting Club",
            "footerLnkClub1": "K-1 Rules Kickboxing",
            "footerLnkClub2": "Traditional English Boxing",
            "footerLnkClub3": "Heavy Bags & Punch Mitts",
            "footerLnkClub4": "Workout Schedule",
            "footerLnkClub5": "Club Membership (150,000 ₲)",
            "footerCol2Title": "Fit Restaurant",
            "footerLnkResto1": "The Golden Rule (1/3, 1/3, 1/3)",
            "footerLnkResto2": "Weekly Menu",
            "footerLnkResto3": "High-Protein Street-Food",
            "footerLnkResto4": "Recovery Drinks",
            "footerLnkResto5": "Download Official Flyers",
            "footerCol3Title": "Affiliates & Legal",
            "footerLnkAff1": "Ambassador Program (15%)",
            "footerLnkAff2": "Earnings Calculator",
            "footerLnkAff3": "Generate Tracked Link",
            "footerLnkAff4": "Legal Terms (Paraguay)",
            "footerLnkAff5": "Customer Support & WhatsApp",
            "footerCopyright": "© 2026 Olimpo Team Kickboxing & Olimpo Restaurant. Av. Las Residentas, Areguá, Paraguay.",
            "footerCroTag": "High-performance athletic discipline and real calibrated nutrition.",
            "affBannerGuest": "🤝 Official guest of:",
            "affBannerBenefit": "• Your loyalty discount and benefit are active on your order.",
            "marqueeItem1": "+50 Olimpo fighters",
            "marqueeItem2": "Flexible and secure payment",
            "marqueeItem3": "More than a club, a family",
            "marqueeItem4": "K1",
            "marqueeItem5": "Kickboxing",
            "marqueeItem6": "Low kick",
            "marqueeItem7": "Boxing",
            "marqueeItem8": "Sports Food & Meal Prep",
            "marqueeItem9": "Competition Preparation",
            "stuPortalBadge": "🎓 Official Student & Ambassador Space",
            "stuLblAlias": "Your First Name or Fighter Alias *",
            "stuLblPhone": "Your WhatsApp Number *",
            "stuLblPin": "PIN Code (4 digits)",
            "stuConnectedBadge": "🟢 Active Student Space",
            "stuCodeLabel": "Your Referral Code to share with friends:",
            "btnStuLogout": "🔄 Switch account",
            "stuAddRefTitle": "➕ Register a Referred Friend (Club or Meal Pack)",
            "stuAddRefDesc": "Did you bring a friend to the club or did they order a pack? Register them here to credit your commission and send validation via WhatsApp:",
            "stuRefFriendLbl": "Referred Friend's Full Name *",
            "stuRefFriendPlaceholder": "Ex: Lucas Martinez",
            "stuRefPlanLbl": "Plan chosen by your Referred Friend *",
            "stuRefOptClub": "🥊 Club Membership (150,000 ₲) → Your Commission: +22,500 ₲ (15%)",
            "stuRefOptPack1": "🥗 Monthly 1 Meal/Day Pack (500,000 ₲) → Your Commission: +50,000 ₲ (10%)",
            "stuRefOptPro": "⭐ Monthly Fighter Pro Pack (950,000 ₲) → Your Commission: +95,000 ₲ (10%)",
            "stuRefOptElite": "🏆 Fighter Elite Combo (1,100,000 ₲) → Your Commission: +117,500 ₲",
            "stuRefOptWeekly": "⚡ Weekly Pack (140k - 260k ₲) → Your Commission: +20,000 ₲ (10%)",
            "btnAddReferral": "✅ Validate this Referral",
            "lblCustRefCode": "Referral / Olimpo Student Code (Optional)",
            "custRefCodePlaceholder": "Ex: ALEX",
            "stuPhonePlaceholder": "Ex: +595 981 123456",
            "custPhonePlaceholder": "Ex: 0981 123456",
            "custCIPlaceholder": "Ex: 4.567.890-1",
            "memModalTitle": "👤 My Member & Affiliate Space",
            "memCardLoginTitle": "Log In",
            "memCardLoginSub": "Access your Olimpo member space",
            "lblClassicLogin": "Email or Username",
            "classicEmailPlaceholder": "example@email.com",
            "lblClassicPass": "Password",
            "btnClassicLogin": "Log in",
            "memFlipToSignup": "Don't have an account yet? Sign up for free",
            "memCardSignupTitle": "Free Sign Up",
            "memCardSignupSub": "Create your member account in seconds",
            "lblClassicEmail": "Email",
            "lblClassicPassConfirm": "Confirm password",
            "btnClassicSignup": "Sign up for free",
            "memFlipToLogin": "Already have an account? Log in",
            "memMyLinkLabel": "🔗 Your Personal Affiliate Link (10% to 15% commission)",
            "memMonthEndTitle": "End-of-Month Profit Withdrawal",
            "memMonthEndDesc": "You can withdraw your profits <strong>at the end of the month (from the 25th to the last day of the month)</strong>. ⚠️ <strong>Warning:</strong> if you do not withdraw your profits before the end of the month, they will be <strong>automatically deleted (reset to 0 ₲)</strong> and you will have to wait until next month to withdraw new earnings.",
            "btnWithdrawMonthEnd": "💸 Withdraw my end-of-month profits",
            "btnMemOrderPack": "🥗 Order a Pack",
            "btnMemLogout": "🚪 Log Out"
      }
};

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
        club_monthly: '🥊 Oui, ajouter l\'Abonnement Club Kickboxing & Boxe (+150.000 ₲ / mois)',
        club_trial: '🆓 Réserver un 1er Jour d\'Essai GRATUIT au Club (0 ₲)',
        club_already: '✓ J\'ai déjà mon abonnement au club / Déjà membre (0 ₲)',
        club_none: '— Non merci, uniquement le programme nutritif'
      },
      optgroups: {
        monthly: '📅 PACKS MENSUELS (Mois Complet • Lun à Sam - Dimanche Fermé)',
        weekly: '⚡ PACKS HEBDOMADAIRES (Semaine • 6 Jours Lun à Sam)',
        single: '🍽️ PLATS À L\'UNITÉ & STREET-FOOD',
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
    renderStudentPortal();
    if (typeof window.refreshFirebaseBadgeLang === "function") window.refreshFirebaseBadgeLang();
  }

  const langSelect = document.getElementById('langSelect');
  if (langSelect) {
    langSelect.value = state.lang || 'es';
    langSelect.addEventListener('change', (e) => {
      applyLanguage(e.target.value);
    });
  }

  // Initial language application
  applyLanguage(state.lang || 'es');

  // --- MOBILE MENU TOGGLE ---
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const navLinks = document.getElementById('navLinks');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
      });
    });
  }

  // --- FACILITY AUTO-ROTATOR (2 PROJECT PHOTOS) ---
  let rotatorCurrent = 0;
  let rotatorTimer = null;
  const rotatorSlides = document.querySelectorAll('.rotator-slide');
  const rotatorDots = document.querySelectorAll('.rotator-dot');
  const rotatorContainer = document.getElementById('facilityRotator');

  window.setRotatorSlide = function(index) {
    if (!rotatorSlides.length) return;
    rotatorCurrent = index;
    rotatorSlides.forEach((slide, i) => {
      if (i === index) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });
    rotatorDots.forEach((dot, i) => {
      if (i === index) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  };

  function startRotator() {
    if (rotatorTimer) clearInterval(rotatorTimer);
    rotatorTimer = setInterval(() => {
      const total = rotatorSlides.length || 2;
      const next = (rotatorCurrent + 1) % total;
      window.setRotatorSlide(next);
    }, 3500);
  }

  if (rotatorContainer) {
    startRotator();
    rotatorContainer.addEventListener('mouseenter', () => {
      if (rotatorTimer) clearInterval(rotatorTimer);
    });
    rotatorContainer.addEventListener('mouseleave', () => {
      startRotator();
    });
  }
});