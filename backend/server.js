const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const db = require("./db");

console.log("Isi dari variabel db:", db);

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const namaFile = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
        cb(null, namaFile);
    },
});
const upload = multer({ storage });

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadDir));
app.use(express.static(path.join(__dirname, "..")));


const PORT = 3000;

console.log("Status DB:", db);

// Route paling dasar, hanya untuk mengecek server hidup
app.get("/", (req, res) => {
    res.send("Selamat datang di API TokoKita!");
});

// Menjalankan server dan mendengarkan di PORT yang ditentukan

app.get("/api/ping", (req, res) => {
    // res.json() otomatis mengubah objek JavaScript menjadi format JSON
    res.json({
        status: "success",
        message: "pong",
        waktuserver: new Date().toLocaleDateString(),
    });
});


// GET/api/products -> mengambil semua produk
app.get("/api/products", (req, res) => {
    const data = db.prepare("SELECT * FROM produk").all();
    res.json({ status: "success", data });
});

// GET /api/products/search?nama=... -> mencari produk berdasarkan nama
app.get("/api/products/search", (req, res) => {
    const { nama } = req.query;

    if (!nama) {
        return res.status(400).json({ status: "error", message: "Query parameter nama wajib diisi" });
    }

    const kataKunci = `%${nama.toLowerCase()}%`;
    const hasil = db.prepare("SELECT * FROM produk WHERE lower(nama) LIKE ?").all(kataKunci);

    res.json({ status: "success", data: hasil });
});

// GET /api/products/:id -> mengambil satu produk bers=dasarka nid
app.get("/api/products/:id", (req, res) => {
    const id = Number(req.params.id);
    const item = db.prepare("SELECT * FROM produk WHERE id = ?").get(id);

    if (!item) {
        return res.status(404).json({ status: "error", message: "Produk tidak ditemukan" });
    }
    res.json({ status: "success", data: item });
});

// poST /api/products -> menambah produk baru
app.post("/api/products", upload.single("gambar"), (req, res) => {
    const { nama, keterangan } = req.body;
    const harga = Number(req.body.harga);
    const file = req.file;
    const gambar = file ? `/uploads/${file.filename}` : req.body.gambar;
    const stok = Number(req.body.stok) || 0;

    //Validasi sederhana di sisi backend
    if (!nama || !harga || harga <= 0 || !gambar || stok < 0) {
        return res.status(400).json({
            status: "error",
            message: "Nama, harga, gambar, dan stok wajib diisi dengan nilai valid",
        });
    }

    const isiKeterangan = keterangan && keterangan.trim().length > 0
        ? keterangan.trim()
        : `Produk original ${nama} garansi resmi TokoKita.`;

    const hasil = db
        .prepare("INSERT INTO produk (nama, harga, gambar, keterangan, stok) VALUES (?, ?, ?, ?, ?)")
        .run(nama, harga, gambar, isiKeterangan, stok);

    const produkBaru = { id: hasil.lastInsertRowid, nama, harga, gambar, keterangan: isiKeterangan, stok };
    res.status(201).json({ status: "success", data: produkBaru });
});

// PUT /api/products/:id -> memperbarui produk berdasarkan id
app.put("/api/products/:id", upload.single("gambar"), (req, res) => {
    const id = Number(req.params.id);
    const { nama, keterangan } = req.body;
    const harga = Number(req.body.harga);
    const stok = Number(req.body.stok) || 0;
    const file = req.file;
    const gambar = file ? `/uploads/${file.filename}` : req.body.gambar;

    if (!nama || !harga || harga <= 0 || !gambar || stok < 0) {
        return res.status(400).json({ status: "error", message: "Nama, harga, gambar, dan stok wajib diisi dengan nilai valid" });
    }

    const isiKeterangan = keterangan && keterangan.trim().length > 0
        ? keterangan.trim()
        : `Produk original ${nama} garansi resmi TokoKita.`;

    const hasil = db
        .prepare("UPDATE produk SET nama = ?, harga = ?, gambar = ?, keterangan = ?, stok = ? WHERE id = ?")
        .run(nama, harga, gambar, isiKeterangan, stok, id);

    if (hasil.changes === 0) {
        return res.status(404).json({ status: "error", message: "Produk tidak ditemukan" });
    }

    const item = db.prepare("SELECT * FROM produk WHERE id = ?").get(id);
    res.json({ status: "success", data: item });
});


// DELETE /api/products/:id -> menghapus produk berdasarkan id
app.delete("/api/products/:id", (req, res) => {
    const id = Number(req.params.id);
    const hasil = db.prepare("DELETE FROM produk WHERE id = ?").run(id);

    if (hasil.changes === 0) {
        return res.status(404).json({ status: "error", message: "Produk tidak ditemukan" });
    }
    res.json({ status: "success", message: `Produk id ${id} berhasil dihapus `});
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});