const LOCAL_API_HOST = "http://localhost:3000";
const API_URL = "/api/products";

async function apiFetch(path, options = {}) {
  const urls = [path, `${LOCAL_API_HOST}${path}`];
  let lastError;

  for (const url of urls) {
    try {
      return await fetch(url, options);
    } catch (err) {
      lastError = err;
      console.warn(`Coba API ${url} gagal:`, err);
    }
  }

  throw lastError || new Error("Gagal terhubung ke API");
}

// Array penampung keranjang
let isiKeranjang = [];

// Element Selector
const gridKatalog = document.getElementById("grid-katalog");
const formProduk = document.getElementById("form-produk");
const tombolKeranjang = document.querySelector("#tombol-keranjang");
const jumlahKeranjangText = document.querySelector("#jumlah-keranjang-text");
const tombolHamburger = document.querySelector("#tombol-hamburger");
const menuMobile = document.querySelector("#menu-mobile");
const pesanError = document.querySelector("#pesan-error");
const inputGambar = document.getElementById("input-gambar");
const inputStok = document.getElementById("input-stok");
const inputKeterangan = document.getElementById("input-keterangan");
const inputLokasiPemesanan = document.getElementById("input-lokasi-pemesanan");
const pesanLokasi = document.getElementById("pesan-lokasi");

// Selector Modal Keranjang
const modalKeranjang = document.getElementById("modal-keranjang");
const btnTutupModal = document.getElementById("btn-tutup-modal");
const daftarKeranjangModal = document.getElementById("daftar-keranjang-modal");
const totalHargaModal = document.getElementById("total-harga-modal");
const btnProsesCheckout = document.getElementById("btn-proses-checkout");

// Selector Modal Detail Produk
const modalDetail = document.getElementById("modal-detail");
const btnTutupDetail = document.getElementById("btn-tutup-detail");
const btnTutupDetailBawah = document.getElementById("btn-tutup-detail-bawah");
const detailNama = document.getElementById("detail-nama");
const detailHarga = document.getElementById("detail-harga");
const detailKeterangan = document.getElementById("detail-keterangan");
const detailGambar = document.getElementById("detail-gambar");

// Fungsi membuat kartu produk HTML dari API/Database
function buatKartuProduk(item) {
  const placeholderGambar = "assets/images/product-placeholder.svg";
  const gambarSrc = item.gambar || placeholderGambar;
  const stok = item.stok != null ? Number(item.stok) : null;
  const soldOut = stok != null ? stok <= 0 : false;
  const kartu = document.createElement("div");
  kartu.className = "product-card rounded-[30px] border border-slate-800 bg-slate-950/95 shadow-[0_22px_50px_-30px_rgba(15,23,42,0.75)] hover:shadow-[0_28px_80px_-38px_rgba(14,165,233,0.18)] transition p-5 flex flex-col justify-between";
  
  const deskripsi = item.keterangan || `Produk original ${item.nama} garansi resmi TokoKita.`;
  const idProduk = item.id || "";

  const badgeHtml = soldOut
    ? `<span class="absolute top-3 left-3 bg-red-600/90 text-white text-[11px] font-semibold px-3 py-1 rounded-full">Sold Out</span>`
    : `<span class="absolute top-3 left-3 bg-sky-500/15 text-sky-200 text-[11px] font-semibold px-3 py-1 rounded-full">${stok != null ? `Stok: ${stok}` : "Tersedia"}</span>`;

  const tombolHapus = idProduk
    ? `<button type="button" class="btn-delete-produk w-full bg-red-600 text-white py-3 rounded-2xl text-sm transition hover:bg-red-700 active:scale-95" data-id="${idProduk}">Hapus Produk</button>`
    : "";

  kartu.innerHTML = `
    <div class="relative">
      ${badgeHtml}
      <img src="${gambarSrc}" alt="${item.nama}" class="w-full h-40 object-contain rounded-3xl mb-3 bg-slate-900"/>
      <h4 class="font-semibold text-slate-100">${item.nama}</h4>
      <p class="text-sky-300 font-bold mt-1">Rp ${Number(item.harga).toLocaleString("id-ID")}</p>
    </div>
    <div class="space-y-3 mt-4">
      <button class="btn-detail w-full btn-secondary-glow text-slate-200 hover:text-white py-2 rounded-2xl text-xs font-semibold transition"
              data-nama="${item.nama}" data-gambar="${gambarSrc}" data-harga="${item.harga}" data-keterangan="${deskripsi}" data-stok="${stok}">
        🔍 Lihat Detail
      </button>
      <button ${soldOut ? "disabled class='w-full bg-slate-700 text-slate-400 py-3 rounded-2xl text-sm font-semibold'" : "class='btn-tambah-keranjang w-full btn-primary-glow text-white py-3 rounded-2xl text-sm transition active:scale-95'"} 
              data-id="${idProduk}" data-nama="${item.nama}" data-harga="${item.harga}" data-stok="${stok}">
        ${soldOut ? "Sold Out" : "Tambah ke Keranjang"}
      </button>
      ${tombolHapus}
    </div>
  `;
  return kartu;
}

