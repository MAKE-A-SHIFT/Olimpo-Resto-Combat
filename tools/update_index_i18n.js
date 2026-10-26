const fs = require('fs');
const path = require('path');

let html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

// 1. Referral banner
html = html.replace(
  `  <div class="affiliate-referral-banner" id="affiliateBanner" style="display: none;">\n    <span>🤝 Invitado oficial de:</span>\n    <span class="ref-code" id="bannerRefCode">WARRIOR</span>\n    <span>• Tu beneficio de descuento y fidelidad está activo en tu pedido.</span>\n  </div>`,
  `  <div class="affiliate-referral-banner" id="affiliateBanner" style="display: none;">\n    <span data-i18n="affBannerGuest">🤝 Invitado oficial de:</span>\n    <span class="ref-code" id="bannerRefCode">WARRIOR</span>\n    <span data-i18n="affBannerBenefit">• Tu beneficio de descuento y fidelidad está activo en tu pedido.</span>\n  </div>`
);

// 2. Brand Subtitle
html = html.replace(
  `<span class="brand-subtitle">Club & Resto Fit</span>`,
  `<span class="brand-subtitle" data-i18n="navBrandSub">Club & Resto Fit</span>`
);

// 3. Hero duo box
html = html.replace(
  `                <div class="duo-title">Fighting Club</div>\n                <div class="duo-sub">Kickboxing • Boxe Anglaise • 150k/mois</div>`,
  `                <div class="duo-title" data-i18n="heroDuoClubTitle">Fighting Club</div>\n                <div class="duo-sub" data-i18n="heroDuoClubSub">Kickboxing • Boxe Anglaise • 150k/mois</div>`
);
html = html.replace(
  `                <div class="duo-title">Restaurant Fit</div>\n                <div class="duo-sub">200g Poulet • Macros Pesés</div>`,
  `                <div class="duo-title" data-i18n="heroDuoRestoTitle">Restaurant Fit</div>\n                <div class="duo-sub" data-i18n="heroDuoRestoSub">200g Poulet • Macros Pesés</div>`
);

// 4. Hero card showcase price
html = html.replace(
  `<span class="price-val" id="showcasePriceVal">Dès 18.801 ₲ / plato</span>`,
  `<span class="price-val" id="showcasePriceVal" data-i18n="showcasePriceVal">Dès 18.801 ₲ / plato</span>`
);

// 5. Facility duo cards (Complejo)
html = html.replace(
  `<div style="font-size: 11.5px; font-weight: 700; color: var(--brand-blue-dark); text-transform: uppercase; margin-bottom: 8px;">1. Cœur du Complexe</div>\n            <h3 class="facility-title">🥊 La Salle de Combat (Fighting Club)</h3>\n            <p class="facility-desc">\n              Un espace pensé pour la rigueur pugilistique. Pas de gadgets inutiles : un ring de combat, des sacs de frappe lourds pour le conditionnement, des surfaces d'appuis fermes et des entraîneurs chevronnés dédiés au <strong>Kickboxing K-1</strong> et à la <strong>Boxe Traditionnelle Anglaise</strong>.\n            </p>\n            <div style="margin-top: 15px; font-size: 13.5px; font-weight: 700; color: var(--brand-blue-dark);">\n              Tarif Adhésion : 150.000 ₲ / mois • Jour d'essai gratuit disponible\n            </div>`,
  `<div style="font-size: 11.5px; font-weight: 700; color: var(--brand-blue-dark); text-transform: uppercase; margin-bottom: 8px;" data-i18n="facilityCard1Badge">1. Cœur du Complexe</div>\n            <h3 class="facility-title" data-i18n="facilityCard1Title">🥊 La Salle de Combat (Fighting Club)</h3>\n            <p class="facility-desc" data-i18n="facilityCard1Desc">\n              Un espace pensé pour la rigueur pugilistique. Pas de gadgets inutiles : un ring de combat, des sacs de frappe lourds pour le conditionnement, des surfaces d'appuis fermes et des entraîneurs chevronnés dédiés au <strong>Kickboxing K-1</strong> et à la <strong>Boxe Traditionnelle Anglaise</strong>.\n            </p>\n            <div style="margin-top: 15px; font-size: 13.5px; font-weight: 700; color: var(--brand-blue-dark);" data-i18n="facilityCard1Price">\n              Tarif Adhésion : 150.000 ₲ / mois • Jour d'essai gratuit disponible\n            </div>`
);

html = html.replace(
  `<div style="font-size: 11.5px; font-weight: 700; color: var(--brand-blue-dark); text-transform: uppercase; margin-bottom: 8px;">2. Intégré à la Salle</div>\n            <h3 class="facility-title">🥗 Le Restaurant Athlétique du Club</h3>\n            <p class="facility-desc">\n              La cuisine du club opère chaque matin dès 06h00 pour concocter les 50 repas du jour. Chaque assiette respecte la Règle d'Or (1/3 Protéines, 1/3 Glucides propres, 1/3 Fibres et fruit). Tu manges exactement ce que ton métabolisme réclame pour réparer les tissus et exploser tes performances.\n            </p>\n            <div style="margin-top: 15px; font-size: 13.5px; font-weight: 700; color: #16a34a;">\n              « S'entraîner c'est 50% du travail, l'autre moitié c'est de bien se nourrir. »\n            </div>`,
  `<div style="font-size: 11.5px; font-weight: 700; color: var(--brand-blue-dark); text-transform: uppercase; margin-bottom: 8px;" data-i18n="facilityCard2Badge">2. Intégré à la Salle</div>\n            <h3 class="facility-title" data-i18n="facilityCard2Title">🥗 Le Restaurant Athlétique du Club</h3>\n            <p class="facility-desc" data-i18n="facilityCard2Desc">\n              La cuisine du club opère chaque matin dès 06h00 pour concocter les 50 repas du jour. Chaque assiette respecte la Règle d'Or (1/3 Protéines, 1/3 Glucides propres, 1/3 Fibres et fruit). Tu manges exactement ce que ton métabolisme réclame pour réparer les tissus et exploser tes performances.\n            </p>\n            <div style="margin-top: 15px; font-size: 13.5px; font-weight: 700; color: #16a34a;" data-i18n="facilityCard2Quote">\n              « S'entraîner c'est 50% du travail, l'autre moitié c'est de bien se nourrir. »\n            </div>`
);

// 6. Section 2 Fighting Club Planning
html = html.replace(
  `          <div class="schedule-header">\n            <div>\n              <h3 class="schedule-title">Planning des Séances de Combat</h3>\n              <p style="color: var(--text-dim); font-size: 13.5px; margin-top: 4px;">Entraînements du Lundi au Samedi au club (Bristol d'Areguá, près du Cacique).</p>\n            </div>\n            <button class="btn-hero-primary" onclick="window.openCheckout('club_kickboxing')">Réserver un Essai Gratuit</button>\n          </div>`,
  `          <div class="schedule-header">\n            <div>\n              <h3 class="schedule-title" data-i18n="schedHeaderTitle">Planning des Séances de Combat</h3>\n              <p style="color: var(--text-dim); font-size: 13.5px; margin-top: 4px;" data-i18n="schedHeaderSub">Entraînements du Lundi au Samedi au club (Bristol d'Areguá, près du Cacique).</p>\n            </div>\n            <button class="btn-hero-primary" onclick="window.openCheckout('club_kickboxing')" data-i18n="btnBookTrial">Réserver un Essai Gratuit</button>\n          </div>`
);

