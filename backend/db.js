const path = require("path");
const Database = require("better-sqlite3");
const dbFile = path.join(__dirname, "tokokita.db");
const db = new Database(dbFile);

db.exec(`
    CREATE TABLE IF NOT EXISTS produk (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama TEXT NOT NULL,
        harga INTEGER NOT NULL,
        gambar TEXT,
        keterangan TEXT,
        stok INTEGER NOT NULL DEFAULT 0
    );
`);

const tableInfo = db.prepare("PRAGMA table_info('produk')").all();
const columns = tableInfo.map((col) => col.name);
if (!columns.includes("gambar")) {
    db.prepare("ALTER TABLE produk ADD COLUMN gambar TEXT").run();
}
if (!columns.includes("keterangan")) {
    db.prepare("ALTER TABLE produk ADD COLUMN keterangan TEXT").run();
}
if (!columns.includes("stok")) {
    db.prepare("ALTER TABLE produk ADD COLUMN stok INTEGER NOT NULL DEFAULT 0").run();
}

const jumlahProduk = db.prepare("SELECT COUNT(*) AS total FROM produk").get();

if (jumlahProduk.total === 0) {
    const tambahProduk = db.prepare(
        "INSERT INTO produk (nama, harga, gambar, keterangan, stok) VALUES (?, ?, ?, ?, ?)"
    );

    tambahProduk.run(
        "Iphone 17 Pro Max",
        36999999,
        "assets/images/IP.png",
        "IPhone terbaru dengan penyimpanan besar dan performa top-tier.",
        10
    );
    tambahProduk.run(
        "Realme GT 8 Pro",
        19999999,
        "assets/images/Rilme.png",
        "Smartphone ultrawaxt dengan desain premium dan pengisian cepat.",
        8
    );
    tambahProduk.run(
        "Red Magic 7",
        14999999,
        "assets/images/RedMejik.jpg",
        "Ponsel gaming dengan pendingin internal dan refresh rate tinggi.",
        12
    );

    console.log("Data awal produk berhasil dimasukkan ke database.");
}

module.exports = db;