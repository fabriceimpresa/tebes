# CLAUDE.md

Contesto, decisioni e convenzioni del progetto stanno tutti in `AGENTS.md`, così Claude e gli altri agenti hanno un'unica fonte. Il file è importato qui:

@AGENTS.md

## Note specifiche per Claude Code

- Non esistono comandi di build, lint o test. Per verificare una modifica, servi il repo con `python3 -m http.server 8000` e apri la pagina. Per modifiche di impaginazione o stampa, chiedi all'utente di controllare l'anteprima di stampa del browser, perché non puoi vedere il risultato stampato.
- Prima di modificare una pagina, leggi i suoi `<style>` e `<script>` inline: ogni pagina è autonoma. Se cambi una funzione duplicata, cerca le altre copie (`readCustomLogos`, `cleanBrandName`, `getDefaultBrandFile`, `stepDiscount`, …).
- La documentazione del progetto (README.md, AGENTS.md, CLAUDE.md) si scrive solo in italiano, così come testi dell'interfaccia e commenti nel codice.
- Non toccare le misure in `mm`/`pt`, il formato dell'array `LOGO_FILES` o i nomi degli hook Made in Italy, a meno che il compito non riguardi proprio quelli. Il motivo è spiegato in `AGENTS.md`.
- Non inserire nella documentazione correzioni o problemi da risolvere: vanno segnalati separatamente all'utente.
- Se aggiungi, rinomini o rimuovi una pagina, un logo, una chiave di `localStorage` o una convenzione, aggiorna `AGENTS.md` (e `README.md` se la modifica è visibile agli utenti) nella stessa modifica.
