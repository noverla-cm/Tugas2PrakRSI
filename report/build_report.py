"""
Pembuat laporan Tugas 4 -> NIM_Nama.pdf

Cara pakai:
  1. pip install reportlab
  2. Simpan screenshot ke folder screenshots/ dengan nama awalan ID bukti, mis. A01.png, B03.jpg
  3. Isi KELAS dan HASIL_UJI di bawah ini (setelah semua skenario diuji)
  4. python build_report.py
Bukti yang belum ada akan tampil sebagai kotak "BELUM ADA" sehingga mudah dilacak.
"""
import os, glob
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                PageBreak, Image, KeepTogether, Flowable)

# ====================== ISI BAGIAN INI ======================
NAMA = "Noverla Caesarlia Mullatwati"
NIM = "L0225054"
KELAS = "[ISI KELAS]"
REPO_URL = "https://github.com/noverla-cm/Tugas2PrakRSI"
FRONTEND = "React 18 + TypeScript (Vite), React Router, Axios"
METODE = "Axios"

# Isi dengan "Berhasil" / "Gagal" setelah menguji. Default: "Belum diuji".
HASIL_UJI = {i: "Belum diuji" for i in range(1, 13)}
# ============================================================

OUT = f"{NIM}_{NAMA.replace(' ', '_')}.pdf"
SHOTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "screenshots")

# --- Font (DejaVu bila ada, jika tidak Helvetica) ---
FONT, FONT_B = "Helvetica", "Helvetica-Bold"
for reg, bold in [("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
                  ("C:/Windows/Fonts/arial.ttf", "C:/Windows/Fonts/arialbd.ttf")]:
    if os.path.exists(reg) and os.path.exists(bold):
        pdfmetrics.registerFont(TTFont("Body", reg)); pdfmetrics.registerFont(TTFont("Body-B", bold))
        FONT, FONT_B = "Body", "Body-B"
        break

LEAF = colors.HexColor("#1F4D3A")
body = ParagraphStyle("body", fontName=FONT, fontSize=10, leading=14.5, alignment=TA_JUSTIFY, spaceAfter=6)
small = ParagraphStyle("small", parent=body, fontSize=8.5, leading=11, alignment=0, textColor=colors.HexColor("#444444"))
cell = ParagraphStyle("cell", parent=body, fontSize=9, leading=12, alignment=0, spaceAfter=0)
h1 = ParagraphStyle("h1", fontName=FONT_B, fontSize=15, leading=19, textColor=LEAF, spaceBefore=10, spaceAfter=8)
h2 = ParagraphStyle("h2", fontName=FONT_B, fontSize=11.5, leading=15, textColor=LEAF, spaceBefore=8, spaceAfter=4)
title = ParagraphStyle("title", fontName=FONT_B, fontSize=19, leading=24, textColor=LEAF, spaceAfter=4)
cap = ParagraphStyle("cap", parent=small, fontName=FONT, alignment=1, spaceBefore=3, spaceAfter=10)

def esc(t): return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

class Missing(Flowable):
    def __init__(self, ident, hint, w=15.4 * cm, h=4.2 * cm):
        super().__init__(); self.ident, self.hint, self.width, self.height = ident, hint, w, h
    def wrap(self, aw, ah): return self.width, self.height
    def draw(self):
        c = self.canv; c.setDash(4, 3); c.setStrokeColor(colors.HexColor("#C8321E")); c.setFillColor(colors.HexColor("#FDF1EF"))
        c.rect(0, 0, self.width, self.height, fill=1, stroke=1); c.setDash()
        c.setFillColor(colors.HexColor("#C8321E")); c.setFont(FONT_B, 10)
        c.drawCentredString(self.width / 2, self.height / 2 + 6, f"BELUM ADA: simpan sebagai screenshots/{self.ident}.png")
        c.setFont(FONT, 8.5); c.setFillColor(colors.HexColor("#555555"))
        c.drawCentredString(self.width / 2, self.height / 2 - 8, self.hint[:110])

def shot(ident, caption, hint):
    files = sorted(glob.glob(os.path.join(SHOTS, ident + ".*")))
    files = [f for f in files if f.lower().endswith((".png", ".jpg", ".jpeg"))]
    cp = Paragraph(f"<b>Gambar {ident}.</b> {esc(caption)}", cap)
    if not files:
        return KeepTogether([Missing(ident, hint), cp])
    iw, ih = ImageReader(files[0]).getSize()
    mw, mh = 15.4 * cm, 9.5 * cm
    s = min(mw / iw, mh / ih)
    img = Image(files[0], width=iw * s, height=ih * s)
    img.hAlign = "CENTER"
    t = Table([[img]], colWidths=[15.6 * cm]); t.setStyle(TableStyle([("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#BBBBBB")), ("ALIGN", (0, 0), (-1, -1), "CENTER")]))
    return KeepTogether([t, cp])

