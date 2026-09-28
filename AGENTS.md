# AGENTS.md

Indicazioni per agenti AI (e persone) che lavorano su questo repository. Per sapere cosa fa il prodotto e a cosa serve ogni pagina, leggi prima `README.md`. Questo file spiega **come è organizzato il codice, le decisioni prese e le regole da rispettare**.

## Cos'è

Un insieme di strumenti statici per il visual merchandising, pensati per la stampa, per due negozi di Via del Corso a Roma: **TEBE** (n. 269, moda donna, linea propria "LINEA 269") e **OPHILYA** (n. 268, pelletteria). Il marchio dell'applicazione è **STORE // CRAFT**. Il personale apre una pagina, compila il modulo nel pannello laterale, controlla l'anteprima A4/etichetta e stampa.

## Decisioni architetturali (da mantenere salvo richiesta esplicita)

1. **Niente build, dipendenze o framework.** Solo HTML + CSS + JS vanilla, aperti direttamente nel browser o serviti in modo statico. Non aggiungere npm, bundler, TypeScript, framework o backend. Il codice di terze parti si carica solo da cdnjs (`qrcodejs@1.0.0`, `html2canvas@1.4.1`). I font arrivano da Google Fonts o da `assets/fonts/`.
2. **Una pagina autonoma per strumento.** Ogni `.html` nella root ha `<style>` e `<script>` inline. In `assets/js/` va solo la logica davvero condivisa tra pagine (loghi, colori di stampa, tema Made in Italy, DYMO). Le nuove pagine seguono la stessa forma; non spezzare il codice di una pagina in file separati.
3. **La stampa è il prodotto.** I fogli usano unità reali (`mm`, `pt`, `in`) corrispondenti al supporto fisico:
   - `@page { size: A4 portrait; margin: 0 }` con un `.print-sheet` di `210mm × 297mm`.
   - `@media print` nasconde pannello e navigazione e forza `print-color-adjust: exact`.
   - Le etichette usano `@page { size: 2.25in 1.25in }`.

   Le misure sono state tarate su una specifica grafica: pannelli da 118,35 mm, margine superiore di 14,56 mm, bordi da 0,34 mm, testi da 76,23 pt / 105,8 pt. Non arrotondarle e non convertirle in `px`/`rem`.
4. **Cartelli bifacciali.** In Semplice, Sale, Percentuale, Brand e Multi Articolo il foglio contiene `#cardTop` e `#cardBottom` con lo stesso contenuto. `#cardBottom` è ruotato con `rotate(180deg)` e non ha bordo inferiore, così i due pannelli condividono un lato che fa da linea di piega. Ogni modifica al cartello va resa in **entrambe** le metà. Fa eccezione Paletto: due cartelli *indipendenti*, ciascuno con il proprio stato, separati da una `.cut-line` tratteggiata.
5. **Il colore dei loghi è nei file, non nei filtri CSS.** Safari (e a volte Chrome) ignorano il `filter` CSS in stampa, e ricolorare via canvas un'immagine letta da disco fallisce con `file://` perché il canvas risulta "tainted". Quindi:
   - Ogni logo ufficiale in `assets/logos/` deve avere quattro varianti pregenerate in `assets/img/printlogos/`, con nome `{white,black,red,gold}<NOME>.png`. L'estensione è sempre `.png` minuscolo, anche se l'originale è `.PNG`.
   - Le pagine ottengono l'URL del logo da `PrintLogoColors.getBrandLogoSrc()` / `resolve()` (`assets/js/print-logo-colors.js`). I colori con nome puntano a quei file; i loghi personalizzati (data URL) e i colori esadecimali arbitrari vengono ricolorati via canvas e tenuti in cache in memoria.
   - Prima di `window.print()` si chiama `PrintLogoColors.prepareForPrint(selector)`, così immagini e font sono già caricati.
   - Nei cartelli i loghi sono **oro** (`#cc9e25` = rgb 204,158,37).
