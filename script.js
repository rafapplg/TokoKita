const API_URL = "https://glowing-invention-xr9p6v94vqg4hwpj-3000.app.github.dev/api/products";
 
// Fungsi untuk menampilkan satu produk sebagai kartu HTML
function buatKartuProduk(item) {
  const kartu = document.createElement("div");
  kartu.className = "bg-white rounded-xl shadow hover:shadow-lg transition p-4";
  kartu.innerHTML = `
    <div class="w-full h-40 bg-gray-100 rounded-lg mb-3 flex items-center
                justify-center text-gray-400 text-sm">Belum ada gambar</div>
    <h4 class="font-semibold text-gray-800">${item.nama}</h4>
    <p class="text-blue-700 font-bold mt-1">Rp ${item.harga.toLocaleString("id-ID")}</p>
    <button class="w-full mt-3 bg-blue-700 text-white py-2 rounded-lg text-sm
                   btn-tambah-keranjang">Tambah ke Keranjang</button>
  `;
  return kartu;
}

const gridKatalog = document.getElementById("grid-katalog");
const formProduk = document.getElementById("form-produk");

async function muatProduk() {
  gridKatalog.innerHTML = `<p>Memuat produk...</p>`;

  try {
    const response = await fetch(API_URL);
    const hasil = await response.json();

    gridKatalog.innerHTML = "";

    // kalau backend mengembalikan { data: [...] }
    hasil.data.forEach((item) => {
      gridKatalog.appendChild(buatKartuProduk(item));
    });

  } catch (error) {
    console.error(error);
    gridKatalog.innerHTML = `<p>Gagal memuat produk</p>`;
  }
}

muatProduk();

// let digunakan untuk nilai ynag bisa berubah
let jumlahKeranjang = 0;

// const digunakan untuk nilai yang tetap (tidak berubah)
const namaToko = "TokoHoki";

// Template literal: cara moedrn menggabungkan teks dan variabel 
console.log(`Selamat datang di ${namaToko}!`);
console.log(`Jumlah item di keranjang: ${jumlahKeranjang}`);


// Menyeleksi satu elemen berdasarkan id atau class
const tombolKeranjang = document.querySelector("#tombol-keranjang");
const tombolHamburger = document.querySelector("#tombol-hamburger");
const menuMobile = document.querySelector("#menu-mobile");

// Menyeleksi banyak elemen sekaligus (hasilnya berupa list)
const semuaTombol = document.querySelectorAll(".btn-tambah-keranjang");

console.log(tombolKeranjang); //pastikan elemen ditemukan, bukan null

tombolKeranjang.addEventListener("click", function () {
    console.log("Tombol Keranjang diklik!");
});

//Bentuk modern menggunakan arrowfunction
tombolKeranjang.addEventListener("click", () =>{
    console.log("Tombol Keranjang diklik (arrow function)!");
});

tombolHamburger.addEventListener("click",()=>{
    //dan menghapusnya jika
    // toggle akan menambah class jika belum ada sudah ada
    menuMobile.classList.toggle("hidden");
});


const pesanError = document.querySelector("#pesan-error");

formProduk.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nama = document.querySelector("#input-nama").value.trim();
  const harga = Number(document.querySelector("#input-harga").value);

  if (nama === "" || harga <= 0) {
    pesanError.textContent = "Nama produk dan harga (lebih dari 0) wajib diisi.";
    pesanError.classList.remove("hidden");
    return;
  }

  pesanError.classList.add("hidden");

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nama, harga }),
  });

  formProduk.reset();
  muatProduk();
});

let totalKeranjang = 0;
const labelKeranjang = document.querySelector("#tombol-keranjang");

gridKatalog.addEventListener("click", (event) => {
    // cek apakah yang diklik adalah tombol tambah ke Keranjang
    if (event.target.classList.contains("btn-tambah-keranjang")) {
        totalKeranjang++;
        labelKeranjang.textContent = `Keranjang (${totalKeranjang})`;
    }
});