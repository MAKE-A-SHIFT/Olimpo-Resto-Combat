const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Gateway tabs
html = html.replace(
  '<span class="gw-name">Bancard vPOS</span>',
  '<span class="gw-name" data-i18n="gwBancard">Bancard vPOS</span>'
);
html = html.replace(
  '<span class="gw-name">SIPAP Virement</span>',
  '<span class="gw-name" data-i18n="gwSipap">SIPAP Virement</span>'
);
html = html.replace(
  '<span class="gw-name">Tigo Money</span>',
  '<span class="gw-name" data-i18n="gwTigo">Tigo Money</span>'
);
html = html.replace(
  '<span class="gw-name">QR Bancard</span>',
  '<span class="gw-name" data-i18n="gwQr">QR Bancard</span>'
);

// 2. Gateway headers
html = html.replace(
  `<div style="font-size: 13px; color: var(--brand-blue-light); font-weight: 700; margin-bottom: 8px;">\n                  🔒 Passerelle Officielle Bancard vPOS (Cartes de Crédit & Débit Paraguay)\n                </div>`,
  `<div style="font-size: 13px; color: var(--brand-blue-light); font-weight: 700; margin-bottom: 8px;" data-i18n="txtBancardTitle">\n                  🔒 Passerelle Officielle Bancard vPOS (Cartes de Crédit & Débit Paraguay)\n                </div>`
);

html = html.replace(
  `<div style="font-size: 13px; color: #fff; font-weight: 700; margin-bottom: 8px;">\n                  📱 Débit Instantané sur Portefeuille Mobile (Tigo Money / Personal) :\n                </div>`,
  `<div style="font-size: 13px; color: #fff; font-weight: 700; margin-bottom: 8px;" data-i18n="txtTigoTitle">\n                  📱 Débit Instantané sur Portefeuille Mobile (Tigo Money / Personal) :\n                </div>`
);

// 3. SIPAP labels
html = html.replace(
  `                  <strong>Banque :</strong> Banco Continental / Basa<br>\n                  <strong>Titulaire :</strong> Olimpo Team Kickboxing & Sports Resto<br>\n                  <strong>RUC :</strong> 80099562-4<br>\n                  <strong>Caisse d'Épargne Gs :</strong> 01-234567-89<br>\n                  <strong>Lieu :</strong> Bristol d'Areguá, près du Cacique`,
  `                  <strong data-i18n="sipapBankLabel">Banque :</strong> Banco Continental / Basa<br>\n                  <strong data-i18n="sipapHolderLabel">Titulaire :</strong> Olimpo Team Kickboxing & Sports Resto<br>\n                  <strong data-i18n="sipapRucLabel">RUC :</strong> 80099562-4<br>\n                  <strong data-i18n="sipapAccountLabel">Caisse d'Épargne Gs :</strong> 01-234567-89<br>\n                  <strong data-i18n="sipapCityLabel">Lieu :</strong> Bristol d'Areguá, près du Cacique`
);

// 4. Placeholders for custName and custAddress
html = html.replace(
  `<input type="text" id="custName" class="form-input" placeholder="Ex: Jean Dupont" required>`,
  `<input type="text" id="custName" class="form-input" placeholder="Ex: Jean Dupont" data-i18n-placeholder="custNamePlaceholder" required>`
);

html = html.replace(
  `<input type="text" id="custAddress" class="form-input" placeholder="Ex: Retrait Bristol Areguá ou adresse complète">`,
  `<input type="text" id="custAddress" class="form-input" placeholder="Ex: Retrait Bristol Areguá ou adresse complète" data-i18n-placeholder="custAddressPlaceholder">`
);

// 5. Legal modal title
html = html.replace(
  `<h3 class="modal-title">Conditions Légales & Réglementaires (Paraguay)</h3>`,
  `<h3 class="modal-title" data-i18n="legalModalTitle">Conditions Légales & Réglementaires (Paraguay)</h3>`
);

// 6. Lightbox modal buttons
html = html.replace(
  `<a href="stories/assets/Menu_Oficial_Restaurante_del_Olimpo.pdf" target="_blank" rel="noopener noreferrer" class="btn-lightbox-download" style="background: var(--brand-blue); flex: 1;">📄 Abrir PDF Completo</a>`,
  `<a href="stories/assets/Menu_Oficial_Restaurante_del_Olimpo.pdf" target="_blank" rel="noopener noreferrer" class="btn-lightbox-download" style="background: var(--brand-blue); flex: 1;" data-i18n="btnLightboxPdf">📄 Abrir PDF Completo</a>`
);
html = html.replace(
  `<a href="" id="lightboxDownloadBtn" class="btn-lightbox-download" style="background: #1e293b; border: 1px solid #334155; flex: 1;" download>⬇ PNG</a>`,
  `<a href="" id="lightboxDownloadBtn" class="btn-lightbox-download" style="background: #1e293b; border: 1px solid #334155; flex: 1;" download data-i18n="btnLightboxPng">⬇ PNG</a>`
);
html = html.replace(
  `<button class="btn-lightbox-close" id="btnCloseLightbox" style="width: 100%;">Cerrar</button>`,
  `<button class="btn-lightbox-close" id="btnCloseLightbox" style="width: 100%;" data-i18n="btnLightboxClose">Cerrar</button>`
);

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html updated successfully with additional i18n tags!');