6. **Nessuna persistenza lato server.** L'unico stato che sopravvive a un ricaricamento è nel `localStorage`, legato a browser e computer (vedi *Dati*). Gli editor ripartono di proposito dai valori predefiniti a ogni apertura.
7. **La stampa DYMO è diretta, con ripiego sul browser.** `etichette.html`:
   - disegna l'etichetta in un iframe fuori schermo alla dimensione reale;
   - la rasterizza con `html2canvas` a 300 dpi (risoluzione della LabelWriter 450);
   - invia il PNG a DYMO Connect (`assets/js/dymo-direct.js`, `https://127.0.0.1:41951`, con ripiego su `localhost`).

   L'XML dell'etichetta usa il formato carta `30334 2-1/4 in x 1-1/4 in`, perché il web service non riconosce "11354" (le dimensioni sono identiche). Se DYMO non è raggiungibile *prima* dell'invio, si passa automaticamente alla stampa del browser. Se l'invio *fallisce*, la pagina si limita a **chiedere**, perché la stampa potrebbe essere già arrivata alla stampante e un nuovo tentativo automatico stamperebbe due volte. Il file `dymo.connect.framework.js` presente nel repo non viene caricato: la stampa passa solo da `dymo-direct.js`.
8. **Loghi ufficiali e personalizzati sono separati di proposito.**
   - I loghi *ufficiali* sono versionati nel repo ed elencati in `assets/js/logos.js`.
   - I loghi *personalizzati* sono per browser e li aggiunge il personale da `genera_loghi.html`.
   - Nei menu brand vengono prima i loghi ufficiali, con i `PRIORITY_BRANDS` (i brand della casa TEBE `269TEBE.PNG`, `Tebe269.png`, `Tebe.png`) in cima e con la stella. I personalizzati sono in un menu separato "Loghi personalizzati", con il prefisso `★`.
   - Selezionarne uno di un tipo azzera l'altro.
   - Il brand predefinito è il primo file che inizia con `269`.
9. **OPHILYA è un segnaposto.** Il selettore in dashboard esiste, ma in modalità OPHILYA cartelli, galleria PDF e strumenti cassa sono coperti da "Coming Soon" e gli strumenti cassa non si aprono. Le sottopagine hanno il marchio TEBE e ignorano `?store=`. Non creare varianti OPHILYA se non richiesto.
10. **Due tipi di utenti in dashboard.**
    - **CREATOR** (predefinita, non memorizzata) è per chi fa visual merchandising.
    - **CASSIERE** riordina la pagina con `order` CSS e nasconde tutto tranne gli *Strumenti Cassa*.

## Convenzioni

- **Lingua:** testi dell'interfaccia, etichette, messaggi di `alert`/`confirm`, messaggi `console.error`, commenti nel codice e documentazione del progetto sono **in italiano**. Gli identificatori sono in inglese o italiano, seguendo il codice circostante. I messaggi di commit sono stati scritti in entrambe le lingue; vanno bene brevi e all'imperativo.
- **Prezzi:** formato italiano con la virgola, mostrati come `€ 29,90` (simbolo euro, spazio, importo). I campi sono per lo più testo libero e vengono mostrati così come digitati. Si converte con `.replace(',', '.')` solo per fare calcoli, e si riformatta con `.toFixed(2).replace('.', ',')`. Gli sconti appaiono come `-50%`: l'utente digita solo il numero, segno e `%` li aggiunge la pagina.
- **Preset condivisi.** Se ne modifichi uno, tienilo allineato in tutte le pagine:
  - Fasce prezzo: `10,00 · 19,90 · 29,90 · … · 89,90 · 99,00`.
  - Testi promo: Special Deal, Final Price, Summer/Spring/Winter Sale, Black Friday, Made in Italy, Vera Pelle • Genuine Leather, Made in Italy • Genuine Leather, Fino ad esaurimento scorte.
  - Le tre frasi lunghe hanno un corpo più piccolo (`long-text` / `is-long-description`).
- **Tipografia dei cartelli:**
  - Arial con `letter-spacing: -0.05em` (il "tracking −50" della specifica) per Semplice, Sale, Percentuale, Brand e Multi Articolo.
  - Bodoni Std (OTF locale) per Paletto, etichette e cartellini.
  - Castoro (Google Fonts) per le cornici.
  - Oro d'accento `#cc9e25` per "sale" e percentuali; nero per i prezzi.