html = html.replace(
  `          <div class="schedule-grid">\n            <div class="schedule-card">\n              <div class="sched-slot">🌅 Matin (07:00 – 08:30)</div>\n              <div class="sched-class">Condition Physique & Sacs de Frappe</div>\n              <div class="sched-meta">Cardio combat, renforcement du tronc et combinaisons aux sacs lourds.</div>\n            </div>\n            <div class="schedule-card">\n              <div class="sched-slot">☀️ Midi (12:30 – 14:00)</div>\n              <div class="sched-class">Boxe Traditionnelle Anglaise</div>\n              <div class="sched-meta">Jeu de jambes, esquives rotatives et travail technique aux pattes d'ours.</div>\n            </div>\n            <div class="schedule-card">\n              <div class="sched-slot">🌙 Soir (18:00 – 19:30)</div>\n              <div class="sched-class">Kickboxing K-1 Rules Collectif</div>\n              <div class="sched-meta">Cours phare : poings-pieds, balayages, enchaînements et haute intensité.</div>\n            </div>\n            <div class="schedule-card">\n              <div class="sched-slot">🔥 Avancé (19:30 – 21:00)</div>\n              <div class="sched-class">Sparring Contrôlé & Perfectionnement</div>\n              <div class="sched-meta">Assauts souples avec protections intégrales et mise en situation de ring.</div>\n            </div>\n          </div>`,
  `          <div class="schedule-grid">\n            <div class="schedule-card">\n              <div class="sched-slot" data-i18n="schedSlot1">🌅 Matin (07:00 – 08:30)</div>\n              <div class="sched-class" data-i18n="schedClass1">Condition Physique & Sacs de Frappe</div>\n              <div class="sched-meta" data-i18n="schedMeta1">Cardio combat, renforcement du tronc et combinaisons aux sacs lourds.</div>\n            </div>\n            <div class="schedule-card">\n              <div class="sched-slot" data-i18n="schedSlot2">☀️ Midi (12:30 – 14:00)</div>\n              <div class="sched-class" data-i18n="schedClass2">Boxe Traditionnelle Anglaise</div>\n              <div class="sched-meta" data-i18n="schedMeta2">Jeu de jambes, esquives rotatives et travail technique aux pattes d'ours.</div>\n            </div>\n            <div class="schedule-card">\n              <div class="sched-slot" data-i18n="schedSlot3">🌙 Soir (18:00 – 19:30)</div>\n              <div class="sched-class" data-i18n="schedClass3">Kickboxing K-1 Rules Collectif</div>\n              <div class="sched-meta" data-i18n="schedMeta3">Cours phare : poings-pieds, balayages, enchaînements et haute intensité.</div>\n            </div>\n            <div class="schedule-card">\n              <div class="sched-slot" data-i18n="schedSlot4">🔥 Avancé (19:30 – 21:00)</div>\n              <div class="sched-class" data-i18n="schedClass4">Sparring Contrôlé & Perfectionnement</div>\n              <div class="sched-meta" data-i18n="schedMeta4">Assauts souples avec protections intégrales et mise en situation de ring.</div>\n            </div>\n          </div>`
);

// 7. Section 3 Golden Rule Triad
html = html.replace(
  `          <div class="rule-header">\n            <h3 data-i18n="goldenRuleTitle">La Règle d'Or de l'Assiette Athlétique Olympe</h3>\n            <p>Équilibre métabolique pensé pour sécher le tissu adipeux et réparer les fibres musculaires.</p>\n          </div>`,
  `          <div class="rule-header">\n            <h3 data-i18n="goldenRuleTitle">La Règle d'Or de l'Assiette Athlétique Olympe</h3>\n            <p data-i18n="goldenRuleSubtitle">Équilibre métabolique pensé pour sécher le tissu adipeux et réparer les fibres musculaires.</p>\n          </div>`
);

html = html.replace(
  `          <div class="rule-triad">\n            <div class="triad-col">\n              <div class="triad-badge">1/3 de l'Assiette</div>\n              <div class="triad-title">Protéines Pures</div>\n              <p class="triad-desc">Blanc de poulet grillé (200g), bœuf maigre ou œufs frais pour la reconstruction musculaire.</p>\n            </div>\n            <div class="triad-col">\n              <div class="triad-badge">1/3 de l'Assiette</div>\n              <div class="triad-title">Glucides Propres</div>\n              <p class="triad-desc">Riz blanc vapeur, pâtes au wok ou manioc fondant pour recharger les réserves de glycogène.</p>\n            </div>\n            <div class="triad-col">\n              <div class="triad-badge">1/3 de l'Assiette</div>\n              <div class="triad-title">Fibres & Vitamines</div>\n              <p class="triad-desc">Salades croquantes fraîches, légumes sautés au wok et fruits de saison entiers (orange, pomme, banane).</p>\n            </div>\n          </div>`,
  `          <div class="rule-triad">\n            <div class="triad-col">\n              <div class="triad-badge" data-i18n="triadBadge1">1/3 de l'Assiette</div>\n              <div class="triad-title" data-i18n="triadTitle1">Protéines Pures</div>\n              <p class="triad-desc" data-i18n="triadDesc1">Blanc de poulet grillé (200g), bœuf maigre ou œufs frais pour la reconstruction musculaire.</p>\n            </div>\n            <div class="triad-col">\n              <div class="triad-badge" data-i18n="triadBadge2">1/3 de l'Assiette</div>\n              <div class="triad-title" data-i18n="triadTitle2">Glucides Propres</div>\n              <p class="triad-desc" data-i18n="triadDesc2">Riz blanc vapeur, pâtes au wok ou manioc fondant pour recharger les réserves de glycogène.</p>\n            </div>\n            <div class="triad-col">\n              <div class="triad-badge" data-i18n="triadBadge3">1/3 de l'Assiette</div>\n              <div class="triad-title" data-i18n="triadTitle3">Fibres & Vitamines</div>\n              <p class="triad-desc" data-i18n="triadDesc3">Salades croquantes fraîches, légumes sautés au wok et fruits de saison entiers (orange, pomme, banane).</p>\n            </div>\n          </div>`
);

// 8. Goals selector header & tabs
html = html.replace(
  `<h4 style="font-family: var(--font-greek); font-size: 18px; font-weight: 700; color: var(--brand-blue-dark); letter-spacing: 0.05em;">\n              Calibre Ton Assiette Selon Ton Objectif Actuel\n            </h4>\n            <p style="font-size: 13.5px; color: var(--text-light-body); margin-top: 4px;">\n              Clique sur ton profil pour voir comment nous équilibrons tes portions en cuisine :\n            </p>`,
  `<h4 style="font-family: var(--font-greek); font-size: 18px; font-weight: 700; color: var(--brand-blue-dark); letter-spacing: 0.05em;" data-i18n="goalsHeaderTitle">\n              Calibre Ton Assiette Selon Ton Objectif Actuel\n            </h4>\n            <p style="font-size: 13.5px; color: var(--text-light-body); margin-top: 4px;" data-i18n="goalsHeaderSub">\n              Clique sur ton profil pour voir comment nous équilibrons tes portions en cuisine :\n            </p>`
);

