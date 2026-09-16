import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
ShieldAlert, BookOpen, Clock, UserCheck, FileText, AlertTriangle, 
Activity, CheckCircle, HelpCircle, ChevronDown, ChevronUp, Edit3, 
Save, PlusCircle, Trash2, Loader2, Search, History, Users, 
Image as ImageIcon, Upload, Printer, Download, Database, Settings2, 
Award, Lock, Unlock, Camera, EyeOff, User, Shield, Briefcase, 
Flame, Scale, Info, AlertCircle, Cloud, CloudDownload, CloudUpload, X,
Play, Sparkles, Compass
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, addDoc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-adrenalin-app';

const INITIAL_DASHBOARD_PESERTA = {
title: "Selamat Datang, Peserta Adrenalin 2026!",
desc: "Portal ini adalah pusat informasi mengenai aturan atribut, tata sikap, dan sistem penilaian (poin) selama kegiatan penerimaan mahasiswa baru Adrenalin Fakultas Kedokteran UNWAHAS.",
cards: [
{ title: "Total Poin Maksimal", value: "55", sub: "Adrenalin + Pemantauan 1 Tahun" },
{ title: "Batas Pertimbangan", value: "45 - 55", sub: "Zona waspada kelulusan" },
{ title: "Target Aman", value: "< 45", sub: "Peserta dinyatakan Lulus" }
]
};

const INITIAL_ATURAN_PESERTA = [
{
title: "Aturan Atribut",
icon: 'user',
items: [
"Kemeja putih polos berlengan panjang dengan kerah, berpakaian formal, rapi, dan dimasukkan.",
"Laki-laki: Celana kain hitam (bukan pensil). Perempuan: Rok hitam panjang (minimal hingga mata kaki), A-line, tidak ketat, tanpa belahan.",
"Ikat pinggang warna hitam (wajib).",
"Mahasiswi muslimah wajib hijab segi empat putih polos (dikencangkan dengan jarum/peniti). Mahasiswi non-muslim rambut diikat rapi.",
"Mahasiswa laki-laki rambut rapi, panjang tidak melebihi telinga (ukuran 3-2-1), dan tidak diwarnai.",
"Name tag (nama lengkap & NIM) wajib dikenakan.",
"Dilarang: Aksesoris (laki-laki), bulu mata palsu/eyelash extension, nail art/kuku panjang/berwarna, make up berlebihan.",
"Dilarang mengenakan hoodie, topi, cardigan, jaket/outer selama pakai atribut resmi (kecuali sakit dengan izin).",
"Kaos kaki putih polos, panjang minimal 15 cm di atas mata kaki, tanpa motif.",
"Sepatu pantofel hitam polos. Mahasiswi: tinggi hak maksimal 3 cm.",
"Jas laboratorium hanya di dalam ruang lab."
]
},
{
title: "Tata Sikap & Etika",
icon: 'book',
items: [
"Mematuhi seluruh ketentuan selama berseragam hitam putih.",
"Dilarang mengenakan pakaian transparan.",
"Dilarang keras merokok di dalam/luar area kampus selama berseragam.",
"Menjaga ketertiban, adab, dan menggunakan bahasa yang santun (volume dijaga).",
"Bersikap ramah & sopan kepada civitas akademika, sesama mahasiswa, dan alumni.",
"Dilarang membenahi hijab di tempat umum (hanya diperbolehkan di kamar mandi dengan pintu tertutup).",
"Format Komunikasi: Regio, Nama Anatomi, Nama Lengkap, dan NIM.",
"Etika menghubungi civitas wajib mengikuti panduan tim pendamping prodi (pendpro).",
"Dilarang membuat kegaduhan, aksi provokatif, tertawa berlebihan, atau berkelahi."
]
},
{
title: "Ketepatan Waktu & Keberlangsungan",
icon: 'clock',
items: [
"Wajib datang tepat waktu. Regio baru boleh ikut kegiatan jika anggota lengkap.",
"Toleransi keterlambatan hanya untuk alasan masuk akal/musibah (dengan bukti & izin).",
"Saat acara Adrenalin hanya diperbolehkan membawa kendaraan beroda 2 (sepeda motor/sepeda). Jika membawa sepeda motor wajib menggunakan helm.",
"Peserta memasuki kampus melalui gerbang utama Fakultas Kedokteran UNWAHAS.",
"Wajib menjaga kebersihan lingkungan.",
"Dilarang ke toilet saat materi berlangsung.",
"Dilarang tidur/tertidur selama acara.",
"Wajib aktif bertanya/berpendapat dan mencatat poin penting."
]
},
{
title: "Kelengkapan Tugas",
icon: 'file',
items: [
"Mengumpulkan tugas sesuai deadline dengan lengkap.",
"Tugas wajib dibawa saat berangkat ke kampus.",
"Penugasan dikerjakan secara mandiri tanpa dibantu siapapun (dilarang menggunakan joki)."
]
}
];

const INITIAL_PELANGGARAN_PESERTA = [
{
kategori: "Ringan",
poin: 2,
color: "bg-yellow-50 text-yellow-900 border-yellow-300",
iconColor: "text-yellow-600",
items: [
"Atribut tidak lengkap / tidak sesuai (Dihitung per atribut)",
"Menggunakan eyelash, nail art, atau make up berlebihan",
"Ukuran rambut di luar 3-2-1",
"Terlambat kurang dari 30 menit",
"Tugas tidak sesuai ketentuan atau selesai di atas 50%",
"Tidak menggunakan bahasa Indonesia yang baik & sopan",
"Tidak menjaga kebersihan",
"Tidak menggunakan helm saat membawa sepeda motor"
]
},
{
kategori: "Sedang",
poin: 5,
color: "bg-orange-50 text-orange-900 border-orange-300",
iconColor: "text-orange-600",
items: [
"Tidak membawa atribut sama sekali",
"Terlambat 30 - 60 menit",
"Revisi tugas tapi masih tidak lengkap / tidak selesai",
"Menggunakan kata-kata kasar kepada sesama peserta",
"Tidur selama acara berlangsung",
"Membuat kegaduhan"
]
},
{
kategori: "Berat",
poin: 15,
color: "bg-red-50 text-red-900 border-red-300",
iconColor: "text-red-600",
items: [
"Terlambat lebih dari 60 menit (hingga > 2 jam)",
"Tidak membawa atau tidak mengerjakan tugas sama sekali (Di bawah 50%)",
"Berbuat kecurangan (Contoh: Joki Tugas)",
"Menggunakan kata-kata kasar kepada Panitia"
]
}
];

const PANITIA_RULES_DATA = [
// A. RAPAT
{ id: 'A1', type: 'rapat', text: 'Panitia wajib menjaga kesopanan dan etika selama masa kepanitiaan berlangsung.', penalty: 'Didiskusikan dengan OC', penaltyType: 'discuss', basisType: 'perak', basisLabel: 'PERAK FK 2020: Pasal 26', basisDetail: 'Selaras dengan larangan pelanggaran akademik berupa penghinaan martabat sesama sivitas.' },
{ id: 'A2', type: 'rapat', text: 'Dilarang terlambat dalam seluruh rangkaian (volume 60%). Toleransi 6 menit, izin maksimal 2x via Komdis.', penalty: 'Denda Rp10.000', penaltyType: 'fine', basisType: 'perak', basisLabel: 'PERAK FK 2020: Pasal 15', basisDetail: 'Kepatuhan terhadap kedisiplinan kehadiran minimal 75-80%.' },
{ id: 'A3', type: 'rapat', text: 'Tidak berangkat tanpa alasan.', penalty: 'Denda Rp20.000', penaltyType: 'fine', basisType: 'perak', basisLabel: 'PERAK FK 2020: Pasal 9', basisDetail: 'Alasan ketidakhadiran dibatasi pada sakit, kemalangan keluarga, pernikahan, atau tugas resmi.' },
{ id: 'A4', type: 'rapat', text: 'Pakaian sopan, bersepatu, tidak jeans, perempuan berhijab harus rapi (jarum pentul).', penalty: 'Denda Rp10.000', penaltyType: 'fine', basisType: 'perak', basisLabel: 'PERAK FK 2020: Pasal 30', basisDetail: 'Kewajiban berpakaian kemeja/kain bagi mahasiswa.' },
{ id: 'A5', type: 'rapat', text: 'Penggunaan HP saat rapat hanya diperbolehkan jika ada urusan mendesak (urgent) dan wajib mendapatkan izin terlebih dahulu dari Komdis.', penalty: 'Didiskusikan dengan OC', penaltyType: 'discuss', basisType: 'perak', basisLabel: 'PERAK FK 2020: Pasal 8', basisDetail: 'Mendorong tanggung jawab mahasiswa untuk tetap fokus menghargai forum rapat, namun memberikan dispensasi rasional untuk urgensi terkonfirmasi.' },
{ id: 'A6', type: 'rapat', text: 'Keputusan bersama sah apabila mendapat suara 50% + 1.', penalty: '-', penaltyType: 'none', basisType: 'otonom', basisLabel: 'Aturan Internal', basisDetail: 'Sistem demokrasi kepanitiaan.' },
{ id: 'A7', type: 'rapat', text: 'Izin keluar rapat 5-10 menit. Lebih dari itu wajib konfirmasi.', penalty: 'Denda Rp1.000/menit', penaltyType: 'fine', basisType: 'otonom', basisLabel: 'Aturan Internal', basisDetail: 'Kedisiplinan forum.' },
{ id: 'A8', type: 'rapat', text: 'Wajib join zoom maksimal 10 menit sebelum rapat dimulai.', penalty: 'Denda Rp1.000/menit', penaltyType: 'fine', basisType: 'otonom', basisLabel: 'Aturan Internal', basisDetail: 'Disiplin waktu digital.' },
{ id: 'A9', type: 'rapat', text: 'Kendala rapat online wajib konfirmasi ke Komdis maksimal 5 menit setelah join.', penalty: 'Didiskusikan dengan OC', penaltyType: 'discuss', basisType: 'perak', basisLabel: 'PERAK FK 2020: Pasal 9', basisDetail: 'Prosedur izin formal.' },
{ id: 'A10', type: 'rapat', text: 'Izin minimal 4-5 jam sebelum rapat (via Kadiv-Komdis-OC).', penalty: 'Didiskusikan dengan OC', penaltyType: 'discuss', basisType: 'perak', basisLabel: 'PERAK FK 2020: Pasal 9', basisDetail: 'Etika pengajuan izin.' },
{ id: 'A11', type: 'rapat', text: 'Dilarang membawa ataupun menggunakan rokok/vape di area kampus selama rapat berlangsung.', penalty: 'Denda Rp200.000', penaltyType: 'heavy-fine', basisType: 'ktr', basisLabel: 'Peraturan Rektor No. 10/2025', basisDetail: 'Sesuai Pasal 5 Kawasan Tanpa Rokok (KTR) Universitas.' },

// B. HARI H
{ id: 'B1', type: 'hari-h', text: 'Pada saat hari H, HP wajib mematikan nada dering namun mode getar harus tetap dinyalakan (tidak boleh mengaktifkan DND/senyap total agar koordinasi mendesak via telepon tetap terasa).', penalty: 'Didiskusikan dengan OC', penaltyType: 'discuss', basisType: 'otonom', basisLabel: 'Aturan Internal', basisDetail: 'Menjaga kesakralan jalannya acara tanpa menghambat jalur komunikasi darurat antarpanitia.' },
{ id: 'B2', type: 'hari-h', text: 'Panitia dilarang meninggalkan kampus kecuali izin OC & Komdis.', penalty: 'Denda Rp300.000', penaltyType: 'heavy-fine', basisType: 'otonom', basisLabel: 'Aturan Internal', basisDetail: 'Kewajiban siaga personel di tempat, karena meninggalkan area tanpa izin berpotensi menghambat kelancaran acara.' },
{ id: 'B3', type: 'hari-h', text: 'Datang 60 menit sebelum acara.', penalty: 'Didiskusikan dengan OC', penaltyType: 'discuss', basisType: 'otonom', basisLabel: 'Aturan Internal', basisDetail: 'Briefing persiapan operasional sebelum acara dimulai.' },
{ id: 'B4', type: 'hari-h', text: 'Panitia dilarang bergerombol lebih dari 3 orang di depan peserta.', penalty: 'Didiskusikan dengan OC', penaltyType: 'discuss', basisType: 'otonom', basisLabel: 'Aturan Internal', basisDetail: 'Menjaga wibawa dan kesantunan panitia.' },
{ id: 'B5', type: 'hari-h', text: 'Panitia wajib bersikap tegas dan berwibawa.', penalty: '-', penaltyType: 'none', basisType: 'perak', basisLabel: 'PERAK FK 2020: Pasal 2', basisDetail: 'Profil lulusan dokter yang tangguh dan berwibawa.' },
{ id: 'B6', type: 'hari-h', text: 'Dilarang membocorkan info rahasia ke non-panitia maupun peserta.', penalty: 'Denda Rp500.000', penaltyType: 'heavy-fine', basisType: 'otonom', basisLabel: 'Aturan Internal', basisDetail: 'Integritas tingkat tinggi dan sumpah kerahasiaan tugas.' },
{ id: 'B7', type: 'hari-h', text: 'Pakaian hari ketiga bisa celana bahan, rok, atau kulot hitam (cewek).', penalty: 'Didiskusikan dengan OC', penaltyType: 'discuss', basisType: 'perak', basisLabel: 'PERAK FK 2020: Pasal 30', basisDetail: 'Diperbolehkan memakai celana kulot panjang berbahan kain.' },
{ id: 'B8', type: 'hari-h', text: 'Memakai bahasa yang sopan dan tidak kasar.', penalty: 'Didiskusikan dengan OC', penaltyType: 'discuss', basisType: 'perak', basisLabel: 'PERAK FK 2020: Pasal 26', basisDetail: 'Larangan melontarkan perkataan kasar/merendahkan.' },
{ id: 'B9', type: 'hari-h', text: 'Ketentuan DC: Cewe (kemeja, jas almet, dilarang rok span/knit ketat, sepatu, dilarang eyelash & nail art). Cowo (kemeja, celana non jeans tidak ketat, bersepatu, perhiasan hanya jam tangan).', penalty: 'Didiskusikan dengan OC', penaltyType: 'discuss', basisType: 'perak', basisLabel: 'PERAK FK 2020: Pasal 30', basisDetail: 'Pakaian wajib tidak ketat, tidak memperlihatkan lekuk tubuh, dan dilarang bersolek berlebih.' },
{ id: 'B10', type: 'hari-h', text: 'Wajib menggunakan Helm bagi yang berkendara motor (sejak pembekalan s.d kegiatan selesai).', penalty: 'Denda Rp50.000', penaltyType: 'fine', basisType: 'otonom', basisLabel: 'Aturan Internal', basisDetail: 'Regulasi keselamatan berlalu lintas di area kampus.' },
{ id: 'B11', type: 'hari-h', text: 'Dilarang membawa/menggunakan rokok/vape di area kampus (termasuk area tersembunyi).', penalty: 'Denda Rp200.000', penaltyType: 'heavy-fine', basisType: 'ktr', basisLabel: 'Peraturan Rektor No. 10/2025', basisDetail: 'Sesuai Pasal 5 KTR Universitas.' },
{ id: 'B12', type: 'hari-h', text: 'Panitia dilarang mendokumentasikan peserta untuk kepentingan konten pribadi.', penalty: 'Denda Rp75.000', penaltyType: 'fine', basisType: 'otonom', basisLabel: 'Aturan Internal', basisDetail: 'Menjaga privasi peserta sesuai standar etika.' },
{ id: 'B13', type: 'hari-h', text: 'Ketentuan rambut panitia cowo: rapi, tidak panjang, tidak menyentuh telinga.', penalty: 'Didiskusikan dengan OC', penaltyType: 'discuss', basisType: 'perak', basisLabel: 'PERAK FK 2020: Pasal 30', basisDetail: 'Aturan baku mahasiswa wajib berambut pendek.' },
{ id: 'B14', type: 'hari-h', text: 'Dilarang menggunakan make up berlebihan.', penalty: 'Didiskusikan dengan OC', penaltyType: 'discuss', basisType: 'perak', basisLabel: 'PERAK FK 2020: Pasal 30', basisDetail: 'Larangan bersolek berlebihan di area kampus.' },
{ id: 'B15', type: 'hari-h', text: 'Panitia yang tidak bertugas dilarang mengganggu panitia yang sedang bertugas.', penalty: 'Didiskusikan dengan OC', penaltyType: 'discuss', basisType: 'perak', basisLabel: 'Aturan Internal', basisDetail: 'Fokus dan kelancaran alur operasional kerja.' },
{ id: 'B16', type: 'hari-h', text: 'Panitia pengawas dilarang meninggalkan tugas atau berada di ruang transit.', penalty: 'Didiskusikan dengan OC', penaltyType: 'discuss', basisType: 'otonom', basisLabel: 'Aturan Internal', basisDetail: 'Disiplin tugas pokok divisi pengawasan.' },
{ id: 'B17', type: 'hari-h', text: 'Selain panitia resmi, dilarang ikut mengatur instruksi. Pengawas hanya memantau.', penalty: 'Dikeluarkan dari forum', penaltyType: 'heavy-fine', basisType: 'otonom', basisLabel: 'Aturan Internal', basisDetail: 'Ketertiban alur komando lapangan.' },
];