- **Struttura dell'interfaccia degli editor:**
  - Palette neutra calda: avorio `#f8f6f1`, crema `#fffdfa`, bordo beige `#e3dacb`, oro UI `#b49a62`, testo `#282522`.
  - Pannello sinistro `.sidebar` > `.controls` largo 360 px, con `h2`/`h1` maiuscolo oro.
  - `.form-group`; gruppi di pulsanti `.mode-switch` con la classe `.active`; `.preset-select` che avvolge un `<select>` che riempie il campo di testo libero accanto.
  - Pulsante `.btn-print` rosso scuro (`#96382b`).
  - Pulsante tondo fisso `.app-close-btn` (✕) in alto a destra e `.floating-nav-box` ("← Torna al Menu Principale") in basso a destra, entrambi verso `index.html?store=tebe`.

  Copia questa struttura da una pagina esistente invece di inventarne una nuova.
- **Palette della dashboard** (`index.html`): variabili CSS su `:root` (`--ivory`, `--cream`, `--gold #ad8a3e`, `--ink` …). Fraunces per i titoli, Arial per il testo.
- **Testo inserito dall'utente:** usa `textContent` o nodi DOM. Nel codice nuovo non costruire markup con `innerHTML` a partire dai campi del modulo.
- **Sezioni nascoste** con `style.display` o l'attributo `hidden`. Lo stato delle modalità sta in un semplice oggetto JS per pagina (es. `framesState`, `cardStates`) e viene sincronizzato col modulo tramite una coppia di funzioni `sync…`/`render…`.
- **Funzioni duplicate.** Alcune funzioni sono copiate in più pagine (`readCustomLogos`, `cleanBrandName`, `getDefaultBrandFile`, `stepDiscount`, `loadCustomBrandSelect`, …). Se ne cambi il comportamento, aggiorna tutte le copie.

## Moduli condivisi: contratti

### `assets/js/logos.js`

- Globali: `LOGO_FILES`, `PRIORITY_BRANDS`, `LOGO_ASSET_VERSION`, `getSortedLogoFiles()`, `getOrderedLogoFiles()`, `getLogoSource()`, `appendBrandOption()`.
- `LOGO_FILES` **deve restare esattamente nella forma** `const LOGO_FILES = [\n  "NOME.png",\n ...\n];`. `logoimport.html` e `logogestione.html` la riscrivono con una regex e la ordinano alfabeticamente.

### `assets/js/print-logo-colors.js`

- Espone `window.PrintLogoColors = { resolve, getBrandLogoSrc, setBrandLogoSrc, getOfficialPrintLogoPath, prepareForPrint, invalidateCustomLogoCache }`.
- Va caricato dopo `logos.js`.

### Versione degli asset (cache busting)

- `LOGO_ASSET_VERSION` (attualmente `20260927`) compare in `logos.js`, in `print-logo-colors.js` e nel parametro `?v=` dei tag `<script>` che li caricano.
- Quando cambiano i file dei loghi, aggiornali **tutti** insieme.

### `assets/js/tema-italia.js` + `.css` (pulsante Made in Italy)

- **Attivazione.** Si inizializza da solo in ogni pagina con elementi `.card` o `.frame-box`. Aggiunge le bandierine laterali tranne dove c'è `.tema-italia-no-side-flags`; sulle cornici le aggiunge solo dove è presente `.tema-italia-target`.
- **All'attivazione:**
  - salva lo stato di tutti i campi, menu e pulsanti di modalità;
  - passa alla modalità descrizione (`#modeDescrizione`/`#modeDescription`/`#standardModeBtn`);
  - seleziona o scrive "Made in Italy".
- **Alla disattivazione:** ripristina esattamente lo stato salvato.
- **Hook di pagina.** Le pagine con uno stato più ricco del modulo possono gestirlo da sé definendo su `window`:
  - `applyTemaItaliaDescription()`
  - `captureTemaItaliaState()`
  - `restoreTemaItaliaState(state)`
  - e inoltre `switchMode(mode)`, `setFrameMode(mode)`, `switchActiveFrame(side)`

  Non cambiare questi nomi né gli id degli elementi indicati sopra: il tema li cerca per nome.
