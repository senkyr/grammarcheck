# GrammarCheck

Webová aplikace pro procvičování českého pravopisu, určená především pro mobilní zařízení. Aplikace umožňuje učitelům vytvářet pravopisná cvičení, která studenti mohou řešit a získávat okamžitou zpětnou vazbu.

## Funkce

### Pro studenty:
- Jednoduchá registrace bez nutnosti vytvářet účet (pouze zadání jména)
- Přehledný seznam dostupných cvičení
- Interaktivní vyplňování cvičení s výběrem správných variant
- Okamžitá zpětná vazba nebo zobrazení výsledků po termínu (dle nastavení učitele)
- Detailní přehled výsledků s označením správných a chybných odpovědí

### Pro učitele:
- Jednoduchá administrace cvičení
- Automatická analýza textu pro identifikaci pravopisných jevů
- Možnost nastavit okamžité zobrazení výsledků nebo termín pro zobrazení
- Statistiky úspěšnosti studentů
- Přehled problematických míst v textu
- Export výsledků

## Technický přehled

### Frontend:
- React.js
- Responzivní design optimalizovaný pro mobilní zařízení
- Sépiový vizuální styl podobný webovému rozhraní Claude
- React Router pro navigaci
- Context API pro správu témat a stavů

### Backend:
- Node.js s Express
- MongoDB pro ukládání cvičení a výsledků
- REST API
- Automatická analýza textu pomocí knihovny natural

### Autentizace:
- Pro studenty: Jednoduchá identifikace jménem + ukládání session tokenu
- Pro učitele: Přístupový kód

## Jak spustit aplikaci lokálně

1. Naklonujte repozitář:
```
git clone https://github.com/username/pravopisna-cviceni.git
cd pravopisna-cviceni
```

2. Instalace závislostí:
```
npm install
cd frontend
npm install
cd ..
```

3. Vytvořte soubor `.env` v kořenovém adresáři a nastavte následující proměnné:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pravopisna-cviceni
```

4. Spusťte aplikaci v režimu pro vývoj:
```
npm run dev
```

Tím se spustí backend na portu 5000 a frontend na portu 3000.

## Nasazení na Render

Aplikace je připravena pro nasazení na platformě Render:

1. Vytvořte nový Web Service v Render dashboardu.
2. Propojte svůj GitHub repozitář.
3. Nastavte následující hodnoty:
   - Build Command: `npm run build`
   - Start Command: `npm start`
4. Přidejte environment variable MONGODB_URI s připojovacím řetězcem pro MongoDB.

## Struktura projektu

```
/
├── frontend/              # Frontend aplikace (React)
│   ├── public/            # Statické soubory
│   └── src/               # Zdrojový kód
│       ├── components/    # React komponenty
│       ├── pages/         # Stránky aplikace
│       ├── contexts/      # Context API
│       ├── styles/        # CSS styly
│       └── App.js         # Hlavní React komponenta
├── backend/               # Backend aplikace (Node.js + Express)
│   ├── controllers/       # Kontrolery pro různé endpointy
│   ├── models/            # Datové modely
│   ├── routes/            # API routy
│   └── server.js          # Hlavní soubor serveru
└── package.json           # Projektové závislosti
```

## Rozšíření a další vývoj

Možnosti rozšíření aplikace:

1. Pokročilejší analýza textu s využitím umělé inteligence
2. Více typů cvičení (doplňovačky, přepisování, atd.)
3. Systém tříd a skupin pro lepší organizaci studentů
4. Export a import cvičení
5. Gamifikační prvky pro zvýšení motivace studentů
6. Offline režim pomocí PWA (Progressive Web App)