story = []
P = lambda t, s=body: story.append(Paragraph(t, s))

# ---------------- Judul ----------------
P("Laporan Tugas 4", title)
P("Frontend React dan Integrasi Backend, Sistem Review Kantin", ParagraphStyle("sub", parent=body, fontSize=12, alignment=0, textColor=colors.HexColor("#333333")))
story.append(Spacer(1, 6))

# ---------------- 1. Identitas ----------------
P("1. Identitas", h1)
rows = [["Nama", NAMA], ["NIM", NIM], ["Kelas", KELAS], ["URL repository GitHub", REPO_URL],
        ["Teknologi frontend", FRONTEND], ["Metode integrasi", f"{METODE} (dipakai konsisten untuk seluruh komunikasi HTTP)"]]
t = Table([[Paragraph(f"<b>{esc(a)}</b>", cell), Paragraph(esc(b), cell)] for a, b in rows], colWidths=[4.6 * cm, 11.8 * cm])
t.setStyle(TableStyle([("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CCCCCC")), ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#E8F0EA")),
                       ("VALIGN", (0, 0), (-1, -1), "TOP"), ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5)]))
story.append(t)
P("Frontend berada di folder <b>frontend/</b> pada repository yang sama dengan backend (Tugas 2 dan 3). Backend memakai Express.js dengan database SQL Server <i>review_kantin</i>.", ParagraphStyle("n", parent=body, spaceBefore=8))

# ---------------- 2. Bukti implementasi ----------------
story.append(PageBreak())
P("2. Bukti Implementasi", h1)
A = [
 ("A01", "Halaman daftar warung yang menampilkan data dari backend (GET /api/v1/stalls).", "Halaman utama dengan kartu warung, kolom cari/filter, dan pagination"),
 ("A02", "Halaman detail warung berdasarkan ID.", "Buka salah satu warung, tampilkan URL /stalls/:id"),
 ("A03", "Form tambah warung (login sebagai Admin atau Owner).", "Halaman /stalls/new"),
 ("A04", "Form ubah warung dengan data terisi dari backend.", "Halaman /stalls/:id/edit"),
 ("A05", "Hasil operasi tambah: warung baru muncul di daftar.", "Daftar/detail setelah POST berhasil, lengkap dengan notifikasi sukses"),
 ("A06", "Hasil operasi ubah: data warung berubah pada detail.", "Detail setelah PUT berhasil"),
 ("A07", "Hasil operasi hapus: dialog konfirmasi dan warung hilang dari daftar.", "Dialog hapus lalu daftar setelah DELETE"),
 ("A08", "Halaman registrasi.", "Form /register"),
 ("A09", "Halaman login.", "Form /login"),
 ("A10", "Informasi pengguna yang sedang login (GET /api/v1/auth/me).", "Halaman /profile menampilkan nama, email, peran"),
 ("A11", "Tampilan pengelolaan warung untuk role Admin (tombol Ubah dan Hapus tersedia).", "Daftar warung saat login Admin"),
 ("A12", "Tampilan pengelolaan warung untuk role Owner (Tambah, dan Ubah hanya pada warung miliknya).", "Daftar warung saat login Owner"),
 ("A13", "Tampilan untuk role Customer dan pengunjung Public (hanya melihat).", "Daftar warung tanpa tombol kelola"),
 ("A14", "Loading state saat data dimuat.", "Indikator 'Memuat daftar warung' (throttling Slow 3G di DevTools membantu)"),
 ("A15", "Empty state saat pencarian tidak menemukan hasil.", "Cari kata yang tidak ada"),
 ("A16", "Error state saat request gagal.", "Matikan backend lalu muat ulang halaman"),
]
for i, c, h in A: story.append(shot(i, c, h))