const STATIC_VIOLATION_RULES = [
{ id: 'AT1', category: 'ATRIBUT', name: 'Atribut tidak lengkap / tidak sesuai', type: 'Ringan', points: 2 },
{ id: 'AT2', category: 'ATRIBUT', name: 'Menggunakan eyelash dan memakai nail art', type: 'Ringan', points: 2 },
{ id: 'AT3', category: 'ATRIBUT', name: 'Ukuran rambut diluar 3-2-1', type: 'Ringan', points: 2 },
{ id: 'AT4', category: 'ATRIBUT', name: 'Tidak Membawa Atribut', type: 'Sedang', points: 5 },
{ id: 'WK1', category: 'WAKTU', name: 'Terlambat 5-30 menit', type: 'Ringan', points: 2 },
{ id: 'WK2', category: 'WAKTU', name: 'Terlambat 30-60 menit', type: 'Sedang', points: 5 },
{ id: 'WK3', category: 'WAKTU', name: 'Terlambat 60-120 menit', type: 'Berat', points: 15 },
{ id: 'TG1', category: 'TUGAS', name: 'Tugas tidak sesuai ketentuan / selesai diatas 50%', type: 'Ringan', points: 2 },
{ id: 'TG2', category: 'TUGAS', name: 'Revisi tapi masih tidak lengkap atau tidak selesai', type: 'Sedang', points: 5 },
{ id: 'TG3', category: 'TUGAS', name: 'Tidak membawa/mengerjakan tugas sama sekali (<50%)', type: 'Berat', points: 15 },
{ id: 'TG4', category: 'TUGAS', name: 'Berbuat kecurangan (Ex. Joki tugas)', type: 'Berat', points: 15 },
{ id: 'S1', category: 'ATTITUDE', name: 'Tidak menggunakan bahasa Indonesia yang baik dan sopan', type: 'Ringan', points: 2 },
{ id: 'S2', category: 'ATTITUDE', name: 'Menggunakan kata-kata kasar (Peserta)', type: 'Sedang', points: 5 },
{ id: 'S3', category: 'ATTITUDE', name: 'Menggunakan kata-kata kasar (Panitia)', type: 'Berat', points: 15 },
{ id: 'AC1', category: 'ACARA', name: 'Tidak menjaga kebersihan', type: 'Ringan', points: 2 },
{ id: 'AC2', category: 'ACARA', name: 'Tidur selama acara berlangsung', type: 'Sedang', points: 5 },
{ id: 'AC3', category: 'ACARA', name: 'Membuat kegaduhan', type: 'Sedang', points: 5 },
];

// DAFTAR LENGKAP 151 PESERTA MAHASISWA BARU ADRENALIN 2026
const INITIAL_STUDENTS = [
{ nim: "26109011001", name: "BELLATRIX DWI HARIONO" },
{ nim: "26109011002", name: "NAILASANY KHEISA ANIQOFATHIN" },
{ nim: "26109011003", name: "IFTAH AULIA" },
{ nim: "26109011005", name: "MAILA HANA ADIYA PUTRI" },
{ nim: "26109011006", name: "FAVIAN RASENDRIYA RIYADI" },
{ nim: "26109011007", name: "ZAMZAMNIA PERMATA SOFA" },
{ nim: "26109011008", name: "SAFRINA AMALIA" },
{ nim: "26109011009", name: "RAFA DWISA DIAKHYAR" },
{ nim: "26109011010", name: "KHOIRUN NISA" },
{ nim: "26109011011", name: "AWANG PUDYASTUNGGORO" },
{ nim: "26109011013", name: "ALBIR FAYRUZA NAJIHA" },
{ nim: "26109011015", name: "NADHIF CANDRA ARDITYA WINDYSANDI" },
{ nim: "26109011016", name: "EVELYNA JIHAN HANIFAH" },
{ nim: "26109011017", name: "AHMAD ZEN ALAM SYAH" },
{ nim: "26109011018", name: "MIFTAH AYU NINGTYAS RONO WIJOYO" },
{ nim: "26109011019", name: "MUHAMMAD IHWAN AL AMIN" },
{ nim: "26109011020", name: "MUHAMMAD HILLTON ALINZKI AL ANSOR" },
{ nim: "26109011021", name: "FAIRUZ ASNAN NAJID" },
{ nim: "26109011022", name: "SETYO PRAYOGA" },
{ nim: "26109011023", name: "AHMAD DWIWIDYARTA ANWAR" },
{ nim: "26109011024", name: "KHANSA MALIKA AZZAHRA" },
{ nim: "26109011025", name: "IRSYAD TIRTAYASA" },
{ nim: "26109011026", name: "ARSYA BILQIS MIRZA" },
{ nim: "26109011027", name: "MUHAMMAD IQBAL ALI" },
{ nim: "26109011028", name: "ZASKIA AMELIA ERMA RATU RAYA" },
{ nim: "26109011029", name: "FIRDA NISHFIA RAHMA" },
{ nim: "26109011031", name: "NAHLA RAMANIYA ZAHRA" },
{ nim: "26109011032", name: "FARREL FANDICO HASTUNGKORO" },
{ nim: "26109011033", name: "MUHAMMAD HAFIZH TRIESTYAN PRATAMA" },
{ nim: "26109011034", name: "SALSA AULIYA ROCHMAH" },
{ nim: "26109011035", name: "RAIHAN AIDI ISKANDAR" },
{ nim: "26109011036", name: "JIHAN ZULFA" },
{ nim: "26109011037", name: "SIFA ALGHULUB" },
{ nim: "26109011038", name: "NISRINA AULIA" },
{ nim: "26109011039", name: "FADHILA NUR AZIZAH" },
{ nim: "26109011040", name: "SAKINAH KURNIA CAHYATI" },
{ nim: "26109011041", name: "HASNA AULIA KAHAR" },
{ nim: "26109011043", name: "SUCI FUJI NURBAYANTI" },
{ nim: "26109011044", name: "KARINA SAFINATUN NAJA" },
{ nim: "26109011045", name: "MAULANI ALFIANA PUTRI" },
{ nim: "26109011046", name: "FITRI LATIFA AINUSHOFA" },
{ nim: "26109011048", name: "YULANTIKA ASRI UTAMI" },
{ nim: "26109011049", name: "VISTANIA FATMA NURCAHYA" },
{ nim: "26109011050", name: "KAYLA SALSABILA SALWA" },
{ nim: "26109011051", name: "NASYWA NABILA DWIFADA" },
{ nim: "26109011052", name: "SITI UMMAYAH" },
{ nim: "26109011053", name: "RAISYA RAHMADINA YUSI" },
{ nim: "26109011054", name: "ALTHAF ABISEKA PRATAMA" },
{ nim: "26109011055", name: "AHMAD MUMTAZUL 'AYYASY" },
{ nim: "26109011056", name: "NANDIRA NAFISA" },
{ nim: "26109011057", name: "MAKMURI ASSIDIQI" },
{ nim: "26109011058", name: "ULAN DWI ROKMANA" },
{ nim: "26109011059", name: "MAKRIFATHUL A'UNI" },
{ nim: "26109011060", name: "ADRIANUS GIACINTO UMBU TADI MONE" },
{ nim: "26109011061", name: "MUHAMMAD FATHIN MUBAROK SALEH" },
{ nim: "26109011062", name: "NUR AZIZAH SUSANTI" },
{ nim: "26109011063", name: "FARIDA HAYA HUMAIRA" },
{ nim: "26109011064", name: "ABI MULIA FATTATAMA" },
{ nim: "26109011065", name: "AZZAHRA ROZELY HAFIZHAH" },
{ nim: "26109011066", name: "SALSABILA NUR FAIRUZ" },
{ nim: "26109011067", name: "ILMAN NUR FALAH" },
{ nim: "26109011068", name: "MUHAMMAD AL-FATHIR AZKA" },
{ nim: "26109011069", name: "HYLMI ASKHABUL YAMIN" },
{ nim: "26109011070", name: "MUH FAIZUL MAHDY" },
{ nim: "26109011071", name: "ZIANKA ARDHYA SYAFIQA" },
{ nim: "26109011072", name: "KARTIKA ARDIANA KUSUMA" },
{ nim: "26109011073", name: "KAYLA ADELIA MALAWAT" },
{ nim: "26109011074", name: "NAURA ALINSYAH" },
{ nim: "26109011075", name: "FAKHRIYAN DEXTA IMARADE FIRDAUS" },
{ nim: "26109011076", name: "MARJULI BAKTIAR HAMSYAH" },
{ nim: "26109011077", name: "DINDA OLIVIA" },
{ nim: "26109011079", name: "RARAS TIA" },
{ nim: "26109011081", name: "FADHILAH ARIFAH" },
{ nim: "26109011082", name: "RUBIYANTO DEDY" },
{ nim: "26109011083", name: "ANISA NUR PUTRIANI" },
{ nim: "26109011084", name: "FAZL AURANGZEB NABEEL NOOR" },
{ nim: "26109011085", name: "NAILA AZFA ROYYANA" },
{ nim: "26109011086", name: "JIAD GALIH KALASAPUTRA" },
{ nim: "26109011087", name: "AYDA MARDIYAH" },
{ nim: "26109011088", name: "SYAHRATU SITA AZ ZAHRA" },
{ nim: "26109011090", name: "FARABI DWI NOVRIAN" },
{ nim: "26109011091", name: "TSALSA AINUL MUQTADIS RUSWANDI" },
{ nim: "26109011092", name: "MUHAMMAD TROY TANJUNG FERDIAN" },
{ nim: "26109011093", name: "MUHAMMAD ALGHIFARI WICAKSONO" },
{ nim: "26109011094", name: "INGGRID MEGA CHANDRAWINATA" },
{ nim: "26109011095", name: "AMANDA DWI RAMADHANI" },
{ nim: "26109011096", name: "PASTIKA CALISTA ZIA MARVA" },
{ nim: "26109011097", name: "AQMARINA TSANTIK ZAIDA" },
{ nim: "26109011098", name: "TANIA ARVAIZZA" },
{ nim: "26109011099", name: "ATHAR FIRJATULLAH" },
{ nim: "26109011100", name: "ENDAH AULIA" },
{ nim: "26109011101", name: "INDRIA GANDI" },
{ nim: "26109011102", name: "NADIA NAYLA HUSNA" },
{ nim: "26109011103", name: "IQBAL ZEDANE M. BALAFIF" },
{ nim: "26109011104", name: "MUHAMMAD YANUAR EPYDOCAESAR" },
{ nim: "26109011105", name: "NAZWA NAYLA ZAHRA" },
{ nim: "26109011106", name: "AHMAD ARIP WAHYUDI" },
{ nim: "26109011107", name: "NABILA SYIFA HERMANTO" },
{ nim: "26109011108", name: "SILVY AULIA ANGGANA" },
{ nim: "26109011109", name: "DANIA RISTA SETIA AMANDA" },
{ nim: "26109011110", name: "RESI NOVA ALISKA" },
{ nim: "26109011111", name: "KHARISMA ALIFYA ZULFA" },
{ nim: "26109011112", name: "SHAFIRA NASHIRA RIZQI" },
{ nim: "26109011113", name: "AULIA SOFIA LATHIFA PAKU ALAMSYAH" },
{ nim: "26109011114", name: "MUHAMMAD FARRAAS PAKU ALAMSYAH" },
{ nim: "26109011115", name: "NI PUTU NANDA ANJALI" },
{ nim: "26109011116", name: "RORENCYA KOSTIA AULIA PUTRI" },
{ nim: "26109011117", name: "RAHMAN AL HASBI" },
{ nim: "26109011118", name: "PRABU WIDYADHANA NUSWANTARA" },
{ nim: "26109011119", name: "RIZKY MAULA PRATAMA" },
{ nim: "26109011120", name: "NABILA SAFINA" },
{ nim: "26109011121", name: "SALMA AYU RAMADHANI" },
{ nim: "26109011122", name: "SEVY KIRANIA PRAMESTY" },
{ nim: "26109011123", name: "ORYZA ZILDJIAN ALMAGHVIRA" },
{ nim: "26109011124", name: "ALYA NEHA RAHMADANI" },
{ nim: "26109011125", name: "KAELYN ADARA CALLYSTA" },
{ nim: "26109011126", name: "NABILA" },
{ nim: "26109011127", name: "CHARYSA MANDA KUSMANA" },
{ nim: "26109011128", name: "SYIFA ALINTYA KUSUMA LUJANTORO" },
{ nim: "26109011129", name: "AJENG SYIFA HAMIDAH" },
{ nim: "26109011130", name: "HURUL AINI NUR AISYAH" },
{ nim: "26109011131", name: "SASKIA AZZAHRA" },
{ nim: "26109011132", name: "POETRI SYIFANA IRZA HSB" },
{ nim: "26109011133", name: "KIRANY ZAHRA RAMADHANI" },
{ nim: "26109011134", name: "PUTRI KIRANA MENTARI" },
{ nim: "26109011135", name: "INDRATIN ZAHRATUSSITA" },
{ nim: "26109011136", name: "MUHAMMAD ATHA AQILLA ZAHRAN" },
{ nim: "26109011137", name: "AZIZAH SHARLIZ AL HADI" },
{ nim: "26109011138", name: "NURUL ARIFAH DWI APSARI" },
{ nim: "26109011139", name: "MUHAMMAD ABDULLAH SALAM DZAKI" },
{ nim: "26109011140", name: "NABILA SYIFA CINDY AUDREY" },
{ nim: "26109011141", name: "IVANA LANADIA LEONARDO" },
{ nim: "26109011142", name: "ALDIBA AINURRAHMAN SISWIYANTO" },
{ nim: "26109011143", name: "AISYA ANDIENASABILLA PUTRI PANDYA" },
{ nim: "26109011144", name: "SINTA AULIA" },
{ nim: "26109011145", name: "AULIA AYU NIRMALASARI" },
{ nim: "26109011146", name: "MUHAMMAD FAREL AZARENO" },
{ nim: "26109011147", name: "CHIKA JANSKI NUR BALQIS PUTRI" },
{ nim: "26109011148", name: "RAHMA DEWI SETYAWATI" },
{ nim: "26109011150", name: "TEGAR GEMILANG TEGUH SYAHPUTRA" },
{ nim: "26109011151", name: "ROIHAN MAULANA" },
{ nim: "26109011153", name: "LINTANG NADA SYAFIRA" },
{ nim: "26109011154", name: "SEIRA ARDILA" },
{ nim: "26109011155", name: "GLADIS YEFA SEPTIANI AZALIA" },
{ nim: "26109011156", name: "NURUNNAJAH" },
{ nim: "26109011157", name: "HASNA ATHIRA ALHIDAYAT" },
{ nim: "26109011158", name: "MUTIARA ANANDA FIANISA" },
{ nim: "26109011159", name: "CRISTIN ZASKIA WARDA" },
{ nim: "26109011160", name: "KAYLA AURA RAHMALIA" },
{ nim: "26109012149", name: "HAIKAL RIZKI MAHARDENI" },
{ nim: "26109012152", name: "RIZKI PUTRI AYU APRILIA" }
];

