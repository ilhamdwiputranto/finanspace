# FinanSpace 🚀

> Aplikasi pengelola keuangan pribadi dan keluarga berbasis Progressive Web App (PWA) *offline-first* yang intuitif, fleksibel, dan adaptif.

[![React](https://img.shields.io/badge/React-%2361DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-%2338BDF8.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-success?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

---

## 🌟 Tentang FinanSpace

**FinanSpace** dirancang untuk mengatasi masalah umum dalam pencatatan keuangan harian seperti alur input yang rumit, kategori bawaan yang kaku, serta kurangnya transparansi mengenai kapan target finansial nyata benar-benar bisa tercapai. Aplikasi ini dibangun dengan pendekatan *offline-first* menggunakan **Dexie.js (IndexedDB)** sehingga data Anda aman tersimpan secara lokal di perangkat Anda dan dapat diakses kapan saja tanpa koneksi internet.

---

## ✨ Fitur Utama (Core Features)

1. **🏷️ Custom Category Builder:** Kebebasan penuh untuk menambah, mengubah, atau menghapus kategori pendapatan dan pengeluaran sesuai dengan gaya hidup rumah tangga Anda.
2. **💸 Flexible Asset Transfer:** Memindahkan nominal dana secara fleksibel antar kategori anggaran maupun langsung dari kategori ke target tabungan (*goal*).
3. **🎯 Smart Goal Pace Estimator:** Kalkulator cerdas yang memproyeksikan secara realistis tanggal/waktu pencapaian target tabungan berdasarkan *pace* (kecepatan) menabung historis Anda.
4. **📱 Progressive Web App (PWA) Ready:** Dapat diinstal langsung di perangkat *mobile* maupun *desktop* layaknya aplikasi *native* dengan dukungan mode *offline*.
5. **🔒 Offline-First Architecture:** Seluruh data transaksi dan kustomisasi tersimpan aman di browser menggunakan IndexedDB.

---

## 🛠️ Tech Stack

* **Frontend:** React.js (dengan Vite)
* **Styling:** Tailwind CSS
* **State Management:** Zustand
* **Local Database:** Dexie.js (IndexedDB wrapper)
* **PWA Plugin:** `vite-plugin-pwa` / Workbox
* **Deployment:** Vercel / Netlify

---

## 🚀 Panduan Instalasi & Menjalankan Lokal

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di komputer Anda:

1. **Clone repositori ini:**
   ```bash
   git clone [https://github.com/username/finanspace.git](https://github.com/username/finanspace.git)
   cd finanspace