- **Altri controlli.** `window.deactivateTemaItalia()` lo disattiva. Paletto, per esempio, lo chiama quando si esce dalla modalità Standard.

### `assets/js/dymo-direct.js`

- Espone `window.DymoDirect = { dymoGetPrinters, dymoFindPrinter, dymoPrintPng, buildLabelXml11354 }`.
- `dymoFindPrinter` preferisce una stampante connessa il cui modello corrisponde a `/450/`.
- Non modificare i bounds dell'etichetta: sono quelli già accettati dal servizio.

## Dati

| Dove | Chiave / parametro | Struttura | Scritto da | Letto da |
|---|---|---|---|---|
| localStorage | `custom_brand_logos` | `[{ id: "custom_<ms>", name: "MAIUSCOLO", data: "data:image/png;base64,…" }]`; l'ordine dell'array è l'ordine manuale scelto dall'utente | `genera_loghi`, `gestisci_lista`, `logoimport` (salva qui anche i loghi ufficiali importati) | Brand, Percentuale, Cornici, Etichette, `print-logo-colors.js` |
| localStorage | `collapsed_sidebar_sections` | array di id di sezione; predefinito `["custom-logos","tools","credits"]` | `index.html` | `index.html` |
| localStorage | `customLogos` | chiave storica, letta solo come ripiego | — | `etichette.html` |
| file | backup JSON | `{ version: 1, exportedAt, logos: [...] }`; l'importazione verifica che `data` inizi con `data:image/` e **sostituisce** l'intero elenco | `gestisci_lista` | `gestisci_lista` |
| URL | `?store=tebe\|ophilya` | aggiunto a ogni link della dashboard | `index.html` | solo `index.html` |
| URL | `?label=` (alias `tpl`, `template`) | `doppioprezzo`/`final`/`finalprice` → Doppio Prezzo, `promo`/`lastchance` → Articolo, `outlet`/`luxury` → Luxury, `promo50`, `tagliedoppiacifra` | card della dashboard | `etichette.html` |
| URL | `?file=assets/pdf/…` | percorso del PDF | `galleria-pdf.html` | `pdf-viewer.html` |

## Procedure

**Aggiungere una nuova pagina cartello/editor**