// Load data dari API
async function muatProduk() {
  try {
    gridKatalog.innerHTML = "";
    const response = await apiFetch(API_URL);
    if (!response.ok) {
      throw new Error(`Gagal load API. Status: ${response.status}`);
    }

    const hasil = await response.json();
    if (hasil && hasil.data) {
      hasil.data.forEach((item) => {
        const kartu = buatKartuProduk(item);
        if (kartu) gridKatalog.appendChild(kartu);
      });
    }
  } catch (error) {
    console.error("Gagal load API:", error);
    if (pesanError) {
      pesanError.textContent = "Gagal memuat produk. Pastikan backend server berjalan.";
      pesanError.classList.remove("hidden");
    }
  }
}

muatProduk();

// Menu Mobile Toggle
if (tombolHamburger && menuMobile) {
  tombolHamburger.addEventListener("click", () => {
    menuMobile.classList.toggle("hidden");
  });
}

// Form Tambah Produk
if (formProduk) {
  formProduk.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nama = document.querySelector("#input-nama").value.trim();
    const harga = Number(document.querySelector("#input-harga").value);
    const stok = Number(document.querySelector("#input-stok").value);
    const inputFile = document.querySelector("#input-gambar");
    const gambarFile = inputFile.files[0];
    const keterangan = document.querySelector("#input-keterangan").value.trim();

    if (nama === "" || harga <= 0 || stok < 0 || !gambarFile) {
      if (pesanError) {
        pesanError.textContent = "Nama produk, harga, dan gambar wajib diisi.";
        pesanError.classList.remove("hidden");
      }
      return;
    }

    if (pesanError) pesanError.classList.add("hidden");

    try {
      const formData = new FormData();
      formData.append("nama", nama);
      formData.append("harga", harga);
      formData.append("stok", stok);
      formData.append("gambar", gambarFile);
      formData.append("keterangan", keterangan);

      const response = await apiFetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text();
      let result;
      try {
        result = responseText ? JSON.parse(responseText) : null;
      } catch (parseError) {
        throw new Error(`Gagal membaca respons server: ${responseText || "(kosong)"}`);
      }

      if (!response.ok) {
        throw new Error(result?.message || "Gagal menambahkan produk.");
      }

      formProduk.reset();
      const produkBaru = result.data;
      const kartuProduk = buatKartuProduk(produkBaru);
      if (kartuProduk) gridKatalog.appendChild(kartuProduk);
    } catch (err) {
      console.error(err);
      if (pesanError) {
        pesanError.textContent = err.message || "Terjadi kesalahan saat menambahkan produk.";
        pesanError.classList.remove("hidden");
      }
    }
  });
}

// -------------------------------------------------------------
// EVENT LISTENER KATALOG (KERANJANG & DETAIL PRODUK)
// -------------------------------------------------------------

