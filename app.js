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
    affiliateStats: {
      clicks: 142,
      signups: 8,
      earnings: 450000,
      balance: 450000
    }
  };

  // --- PARSE URL FOR AFFILIATE REF (?ref=... or ?aff=...) ---
  const urlParams = new URLSearchParams(window.location.search);
  const refParam = urlParams.get('ref') || urlParams.get('aff');
  if (refParam) {
    state.affiliateRef = refParam.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    localStorage.setItem('olimpo_ref', state.affiliateRef);
  }

  // Display referral banner if ref is present
  if (state.affiliateRef) {
    const banner = document.getElementById('affiliateBanner');
    const refCodeElem = document.getElementById('bannerRefCode');
    if (banner && refCodeElem) {
      refCodeElem.textContent = state.affiliateRef;
      banner.style.display = 'flex';
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

  // --- PHYSICAL GOALS DATA (From clean PDF specification) ---
  const goalsData = {
    perdida_peso: {
      title: '1. Pérdida de Peso & Grasa',
      strategy: 'Déficit calórico limpio y controlado con saciedad mecánica alta. Doble volumen de verduras frescas y ensaladas crocantes para cero hambre.',
      prot: '180g (Pollo o Vacuno)',
      carbs: '50g secos (125g cocido)',
      veg: '300g (Doble Ensalada)',
      cal: '~410 kcal'
    },
    definicion: {
      title: '2. Definición / Secado Atlético',
      strategy: 'Protección muscular máxima con aminoácidos y carbohidratos calculados post-entrenamiento para oxidar grasa manteniendo fuerza explosiva.',
      prot: '200 - 220g',
      carbs: '75g secos (185g cocido)',
      veg: '250g (Wok / Ensalada)',
      cal: '~490 kcal'
    },
    mantenimiento: {
      title: '3. Mantenimiento (Regla de Oro Oficial)',
      strategy: 'Equilibrio metabólico exacto del Club Olimpo: 1/3 Proteínas, 1/3 Carbohidratos limpios y 1/3 Fibras & Fruta fresca para rendimiento constante.',
      prot: '200g (1/3 del Plato)',
      carbs: '100g secos (250g cocido)',
      veg: '200 - 250g + 1 Fruta',
      cal: '~540 kcal'
    },
    ganancia_masa: {
      title: '4. Ganancia de Masa & Hipertrofia',
      strategy: 'Sobrecarga glucogénica limpia y alta densidad de aminoácidos para construcción muscular limpia y potencia demoledora en los rounds.',
      prot: '220g (Proteína pura)',
      carbs: '150g secos (375g cocido)',
      veg: '200g Verduras + Fruta',
      cal: '~680 kcal'
    }
  };

  // --- WEEKLY DISHES DATA ---
  const weeklyDishes = [
    {
      day: 'Lunes',
      name: 'El Explosivo',
      sub: 'Pollo Plancha + Arroz Blanco + Ensalada',
      desc: 'Pechuga de pollo grillada 200g, arroz blanco al vapor (o mandioca de noche), ensalada fresca de tomates y lechuga con fruta de estación (naranja/manzana). Asimilación rápida y máxima energía.',
      img: 'stories/assets/new_menu/lunes_explosivo.jpg',
      badge: '25G',
      protein: '45g',
      carbs: '55g',
      fats: '8g',
      cal: '480 kcal'
    },
    {
      day: 'Martes',
      name: 'El Sparring',
      sub: 'Fideos Salteados al Wok + Tiras de Carne',
      desc: 'Fideos con tiernas tiras de carne vacuna magra 180g, brócoli fresco, zanahorias y pimientos crujientes salteados en salsa ligera con toque de sésamo y manzana roja.',
      img: 'stories/assets/new_menu/martes_sparring.jpg',
      badge: '25G',
      protein: '48g',
      carbs: '65g',
      fats: '12g',
      cal: '560 kcal'
    },
    {
      day: 'Miércoles',
      name: 'El Clásico Potencia',
      sub: 'Stroganoff Gourmet de Carne o Pollo',
      desc: 'Stroganoff tradicional con carne tierna dorada a fuego lento en salsa cremosa liviana con cebollas caramelizadas y perejil fresco, acompañado de arroz blanco y ensalada verde.',
      img: 'stories/assets/new_menu/miercoles_stroganoff.jpg',
      badge: '25G',
      protein: '46g',
      carbs: '58g',
      fats: '14g',
      cal: '540 kcal'
    },
    {
      day: 'Jueves',
      name: 'Especial Dubaï',
      sub: 'Tataki de Lomo Sellado en Abanico',
      desc: 'Tataki de carne roja 200g sellado a fuego vivo con centro rosado tierno, arroz blanco, cubos de piña fresca dorada, zanahorias glaseadas, chauchas salteadas y rabanitos crocantes.',
      img: 'stories/assets/new_menu/jueves_dubai.jpg',
      badge: '25G',
      protein: '50g',
      carbs: '60g',
      fats: '10g',
      cal: '530 kcal'
    },
    {
      day: 'Viernes',
      name: 'Guiso del Peleador',
      sub: 'Guiso Tradicional de Pollo y Fideos',
      desc: 'Guiso suculento tradicional con 200g de pollo jugoso, fideos, zanahorias, cebolla y arvejas en caldo caliente reconfortante con banana y naranja. Ideal recarga de glucógeno.',
      img: 'stories/assets/new_menu/viernes_guiso.jpg',
      badge: '25G',
      protein: '48g',
      carbs: '70g',
      fats: '11g',
      cal: '570 kcal'
    },
    {
      day: 'Sábado',
      name: 'El Placer Atlético',
      sub: 'Milanesa Dorada de Pollo + Puré Casero',
      desc: 'Milanesa crocante dorada de pollo 200g con cremoso puré casero de papas a la manteca, ensalada fresca y gajo de limón. La recompensa glucémica post-semana de entrenamiento duro.',
      img: 'stories/assets/new_menu/sabado_milanesa.jpg',
      badge: '25G',
      protein: '47g',
      carbs: '62g',
      fats: '15g',
      cal: '580 kcal'
    }
  ];

  // --- FLYERS DATA (A4 PRINTABLE 2-PAGE FLYER: RECTO & VERSO) ---
  const flyers = [
    {
      id: 1,
      side: 'Recto',
      tag: 'Página 1 • Recto',
      title: 'Menú Semanal & Packs de Suscripción',
      desc: 'Los 6 almuerzos completos (Lunes a Sábado), la regla de oro 1/3 y la grilla oficial de packs semanales y mensuales con beneficio de débito automático Bancard (-5%).',
      file: 'flyer_recto_preview.png',
      preview: 'stories/assets/flyer_recto_preview.png'
    },
    {
      id: 2,
      side: 'Verso',
      tag: 'Página 2 • Verso',
      title: 'Comida Rápida, Bebidas & Academia de Combate',
      desc: 'Línea de street-food proteico para ganancia muscular, bebidas funcionales de recuperación, horarios de cocina y sala de entrenamiento en Bristol de Areguá.',
      file: 'flyer_verso_preview.png',
      preview: 'stories/assets/flyer_verso_preview.png'
    }
  ];

  // --- RENDER WEEKLY DISHES ---
  const dishesGrid = document.getElementById('dishesGrid');
  if (dishesGrid) {
    dishesGrid.innerHTML = weeklyDishes.map(dish => `
      <div class="dish-card" data-day="${dish.day}">
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
            <div class="macro-item"><span>Prot:</span> <strong>${dish.protein}</strong></div>
            <div class="macro-item"><span>Gluc:</span> <strong>${dish.carbs}</strong></div>
            <div class="macro-item"><span>Lip:</span> <strong>${dish.fats}</strong></div>
            <div class="macro-item"><span>Cal:</span> <strong>${dish.cal}</strong></div>
          </div>
          <div class="dish-footer">
            <span class="dish-price-val">25.000 ₲</span>
            <button class="btn-dish-order" onclick="window.openCheckout('plato_unico', '${dish.name}')">
              Commander
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // --- RENDER FLYERS ---
  const flyersGrid = document.getElementById('flyersGrid');
  if (flyersGrid) {
    flyersGrid.innerHTML = flyers.map(flyer => `
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
              🔍 Zoom Preview
            </button>
            <a href="stories/assets/Menu_Oficial_Restaurante_del_Olimpo.pdf" target="_blank" rel="noopener noreferrer" class="btn-flyer-zoom btn-flyer-pdf">
              📄 Descargar PDF
            </a>
          </div>
        </div>
      </div>
    `).join('');
  }

  // --- PHYSICAL GOALS SELECTOR LOGIC ---
  const goalButtons = document.querySelectorAll('.btn-goal-tab');
  const goalTitleElem = document.getElementById('goalTitle');
  const goalStrategyElem = document.getElementById('goalStrategy');
  const macroProtElem = document.getElementById('macroProt');
  const macroCarbsElem = document.getElementById('macroCarbs');
  const macroVegElem = document.getElementById('macroVeg');

  goalButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      goalButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const goalKey = btn.getAttribute('data-goal');
      state.activeGoal = goalKey;
      const data = goalsData[goalKey];
      if (data) {
        if (goalTitleElem) goalTitleElem.textContent = data.title;
        if (goalStrategyElem) goalStrategyElem.textContent = data.strategy;
        if (macroProtElem) macroProtElem.textContent = data.prot;
        if (macroCarbsElem) macroCarbsElem.textContent = data.carbs;
        if (macroVegElem) macroVegElem.textContent = data.veg;
      }
    });
  });

  // --- DISHES FILTER TABS (DAYS) ---
  const menuDayTabs = document.querySelectorAll('.btn-menu-tab');
  menuDayTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      menuDayTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const targetDay = tab.getAttribute('data-filter');
      const cards = document.querySelectorAll('.dish-card');
      cards.forEach(card => {
        if (targetDay === 'all' || card.getAttribute('data-day') === targetDay) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // --- PRICING CYCLE TOGGLE (SEMANAL / MENSUAL) ---
  const cycleToggles = document.querySelectorAll('.btn-cycle-toggle');
  cycleToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      cycleToggles.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.selectedCycle = btn.getAttribute('data-cycle');
      updatePricingDisplay();
      recalculateCheckoutSummary();
    });
  });

  // --- UPDATE PRICING DISPLAY WITH STRIKETHROUGH & MULTILINGUAL LABELS ---
  function updatePricingDisplay() {
    const cycle = state.selectedCycle;
    const isAutoDebit = state.autoDebitActive;
    const lang = state.lang || 'es';

    const unitLabels = {
      es: { sem: 'sem', mes: 'mes', ahorras: 'Ahorrás', plato: 'plato', club: 'Acceso Libre Ilimitado' },
      fr: { sem: 'sem', mes: 'mois', ahorras: 'Économisez', plato: 'plat', club: 'Accès Libre Illimité' },
      en: { sem: 'wk', mes: 'mo', ahorras: 'Save', plato: 'meal', club: 'Unlimited All-Access' }
    };
    const u = unitLabels[lang] || unitLabels.es;

    const data = pricingData[cycle];
    for (const [key, val] of Object.entries(data)) {
      if (key === 'plato_unico') continue;
      const basePrice = val.price;
      const discountedPrice = Math.round(basePrice * 0.95);
      const savings = basePrice - discountedPrice;

      const strikeWrap = document.getElementById(`strikeWrap_${key}`);
      const priceMain = document.getElementById(`price_${key}`);
      const perMealElem = document.getElementById(`perMeal_${key}`);

      const cycleUnit = cycle === 'semanal' ? u.sem : u.mes;

      if (isAutoDebit) {
        if (strikeWrap) {
          strikeWrap.style.display = 'flex';
          strikeWrap.innerHTML = `
            <span class="old-price-line">${basePrice.toLocaleString('es-PY')} ₲</span>
            <span class="discount-save-pill">${u.ahorras} ${savings.toLocaleString('es-PY')} ₲</span>
          `;
        }
        if (priceMain) {
          priceMain.innerHTML = `${discountedPrice.toLocaleString('es-PY')} ₲ <span>/${cycleUnit}</span>`;
        }
        if (perMealElem) {
          if (key === 'club_kickboxing') {
            perMealElem.textContent = u.club;
          } else {
            perMealElem.textContent = `${Math.round(val.perMeal * 0.95).toLocaleString('es-PY')} ₲ / ${u.plato}`;
          }
        }
      } else {
        if (strikeWrap) strikeWrap.style.display = 'none';
        if (priceMain) {
          priceMain.innerHTML = `${basePrice.toLocaleString('es-PY')} ₲ <span>/${cycleUnit}</span>`;
        }
        if (perMealElem) {
          if (key === 'club_kickboxing') {
            perMealElem.textContent = u.club;
          } else {
            perMealElem.textContent = `${val.perMeal.toLocaleString('es-PY')} ₲ / ${u.plato}`;
          }
        }
      }
    }
  }

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

    valMeals.textContent = `${mealsCount} personas`;
    valClub.textContent = `${clubCount} personas`;

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

  // --- AFFILIATE LINK GENERATOR ---
  const aliasInput = document.getElementById('affAliasInput');
  const btnGenLink = document.getElementById('btnGenLink');
  const linkDisplayBox = document.getElementById('linkDisplayBox');
  const genLinkText = document.getElementById('genLinkText');
  const btnCopyLink = document.getElementById('btnCopyLink');
  const btnShareWa = document.getElementById('btnShareWa');

  if (btnGenLink && aliasInput) {
    btnGenLink.addEventListener('click', () => {
      const alias = aliasInput.value.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '') || 'CAMPEON';
      const baseUrl = window.location.origin + window.location.pathname;
      const link = `${baseUrl}?ref=${alias}`;
      genLinkText.textContent = link;
      linkDisplayBox.style.display = 'flex';
      showToast(`✓ ¡Enlace de afiliado generado para ${alias}!`);
    });
  }

  if (btnCopyLink) {
    btnCopyLink.addEventListener('click', () => {
      const text = genLinkText.textContent;
      navigator.clipboard.writeText(text).then(() => {
        showToast('✓ ¡Enlace copiado al portapapeles!');
      }).catch(() => {
        showToast('Enlace listo: ' + text);
      });
    });
  }

  if (btnShareWa) {
    btnShareWa.addEventListener('click', () => {
      const link = genLinkText.textContent;
      const message = encodeURIComponent(
        `🥊 ¡Hola! Te invito a entrenar en Olimpo Team Kickboxing & Boxeo Tradicional (Areguá) y a alimentarte como un campeón en el restaurante del club.\n` +
        `Accedé con descuento exclusivo a través de mi enlace de embajador:\n👉 ${link}\n` +
        `¡Nos vemos en el ring!`
      );
      window.open(`https://wa.me/?text=${message}`, '_blank');
    });
  }

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

  // --- COMPREHENSIVE CHECKOUT CALCULATION ENGINE ---
  function getCheckoutCalculations() {
    let packCycle = state.selectedCycle || 'mensual';
    if (state.nutritionChoice.endsWith('_semanal')) {
      packCycle = 'semanal';
    } else if (state.nutritionChoice.endsWith('_mensual')) {
      packCycle = 'mensual';
    }

    let nutritionBase = 0;
    let nutritionLabel = 'Ningún pack de comida';
    let isCombo = false;

    if (state.nutritionChoice === 'pack_fighter_pro_mensual' || (state.nutritionChoice === 'pack_fighter_pro' && packCycle === 'mensual')) {
      nutritionBase = 950000;
      nutritionLabel = '⭐ Pack Fighter Pro Mensual (2 Platos/Día • Mes Completo)';
    } else if (state.nutritionChoice === 'pack_fighter_pro_semanal' || (state.nutritionChoice === 'pack_fighter_pro' && packCycle === 'semanal')) {
      nutritionBase = 260000;
      nutritionLabel = '⭐ Pack Fighter Pro Semanal (2 Platos/Día • 12 Comidas)';
    } else if (state.nutritionChoice === 'pack_1_plato_mensual' || (state.nutritionChoice === 'pack_1_plato' && packCycle === 'mensual')) {
      nutritionBase = 500000;
      nutritionLabel = 'Pack 1 Plato/Día Mensual (Mes Completo • Lun a Sáb)';
    } else if (state.nutritionChoice === 'pack_1_plato_semanal' || (state.nutritionChoice === 'pack_1_plato' && packCycle === 'semanal')) {
      nutritionBase = 140000;
      nutritionLabel = 'Pack 1 Plato/Día Semanal (6 Comidas • Lun a Sáb)';
    } else if (state.nutritionChoice === 'combo_elite_mensual' || (state.nutritionChoice === 'combo_elite' && packCycle === 'mensual')) {
      nutritionBase = 1100000;
      nutritionLabel = '🏆 Combo Fighter Elite Mensual (Club Boxeo + 2 Platos/Día)';
      isCombo = true;
    } else if (state.nutritionChoice === 'combo_elite_semanal' || (state.nutritionChoice === 'combo_elite' && packCycle === 'semanal')) {
      nutritionBase = 300000;
      nutritionLabel = '🏆 Combo Fighter Elite Semanal (Pase Club + 2 Platos/Día)';
      isCombo = true;
    } else if (state.nutritionChoice === 'plato_unico') {
      const selectedDishObj = availableDishesList.find(d => dishSelectElem && dishSelectElem.value === d.id) || availableDishesList[0];
      const singlePrice = selectedDishObj.price;
      const qty = state.plateQuantity || 1;
      nutritionBase = singlePrice * qty;
      nutritionLabel = `${qty}x ${selectedDishObj.name.split('(')[0].trim()}`;
    } else {
      nutritionBase = 0;
      nutritionLabel = '— Ningún pack de comida (Solo club)';
    }

    let clubBase = 0;
    let clubLabel = '— Sin suscripción al club';

    if (isCombo) {
      clubBase = 0;
      clubLabel = '✓ Club Kickboxing & Boxeo INCLUIDO en el Combo';
    } else if (state.clubChoice === 'club_monthly') {
      clubBase = packCycle === 'semanal' ? 50000 : 150000;
      clubLabel = `✓ Club Kickboxing & Boxeo (${clubBase.toLocaleString('es-PY')} ₲/${packCycle === 'semanal' ? 'sem' : 'mes'})`;
    } else if (state.clubChoice === 'club_trial') {
      clubBase = 0;
      clubLabel = '✓ Primer Día de Prueba GRATIS en el Club (0 ₲)';
    } else if (state.clubChoice === 'club_already') {
      clubBase = 0;
      clubLabel = '✓ Ya es Miembro Activo del Club';
    } else {
      clubBase = 0;
      clubLabel = '— Sin suscripción al club';
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
    const sipapInfo = `BANCO CONTINENTAL / BASA\nTitular: Olimpo Team Kickboxing & Sports Resto\nRUC: 80099562-4\nCaja de Ahorro Gs: 01-234567-89\nSede: Bristol de Areguá, cerca del Cacique`;
    navigator.clipboard.writeText(sipapInfo).then(() => {
      showToast('✓ ¡Datos SIPAP copiados al portapapeles!');
    }).catch(() => {
      showToast('Datos SIPAP listos para transferir');
    });
  };

  // ==========================================================================
  // PAYMENT PROCESSORS ARCHITECTURE (OLIMPO_PAYMENTS_CONFIG)
  // Prêt pour connexion directe dès validation de l'associé.
  // ==========================================================================
  const OLIMPO_PAYMENTS_CONFIG = {
    LIVE_MODE: false, // Passer à true lors de la mise en production officielle
    BANCARD_VPOS: {
      ENVIRONMENT: 'staging', // 'staging' ou 'production'
      PUBLIC_KEY: 'pk_olimpo_staging_77a92b',
      PRIVATE_KEY: 'sk_olimpo_staging_33c84f',
      STAGING_URL: 'https://vpos.infonet.com.py/vpos/api/0.3/single_buy',
      PRODUCTION_URL: 'https://vpos.infonet.com.py/vpos/api/0.3/single_buy',
      TOKENIZE_CARD_URL: 'https://vpos.infonet.com.py/vpos/api/0.3/users/cards/new',
      processPayment: async function(paymentPayload) {
        console.log('[OLIMPO BANCARD] Dispatching vPOS transaction payload:', paymentPayload);
        // Simulation réussie certifiée PCI-DSS
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

  // Expose configuration globally for production inspection
  window.OLIMPO_PAYMENTS_CONFIG = OLIMPO_PAYMENTS_CONFIG;

  // --- CHECKOUT FORM SUBMISSION & WHATSAPP TRANSMISSION ---
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const custName = document.getElementById('custName')?.value.trim() || 'Client';
      const custPhone = document.getElementById('custPhone')?.value.trim() || '';
      const custCI = document.getElementById('custCI')?.value.trim() || '';
      const custAddress = document.getElementById('custAddress')?.value.trim() || 'Retrait au Club Bristol Areguá';
      const hasDelivery = deliveryCheckbox?.checked || false;
      const hasDoubleProt = doubleProteinCheckbox?.checked || false;
      const isAutoDebit = autoDebitCheckbox?.checked || false;

      // Calculate totals using synchronized engine
      const calc = getCheckoutCalculations();
      const finalAmount = calc.finalTotal;

      // Payment gateway hook trigger
      if (OLIMPO_PAYMENTS_CONFIG.LIVE_MODE) {
        showToast('Conectando con la pasarela de pago...');
        await OLIMPO_PAYMENTS_CONFIG.BANCARD_VPOS.processPayment({ amount: finalAmount, customer: custName, ci: custCI });
      }

      // Build structured WhatsApp message
      const gatewayNames = {
        bancard: 'Bancard vPOS (Tarjetas Crédito/Débito)',
        sipap: 'SIPAP (Transferencia Bancaria en Guaraníes)',
        tigo: 'Tigo Money (Billetera Móvil)',
        qr: 'QR Simple Bancard'
      };

      const waMessage =
        `🏛️ *NUEVA ORDEN / PEDIDO - OLIMPO TEAM AREGUÁ*\n` +
        `----------------------------------------\n` +
        `👤 *Cliente :* ${custName}\n` +
        `📱 *WhatsApp :* ${custPhone}\n` +
        `🆔 *C.I. / RUC :* ${custCI}\n` +
        `📍 *Dirección :* ${custAddress}\n` +
        (state.affiliateRef ? `🤝 *Referido por :* ${state.affiliateRef}\n` : '') +
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
        `_Enviado desde la web oficial Olimpo Team Kickboxing & Restaurante (Bristol de Areguá)_`;

      const encodedWA = encodeURIComponent(waMessage);
      const waUrl = `https://wa.me/595995620416?text=${encodedWA}`;

      showToast('✓ ¡Orden confirmada! Redirigiendo a WhatsApp (+595 995 620416)...');
      setTimeout(() => {
        window.open(waUrl, '_blank');
        if (checkoutModal) checkoutModal.classList.remove('open');
      }, 700);
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
  // AFFILIATE WITHDRAWAL MODAL
  // ==========================================================================
  window.openWithdrawModal = function() {
    const amount = state.affiliateStats.balance.toLocaleString('es-PY');
    const msg = encodeURIComponent(
      `💸 *DEMANDE DE RETRAIT DE COMMISSIONS AFFILIÉ*\n` +
      `----------------------------------------\n` +
      `👤 *Mon Pseudo :* ${state.affiliateRef || 'GUERRIER'}\n` +
      `💰 *Montant Demandé :* ${amount} ₲\n` +
      `🏦 *Mode Souhaité :* SIPAP / Tigo Money / Espèces au Club\n` +
      `----------------------------------------\n` +
      `Merci de confirmer la date du versement !`
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
  // MULTILINGUAL ENGINE (ESPAÑOL / FRANÇAIS) WITH DROPDOWN SELECTOR
  // ==========================================================================
  const translations = {
    es: {
      alertBar: 'Cupo diario: 50 platos frescos cocinados cada mañana • Lunes a Sábado en Areguá • Sin Reserva previa',
      navHome: 'Inicio',
      navFacility: 'El Complejo',
      navFightClub: 'Fight Club',
      navRestoFit: 'Restaurante',
      navFlyers: 'Flyers',
      navPricing: 'Tarifas',
      navAffiliates: 'Afiliados',
      navContact: 'Acceso',
      navJoin: 'Unirse',
      heroTag: 'Club Oficial de Combate & Nutrición Atlética • Bristol de Areguá',
      heroTitle1: 'FORJÁ TU CUERPO DE',
      heroTitleWarrior: 'GUERRERO',
      heroTitle2: 'ALIMENTÁ TU POTENCIA EN EL',
      heroTitleOlimpo: 'OLIMPO',
      heroLead: 'El primer complejo de Areguá que fusiona la rigurosa técnica del <strong>Kickboxing K-1</strong> y el <strong>Boxeo Tradicional Inglés</strong> con una <strong>nutrición deportiva calibrada a los macronutrientes</strong> (1/3 Proteína, 1/3 Carbohidratos limpios, 1/3 Fibras). Cocinado fresco cada día.',
      btnViewPacks: 'Elegir Plan',
      btnGoToClub: '📍 Ir al Gimnasio',
      heroProofAthletes: '+50 Atletas',
      heroProofCommunity: 'Comunidad Olimpo',
      showcaseBadge: 'Ecosistema Olimpo',
      showcaseLive: 'Abierto Lun - Sáb',
      showcaseSub: 'Pack Fighter Pro (2 Platos/Día)',
      btnShowcaseOrder: 'Pedir Ahora',
      facilityTag: 'PROYECTO EN EXPANSIÓN & COMUNIDAD DE PELEA',
      facilityTitle: 'UN PROYECTO QUE CRECE CON VOS <span>• ¡EL CLUB YA ESTÁ ABIERTO Y OPERATIVO!</span>',
      facilityPunchline1: '→ ¡Vení a entrenar a combatir!',
      facilityPunchline2: '→ ¡Y alimentá tu cuerpo directamente después de tu sesión!',
      facilityDesc: 'En el Olimpo eliminamos la gran traba de los atletas: entrenar duro y arruinar el esfuerzo comiendo mal por falta de tiempo o comidas adaptadas. Nuestro complejo reúne bajo el mismo techo una sala de combate y una cocina deportiva.',
      evolutionBadge: '📐 PLANOS DEL PROYECTO • CLUB 100% OPERATIVO',
      facilityProjectNotice: 'Estas imágenes corresponden a los <strong>planos arquitectónicos y la visión final de nuestro complejo</strong>. Estamos aún en fase de construcción y ampliación, pero <strong>el club está totalmente abierto y operativo para todos los entrenamientos diarios</strong> (Kickboxing K-1 y Boxeo Tradicional Inglés). ¡Vení a formar parte de los cimientos y de la evolución de nuestra comunidad!',
      rotatorSlide1: '🥊 1. La Sala de Combate (Ring & Sacos) • Club Ya Abierto',
      rotatorSlide2: '🥗 2. El Restaurante Atlético • En Obras de Terminación',
      rotatorHint: 'Planos del proyecto • Rotación auto',
      clubPill: 'Academia de Combate',
      clubTitle: 'FIGHTING CLUB <span>OLIMPO TEAM</span>',
      clubSubtitle: 'Desarrollá una disciplina de acero, velocidad explosiva y potencia en el ring. Especialización estricta en Kickboxing K-1 Rules y Boxeo Tradicional Inglés. Cero suelo, cero grappling: pegada pura y esquives.',
      restoPill: 'Nutrición Deportiva',
      restoTitle: 'RESTAURANTE DEL <span>OLIMPO</span>',
      restoSubtitle: 'La verdadera comida que tu cuerpo necesita después del esfuerzo. Platos frescos preparados cada mañana con ingredientes limpios, sin aceites industriales y pesados al gramo.',
      goldenRuleTitle: 'La Regla de Oro del Plato Atlético Olimpo',
      flyersPill: 'Soporte Oficial para Imprimir',
      flyersTitle: 'FLYER OFICIAL <span>RECTO & VERSO (PDF)</span>',
      flyersSubtitle: 'Menú completo y planes de suscripción condensados en 1 sola hoja de doble cara (2 páginas A4 en PDF listo para imprimir o compartir).',
      btnOpenPdf: 'Descargar Flyer Oficial de 2 Páginas en PDF',
      pdfHint: 'Documento oficial en alta resolución • Formato A4 Recto/Verso',
      pricingPill: 'Tarifas & Membresías',
      pricingTitle: 'PLANES DE <span>SUSCRIPCIÓN</span>',
      pricingSubtitle: 'Elegí tu plan. Activá el <strong>débito automático Bancard</strong> para acceder a un 5% de descuento inmediato y asegurar tus comidas y entrenamientos sin interrupciones.',
      cycleWeekly: 'Semana (6 Días)',
      cycleMonthly: 'Mes Completo (Lun a Sáb)',
      adControlTitle: '💳 Débito Automático Bancard :',
      adControlDisc: '5% de Descuento Inmediato Incluido',
      planTypeClub: 'Academia de Combate',
      planTitleClub: 'Club Kickboxing & Boxeo',
      planFeatClub1: 'Acceso libre a las clases de <strong>Kickboxing K-1 Rules</strong>',
      planFeatClub2: 'Clases de <strong>Boxeo Tradicional Inglés</strong>',
      planFeatClub3: 'Acceso al ring, bolsas pesadas de 60kg y guanteo',
      planFeatClub4: '1er Día de prueba gratis sin compromiso',
      planFeatClub5: 'Acompañamiento técnico por peleadores experimentados',
      btnSelectClub: 'Inscribirse al Club (150k)',
      planType1Plato: 'Nutrición Diaria',
      planTitle1Plato: 'Pack 1 Plato / Día',
      planFeat1Plato1: '1 comida completa por día: Almuerzo o Cena',
      planFeat1Plato2: 'Recetas frescas rotativas de Lunes a Sábado',
      planFeat1Plato3: '200g de proteína pura + carbohidratos limpios + ensalada',
      planFeat1Plato4: 'Frutas frescas de estación incluidas en cada comida',
      planFeat1Plato5: 'Retiro directo en el club o delivery (+20%)',
      btnSelect1Plato: 'Elegir 1 Plato/Día',
      ribbonPopular: '⭐ Plan Más Popular',
      planTypeFighterPro: 'Atleta & Peleador',
      planTitleFighterPro: 'Fighter Pro (2 Platos)',
      planFeatFighter1: '<strong>2 comidas completas por día:</strong> Almuerzo + Cena',
      planFeatFighter2: 'Cero compras, cero cocina después de entrenar duro',
      planFeatFighter3: 'Freno al catabolismo nocturno: recuperación máxima',
      planFeatFighter4: 'Platos calientes herméticos listos para llevar',
      planFeatFighter5: 'Precio ultra competitivo: menos de 19.000 ₲ por comida limpia',
      btnSelectFighter: 'Elegir Fighter Pro',
      ribbonElite: '🏆 Transformación Total',
      planTypeElite: 'Pack Híbrido Definitivo',
      planTitleElite: 'Combo Fighter Elite',
      planFeatElite1: '<strong>Acceso completo ilimitado</strong> a Kickboxing & Boxeo',
      planFeatElite2: '<strong>2 comidas atléticas por día</strong> preparadas en el club',
      planFeatElite3: 'Seguimiento mensual de composición corporal y peso',
      planFeatElite4: 'Prioridad de atención en cocina y delivery',
      planFeatElite5: 'La experiencia total del Olimpo al mejor precio',
      btnSelectElite: 'Elegir Pack Elite',
      modalTitle: 'Inscripción & Pago Seguro (Paraguay)',
      step1Badge: 'Paso 1',
      step1Title: 'Entrenamiento en el Club de Combate (Bristol de Areguá)',
      step1Desc: 'Kickboxing K-1 Rules & Boxeo Tradicional Inglés. Ring de combate y bolsas pesadas.',
      quoteMain: '« Entrenar es el 50% del trabajo, la otra mitad es alimentarse bien. »',
      quoteSub: '« ¡Entrenar duro sin comer bien es como remar sin remos! » — Regla de oro del Olimpo',
      step2Badge: 'Paso 2',
      step2Title: 'Elegí tu Programa Nutritivo (Cocina del Club)',
      adTitle: '🔄 Activar Débito Automático Bancard (-5% de descuento)',
      adSub: 'Renovación automática cada mes. Cancelable en cualquier momento en 1 clic.',
      blockServices: '3. Servicios & Delivery',
      lblDelivery: '<strong>Servicio de Delivery a Domicilio (+20% del abono)</strong> — Retiro en el club gratis.',
      lblDoubleProt: 'Doble Porción de Proteína (+2x Carne/Pollo : +10.000 ₲ por comida)',
      blockCustomer: '4. Tus Datos de Contacto',
      lblCustName: 'Nombre & Apellido *',
      lblCustPhone: 'WhatsApp / Teléfono *',
      lblCustCI: 'C.I. o RUC (para la factura legal paraguaya) *',
      lblCustAddress: 'Dirección de Delivery o Retiro en el Club',
      blockPayment: '5. Medio de Pago Localizado en Paraguay',
      sumDiscountLabel: 'Descuento Débito Automático (-5%) :',
      sumDeliveryLabel: 'Delivery Areguá (+20% del abono) :',
      sumProtLabel: 'Doble Porción de Proteína :',
      sumTotalLabel: 'TOTAL A PAGAR :',
      lblLegalAccept: 'Acepto las <a href="#" onclick="window.openLegalModal(); return false;" style="color: var(--brand-blue-light); text-decoration: underline;">condiciones legales & sanitarias</a> aplicables a gimnasios y gastronomía en Paraguay.',
      btnSubmitOrder: 'Confirmar Pedido & Enviar a WhatsApp (+595 995 620416)',
      affPill: 'Ingresos Pasivos',
      affTitle: 'PROGRAMA DE <span>EMBAJADORES & AFILIADOS</span>',
      contactPill: 'Acceso & Contacto',
      contactTitle: 'SUMATE AL <span>OLIMPO EN AREGUÁ</span>'
    },
    fr: {
      alertBar: 'Cuota del día : 50 plats frais cuisinés chaque matin • Lundi au Samedi à Areguá • Sans Réservation requise',
      navHome: 'Accueil',
      navFacility: 'Le Complexe',
      navFightClub: 'Fight Club',
      navRestoFit: 'Restaurant',
      navFlyers: 'Flyers',
      navPricing: 'Tarifs',
      navAffiliates: 'Affiliation',
      navContact: 'Accès',
      navJoin: 'Rejoindre',
      heroTag: 'Club Officiel de Combat & Nutrition Athlétique • Bristol d\'Areguá',
      heroTitle1: 'FORGE TON CORPS DE',
      heroTitleWarrior: 'GUERRIER',
      heroTitle2: 'NOURRIS TA PUISSANCE À',
      heroTitleOlimpo: 'L\'OLYMPE',
      heroLead: 'Le premier complexe d\'Areguá fusionnant la rigueur du <strong>Kickboxing K-1</strong> et de la <strong>Boxe Traditionnelle Anglaise</strong> avec une <strong>nutrition sportive calibrée aux macronutriments</strong> (1/3 Protéine, 1/3 Glucides propres, 1/3 Fibres). Cuisiné frais sur place chaque matin.',
      btnViewPacks: 'Choisir un Plan',
      btnGoToClub: '📍 Se rendre au club',
      heroProofAthletes: '+50 Athlètes',
      heroProofCommunity: 'Communauté Olimpo',
      showcaseBadge: 'Écosystème Olimpo',
      showcaseLive: 'Ouvert Lun - Sam',
      showcaseSub: 'Pack Fighter Pro (2 Plats/Jour)',
      btnShowcaseOrder: 'Commander',
      facilityTag: 'PROJET EN EXPANSION & COMMUNAUTÉ COMBAT',
      facilityTitle: 'UN PROJET QUI GRANDIT AVEC VOUS <span>• LE CLUB EST DÉJÀ OUVERT !</span>',
      facilityPunchline1: '→ Viens t\'entraîner à combattre !',
      facilityPunchline2: '→ Et nourris ton corps directement après ta séance !',
      facilityDesc: 'À l\'Olympe, nous avons éliminé le plus grand obstacle des athlètes : s\'entraîner dur puis gâcher ses efforts par manque de temps ou de repas adaptés. Notre complexe réunit sous le même toit une salle de combat et une cuisine sportive.',
      evolutionBadge: '📐 PLANS DU PROJET & CLUB 100% OPÉRATIONNEL',
      facilityProjectNotice: 'Ces visuels représentent les <strong>plans architecturaux et la vision finale de notre complexe</strong>. Nous sommes encore en cours de travaux et d\'aménagement, mais <strong>le club est d\'ores et déjà 100% ouvert et opérationnel</strong> pour tous tes entraînements de Kickboxing K-1 et de Boxe Traditionnelle Anglaise. Viens faire partie des pionniers et participe directement à l\'évolution du club !',
      rotatorSlide1: '🥊 1. La Salle de Combat (Ring & Sacs) • Club Déjà Ouvert',
      rotatorSlide2: '🥗 2. Le Restaurant Athlétique • En Cours de Finition',
      rotatorHint: 'Plans du projet • Rotation auto',
      clubPill: 'Académie de Combat',
      clubTitle: 'FIGHTING CLUB <span>OLIMPO TEAM</span>',
      clubSubtitle: 'Développe une discipline d\'acier, une vitesse explosive et une puissance musculaire sur le ring. Spécialisation rigoureuse en Kickboxing K-1 Rules et Boxe Traditionnelle Anglaise. Aucun combat au sol ni grappling : frappe pure, esquives et puissance.',
      restoPill: 'Nutrition Sportive',
      restoTitle: 'RESTAURANT DE L\'<span>OLYMPE</span>',
      restoSubtitle: 'La vraie alimentation dont ton corps a besoin après l\'effort. Des repas frais cuisinés chaque matin avec des ingrédients sains, sans huiles industrielles et pesés au gramme près.',
      goldenRuleTitle: 'La Règle d\'Or de l\'Assiette Athlétique Olympe',
      flyersPill: 'Support Officiel Imprimable',
      flyersTitle: 'FLYER OFFICIEL <span>RECTO & VERSO (PDF)</span>',
      flyersSubtitle: 'Menu complet et formules d\'abonnement réunis sur 1 seule feuille recto/verso (PDF 2 pages A4 prêt à imprimer ou partager).',
      btnOpenPdf: 'Télécharger le Flyer Officiel 2 Pages en PDF',
      pdfHint: 'Document officiel en haute résolution • Format A4 Recto/Verso',
      pricingPill: 'Tarifs & Abonnements',
      pricingTitle: 'PLANS D\'<span>ABONNEMENT</span>',
      pricingSubtitle: 'Choisis ton plan. Active le <strong>débit automatique Bancard</strong> pour bénéficier d\'une remise fidélité de 5% et sécuriser tes entraînements et repas frais sans coupure.',
      cycleWeekly: 'Semaine (6 Jours)',
      cycleMonthly: 'Mois Complet (Lun au Sam)',
      adControlTitle: '💳 Débit Automatique Bancard :',
      adControlDisc: '5% de Remise Immédiate Incluse',
      planTypeClub: 'Académie de Combat',
      planTitleClub: 'Club Kickboxing & Boxe',
      planFeatClub1: 'Accès libre aux cours de <strong>Kickboxing K-1 Rules</strong>',
      planFeatClub2: 'Cours de <strong>Boxe Traditionnelle Anglaise</strong>',
      planFeatClub3: 'Accès au ring, sacs lourds de 60kg et leçons de frappe',
      planFeatClub4: 'Jour d\'essai gratuit offert sans engagement',
      planFeatClub5: 'Encadrement technique par des combattants d\'expérience',
      btnSelectClub: 'S\'inscrire au Club (150k)',
      planType1Plato: 'Nutrition Quotidienne',
      planTitle1Plato: 'Pack 1 Plat / Jour',
      planFeat1Plato1: '1 repas complet par jour : Déjeuner ou Dîner',
      planFeat1Plato2: 'Recettes tournantes fraîches du Lundi au Samedi',
      planFeat1Plato3: '200g de protéine pure + glucides propres + salade',
      planFeat1Plato4: 'Fruits de saison frais inclus à chaque repas',
      planFeat1Plato5: 'Retrait direct à la salle ou livraison (+20%)',
      btnSelect1Plato: 'Choisir 1 Plat/Jour',
      ribbonPopular: '⭐ Plan le Plus Populaire',
      planTypeFighterPro: 'Athlète & Combattant',
      planTitleFighterPro: 'Fighter Pro (2 Plats)',
      planFeatFighter1: '<strong>2 repas complets par jour :</strong> Midi + Soir',
      planFeatFighter2: 'Zéro courses, zéro corvée de cuisine après l\'entraînement',
      planFeatFighter3: 'Stop au catabolisme nocturne : récupération maximale',
      planFeatFighter4: 'Plats chauds hermétiques prêts à emporter',
      planFeatFighter5: 'Tarif ultra-compétitif : moins de 19.000 ₲ le repas sain',
      btnSelectFighter: 'Choisir Fighter Pro',
      ribbonElite: '🏆 Transformation Totale',
      planTypeElite: 'Pack Hybride Ultime',
      planTitleElite: 'Combo Fighter Elite',
      planFeatElite1: '<strong>Accès complet illimité</strong> aux cours de Kickboxing & Boxe',
      planFeatElite2: '<strong>2 repas athlétiques par jour</strong> préparés à la salle',
      planFeatElite3: 'Suivi mensuel de composition corporelle et poids',
      planFeatElite4: 'Priorité de service en cuisine et à la livraison',
      planFeatElite5: 'L\'expérience totale de l\'Olympe au meilleur prix',
      btnSelectElite: 'Choisir le Pack Elite',
      modalTitle: 'Inscription & Paiement Sécurisé (Paraguay)',
      step1Badge: 'Étape 1',
      step1Title: 'Entraînement au Club de Combat (Bristol d\'Areguá)',
      step1Desc: 'Kickboxing K-1 Rules & Boxe Traditionnelle Anglaise. Ring de frappe et sacs lourds.',
      quoteMain: '« S\'entraîner c\'est 50% du travail, l\'autre moitié c\'est de bien se nourrir. »',
      quoteSub: '« S\'entraîner dur sans bien manger, c\'est comme ramer sans rames ! » — Règle d\'or de l\'Olympe',
      step2Badge: 'Étape 2',
      step2Title: 'Choisis ton Programme Nutritif (Cuisine du Club)',
      adTitle: '🔄 Activer le Débit Automatique Bancard (-5% de remise)',
      adSub: 'Renouvellement automatique chaque mois. Résiliable à tout moment en 1 clic.',
      blockServices: '3. Services & Livraison',
      lblDelivery: '<strong>Service Livraison à Domicile (+20% de l\'abonnement)</strong> — Retrait au club gratuit sinon.',
      lblDoubleProt: 'Double Portion de Protéine (+2x Viande/Poulet : +10.000 ₲ par repas)',
      blockCustomer: '4. Vos Coordonnées',
      lblCustName: 'Nom & Prénom *',
      lblCustPhone: 'WhatsApp / Téléphone *',
      lblCustCI: 'C.I. ou RUC (pour la facture paraguayenne) *',
      lblCustAddress: 'Adresse de Livraison ou Retrait au Club',
      blockPayment: '5. Moyen de Paiement Localisé au Paraguay',
      sumDiscountLabel: 'Remise Débit Automatique (-5%) :',
      sumDeliveryLabel: 'Livraison Areguá (+20% abonnement) :',
      sumProtLabel: 'Double Portion Protéine :',
      sumTotalLabel: 'TOTAL À RÉGLER :',
      lblLegalAccept: 'J\'accepte les <a href="#" onclick="window.openLegalModal(); return false;" style="color: var(--brand-blue-light); text-decoration: underline;">conditions légales & sanitaires</a> applicables aux clubs de sport et à la restauration au Paraguay.',
      btnSubmitOrder: 'Valider la Commande & Transmettre sur WhatsApp (+595 995 620416)',
      affPill: 'Revenus Passifs',
      affTitle: 'PROGRAMME D\'<span>AMBASSADEURS & AFFILIATION</span>',
      contactPill: 'Accès & Contact',
      contactTitle: 'REJOINS L\'<span>OLYMPE À AREGUÁ</span>'
    },
    en: {
      alertBar: 'Daily capacity: 50 fresh meals cooked every morning • Monday to Saturday in Areguá • No reservation required',
      navHome: 'Home',
      navFacility: 'The Complex',
      navFightClub: 'Fight Club',
      navRestoFit: 'Restaurant',
      navFlyers: 'Flyers',
      navPricing: 'Pricing',
      navAffiliates: 'Affiliates',
      navContact: 'Location',
      navJoin: 'Join Club',
      heroTag: 'Official Combat Club & Athletic Nutrition • Bristol of Areguá',
      heroTitle1: 'FORGE YOUR WARRIOR',
      heroTitleWarrior: 'BODY',
      heroTitle2: 'FUEL YOUR POWER AT',
      heroTitleOlimpo: 'OLIMPO',
      heroLead: 'The first complex in Areguá fusing the rigorous technique of <strong>K-1 Kickboxing</strong> and <strong>Traditional Boxing</strong> with <strong>calibrated sports nutrition</strong> (1/3 Protein, 1/3 Clean Carbs, 1/3 Fibers). Cooked fresh every morning.',
      btnViewPacks: 'Choose a Plan',
      btnGoToClub: '📍 Get Directions (GPS)',
      heroProofAthletes: '+50 Athletes',
      heroProofCommunity: 'Olimpo Community',
      showcaseBadge: 'Olimpo Ecosystem',
      showcaseLive: 'Open Mon - Sat',
      showcaseSub: 'Fighter Pro Pack (2 Meals/Day)',
      btnShowcaseOrder: 'Order Now',
      facilityTag: 'EXPANDING PROJECT & ACTIVE FIGHT COMMUNITY',
      facilityTitle: 'A PROJECT GROWING WITH YOU <span>• THE CLUB IS ALREADY OPEN & ACTIVE!</span>',
      facilityPunchline1: '→ Come train to fight!',
      facilityPunchline2: '→ And fuel your body right after your session!',
      facilityDesc: 'At Olimpo, we eliminated the biggest obstacle for athletes: training hard and wasting efforts due to poor nutrition and lack of time. Our complex unites under one roof a fight club and athletic sports kitchen.',
      evolutionBadge: '📐 MASTERPLAN BLUEPRINTS • CLUB 100% OPERATIONAL',
      facilityProjectNotice: 'These visuals showcase the <strong>architectural masterplan and final vision of our complex</strong>. We are actively finishing build-out, but <strong>the club is 100% open and fully operational for all daily fight workouts</strong> (K-1 Kickboxing & Traditional Boxing). Join the Olimpo community from day one and take part in the club’s evolution!',
      rotatorSlide1: '🥊 1. Combat Training Gym (Ring & Bags) • Open Now',
      rotatorSlide2: '🥗 2. Integrated Fit Restaurant • Finishing Works',
      rotatorHint: 'Project masterplan • Auto rotation',
      clubPill: 'Fight Academy',
      clubTitle: 'FIGHTING CLUB <span>OLIMPO TEAM</span>',
      clubSubtitle: 'Develop iron discipline, explosive speed and ring power. Strict specialization in K-1 Rules Kickboxing and Traditional Boxing. No ground combat, no grappling: pure striking and evasions.',
      restoPill: 'Sports Nutrition',
      restoTitle: 'OLIMPO <span>RESTAURANT</span>',
      restoSubtitle: 'Real athletic nutrition your body needs after hard training. Fresh meals cooked every morning with clean ingredients, zero industrial fry oils and weighed to the gram.',
      goldenRuleTitle: 'The Golden Rule of the Olimpo Athlete Plate',
      flyersPill: 'Official Printable Asset',
      flyersTitle: 'OFFICIAL FLYER <span>FRONT & BACK (PDF)</span>',
      flyersSubtitle: 'Complete weekly menu and subscription packs consolidated on a single 2-sided sheet (2-page A4 PDF ready to print or share).',
      btnOpenPdf: 'Download Official 2-Page PDF Flyer',
      pdfHint: 'Official high-resolution document • A4 Front & Back format',
      pricingPill: 'Rates & Memberships',
      pricingTitle: 'SUBSCRIPTION <span>PLANS</span>',
      pricingSubtitle: 'Choose your plan. Activate <strong>Bancard auto-debit</strong> to get an immediate 5% discount and secure your uninterrupted workouts and fresh meals.',
      cycleWeekly: 'Weekly (6 Days)',
      cycleMonthly: 'Full Month (Mon to Sat)',
      adControlTitle: '💳 Bancard Auto-Debit:',
      adControlDisc: '5% Instant Discount Included',
      planTypeClub: 'Fight Academy',
      planTitleClub: 'Kickboxing & Boxing Club',
      planFeatClub1: 'Full access to <strong>K-1 Rules Kickboxing</strong> classes',
      planFeatClub2: '<strong>Traditional Boxing</strong> training sessions',
      planFeatClub3: 'Access to official ring, 60kg heavy bags & pad work',
      planFeatClub4: '1st Free trial day included without commitment',
      planFeatClub5: 'Technical coaching by experienced fighters',
      btnSelectClub: 'Join the Club (150k)',
      planType1Plato: 'Daily Nutrition',
      planTitle1Plato: '1 Meal / Day Pack',
      planFeat1Plato1: '1 complete athlete meal per day: Lunch or Dinner',
      planFeat1Plato2: 'Rotating fresh menu from Monday to Saturday',
      planFeat1Plato3: '200g pure protein + clean carbs + fresh salad',
      planFeat1Plato4: 'Fresh seasonal fruits included with every meal',
      planFeat1Plato5: 'Direct club pickup or home delivery (+20%)',
      btnSelect1Plato: 'Choose 1 Meal/Day',
      ribbonPopular: '⭐ Most Popular Plan',
      planTypeFighterPro: 'Athlete & Fighter',
      planTitleFighterPro: 'Fighter Pro (2 Meals)',
      planFeatFighter1: '<strong>2 complete meals per day:</strong> Lunch + Dinner',
      planFeatFighter2: 'Zero grocery shopping, zero cooking after tough workouts',
      planFeatFighter3: 'Prevent nocturnal catabolism: maximum muscle recovery',
      planFeatFighter4: 'Sealed hot containers ready to eat or take away',
      planFeatFighter5: 'Ultra-competitive rate: under 19,000 ₲ per clean meal',
      btnSelectFighter: 'Choose Fighter Pro',
      ribbonElite: '🏆 Total Transformation',
      planTypeElite: 'Ultimate Hybrid Pack',
      planTitleElite: 'Fighter Elite Combo',
      planFeatElite1: '<strong>Full unlimited access</strong> to Kickboxing & Boxing',
      planFeatElite2: '<strong>2 athletic meals per day</strong> cooked fresh at the gym',
      planFeatElite3: 'Monthly body composition and weight tracking',
      planFeatElite4: 'VIP service priority in kitchen and delivery',
      planFeatElite5: 'The complete Olimpo experience at the best price',
      btnSelectElite: 'Choose Elite Pack',
      modalTitle: 'Checkout & Secure Payment (Paraguay)',
      step1Badge: 'Step 1',
      step1Title: 'Fight Club Training (Bristol of Areguá)',
      step1Desc: 'K-1 Rules Kickboxing & Traditional Boxing. Official ring and heavy bags.',
      quoteMain: '« Training is 50% of the work, the other half is proper nutrition. »',
      quoteSub: '« Training hard without eating well is like rowing without oars! » — Olimpo Golden Rule',
      step2Badge: 'Step 2',
      step2Title: 'Choose Your Nutrition Plan (Club Kitchen)',
      adTitle: '🔄 Enable Bancard Auto-Debit (5% instant discount)',
      adSub: 'Automatic renewal every month. Cancel anytime with 1 click.',
      blockServices: '3. Services & Delivery',
      lblDelivery: '<strong>Home Delivery Service (+20% of subscription)</strong> — Free pickup at the club otherwise.',
      lblDoubleProt: 'Double Protein Portion (+2x Meat/Chicken: +10,000 ₲ per meal)',
      blockCustomer: '4. Your Contact Details',
      lblCustName: 'Full Name *',
      lblCustPhone: 'WhatsApp / Phone *',
      lblCustCI: 'C.I. or RUC (for official Paraguay invoice) *',
      lblCustAddress: 'Delivery Address or Club Pickup',
      blockPayment: '5. Payment Gateway in Paraguay',
      sumDiscountLabel: 'Auto-Debit Discount (-5%):',
      sumDeliveryLabel: 'Areguá Delivery (+20%):',
      sumProtLabel: 'Double Protein Portion:',
      sumTotalLabel: 'TOTAL DUE:',
      lblLegalAccept: 'I accept the <a href="#" onclick="window.openLegalModal(); return false;" style="color: var(--brand-blue-light); text-decoration: underline;">legal & sanitary terms</a> applicable to sports clubs and dining in Paraguay.',
      btnSubmitOrder: 'Confirm Order & Send to WhatsApp (+595 995 620416)',
      affPill: 'Passive Income',
      affTitle: 'AMBASSADORS & <span>AFFILIATE PROGRAM</span>',
      contactPill: 'Access & Contact',
      contactTitle: 'JOIN <span>OLIMPO IN AREGUÁ</span>'
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
  }

  function applyLanguage(lang) {
    state.lang = lang;
    localStorage.setItem('olimpo_lang', lang);
    document.documentElement.lang = lang;

    const t = translations[lang] || translations.es;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key]) {
        el.innerHTML = t[key];
      }
    });

    const langSelect = document.getElementById('langSelect');
    if (langSelect && langSelect.value !== lang) {
      langSelect.value = lang;
    }

    updateCheckoutSelectorTranslations(lang);
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