# ---------------- 3. Bukti integrasi & pengujian ----------------
story.append(PageBreak())
P("3. Bukti Integrasi dan Pengujian", h1)
P("Pengujian dilakukan manual pada aplikasi yang berjalan, dengan backend dan database SQL Server aktif. Bukti request diambil dari tab Network pada browser (DevTools). Untuk menguji respons 403, frontend dijalankan dengan <i>VITE_PERMISSION_TEST_MODE=true</i> sehingga tombol Ubah dan Hapus tampil untuk semua pengguna yang login dan keputusan akhir tetap diambil backend.")
P("3.1 Hasil pengujian skenario", h2)
TESTS = [
 "Daftar warung berhasil ditampilkan dari backend.",
 "Detail warung berhasil ditampilkan.",
 "Admin berhasil menambah, mengubah, dan menghapus warung sesuai hak akses.",
 "Owner dapat membuat warung dan mengubah warung miliknya sesuai aturan backend.",
 "Owner tidak dapat mengubah warung milik owner lain.",
 "Owner tidak dapat menghapus warung bila backend hanya mengizinkan admin.",
 "Registrasi dan login berhasil dilakukan.",
 "Informasi pengguna yang login dapat diperoleh melalui GET /auth/me.",
 "Pengguna yang belum login ditangani dengan sesuai saat mengakses fitur terlindungi (dialihkan ke login).",
 "Respons 401 dan 403 ditangani sesuai kondisi autentikasi dan otorisasi.",
 "Loading, empty state, dan error state dapat ditunjukkan.",
 "Request benar-benar diproses backend: perubahan tersimpan di database SQL Server.",
]
data = [[Paragraph("<b>No</b>", cell), Paragraph("<b>Skenario</b>", cell), Paragraph("<b>Hasil</b>", cell)]]
for n, s in enumerate(TESTS, 1): data.append([Paragraph(str(n), cell), Paragraph(esc(s), cell), Paragraph(esc(HASIL_UJI.get(n, "Belum diuji")), cell)])
t = Table(data, colWidths=[1.1 * cm, 11.9 * cm, 3.4 * cm], repeatRows=1)
t.setStyle(TableStyle([("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CCCCCC")), ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E8F0EA")),
                       ("VALIGN", (0, 0), (-1, -1), "TOP"), ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4)]))
story.append(t)
P("3.2 Bukti request ke backend dan hak akses", h2)
B = [
 ("B01", "GET /api/v1/stalls: daftar warung (status 200) dengan parameter page, limit, search.", "DevTools > Network > klik request /api/v1/stalls, tampilkan Headers dan Response"),
 ("B02", "GET /api/v1/stalls/:id: detail warung (status 200).", "DevTools > Network"),
 ("B03", "POST /api/v1/stalls: tambah warung (status 201) dengan header Authorization: Bearer.", "DevTools > Network, tampilkan Request Headers dan Payload"),
 ("B04", "PUT /api/v1/stalls/:id: ubah warung (status 200).", "DevTools > Network"),
 ("B05", "DELETE /api/v1/stalls/:id: hapus warung oleh Admin (status 200).", "DevTools > Network"),
 ("B06", "POST /api/v1/auth/register, POST /api/v1/auth/login, dan GET /api/v1/auth/me berhasil.", "DevTools > Network, tiga request dalam satu gambar bila muat"),
 ("B07", "Owner mengubah warung milik owner lain: ditolak backend (403) dan UI menampilkan pesan.", "Mode uji aktif; tampilkan response 403 dan pesan di layar"),
 ("B08", "Owner menghapus warung: ditolak backend (403).", "Mode uji aktif"),
 ("B09", "Akses tanpa login ke halaman terlindungi dialihkan ke login; respons 401 pada request tanpa token.", "Buka /stalls/new tanpa login, atau 401 pada Network"),
 ("B10", "Bukti data tersimpan di database: hasil SELECT pada tabel STALLS di SSMS sebelum dan sesudah operasi.", "SSMS: SELECT * FROM dbo.STALLS ORDER BY id DESC"),
]
for i, c, h in B: story.append(shot(i, c, h))

