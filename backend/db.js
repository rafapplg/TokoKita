const Database = require("better-sqlite3");
const db = new Database("tokokita.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS produk (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama TEXT NOT NULL,
        harga INTEGER NOT NULL
    );
`);

const jumlahProduk = db.prepare("SELECT COUNT(*) AS total FROM produk").get();

if (jumlahProduk.total === 0) {
    const tambahProduk = db.prepare(
        "INSERT INTO produk (nama, harga) VALUES (?, ?)"
    );

    tambahProduk.run("Iphone 17 Pro Max", 36999999);
    tambahProduk.run("Realme GT 8 Pro", 19999999);
    tambahProduk.run("Red Magic 7", 14999999);

    console.log("Data awal produk berhasil dimasukkan ke database.");
}

module.exports = db;