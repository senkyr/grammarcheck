const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const exerciseRoutes = require('./routes/exerciseRoutes');
const submissionRoutes = require('./routes/submissionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Připojení k MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB připojeno'))
  .catch(err => console.error('Chyba připojení k MongoDB:', err));

// API routes
app.use('/api/exercises', exerciseRoutes);
app.use('/api/submissions', submissionRoutes);

// Servírování statických souborů v produkci
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../frontend/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server běží na portu ${PORT}`);
});
