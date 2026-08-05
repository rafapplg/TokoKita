// Mengimpor library express yang sudah diinstal
const express = require("express");

// Membuat instance aplikasi Express
const app = express();
const PORT = 3000;

// Middleware bawaan agar Express bisa membaca JSON dari request
app.use(express.json());

// Route paling dasar, hanya untuk mengecek server hidup
app.get("/", (req, res) => {
    res.send("Selamat datang di API TokoAdopt!");
});

// Menjalankan server dan mendengarkan di PORT yang ditentukan
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

app.get("/api/ping", (req, res) => {
    // res.json() otomatis mengubah objek JavaScript menjadi format JSON
    res.json({
        status: "success",
        message: "pong",
        waktuserver: new Date().toLocaleDateString(),
    });
});

//Data sementara di memori (akan diganti database sungguhan di hari 4)
let produk = [
    { id: 1, nama: "Abdul", harga: 90000},
    { id: 2, nama: "Asep", harga: 100000},
    { id: 3, nama: "Ironi", harga: 140000},
];

let idBerikutnya = produk.length + 1;

//Variabel penghitung id agar produk baru selalu punya id unik
let idBerikut = 4;

// GET/api/products -. mengambil semua produk
app.get("/api/products", (req, res) => {
    res.json({ status: "success", data: produk });
});

// GET /api/products/:id -> mengambil satu produk bers=dasarka nid
app.get("/api/products/:id", (req, res) => {
    const id = Number(req.params.id);
    const item = produk.find((p) => p.id === id);

    if (!item) {
        return res.status(404).json({ status: "error", message: "Produk tidak ditemukan" });
    }
    res.json({ status: "success", data: item });
});

// poST /api/products -> menambah produk baru
app.post("/api/products", (req, res) => {
    const { nama, harga } = req.body;
    
    //Validasi sederhana di sisi backend
    if (!nama || !harga || harga <= 0) {
        return res.status(400).json({
            status: "error",
            message: "Nama dan harga (lebih dari 0) wajid diisi",
        });
    }

    const produkBaru = { id: idBerikut++, nama, harga };
    produk.push(produkBaru);

    res.status(201).json({ status: "success", data: produkBaru });
});

// PUT /api/products/:id -> memperbarui produkj berdasarkan id
app.put("/api/products/id", (req, res) => {
    const id = Number(req.params.id);
    const { nama, harga } = req.body;

    const item = produk.find((p) => p.id === id);
    if (!item) {
        return res.status(404).json({ status: "error", message: "Produk tidak ditemukan" });
    }

    if (!nama || !harga || harga <= 0) {
        return res.status(400).json({
            status: "error",
            message: "Nama dan Harga (Lebih dari 0) wajid diisi",
        });
    }

    item.nama = nama;
    item.harga = harga;
    
    res.json({ status: "success", data: item });
});


// DELETE /api/products/:id -> menghapus produk berdasarkan id
app.delete("/api/products/:id", (req, res) => {
    const id = Number(req.params.id);
    const adaProduk = produk.some((p) => p.id === id);

    if (!adaProduk) {
        return res.status(404).json({ status: "error", message: "Produk tidak ditemukan" });
    }

    produk = produk.filter((p) => p.id !== id);
    res.json({ status: "success", message: `Produk id ${id} berhasil dihapus `});
});