export default function App() {
const [user, setUser] = useState(null);

// Splash Screen State (Komisi Kedisiplinan)
const [showSplash, setShowSplash] = useState(true);
const [splashProgress, setSplashProgress] = useState(15);
const [isSplashExiting, setIsSplashExiting] = useState(false);

// Global SSO Navigation: 'tatib_peserta' | 'tatib_panitia' | 'rekap_adrenalin' | 'pemantauan_1th' | 'raport_terpadu'
const [currentModule, setCurrentModule] = useState('tatib_peserta');

// Master Security Lock State
const [isLocked, setIsLocked] = useState(true);
const [isPinModalOpen, setIsPinModalOpen] = useState(false);
const [pinInput, setPinInput] = useState('');
const [pinError, setPinError] = useState('');

// Master Shared Student Management Modal State
const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
const [newNimShared, setNewNimShared] = useState('');
const [newNameShared, setNewNameShared] = useState('');
const [bulkDataShared, setBulkDataShared] = useState('');
const [searchStudentShared, setSearchStudentShared] = useState('');

// Global Feedback Modal State
const [modal, setModal] = useState({ isOpen: false, type: 'alert', title: '', message: '', targetId: null });

// Central Database: Single Shared Student List (Diinisialisasi langsung dengan 151 Peserta Resmi)
const [students, setStudents] = useState(() => 
INITIAL_STUDENTS.map(s => ({ id: 'init-' + s.nim, ...s })).sort((a, b) => a.name.localeCompare(b.name))
);

// State Modul 1: Tatib Peserta
const [activePesertaSubTab, setActivePesertaSubTab] = useState('home');
const [dashboardPeserta, setDashboardPeserta] = useState(INITIAL_DASHBOARD_PESERTA);
const [aturanPeserta, setAturanPeserta] = useState(INITIAL_ATURAN_PESERTA);
const [pelanggaranPeserta, setPelanggaranPeserta] = useState(INITIAL_PELANGGARAN_PESERTA);
const [openAturanPeserta, setOpenAturanPeserta] = useState({});

// State Modul 2: Tatib Panitia
const [panitiaActiveTab, setPanitiaActiveTab] = useState('rapat');
const [panitiaSearchQuery, setPanitiaSearchQuery] = useState('');
const [selectedPanitiaRuleId, setSelectedPanitiaRuleId] = useState(null);

// State Modul 3: Rekap Adrenalin Live
const [activeAdrenalinTab, setActiveAdrenalinTab] = useState('input');
const [recordsAdrenalin, setRecordsAdrenalin] = useState([]);
const [customRulesAdrenalin, setCustomRulesAdrenalin] = useState([]);
const [selectedNimAdrenalin, setSelectedNimAdrenalin] = useState('');
const [searchNimAdrenalin, setSearchNimAdrenalin] = useState('');
const [isAdrenalinDropdownOpen, setIsAdrenalinDropdownOpen] = useState(false);
const [catAdrenalin, setCatAdrenalin] = useState('');
const [ruleAdrenalin, setRuleAdrenalin] = useState('');
const [dayAdrenalin, setDayAdrenalin] = useState('Pra-Adrenalin');
const [customDayAdrenalin, setCustomDayAdrenalin] = useState('');
const [customCatAdrenalin, setCustomCatAdrenalin] = useState('');
const [customRuleNameAdrenalin, setCustomRuleNameAdrenalin] = useState('');
const [customPointsAdrenalin, setCustomPointsAdrenalin] = useState('');
const [notesAdrenalin, setNotesAdrenalin] = useState('');
const [evidenceAdrenalin, setEvidenceAdrenalin] = useState('');
const [isUploadingAdrenalin, setIsUploadingAdrenalin] = useState(false);
const [searchTermAdrenalin, setSearchTermAdrenalin] = useState('');
const [sortByAdrenalin, setSortByAdrenalin] = useState('points');

// State Modul 4: Pemantauan 1 Tahun
const [activePemantauanTab, setActivePemantauanTab] = useState('input');
const [recordsPemantauan, setRecordsPemantauan] = useState([]);
const [customRulesPemantauan, setCustomRulesPemantauan] = useState([]);
const [reportTypePemantauan, setReportTypePemantauan] = useState('nama');
const [selectedNimPemantauan, setSelectedNimPemantauan] = useState('');
const [searchNimPemantauan, setSearchNimPemantauan] = useState('');
const [isPemantauanDropdownOpen, setIsPemantauanDropdownOpen] = useState(false);
const [catPemantauan, setCatPemantauan] = useState('');
const [rulePemantauan, setRulePemantauan] = useState('');
const [dayPemantauan, setDayPemantauan] = useState('Bulan 1');
const [customDayPemantauan, setCustomDayPemantauan] = useState('');
const [customCatPemantauan, setCustomCatPemantauan] = useState('');
const [customRuleNamePemantauan, setCustomRuleNamePemantauan] = useState('');
const [customPointsPemantauan, setCustomPointsPemantauan] = useState('');
const [notesPemantauan, setNotesPemantauan] = useState('');
const [evidencePemantauan, setEvidencePemantauan] = useState('');
const [isUploadingPemantauan, setIsUploadingPemantauan] = useState(false);
const [searchTermPemantauan, setSearchTermPemantauan] = useState('');
const [sortByPemantauan, setSortByPemantauan] = useState('points');

// State Modul 5: Raport Terpadu
const [selectedRaportNim, setSelectedRaportNim] = useState('');
const [searchRaportStudent, setSearchRaportStudent] = useState('');
const [isRaportDropdownOpen, setIsRaportDropdownOpen] = useState(false);

// Indicators
const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
const [isGeneratingImage, setIsGeneratingImage] = useState(false);
const [isProcessingBulk, setIsProcessingBulk] = useState(false);

// Refs
const fileInputAdrenalinRef = useRef(null);
const fileInputPemantauanRef = useRef(null);
const dropdownAdrenalinRef = useRef(null);
const dropdownPemantauanRef = useRef(null);
const dropdownRaportRef = useRef(null);
const fileInputMasterRef = useRef(null);

useEffect(() => {
const loadExternalScripts = async () => {
const loadScript = (src) => new Promise((resolve) => {
if (document.querySelector(`script[src="${src}"]`)) {
resolve();
return;
}
const script = document.createElement('script');
script.src = src;
script.onload = resolve;
document.body.appendChild(script);
});

await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
};
loadExternalScripts();
}, []);

useEffect(() => {
function handleClickOutside(event) {
if (dropdownAdrenalinRef.current && !dropdownAdrenalinRef.current.contains(event.target)) {
setIsAdrenalinDropdownOpen(false);
}
if (dropdownPemantauanRef.current && !dropdownPemantauanRef.current.contains(event.target)) {
setIsPemantauanDropdownOpen(false);
}
if (dropdownRaportRef.current && !dropdownRaportRef.current.contains(event.target)) {
setIsRaportDropdownOpen(false);
}
}
document.addEventListener("mousedown", handleClickOutside);
return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

useEffect(() => {
const step1 = setTimeout(() => setSplashProgress(45), 700);
const step2 = setTimeout(() => setSplashProgress(78), 1600);
const step3 = setTimeout(() => setSplashProgress(100), 2500);
const dismissTimer = setTimeout(() => {
setIsSplashExiting(true);
setTimeout(() => setShowSplash(false), 700);
}, 3600);

return () => {
clearTimeout(step1);
clearTimeout(step2);
clearTimeout(step3);
clearTimeout(dismissTimer);
};
}, []);

const handleSkipSplash = () => {
setIsSplashExiting(true);
setTimeout(() => setShowSplash(false), 450);
};

const handleReplaySplash = () => {
setIsSplashExiting(false);
setSplashProgress(25);
setShowSplash(true);
setTimeout(() => setSplashProgress(65), 600);
setTimeout(() => setSplashProgress(100), 1400);
setTimeout(() => {
setIsSplashExiting(true);
setTimeout(() => setShowSplash(false), 600);
}, 2800);
};

useEffect(() => {
const initAuth = async () => {
try {
if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
await signInWithCustomToken(auth, __initial_auth_token);
} else {
await signInAnonymously(auth);
}
} catch (error) {
console.error("Firebase Auth Error:", error);
}
};
initAuth();
const unsubscribe = onAuthStateChanged(auth, setUser);
return () => unsubscribe();
}, []);

useEffect(() => {
if (!user) return;

// 1. Config Tatib Peserta
const docPesertaRef = doc(db, 'artifacts', appId, 'public', 'data', 'adrenalin_portal', 'main_config');
const unsubPeserta = onSnapshot(docPesertaRef, (snap) => {
if (snap.exists()) {
const d = snap.data();
if (d.dashboard) setDashboardPeserta(d.dashboard);
if (d.aturan) setAturanPeserta(d.aturan);
if (d.pelanggaran) setPelanggaranPeserta(d.pelanggaran);
} else {
setDoc(docPesertaRef, {
dashboard: INITIAL_DASHBOARD_PESERTA,
aturan: INITIAL_ATURAN_PESERTA,
pelanggaran: INITIAL_PELANGGARAN_PESERTA
}).catch(e => console.error("Init peserta err:", e));
}
});

// 2. Database Sentral: Mahasiswa / Civitas (Shared)
// Otomatis menggabungkan daftar 151 mahasiswa baku dengan penambahan/update dari Cloud Firestore
const studRef = collection(db, 'artifacts', appId, 'public', 'data', 'students');
const unsubStud = onSnapshot(studRef, (snap) => {
const cloudStudents = snap.docs.map(d => ({ id: d.id, ...d.data() }));
const map = new Map();

// Masukkan baseline 151 mahasiswa
INITIAL_STUDENTS.forEach(s => map.set(s.nim, { id: 'init-' + s.nim, ...s }));

// Sinkronkan data Firestore (termasuk status terhapus bila ada)
cloudStudents.forEach(s => {
if (s._deleted) {
map.delete(s.nim);
} else {
map.set(s.nim, s);
}
});

setStudents(Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name)));
});

// 3. Modul Rekap Adrenalin (Records & Custom Rules)
const recAdrenalinRef = collection(db, 'artifacts', appId, 'public', 'data', 'records');
const unsubRecAdrenalin = onSnapshot(recAdrenalinRef, (snap) => {
setRecordsAdrenalin(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.timestamp - a.timestamp));
});

const ruleAdrenalinRef = collection(db, 'artifacts', appId, 'public', 'data', 'custom_rules');
const unsubRuleAdrenalin = onSnapshot(ruleAdrenalinRef, (snap) => {
setCustomRulesAdrenalin(snap.docs.map(d => ({ docId: d.id, ...d.data() })));
});

// 4. Modul Pemantauan 1 Tahun (Records & Custom Rules)
const recPemantauanRef = collection(db, 'artifacts', appId, 'public', 'data', 'records_pemantauan');
const unsubRecPemantauan = onSnapshot(recPemantauanRef, (snap) => {
setRecordsPemantauan(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.timestamp - a.timestamp));
});

const rulePemantauanRef = collection(db, 'artifacts', appId, 'public', 'data', 'custom_rules_pemantauan');
const unsubRulePemantauan = onSnapshot(rulePemantauanRef, (snap) => {
setCustomRulesPemantauan(snap.docs.map(d => ({ docId: d.id, ...d.data() })));
});

return () => {
unsubPeserta();
unsubStud();
unsubRecAdrenalin();
unsubRuleAdrenalin();
unsubRecPemantauan();
unsubRulePemantauan();
};
}, [user]);

const filteredPanitiaRules = useMemo(() => {
return PANITIA_RULES_DATA.filter(r => 
r.type === panitiaActiveTab && 
(r.text.toLowerCase().includes(panitiaSearchQuery.toLowerCase()) || 
r.basisLabel.toLowerCase().includes(panitiaSearchQuery.toLowerCase()) ||
r.penalty.toLowerCase().includes(panitiaSearchQuery.toLowerCase()))
);
}, [panitiaActiveTab, panitiaSearchQuery]);

const getPanitiaBadgeStyle = (type) => ({
'fine': 'bg-red-50 text-red-700 border-red-200',
'heavy-fine': 'bg-red-700 text-white border-red-800 font-bold',
'discuss': 'bg-amber-50 text-amber-900 border-amber-300 font-bold',
'none': 'bg-stone-100 text-stone-600 border-stone-200'
}[type]);

const getPanitiaBasisBadge = (type) => {
switch (type) {
case 'perak': return 'bg-blue-50 border-blue-200 text-blue-800';
case 'ktr': return 'bg-rose-50 border-rose-200 text-rose-800';
case 'otonom': return 'bg-slate-100 border-slate-200 text-slate-700';
default: return 'bg-gray-50 border-gray-200 text-gray-700';
}
};

const allRulesAdrenalin = useMemo(() => [...STATIC_VIOLATION_RULES, ...customRulesAdrenalin], [customRulesAdrenalin]);
const allCategoriesAdrenalin = useMemo(() => Array.from(new Set(allRulesAdrenalin.map(r => r.category))), [allRulesAdrenalin]);
const filteredRulesAdrenalin = useMemo(() => allRulesAdrenalin.filter(r => r.category === catAdrenalin), [catAdrenalin, allRulesAdrenalin]);
const isSelectedRuleCustomAdrenalin = ruleAdrenalin && ruleAdrenalin.startsWith('CUST-');
const selectedCustomRuleDocIdAdrenalin = isSelectedRuleCustomAdrenalin ? customRulesAdrenalin.find(r => r.id === ruleAdrenalin)?.docId : null;

const allRulesPemantauan = useMemo(() => [...STATIC_VIOLATION_RULES, ...customRulesPemantauan], [customRulesPemantauan]);
const allCategoriesPemantauan = useMemo(() => Array.from(new Set(allRulesPemantauan.map(r => r.category))), [allRulesPemantauan]);
const filteredRulesPemantauan = useMemo(() => allRulesPemantauan.filter(r => r.category === catPemantauan), [catPemantauan, allRulesPemantauan]);
const isSelectedRuleCustomPemantauan = rulePemantauan && rulePemantauan.startsWith('CUST-');
const selectedCustomRuleDocIdPemantauan = isSelectedRuleCustomPemantauan ? customRulesPemantauan.find(r => r.id === rulePemantauan)?.docId : null;

const filteredStudentsForAdrenalinForm = useMemo(() => {
if (!searchNimAdrenalin) return students;
return students.filter(s => s.name.toLowerCase().includes(searchNimAdrenalin.toLowerCase()) || s.nim.includes(searchNimAdrenalin));
}, [students, searchNimAdrenalin]);

const filteredStudentsForPemantauanForm = useMemo(() => {
if (!searchNimPemantauan) return students;
return students.filter(s => s.name.toLowerCase().includes(searchNimPemantauan.toLowerCase()) || s.nim.includes(searchNimPemantauan));
}, [students, searchNimPemantauan]);

const filteredStudentsForRaport = useMemo(() => {
if (!searchRaportStudent) return students;
return students.filter(s => s.name.toLowerCase().includes(searchRaportStudent.toLowerCase()) || s.nim.includes(searchRaportStudent));
}, [students, searchRaportStudent]);

const recapSummaryAdrenalin = useMemo(() => {
const map = {};
students.forEach(s => {
map[s.nim] = { name: s.name, totalPoints: 0, violations: [], violationCount: 0 };
});
recordsAdrenalin.forEach(r => {
if (!map[r.nim]) map[r.nim] = { name: r.name, totalPoints: 0, violations: [], violationCount: 0 };
map[r.nim].totalPoints += r.points;
map[r.nim].violationCount += 1;
map[r.nim].violations.push(r);
});
return Object.entries(map)
.filter(([nim, d]) => d.name.toLowerCase().includes(searchTermAdrenalin.toLowerCase()) || nim.includes(searchTermAdrenalin))
.map(([nim, d]) => ({ nim, ...d }))
.sort((a, b) => {
if (sortByAdrenalin === 'points') return b.totalPoints !== a.totalPoints ? b.totalPoints - a.totalPoints : a.name.localeCompare(b.name);
if (sortByAdrenalin === 'name') return a.name.localeCompare(b.name);
return a.nim.localeCompare(b.nim);
});
}, [students, recordsAdrenalin, searchTermAdrenalin, sortByAdrenalin]);

const recapSummaryPemantauan = useMemo(() => {
const map = {};
students.forEach(s => {
map[s.nim] = { name: s.name, totalPoints: 0, violations: [], violationCount: 0 };
});
recordsPemantauan.forEach(r => {
if (!map[r.nim]) map[r.nim] = { name: r.name, totalPoints: 0, violations: [], violationCount: 0 };
map[r.nim].totalPoints += r.points;
map[r.nim].violationCount += 1;
map[r.nim].violations.push(r);
});
return Object.entries(map)
.filter(([nim, d]) => d.name.toLowerCase().includes(searchTermPemantauan.toLowerCase()) || nim.includes(searchTermPemantauan))
.map(([nim, d]) => ({ nim, ...d }))
.sort((a, b) => {
if (sortByPemantauan === 'points') return b.totalPoints !== a.totalPoints ? b.totalPoints - a.totalPoints : a.name.localeCompare(b.name);
if (sortByPemantauan === 'name') return a.name.localeCompare(b.name);
return a.nim.localeCompare(b.nim);
});
}, [students, recordsPemantauan, searchTermPemantauan, sortByPemantauan]);

const combinedRaportData = useMemo(() => {
const map = {};
students.forEach(s => {
map[s.nim] = { 
name: s.name, 
adrenalinPoints: 0, 
pemantauanPoints: 0, 
totalCombinedPoints: 0,
adrenalinViolations: [],
pemantauanViolations: [],
totalViolationsCount: 0
};
});

recordsAdrenalin.forEach(r => {
if (!map[r.nim]) {
map[r.nim] = { name: r.name, adrenalinPoints: 0, pemantauanPoints: 0, totalCombinedPoints: 0, adrenalinViolations: [], pemantauanViolations: [], totalViolationsCount: 0 };
}
map[r.nim].adrenalinPoints += r.points;
map[r.nim].adrenalinViolations.push(r);
});

recordsPemantauan.forEach(r => {
if (!map[r.nim]) {
map[r.nim] = { name: r.name, adrenalinPoints: 0, pemantauanPoints: 0, totalCombinedPoints: 0, adrenalinViolations: [], pemantauanViolations: [], totalViolationsCount: 0 };
}
map[r.nim].pemantauanPoints += r.points;
map[r.nim].pemantauanViolations.push(r);
});

return Object.entries(map).map(([nim, d]) => {
const totalCombinedPoints = d.adrenalinPoints + d.pemantauanPoints;
const totalViolationsCount = d.adrenalinViolations.length + d.pemantauanViolations.length;

let status = 'LULUS';
let statusColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
if (totalCombinedPoints > 55) {
status = 'TIDAK LULUS';
statusColor = 'bg-red-700 text-white border-red-800';
} else if (totalCombinedPoints >= 45) {
status = 'PERTIMBANGAN';
statusColor = 'bg-amber-100 text-amber-900 border-amber-300';
}

return {
nim,
...d,
totalCombinedPoints,
totalViolationsCount,
status,
statusColor
};
});
}, [students, recordsAdrenalin, recordsPemantauan]);

const selectedRaportDetail = useMemo(() => {
if (!selectedRaportNim) return null;
return combinedRaportData.find(s => s.nim === selectedRaportNim) || null;
}, [selectedRaportNim, combinedRaportData]);

const handleToggleLock = () => {
if (isLocked) {
setPinInput('');
setPinError('');
setIsPinModalOpen(true);
} else {
setIsLocked(true);
setModal({
isOpen: true,
type: 'alert',
title: 'Sistem Terkunci',
message: 'Akses administrasi berhasil dikunci kembali. Mode "Hanya Lihat" aktif.',
targetId: null
});
}
};

const handleVerifyPin = (e) => {
if (e) e.preventDefault();
if (pinInput === 'admin2026' || pinInput === 'K0MD1s2026#') {
setIsLocked(false);
setIsPinModalOpen(false);
setPinInput('');
setPinError('');
setModal({ 
isOpen: true, 
type: 'alert', 
title: 'Akses Admin Terbuka', 
message: 'Kunci keamanan berhasil dibuka. Anda dapat mengelola peserta, mengisi poin custom, dan mengunduh berkas resmi.', 
targetId: null 
});
} else {
setPinError('PIN salah! Silakan coba lagi.');
}
};

const compressImage = (file, callback, setUploadState) => {
if (!file) return;
setUploadState(true);
const reader = new FileReader();
reader.onload = (event) => {
const img = new Image();
img.onload = () => {
const canvas = document.createElement('canvas');
const MAX_WIDTH = 600;
const scaleSize = MAX_WIDTH / img.width;
canvas.width = MAX_WIDTH;
canvas.height = img.height * scaleSize;
const ctx = canvas.getContext('2d');
ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
callback(canvas.toDataURL('image/jpeg', 0.6));
setUploadState(false);
};
img.src = event.target.result;
};
reader.readAsDataURL(file);
};

