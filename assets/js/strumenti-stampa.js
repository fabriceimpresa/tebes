/*
 * Pulsanti "Dove montare la stampa?" e "Anteprima di Stampa" per le pagine cartelli e cartellini.
 * Uso: <script src="assets/js/strumenti-stampa.js" data-panel="…" data-sheet="…"></script> in fondo al body.
 *   data-panel: elemento dopo il quale inserire i pulsanti (predefinito ".sidebar > .controls")
 *   data-sheet: foglio da mostrare nell'anteprima (predefinito ".print-sheet")
 * Stili in assets/css/strumenti-stampa.css.
 */
(function initStrumentiStampa() {
  const script = document.currentScript;
  const panelSelector = script?.dataset.panel || '.sidebar > .controls';
  const sheetSelector = script?.dataset.sheet || '.print-sheet';

  // Foto guida per capire dove montare la stampa, per pagina: { src, caption }.
  // Finché l'elenco di una pagina è vuoto il popup mostra dei riquadri segnaposto.
  // Le foto stanno in assets/foto/.
  // Cartelli in morsa sulla rastrelliera: stessa foto, con sopra il cartello della pagina.
  const GUIDE_PHOTOS = {
    'cartelli_semplici.html': [{ src: 'assets/foto/morsasemplice.jpg' }],
    'cartelli_sale.html': [{ src: 'assets/foto/morsasale.jpg' }],
    'cartelli_brand.html': [{ src: 'assets/foto/morsabrand.jpg' }],
    'cartellopercentuale.html': [{ src: 'assets/foto/morsapercentuale.jpg' }],
    'cartelli_multiarticolo.html': [{ src: 'assets/foto/morsamultiarticolo.jpg' }],
    'albero.html': [{ src: 'assets/foto/albero.jpg' }],
    'cornici10x15.html': [{ src: 'assets/foto/cornice10x15.jpg' }],
    'paletto.html': [{ src: 'assets/foto/paletto.jpg' }],
    'paletto18x12.html': [{ src: 'assets/foto/paletto.jpg' }]
  };

  const panel = document.querySelector(panelSelector);
  if (!panel) return;

  const HELP_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="19" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="normal" font-size="20" fill="currentColor">?</text></svg>';
  const PREVIEW_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v3"/><path d="M13 3v5h5"/><circle cx="16.5" cy="16.5" r="3.2"/><path d="M18.8 18.8 21 21"/></svg>';

  function createButton(label, icon, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tool-btn';
    button.title = label;
    button.setAttribute('aria-label', label);
    button.innerHTML = icon;
    button.addEventListener('click', onClick);
    return button;
  }

  const buttons = document.createElement('div');
  buttons.className = 'tool-buttons';
  buttons.append(
    createButton('Dove montare la stampa?', HELP_ICON, openGuide),
    createButton('Anteprima di Stampa', PREVIEW_ICON, openPrintPreview)
  );
  panel.after(buttons);

  // Stessa distanza minima dall'ultimo riquadro in tutte le pagine (10 px, come in Cartelli Semplici):
  // le colonne hanno spaziature diverse (gap, margini, margine sotto il tasto di stampa), quindi
  // si misura lo spazio reale e si corregge il margine superiore dei pulsanti.
  const TARGET_GAP = 10;
  function alignButtons() {
    buttons.style.marginTop = '0px';
    const gap = buttons.getBoundingClientRect().top - panel.getBoundingClientRect().bottom;
    buttons.style.marginTop = `${TARGET_GAP - gap}px`;
  }
  alignButtons();
  window.addEventListener('load', alignButtons);

  // --- POPUP ---
  const modal = document.createElement('div');
  modal.className = 'app-modal';
  modal.hidden = true;
  modal.innerHTML = `
    <div class="app-modal-backdrop"></div>
    <div class="app-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="appModalTitle">
      <div class="app-modal-header">
        <h3 id="appModalTitle"></h3>
        <button type="button" class="app-modal-close" aria-label="Chiudi">✕</button>
      </div>
      <div class="app-modal-body"></div>
    </div>`;
  document.body.appendChild(modal);
  const modalTitle = modal.querySelector('h3');
  const modalBody = modal.querySelector('.app-modal-body');
  modal.querySelector('.app-modal-backdrop').addEventListener('click', closeModal);
  modal.querySelector('.app-modal-close').addEventListener('click', closeModal);

  function openModal(title, content) {
    modalTitle.textContent = title;
    modalBody.replaceChildren(content);
    modal.hidden = false;
    document.addEventListener('keydown', closeModalOnEscape);
  }

  function closeModal() {
    modal.hidden = true;
    modalBody.replaceChildren();
    document.removeEventListener('keydown', closeModalOnEscape);
  }

  function closeModalOnEscape(event) {
    if (event.key === 'Escape') closeModal();
  }

  // Copia il foglio così com'è e la rimpicciolisce perché stia intera nel popup.
  // Gli id restano: alcune pagine ruotano o impaginano le metà tramite id (es. #cardBottom);
  // la copia sta in fondo al body, quindi getElementById continua a trovare l'originale.
  function openPrintPreview() {
    const sheet = document.querySelector(sheetSelector);
    if (!sheet) return;
    const style = getComputedStyle(sheet);
    // Larghezza e altezza calcolate dal CSS: non risentono dello zoom della vista telefono.
    const sheetWidth = parseFloat(style.width);
    const sheetHeight = parseFloat(style.height);
    const maxWidth = Math.min(window.innerWidth - 100, 960);
    const maxHeight = window.innerHeight - 160;
    const scale = Math.min(maxWidth / sheetWidth, maxHeight / sheetHeight, 1);

    const copy = sheet.cloneNode(true);
    copy.removeAttribute('aria-label');
    copy.style.zoom = '1';
    copy.style.width = `${sheetWidth}px`;
    copy.style.height = `${sheetHeight}px`;
    copy.style.boxShadow = 'none';
    copy.style.transform = `scale(${scale})`;

    const frame = document.createElement('div');
    frame.className = 'preview-frame';
    frame.style.width = `${sheetWidth * scale}px`;
    frame.style.height = `${sheetHeight * scale}px`;
    frame.appendChild(copy);

    openModal('Anteprima di Stampa', frame);
  }

  function openGuide() {
    const page = location.pathname.split('/').pop() || 'index.html';
    const wrapper = document.createElement('div');
    const text = document.createElement('p');
    text.className = 'guide-text';
    text.textContent = `Dove montare la stampa di ${document.title} in negozio.`;
    const grid = document.createElement('div');
    grid.className = 'guide-grid';

    const photos = GUIDE_PHOTOS[page]?.length ? GUIDE_PHOTOS[page] : [
      { caption: 'Foto guida 1' },
      { caption: 'Foto guida 2' }
    ];

    photos.forEach(photo => {
      const item = document.createElement('figure');
      item.className = 'guide-item';
      const placeholder = document.createElement('div');
      placeholder.className = 'guide-placeholder';
      placeholder.textContent = 'Foto in arrivo';
      if (photo.src) {
        const image = document.createElement('img');
        image.src = photo.src;
        image.alt = photo.caption || '';
        image.onerror = () => image.replaceWith(placeholder);
        item.appendChild(image);
      } else {
        item.appendChild(placeholder);
      }
      if (photo.caption) {
        const caption = document.createElement('figcaption');
        caption.textContent = photo.caption;
        item.appendChild(caption);
      }
      grid.appendChild(item);
    });

    wrapper.append(text, grid);
    openModal('Dove montare la stampa?', wrapper);
  }

  window.StrumentiStampa = { openPrintPreview, openGuide, closeModal };
})();
