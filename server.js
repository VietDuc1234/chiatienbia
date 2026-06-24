const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DEFAULT_STATE = {
  players: [],
  pricePerPoint: 0,
  soundOn: true,
};

function readState() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...data };
  } catch (err) {
    return { ...DEFAULT_STATE };
  }
}

function writeState(state) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf8');
}

// Doc trang thai hien tai
app.get('/api/state', (req, res) => {
  res.json(readState());
});

// Ghi de toan bo trang thai
app.post('/api/state', (req, res) => {
  const body = req.body || {};
  const state = {
    players: Array.isArray(body.players) ? body.players : [],
    pricePerPoint: Number(body.pricePerPoint) || 0,
    soundOn: body.soundOn !== false,
  };
  try {
    writeState(state);
    res.json({ ok: true, state });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Bi-a app dang chay tai: http://localhost:${PORT}`);
});