gridKatalog.addEventListener("click", (event) => {
  // 1. Klik Tombol "Tambah ke Keranjang"
  const btnKeranjang = event.target.closest(".btn-tambah-keranjang");
  if (btnKeranjang) {
    const id = Number(btnKeranjang.dataset.id);
    const nama = btnKeranjang.dataset.nama;
    const harga = Number(btnKeranjang.dataset.harga);
    const stok = Number(btnKeranjang.dataset.stok || 0);

    if (stok <= 0) {
      alert("Produk ini sudah habis/stok kosong.");
      return;
    }

    const existing = isiKeranjang.find((item) => item.id === id);
    if (existing) {
      if (existing.jumlah >= stok) {
        alert("Stok tidak mencukupi untuk menambahkan lagi.");
        return;
      }
      existing.jumlah += 1;
    } else {
      isiKeranjang.push({ id, nama, harga, jumlah: 1, stok });
    }

    jumlahKeranjangText.textContent = isiKeranjang.reduce((sum, item) => sum + item.jumlah, 0);
    return;
  }

  // 1b. Klik Tombol "Hapus Produk"
  const btnHapus = event.target.closest(".btn-delete-produk");
  if (btnHapus) {
    const id = Number(btnHapus.dataset.id);
    if (!id) return;

    if (!confirm("Hapus produk ini dari katalog?")) return;

    apiFetch(`${API_URL}/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then((result) => {
        if (result.status === "success") {
          const kartu = btnHapus.closest(".product-card");
          if (kartu) kartu.remove();
        } else {
          alert(result.message || "Gagal menghapus produk.");
        }
      })
      .catch(() => {
        alert("Gagal menghapus produk. Coba lagi.");
      });

    return;
  }

  // 2. Klik Tombol "Lihat Detail"
  const btnDetail = event.target.closest(".btn-detail");
  if (btnDetail) {
    let nama = btnDetail.dataset.nama;
    let harga = Number(btnDetail.dataset.harga);
    let keterangan = btnDetail.dataset.keterangan;
    let gambarDetail = btnDetail.dataset.gambar;
    let stokDetail = Number(btnDetail.dataset.stok || 0);

    if (!nama || isNaN(harga)) {
      const kartu = btnDetail.closest(".product-card") || btnDetail.closest("div.bg-white");
      nama = kartu?.querySelector("h4")?.textContent.trim() || "Produk";
      harga = Number(kartu?.querySelector("p")?.textContent.replace(/[^0-9]/g, "")) || 0;
      keterangan = `Produk original ${nama} garansi resmi TokoKita.`;
    }

    gambarDetail = gambarDetail || "assets/images/product-placeholder.svg";

    // Isi data ke modal detail
    detailNama.textContent = nama;
    detailHarga.textContent = `Rp ${harga.toLocaleString("id-ID")}`;
    detailKeterangan.textContent = keterangan;
    const detailStok = document.getElementById("detail-stok");
    if (detailStok) {
      detailStok.textContent = stokDetail > 0 ? `Stok tersedia: ${stokDetail}` : "Stok: Sold Out";
    }
    if (detailGambar) {
      detailGambar.src = gambarDetail;
      detailGambar.alt = nama;
    }

    // Buka Modal Detail
    modalDetail.classList.add("modal-active");
    modalDetail.classList.remove("hidden");
  }
});

// -------------------------------------------------------------
// LOGIKA MODAL DETAIL PRODUK
// -------------------------------------------------------------
function tutupModalDetail() {
  modalDetail.classList.remove("modal-active");
  modalDetail.classList.add("hidden");
}

if (btnTutupDetail) btnTutupDetail.addEventListener("click", tutupModalDetail);
if (btnTutupDetailBawah) btnTutupDetailBawah.addEventListener("click", tutupModalDetail);

modalDetail.addEventListener("click", (e) => {
  if (e.target === modalDetail) tutupModalDetail();
});

// -------------------------------------------------------------
// LOGIKA KERANJANG & MODAL CHECKOUT
// -------------------------------------------------------------

function perbaruiModal() {
  daftarKeranjangModal.innerHTML = "";
  let total = 0;

  if (isiKeranjang.length === 0) {
    daftarKeranjangModal.innerHTML = `
      <div class="text-center py-8 text-gray-400">
        <p class="text-4xl mb-2">🛒</p>
        <p class="text-sm">Keranjang belanjaan kamu kosong.</p>
      </div>
    `;
  } else {
    isiKeranjang.forEach((item, index) => {
      total += item.harga;
      const itemRow = document.createElement("div");
      itemRow.className = "flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100";
      itemRow.innerHTML = `
        <div>
          <h5 class="font-semibold text-gray-800 text-sm">${item.nama}</h5>
          <p class="text-xs text-blue-700 font-bold">Rp ${item.harga.toLocaleString("id-ID")}</p>
        </div>
        <button onclick="hapusItem(${index})" class="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg text-xs font-semibold transition">
          🗑️ Hapus
        </button>
      `;
      daftarKeranjangModal.appendChild(itemRow);
    });
  }

  totalHargaModal.textContent = `Rp ${total.toLocaleString("id-ID")}`;
}

window.hapusItem = function (index) {
  isiKeranjang.splice(index, 1);
  jumlahKeranjangText.textContent = isiKeranjang.length;
  perbaruiModal();
};

tombolKeranjang.addEventListener("click", () => {
  perbaruiModal();
  modalKeranjang.classList.add("modal-active");
  modalKeranjang.classList.remove("hidden");
});

btnTutupModal.addEventListener("click", () => {
  modalKeranjang.classList.remove("modal-active");
  modalKeranjang.classList.add("hidden");
});

modalKeranjang.addEventListener("click", (e) => {
  if (e.target === modalKeranjang) {
    modalKeranjang.classList.remove("modal-active");
    modalKeranjang.classList.add("hidden");
  }
});

btnProsesCheckout.addEventListener("click", () => {
  if (isiKeranjang.length === 0) {
    alert("Keranjang kamu masih kosong!");
    return;
  }

  const lokasi = inputLokasiPemesanan?.value.trim();
  if (!lokasi) {
    if (pesanLokasi) pesanLokasi.classList.remove("hidden");
    return;
  }
  if (pesanLokasi) pesanLokasi.classList.add("hidden");

  alert(`🎉 Checkout Berhasil! Pesanan kamu sedang diproses ke lokasi:\n${lokasi}`);
  isiKeranjang = [];
  jumlahKeranjangText.textContent = "0";
  inputLokasiPemesanan.value = "";
  modalKeranjang.classList.remove("modal-active");
  modalKeranjang.classList.add("hidden");
});