const handleAddRecordAdrenalin = async (e) => {
e.preventDefault();
if (!user || !selectedNimAdrenalin || !ruleAdrenalin) return;

const student = students.find(s => s.nim === selectedNimAdrenalin);
const finalDay = dayAdrenalin === 'Custom' ? (customDayAdrenalin.trim() || 'Lainnya') : dayAdrenalin;
let finalCategory = catAdrenalin;
let finalRuleName = '';
let finalPoints = 0;
let finalRuleId = '';
let finalType = 'Ringan';

try {
if (ruleAdrenalin === 'Custom') {
finalCategory = catAdrenalin === 'Custom' ? (customCatAdrenalin.trim() || 'KATEGORI LAINNYA').toUpperCase() : catAdrenalin;
finalRuleName = customRuleNameAdrenalin.trim() || 'Pelanggaran Khusus';
finalPoints = isLocked ? 0 : (isNaN(parseInt(customPointsAdrenalin, 10)) ? 0 : parseInt(customPointsAdrenalin, 10));
finalRuleId = 'CUST-' + Date.now();
finalType = finalPoints >= 15 ? 'Berat' : (finalPoints >= 5 ? 'Sedang' : (finalPoints > 0 ? 'Ringan' : 'Catatan'));

await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'custom_rules'), {
id: finalRuleId,
category: finalCategory,
name: finalRuleName,
points: finalPoints,
type: finalType
});
} else {
const rule = allRulesAdrenalin.find(r => r.id === ruleAdrenalin);
finalCategory = rule.category;
finalRuleName = rule.name;
finalPoints = rule.points;
finalRuleId = rule.id;
finalType = rule.type;
}

await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'records'), {
nim: student.nim,
name: student.name,
ruleId: finalRuleId,
ruleName: finalRuleName,
category: finalCategory,
points: finalPoints,
type: finalType,
day: finalDay,
notes: notesAdrenalin,
evidence: evidenceAdrenalin,
timestamp: Date.now(),
dateString: new Date().toLocaleString('id-ID')
});

setSelectedNimAdrenalin('');
setSearchNimAdrenalin('');
setRuleAdrenalin('');
setNotesAdrenalin('');
setEvidenceAdrenalin('');
setCustomCatAdrenalin('');
setCustomRuleNameAdrenalin('');
setCustomPointsAdrenalin('');
if (fileInputAdrenalinRef.current) fileInputAdrenalinRef.current.value = '';

setModal({ isOpen: true, type: 'alert', title: 'Berhasil', message: 'Pelanggaran Adrenalin berhasil disimpan.', targetId: null });
} catch (err) {
console.error(err);
setModal({ isOpen: true, type: 'alert', title: 'Gagal', message: 'Terjadi kesalahan saat menyimpan data.', targetId: null });
}
};

const handleAddRecordPemantauan = async (e) => {
e.preventDefault();
if (!user || !rulePemantauan) return;

if (!evidencePemantauan) {
setModal({ 
isOpen: true, 
type: 'alert', 
title: 'Foto Bukti Wajib!', 
message: 'Laporan pemantauan tidak dapat dikirim tanpa melampirkan foto bukti otentik pelanggaran.', 
targetId: null 
});
return;
}

let studentNim = '000000000000';
let studentName = 'PESERTA TANPA NAMA / ANONIM';

if (reportTypePemantauan === 'nama') {
if (!selectedNimPemantauan) {
setModal({ isOpen: true, type: 'alert', title: 'Pilih Peserta', message: 'Silakan pilih peserta yang dilaporkan.', targetId: null });
return;
}
const st = students.find(s => s.nim === selectedNimPemantauan);
if (st) {
studentNim = st.nim;
studentName = st.name;
}
}

const finalDay = dayPemantauan === 'Custom' ? (customDayPemantauan.trim() || 'Pemantauan') : dayPemantauan;
let finalCategory = catPemantauan;
let finalRuleName = '';
let finalPoints = 0;
let finalRuleId = '';
let finalType = 'Ringan';

try {
if (rulePemantauan === 'Custom') {
finalCategory = catPemantauan === 'Custom' ? (customCatPemantauan.trim() || 'KATEGORI LAINNYA').toUpperCase() : catPemantauan;
finalRuleName = customRuleNamePemantauan.trim() || 'Pelanggaran Khusus';
finalPoints = isLocked ? 0 : (isNaN(parseInt(customPointsPemantauan, 10)) ? 0 : parseInt(customPointsPemantauan, 10));
finalRuleId = 'CUST-' + Date.now();
finalType = finalPoints >= 15 ? 'Berat' : (finalPoints >= 5 ? 'Sedang' : (finalPoints > 0 ? 'Ringan' : 'Catatan'));

await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'custom_rules_pemantauan'), {
id: finalRuleId,
category: finalCategory,
name: finalRuleName,
points: finalPoints,
type: finalType
});
} else {
const rule = allRulesPemantauan.find(r => r.id === rulePemantauan);
finalCategory = rule.category;
finalRuleName = rule.name;
finalPoints = rule.points;
finalRuleId = rule.id;
finalType = rule.type;
}

await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'records_pemantauan'), {
nim: studentNim,
name: studentName,
ruleId: finalRuleId,
ruleName: finalRuleName,
category: finalCategory,
points: finalPoints,
type: finalType,
day: finalDay,
notes: notesPemantauan,
evidence: evidencePemantauan,
timestamp: Date.now(),
dateString: new Date().toLocaleString('id-ID')
});

setSelectedNimPemantauan('');
setSearchNimPemantauan('');
setRulePemantauan('');
setNotesPemantauan('');
setEvidencePemantauan('');
setCustomCatPemantauan('');
setCustomRuleNamePemantauan('');
setCustomPointsPemantauan('');
if (fileInputPemantauanRef.current) fileInputPemantauanRef.current.value = '';

setModal({ isOpen: true, type: 'alert', title: 'Laporan Diterima', message: 'Laporan pemantauan 1 tahun berhasil dicatat ke sistem.', targetId: null });
} catch (err) {
console.error(err);
setModal({ isOpen: true, type: 'alert', title: 'Gagal', message: 'Terjadi kesalahan saat menyimpan laporan.', targetId: null });
}
};

const handleAddStudentManualShared = async (e) => {
e.preventDefault();
if (isLocked) {
setModal({ isOpen: true, type: 'alert', title: 'Akses Dibatasi', message: 'Buka kunci admin di header terlebih dahulu.', targetId: null });
return;
}
if (!newNimShared.trim() || !newNameShared.trim()) return;

if (students.some(s => s.nim === newNimShared.trim())) {
setModal({ isOpen: true, type: 'alert', title: 'Peringatan', message: 'NIM tersebut sudah terdaftar di database!', targetId: null });
return;
}

try {
await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'students'), {
nim: newNimShared.trim(),
name: newNameShared.trim().toUpperCase()
});
setNewNimShared('');
setNewNameShared('');
setModal({ isOpen: true, type: 'alert', title: 'Berhasil', message: 'Peserta berhasil ditambahkan ke database sentral.', targetId: null });
} catch (err) {
console.error(err);
setModal({ isOpen: true, type: 'alert', title: 'Gagal', message: 'Gagal menyimpan data peserta.', targetId: null });
}
};

const handleBulkAddShared = async () => {
if (isLocked) {
setModal({ isOpen: true, type: 'alert', title: 'Akses Dibatasi', message: 'Sistem dalam mode "Hanya Lihat". Buka kunci admin terlebih dahulu.', targetId: null });
return;
}
if (!bulkDataShared.trim()) return;
setIsProcessingBulk(true);

const lines = bulkDataShared.split('\n');
const toAdd = [];
const existingNims = new Set(students.map(s => s.nim));

for (let line of lines) {
if (!line.trim()) continue;
let parts = line.split(/[\t,;]+/);
if (parts.length === 1) {
const nimMatch = line.match(/\b\d{8,15}\b/);
if (nimMatch) {
const nim = nimMatch[0];
let name = line.replace(nim, '').replace(/^[\d\W]+|[\W]+$/g, '').trim();
parts = [nim, name || 'TANPA NAMA'];
}
}
parts = parts.map(p => p.trim());
const nim = parts.find(p => /^\d{8,15}$/.test(p));
if (nim && !existingNims.has(nim)) {
const candidates = parts.filter(p => p !== nim && p.length > 2 && /[a-zA-Z]/.test(p));
let name = candidates.length > 0 ? candidates[0].toUpperCase() : 'TANPA NAMA';
name = name.replace(/^["']|["']$/g, '').trim();
toAdd.push({ nim, name });
existingNims.add(nim);
}
}

if (toAdd.length === 0) {
setModal({ isOpen: true, type: 'alert', title: 'Peringatan', message: 'Tidak ada data valid/baru ditemukan. Pastikan ada kolom angka NIM 8-15 digit.', targetId: null });
setIsProcessingBulk(false);
return;
}

try {
const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'students');
await Promise.all(toAdd.map(s => addDoc(colRef, s)));
setBulkDataShared('');
setModal({ isOpen: true, type: 'Sukses!', message: `${toAdd.length} data peserta berhasil disinkronkan ke database sentral.`, targetId: null });
} catch (err) {
console.error(err);
setModal({ isOpen: true, type: 'alert', title: 'Gagal', message: 'Terjadi kesalahan saat menyimpan data.', targetId: null });
}
setIsProcessingBulk(false);
};

const handleExportMasterJSON = () => {
if (isLocked) {
setModal({
isOpen: true,
type: 'alert',
title: 'Akses Dibatasi',
message: 'Sistem dalam mode "Hanya Lihat". Buka kunci admin terlebih dahulu untuk mengekspor seluruh master database.',
targetId: null
});
return;
}

const masterData = {
version: '3.0-unified-sso',
exportedAt: new Date().toISOString(),
tatib_peserta: {
dashboard: dashboardPeserta,
aturan: aturanPeserta,
pelanggaran: pelanggaranPeserta
},
students: students.map(({ id, ...rest }) => rest),
adrenalin: {
records: recordsAdrenalin.map(({ id, ...rest }) => rest),
custom_rules: customRulesAdrenalin.map(({ docId, ...rest }) => rest)
},
pemantauan: {
records: recordsPemantauan.map(({ id, ...rest }) => rest),
custom_rules: customRulesPemantauan.map(({ docId, ...rest }) => rest)
}
};

const jsonString = JSON.stringify(masterData, null, 2);
const blob = new Blob([jsonString], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `Master_Backup_SSO_ADRENALIN_FK_UNWAHAS_${Date.now()}.json`;
document.body.appendChild(a);
a.click();
a.remove();
URL.revokeObjectURL(url);
};

const handleImportMasterJSON = (e) => {
if (isLocked) {
setModal({
isOpen: true,
type: 'alert',
title: 'Akses Dibatasi',
message: 'Sistem terkunci! Buka kunci admin terlebih dahulu untuk memulihkan seluruh master database.',
targetId: null
});
if (fileInputMasterRef.current) fileInputMasterRef.current.value = '';
return;
}

const file = e.target.files[0];
if (!file) return;

const reader = new FileReader();
reader.onload = async (event) => {
try {
const data = JSON.parse(event.target.result);
if (!data.tatib_peserta && !data.students && !data.adrenalin && !data.pemantauan) {
setModal({
isOpen: true,
type: 'alert',
title: 'Format Tidak Sesuai',
message: 'File master backup JSON tidak valid.',
targetId: null
});
return;
}

setIsProcessingBulk(true);

// 1. Restore Tatib
if (data.tatib_peserta) {
const docPesertaRef = doc(db, 'artifacts', appId, 'public', 'data', 'adrenalin_portal', 'main_config');
await setDoc(docPesertaRef, {
dashboard: data.tatib_peserta.dashboard || INITIAL_DASHBOARD_PESERTA,
aturan: data.tatib_peserta.aturan || INITIAL_ATURAN_PESERTA,
pelanggaran: data.tatib_peserta.pelanggaran || INITIAL_PELANGGARAN_PESERTA
});
}

// 2. Restore Shared Students
if (data.students) {
const sRef = collection(db, 'artifacts', appId, 'public', 'data', 'students');
await Promise.all(data.students.map(s => addDoc(sRef, s)));
}

// 3. Restore Adrenalin
if (data.adrenalin) {
const rRef = collection(db, 'artifacts', appId, 'public', 'data', 'records');
const cRef = collection(db, 'artifacts', appId, 'public', 'data', 'custom_rules');
await Promise.all([
...(data.adrenalin.records || []).map(r => addDoc(rRef, r)),
...(data.adrenalin.custom_rules || []).map(r => addDoc(cRef, r))
]);
}

// 4. Restore Pemantauan
if (data.pemantauan) {
const rpRef = collection(db, 'artifacts', appId, 'public', 'data', 'records_pemantauan');
const cpRef = collection(db, 'artifacts', appId, 'public', 'data', 'custom_rules_pemantauan');
await Promise.all([
...(data.pemantauan.records || []).map(r => addDoc(rpRef, r)),
...(data.pemantauan.custom_rules || []).map(r => addDoc(cpRef, r))
]);
}

setModal({
isOpen: true,
type: 'alert',
title: 'Master Restore Berhasil!',
message: 'Seluruh database berhasil dipulihkan secara utuh ke server.',
targetId: null
});
if (fileInputMasterRef.current) fileInputMasterRef.current.value = '';
} catch (err) {
console.error(err);
setModal({
isOpen: true,
type: 'alert',
title: 'Gagal Memproses File',
message: 'Terjadi kesalahan saat memproses file JSON master backup.',
targetId: null
});
} finally {
setIsProcessingBulk(false);
}
};
reader.readAsText(file);
};

const handleDownloadPDFPortrait = (elementId, filename) => {
if (isLocked) {
setModal({
isOpen: true,
type: 'alert',
title: 'Akses Dibatasi',
message: 'Laporan resmi PDF hanya dapat diunduh oleh Admin. Silakan buka kunci di header terlebih dahulu.',
targetId: null
});
return;
}
if (!window.html2pdf) {
setModal({ isOpen: true, type: 'alert', title: 'Mohon Tunggu', message: 'Library PDF sedang dimuat.', targetId: null });
return;
}

setIsGeneratingPDF(true);
const element = document.getElementById(elementId);
const scrollPos = window.scrollY;
window.scrollTo(0, 0);

const opt = {
margin: 20, // 20mm (2 cm) merata
filename: filename,
image: { type: 'jpeg', quality: 0.98 },
html2canvas: { scale: 2, useCORS: true, scrollY: 0, scrollX: 0 },
jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
pagebreak: { mode: ['css', 'legacy'], avoid: ['tr', '.avoid-page-break'] }
};

window.html2pdf()
.set(opt)
.from(element)
.save()
.then(() => {
setIsGeneratingPDF(false);
window.scrollTo(0, scrollPos);
})
.catch((err) => {
console.error(err);
setIsGeneratingPDF(false);
window.scrollTo(0, scrollPos);
});
};

const handleDownloadRaportImagePNG = async (elementId, filename) => {
if (isLocked) {
setModal({
isOpen: true,
type: 'alert',
title: 'Akses Dibatasi',
message: 'Unduh berkas gambar Raport PNG dikunci untuk admin. Buka kunci admin di header.',
targetId: null
});
return;
}

setIsGeneratingImage(true);
try {
if (!window.html2canvas) {
await new Promise((resolve, reject) => {
const s = document.createElement('script');
s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
s.onload = resolve;
s.onerror = reject;
document.head.appendChild(s);
});
}

const targetEl = document.getElementById(elementId);
if (!targetEl) throw new Error("Elemen Raport tidak ditemukan");

const originalScrollY = window.scrollY;
window.scrollTo(0, 0);

const canvas = await window.html2canvas(targetEl, {
scale: 2,
useCORS: true,
allowTaint: true,
backgroundColor: '#ffffff',
scrollX: 0,
scrollY: 0,
logging: false
});

window.scrollTo(0, originalScrollY);

canvas.toBlob((blob) => {
const downloadName = filename.endsWith('.png') ? filename : filename.replace(/\.(jpg|jpeg)$/i, '.png');
if (!blob) {
const dataUrl = canvas.toDataURL('image/png', 1.0);
const link = document.createElement('a');
link.download = downloadName;
link.href = dataUrl;
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
setIsGeneratingImage(false);
return;
}

const blobUrl = URL.createObjectURL(blob);
const link = document.createElement('a');
link.download = downloadName;
link.href = blobUrl;
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
setIsGeneratingImage(false);
}, 'image/png');

} catch (err) {
console.error(err);
setIsGeneratingImage(false);
setModal({ isOpen: true, type: 'alert', title: 'Gagal', message: 'Gagal memproses gambar raport.', targetId: null });
}
};

const handleConfirmAction = async () => {
if (!modal.targetId) return;
try {
if (modal.type === 'confirm-delete-rec-adrenalin') {
await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'records', modal.targetId));
} else if (modal.type === 'confirm-delete-shared-student') {
if (modal.targetId.startsWith('init-')) {
const nimToDelete = modal.targetId.replace('init-', '');
await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'students'), {
nim: nimToDelete,
_deleted: true
});
} else {
await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', modal.targetId));
}
} else if (modal.type === 'confirm-delete-rule-adrenalin') {
await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'custom_rules', modal.targetId));
setRuleAdrenalin('');
} else if (modal.type === 'confirm-delete-rec-pemantauan') {
await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'records_pemantauan', modal.targetId));
} else if (modal.type === 'confirm-delete-rule-pemantauan') {
await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'custom_rules_pemantauan', modal.targetId));
setRulePemantauan('');
}
setModal({ isOpen: false, type: 'alert', title: '', message: '', targetId: null });
} catch (err) {
console.error(err);
setModal({ isOpen: true, type: 'alert', title: 'Gagal', message: 'Terjadi kesalahan saat menghapus data.', targetId: null });
}
};

