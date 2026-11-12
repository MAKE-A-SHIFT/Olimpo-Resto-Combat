const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const baseDir = path.resolve(__dirname);
const assetsDir = path.join(baseDir, 'stories', 'assets');
const outputDir = path.join(baseDir, 'stories', 'facebook_posts_prestige');
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
    filename: 'prestige_1_club_kickboxing.png',
    romanNumeral: 'I',
    categoryPill: 'ACADEMIA OFICIAL DE COMBATE',
    title: 'KICKBOXING & BOXEO',
    tagline: 'DISCIPLINA, TÉCNICA Y POTENCIA EN EL CUADRILÁTERO',
    heroImage: toFileUri('hero_cinema_shot2.jpg'),
    priceMain: '150.000 ₲',
    priceCycle: '/ MES',
    priceNote: 'ACCESO LIBRE E ILIMITADO A TODAS LAS SESIONES',
    points: [
      'Entrenamientos intensivos de Kickboxing K-1 Rules y Boxeo Tradicional Inglés',
      'Ring de combate oficial, bolsas pesadas de 60 kg y circuito funcional',
      'Guanteo técnico y acondicionamiento impartido por entrenadores profesionales',
      'Primer día de prueba 100% gratuito sin matrícula ni contrato previo'
    ],
    contactPhone: '+595 984 430018 (Prof. Rodrigo)',
    contactLabel: 'RESERVAS & DÍA DE PRUEBA',
    location: 'AV. LAS RESIDENTAS • AREGUÁ'
  },
  {
    filename: 'prestige_2_fighter_pro.png',
    romanNumeral: 'II',
    categoryPill: 'PROGRAMA NUTRICIONAL DE ALTO RENDIMIENTO',
    title: 'PACK FIGHTER PRO',
    tagline: 'DOS COMIDAS ATHLÉTICAS POR DÍA : ALMUERZO Y CENA',
    heroImage: toFileUri('hero_cinema_shot1.jpg'),
    priceMain: '950.000 ₲',
    priceCycle: '/ MES',
    priceNote: 'OPCIÓN SEMANAL : 260.000 ₲ • MENOS DE 20.000 ₲ POR PLATO',
    points: [
      'Regla de Oro Olympe: 1/3 Proteínas Puras, 1/3 Glucidos Limpios, 1/3 Fibras',
      'Cocinado fresco cada mañana en las instalaciones del club de combate',
      'Freno absoluto al catabolismo muscular nocturno con recuperación óptima',
      'Envases herméticos listos para llevar o servicio de delivery (+20%)'
    ],
    contactPhone: '+595 995 620416 (Cocina Olimpo)',
    contactLabel: 'SUSCRIPCIONES & PEDIDOS',
    location: 'COCINA DEPORTIVA • AV. LAS RESIDENTAS, AREGUÁ'
  },
  {
    filename: 'prestige_3_pack_1_plato.png',
    romanNumeral: 'III',
    categoryPill: 'NUTRICIÓN DIARIA CALIBRADA',
    title: 'PACK 1 PLATO / DÍA',
    tagline: 'UN ALMUERZO O CENA CALIBRADO CADA DÍA DE LUNES A SÁBADO',
    heroImage: toFileUri('new_menu/lunes_explosivo.jpg'),
    priceMain: '500.000 ₲',
    priceCycle: '/ MES',
    priceNote: 'OPCIÓN SEMANAL : 140.000 ₲ • LISTO A LAS 11:30 HS',
    points: [
      '200 gramos de carne magra o pollo grillé con guarnición energética limpia',
      'Menú rotativo variado y equilibrado con fruta fresca entera de estación',
      'La solución definitiva para profesionales y atletas en Areguá',
      'Retiro sin espera en el restaurante o entrega coordinada en domicilio'
    ],
    contactPhone: '+595 995 620416 (Restaurante Olimpo)',
    contactLabel: 'CONTACTO RESTAURANTE',
    location: 'AV. LAS RESIDENTAS • AREGUÁ'
  },
  {
    filename: 'prestige_4_combo_fighter_elite.png',
    romanNumeral: 'IV',
    categoryPill: 'LA SOLUCIÓN HÍBRIDA DEFINITIVA',
    title: 'COMBO FIGHTER ELITE',
    tagline: 'CLUB DE COMBATE ILIMITADO + DOS COMIDAS COMPLETAS DIARIAS',
    heroImage: toFileUri('gym_restaurant_del_olimpo.jpg'),
    priceMain: '1.100.000 ₲',
    priceCycle: '/ MES',
    priceNote: 'AHORRO ANUAL DE 600.000 ₲ COMPARADO CON PLANES SEPARADOS',
    points: [
      'Pase libre a todos los entrenamientos de Kickboxing K-1 y Boxeo Inglés',
      'Almuerzo y cena completos preparados cada día según tus macronutrientes',
      'La alianza perfecta entre esfuerzo atlético extremo y nutrición estricta',
      'Acceso prioritario a seminarios técnicos y preparación para combate'
    ],
    contactPhone: '+595 995 620416 / +595 984 430018',
    contactLabel: 'INSCRIPCIONES ELITE',
    location: 'COMPLEJO DEPORTIVO OLIMPO • AREGUÁ'
  },
  {
    filename: 'prestige_5_street_food_proteico.png',
    romanNumeral: 'V',
    categoryPill: 'GASTRONOMÍA ATHLÉTICA AL PASO',
    title: 'STREET-FOOD ATHLÉTICO',
    tagline: 'HAMBURGUESAS MAGRAS, TOSTADOS ENERGÉTICOS Y PROBIÓTICOS',
    heroImage: toFileUri('new_menu/fast_burger_club.jpg'),
    priceMain: 'DESDE 7.000 ₲',
    priceCycle: 'HASTA 25.000 ₲',
    priceNote: 'PROMOCIÓN EXCLUSIVA : POR CADA 5 PLATOS, EL 6TO ES GRATIS',
    points: [
      'Hamburguesas caseras 100% bife vacuno magro con vegetales frescos',
      'Sándwiches proteicos de pollo desmechado y empanadas ligeras al horno',
      'Kéfir artesanal probiótico y bebidas isotónicas de hidratación profunda',
      'Servicio continuo sin reserva previa de Lunes a Sábado'
    ],
    contactPhone: '+595 995 620416 (WhatsApp Resto)',
    contactLabel: 'PEDIDOS DIRECTOS',
    location: 'RETIRO AL PASO • AV. LAS RESIDENTAS, AREGUÁ'
  },
  {
    filename: 'prestige_6_dia_prueba_gratis.png',
    romanNumeral: 'VI',
    categoryPill: 'SESIÓN DE INICIACIÓN Y RENDIMIENTO',
    title: 'PRIMER DÍA DE PRUEBA',
    tagline: 'ENTRENA SIN COSTO CON EL EQUIPO OFICIAL DE COMBATE',
    heroImage: toFileUri('gym_club_de_boxeo.jpg'),
    priceMain: '100% GRATIS',
    priceCycle: '0 ₲',
    priceNote: 'SIN MATRÍCULA • SIN CONTRATO • PARA TODOS LOS NIVELES',
    points: [
      'Sesión completa guiada por el cuerpo técnico de Kickboxing y Boxeo',
      'Aprende fundamentos reales de postura, desplazamientos y pegada',
      'Trabajo en bolsas pesadas de impacto y acondicionamiento cardiovascular',
      'Guantes reglamentarios y vendajes disponibles en la sala para tu clase'
    ],
    contactPhone: '+595 984 430018 (Prof. Rodrigo)',
    contactLabel: 'AGENDAR CLASE DE PRUEBA',
    location: 'AV. LAS RESIDENTAS, AREGUÁ • LUNES A SÁBADO'
  }
];

