FOLDER FOTO PRODUK BATIK BUJANG
================================

Taruh foto produk asli di folder ini (public/images/products/).

FORMAT YANG DIDUKUNG : .jpg  .jpeg  .png  .webp
UKURAN DISARANKAN    : rasio 4:5 (potret), lebar 800-1200 px, maks. ~500 KB per file

PENAMAAN FILE
-------------
Data awal (src/seed/products.json) menunjuk ke nama berikut. Cukup simpan foto
dengan nama persis seperti ini, lalu refresh browser:

    produk-1.jpg   -> Pucuk Rebung
    produk-2.jpg   -> Tampuk Manggis
    produk-3.jpg   -> Siku Keluang
    produk-4.jpg   -> Itik Sekawan
    produk-5.jpg   -> Lebah Bergantung
    produk-6.jpg   -> Awan Larat
    produk-7.jpg   -> Kaluk Paku
    produk-8.jpg   -> Semut Beriring

Jika ekstensi foto Anda berbeda (misalnya .png atau .webp), ubah field "image"
di src/seed/products.json lalu tekan "Reset Data ke JSON Seed Awal" di
/admin/pengaturan, ATAU ubah langsung lewat form Edit Produk di /admin/katalog.

MENAMBAH MOTIF BARU
-------------------
1. Simpan foto di folder ini, misalnya: batik-pucuk-rebung.jpg
2. Buka /admin/katalog -> Tambah Motif -> pilih "Opsi A: Path Folder"
3. Ketik: /images/products/batik-pucuk-rebung.jpg  (preview langsung tampil)

Belum ada foto? Tidak masalah. Website otomatis menampilkan ilustrasi motif emas
sebagai pengganti, tanpa ikon gambar rusak.

Catatan: Opsi B (Upload Langsung di Browser) menyimpan foto ke localStorage
browser tersebut saja, tidak ke folder ini.