# ---------------- 4. Refleksi ----------------
story.append(PageBreak())
P("4. Refleksi", h1)
REFLEKSI = [
 ("4.1 Kendala selama integrasi",
  "Kendala pertama adalah perbedaan alamat endpoint: pada soal endpoint ditulis /stalls dan /auth/login, sedangkan backend menyediakannya di bawah prefix /api/v1. Kedua, frontend (localhost:5173) dan backend (localhost:3000) berjalan di origin berbeda sehingga browser dapat memblokir request karena CORS, sementara backend belum memakai middleware cors. Ketiga, aturan backend berbeda dari asumsi awal formulir: registrasi hanya menerima nama, email, dan password (role selalu customer), password minimal 8 karakter, dan pemilik warung ditentukan backend dari token JWT, bukan dari body. Keempat, akun pada data awal (admin dan owner) memakai hash password palsu sehingga tidak bisa login, padahal pengujian hak akses membutuhkan akun admin dan owner. Kelima, untuk menguji respons 403 diperlukan request terlarang, padahal antarmuka sudah menyembunyikan tombol yang tidak boleh dipakai. Keenam, setelah menghapus data terakhir pada sebuah halaman pagination, daftar menjadi kosong padahal halaman sebelumnya masih berisi data."),
 ("4.2 Solusi yang digunakan",
  "Prefix endpoint diatur di satu tempat, yaitu baseURL instance Axios (VITE_API_BASE_URL, default /api/v1), sehingga seluruh service cukup memanggil /stalls dan /auth/... CORS diatasi dengan proxy pada server Vite yang meneruskan /api ke backend, sehingga browser hanya berkomunikasi dengan origin frontend. Formulir registrasi disesuaikan dengan skema backend (tanpa pilihan role, validasi nama minimal 3 dan password minimal 8 karakter), dan formulir warung tidak lagi mengirim ownerId. Untuk akun uji dibuat skrip npm run seed:passwords yang mengganti hash palsu dengan hash bcrypt dari satu password uji. Untuk pengujian 403 disediakan mode uji lewat variabel lingkungan yang menampilkan tombol Ubah dan Hapus bagi semua pengguna login, sedangkan keputusan akhir tetap di backend. Masalah pagination diatasi dengan mundur satu halaman ketika item terakhir pada halaman itu dihapus."),
 ("4.3 Alasan memilih Axios",
  "Axios dipilih karena mendukung instance dengan baseURL dan interceptor. Interceptor request menyisipkan header Authorization (JWT) secara otomatis, dan interceptor response menangani 401 di satu tempat. Axios juga mengurai JSON otomatis, melempar error untuk status non-2xx sehingga mudah ditangkap, dan menyusun query parameter melalui opsi params. Hasilnya kode request lebih ringkas dan konsisten dibanding menulis ulang pengaturan header dan pengecekan status pada setiap pemanggilan Fetch."),
 ("4.4 Penanganan validasi dan error dari backend",
  "Validasi dilakukan dua lapis. Di sisi klien, form memeriksa isian wajib, panjang maksimum, format email, dan kecocokan password sebelum request dikirim. Di sisi server, semua error dari Axios diubah menjadi satu bentuk ApiError yang berisi status HTTP, pesan dari backend, dan pesan per field bila tersedia. Pesan field ditampilkan di bawah input terkait, sedangkan pesan umum tampil sebagai banner. Kegagalan jaringan memiliki pesan tersendiri, dan status 404, 403, 401, serta 5xx masing-masing memiliki penanganan dan teks yang jelas."),
 ("4.5 Penanganan autentikasi dan otorisasi",
  "Setelah login, token JWT disimpan di localStorage dan dikirim lewat header Authorization: Bearer pada setiap request. Saat aplikasi dibuka kembali, token divalidasi dengan GET /auth/me untuk memulihkan sesi. Tampilan menyesuaikan role: halaman tambah dan ubah dibungkus ProtectedRoute berdasarkan role, tombol Ubah hanya muncul untuk admin atau pemilik warung, dan tombol Hapus hanya untuk admin. Pengguna yang belum login dialihkan ke halaman login. Frontend tidak dijadikan satu-satunya penjaga: backend tetap memutuskan akses, dan respons 403 ditampilkan sebagai pesan penolakan, sedangkan 401 menghapus token dan meminta login ulang."),
]
for h, tx in REFLEKSI:
    P(h, h2); P(esc(tx))

def footer(c, d):
    c.saveState(); c.setFont(FONT, 8); c.setFillColor(colors.HexColor("#777777"))
    c.drawString(2.2 * cm, 1.2 * cm, f"{NIM} - {NAMA} - Tugas 4 Praktikum RSI"); c.drawRightString(A4[0] - 2.2 * cm, 1.2 * cm, f"Halaman {d.page}")
    c.restoreState()

doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=2.2 * cm, rightMargin=2.2 * cm, topMargin=2.0 * cm, bottomMargin=2.0 * cm,
                        title=f"Laporan Tugas 4 - {NIM}", author=NAMA)
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print("Dibuat:", OUT)
