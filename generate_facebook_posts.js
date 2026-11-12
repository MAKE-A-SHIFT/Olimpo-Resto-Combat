const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const baseDir = path.resolve(__dirname);
const assetsDir = path.join(baseDir, 'stories', 'assets');
const outputDir = path.join(baseDir, 'stories', 'facebook_posts');
const brainDir = 'C:\\Users\\firet\\.gemini\\antigravity\\brain\\2b13232b-dfee-4314-8871-f08523636881';

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

function toFileUri(relOrAbsPath) {
  let abs = path.isAbsolute(relOrAbsPath) ? relOrAbsPath : path.join(assetsDir, relOrAbsPath);
  return 'file:///' + abs.replace(/\\/g, '/');
}

const logoUri = toFileUri('logo_olimpo.png');
const bgCarbonUri = toFileUri('bg_carbon.jpg');

const posts = [
  {
    filename: 'post_1_club_kickboxing.png',
    pill: '🥊 ACADEMIA OFICIAL DE COMBATE',
    pillColor: '#0084ff',
    title: 'CLUB KICKBOXING & BOXEO',
    subtitle: 'Kickboxing K-1 Rules & Boxeo Tradicional Inglés',
    heroImage: toFileUri('hero_cinema_shot2.jpg'),
    price: '150.000 ₲',
    priceUnit: '/ mes (Acceso Ilimitado)',
    badge: '1ER DÍA DE PRUEBA 100% GRATIS',
    features: [
      '⚡ Acceso libre a todos los entrenamientos de la semana',
      '🥊 Ring de combate reglamentario y bolsas pesadas de 60 kg',
      '🏆 Sparring técnico y acondicionamiento físico de alto rendimiento',
      '🔥 Apto para todos los niveles: desde principiantes hasta competidores'
    ],
    ctaText: '📲 Escribinos al WhatsApp para agendar tu clase gratis :',
    ctaContact: '0984 430018 (Prof. Rodrigo)',
    address: '📍 Av. Las Residentas, Areguá • Sin Matrícula Previa'
  },
  {
    filename: 'post_2_fighter_pro.png',
    pill: '🥗 PACK ATLETA • ALTO RENDIMIENTO',
    pillColor: '#d4af37',
    title: 'PACK FIGHTER PRO (2 PLATOS / DÍA)',
    subtitle: 'La Dieta de Campeón Calibrada al Gramo : Almuerzo + Cena',
    heroImage: toFileUri('hero_cinema_shot1.jpg'),
    price: '950.000 ₲',
    priceUnit: '/ mes (o 260.000 ₲ / sem)',
    badge: 'REGLA DE ORO : 1/3 PROTEÍNA • 1/3 CARBOS • 1/3 FIBRA',
    features: [
      '🥩 2 comidas completas diarias frescas (Almuerzo + Cena)',
      '🛡️ Cero compras en el súper, cero cocina después de entrenar',
      '💪 Freno total al catabolismo nocturno y máxima recuperación',
      '📦 Menos de 20.000 ₲ por plato limpio en envase hermético'
    ],
    ctaText: '📲 Pedí o reservá tu Pack Fighter Pro por WhatsApp :',
    ctaContact: '0995 620416 (Cocina Olimpo)',
    address: '📍 Retiro en el Club (Av. Las Residentas) o Delivery (+20%)'
  },
  {
    filename: 'post_3_pack_1_plato.png',
    pill: '🍲 NUTRICIÓN DIARIA SALUDABLE',
    pillColor: '#00b4d8',
    title: 'PACK 1 PLATO / DÍA',
    subtitle: 'Almuerzo o Cena Calibrado Preparado Fresco Cada Mañana',
    heroImage: toFileUri('new_menu/lunes_explosivo.jpg'),
    price: '500.000 ₲',
    priceUnit: '/ mes (o 140.000 ₲ / sem)',
    badge: '200G PROTEÍNA PURA + GUARNICIÓN LIMPIA + FRUTA',
    features: [
      '🍗 1 comida completa diaria de Lunes a Sábado',
      '🥗 Menú rotativo variado: pechuga al grill, bife, stroganoff...',
      '🍎 Incluye fruta entera fresca de estación cada día',
      '⏱️ Listo a las 11:30 hs para tu almuerzo en Areguá'
    ],
    ctaText: '📲 Asegurá tus comidas de la semana al WhatsApp :',
    ctaContact: '0995 620416 (Restaurante Olimpo)',
    address: '📍 Retiro directo en Av. Las Residentas, Areguá o Delivery'
  },
  {
    filename: 'post_4_combo_fighter_elite.png',
    pill: '👑 LA SOLUCIÓN TOTAL • MÁXIMO AHORRO',
    pillColor: '#ffd700',
    title: 'COMBO FIGHTER ELITE',
    subtitle: 'Club de Kickboxing & Boxeo Ilimitado + 2 Platos/Día',
    heroImage: toFileUri('gym_restaurant_del_olimpo.jpg'),
    price: '1.100.000 ₲',
    priceUnit: '/ mes (Todo Incluido)',
    badge: 'AHORRÁS 600.000 ₲ AL AÑO VS PLANES SEPARADOS',
    features: [
      '🥊 Membresía completa sin límite al Club de Combate Olimpo',
      '🥗 2 comidas completas por día (Almuerzo + Cena fresca)',
      '📈 La combinación definitiva: 50% entrenamiento + 50% nutrición',
      '⭐ Prioridad en preparación física y atención en cocina'
    ],
    ctaText: '📲 Transformá tu cuerpo hoy con el Combo Elite :',
    ctaContact: '0995 620416 / 0984 430018',
    address: '📍 Olimpo Team Complejo Deportivo • Av. Las Residentas, Areguá'
  },
  {
    filename: 'post_5_street_food_proteico.png',
    pill: '🍔 STREET-FOOD LIMPIO & BEBIDAS',
    pillColor: '#ff9100',
    title: 'STREET-FOOD ATHLÉTICO & PLATOS SUELTOS',
    subtitle: 'Comida Rápida Saludable para Ganancia Muscular Sin Culpa',
    heroImage: toFileUri('new_menu/fast_burger_club.jpg'),
    price: 'Desde 7.000 ₲',
    priceUnit: 'hasta 25.000 ₲ por plato',
    badge: '🔥 ¡PROMO 5=6! 5 PLATOS COMPRADOS = EL 6TO GRATIS',
    features: [
      '🍔 Hamburguesa Olimpo: Carne 100% vacuna magra y pan artesanal',
      '🥪 Sándwich de pollo desmechado & tostados energéticos',
      '🥛 Kéfir probiótico casero & Bebida isotónica Thor',
      '🚀 ¡Sin reserva previa! Pasá directo a retirar por el club'
    ],
    ctaText: '📲 Hacé tu pedido para retirar al paso o delivery :',
    ctaContact: '0995 620416 (WhatsApp Resto)',
    address: '📍 Av. Las Residentas, Areguá • Abierto de Lun a Sáb'
  },
  {
    filename: 'post_6_dia_prueba_gratis.png',
    pill: '⚡ OFERTA EXCLUSIVA DE BIENVENIDA',
    pillColor: '#00e676',
    title: '1ER DÍA DE PRUEBA 100% GRATIS',
    subtitle: 'Kickboxing K-1 Rules & Boxeo Inglés en Areguá',
    heroImage: toFileUri('gym_club_de_boxeo.jpg'),
    price: '0 ₲ (GRATIS)',
    priceUnit: 'Sin matrícula ni compromiso',
    badge: '🥊 GUANTES Y EQUIPAMIENTO DISPONIBLES EN SALA',
    features: [
      '🔥 Clase completa con nuestros entrenadores profesionales',
      '💥 Aprendé las bases de guardia, golpes y desplazamientos',
      '💪 Trabajo intenso en bolsas pesadas y acondicionamiento',
      '👥 Ambiente familiar, disciplina y respeto de verdaderos atletas'
    ],
    ctaText: '📲 Mandá un mensaje para asegurar tu cupo gratuito :',
    ctaContact: '0984 430018 (Prof. Rodrigo)',
    address: '📍 Av. Las Residentas, Areguá • ¡Vení a entrenar hoy!'
  }
];