html = html.replace(
  `          <div class="goals-nav-tabs">\n            <button class="btn-goal-tab" data-goal="perdida_peso">1. Perte de Poids</button>\n            <button class="btn-goal-tab" data-goal="definicion">2. Sèche & Définition</button>\n            <button class="btn-goal-tab active" data-goal="mantenimiento">3. Maintien (Règle d'Or)</button>\n            <button class="btn-goal-tab" data-goal="ganancia_masa">4. Prise de Masse</button>\n          </div>`,
  `          <div class="goals-nav-tabs">\n            <button class="btn-goal-tab" data-goal="perdida_peso" data-i18n="goalTabWeightLoss">1. Perte de Poids</button>\n            <button class="btn-goal-tab" data-goal="definicion" data-i18n="goalTabCutting">2. Sèche & Définition</button>\n            <button class="btn-goal-tab active" data-goal="mantenimiento" data-i18n="goalTabMaintenance">3. Maintien (Règle d'Or)</button>\n            <button class="btn-goal-tab" data-goal="ganancia_masa" data-i18n="goalTabBulking">4. Prise de Masse</button>\n          </div>`
);

// Macro labels in goal box
html = html.replace(
  `<div class="goal-macro-label">Protéine</div>`,
  `<div class="goal-macro-label" data-i18n="macroLabelProt">Protéine</div>`
);
html = html.replace(
  `<div class="goal-macro-label">Glucides</div>`,
  `<div class="goal-macro-label" data-i18n="macroLabelCarbs">Glucides</div>`
);
html = html.replace(
  `<div class="goal-macro-label">Fibres & Fruit</div>`,
  `<div class="goal-macro-label" data-i18n="macroLabelVeg">Fibres & Fruit</div>`
);

// 9. Day tabs in restaurant
html = html.replace(
  `        <div class="menu-tab-nav">\n          <button class="btn-menu-tab active" data-filter="all">Tous les Plats</button>\n          <button class="btn-menu-tab" data-filter="Lunes">Lundi</button>\n          <button class="btn-menu-tab" data-filter="Martes">Mardi</button>\n          <button class="btn-menu-tab" data-filter="Miércoles">Mercredi</button>\n          <button class="btn-menu-tab" data-filter="Jueves">Jeudi</button>\n          <button class="btn-menu-tab" data-filter="Viernes">Vendredi</button>\n          <button class="btn-menu-tab" data-filter="Sábado">Samedi</button>\n        </div>`,
  `        <div class="menu-tab-nav">\n          <button class="btn-menu-tab active" data-filter="all" data-i18n="tabAllDishes">Tous les Plats</button>\n          <button class="btn-menu-tab" data-filter="Lunes" data-i18n="tabMonday">Lundi</button>\n          <button class="btn-menu-tab" data-filter="Martes" data-i18n="tabTuesday">Mardi</button>\n          <button class="btn-menu-tab" data-filter="Miércoles" data-i18n="tabWednesday">Mercredi</button>\n          <button class="btn-menu-tab" data-filter="Jueves" data-i18n="tabThursday">Jeudi</button>\n          <button class="btn-menu-tab" data-filter="Viernes" data-i18n="tabFriday">Vendredi</button>\n          <button class="btn-menu-tab" data-filter="Sábado" data-i18n="tabSaturday">Samedi</button>\n        </div>`
);

// 10. Affiliates section
html = html.replace(
  `          <p class="section-desc">\n            Tu t'entraînes au club ou tu adores nos plats ? Invite tes amis, tes partenaires de combat et tes collègues et <strong>touche jusqu'à 15% de commission récurrente</strong> chaque mois tant qu'ils restent abonnés.\n          </p>`,
  `          <p class="section-desc" data-i18n="affSubtitle">\n            Tu t'entraînes au club ou tu adores nos plats ? Invite tes amis, tes partenaires de combat et tes collègues et <strong>touche jusqu'à 15% de commission récurrente</strong> chaque mois tant qu'ils restent abonnés.\n          </p>`
);

html = html.replace(
  `          <h3 style="font-family: var(--font-greek); font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 12px; letter-spacing: 0.04em;">\n            Comment Fonctionne le Système d'Affiliation ?\n          </h3>\n          <p style="color: var(--text-body); font-size: 14.5px; max-width: 820px; line-height: 1.7;">\n            1. Génère ton lien de parrainage exclusif ci-dessous.<br>\n            2. Partage-le sur WhatsApp, Instagram ou directement au club.<br>\n            3. Dès qu'un filleul commande son pack de repas ou s'inscrit au club, ta commission est créditée automatiquement.<br>\n            4. Retire tes gains quand tu veux par virement bancaire SIPAP, portefeuille Tigo Money ou en espèces à la réception du club.\n          </p>`,
  `          <h3 style="font-family: var(--font-greek); font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 12px; letter-spacing: 0.04em;" data-i18n="affHowTitle">\n            Comment Fonctionne le Système d'Affiliation ?\n          </h3>\n          <p style="color: var(--text-body); font-size: 14.5px; max-width: 820px; line-height: 1.7;" data-i18n="affHowSteps">\n            1. Génère ton lien de parrainage exclusif ci-dessous.<br>\n            2. Partage-le sur WhatsApp, Instagram ou directement au club.<br>\n            3. Dès qu'un filleul commande son pack de repas ou s'inscrit au club, ta commission est créditée automatiquement.<br>\n            4. Retire tes gains quand tu veux par virement bancaire SIPAP, portefeuille Tigo Money ou en espèces à la réception du club.\n          </p>`
);

html = html.replace(
  `            <div class="aff-stat-card">\n              <div class="aff-stat-number">10%</div>\n              <div class="aff-stat-label">Commissions Packs Nutrition</div>\n            </div>\n            <div class="aff-stat-card">\n              <div class="aff-stat-number">15%</div>\n              <div class="aff-stat-label">Commissions Abonnements Club</div>\n            </div>\n            <div class="aff-stat-card">\n              <div class="aff-stat-number">Mois après Mois</div>\n              <div class="aff-stat-label">Rémunération Récurrente</div>\n            </div>\n            <div class="aff-stat-card">\n              <div class="aff-stat-number">SIPAP / Tigo</div>\n              <div class="aff-stat-label">Paiement Direct au Paraguay</div>\n            </div>`,
  `            <div class="aff-stat-card">\n              <div class="aff-stat-number">10%</div>\n              <div class="aff-stat-label" data-i18n="affStat1Label">Commissions Packs Nutrition</div>\n            </div>\n            <div class="aff-stat-card">\n              <div class="aff-stat-number">15%</div>\n              <div class="aff-stat-label" data-i18n="affStat2Label">Commissions Abonnements Club</div>\n            </div>\n            <div class="aff-stat-card">\n              <div class="aff-stat-number" data-i18n="affStat3Num">Mois après Mois</div>\n              <div class="aff-stat-label" data-i18n="affStat3Label">Rémunération Récurrente</div>\n            </div>\n            <div class="aff-stat-card">\n              <div class="aff-stat-number">SIPAP / Tigo</div>\n              <div class="aff-stat-label" data-i18n="affStat4Label">Paiement Direct au Paraguay</div>\n            </div>`
);

