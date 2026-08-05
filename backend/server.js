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

app.get("/api/ping", (req,res) => {
  res.json({
    status: "success",
    message: "pong",
    waktuServer: new Date().toISOString(),
  });
});

let.produk = [
  { id: 1, nama: "Iphone 17 Pro Max 16/1TB", harga: 1 },
  { id: 2, nama: "Rolex Dajetsu 41", harga: 207999999 },
  { id: 3, nama: "Red Magic 10 Pro", harga: 22999000},
  { id: 4, nama: "Samsung Z Fold 7", harga: 32599000},
  { id: 5, nama: ""}
]