return (
<div className="min-h-screen bg-gray-100 font-sans text-gray-900 flex flex-col">
{/* SPLASH SCREEN ELEGAN KOMISI KEDISIPLINAN (THEME MAROON & GOLD) */}
{showSplash && (
<div 
className={`fixed inset-0 z-[100] flex flex-col items-center justify-center select-none overflow-hidden transition-all duration-700 ease-in-out ${
isSplashExiting 
? 'opacity-0 scale-105 pointer-events-none' 
: 'opacity-100 scale-100'
}`}
style={{
background: 'radial-gradient(circle at center, #7A1417 0%, #4A0A0C 45%, #230406 100%)'
}}
>
{/* Ambient Lighting & Decorative Pattern */}
<div className="absolute inset-0 pointer-events-none overflow-hidden">
<div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse"></div>
<div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#D4AF37]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
<div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:32px_32px] opacity-15"></div>
</div>

{/* Core Animated Emblem & Typography */}
<div className="relative z-10 flex flex-col items-center text-center px-4 max-w-md sm:max-w-lg mx-auto">

{/* Animated Shield Crest with Orbital Rings */}
<div className="relative mb-6 flex items-center justify-center">
<div className="absolute w-40 h-40 rounded-full border border-dashed border-[#D4AF37]/50 animate-spin" style={{ animationDuration: '18s' }}></div>
<div className="absolute w-32 h-32 rounded-full border border-red-400/40 animate-ping opacity-25" style={{ animationDuration: '3s' }}></div>

<div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-[#8B181B] via-[#4A0A0C] to-[#2B0507] p-1 shadow-[0_0_50px_rgba(212,175,55,0.45)] border-2 border-[#D4AF37]">
<div className="w-full h-full rounded-[22px] bg-[#3B0709]/95 backdrop-blur-md flex items-center justify-center relative overflow-hidden">
<div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-pulse"></div>
<div className="relative z-10 flex flex-col items-center justify-center">
<Shield className="w-12 h-12 text-[#D4AF37] drop-shadow-[0_2px_12px_rgba(212,175,55,0.8)]" />
<Scale className="w-5 h-5 text-amber-200 -mt-2 drop-shadow" />
</div>
</div>
</div>
</div>

{/* Official Badge */}
<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#D4AF37]/50 text-[#D4AF37] text-xs font-black tracking-[0.25em] uppercase mb-3 shadow-inner">
<span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping"></span>
KOMISI KEDISIPLINAN
</div>

{/* Main Branding */}
<h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-[#F3E5AB] to-[#D4AF37] drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] font-sans">
ADRENALIN 2026
</h1>

{/* Subtitles */}
<p className="text-xs sm:text-sm text-red-200/90 font-semibold tracking-wider uppercase mt-1.5">
Fakultas Kedokteran • Universitas Wahid Hasyim
</p>
<p className="text-[11px] text-red-300/80 font-mono tracking-widest mt-0.5">
SISTEM KEDISIPLINAN TERPADU
</p>

{/* Progress Bar with Dynamic Stages */}
<div className="mt-8 w-64 sm:w-80 flex flex-col items-center">
<div className="w-full h-2 bg-black/70 rounded-full overflow-hidden border border-red-900/80 p-0.5 shadow-inner">
<div 
className="h-full bg-gradient-to-r from-[#D4AF37] via-amber-300 to-[#FDF4DC] rounded-full transition-all duration-700 ease-out shadow-[0_0_14px_#D4AF37]"
style={{ width: `${splashProgress}%` }}
/>
</div>

<div className="flex justify-between items-center w-full mt-2.5 text-[11px] text-red-200/90 font-mono">
<span className="truncate">
{splashProgress < 40 
? 'Menghubungkan Server SSO...' 
: splashProgress < 85 
? 'Menyinkronkan 151 Peserta & Regulasi...' 
: 'Portal Siap Digunakan'}
</span>
<span className="font-bold text-[#D4AF37] ml-2">{splashProgress}%</span>
</div>
</div>

{/* Action Buttons */}
<div className="mt-7 flex items-center gap-3">
<button
type="button"
onClick={handleSkipSplash}
className="px-6 py-2 rounded-full bg-gradient-to-r from-[#8B181B] to-[#540B0E] hover:from-[#A32023] hover:to-[#6B1214] border border-[#D4AF37] text-[#F3E5AB] text-xs font-black tracking-wider transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2 cursor-pointer"
>
<span>Masuk ke Portal</span>
<span>➔</span>
</button>
</div>
</div>

{/* Footer Copyright */}
<div className="absolute bottom-4 text-center text-[10px] text-red-300/60 tracking-wider uppercase">
&copy; 2026 KOMISI KEDISIPLINAN ADRENALIN FK UNWAHAS
</div>
</div>
)}

{/* HEADER SSO RESMI */}
<header className="bg-[#6B1214] text-white shadow-xl sticky top-0 z-40 border-b-4 border-[#A32023] print:hidden">
<div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center gap-3">
<div 
className="flex items-center gap-3 cursor-pointer group" 
onClick={handleReplaySplash}
title="Klik untuk memutar ulang animasi pembuka Komisi Kedisiplinan"
>
<div className="p-2 bg-[#4A0A0C] rounded-lg border border-[#D4AF37] shadow-inner group-hover:scale-105 transition-transform">
<Shield className="w-6 h-6 text-[#D4AF37]" />
</div>
<div>
<div className="flex items-center gap-2">
<span className="font-extrabold tracking-widest text-[#D4AF37] text-base sm:text-lg uppercase drop-shadow-sm group-hover:text-amber-200 transition-colors">ADRENALIN FK UNWAHAS</span>
<span className="text-[10px] bg-red-950 text-red-200 px-2 py-0.5 rounded font-mono border border-red-800">Uni v3.0</span>
</div>
<p className="text-[11px] text-red-200 tracking-wider">Portal Terpadu Sistem Kedisiplinan & Etika Akademika</p>
</div>
</div>

<div className="flex items-center gap-2 sm:gap-3">
{/* MASTER EXPORT */}
<button
type="button"
onClick={handleExportMasterJSON}
className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#D4AF37]/50 bg-[#4A0A0C] hover:bg-red-900 text-[#D4AF37] flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
title="Ekspor Master Backup Seluruh Portal Uni"
>
<CloudDownload className="w-4 h-4 text-[#D4AF37]" />
<span className="hidden sm:inline">Backup All</span>
</button>

{/* MASTER IMPORT */}
<div className="relative">
<input
type="file"
accept=".json"
ref={fileInputMasterRef}
onChange={handleImportMasterJSON}
className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
title="Pulihkan Seluruh Database Master dari File JSON"
/>
<button
type="button"
className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-red-800 bg-[#4A0A0C] hover:bg-red-900 text-red-200 flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm pointer-events-none"
>
<CloudUpload className="w-4 h-4 text-red-300" />
<span className="hidden sm:inline">Restore All</span>
</button>
</div>

{/* TOMBOL GEMBOK KEAMANAN */}
<button 
type="button"
onClick={handleToggleLock}
className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-black transition-all shadow-sm cursor-pointer active:scale-95 ${
isLocked 
? 'bg-red-950/80 border-red-700 hover:bg-red-900 text-red-200' 
: 'bg-emerald-700 border-emerald-400 hover:bg-emerald-600 text-white'
}`}
title={isLocked ? "Mode Hanya Lihat (Terkunci). Klik untuk memasukkan PIN Admin." : "Mode Admin Terbuka (Bisa Edit). Klik untuk mengunci kembali."}
>
{isLocked ? <Lock className="w-4 h-4 text-red-300" /> : <Unlock className="w-4 h-4 text-white" />}
<span>{isLocked ? 'Hanya Lihat' : 'Bisa Edit'}</span>
</button>

{/* TOMBOL SENTRAL KELOLA PESERTA */}
<button
type="button"
onClick={() => setIsStudentModalOpen(true)}
className="px-3 py-1.5 rounded-lg border border-amber-400/80 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white flex items-center gap-1.5 text-xs font-black shadow-md cursor-pointer active:scale-95"
title="Kelola Database Peserta Sentral (Tersinkron Otomatis ke Rekapitulasi & Pemantauan)"
>
<Users className="w-4 h-4 text-amber-100" />
<span>Daftar Peserta</span>
<span className="text-[10px] bg-black/30 px-1.5 py-0.2 rounded-full font-mono">{students.length}</span>
</button>
</div>
</div>

{/* SSO MODULE NAVIGATION BAR */}
<nav className="bg-[#4A0A0C] border-t border-red-900/60 overflow-x-auto no-scrollbar">
<div className="max-w-7xl mx-auto px-4 flex gap-1 sm:gap-2">
{[
{ id: 'tatib_peserta', label: 'Tatib Peserta', icon: BookOpen },
{ id: 'tatib_panitia', label: 'Tatib Panitia', icon: Briefcase },
{ id: 'rekap_adrenalin', label: 'Rekapitulasi Adrenalin', icon: Flame },
{ id: 'pemantauan_1th', label: 'Pemantauan 1 Tahun', icon: ShieldAlert },
{ id: 'raport_terpadu', label: 'Raport Terpadu', icon: Award }
].map((mod) => {
const Icon = mod.icon;
const isActive = currentModule === mod.id;
return (
<button
key={mod.id}
onClick={() => setCurrentModule(mod.id)}
className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
isActive 
? 'border-[#D4AF37] text-[#D4AF37] bg-red-900/40 shadow-inner' 
: 'border-transparent text-red-200/75 hover:text-white hover:bg-red-900/20'
}`}
>
<Icon className="w-4 h-4 shrink-0" />
<span>{mod.label}</span>
</button>
);
})}
</div>
</nav>
</header>

{/* BODY KONTEN PORTAL UTAMA */}
<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">