// Calculator
html = html.replace(
  `          <h3 style="font-family: var(--font-greek); font-size: 18px; font-weight: 700; color: var(--brand-blue-light); margin-bottom: 22px; letter-spacing: 0.04em;">\n            Simulateur de Gains Mensuels par Filleuls\n          </h3>`,
  `          <h3 style="font-family: var(--font-greek); font-size: 18px; font-weight: 700; color: var(--brand-blue-light); margin-bottom: 22px; letter-spacing: 0.04em;" data-i18n="calcTitle">\n            Simulateur de Gains Mensuels par Filleuls\n          </h3>`
);
html = html.replace(
  `<span>Amis abonnés aux repas (Packs de nutrition) :</span>`,
  `<span data-i18n="calcLabelMeals">Amis abonnés aux repas (Packs de nutrition) :</span>`
);
html = html.replace(
  `<span>Amis inscrits aux cours de Kickboxing & Boxe :</span>`,
  `<span data-i18n="calcLabelClub">Amis inscrits aux cours de Kickboxing & Boxe :</span>`
);
html = html.replace(
  `<div class="calc-result-label">Revenus Estimés Par Mois :</div>`,
  `<div class="calc-result-label" data-i18n="calcResultLabel">Revenus Estimés Par Mois :</div>`
);
html = html.replace(
  `<div class="calc-result-note">Avec quelques personnes parrainées, ton propre abonnement et tes repas te reviennent totalement GRATUITS avec de l'argent en plus !</div>`,
  `<div class="calc-result-note" data-i18n="calcResultNote">Avec quelques personnes parrainées, ton propre abonnement et tes repas te reviennent totalement GRATUITS avec de l'argent en plus !</div>`
);

// Link generator
html = html.replace(
  `          <h3 style="font-family: var(--font-greek); font-size: 17px; font-weight: 700; color: #fff; letter-spacing: 0.04em;">\n            Générateur de Ton Lien Ambassadeur\n          </h3>\n          <p style="color: var(--text-dim); font-size: 13.5px; margin-top: 4px;">\n            Renseigne ton prénom ou ton pseudo sportif pour créer ton lien tracké :\n          </p>`,
  `          <h3 style="font-family: var(--font-greek); font-size: 17px; font-weight: 700; color: #fff; letter-spacing: 0.04em;" data-i18n="linkGenTitle">\n            Générateur de Ton Lien Ambassadeur\n          </h3>\n          <p style="color: var(--text-dim); font-size: 13.5px; margin-top: 4px;" data-i18n="linkGenSub">\n            Renseigne ton prénom ou ton pseudo sportif pour créer ton lien tracké :\n          </p>`
);
html = html.replace(
  `<input type="text" id="affAliasInput" class="aff-alias-input" placeholder="Ex: GUERRIER_ALEX" maxlength="20">`,
  `<input type="text" id="affAliasInput" class="aff-alias-input" placeholder="Ex: GUERRIER_ALEX" data-i18n-placeholder="affAliasPlaceholder" maxlength="20">`
);
html = html.replace(
  `<button id="btnGenLink" class="btn-gen-link">Générer Mon Lien</button>`,
  `<button id="btnGenLink" class="btn-gen-link" data-i18n="btnGenLink">Générer Mon Lien</button>`
);
html = html.replace(
  `<button id="btnCopyLink" class="btn-copy-link">📋 Copier le Lien</button>`,
  `<button id="btnCopyLink" class="btn-copy-link" data-i18n="btnCopyLink">📋 Copier le Lien</button>`
);
html = html.replace(
  `<button id="btnShareWa" class="btn-share-wa">📲 Partager sur WhatsApp</button>`,
  `<button id="btnShareWa" class="btn-share-wa" data-i18n="btnShareWa">📲 Partager sur WhatsApp</button>`
);

// Affiliate dashboard
html = html.replace(
  `            <h4 style="font-family: var(--font-greek); font-size: 15px; font-weight: 700; color: var(--brand-blue-light); letter-spacing: 0.04em;">\n              Aperçu de Ton Tableau de Bord Affilié\n            </h4>\n            <button class="btn-hero-primary" style="padding: 9px 18px; font-size: 13px;" onclick="window.openWithdrawModal()">\n              💸 Demander un Virement de Gains\n            </button>`,
  `            <h4 style="font-family: var(--font-greek); font-size: 15px; font-weight: 700; color: var(--brand-blue-light); letter-spacing: 0.04em;" data-i18n="dashTitle">\n              Aperçu de Ton Tableau de Bord Affilié\n            </h4>\n            <button class="btn-hero-primary" style="padding: 9px 18px; font-size: 13px;" onclick="window.openWithdrawModal()" data-i18n="btnWithdraw">\n              💸 Demander un Virement de Gains\n            </button>`
);
html = html.replace(
  `<div style="font-size: 11.5px; color: var(--text-dim);">Clics sur ton lien</div>`,
  `<div style="font-size: 11.5px; color: var(--text-dim);" data-i18n="dashClicks">Clics sur ton lien</div>`
);
html = html.replace(
  `<div style="font-size: 11.5px; color: var(--text-dim);">Filleuls inscrits</div>`,
  `<div style="font-size: 11.5px; color: var(--text-dim);" data-i18n="dashSignups">Filleuls inscrits</div>`
);
html = html.replace(
  `<div style="font-size: 11.5px; color: var(--text-dim);">Commissions totales</div>`,
  `<div style="font-size: 11.5px; color: var(--text-dim);" data-i18n="dashTotalEarn">Commissions totales</div>`
);
html = html.replace(
  `<div style="font-size: 11.5px; color: var(--text-dim);">Solde disponible</div>`,
  `<div style="font-size: 11.5px; color: var(--text-dim);" data-i18n="dashBalance">Solde disponible</div>`
);

