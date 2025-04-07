const express = require('express');
const path = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const exerciseRoutes = require('./routes/exerciseRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const { initializeDatabase } = require('./models/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Inicializace databáze
let db;
(async () => {
  try {
    // Zajistíme, že adresář pro databázi existuje
    const dbPath = process.env.NODE_ENV === 'production' 
      ? path.join(__dirname, '../data.sqlite') 
      : path.join(__dirname, 'data.sqlite');
    
    // Otevření databázového spojení
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Inicializace tabulek a indexů
    await initializeDatabase(db);
    
    console.log('SQLite databáze připojena');
    
    // Nastavení kontextu pro routes
    app.use((req, res, next) => {
      req.db = db;
      next();
    });
    
    // API routes
    app.use('/api/exercises', exerciseRoutes);
    app.use('/api/submissions', submissionRoutes);
    
    // Servírování statických souborů v produkci
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '../frontend/build')));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
      });
    }
    
    app.listen(PORT, () => {
      console.log(`Server běží na portu ${PORT}`);
    });
  } catch (err) {
    console.error('Chyba při inicializaci databáze:', err);
    process.exit(1);
  }
})();