function generateHtml(p) {
  const featuresHtml = p.features.map(f => `
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px; font-size: 21px; color: #e2e8f0; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">
      <span>${f}</span>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@700;800;900&family=Montserrat:ital,wght@0,500;0,700;0,900;1,700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1080px;
      height: 1080px;
      overflow: hidden;
      background: #090d10 url('${bgCarbonUri}') repeat center;
      font-family: 'Montserrat', sans-serif;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      color: #fff;
    }

    /* Outer Gold/Meander Frame */
    .frame-border {
      position: absolute;
      top: 18px;
      left: 18px;
      right: 18px;
      bottom: 18px;
      border: 3px solid rgba(212, 175, 55, 0.45);
      border-radius: 20px;
      pointer-events: none;
      z-index: 10;
      box-shadow: inset 0 0 35px rgba(0,0,0,0.8), 0 0 30px rgba(0, 132, 255, 0.25);
    }

    .corner-dec {
      position: absolute;
      width: 32px;
      height: 32px;
      border: 4px solid #d4af37;
      z-index: 11;
    }
    .c-tl { top: 24px; left: 24px; border-right: none; border-bottom: none; }
    .c-tr { top: 24px; right: 24px; border-left: none; border-bottom: none; }
    .c-bl { bottom: 24px; left: 24px; border-right: none; border-top: none; }
    .c-br { bottom: 24px; right: 24px; border-left: none; border-top: none; }

    /* Top Bar */
    .header-bar {
      position: relative;
      z-index: 5;
      padding: 38px 45px 15px 45px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(180deg, rgba(9,13,16,0.95) 0%, rgba(9,13,16,0) 100%);
    }

    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .brand-logo {
      height: 60px;
      filter: drop-shadow(0 4px 10px rgba(0, 132, 255, 0.5));
    }

    .brand-names {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-family: 'Cabinet Grotesk', 'Montserrat', sans-serif;
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #fff;
    }
    .brand-sub {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 3px;
      color: #0084ff;
      text-transform: uppercase;
    }

    .header-badge {
      display: inline-flex;
      align-items: center;
      padding: 8px 18px;
      border-radius: 30px;
      background: rgba(0, 132, 255, 0.15);
      border: 1.5px solid ${p.pillColor};
      color: #fff;
      font-weight: 800;
      font-size: 14px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      box-shadow: 0 0 15px rgba(0, 132, 255, 0.3);
    }

    /* Main Visual & Content */
    .hero-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      overflow: hidden;
    }

    .hero-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: brightness(0.48) contrast(1.15) saturate(1.1);
    }

    .hero-gradient-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(180deg, rgba(9,13,16,0.85) 0%, rgba(9,13,16,0.2) 40%, rgba(9,13,16,0.85) 75%, #090d10 100%);
    }

    /* Content Body */
    .body-content {
      position: relative;
      z-index: 5;
      padding: 0 50px;
      margin-top: 15px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .offer-ribbon {
      align-self: flex-start;
      background: linear-gradient(90deg, #d4af37, #f3e5ab, #aa820a);
      color: #090d10;
      font-weight: 900;
      font-size: 15px;
      padding: 6px 18px;
      border-radius: 6px;
      letter-spacing: 1.5px;
      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
      text-transform: uppercase;
    }

    .post-headline {
      font-family: 'Cabinet Grotesk', 'Montserrat', sans-serif;
      font-size: 46px;
      font-weight: 900;
      line-height: 1.05;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #fff;
      text-shadow: 0 4px 15px rgba(0,0,0,0.9);
    }

    .post-subheadline {
      font-size: 21px;
      font-weight: 600;
      color: #94a3b8;
      line-height: 1.3;
      margin-bottom: 8px;
    }

    /* Price Hero Card */
    .price-box {
      background: rgba(13, 19, 26, 0.88);
      border: 2px solid rgba(0, 132, 255, 0.45);
      border-radius: 16px;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      backdrop-filter: blur(12px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.6), inset 0 0 20px rgba(0, 132, 255, 0.1);
      margin-bottom: 12px;
    }

    .price-main {
      font-family: 'Cabinet Grotesk', 'Montserrat', sans-serif;
      font-size: 52px;
      font-weight: 900;
      color: #0084ff;
      letter-spacing: -1px;
      line-height: 1;
      text-shadow: 0 0 20px rgba(0, 132, 255, 0.4);
    }

    .price-unit {
      font-size: 19px;
      font-weight: 700;
      color: #cbd5e1;
      margin-left: 10px;
    }

    .price-badge-extra {
      background: rgba(212, 175, 55, 0.2);
      border: 1px solid #d4af37;
      color: #fce79a;
      font-size: 15px;
      font-weight: 800;
      padding: 6px 14px;
      border-radius: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* Features List */
    .features-wrap {
      background: rgba(9, 13, 16, 0.7);
      border-radius: 14px;
      padding: 16px 20px;
      border-left: 4px solid #0084ff;
      backdrop-filter: blur(8px);
    }

    /* Footer CTA Bar */
    .footer-bar {
      position: relative;
      z-index: 5;
      padding: 20px 45px 38px 45px;
      background: linear-gradient(0deg, #090d10 0%, rgba(9,13,16,0.95) 70%, rgba(9,13,16,0) 100%);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .cta-button-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, #0084ff 0%, #0056b3 100%);
      border-radius: 14px;
      padding: 14px 24px;
      box-shadow: 0 8px 25px rgba(0, 132, 255, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .cta-text {
      font-size: 18px;
      font-weight: 800;
      color: #fff;
      letter-spacing: 0.5px;
    }

    .cta-wa {
      font-family: 'Cabinet Grotesk', 'Montserrat', sans-serif;
      font-size: 24px;
      font-weight: 900;
      color: #fff;
      background: #25d366;
      color: #090d10;
      padding: 6px 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      letter-spacing: 1px;
    }

    .footer-address {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 15px;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 0 4px;
    }
  </style>
</head>
<body>
  <div class="frame-border"></div>
  <div class="corner-dec c-tl"></div>
  <div class="corner-dec c-tr"></div>
  <div class="corner-dec c-bl"></div>
  <div class="corner-dec c-br"></div>

  <div class="hero-container">
    <img src="${p.heroImage}" class="hero-img" alt="${p.title}">
    <div class="hero-gradient-overlay"></div>
  </div>

  <header class="header-bar">
    <div class="brand-wrap">
      <img src="${logoUri}" class="brand-logo" alt="Olimpo Logo">
      <div class="brand-names">
        <span class="brand-title">OLIMPO AREGUÁ</span>
        <span class="brand-sub">Combat & Nutrición Athlética</span>
      </div>
    </div>
    <div class="header-badge">${p.pill}</div>
  </header>

  <main class="body-content">
    <div class="offer-ribbon">${p.badge}</div>
    <h1 class="post-headline">${p.title}</h1>
    <p class="post-subheadline">${p.subtitle}</p>

    <div class="price-box">
      <div>
        <span class="price-main">${p.price}</span>
        <span class="price-unit">${p.priceUnit}</span>
      </div>
      <div class="price-badge-extra">Av. Las Residentas</div>
    </div>

    <div class="features-wrap">
      ${featuresHtml}
    </div>
  </main>

  <footer class="footer-bar">
    <div class="cta-button-row">
      <span class="cta-text">${p.ctaText}</span>
      <span class="cta-wa">💬 ${p.ctaContact}</span>
    </div>
    <div class="footer-address">
      <span>${p.address}</span>
      <span style="color: #d4af37;">⚡ Cocina & Ring Abiertos</span>
    </div>
  </footer>
</body>
</html>`;
}

console.log('Rendering 6 Facebook Post Graphics with Edge Headless (1080x1080)...');

for (let i = 0; i < posts.length; i++) {
  const p = posts[i];
  const htmlContent = generateHtml(p);
  const htmlPath = path.join(outputDir, `temp_post_${i + 1}.html`);
  const pngPath = path.join(outputDir, p.filename);
  const brainPngPath = path.join(brainDir, p.filename);

  fs.writeFileSync(htmlPath, htmlContent, 'utf8');

  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--window-size=1080,1080',
    `--screenshot=${pngPath}`,
    fileUrl
  ];

  try {
    const res = spawnSync(edgePath, args, { stdio: 'pipe' });
    if (res.error) throw res.error;
    console.log(`✓ Rendered: ${p.filename}`);
    if (fs.existsSync(pngPath)) {
      fs.copyFileSync(pngPath, brainPngPath);
    }
  } catch (err) {
    console.error(`Error rendering ${p.filename}:`, err.message);
  } finally {
    if (fs.existsSync(htmlPath)) fs.unlinkSync(htmlPath);
  }
}

console.log('All 6 Facebook Post Graphics successfully created!');