// 11. Contact & FAQ
html = html.replace(
  `          <p class="section-desc">\n            Adresse officielle : <strong>Bristol d'Areguá, près du Cacique</strong> (Av. Mariscal Estigarribia), Areguá, Paraguay. Retrait sur place au club ou service de livraison à domicile (+20%).\n          </p>`,
  `          <p class="section-desc" data-i18n="contactSubtitle">\n            Adresse officielle : <strong>Bristol d'Areguá, près du Cacique</strong> (Av. Mariscal Estigarribia), Areguá, Paraguay. Retrait sur place au club ou service de livraison à domicile (+20%).\n          </p>`
);
html = html.replace(
  `<h3 style="font-family: var(--font-greek); font-size: 18px; font-weight: 700; color: var(--text-light-title); margin-bottom: 20px; letter-spacing: 0.04em;">\n              Horaires de Service & Retrait\n            </h3>`,
  `<h3 style="font-family: var(--font-greek); font-size: 18px; font-weight: 700; color: var(--text-light-title); margin-bottom: 20px; letter-spacing: 0.04em;" data-i18n="contactHoursTitle">\n              Horaires de Service & Retrait\n            </h3>`
);
html = html.replace(
  `<span style="color: var(--text-light-body);">📍 Emplacement :</span>\n                <strong style="color: var(--brand-blue-dark); text-align: right;">Bristol d'Areguá, près du Cacique</strong>`,
  `<span style="color: var(--text-light-body);" data-i18n="contactLocLabel">📍 Emplacement :</span>\n                <strong style="color: var(--brand-blue-dark); text-align: right;" data-i18n="contactLocVal">Bristol d'Areguá, près du Cacique</strong>`
);
html = html.replace(
  `<span style="color: var(--text-light-body);">Service Midi (Déjeuner) :</span>`,
  `<span style="color: var(--text-light-body);" data-i18n="contactLunchLabel">Service Midi (Déjeuner) :</span>`
);
html = html.replace(
  `<span style="color: var(--text-light-body);">Service Soir (Dîner) :</span>`,
  `<span style="color: var(--text-light-body);" data-i18n="contactDinnerLabel">Service Soir (Dîner) :</span>`
);
html = html.replace(
  `<span style="color: var(--text-light-body);">Jours d'Ouverture :</span>\n                <strong style="color: var(--text-light-title);">Lundi au Samedi</strong>`,
  `<span style="color: var(--text-light-body);" data-i18n="contactDaysLabel">Jours d'Ouverture :</span>\n                <strong style="color: var(--text-light-title);" data-i18n="contactDaysVal">Lundi au Samedi</strong>`
);
html = html.replace(
  `<span style="color: var(--text-light-body);">Dimanche :</span>\n                <strong style="color: var(--red-punch);">Fermé (Repos du Guerrier)</strong>`,
  `<span style="color: var(--text-light-body);" data-i18n="contactSundayLabel">Dimanche :</span>\n                <strong style="color: var(--red-punch);" data-i18n="contactSundayVal">Fermé (Repos du Guerrier)</strong>`
);
html = html.replace(
  `<span style="color: var(--text-light-body);">Service Livraison :</span>\n                <strong style="color: var(--brand-blue-dark);">+20% du montant de commande</strong>`,
  `<span style="color: var(--text-light-body);" data-i18n="contactDeliveryLabel">Service Livraison :</span>\n                <strong style="color: var(--brand-blue-dark);" data-i18n="contactDeliveryVal">+20% du montant de commande</strong>`
);
html = html.replace(
  `<span>📍 Ouvrir dans Google Maps</span>`,
  `<span data-i18n="btnGoogleMaps">📍 Ouvrir dans Google Maps</span>`
);
html = html.replace(
  `<span>🚗 Ouvrir dans Waze</span>`,
  `<span data-i18n="btnWaze">🚗 Ouvrir dans Waze</span>`
);
html = html.replace(
  `<span>💬 Écrire sur WhatsApp (+595 995 620416)</span>`,
  `<span data-i18n="btnContactWa">💬 Écrire sur WhatsApp (+595 995 620416)</span>`
);

// FAQ
html = html.replace(
  `<h3 style="font-family: var(--font-greek); font-size: 18px; font-weight: 700; color: var(--text-light-title); margin-bottom: 20px; letter-spacing: 0.04em;">\n              Questions Fréquentes\n            </h3>`,
  `<h3 style="font-family: var(--font-greek); font-size: 18px; font-weight: 700; color: var(--text-light-title); margin-bottom: 20px; letter-spacing: 0.04em;" data-i18n="faqTitle">\n              Questions Fréquentes\n            </h3>`
);
html = html.replace(
  `<h4 style="font-size: 14.5px; font-weight: 700; color: var(--brand-blue-dark); margin-bottom: 3px;">Faut-il réserver à l'avance pour manger ou s'entraîner ?</h4>\n                <p style="font-size: 13.5px; color: var(--text-light-body); line-height: 1.6;">Non. La règle officielle du complexe est <strong>Sans Réservation</strong>. Viens directement sur place (Bristol d'Areguá, près du Cacique) pour ton premier cours d'essai ou pour manger ton plat du jour.</p>`,
  `<h4 style="font-size: 14.5px; font-weight: 700; color: var(--brand-blue-dark); margin-bottom: 3px;" data-i18n="faqQ1">Faut-il réserver à l'avance pour manger ou s'entraîner ?</h4>\n                <p style="font-size: 13.5px; color: var(--text-light-body); line-height: 1.6;" data-i18n="faqA1">Non. La règle officielle du complexe est <strong>Sans Réservation</strong>. Viens directement sur place (Bristol d'Areguá, près du Cacique) pour ton premier cours d'essai ou pour manger ton plat du jour.</p>`
);
html = html.replace(
  `<h4 style="font-size: 14.5px; font-weight: 700; color: var(--brand-blue-dark); margin-bottom: 3px;">Puis-je commander des repas sans m'inscrire au club ?</h4>\n                <p style="font-size: 13.5px; color: var(--text-light-body); line-height: 1.6;">Tout à fait ! Tu peux souscrire à un pack de nutrition seul (1 ou 2 plats/jour) ou commander des plats à l'unité dès 7.000 ₲ à 25.000 ₲. Tous les 5 plats achetés, le 6ème est 100% OFFERT !</p>`,
  `<h4 style="font-size: 14.5px; font-weight: 700; color: var(--brand-blue-dark); margin-bottom: 3px;" data-i18n="faqQ2">Puis-je commander des repas sans m'inscrire au club ?</h4>\n                <p style="font-size: 13.5px; color: var(--text-light-body); line-height: 1.6;" data-i18n="faqA2">Tout à fait ! Tu peux souscrire à un pack de nutrition seul (1 ou 2 plats/jour) ou commander des plats à l'unité dès 7.000 ₲ à 25.000 ₲. Tous les 5 plats achetés, le 6ème est 100% OFFERT !</p>`
);
html = html.replace(
  `<h4 style="font-size: 14.5px; font-weight: 700; color: var(--brand-blue-dark); margin-bottom: 3px;">Combien coûte l'adhésion au club de Kickboxing & Boxe ?</h4>\n                <p style="font-size: 13.5px; color: var(--text-light-body); line-height: 1.6;">L'adhésion mensuelle est de <strong>150.000 ₲ / mois</strong> (150k PYG) en accès libre à tous les cours. Le premier jour d'essai est 100% gratuit.</p>`,
  `<h4 style="font-size: 14.5px; font-weight: 700; color: var(--brand-blue-dark); margin-bottom: 3px;" data-i18n="faqQ3">Combien coûte l'adhésion au club de Kickboxing & Boxe ?</h4>\n                <p style="font-size: 13.5px; color: var(--text-light-body); line-height: 1.6;" data-i18n="faqA3">L'adhésion mensuelle est de <strong>150.000 ₲ / mois</strong> (150k PYG) en accès libre à tous les cours. Le premier jour d'essai est 100% gratuit.</p>`
);
html = html.replace(
  `<h4 style="font-size: 14.5px; font-weight: 700; color: var(--brand-blue-dark); margin-bottom: 3px;">Comment fonctionne le débit automatique Bancard ?</h4>\n                <p style="font-size: 13.5px; color: var(--text-light-body); line-height: 1.6;">Il est sécurisé par Bancard Paraguay avec cryptage PCI-DSS. Tu profites d'une remise immédiate de 5% sur ton abonnement et tu peux annuler ou suspendre à tout moment sans frais.</p>`,
  `<h4 style="font-size: 14.5px; font-weight: 700; color: var(--brand-blue-dark); margin-bottom: 3px;" data-i18n="faqQ4">Comment fonctionne le débit automatique Bancard ?</h4>\n                <p style="font-size: 13.5px; color: var(--text-light-body); line-height: 1.6;" data-i18n="faqA4">Il est sécurisé par Bancard Paraguay avec cryptage PCI-DSS. Tu profites d'une remise immédiate de 5% sur ton abonnement et tu peux annuler ou suspendre à tout moment sans frais.</p>`
);