1. Copia la pagina esistente più simile (struttura, CSS di stampa, link di navigazione).
2. Includi `tema-italia.css`/`.js` se il pulsante Made in Italy ha senso. Includi `logos.js` + `print-logo-colors.js` (in quest'ordine, con il `?v=` corrente) se la pagina mostra loghi brand.
3. Collegala in `index.html` in **entrambi** i punti:
   - un `<button onclick="openPage('…')">` nel `nav` CREA CARTELLI del menu laterale;
   - un `<a class="card" data-link="…">` in `#cartelli-carousel`, con il `.number` successivo e una `.card-thumb`. Due immagini più la classe `slideshow` danno la dissolvenza al passaggio del mouse.
4. Aggiungi le miniature in `assets/thumbnail/`.
5. I widget non ancora pronti usano `<article class="coming-soon-card">`.

**Aggiungere o rimuovere un logo brand ufficiale**

- Metodo consigliato: `logoimport.html` / `logogestione.html` in Chrome/Edge, collegando la cartella del repo.
- A mano: aggiungi il PNG trasparente in `assets/logos/`, crea tutte e quattro le varianti `printlogos/{white,black,red,gold}<NOME>.png`, aggiungi il nome a `LOGO_FILES` e aggiorna `LOGO_ASSET_VERSION` ovunque.

**Aggiungere un modello di etichetta DYMO**

1. Aggiungi una voce a `TEMPLATES` in `etichette.html` (`name`, `fields` = id dei gruppi del pannello da mostrare, `render`).
2. Aggiungi il blocco corrispondente nel CSS di stampa di `buildPrintDocument`.
3. Aggiungi una `.template-card` nel pannello.
4. Facoltativo: un alias in `paramMap` e una `.dymo-card` in dashboard.
5. Controlla sia l'anteprima a schermo (456 × 256 px) sia la stampa rasterizzata.

## Verifica delle modifiche

Non ci sono test automatici né linter. Per verificare:

- Servi la cartella (`python3 -m http.server`) e apri la pagina modificata.
- Controlla l'anteprima, poi **Stampa → Anteprima** con scala 100 % e margini "Nessuno". Il foglio deve stare esattamente in una pagina A4 (o in una etichetta) senza sbordare.
- Nei cartelli a due pannelli, controlla che le due metà coincidano.
- Attiva e disattiva il pulsante Made in Italy e verifica che torni lo stato precedente.
- Se hai toccato loghi o stampa, prova in **Safari e Chrome**. Safari è il browser che in passato ha rovinato i colori in stampa.
- Se hai toccato la dashboard, controlla anche la modalità OPHILYA, la modalità CASSIERE e le larghezze ridotte (punti di rottura a 1300, 1000, 850 e 720 px).

## Registro delle decisioni

- **17/09/2026**:
  - Import dal repository StoreCraft.
  - `index.html` rifatto come dashboard chiara e minimale TEBE/OPHILYA.
  - Rimossi i circa 194 loghi brand del vecchio cliente con le varianti colore, i PDF inutilizzati e le pagine storiche (`blackfriday`, `blackfridaylips`, `cartelli_lastchance`, `cartelli_multireferenza`, `cartelli_outletmulti`, `cartellinipromo`, `etichettedb`, `etichetteoriginal`, `promo_multibrand`, `xmas_ball`).
  - Nome del negozio corretto da "Ophilia" a "Ophilya" ovunque, compreso `?store=`.
  - Cartello Percentuale riprogettato su specifica A4 precisa, con secondo pannello ribaltato per il taglio bifacciale.
  - Creato il Cartello Outlet, poi rinominato in `cartelli_sale.html`.
- **18/09/2026**: logo più grande nell'intestazione; leggero aumento dei corpi dei testi (i titoli dei widget restano a 17 px).
- **20/09/2026**:
  - Aggiunti i cartelli Semplice e Brand.
  - Aggiunto il menu loghi personalizzati accanto ai brand ufficiali, con ritorno al brand predefinito per non mostrare mai un'immagine rotta.
  - Aggiunti i brand della casa TEBE e OKKIA, WUSIDE e VICOLO.
  - Menu laterale reso comprimibile, con la sezione Loghi Personalizzati.
  - Aggiunto il pulsante flottante Made in Italy ai cartelli. In modalità Doppia Cifra/Standard mostra solo le bandierine. Su Percentuale le bandierine si allineano alla barra "FINO AL".
  - Rimossi `cartello_banco.html` e `magazzino.html`.
- **21/09/2026**: ripristinati tema Made in Italy e navigazione.
- **24–25/09/2026**:
  - Aggiunti gli strumenti cassa in dashboard, le miniature con dissolvenza e il selettore CREATOR/CASSIERE.
  - Aggiunti i caroselli per cartelli ed etichette.
  - Made in Italy ora ripristina esattamente campi e modalità precedenti.
  - Corrette le varianti dei loghi per l'uso da `file://`, pregenerando tutti i printlogos.
- **27/09/2026**:
  - Cornici 10×15: modalità brand, poi modalità Standard/Doppio Articolo/Brand, con limite di righe (4 in Standard, 3 in Doppio Articolo).
  - Nuova Cornice 21×27 (massimo 2 righe).
  - Made in Italy sulle cornici.
  - Loghi brand rigenerati in modo uniforme (`LOGO_ASSET_VERSION` impostata a `20260927`).
  - Stampa DYMO diretta ed etichetta Doppio Prezzo, attivata dalla dashboard, con allineamento mantenuto per i prezzi a quattro cifre.
- **28/09/2026**:
  - Aggiunto Albero Accessori (tre cartellini per foglio).
  - Aggiornati il widget Cornici e l'etichetta Articolo (descrizione limitata a 16 caratteri).
  - Aggiunto Paletto Ferro 1 con Standard/Doppio Prezzo, poi Doppio Articolo (ogni articolo può essere descrizione o doppio prezzo).