function generatePrestigeHtml(p) {
  const pointsHtml = p.points.map(pt => `
    <li class="point-item">
      <span class="point-bullet">◆</span>
      <span class="point-text">${pt}</span>
    </li>
  `).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Cinzel+Decorative:wght@700;900&family=Montserrat:ital,wght@0,500;0,600;0,700;0,800;1,500&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1080px;
      height: 1080px;
      overflow: hidden;
      background: #06090c;
      font-family: 'Montserrat', sans-serif;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      color: #f1f5f9;
      padding: 40px;
    }

    /* Dramatic Cinematic Background Image */
    .bg-hero {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      overflow: hidden;
    }
    .bg-hero img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: brightness(0.28) contrast(1.25) saturate(1.1);
      transform: scale(1.02);
    }
    .bg-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at 50% 30%, rgba(0, 43, 91, 0.45) 0%, rgba(6, 9, 12, 0.92) 75%, #06090c 100%);
    }

    /* Architectural Greek Meander Border */
    .architectural-frame {
      position: absolute;
      top: 24px;
      left: 24px;
      right: 24px;
      bottom: 24px;
      border: 1.5px solid rgba(212, 175, 55, 0.4);
      pointer-events: none;
      z-index: 10;
      box-shadow: inset 0 0 40px rgba(0,0,0,0.9), 0 0 25px rgba(0, 132, 255, 0.15);
    }
    .frame-inner-line {
      position: absolute;
      top: 32px;
      left: 32px;
      right: 32px;
      bottom: 32px;
      border: 1px solid rgba(203, 213, 225, 0.2);
      pointer-events: none;
      z-index: 10;
    }

    /* Classical Greek Meander Frieze SVG Header/Footer */
    .frieze-bar {
      height: 12px;
      width: 100%;
      opacity: 0.75;
      background: repeating-linear-gradient(
        90deg,
        #d4af37 0px,
        #d4af37 8px,
        transparent 8px,
        transparent 14px,
        #cbd5e1 14px,
        #cbd5e1 22px,
        transparent 22px,
        transparent 28px
      );
    }

    /* Header Section */
    .header-zone {
      position: relative;
      z-index: 5;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding-top: 10px;
    }

    .top-creed {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 18px;
      margin-bottom: 12px;
    }
    .creed-line {
      width: 80px;
      height: 1px;
      background: linear-gradient(90deg, transparent, #d4af37, #cbd5e1);
    }
    .creed-line.right {
      background: linear-gradient(90deg, #cbd5e1, #d4af37, transparent);
    }
    .creed-text {
      font-family: 'Cinzel', serif;
      font-size: 13px;
      letter-spacing: 4px;
      color: #cbd5e1;
      text-transform: uppercase;
      font-weight: 700;
    }

    .brand-crest {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 14px;
    }
    .brand-crest img {
      height: 64px;
      filter: drop-shadow(0 4px 12px rgba(0, 132, 255, 0.45));
    }
    .crest-titles {
      text-align: left;
    }
    .crest-main {
      font-family: 'Cinzel Decorative', 'Cinzel', serif;
      font-size: 28px;
      font-weight: 900;
      letter-spacing: 3px;
      color: #ffffff;
      line-height: 1;
      text-shadow: 0 2px 10px rgba(0,0,0,0.9);
    }
    .crest-sub {
      font-family: 'Montserrat', sans-serif;
      font-size: 11px;
      letter-spacing: 3.5px;
      color: #0084ff;
      text-transform: uppercase;
      font-weight: 700;
      margin-top: 4px;
    }

    /* Prestige Badge */
    .numeral-badge {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 6px 20px;
      border-top: 1px solid rgba(212, 175, 55, 0.5);
      border-bottom: 1px solid rgba(212, 175, 55, 0.5);
      background: rgba(9, 13, 16, 0.7);
      backdrop-filter: blur(8px);
    }
    .badge-num {
      font-family: 'Cinzel', serif;
      color: #d4af37;
      font-size: 16px;
      font-weight: 900;
    }
    .badge-cat {
      font-family: 'Cinzel', serif;
      font-size: 13px;
      letter-spacing: 3px;
      color: #f1f5f9;
      font-weight: 700;
      text-transform: uppercase;
    }

    /* Core Hero Body */
    .body-zone {
      position: relative;
      z-index: 5;
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 0 20px;
    }

    .main-monumental-title {
      font-family: 'Cinzel Decorative', 'Cinzel', serif;
      font-size: 52px;
      font-weight: 900;
      letter-spacing: 2px;
      line-height: 1.05;
      text-transform: uppercase;
      color: #ffffff;
      text-shadow: 0 4px 20px rgba(0,0,0,0.95);
      background: linear-gradient(180deg, #ffffff 40%, #cbd5e1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .tagline-text {
      font-family: 'Montserrat', sans-serif;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 2px;
      color: #94a3b8;
      text-transform: uppercase;
      line-height: 1.4;
      border-left: 2px solid #0084ff;
      padding-left: 14px;
    }

    /* Chiseled Monolith Price Box */
    .monolith-price {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, rgba(13, 19, 26, 0.95) 0%, rgba(9, 13, 16, 0.98) 100%);
      border: 1px solid rgba(212, 175, 55, 0.4);
      border-left: 4px solid #d4af37;
      padding: 18px 28px;
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(0, 43, 91, 0.25);
    }
    .price-num-wrap {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    .price-num {
      font-family: 'Cinzel', serif;
      font-size: 44px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: 1px;
      text-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
    }
    .price-cycle {
      font-family: 'Cinzel', serif;
      font-size: 18px;
      font-weight: 700;
      color: #d4af37;
      letter-spacing: 2px;
    }
    .price-note {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: #cbd5e1;
      text-transform: uppercase;
      max-width: 380px;
      text-align: right;
      line-height: 1.4;
    }

    /* Editorial Points List (No Emojis) */
    .points-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: rgba(6, 9, 12, 0.6);
      padding: 18px 24px;
      border: 1px solid rgba(203, 213, 225, 0.12);
      backdrop-filter: blur(10px);
    }
    .point-item {
      display: flex;
      align-items: flex-start;
      gap: 14px;
    }
    .point-bullet {
      color: #0084ff;
      font-size: 12px;
      margin-top: 5px;
    }
    .point-text {
      font-size: 16.5px;
      font-weight: 600;
      line-height: 1.35;
      color: #e2e8f0;
      letter-spacing: 0.3px;
    }

    /* Footer Zone */
    .footer-zone {
      position: relative;
      z-index: 5;
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding-bottom: 8px;
    }

    .cta-plate {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(90deg, #002b5b 0%, #004aad 50%, #002b5b 100%);
      border: 1px solid rgba(212, 175, 55, 0.5);
      padding: 16px 28px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.7);
    }
    .cta-label-col {
      display: flex;
      flex-direction: column;
    }
    .cta-title {
      font-family: 'Cinzel', serif;
      font-size: 14px;
      letter-spacing: 3px;
      color: #d4af37;
      font-weight: 800;
      text-transform: uppercase;
    }
    .cta-sub {
      font-size: 12px;
      letter-spacing: 1px;
      color: #e2e8f0;
      text-transform: uppercase;
      font-weight: 600;
      margin-top: 2px;
    }
    .cta-phone {
      font-family: 'Cinzel', serif;
      font-size: 23px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: 1.5px;
      text-shadow: 0 2px 8px rgba(0,0,0,0.8);
      border-left: 1px solid rgba(212, 175, 55, 0.4);
      padding-left: 20px;
    }

    .footer-baseline {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'Cinzel', serif;
      font-size: 12px;
      letter-spacing: 2.5px;
      color: #94a3b8;
      text-transform: uppercase;
      padding: 0 6px;
    }
  </style>
</head>
<body>
  <div class="architectural-frame"></div>
  <div class="frame-inner-line"></div>

  <div class="bg-hero">
    <img src="${p.heroImage}" alt="${p.title}">
    <div class="bg-overlay"></div>
  </div>

  <header class="header-zone">
    <div class="top-creed">
      <div class="creed-line"></div>
      <span class="creed-text">Club Oficial de Combate & Nutrición Athlética</span>
      <div class="creed-line right"></div>
    </div>

    <div class="brand-crest">
      <img src="${logoUri}" alt="Olimpo Crest">
      <div class="crest-titles">
        <div class="crest-main">OLIMPO AREGUÁ</div>
        <div class="crest-sub">FIGHT ACADEMY & ATHLETIC RESTORATION</div>
      </div>
    </div>

    <div class="numeral-badge">
      <span class="badge-num">${p.romanNumeral}</span>
      <span class="badge-cat">${p.categoryPill}</span>
    </div>
  </header>

  <main class="body-zone">
    <h1 class="main-monumental-title">${p.title}</h1>
    <div class="tagline-text">${p.tagline}</div>

    <div class="monolith-price">
      <div class="price-num-wrap">
        <span class="price-num">${p.priceMain}</span>
        <span class="price-cycle">${p.priceCycle}</span>
      </div>
      <div class="price-note">${p.priceNote}</div>
    </div>

    <ul class="points-list">
      ${pointsHtml}
    </ul>
  </main>

  <footer class="footer-zone">
    <div class="frieze-bar"></div>
    <div class="cta-plate">
      <div class="cta-label-col">
        <span class="cta-title">${p.contactLabel}</span>
        <span class="cta-sub">Atención Directa por WhatsApp</span>
      </div>
      <div class="cta-phone">${p.contactPhone}</div>
    </div>
    <div class="footer-baseline">
      <span>${p.location}</span>
      <span style="color: #d4af37;">ESTÁNDAR OLÍMPICO DE RENDIMIENTO</span>
    </div>
  </footer>
</body>
</html>`;
}

console.log('Rendering 6 Prestige High-Standard Facebook Creatives (1080x1080)...');

for (let i = 0; i < posts.length; i++) {
  const p = posts[i];
  const htmlContent = generatePrestigeHtml(p);
  const htmlPath = path.join(outputDir, `temp_prestige_${i + 1}.html`);
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
    console.log(`✓ Prestige Rendered: ${p.filename}`);
    if (fs.existsSync(pngPath)) {
      fs.copyFileSync(pngPath, brainPngPath);
    }
  } catch (err) {
    console.error(`Error rendering ${p.filename}:`, err.message);
  } finally {
    if (fs.existsSync(htmlPath)) fs.unlinkSync(htmlPath);
  }
}

console.log('All 6 Prestige Creatives successfully created!');