// 12. Checkout single dish picker labels
html = html.replace(
  `<label for="dishSelect">Sélectionne ton Plat ou Street-Food :</label>`,
  `<label for="dishSelect" data-i18n="lblSelectDish">Sélectionne ton Plat ou Street-Food :</label>`
);
html = html.replace(
  `<label for="plateQuantity">Nombre de Plats (5 achetés = le 6ème OFFERT !) :</label>`,
  `<label for="plateQuantity" data-i18n="lblPlateQuantity">Nombre de Plats (5 achetés = le 6ème OFFERT !) :</label>`
);

// Gateways in checkout
html = html.replace(
  `<label>Numéro de Carte (Visa, Mastercard, Panal, Cabal)</label>`,
  `<label data-i18n="lblCardNum">Numéro de Carte (Visa, Mastercard, Panal, Cabal)</label>`
);
html = html.replace(
  `<label>Date d'expiration (MM/AA)</label>`,
  `<label data-i18n="lblCardExp">Date d'expiration (MM/AA)</label>`
);
html = html.replace(
  `<label>Code CVV</label>`,
  `<label data-i18n="lblCardCvv">Code CVV</label>`
);
html = html.replace(
  `<div style="font-size: 11.5px; color: var(--text-dim);">\n                  ✓ Tokenisation sécurisée PCI-DSS certifiée par Bancard Paraguay. Prêt pour débit automatique.\n                </div>`,
  `<div style="font-size: 11.5px; color: var(--text-dim);" data-i18n="txtBancardSecurity">\n                  ✓ Tokenisation sécurisée PCI-DSS certifiée par Bancard Paraguay. Prêt pour débit automatique.\n                </div>`
);
html = html.replace(
  `<div style="font-size: 13px; color: var(--brand-blue-light); font-weight: 700; margin-bottom: 8px;">\n                  🏦 Coordonnées Bancaires SIPAP (Virement Interbancaire en Guaraníes) :\n                </div>`,
  `<div style="font-size: 13px; color: var(--brand-blue-light); font-weight: 700; margin-bottom: 8px;" data-i18n="txtSipapTitle">\n                  🏦 Coordonnées Bancaires SIPAP (Virement Interbancaire en Guaraníes) :\n                </div>`
);
html = html.replace(
  `<button type="button" class="btn-copy-sipap" onclick="window.copySipapData()">\n                  📋 Copier les Données SIPAP pour Virer\n                </button>`,
  `<button type="button" class="btn-copy-sipap" onclick="window.copySipapData()" data-i18n="btnCopySipap">\n                  📋 Copier les Données SIPAP pour Virer\n                </button>`
);
html = html.replace(
  `<label>Numéro de Téléphone Portefeuille (Paraguay)</label>`,
  `<label data-i18n="lblTigoPhone">Numéro de Téléphone Portefeuille (Paraguay)</label>`
);
html = html.replace(
  `<div style="font-size: 11.5px; color: var(--text-dim);">\n                  Une notification push sera envoyée sur votre téléphone pour saisir votre code PIN et approuver le paiement.\n                </div>`,
  `<div style="font-size: 11.5px; color: var(--text-dim);" data-i18n="txtTigoNote">\n                  Une notification push sera envoyée sur votre téléphone pour saisir votre code PIN et approuver le paiement.\n                </div>`
);
html = html.replace(
  `<div style="font-size: 13px; color: var(--brand-blue-light); font-weight: 700; margin-bottom: 8px;">\n                    📲 Scannez depuis l'application de votre banque au Paraguay (QR Simple)\n                  </div>`,
  `<div style="font-size: 13px; color: var(--brand-blue-light); font-weight: 700; margin-bottom: 8px;" data-i18n="txtQrTitle">\n                    📲 Scannez depuis l'application de votre banque au Paraguay (QR Simple)\n                  </div>`
);
html = html.replace(
  `<div style="font-size: 11.5px; color: var(--text-dim); margin-top: 8px;">\n                    Compatible avec Itaú, Continental, Ueno, Familiar, Sudameris, Atlas et GNB.\n                  </div>`,
  `<div style="font-size: 11.5px; color: var(--text-dim); margin-top: 8px;" data-i18n="txtQrCompatible">\n                    Compatible avec Itaú, Continental, Ueno, Familiar, Sudameris, Atlas et GNB.\n                  </div>`
);