{/* MODUL 1: TATA TERTIB PESERTA */}
{currentModule === 'tatib_peserta' && (
<div className="space-y-6">
<div className="flex flex-wrap justify-between items-center bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200 gap-3">
<div className="flex items-center gap-2">
<BookOpen className="w-5 h-5 text-[#8B181B]" />
<h2 className="font-extrabold text-sm sm:text-base text-gray-900">Tata Tertib & Buku Saku Peserta Adrenalin 2026</h2>
</div>
<div className="flex gap-2">
{[
{ id: 'home', label: 'Dashboard' },
{ id: 'aturan', label: 'Aturan Tata Tertib' },
{ id: 'poin', label: 'Sistem Poin Pelanggaran' }
].map(t => (
<button
key={t.id}
onClick={() => setActivePesertaSubTab(t.id)}
className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
activePesertaSubTab === t.id ? 'bg-[#8B181B] text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
}`}
>
{t.label}
</button>
))}
</div>
</div>

{activePesertaSubTab === 'home' && (
<div className="space-y-6">
<div className="bg-white rounded-2xl shadow-sm p-6 border-l-8 border-[#8B181B]">
<h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">{dashboardPeserta.title}</h2>
<p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{dashboardPeserta.desc}</p>
<div className="flex flex-wrap gap-3 mt-4">
<button onClick={() => setActivePesertaSubTab('aturan')} className="flex items-center bg-[#8B181B] text-white text-xs px-3.5 py-2 rounded-lg font-bold shadow hover:bg-[#6B1214]">
<BookOpen className="w-3.5 h-3.5 mr-1.5" /> Buka Aturan Lengkap
</button>
<button onClick={() => setActivePesertaSubTab('poin')} className="flex items-center bg-white text-[#8B181B] border border-[#8B181B] text-xs px-3.5 py-2 rounded-lg font-bold hover:bg-red-50">
<AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Periksa Sistem Poin
</button>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
{dashboardPeserta.cards.map((c, idx) => (
<div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col items-center text-center">
<div className="p-2.5 bg-red-50 text-red-800 rounded-full mb-2">
{idx === 0 ? <ShieldAlert className="w-6 h-6" /> : idx === 1 ? <HelpCircle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
</div>
<h3 className="font-bold text-gray-800 text-xs sm:text-sm">{c.title}</h3>
<p className="text-2xl sm:text-3xl font-black text-red-700 my-1">{c.value}</p>
<p className="text-[11px] text-gray-500">{c.sub}</p>
</div>
))}
</div>
</div>
)}

{activePesertaSubTab === 'aturan' && (
<div className="space-y-4">
{aturanPeserta.map((kat, catIdx) => {
const isOpen = openAturanPeserta[catIdx];
return (
<div key={catIdx} className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
<div 
onClick={() => setOpenAturanPeserta(p => ({ ...p, [catIdx]: !p[catIdx] }))}
className="flex justify-between items-center p-4 bg-gray-50/70 border-b border-gray-100 cursor-pointer hover:bg-gray-100/70 transition-colors"
>
<div className="flex items-center gap-3">
<span className="p-2 bg-red-100 text-red-800 rounded-lg"><BookOpen className="w-4 h-4" /></span>
<span className="font-black text-sm text-gray-900">{kat.title}</span>
</div>
{isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
</div>
{isOpen && (
<div className="p-4 bg-white">
<ul className="space-y-2.5 text-xs sm:text-sm text-gray-700">
{kat.items.map((it, itemIdx) => (
<li key={itemIdx} className="flex items-start gap-2">
<span className="text-red-700 font-bold">•</span>
<span className="leading-relaxed">{it}</span>
</li>
))}
</ul>
</div>
)}
</div>
);
})}
</div>
)}

{activePesertaSubTab === 'poin' && (
<div className="space-y-4">
<div className="p-3 bg-red-100 border border-red-300 rounded-xl text-center text-xs font-black text-red-900 uppercase tracking-wide">
PESERTA DENGAN AKUMULASI POIN MELEBIHI 55 POIN DIKATEGORIKAN TIDAK LULUS ADRENALIN 2026
</div>
<div className="grid gap-4">
{pelanggaranPeserta.map((kat, idx) => (
<div key={idx} className={`rounded-xl border shadow-xs overflow-hidden ${kat.color}`}>
<div className="p-3.5 flex justify-between items-center border-b border-inherit bg-white/60">
<div className="font-black text-sm uppercase flex items-center gap-2">
<AlertTriangle className={`w-4 h-4 ${kat.iconColor}`} />
<span>Pelanggaran {kat.kategori}</span>
</div>
<span className="font-black text-xs px-2.5 py-1 bg-white rounded border border-inherit shadow-xs">
+{kat.poin} Poin
</span>
</div>
<div className="p-4">
<ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
{kat.items.map((it, iIdx) => (
<li key={iIdx} className="flex items-start gap-1.5 font-medium">
<span>•</span>
<span>{it}</span>
</li>
))}
</ul>
</div>
</div>
))}
</div>
</div>
)}
</div>
)}

{/* MODUL 2: TATA TERTIB PANITIA */}
{currentModule === 'tatib_panitia' && (
<div className="space-y-6">
<div className="bg-[#6B1214] text-white p-5 rounded-2xl shadow-md border-b-4 border-[#4A0A0C]">
<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
<div>
<div className="flex items-center gap-2">
<Briefcase className="w-5 h-5 text-[#D4AF37]" />
<h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-white">Portal Kedisiplinan Panitia Adrenalin 2026</h2>
</div>
<p className="text-red-200 text-xs mt-1 font-medium">
Fakultas Kedokteran Universitas Wahid Hasyim • Komisi Kedisiplinan
</p>
</div>
<div className="bg-red-950/70 p-3 rounded-xl border border-red-800 text-xs text-red-100 max-w-sm">
<p className="font-bold text-[#D4AF37] mb-1 flex items-center gap-1.5">
<CheckCircle className="w-4 h-4" /> Landasan Regulasi Resmi:
</p>
<ul className="list-disc pl-4 space-y-0.5 text-[11px] text-red-200">
<li><strong>PERAK FK 2020</strong> (Peraturan Akademik & Kode Etik)</li>
<li><strong>Peraturan Rektor No. 10/2025</strong> (Kawasan Tanpa Rokok / KTR)</li>
</ul>
</div>
</div>
</div>

<div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-xs">
<div className="flex items-start gap-3">
<AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
<div>
<h3 className="font-bold text-amber-900 text-xs sm:text-sm">Alur Perizinan Resmi Panitia</h3>
<p className="text-xs text-amber-800 leading-relaxed mt-0.5">
Izin tidak mengikuti rangkaian atau keterlambatan wajib melalui hierarki: 
<span className="font-black text-amber-950 ml-1.5 bg-amber-200/70 px-2 py-0.5 rounded border border-amber-300">
Kadiv ➔ Komdis ➔ OC
</span>
</p>
</div>
</div>
</div>

<div className="relative">
<Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
<input 
type="text" 
placeholder="Cari peraturan panitia (misal: 'denda', 'rokok', 'pakaian', 'zoom', 'helm')..." 
value={panitiaSearchQuery}
onChange={(e) => setPanitiaSearchQuery(e.target.value)}
className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#8B181B] bg-white outline-none text-xs sm:text-sm shadow-xs transition-shadow"
/>
</div>

<div className="flex bg-gray-200 p-1 rounded-xl">
{[
{ id: 'rapat', label: 'A. SAAT RAPAT & BRIEFING', count: PANITIA_RULES_DATA.filter(r => r.type === 'rapat').length },
{ id: 'hari-h', label: 'B. SAAT HARI-H OPERASIONAL', count: PANITIA_RULES_DATA.filter(r => r.type === 'hari-h').length }
].map(tab => (
<button
key={tab.id}
onClick={() => { setPanitiaActiveTab(tab.id); setSelectedPanitiaRuleId(null); }}
className={`flex-1 py-2.5 rounded-lg font-black text-xs sm:text-sm transition-all flex justify-center items-center gap-2 ${
panitiaActiveTab === tab.id 
? 'bg-[#8B181B] text-white shadow-sm' 
: 'text-gray-700 hover:text-[#8B181B] hover:bg-gray-100'
}`}
>
<Briefcase className="w-4 h-4" />
<span>{tab.label}</span>
<span className={`text-[10px] px-2 py-0.5 rounded-full ${panitiaActiveTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-800'}`}>
{tab.count}
</span>
</button>
))}
</div>

<div className="space-y-3">
{filteredPanitiaRules.length > 0 ? (
filteredPanitiaRules.map((rule) => {
const isExpanded = selectedPanitiaRuleId === rule.id;
return (
<div key={rule.id} className="bg-white p-4 sm:p-5 rounded-xl border-l-4 border-[#8B181B] shadow-xs border border-gray-200 hover:shadow-md transition-shadow">
<div className="flex flex-col md:flex-row justify-between items-start gap-4">
<div className="flex-1">
<div className="flex items-center gap-2 mb-1.5">
<span className="text-[10px] font-mono font-black bg-gray-100 border px-1.5 py-0.5 rounded text-gray-700">{rule.id}</span>
<span className="text-[11px] text-gray-500 font-semibold uppercase">{rule.type === 'rapat' ? 'Rangkaian Rapat' : 'Operasional Hari-H'}</span>
</div>
<p className="font-medium text-xs sm:text-sm text-gray-900 leading-relaxed">{rule.text}</p>

<div 
onClick={() => setSelectedPanitiaRuleId(isExpanded ? null : rule.id)}
className={`mt-3 inline-flex items-center gap-1.5 border px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${getPanitiaBasisBadge(rule.basisType)} hover:opacity-85`}
title="Klik untuk melihat penjelasan sinkronisasi dokumen"
>
{rule.basisType === 'perak' || rule.basisType === 'ktr' ? <Scale className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
<span className="font-bold">{rule.basisLabel}</span>
<span className="text-[10px] opacity-75">({isExpanded ? 'Tutup Landasan' : 'Lihat Landasan'})</span>
</div>
</div>

<div className="shrink-0 w-full md:w-auto">
<div className={`px-3 py-2 rounded-lg text-xs text-center border w-full md:w-48 flex justify-center items-center gap-1.5 shadow-2xs ${getPanitiaBadgeStyle(rule.penaltyType)}`}>
{rule.penalty}
</div>
</div>
</div>

{isExpanded && (
<div className={`mt-3.5 p-3.5 border-l-2 rounded-r-lg text-xs ${
rule.basisType === 'perak' ? 'bg-blue-50/70 border-blue-500 text-blue-900' : 
rule.basisType === 'ktr' ? 'bg-rose-50/70 border-rose-500 text-rose-900' :
'bg-slate-50 border-slate-400 text-slate-800'
}`}>
<div className="font-bold flex items-center gap-1.5 mb-1 opacity-90">
{rule.basisType === 'perak' || rule.basisType === 'ktr' ? <Scale className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
<span>Keterangan & Sinkronisasi Dokumen:</span>
</div>
<p className="leading-relaxed opacity-95 text-xs">{rule.basisDetail}</p>
</div>
)}
</div>
);
})
) : (
<div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
<Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
<p className="text-xs sm:text-sm font-medium">Tidak ada peraturan panitia yang cocok dengan kata kunci pencarian.</p>
</div>
)}
</div>
</div>
)}

{/* MODUL 3: REKAPITULASI ADRENALIN LIVE */}
{currentModule === 'rekap_adrenalin' && (
<div className="space-y-6">
<div className="flex flex-wrap gap-2 print:hidden">
{[
{ id: 'input', label: 'Form Input Pelanggaran', icon: PlusCircle },
{ id: 'klasemen', label: 'Papan Peringkat Poin', icon: Flame },
{ id: 'laporan', label: 'Laporan PDF (Portrait)', icon: Printer }
].map(tab => {
const Icon = tab.icon;
return (
<button
key={tab.id}
onClick={() => setActiveAdrenalinTab(tab.id)}
className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-2 text-xs sm:text-sm transition-all ${
activeAdrenalinTab === tab.id ? 'bg-[#8B181B] text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
}`}
>
<Icon className="w-4 h-4" /> {tab.label}
</button>
);
})}
</div>

{activeAdrenalinTab === 'input' && (
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
<div className="lg:col-span-6 space-y-6">
<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden border-t-4 border-t-red-800">
<div className="bg-red-50 px-4 py-3 border-b border-red-100 flex items-center justify-between">
<div className="flex items-center gap-2">
<Flame className="w-5 h-5 text-red-800" />
<h2 className="font-bold text-red-900 text-xs sm:text-sm">Form Input Pelanggaran Acara Adrenalin</h2>
</div>
<span className="text-[10px] text-gray-500 font-mono">151 Peserta Siap</span>
</div>

<form onSubmit={handleAddRecordAdrenalin} className="p-4 space-y-3.5 text-xs sm:text-sm">
<div>
<label className="block font-bold text-gray-700 mb-1">Hari / Momen Acara</label>
<select 
value={dayAdrenalin} 
onChange={(e) => setDayAdrenalin(e.target.value)}
className="w-full rounded-lg border-gray-300 p-2 border bg-white font-medium"
>
<option value="Pra-Adrenalin">Pra-Adrenalin</option>
<option value="Day 1">Day 1</option>
<option value="Day 2">Day 2</option>
<option value="Day 3">Day 3</option>
<option value="Custom">Lainnya (Custom)...</option>
</select>
{dayAdrenalin === 'Custom' && (
<input 
type="text" 
required
placeholder="Momen (Ex: Briefing Lapangan)"
value={customDayAdrenalin} 
onChange={(e) => setCustomDayAdrenalin(e.target.value)} 
className="mt-1.5 w-full rounded-lg border-gray-300 p-2 border bg-white text-xs" 
/>
)}
</div>

<div ref={dropdownAdrenalinRef} className="relative">
<label className="block font-bold text-gray-700 mb-1">Pilih Peserta Maba ({students.length} Terdaftar)</label>
<div className="relative">
<input 
type="text" 
required={!selectedNimAdrenalin}
placeholder="Ketik Nama atau NIM peserta..."
value={searchNimAdrenalin}
onChange={(e) => {
setSearchNimAdrenalin(e.target.value);
setIsAdrenalinDropdownOpen(true);
if (selectedNimAdrenalin) setSelectedNimAdrenalin('');
}}
onFocus={() => setIsAdrenalinDropdownOpen(true)}
className="w-full rounded-lg border-gray-300 p-2 pr-8 border bg-white text-xs sm:text-sm"
/>
<Search className="w-4 h-4 text-gray-400 absolute right-2.5 top-2.5" />
</div>
{isAdrenalinDropdownOpen && (
<div className="absolute z-50 mt-1 w-full bg-white shadow-xl max-h-48 rounded-lg overflow-y-auto border border-gray-200">
{filteredStudentsForAdrenalinForm.length === 0 ? (
<div className="p-3 text-xs text-gray-500 text-center">Peserta tidak ditemukan di database</div>
) : (
filteredStudentsForAdrenalinForm.map(s => (
<div 
key={s.nim}
onClick={() => {
setSelectedNimAdrenalin(s.nim);
setSearchNimAdrenalin(`${s.nim} - ${s.name}`);
setIsAdrenalinDropdownOpen(false);
}}
className="p-2.5 text-xs hover:bg-red-50 cursor-pointer border-b border-gray-100 last:border-0"
>
<div className="font-bold text-gray-800">{s.name}</div>
<div className="text-[11px] text-gray-500 font-mono">{s.nim}</div>
</div>
))
)}
</div>
)}
</div>

<div>
<label className="block font-bold text-gray-700 mb-1">Kategori Pelanggaran</label>
<select 
required
value={catAdrenalin}
onChange={(e) => {
const val = e.target.value;
setCatAdrenalin(val);
if (val === 'Custom') setRuleAdrenalin('Custom');
else setRuleAdrenalin('');
}}
className="w-full rounded-lg border-gray-300 p-2 border bg-white"
>
<option value="">-- Pilih Kategori --</option>
{allCategoriesAdrenalin.map(c => <option key={c} value={c}>{c}</option>)}
<option value="Custom" className="font-bold text-blue-600">Lainnya (Custom)...</option>
</select>
</div>

<div>
<label className="block font-bold text-gray-700 mb-1">Rincian Pelanggaran</label>
<select 
required
disabled={!catAdrenalin}
value={ruleAdrenalin}
onChange={(e) => setRuleAdrenalin(e.target.value)}
className="w-full rounded-lg border-gray-300 p-2 border disabled:bg-gray-100 bg-white"
>
<option value="">-- Pilih Rincian --</option>
{catAdrenalin !== 'Custom' && filteredRulesAdrenalin.map(r => (
<option key={r.id} value={r.id}>{r.name} (+{r.points})</option>
))}
<option value="Custom" className="font-bold text-blue-600">Lainnya (Custom)...</option>
</select>

{isSelectedRuleCustomAdrenalin && !isLocked && (
<button 
type="button"
onClick={() => setModal({ isOpen: true, type: 'confirm-delete-rule-adrenalin', title: 'Hapus Aturan', message: 'Hapus aturan kustom ini dari pilihan dropdown?', targetId: selectedCustomRuleDocIdAdrenalin })}
className="mt-1.5 text-xs text-red-600 font-bold flex items-center gap-1"
>
<Trash2 className="w-3 h-3" /> Hapus Aturan Ini
</button>
)}
</div>

{ruleAdrenalin === 'Custom' && (
<div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2.5 text-xs">
<div className="font-bold text-blue-900 border-b border-blue-200 pb-1">FORM ATURAN KUSTOM</div>
{catAdrenalin === 'Custom' && (
<input 
type="text" 
required 
placeholder="Nama Kategori Baru"
value={customCatAdrenalin} 
onChange={(e) => setCustomCatAdrenalin(e.target.value)} 
className="w-full rounded border-gray-300 p-2 border" 
/>
)}
<input 
type="text" 
required 
placeholder="Rincian Pelanggaran Baru"
value={customRuleNameAdrenalin} 
onChange={(e) => setCustomRuleNameAdrenalin(e.target.value)} 
className="w-full rounded border-gray-300 p-2 border" 
/>
{!isLocked ? (
<input 
type="number" 
min="0"
required 
placeholder="Poin (0 = Catatan)"
value={customPointsAdrenalin} 
onChange={(e) => setCustomPointsAdrenalin(e.target.value)} 
className="w-full rounded border-gray-300 p-2 border font-bold text-red-700" 
/>
) : (
<div className="p-2 bg-yellow-50 text-yellow-800 text-[11px] rounded border border-yellow-200 font-medium">
Mode Hanya Lihat: Poin kustom otomatis dicatat sebagai 0 Poin (Catatan).
</div>
)}
</div>
)}

<div>
<label className="block font-bold text-gray-700 mb-1">Bukti Foto (Opsional)</label>
<input 
type="file" 
accept="image/*"
ref={fileInputAdrenalinRef}
onChange={(e) => compressImage(e.target.files[0], setEvidenceAdrenalin, setIsUploadingAdrenalin)}
className="w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-bold file:bg-red-800 file:text-white border rounded p-1 bg-white"
/>
{isUploadingAdrenalin && <p className="text-xs text-blue-600 font-bold mt-1 animate-pulse">Mengompres gambar...</p>}
{evidenceAdrenalin && (
<div className="mt-2 relative inline-block">
<img src={evidenceAdrenalin} alt="Bukti" className="h-16 rounded border shadow-sm" />
<button type="button" onClick={() => { setEvidenceAdrenalin(''); if (fileInputAdrenalinRef.current) fileInputAdrenalinRef.current.value = ''; }} className="absolute -top-2 -right-2 bg-red-700 text-white rounded-full p-1 text-[10px]">✕</button>
</div>
)}
</div>

<div>
<label className="block font-bold text-gray-700 mb-1">Catatan Tambahan</label>
<textarea 
rows="2" 
value={notesAdrenalin} 
onChange={(e) => setNotesAdrenalin(e.target.value)} 
placeholder="Keterangan singkat..." 
className="w-full rounded-lg border-gray-300 p-2 border text-xs" 
/>
</div>

<button 
type="submit" 
disabled={isUploadingAdrenalin}
className="w-full bg-[#8B181B] hover:bg-[#6B1214] text-white py-2.5 rounded-lg font-bold shadow-sm transition-all text-xs sm:text-sm cursor-pointer"
>
Simpan Pelanggaran
</button>
</form>
</div>
</div>

<div className="lg:col-span-6 space-y-6">
<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
<div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
<div className="flex items-center gap-2">
<History className="w-4 h-4 text-gray-700" />
<h3 className="font-bold text-xs sm:text-sm text-gray-800">Riwayat Terkini Adrenalin ({recordsAdrenalin.length})</h3>
</div>
</div>
<div className="p-4 max-h-[520px] overflow-y-auto space-y-2.5">
{recordsAdrenalin.length === 0 ? (
<p className="text-gray-400 italic text-center py-8 text-xs">Belum ada pelanggaran yang dicatat.</p>
) : (
recordsAdrenalin.slice(0, 30).map(rec => (
<div key={rec.id} className="p-3 rounded-lg border border-gray-200 bg-white shadow-xs flex justify-between items-start gap-2 text-xs">
<div>
<div className="font-black text-gray-900">{rec.name} <span className="font-mono text-gray-500 font-normal">({rec.nim})</span></div>
<p className="text-red-800 font-bold mt-0.5">{rec.ruleName} <span className="text-gray-500 font-normal">[{rec.category}]</span></p>
{rec.notes && <p className="text-[11px] text-gray-600 mt-0.5 italic">"{rec.notes}"</p>}
<p className="text-[10px] text-gray-400 mt-1">{rec.day} • {rec.dateString}</p>
</div>
<div className="flex flex-col items-end gap-1.5 shrink-0">
<span className="font-black text-[10px] px-2 py-0.5 bg-red-50 text-red-800 border border-red-200 rounded">
+{rec.points} Pts
</span>
{rec.evidence && (
<a href={rec.evidence} target="_blank" rel="noreferrer" className="text-blue-600 font-bold text-[10px] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
Bukti
</a>
)}
{!isLocked && (
<button onClick={() => setModal({ isOpen: true, type: 'confirm-delete-rec-adrenalin', title: 'Hapus Rekapan', message: 'Hapus rekapan ini?', targetId: rec.id })} className="text-gray-400 hover:text-red-600 p-0.5">
<Trash2 className="w-3.5 h-3.5" />
</button>
)}
</div>
</div>
))
)}
</div>
</div>
</div>
</div>
)}

{activeAdrenalinTab === 'klasemen' && (
<div className="space-y-6">
<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
<div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
<div className="text-[11px] font-bold text-gray-500 uppercase">Total Kasus Tercatat</div>
<div className="text-2xl font-black text-gray-900 mt-1">{recordsAdrenalin.length}</div>
</div>
<div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
<div className="text-[11px] font-bold text-red-700 uppercase">Peserta Terkena Poin</div>
<div className="text-2xl font-black text-red-700 mt-1">{recapSummaryAdrenalin.filter(s => s.totalPoints > 0).length}</div>
</div>
<div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs col-span-2 sm:col-span-1">
<div className="text-[11px] font-bold text-emerald-700 uppercase">Peserta Bersih (0 Poin)</div>
<div className="text-2xl font-black text-emerald-700 mt-1">{recapSummaryAdrenalin.filter(s => s.totalPoints === 0).length}</div>
</div>
</div>

<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
<div className="bg-gray-900 text-white px-4 py-3.5 flex flex-wrap justify-between items-center gap-2.5">
<div className="flex items-center gap-2">
<Flame className="w-4 h-4 text-red-400" />
<h3 className="font-bold text-xs sm:text-sm">Papan Peringkat Pelanggaran Acara Adrenalin ({recapSummaryAdrenalin.length} Peserta)</h3>
</div>
<div className="flex gap-2">
<select 
value={sortByAdrenalin} 
onChange={(e) => setSortByAdrenalin(e.target.value)}
className="bg-gray-800 text-white rounded p-1 text-xs border border-gray-700"
>
<option value="points">Urut: Poin Tertinggi</option>
<option value="name">Urut: Nama (A-Z)</option>
<option value="nim">Urut: Urutan NIM</option>
</select>
<input 
type="text" 
placeholder="Cari..." 
value={searchTermAdrenalin} 
onChange={(e) => setSearchTermAdrenalin(e.target.value)}
className="px-2 py-1 rounded bg-white text-gray-900 text-xs w-28 sm:w-36" 
/>
</div>
</div>

<div className="max-h-[550px] overflow-y-auto">
<table className="w-full text-xs text-left">
<thead className="bg-gray-100 uppercase sticky top-0 font-black text-gray-600 text-[10px]">
<tr>
<th className="px-3 py-2.5 w-12 text-center">No</th>
<th className="px-3 py-2.5 w-32">NIM</th>
<th className="px-3 py-2.5">Nama Peserta</th>
<th className="px-3 py-2.5 text-center w-24">Jumlah Kasus</th>
<th className="px-3 py-2.5 text-center w-24">Total Poin</th>
</tr>
</thead>
<tbody className="divide-y divide-gray-100">
{recapSummaryAdrenalin.map((d, i) => (
<tr key={d.nim} className="hover:bg-gray-50">
<td className="px-3 py-2 text-center font-bold text-gray-500">{i + 1}</td>
<td className="px-3 py-2 font-mono text-gray-600">{d.nim}</td>
<td className="px-3 py-2 font-bold text-gray-900">{d.name}</td>
<td className="px-3 py-2 text-center font-semibold">{d.violationCount}</td>
<td className="px-3 py-2 text-center font-black text-red-700">{d.totalPoints}</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
</div>
)}

{activeAdrenalinTab === 'laporan' && (
<div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border space-y-4">
<div className="flex justify-between items-center border-b pb-4">
<div>
<h3 className="font-bold text-base">Cetak Laporan Adrenalin (Portrait A4)</h3>
<p className="text-xs text-gray-500">Standar resmi margin 2 cm. Format ringkas memuat jumlah akumulasi poin.</p>
</div>
<button onClick={() => handleDownloadPDFPortrait('adrenalin-pdf-container', `Laporan_Adrenalin_${Date.now()}.pdf`)} className="bg-red-800 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-red-900 cursor-pointer">
<Printer className="w-4 h-4" /> Unduh PDF Resmi
</button>
</div>

<div id="adrenalin-pdf-container" className="p-4 border bg-white text-xs">
<div className="border-b-4 border-red-900 pb-2 mb-4">
<h1 className="text-lg font-black uppercase">Laporan Kedisiplinan Acara Adrenalin 2026</h1>
<p className="text-gray-700 font-bold">Fakultas Kedokteran Universitas Wahid Hasyim</p>
<p className="text-[10px] text-gray-500">Waktu Tarik Data: {new Date().toLocaleString('id-ID')}</p>
</div>
<table className="w-full text-[11px] border-collapse border-2 border-black mb-6">
<thead className="bg-gray-200">
<tr>
<th className="border border-black px-2 py-1 text-center w-10">No</th>
<th className="border border-black px-2 py-1 text-left w-28">NIM</th>
<th className="border border-black px-2 py-1 text-left">Nama Peserta</th>
<th className="border border-black px-2 py-1 text-center w-20">Jml Kasus</th>
<th className="border border-black px-2 py-1 text-center w-24">Total Poin</th>
</tr>
</thead>
<tbody>
{recapSummaryAdrenalin.map((d, i) => (
<tr key={d.nim}>
<td className="border border-black px-2 py-1 text-center font-bold">{i + 1}</td>
<td className="border border-black px-2 py-1 font-mono">{d.nim}</td>
<td className="border border-black px-2 py-1 font-bold">{d.name}</td>
<td className="border border-black px-2 py-1 text-center">{d.violationCount}</td>
<td className="border border-black px-2 py-1 text-center font-black text-red-700">{d.totalPoints}</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
)}
</div>
)}

{/* MODUL 4: PEMANTAUAN 1 TAHUN */}
{currentModule === 'pemantauan_1th' && (
<div className="space-y-6">
<div className="flex flex-wrap gap-2 print:hidden">
{[
{ id: 'input', label: 'Portal Pelaporan', icon: PlusCircle },
{ id: 'klasemen', label: 'Klasemen Pelanggaran', icon: UserCheck },
{ id: 'laporan', label: 'Laporan PDF (Portrait)', icon: Printer }
].map(tab => {
const Icon = tab.icon;
return (
<button
key={tab.id}
onClick={() => setActivePemantauanTab(tab.id)}
className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-2 text-xs sm:text-sm transition-all ${
activePemantauanTab === tab.id ? 'bg-red-900 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
}`}
>
<Icon className="w-4 h-4" /> {tab.label}
</button>
);
})}
</div>

{activePemantauanTab === 'input' && (
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
<div className="lg:col-span-6 space-y-6">
<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden border-t-4 border-t-red-900">
<div className="bg-red-50 px-4 py-3 border-b border-red-100 flex items-center gap-2">
<Camera className="w-5 h-5 text-red-800" />
<h3 className="font-bold text-red-900 text-xs sm:text-sm">Form Lapor Pemantauan 1 Tahun</h3>
</div>

<form onSubmit={handleAddRecordPemantauan} className="p-4 space-y-3.5 text-xs sm:text-sm">
<div>
<label className="block font-bold text-gray-700 mb-1">Metode Laporan Peserta</label>
<div className="grid grid-cols-2 gap-2">
<button
type="button"
onClick={() => { setReportTypePemantauan('nama'); setSelectedNimPemantauan(''); }}
className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-1.5 font-bold text-xs transition-all ${
reportTypePemantauan === 'nama' ? 'bg-red-800 text-white border-red-900' : 'bg-gray-50 text-gray-700 border-gray-200'
}`}
>
<User className="w-3.5 h-3.5" /> Berdasarkan Nama
</button>
<button
type="button"
onClick={() => { setReportTypePemantauan('anonim'); setSelectedNimPemantauan(''); }}
className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-1.5 font-bold text-xs transition-all ${
reportTypePemantauan === 'anonim' ? 'bg-red-800 text-white border-red-900' : 'bg-gray-50 text-gray-700 border-gray-200'
}`}
>
<EyeOff className="w-3.5 h-3.5" /> Tanpa Nama (Anonim)
</button>
</div>
</div>

{reportTypePemantauan === 'nama' && (
<div ref={dropdownPemantauanRef} className="relative">
<label className="block font-bold text-gray-700 mb-1">Cari Peserta Terlapor ({students.length} Mahasiswa)</label>
<div className="relative">
<input 
type="text" 
required={reportTypePemantauan === 'nama' && !selectedNimPemantauan}
placeholder="Ketik Nama atau NIM..."
value={searchNimPemantauan}
onChange={(e) => {
setSearchNimPemantauan(e.target.value);
setIsPemantauanDropdownOpen(true);
if (selectedNimPemantauan) setSelectedNimPemantauan('');
}}
onFocus={() => setIsPemantauanDropdownOpen(true)}
className="w-full rounded-lg border-gray-300 p-2 pr-8 border bg-white text-xs sm:text-sm"
/>
<Search className="w-4 h-4 text-gray-400 absolute right-2.5 top-2.5" />
</div>
{isPemantauanDropdownOpen && (
<div className="absolute z-50 mt-1 w-full bg-white shadow-xl max-h-48 rounded-lg overflow-y-auto border border-gray-200">
{filteredStudentsForPemantauanForm.length === 0 ? (
<div className="p-3 text-xs text-gray-500 text-center">Peserta tidak ditemukan di database</div>
) : (
filteredStudentsForPemantauanForm.map(s => (
<div 
key={s.nim}
onClick={() => {
setSelectedNimPemantauan(s.nim);
setSearchNimPemantauan(`${s.nim} - ${s.name}`);
setIsPemantauanDropdownOpen(false);
}}
className="p-2.5 text-xs hover:bg-red-50 cursor-pointer border-b border-gray-100 last:border-0"
>
<div className="font-bold text-gray-800">{s.name}</div>
<div className="text-[11px] text-gray-500 font-mono">{s.nim}</div>
</div>
))
)}
</div>
)}
</div>
)}

{reportTypePemantauan === 'anonim' && (
<div className="p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-900 text-xs font-medium">
Pelanggaran akan dicatat sebagai <strong>Anonim / Tanpa Nama</strong> dan terdata pada rekapitulasi terpadu.
</div>
)}

<div>
<label className="block font-bold text-gray-700 mb-1">Momen Pelaporan</label>
<select 
value={dayPemantauan} 
onChange={(e) => setDayPemantauan(e.target.value)}
className="w-full rounded-lg border-gray-300 p-2 border bg-white font-medium text-xs sm:text-sm"
>
<option value="Bulan 1">Bulan 1</option>
<option value="Bulan 2">Bulan 2</option>
<option value="Bulan 3">Bulan 3</option>
<option value="Bulan 4">Bulan 4</option>
<option value="Bulan 5">Bulan 5</option>
<option value="Bulan 6">Bulan 6</option>
<option value="Bulan 7">Bulan 7</option>
<option value="Bulan 8">Bulan 8</option>
<option value="Bulan 9">Bulan 9</option>
<option value="Bulan 10">Bulan 10</option>
<option value="Bulan 11">Bulan 11</option>
<option value="Bulan 12">Bulan 12</option>
<option value="Custom">Lainnya (Custom)...</option>
</select>
</div>

<div>
<label className="block font-bold text-gray-700 mb-1">Kategori Pelanggaran</label>
<select 
required
value={catPemantauan}
onChange={(e) => {
const val = e.target.value;
setCatPemantauan(val);
if (val === 'Custom') setRulePemantauan('Custom');
else setRulePemantauan('');
}}
className="w-full rounded-lg border-gray-300 p-2 border bg-white"
>
<option value="">-- Pilih Kategori --</option>
{allCategoriesPemantauan.map(c => <option key={c} value={c}>{c}</option>)}
<option value="Custom" className="font-bold text-blue-600">Lainnya (Custom)...</option>
</select>
</div>

<div>
<label className="block font-bold text-gray-700 mb-1">Rincian Pelanggaran</label>
<select 
required
disabled={!catPemantauan}
value={rulePemantauan}
onChange={(e) => setRulePemantauan(e.target.value)}
className="w-full rounded-lg border-gray-300 p-2 border disabled:bg-gray-100 bg-white"
>
<option value="">-- Pilih Rincian --</option>
{catPemantauan !== 'Custom' && filteredRulesPemantauan.map(r => (
<option key={r.id} value={r.id}>{r.name} (+{r.points})</option>
))}
<option value="Custom" className="font-bold text-blue-600">Lainnya (Custom)...</option>
</select>
</div>

<div className="bg-red-50 p-3 rounded-lg border border-red-200">
<label className="block text-xs font-black text-red-900 mb-1 flex items-center gap-1.5">
<Camera className="w-4 h-4 text-red-700" /> BUKTI FOTO (WAJIB DILAMPIRKAN) *
</label>
<input 
type="file" 
accept="image/*"
required={!evidencePemantauan}
ref={fileInputPemantauanRef}
onChange={(e) => compressImage(e.target.files[0], setEvidencePemantauan, setIsUploadingPemantauan)}
className="w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-bold file:bg-red-800 file:text-white border border-red-300 rounded p-1 bg-white"
/>
{isUploadingPemantauan && <p className="text-xs text-blue-600 font-bold mt-1">Mengompres gambar...</p>}
{evidencePemantauan && (
<div className="mt-2 relative inline-block">
<img src={evidencePemantauan} alt="Bukti" className="h-16 rounded border-2 border-emerald-600 shadow-sm" />
<button type="button" onClick={() => { setEvidencePemantauan(''); if (fileInputPemantauanRef.current) fileInputPemantauanRef.current.value = ''; }} className="absolute -top-2 -right-2 bg-red-700 text-white rounded-full p-1 text-[10px]">✕</button>
</div>
)}
</div>

<div>
<label className="block font-bold text-gray-700 mb-1">Catatan Tambahan</label>
<textarea 
rows="2" 
value={notesPemantauan} 
onChange={(e) => setNotesPemantauan(e.target.value)} 
placeholder="Kronologi singkat..." 
className="w-full rounded-lg border-gray-300 p-2 border text-xs" 
/>
</div>

<button 
type="submit" 
disabled={isUploadingPemantauan || !evidencePemantauan}
className={`w-full py-2.5 rounded-lg font-bold shadow-sm transition-all text-xs sm:text-sm ${
!evidencePemantauan ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-red-900 hover:bg-red-950 text-white cursor-pointer'
}`}
>
{!evidencePemantauan ? 'Lampirkan Foto Untuk Mengirim' : 'Kirim Laporan Resmi'}
</button>
</form>
</div>
</div>

<div className="lg:col-span-6 space-y-6">
<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
<div className="bg-red-50 px-4 py-3 border-b border-red-100 flex justify-between items-center">
<div className="flex items-center gap-2">
<History className="w-4 h-4 text-red-900" />
<h3 className="font-bold text-xs sm:text-sm text-red-900">Umpan Laporan Pemantauan Terkini ({recordsPemantauan.length})</h3>
</div>
</div>
<div className="p-4 max-h-[520px] overflow-y-auto space-y-2.5">
{recordsPemantauan.length === 0 ? (
<p className="text-gray-400 italic text-center py-8 text-xs">Belum ada laporan pemantauan yang masuk.</p>
) : (
recordsPemantauan.slice(0, 30).map(rec => (
<div key={rec.id} className="p-3 rounded-lg border border-gray-200 bg-white shadow-xs flex justify-between items-start gap-2 text-xs">
<div>
<div className="font-black text-gray-900">{rec.name} <span className="font-mono text-gray-500 font-normal">({rec.nim})</span></div>
<p className="text-red-800 font-bold mt-0.5">{rec.ruleName} <span className="text-gray-500 font-normal">[{rec.category}]</span></p>
{rec.notes && <p className="text-[11px] text-gray-600 mt-0.5 italic">"{rec.notes}"</p>}
<p className="text-[10px] text-gray-400 mt-1">{rec.day} • {rec.dateString}</p>
</div>
<div className="flex flex-col items-end gap-1.5 shrink-0">
<span className="font-black text-[10px] px-2 py-0.5 bg-red-50 text-red-800 border border-red-200 rounded">
+{rec.points} Pts
</span>
{rec.evidence && (
<a href={rec.evidence} target="_blank" rel="noreferrer" className="text-blue-600 font-bold text-[10px] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
Bukti Foto
</a>
)}
{!isLocked && (
<button onClick={() => setModal({ isOpen: true, type: 'confirm-delete-rec-pemantauan', title: 'Hapus Laporan', message: 'Hapus data laporan ini?', targetId: rec.id })} className="text-gray-400 hover:text-red-600 p-0.5">
<Trash2 className="w-3.5 h-3.5" />
</button>
)}
</div>
</div>
))
)}
</div>
</div>
</div>
</div>
)}

{activePemantauanTab === 'klasemen' && (
<div className="space-y-6">
<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
<div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
<div className="text-[11px] font-bold text-gray-500 uppercase">Total Kasus Masuk</div>
<div className="text-2xl font-black text-gray-900 mt-1">{recordsPemantauan.length}</div>
</div>
<div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
<div className="text-[11px] font-bold text-red-700 uppercase">Peserta Terlapor</div>
<div className="text-2xl font-black text-red-700 mt-1">{recapSummaryPemantauan.filter(s => s.totalPoints > 0).length}</div>
</div>
<div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs col-span-2 sm:col-span-1">
<div className="text-[11px] font-bold text-emerald-700 uppercase">Peserta Bebas Kasus</div>
<div className="text-2xl font-black text-emerald-700 mt-1">{recapSummaryPemantauan.filter(s => s.totalPoints === 0).length}</div>
</div>
</div>

<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
<div className="bg-gray-900 text-white px-4 py-3 flex justify-between items-center gap-2 text-xs">
<div className="font-bold flex items-center gap-2">
<UserCheck className="w-4 h-4 text-red-400" />
<span>Klasemen Pelanggaran Pemantauan 1 Tahun ({recapSummaryPemantauan.length} Peserta)</span>
</div>
<div className="flex gap-2">
<select value={sortByPemantauan} onChange={(e) => setSortByPemantauan(e.target.value)} className="bg-gray-800 text-white rounded p-1 text-xs border border-gray-700">
<option value="points">Poin Tertinggi</option>
<option value="name">Nama (A-Z)</option>
<option value="nim">Urutan NIM</option>
</select>
<input type="text" placeholder="Cari..." value={searchTermPemantauan} onChange={(e) => setSearchTermPemantauan(e.target.value)} className="px-2 py-1 rounded bg-white text-gray-900 text-xs w-32" />
</div>
</div>

<div className="max-h-[550px] overflow-y-auto">
<table className="w-full text-xs text-left">
<thead className="bg-gray-100 uppercase sticky top-0 text-[10px] text-gray-600">
<tr>
<th className="px-3 py-2.5 text-center w-12">No</th>
<th className="px-3 py-2.5 w-32">NIM</th>
<th className="px-3 py-2.5">Nama Peserta</th>
<th className="px-3 py-2.5 text-center w-24">Jumlah Kasus</th>
<th className="px-3 py-2.5 text-center w-24">Total Poin</th>
</tr>
</thead>
<tbody className="divide-y divide-gray-100">
{recapSummaryPemantauan.map((d, i) => (
<tr key={d.nim} className="hover:bg-gray-50">
<td className="px-3 py-2 text-center font-bold text-gray-500">{i + 1}</td>
<td className="px-3 py-2 font-mono text-gray-600">{d.nim}</td>
<td className="px-3 py-2 font-bold text-gray-900">{d.name}</td>
<td className="px-3 py-2 text-center font-semibold">{d.violationCount}</td>
<td className="px-3 py-2 text-center font-black text-red-700">{d.totalPoints}</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
</div>
)}

{activePemantauanTab === 'laporan' && (
<div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border space-y-4">
<div className="flex justify-between items-center border-b pb-4">
<div>
<h3 className="font-bold text-base">Cetak Laporan Pemantauan 1 Tahun (Portrait A4)</h3>
<p className="text-xs text-gray-500">Standar resmi margin 2 cm. Format ringkas memuat jumlah akumulasi poin.</p>
</div>
<button onClick={() => handleDownloadPDFPortrait('pemantauan-pdf-container', `Laporan_Pemantauan_1Tahun_${Date.now()}.pdf`)} className="bg-red-900 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-red-950 cursor-pointer">
<Printer className="w-4 h-4" /> Unduh PDF Resmi
</button>
</div>

<div id="pemantauan-pdf-container" className="p-4 border bg-white text-xs">
<div className="border-b-4 border-red-900 pb-2 mb-4">
<h1 className="text-lg font-black uppercase">Laporan Pemantauan Kedisiplinan (1 Tahun)</h1>
<p className="text-gray-700 font-bold">Sistem Pemantauan Civitas Akademika FK UNWAHAS</p>
<p className="text-[10px] text-gray-500">Waktu Cetak: {new Date().toLocaleString('id-ID')}</p>
</div>
<table className="w-full text-[11px] border-collapse border-2 border-black mb-6">
<thead className="bg-gray-200">
<tr>
<th className="border border-black px-2 py-1 text-center w-10">No</th>
<th className="border border-black px-2 py-1 text-left w-28">NIM</th>
<th className="border border-black px-2 py-1 text-left">Nama Peserta</th>
<th className="border border-black px-2 py-1 text-center w-20">Jml Kasus</th>
<th className="border border-black px-2 py-1 text-center w-24">Total Poin</th>
</tr>
</thead>
<tbody>
{recapSummaryPemantauan.map((d, i) => (
<tr key={d.nim}>
<td className="border border-black px-2 py-1 text-center font-bold">{i + 1}</td>
<td className="border border-black px-2 py-1 font-mono">{d.nim}</td>
<td className="border border-black px-2 py-1 font-bold">{d.name}</td>
<td className="border border-black px-2 py-1 text-center">{d.violationCount}</td>
<td className="border border-black px-2 py-1 text-center font-black text-red-700">{d.totalPoints}</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
)}
</div>
)}

{/* MODUL 5: RAPORT TERPADU */}
{currentModule === 'raport_terpadu' && (
<div className="space-y-6">
<div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border space-y-4">
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
<div>
<h2 className="text-lg sm:text-xl font-black text-gray-900 flex items-center gap-2">
<Award className="w-6 h-6 text-[#8B181B]" /> Raport Kedisiplinan Terpadu
</h2>
<p className="text-xs text-gray-500 mt-0.5">
Menghitung akumulasi poin dari <strong>Acara Adrenalin + Pemantauan 1 Tahun</strong>. Poin &gt; 55 dinyatakan Tidak Lulus.
</p>
</div>
</div>

<div className="max-w-xl mx-auto" ref={dropdownRaportRef}>
<label className="block font-bold text-xs text-gray-700 mb-1.5">Pilih Peserta untuk Melihat Raport Lengkap ({students.length} Mahasiswa Tersedia):</label>
<div className="relative">
<input
type="text"
placeholder="Cari Nama atau NIM peserta..."
value={searchRaportStudent}
onChange={(e) => {
setSearchRaportStudent(e.target.value);
setIsRaportDropdownOpen(true);
if (selectedRaportNim) setSelectedRaportNim('');
}}
onFocus={() => setIsRaportDropdownOpen(true)}
className="w-full border border-gray-300 rounded-lg p-2.5 pr-8 text-xs font-medium bg-white focus:ring-2 focus:ring-[#8B181B] outline-none shadow-xs"
/>
<Search className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
</div>
{isRaportDropdownOpen && (
<div className="absolute z-50 mt-1 max-w-xl w-full bg-white shadow-xl max-h-56 rounded-lg overflow-y-auto border border-gray-200">
{filteredStudentsForRaport.length === 0 ? (
<div className="p-3 text-xs text-gray-500 text-center">Peserta tidak ditemukan</div>
) : (
filteredStudentsForRaport.map(s => (
<div
key={s.nim}
onClick={() => {
setSelectedRaportNim(s.nim);
setSearchRaportStudent(`${s.nim} - ${s.name}`);
setIsRaportDropdownOpen(false);
}}
className="p-2.5 text-xs hover:bg-red-50 cursor-pointer border-b border-gray-100 last:border-0"
>
<div className="font-bold text-gray-800">{s.name}</div>
<div className="text-[11px] text-gray-500 font-mono">{s.nim}</div>
</div>
))
)}
</div>
)}
</div>

{selectedRaportDetail && (
<div className="flex flex-col items-center pt-2">
<button
type="button"
onClick={() => handleDownloadRaportImagePNG('raport-terpadu-el', `Raport_Kedisiplinan_${selectedRaportDetail.nim}.png`)}
className="mb-4 bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
>
<Download className="w-4 h-4" /> Unduh Raport Terpadu PNG HD (Portrait 2cm)
</button>

<div className="w-full overflow-x-auto flex justify-center pb-6">
<div
id="raport-terpadu-el"
style={{ width: '680px', padding: '20mm' }}
className="bg-white border-2 border-black text-left box-border shrink-0 shadow-xl space-y-4"
>
<div className="text-center border-b-2 border-red-950 pb-3">
<span className="text-[10px] font-black bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded border border-gray-300 uppercase tracking-widest">
SISTEM KEDISIPLINAN TERPADU
</span>
<h1 className="text-lg font-black uppercase mt-1 tracking-wide text-gray-950">RAPORT KEDISIPLINAN MAHASISWA</h1>
<p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Fakultas Kedokteran Universitas Wahid Hasyim</p>
</div>

<div className="bg-gray-50 p-3 border border-gray-300 rounded-lg text-xs">
<div className="grid grid-cols-4 gap-y-1">
<span className="text-gray-500 font-bold">Nama Lengkap</span>
<span className="col-span-3 font-black uppercase text-gray-900">: {selectedRaportDetail.name}</span>
<span className="text-gray-500 font-bold">NIM</span>
<span className="col-span-3 font-mono font-bold text-gray-900">: {selectedRaportDetail.nim}</span>
<span className="text-gray-500 font-bold">Waktu Tarik</span>
<span className="col-span-3 text-gray-700">: {new Date().toLocaleString('id-ID')}</span>
</div>
</div>

<div className="grid grid-cols-3 gap-2 text-center text-xs">
<div className="p-2.5 bg-red-50 border border-red-200 rounded-lg">
<div className="text-[10px] font-bold text-gray-600 uppercase">Poin Adrenalin</div>
<div className="text-xl font-black text-red-800 my-0.5">{selectedRaportDetail.adrenalinPoints}</div>
<div className="text-[9px] text-gray-500">{selectedRaportDetail.adrenalinViolations.length} Kasus</div>
</div>

<div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
<div className="text-[10px] font-bold text-gray-600 uppercase">Poin Pemantauan</div>
<div className="text-xl font-black text-amber-800 my-0.5">{selectedRaportDetail.pemantauanPoints}</div>
<div className="text-[9px] text-gray-500">{selectedRaportDetail.pemantauanViolations.length} Kasus</div>
</div>

<div className="p-2.5 bg-gray-900 text-white rounded-lg border border-black flex flex-col justify-center">
<div className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Total Akumulasi</div>
<div className="text-2xl font-black text-red-400 my-0.5">{selectedRaportDetail.totalCombinedPoints}</div>
<div className="text-[9px] text-gray-300">{selectedRaportDetail.totalViolationsCount} Total Kasus</div>
</div>
</div>

<div className="border border-black p-3 rounded-lg text-center bg-gray-50">
<div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Status Evaluasi Kelulusan</div>
<div className="my-1.5">
<span className={`text-xs font-black px-4 py-1.5 rounded-full border uppercase tracking-widest ${selectedRaportDetail.statusColor}`}>
STATUS: {selectedRaportDetail.status}
</span>
</div>
<p className="text-[10px] text-gray-500 italic mt-1">
*Ketentuan: Akumulasi total poin &gt; 55 poin dinyatakan Tidak Lulus Adrenalin 2026.
</p>
</div>

<div className="space-y-2">
<div className="font-black text-xs uppercase text-gray-900 border-b border-gray-400 pb-1">
Rincian Kasus Pelanggaran
</div>
{selectedRaportDetail.totalViolationsCount === 0 ? (
<div className="p-4 text-center text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
Sangat Baik! Peserta ini tidak memiliki catatan pelanggaran kedisiplinan.
</div>
) : (
<table className="w-full text-[10px] border-collapse border border-black">
<thead className="bg-gray-200">
<tr>
<th className="border border-black px-1.5 py-1 text-center w-7">No</th>
<th className="border border-black px-1.5 py-1 text-left w-20">Sumber</th>
<th className="border border-black px-1.5 py-1 text-left">Rincian Pelanggaran</th>
<th className="border border-black px-1.5 py-1 text-center w-16">Waktu</th>
<th className="border border-black px-1.5 py-1 text-center w-12">Poin</th>
</tr>
</thead>
<tbody>
{selectedRaportDetail.adrenalinViolations.map((v, idx) => (
<tr key={'adr-' + idx}>
<td className="border border-black px-1.5 py-1 text-center font-bold">{idx + 1}</td>
<td className="border border-black px-1.5 py-1 font-bold text-red-800">Adrenalin</td>
<td className="border border-black px-1.5 py-1">
<div className="font-bold">{v.ruleName}</div>
<div className="text-[9px] text-gray-500">[{v.category}]</div>
</td>
<td className="border border-black px-1.5 py-1 text-center">{v.day}</td>
<td className="border border-black px-1.5 py-1 text-center font-bold text-red-700">+{v.points}</td>
</tr>
))}
{selectedRaportDetail.pemantauanViolations.map((v, idx) => (
<tr key={'pmn-' + idx}>
<td className="border border-black px-1.5 py-1 text-center font-bold">{selectedRaportDetail.adrenalinViolations.length + idx + 1}</td>
<td className="border border-black px-1.5 py-1 font-bold text-amber-800">Pemantauan</td>
<td className="border border-black px-1.5 py-1">
<div className="font-bold">{v.ruleName}</div>
<div className="text-[9px] text-gray-500">[{v.category}]</div>
</td>
<td className="border border-black px-1.5 py-1 text-center">{v.day}</td>
<td className="border border-black px-1.5 py-1 text-center font-bold text-red-700">+{v.points}</td>
</tr>
))}
</tbody>
</table>
)}
</div>

<div className="pt-4 flex justify-between items-end text-[10px]">
<div>
<p className="text-gray-500 font-mono">Kode Verifikasi Uni: UNWAHAS-{selectedRaportDetail.nim.slice(-4)}</p>
</div>
<div className="text-right">
<p className="font-bold text-gray-800">Komisi Kedisiplinan Adrenalin 2026</p>
<div className="h-10"></div>
<p className="font-black border-t border-black pt-1">KOMISI KEDISIPLINAN ADRENALIN FK UNWAHAS 2026</p>
</div>
</div>
</div>
</div>
</div>
)}
</div>
</div>
)}

</main>

{/* MODAL SENTRAL: KELOLA PESERTA */}
{isStudentModalOpen && (
<div className="fixed inset-0 z-[65] flex items-center justify-center bg-black bg-opacity-65 p-4">
<div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-300">
<div className="bg-[#6B1214] text-white px-5 py-3.5 flex justify-between items-center border-b-2 border-amber-400">
<div className="flex items-center gap-2">
<Users className="w-5 h-5 text-amber-300" />
<h3 className="font-black text-sm sm:text-base">Daftar Database Peserta Terpadu ({students.length} Mahasiswa)</h3>
</div>
<button 
onClick={() => setIsStudentModalOpen(false)}
className="text-red-200 hover:text-white font-bold p-1 rounded hover:bg-white/10"
>
<X className="w-5 h-5" />
</button>
</div>

<div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
<div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
<strong>Database Terintegrasi:</strong> Ke-<strong>{students.length} mahasiswa</strong> telah terdaftar dan <strong>otomatis tersinkronisasi</strong> secara serentak ke form input pelanggaran <em>Rekapitulasi Adrenalin</em>, form pelaporan <em>Pemantauan 1 Tahun</em>, dan berkas <em>Raport Terpadu</em>.
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
<h4 className="font-bold text-gray-800 mb-2">Tambah Peserta Manual</h4>
<form onSubmit={handleAddStudentManualShared} className="space-y-2.5">
<input
type="text"
disabled={isLocked}
placeholder="NIM (Ex: 26109011161)"
value={newNimShared}
onChange={(e) => setNewNimShared(e.target.value)}
className="w-full border border-gray-300 rounded-lg p-2 bg-white disabled:bg-gray-100"
/>
<input
type="text"
disabled={isLocked}
placeholder="Nama Lengkap Mahasiswa"
value={newNameShared}
onChange={(e) => setNewNameShared(e.target.value)}
className="w-full border border-gray-300 rounded-lg p-2 bg-white disabled:bg-gray-100"
/>
<button
type="submit"
disabled={isLocked}
className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white py-2 rounded-lg font-bold"
>
{isLocked ? 'Buka Kunci Admin Untuk Menambah' : 'Simpan ke Database'}
</button>
</form>
</div>

<div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
<h4 className="font-bold text-gray-800 mb-1.5">Ekstrak Massal (Copas Excel/Tabel)</h4>
<textarea
rows="3"
disabled={isLocked}
placeholder="26109011161 NAMA PESERTA LAIN&#10;26109011162 NAMA PESERTA LAIN"
value={bulkDataShared}
onChange={(e) => setBulkDataShared(e.target.value)}
className="w-full border border-gray-300 rounded-lg p-2 font-mono text-xs mb-2 disabled:bg-gray-100"
/>
<button
type="button"
onClick={handleBulkAddShared}
disabled={isLocked || isProcessingBulk || !bulkDataShared.trim()}
className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2 rounded-lg font-bold"
>
{isProcessingBulk ? 'Memproses...' : 'Ekstrak & Simpan Massal'}
</button>
</div>
</div>

<div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
<div className="p-3 bg-gray-100 border-b flex justify-between items-center gap-2">
<span className="font-bold text-xs text-gray-700">Daftar Mahasiswa ({students.length})</span>
<input
type="text"
placeholder="Cari NIM/Nama..."
value={searchStudentShared}
onChange={(e) => setSearchStudentShared(e.target.value)}
className="px-2.5 py-1 rounded-md border border-gray-300 bg-white text-xs w-48"
/>
</div>
<div className="max-h-72 overflow-y-auto">
<table className="w-full text-xs text-left">
<thead className="bg-gray-50 uppercase sticky top-0 text-[10px] text-gray-600 border-b">
<tr>
<th className="px-3 py-2 w-10 text-center">No</th>
<th className="px-3 py-2 w-32">NIM</th>
<th className="px-3 py-2">Nama Lengkap</th>
{!isLocked && <th className="px-3 py-2 text-right w-16">Aksi</th>}
</tr>
</thead>
<tbody className="divide-y divide-gray-100">
{students
.filter(s => s.name.toLowerCase().includes(searchStudentShared.toLowerCase()) || s.nim.includes(searchStudentShared))
.map((s, idx) => (
<tr key={s.id || s.nim} className="hover:bg-gray-50">
<td className="px-3 py-2 text-center text-gray-400">{idx + 1}</td>
<td className="px-3 py-2 font-mono text-gray-700">{s.nim}</td>
<td className="px-3 py-2 font-bold text-gray-900">{s.name}</td>
{!isLocked && (
<td className="px-3 py-2 text-right">
<button
type="button"
onClick={() => setModal({ isOpen: true, type: 'confirm-delete-shared-student', title: 'Hapus Peserta', message: `Hapus ${s.name} (${s.nim}) dari database sentral?`, targetId: s.id || ('init-' + s.nim) })}
className="text-red-500 hover:text-red-700 p-1"
title="Hapus peserta"
>
<Trash2 className="w-3.5 h-3.5 inline" />
</button>
</td>
)}
</tr>
))}
</tbody>
</table>
</div>
</div>
</div>

<div className="p-4 bg-gray-50 border-t flex justify-end">
<button
type="button"
onClick={() => setIsStudentModalOpen(false)}
className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-xs font-bold"
>
Tutup Jendela
</button>
</div>
</div>
</div>
)}

{/* MODAL DIALOG FEEDBACK */}
{modal.isOpen && (
<div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-60 p-4">
<div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-gray-200">
<div className={`px-4 py-3 border-b ${modal.title.includes('Gagal') || modal.title.includes('Dibatasi') || modal.title.includes('Wajib') ? 'bg-red-50 border-red-200 text-red-800' : 'bg-gray-50 border-gray-200 text-gray-800'}`}>
<h3 className="font-bold flex items-center gap-2 text-xs sm:text-sm">
{modal.title.includes('Sukses') || modal.title.includes('Berhasil') ? <CheckCircle className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4" />}
{modal.title}
</h3>
</div>
<div className="p-4">
<p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">{modal.message}</p>
</div>
<div className="px-4 py-3 bg-gray-50 flex justify-end gap-2 border-t border-gray-200">
{modal.type.startsWith('confirm') && (
<button onClick={() => setModal({ isOpen: false, type: 'alert', title: '', message: '', targetId: null })} className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg">
Batal
</button>
)}
<button onClick={() => modal.type.startsWith('confirm') ? handleConfirmAction() : setModal({ isOpen: false, type: 'alert', title: '', message: '', targetId: null })} className={`px-4 py-1.5 text-xs font-bold text-white rounded-lg ${modal.type.startsWith('confirm') ? 'bg-red-700 hover:bg-red-800' : 'bg-gray-800 hover:bg-gray-900'}`}>
{modal.type.startsWith('confirm') ? 'Ya, Lanjutkan' : 'Tutup'}
</button>
</div>
</div>
</div>
)}

{/* MODAL PIN KEAMANAN ADMIN */}
{isPinModalOpen && (
<div className="fixed inset-0 z-[80] flex items-center justify-center bg-black bg-opacity-60 p-4">
<div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-gray-200">
<div className="bg-[#6B1214] text-white px-4 py-3 flex items-center justify-between">
<h3 className="font-black flex items-center gap-2 text-xs sm:text-sm">
<Lock className="w-4 h-4 text-red-200" /> Buka Kunci Akses Admin
</h3>
<button onClick={() => { setIsPinModalOpen(false); setPinError(''); setPinInput(''); }} className="text-red-200 hover:text-white font-bold">
✕
</button>
</div>
<form onSubmit={handleVerifyPin} className="p-4 space-y-3">
<p className="text-xs text-gray-600 leading-relaxed">
Masukkan PIN Admin untuk mengaktifkan mode <strong>"Bisa Edit"</strong> (mengelola peserta sentral, menentukan poin custom, dan mengunduh laporan resmi).
</p>
<div>
<input 
type="password"
autoFocus
required
placeholder="Masukkan PIN..."
value={pinInput}
onChange={(e) => { setPinInput(e.target.value); setPinError(''); }}
className="w-full border border-gray-300 rounded-lg p-2 text-center text-lg font-mono tracking-widest outline-none focus:ring-2 focus:ring-red-600"
/>
{pinError && <p className="text-xs text-red-600 font-bold mt-1 text-center">{pinError}</p>}
</div>
<div className="flex gap-2 justify-end pt-2 border-t">
<button type="button" onClick={() => { setIsPinModalOpen(false); setPinError(''); setPinInput(''); }} className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 rounded">
Batal
</button>
<button type="submit" className="px-4 py-1.5 text-xs font-bold text-white bg-[#8B181B] hover:bg-[#6B1214] rounded">
Buka Kunci
</button>
</div>
</form>
</div>
</div>
)}

{/* FOOTER RESMI SSO */}
<footer className="bg-gray-900 border-t-4 border-[#8B181B] py-6 mt-auto print:hidden">
<div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-400">
<p className="font-bold text-white tracking-wider uppercase mb-1">KOMISI KEDISIPLINAN ADRENALIN 2026</p>
<p>&copy; 2026 Komisi Kedisiplinan Adrenalin Fakultas Kedokteran Universitas Wahid Hasyim, All Rights Reserved.</p>
</div>
</footer>

{/* STYLE CSS PORTRAIT PRINT STANDAR & ANIMASI */}
<style dangerouslySetInnerHTML={{__html: `
@media print {
.pdf-only-header { display: block !important; }
table { page-break-inside: auto; width: 100% !important; border-collapse: collapse !important; }
tr { page-break-inside: avoid !important; }
thead { display: table-header-group; }
}
`}} />
</div>
);
}