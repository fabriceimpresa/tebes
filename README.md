# TEBE · OPHILYA — StoreCraft Visual Merchandising

Strumenti per il punto vendita di **TEBE** (moda donna, Via del Corso 269) e **OPHILYA** (pelletteria, Via del Corso 268). Il personale li usa per creare cartelli prezzo stampabili, inserti per le cornici da banco ed etichette prezzo DYMO, per aprire locandine PDF già pronte e per fare calcoli veloci alla cassa.

L'applicazione ha il marchio **STORE // CRAFT** ("Crafted with StoreCraft"). È nata dall'import di un precedente repository StoreCraft, poi è stata ritematizzata e ridotta per questi due negozi. Tutta l'interfaccia è in italiano.

## In breve

- **Sito statico.** HTML, CSS e JavaScript vanilla. Niente build, niente package manager, niente framework, niente backend, niente test.
- **Una pagina per strumento.** Ogni file `.html` nella root contiene i propri `<style>` e `<script>` inline. Pochi script condivisi stanno in `assets/js/`.
- **Pensato per la stampa.** Ogni editor mostra un'anteprima dal vivo precisa al millimetro. Si stampa con la finestra di stampa del browser, oppure direttamente su una DYMO LabelWriter per le etichette.
- **Nessun dato lato server.** I loghi personalizzati sono salvati nel `localStorage` del browser, quindi ogni browser ha il proprio elenco. Per i backup c'è un'esportazione/importazione JSON.

## Avvio

Apri `index.html` nel browser. Durante lo sviluppo conviene servire la cartella, così fetch relativi e operazioni su canvas si comportano come in produzione:

```sh
python3 -m http.server 8000
# poi apri http://localhost:8000/
```

Alcune funzioni richiedono la rete o servizi locali:

| Funzione | Richiede |
|---|---|
| Font della dashboard e degli editor (Fraunces, Castoro) | Google Fonts |
| QR code, rasterizzazione delle etichette | `qrcodejs` 1.0.0 e `html2canvas` 1.4.1 da cdnjs |
| Tassi di cambio aggiornati (Cambio Valuta) | `open.er-api.com`. Se non raggiungibile, si usano tassi di riserva interni. |
| Stampa DYMO diretta | DYMO Connect attivo sullo stesso computer (`https://127.0.0.1:41951`) e una LabelWriter (preferibilmente la 450) |
| Import/gestione loghi ufficiali (uso interno) | Chrome o Edge desktop (File System Access API) |

## Pagine

### Dashboard: `index.html`

- **Selettore negozio (TEBE / OPHILYA).** Cambia logo e indirizzo nell'intestazione e aggiunge `?store=` a tutti i link. Per ora OPHILYA è in parte un segnaposto: i cartelli mostrano "Coming Soon", mentre i materiali pronti hanno le loro versioni col logo OPHILYA. Gli strumenti cassa invece funzionano come in TEBE.
- **Selettore modalità (CREATOR / CASSIERE).** CREATOR mostra tutti i widget, con gli *Strumenti Cassa* in fondo. CASSIERE mostra solo gli *Strumenti Cassa*. La pagina si apre sempre in CREATOR.
- **Menu laterale.** Sezioni comprimibili; lo stato aperto/chiuso è ricordato nel `localStorage`.
- **Strumenti cassa** (TEBE e OPHILYA):
  - calcolo sconto
  - calcolo aliquota di sconto
  - cambio valuta (USD, GBP, RUB, ILS, CNY, JPY)
  - calcolo IVA (4 / 5 / 10 / 22 %, in entrambe le direzioni)
  - generatore QR (link predefinito: Instagram TEBE)

  Su computer e tablet uno strumento si apre in un popup quando lo tocchi. Sul telefono gli strumenti sono già pronti all'uso nella pagina.

### Editor cartelli (*Crea Cartelli*), A4 verticale

| Pagina | Cosa stampa |
|---|---|
| `cartelli_semplici.html` | **Semplice**: riga di testo + prezzo + logo TEBE |
| `cartelli_sale.html` | **Sale**: "sale" + prezzo barrato e −% (*Doppia Cifra*) oppure descrizione + prezzo finale |
| `cartellopercentuale.html` | **Percentuale**: "FINO AL −XX%", con descrizione o logo brand facoltativi |
| `cartelli_brand.html` | **Brand**: logo brand in oro + Doppia Cifra o descrizione + prezzo finale |
| `cartelli_multiarticolo.html` | **Multi Articolo**: 2 articoli affiancati, oppure tabella da 3–4 righe |
| `albero.html` | **Albero Accessori**: tre cartellini (160 × 75 mm) per foglio, per l'albero accessori |
| `cornici10x15.html` | **Cornici 10×15**: due inserti per foglio, sinistro e destro modificabili separatamente. Modalità: Standard / Doppio Articolo / Brand / Percentuale Sconto (percentuale oro con "FINO AL", logo TEBE; sopra, a scelta, niente, una descrizione o un logo brand). |
| `cornice21x27.html` | **Cornice 21×27**: un inserto grande. Modalità: Descrizione / Brand. |
| `paletto.html` | **Paletto 15x10**: due cartelli indipendenti per foglio, con linea di taglio tratteggiata. Modalità: Standard / Doppio Prezzo / Doppio Articolo. |
| `paletto18x12.html` | **Paletto 18x12**: come Paletto 15x10, con cartelli più grandi (179,94 × 127,09 mm). |