// 13. Legal modal
html = html.replace(
  `<div class="legal-article">\n          <h4>1. Identification et Établissement (Areguá, Paraguay)</h4>\n          <p>\n            Le complexe <strong>« Olimpo Team Kickboxing & Restaurante del Olimpo »</strong> est situé à Bristol d'Areguá, près du Cacique (Avenida Mariscal Estigarribia), ville d'Areguá, Département Central, République du Paraguay. Téléphone officiel de contact et WhatsApp : +595 995 620416.\n          </p>\n        </div>`,
  `<div class="legal-article">\n          <h4 data-i18n="legalArt1Title">1. Identification et Établissement (Areguá, Paraguay)</h4>\n          <p data-i18n="legalArt1Text">\n            Le complexe <strong>« Olimpo Team Kickboxing & Restaurante del Olimpo »</strong> est situé à Bristol d'Areguá, près du Cacique (Avenida Mariscal Estigarribia), ville d'Areguá, Département Central, République du Paraguay. Téléphone officiel de contact et WhatsApp : +595 995 620416.\n          </p>\n        </div>`
);
html = html.replace(
  `<div class="legal-article">\n          <h4>2. Réglementation Sanitaire & Alimentaire (INAN / MSPyBS)</h4>\n          <p>\n            Toutes les préparations culinaires servies par le Restaurante del Olimpo respectent les normes d'hygiène et de manipulation des aliments édictées par l'<strong>Instituto Nacional de Alimentación y Nutrición (INAN)</strong> et le Ministère de la Santé Publique et du Bien-être Social du Paraguay. Les macronutriments sont pesés et préparés le jour même. La chaîne du froid est strictement observée pour l'ensemble des viandes fraîches (poulet, bœuf) et produits laitiers (kéfir artisanal).\n          </p>\n        </div>`,
  `<div class="legal-article">\n          <h4 data-i18n="legalArt2Title">2. Réglementation Sanitaire & Alimentaire (INAN / MSPyBS)</h4>\n          <p data-i18n="legalArt2Text">\n            Toutes les préparations culinaires servies par le Restaurante del Olimpo respectent les normes d'hygiène et de manipulation des aliments édictées par l'<strong>Instituto Nacional de Alimentación y Nutrición (INAN)</strong> et le Ministère de la Santé Publique et du Bien-être Social du Paraguay. Les macronutriments sont pesés et préparés le jour même. La chaîne du froid est strictement observée pour l'ensemble des viandes fraîches (poulet, bœuf) et produits laitiers (kéfir artisanal).\n          </p>\n        </div>`
);
html = html.replace(
  `<div class="legal-article">\n          <h4>3. Aptitude Physique & Pratique des Sports de Combat (Ley N° 2874/06 del Deporte)</h4>\n          <p>\n            Conformément aux lois paraguayennes régissant les activités physiques et sportives, tout adhérent aux cours de <strong>Kickboxing K-1 Rules</strong> et de <strong>Boxe Traditionnelle Anglaise</strong> atteste être en bonne condition cardiovasculaire et apte à la pratique sportive d'intensité modérée à haute. Le port des protections individuelles (bandes, protège-dents, gants réglementaires) est obligatoire lors des séances de sparring contrôlé.\n          </p>\n        </div>`,
  `<div class="legal-article">\n          <h4 data-i18n="legalArt3Title">3. Aptitude Physique & Pratique des Sports de Combat (Ley N° 2874/06 del Deporte)</h4>\n          <p data-i18n="legalArt3Text">\n            Conformément aux lois paraguayennes régissant les activités physiques et sportives, tout adhérent aux cours de <strong>Kickboxing K-1 Rules</strong> et de <strong>Boxe Traditionnelle Anglaise</strong> atteste être en bonne condition cardiovasculaire et apte à la pratique sportive d'intensité modérée à haute. Le port des protections individuelles (bandes, protège-dents, gants réglementaires) est obligatoire lors des séances de sparring contrôlé.\n          </p>\n        </div>`
);
html = html.replace(
  `<div class="legal-article">\n          <h4>4. Débit Automatique Bancard & Modalités d'Annulation</h4>\n          <p>\n            Les abonnements souscrits avec l'option « Débit Automatique » bénéficient d'une réduction contractuelle de 5%. Les règlements sont opérés de manière récurrente via la plateforme sécurisée <strong>Bancard vPOS Paraguay</strong> (certifiée PCI-DSS). L'utilisateur peut suspendre ou annuler son prélèvement automatique à tout moment par simple message WhatsApp au +595 995 620416 au moins 48 heures avant la date de renouvellement, sans aucune pénalité de sortie.\n          </p>\n        </div>`,
  `<div class="legal-article">\n          <h4 data-i18n="legalArt4Title">4. Débit Automatique Bancard & Modalités d'Annulation</h4>\n          <p data-i18n="legalArt4Text">\n            Les abonnements souscrits avec l'option « Débit Automatique » bénéficient d'une réduction contractuelle de 5%. Les règlements sont opérés de manière récurrente via la plateforme sécurisée <strong>Bancard vPOS Paraguay</strong> (certifiée PCI-DSS). L'utilisateur peut suspendre ou annuler son prélèvement automatique à tout moment par simple message WhatsApp au +595 995 620416 au moins 48 heures avant la date de renouvellement, sans aucune pénalité de sortie.\n          </p>\n        </div>`
);
html = html.replace(
  `<div class="legal-article">\n          <h4>5. Facturation Légale (Ley N° 6380/19 de Modernización Tributaria)</h4>\n          <p>\n            Toutes les opérations font l'objet d'une Factura Legal officielle (Tributación Paraguay - DNIT) avec TVA incluse (10% et 5%). Les adhérents et clients fournissent leur numéro de RUC ou Cédula de Identidad (C.I.) lors de la validation pour l'émission fiscale.\n          </p>\n        </div>`,
  `<div class="legal-article">\n          <h4 data-i18n="legalArt5Title">5. Facturation Légale (Ley N° 6380/19 de Modernización Tributaria)</h4>\n          <p data-i18n="legalArt5Text">\n            Toutes les opérations font l'objet d'une Factura Legal officielle (Tributación Paraguay - DNIT) avec TVA incluse (10% et 5%). Les adhérents et clients fournissent leur numéro de RUC ou Cédula de Identidad (C.I.) lors de la validation pour l'émission fiscale.\n          </p>\n        </div>`
);
html = html.replace(
  `<div class="legal-article">\n          <h4>6. Service de Livraison à Domicile</h4>\n          <p>\n            Le service de livraison couvre le périmètre d'Areguá et environs immédiats avec un supplément de 20% du montant de l'abonnement ou commande. Les retraits directs au club (Bristol d'Areguá) sont 100% gratuits aux horaires de service (11h00-13h00 et 18h00-20h30).\n          </p>\n        </div>`,
  `<div class="legal-article">\n          <h4 data-i18n="legalArt6Title">6. Service de Livraison à Domicile</h4>\n          <p data-i18n="legalArt6Text">\n            Le service de livraison couvre le périmètre d'Areguá et environs immédiats avec un supplément de 20% du montant de l'abonnement ou commande. Les retraits directs au club (Bristol d'Areguá) sont 100% gratuits aux horaires de service (11h00-13h00 et 18h00-20h30).\n          </p>\n        </div>`
);
html = html.replace(
  `<button class="btn-hero-primary" onclick="window.closeLegalModal()" style="display: inline-block;">J'ai compris et j'accepte</button>`,
  `<button class="btn-hero-primary" onclick="window.closeLegalModal()" style="display: inline-block;" data-i18n="btnLegalClose">J'ai compris et j'accepte</button>`
);

// 14. Mobile Sticky Bar
html = html.replace(
  `  <div class="mobile-sticky-bar">\n    <a href="#inicio" class="mobile-sticky-btn active">\n      <span>🏠</span>\n      <span>Accueil</span>\n    </a>\n    <a href="#club" class="mobile-sticky-btn">\n      <span>🥊</span>\n      <span>Club (150k)</span>\n    </a>\n    <a href="#restaurante" class="mobile-sticky-btn">\n      <span>🥗</span>\n      <span>Menu</span>\n    </a>\n    <a href="#afiliados" class="mobile-sticky-btn highlight">\n      <span>💰</span>\n      <span>Gains</span>\n    </a>\n    <button class="btn-mobile-order-pill" onclick="window.openCheckout('pack_fighter_pro')">\n      Commander\n    </button>\n  </div>`,
  `  <div class="mobile-sticky-bar">\n    <a href="#inicio" class="mobile-sticky-btn active">\n      <span>🏠</span>\n      <span data-i18n="mobileStickyHome">Accueil</span>\n    </a>\n    <a href="#club" class="mobile-sticky-btn">\n      <span>🥊</span>\n      <span data-i18n="mobileStickyClub">Club (150k)</span>\n    </a>\n    <a href="#restaurante" class="mobile-sticky-btn">\n      <span>🥗</span>\n      <span data-i18n="mobileStickyMenu">Menu</span>\n    </a>\n    <a href="#afiliados" class="mobile-sticky-btn highlight">\n      <span>💰</span>\n      <span data-i18n="mobileStickyGains">Gains</span>\n    </a>\n    <button class="btn-mobile-order-pill" onclick="window.openCheckout('pack_fighter_pro')" data-i18n="mobileStickyOrder">\n      Commander\n    </button>\n  </div>`
);

