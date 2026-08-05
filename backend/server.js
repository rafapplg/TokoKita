// Mengimpor library express yang sudah diinstal
const express = require("express");

// Membuat instance aplikasi Express
const app = express();
const PORT = 3000;

// Middleware bawaan agar Express bisa membaca JSON dari request
app.use(express.json());

// Route paling dasar, hanya untuk mengecek server hidup
app.get("/", (req, res) => {
    res.send("Selamat datang di API TokoKita!");
});

// Menjalankan server dan mendengarkan di PORT yang ditentukan
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});