Nei fogli Semplice, Sale, Percentuale, Brand e Multi Articolo lo stesso cartello è stampato due volte. La copia inferiore è ruotata di 180°: si ritaglia la striscia e la si piega lungo il bordo comune, ottenendo un cartello leggibile da entrambi i lati.

Quasi tutte le pagine cartello hanno un pulsante tondo **Made in Italy** (`assets/js/tema-italia.js`). Aggiunge le bandierine italiane al cartello e imposta la descrizione su "Made in Italy". Un secondo clic ripristina esattamente lo stato precedente.

### Etichette: `etichette.html` (TEBE) ed `etichetteophilya.html` (OPHILYA)

Etichette DYMO **11354** (57 × 32 mm, 2,25 × 1,25 in). In modalità OPHILYA la dashboard apre `etichetteophilya.html`, uguale a quella di TEBE tranne che per il logo OPHILYA predefinito (selezionabile come ⭐ OPHILYA nel menu brand), centrato e senza QR code, e per la promo predefinita GENUINE LEATHER (in TEBE è SALE).

- **Modelli:** Semplice, Doppio Prezzo, Articolo, Taglie | Doppia Cifra e Promo. Si può aprire direttamente un modello con `?label=` (per esempio `?label=doppioprezzo`).
- **Stampa:** l'etichetta viene resa in un PNG a 300 dpi e inviata a DYMO Connect. Se DYMO Connect o la stampante non sono disponibili, si passa alla stampa del browser.
- **Promo (layout Semplice):** SALE, GENUINE LEATHER, VERA PELLE, OUTLET PRICE, FINAL PRICE, SPECIAL DEAL e, in bianco su nero con la stella nel menu, BLACK FRIDAY e le Sale stagionali. Le promo di due parole vanno su due righe.
- **Made in Italy (layout 1–3):** il tasto tondo in alto a destra sposta il logo a sinistra e aggiunge l'adesivo Made in Italy a destra (in TEBE al posto del QR).
- **Numero di copie:** il campo sopra "Stampa etichetta" fa stampare più copie con un solo invio alla DYMO.
- **QR code:** nelle etichette TEBE il QR punta all'Instagram di TEBE.

### Materiali pronti

- In dashboard, un carosello con le stampe pronte: Taglie Internazionali, Orari, Staff Only, Cercasi Personale, No Food & Drinks e Vietato Fumare. Ogni widget ha miniatura, titolo e tasto Apri / Stampa, e apre il PDF nel visualizzatore.
- `pdf-viewer.html?file=…`: visualizzatore integrato. Da telefono apre direttamente il PDF.

### Loghi personalizzati

- `genera_loghi.html` (**Importa Loghi**): carica un logo su sfondo bianco o nero. Lo sfondo viene reso trasparente in automatico e il logo viene salvato con un nome brand.
- `gestisci_lista.html` (**Gestisci Loghi**): rinomina, riordina con trascinamento, elimina, esporta/importa un backup JSON (`storecraft-loghi-personalizzati.json`).

I loghi personalizzati compaiono poi nei menu "Loghi personalizzati" degli editor Brand, Percentuale, Cornici ed Etichette.

### Pagine interne e non collegate

- `logoimport.html`: aggiunge un logo brand **ufficiale** al progetto. Scrive in `assets/logos/`, genera le quattro varianti colore in `assets/img/printlogos/` e aggiorna `assets/js/logos.js`.
- `logogestione.html`: rimuove un logo ufficiale da tutti e tre i punti.
- `cartellinivetrina.html`: cartellini prezzo per vetrina su A4 orizzontale. Non è collegata dalla dashboard.

## Struttura del repository

```
index.html                  Dashboard
favicon.ico, apple-touch-icon.png  Icona della dashboard (logo TEBE 269 su fondo avorio)
cartelli_*.html, cartellopercentuale.html, albero.html, paletto.html, paletto18x12.html,
cornici10x15.html, cornice21x27.html      Editor cartelli
etichette.html              Editor etichette DYMO (TEBE)
etichetteophilya.html       Editor etichette DYMO (OPHILYA)
pdf-viewer.html             Visualizzatore dei PDF pronti
genera_loghi.html, gestisci_lista.html    Loghi personalizzati (per browser)
logoimport.html, logogestione.html        Loghi ufficiali (scrivono nel repo, uso interno)
assets/
  js/logos.js               Elenco brand ufficiali + funzioni di ordinamento
  js/print-logo-colors.js   Restituisce versioni dei loghi già colorate per la stampa
  js/tema-italia.js/.css    Pulsante "Made in Italy" condiviso dalle pagine cartello
  js/dymo-direct.js         Client minimo per il web service DYMO Connect
  logos/                    Loghi brand ufficiali (PNG trasparenti originali)
  img/printlogos/           Varianti precolorate: {white,black,red,gold}<NOME>.png
  img/                      Loghi negozio, decori, bandiere, logo footer
  fonts/                    Bodoni Std (in uso) e altri font con licenza
  pdf/                      Segnaletica pronta da stampare (i PDF del carosello Materiali Pronti)
  thumbnail/                Anteprime dei widget della dashboard e delle etichette
```

## Crediti

Sviluppato da Fabrizio Notte. Marchi e loghi appartengono ai rispettivi proprietari.