// 15. Footer
html = html.replace(
  `<p style="color: var(--text-dim); font-size: 13.5px; line-height: 1.6; margin-bottom: 15px;">\n          Le premier complexe d'Areguá combinant ring de Kickboxing K-1, Boxe Traditionnelle Anglaise et cuisine saine calibrée aux macronutriments pour athlètes.\n        </p>`,
  `<p style="color: var(--text-dim); font-size: 13.5px; line-height: 1.6; margin-bottom: 15px;" data-i18n="footerDesc">\n          Le premier complexe d'Areguá combinant ring de Kickboxing K-1, Boxe Traditionnelle Anglaise et cuisine saine calibrée aux macronutriments pour athlètes.\n        </p>`
);
html = html.replace(
  `<p style="font-size: 13px; color: var(--brand-blue-light); font-weight: 600; margin-bottom: 4px;">\n          📍 Sede: Bristol d'Areguá, près du Cacique (Areguá, Paraguay)\n        </p>`,
  `<p style="font-size: 13px; color: var(--brand-blue-light); font-weight: 600; margin-bottom: 4px;" data-i18n="footerLoc">\n          📍 Sede: Bristol d'Areguá, près du Cacique (Areguá, Paraguay)\n        </p>`
);
html = html.replace(
  `<p style="font-size: 13px; color: #cbd5e1; font-weight: 600;">\n          WhatsApp : +595 995 620416 (¡Sans Réservation!)\n        </p>`,
  `<p style="font-size: 13px; color: #cbd5e1; font-weight: 600;" data-i18n="footerWa">\n          WhatsApp : +595 995 620416 (¡Sans Réservation!)\n        </p>`
);

html = html.replace(
  `        <h4 class="footer-col-title">Fighting Club</h4>\n        <ul class="footer-links">\n          <li><a href="#club">Kickboxing K-1 Rules</a></li>\n          <li><a href="#club">Boxe Traditionnelle Anglaise</a></li>\n          <li><a href="#club">Sacs Lourds & Pattes d'Ours</a></li>\n          <li><a href="#club">Planning des Entraînements</a></li>\n          <li><a href="#tarifas">Adhésion Club (150.000 ₲)</a></li>\n        </ul>`,
  `        <h4 class="footer-col-title" data-i18n="footerCol1Title">Fighting Club</h4>\n        <ul class="footer-links">\n          <li><a href="#club" data-i18n="footerLnkClub1">Kickboxing K-1 Rules</a></li>\n          <li><a href="#club" data-i18n="footerLnkClub2">Boxe Traditionnelle Anglaise</a></li>\n          <li><a href="#club" data-i18n="footerLnkClub3">Sacs Lourds & Pattes d'Ours</a></li>\n          <li><a href="#club" data-i18n="footerLnkClub4">Planning des Entraînements</a></li>\n          <li><a href="#tarifas" data-i18n="footerLnkClub5">Adhésion Club (150.000 ₲)</a></li>\n        </ul>`
);

html = html.replace(
  `        <h4 class="footer-col-title">Restaurant Fit</h4>\n        <ul class="footer-links">\n          <li><a href="#restaurante">La Règle d'Or (1/3, 1/3, 1/3)</a></li>\n          <li><a href="#restaurante">Carte de la Semaine</a></li>\n          <li><a href="#restaurante">Street-Food Protéinée</a></li>\n          <li><a href="#restaurante">Boissons Récupération</a></li>\n          <li><a href="#flyers">Télécharger les Flyers</a></li>\n        </ul>`,
  `        <h4 class="footer-col-title" data-i18n="footerCol2Title">Restaurant Fit</h4>\n        <ul class="footer-links">\n          <li><a href="#restaurante" data-i18n="footerLnkResto1">La Règle d'Or (1/3, 1/3, 1/3)</a></li>\n          <li><a href="#restaurante" data-i18n="footerLnkResto2">Carte de la Semaine</a></li>\n          <li><a href="#restaurante" data-i18n="footerLnkResto3">Street-Food Protéinée</a></li>\n          <li><a href="#restaurante" data-i18n="footerLnkResto4">Boissons Récupération</a></li>\n          <li><a href="#flyers" data-i18n="footerLnkResto5">Télécharger les Flyers</a></li>\n        </ul>`
);

html = html.replace(
  `        <h4 class="footer-col-title">Affiliation & Légal</h4>\n        <ul class="footer-links">\n          <li><a href="#afiliados">Programme Ambassadeur (15%)</a></li>\n          <li><a href="#afiliados">Calculateur de Gains</a></li>\n          <li><a href="#afiliados">Générer son Lien Tracké</a></li>\n          <li><a href="#" onclick="window.openLegalModal(); return false;">Conditions Légales (Paraguay)</a></li>\n          <li><a href="#contacto">Service Client & WhatsApp</a></li>\n        </ul>`,
  `        <h4 class="footer-col-title" data-i18n="footerCol3Title">Affiliation & Légal</h4>\n        <ul class="footer-links">\n          <li><a href="#afiliados" data-i18n="footerLnkAff1">Programme Ambassadeur (15%)</a></li>\n          <li><a href="#afiliados" data-i18n="footerLnkAff2">Calculateur de Gains</a></li>\n          <li><a href="#afiliados" data-i18n="footerLnkAff3">Générer son Lien Tracké</a></li>\n          <li><a href="#" onclick="window.openLegalModal(); return false;" data-i18n="footerLnkAff4">Conditions Légales (Paraguay)</a></li>\n          <li><a href="#contacto" data-i18n="footerLnkAff5">Service Client & WhatsApp</a></li>\n        </ul>`
);

html = html.replace(
  `<div>© 2026 Olimpo Team Kickboxing & Restaurant de l'Olympe. Bristol d'Areguá, près du Cacique, Paraguay.</div>\n      <div>Architecture marketing CRO & alternance visuelle sobre.</div>`,
  `<div data-i18n="footerCopyright">© 2026 Olimpo Team Kickboxing & Restaurant de l'Olympe. Bristol d'Areguá, près du Cacique, Paraguay.</div>\n      <div data-i18n="footerCroTag">Architecture marketing CRO & alternance visuelle sobre.</div>`
);

fs.writeFileSync(path.resolve(__dirname, '../index.html'), html, 'utf8');
console.log('Successfully updated index.html with all data-i18n tags!');
