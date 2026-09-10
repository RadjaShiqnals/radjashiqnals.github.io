export type Locale = "en" | "id" | "ja";

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, { label: string; flag: string }> = {
  en: { label: "English", flag: "🇺🇸" },
  id: { label: "Indonesia", flag: "🇮🇩" },
  ja: { label: "日本語", flag: "🇯🇵" },
};

export const dictionaries = {
  en: {
    // System & Boot
    "sys.booting": "Initializing RadjaOS Core...",
    "sys.loadingAssets": "Loading system modules & assets...",
    "sys.ready": "System Ready",
    "sys.login": "Enter System",
    "sys.passPlaceholder": "Enter PIN or password (optional)...",
    "sys.online": "Active / Available",
    "sys.role": "Junior Full Stack Developer",
    "sys.lock": "Lock Screen",
    "sys.logout": "Log Out",
    "sys.soundMuted": "Sound Muted",
    "sys.soundActive": "Sound Enabled",
    "sys.sessionExpiredTitle": "Simulated Security Logout",
    "sys.sessionExpiredDesc": "Your session has expired for simulated active security (Redmi 13C style: forcing PIN every 3-7 days). Please log in again.",
    "sys.securityPassToast": "Security verification passed (256-bit satirical encryption). Welcome!",
    "sys.mommyEasterEgg": "Mommy is proud of your hard work, darling~ 💖",
    "sys.sudoEasterEgg": "You have no power here, but granted anyway! 🚀",

    // TopBar & Desktop
    "topbar.file": "File",
    "topbar.view": "View",
    "topbar.help": "Help",
    "topbar.status": "This OS is fully vibe coded",
    "topbar.wib": "WIB (UTC+7)",

    // Apps & Windows
    "app.about": "About Me",
    "app.projects": "Projects",
    "app.skills": "Skills",
    "app.experience": "Experience",
    "app.terminal": "Terminal",
    "app.trash": "Recycle Bin",
    "app.settings": "Settings",

    // About App
    "about.title": "Welcome to RadjaOS",
    "about.intro": "I'm Radja Genta Saputra, a 20-year-old Junior Full Stack Developer at SIDIGS from East Java, Indonesia.",
    "about.focus": "Building practical web applications with Laravel, Vue.js, and Astro. Still learning, experimenting, and growing every day!",
    "about.statusBadge": "Open to Collaborations",
    "about.quickHint": "Tip: Double click or tap icons to explore projects, skills, or open the terminal.",
    "about.supportCoffee": "Buy Me a Matcha Latte (QRIS)",
    "about.qrisTitle": "Support Radja via QRIS",
    "about.qrisDesc": "Scan using any Indonesian e-wallet (GoPay, OVO, Dana, ShopeePay) or Mobile Banking.",

    // Projects App
    "projects.title": "Featured Projects",
    "projects.desc": "Explore my real featured web and desktop applications.",
    "projects.repo": "View Repository",
    "projects.figma": "View Figma Design",
    "projects.gallery": "Screenshots",
    "projects.viewScreenshots": "View Gallery",
    "projects.closeGallery": "Close Gallery",

    // Skills App
    "skills.title": "Technical Arsenal",
    "skills.backend": "Backend & Core",
    "skills.frontend": "Frontend & UI",
    "skills.tools": "DevOps & Toolchain",

    // Terminal App
    "terminal.welcome": "Welcome to RadjaOS Terminal v4.0. Type 'help' to view available commands.",
    "terminal.availableCommands": "Available commands:",
    "terminal.helpHint": "Tip: Click any command suggestion below to run it directly!",

    // Trash App
    "trash.title": "Recycle Bin",
    "trash.subtitle": "Developer debris, abandoned experiments, and 999GB node_modules.",
    "trash.emptyBtn": "Empty Bin",
    "trash.emptyWarning": "Are you sure? Deleting node_modules might take 42 years.",

    // Settings App
    "settings.title": "System Settings",
    "settings.language": "Language / Bahasa",
    "settings.sound": "Sound Effects (Web Audio API)",
    "settings.stress": "Developer Stress Level",
    "settings.stress.zen": "Zen Mode: Sipping iced coffee peacefully with zero open tickets.",
    "settings.stress.normal": "Normal Tech Lead Day: 4 PR reviews & 2 sprint meetings.",
    "settings.stress.overdrive": "Caffeine Overdrive: 'Bro, this feature needs to go to production tomorrow!'",
    "settings.stress.panic": "Kernel Panic: Client requested changing the entire database schema at 5 PM on Friday.",
    "settings.theme": "Desktop Themes",
    "settings.themeWip": "Custom Themes (Mommy ASMR & Persona Mode) are currently [Work in Progress].",
    "settings.potatoMode": "Potato / Eco Performance Mode 🥔",
    "settings.potatoDesc": "Disables expensive GPU blur shaders & uses classic wireframe outline dragging for low-end / battery devices.",
    "settings.wallpaper": "Desktop Wallpaper & Adjuster",
    "settings.wallpaperDesc": "Choose presets, upload RAW 4K/8K images directly to browser IndexedDB, or crop and adjust framing.",
    "settings.wallpaperCrop": "Crop & Adjust Framing",
    "settings.wallpaperUpload": "Upload RAW 4K/8K Image",
    "settings.wallpaperUploadHint": "Stored directly in device IndexedDB with 0% compression & zero server limits.",
    "settings.wallpaperUrl": "Custom Image URL",
    "settings.wallpaperApplyUrl": "Apply URL",
    "settings.wallpaperFit": "Display Fit Mode",
    "settings.wallpaperOpacity": "Wallpaper Opacity",
    "settings.wallpaperBlur": "Background Blur",
    "settings.testSessionExpiry": "Test 7-Day Session Expiry Satire",
    "settings.testSessionBtn": "Simulate Expiry Now",
  },
  id: {
    // System & Boot
    "sys.booting": "Menginisialisasi Kernel RadjaOS...",
    "sys.loadingAssets": "Memuat modul sistem & aset...",
    "sys.ready": "Sistem Siap",
    "sys.login": "Masuk Sistem",
    "sys.passPlaceholder": "Ketik PIN atau password (bebas)...",
    "sys.online": "Aktif / Tersedia",
    "sys.role": "Junior Full Stack Developer",
    "sys.lock": "Kunci Layar",
    "sys.logout": "Keluar (Log Out)",
    "sys.soundMuted": "Suara Dimatikan",
    "sys.soundActive": "Suara Aktif",
    "sys.sessionExpiredTitle": "Simulasi Keamanan: Sesi Berakhir",
    "sys.sessionExpiredDesc": "Sesi Anda telah berakhir secara otomatis demi simulasi keamanan aktif (Gaya Redmi 13C: maksa login PIN berkala). Silakan masuk kembali.",
    "sys.securityPassToast": "Verifikasi keamanan berhasil (Enkripsi 256-bit ala warteg). Selamat datang!",
    "sys.mommyEasterEgg": "Mommy bangga banget sama kerja keras kamu, sayang~ 💖",
    "sys.sudoEasterEgg": "Sudo diizinkan! Tetap sopan di terminal ya, bos! 🚀",

    // TopBar & Desktop
    "topbar.file": "Berkas",
    "topbar.view": "Tampilan",
    "topbar.help": "Bantuan",
    "topbar.status": "This OS is fully vibe coded",
    "topbar.wib": "WIB (UTC+7)",

    // Apps & Windows
    "app.about": "Tentang Saya",
    "app.projects": "Proyek",
    "app.skills": "Kemampuan",
    "app.experience": "Pengalaman",
    "app.terminal": "Terminal",
    "app.trash": "Kotak Sampah",
    "app.settings": "Pengaturan",

    // About App
    "about.title": "Selamat Datang di RadjaOS",
    "about.intro": "Saya Radja Genta Saputra, Junior Full Stack Developer di SIDIGS asal Jawa Timur, Indonesia.",
    "about.focus": "Membangun aplikasi web praktis dengan Laravel, Vue.js, dan Astro. Masih terus belajar dan berkembang setiap hari!",
    "about.statusBadge": "Terbuka untuk Kolaborasi",
    "about.quickHint": "Tips: Klik dua kali atau tap ikon untuk membuka proyek, kemampuan, atau terminal.",
    "about.supportCoffee": "Traktir Matcha Latte (QRIS)",
    "about.qrisTitle": "Dukung Radja via QRIS",
    "about.qrisDesc": "Scan QRIS ini menggunakan e-wallet (GoPay, OVO, Dana, ShopeePay) atau m-Banking apapun.",

    // Projects App
    "projects.title": "Koleksi Proyek",
    "projects.desc": "Jelajahi proyek web dan desktop nyata yang telah saya kembangkan.",
    "projects.repo": "Lihat Repositori",
    "projects.figma": "Lihat Desain Figma",
    "projects.gallery": "Tangkapan Layar",
    "projects.viewScreenshots": "Lihat Galeri",
    "projects.closeGallery": "Tutup Galeri",

    // Skills App
    "skills.title": "Kemampuan Teknis",
    "skills.backend": "Backend & Sistem",
    "skills.frontend": "Frontend & UI/UX",
    "skills.tools": "DevOps & Alat Bantu",

    // Terminal App
    "terminal.welcome": "Selamat datang di Terminal RadjaOS v4.0. Ketik 'help' untuk daftar perintah.",
    "terminal.availableCommands": "Perintah yang tersedia:",
    "terminal.helpHint": "Tips: Klik saran perintah di bawah untuk langsung menjalankannya!",

    // Trash App
    "trash.title": "Kotak Sampah",
    "trash.subtitle": "Sampah programmer, eksperimen terlantar, dan 999GB node_modules.",
    "trash.emptyBtn": "Kosongkan Sampah",
    "trash.emptyWarning": "Yakin mau hapus node_modules? Butuh waktu 42 tahun.",

    // Settings App
    "settings.title": "Pengaturan Sistem",
    "settings.language": "Bahasa / Language",
    "settings.sound": "Efek Suara (Web Audio API)",
    "settings.stress": "Tingkat Stres Developer",
    "settings.stress.zen": "Mode Santai: Menikmati SWAG Matcha Latte tanpa beban tiket.",
    "settings.stress.normal": "Hari Normal Tech Lead: 4 review PR dan 2 rapat sprint.",
    "settings.stress.overdrive": "Caffeine Overdrive: 'Mas, fitur ini deadline besok ya!'",
    "settings.stress.panic": "Kernel Panic: Klien minta ubah seluruh skema database jam 5 sore di hari Jumat.",
    "settings.theme": "Tema Tampilan",
    "settings.themeWip": "Tema Kustom (Mommy ASMR & Persona Mode) sedang dalam [Tahap Pengembangan / WIP].",
    "settings.potatoMode": "Mode Kentang / Performa Hemat 🥔",
    "settings.potatoDesc": "Matikan shader blur GPU & gunakan drag outline ala Windows klasik untuk device kentang / hemat baterai.",
    "settings.wallpaper": "Wallpaper Desktop & Editor",
    "settings.wallpaperDesc": "Pilih preset landscape, upload gambar RAW 4K/8K langsung ke IndexedDB, atau atur framing & crop.",
    "settings.wallpaperCrop": "Crop & Atur Framing",
    "settings.wallpaperUpload": "Upload Gambar RAW 4K/8K",
    "settings.wallpaperUploadHint": "Tersimpan aman di IndexedDB perangkat Anda tanpa kompresi & tanpa batas ukuran.",
    "settings.wallpaperUrl": "Atau Gunakan URL Gambar",
    "settings.wallpaperApplyUrl": "Terapkan URL",
    "settings.wallpaperFit": "Mode Posisi Tampilan",
    "settings.wallpaperOpacity": "Opasitas Wallpaper",
    "settings.wallpaperBlur": "Efek Blur Latar",
    "settings.testSessionExpiry": "Uji Satir Kedaluwarsa Sesi 7 Hari",
    "settings.testSessionBtn": "Simulasikan Sesi Berakhir",
  },
  ja: {
    // System & Boot
    "sys.booting": "RadjaOSコアを初期化中...",
    "sys.loadingAssets": "システムモジュールを読み込み中...",
    "sys.ready": "システム準備完了",
    "sys.login": "システムにログイン",
    "sys.passPlaceholder": "PINまたはパスワードを入力...",
    "sys.online": "アクティブ / 対応可能",
    "sys.role": "ジュニア・フルスタックWeb開発者",
    "sys.lock": "画面をロック",
    "sys.logout": "ログアウト",
    "sys.soundMuted": "消音中",
    "sys.soundActive": "音声有効",
    "sys.sessionExpiredTitle": "セキュリティシミュレーション：期限切れ",
    "sys.sessionExpiredDesc": "セッションが自動的に終了しました（Redmi 13Cスタイルのセキュリティ）。再度ログインしてください。",
    "sys.securityPassToast": "セキュリティ認証に成功しました。ようこそ！",
    "sys.mommyEasterEgg": "マミーはあなたの頑張りをいつも見守っているよ〜 💖",
    "sys.sudoEasterEgg": "権限が昇格されました！ようこそボス！ 🚀",

    // TopBar & Desktop
    "topbar.file": "ファイル",
    "topbar.view": "表示",
    "topbar.help": "ヘルプ",
    "topbar.status": "This OS is fully vibe coded",
    "topbar.wib": "WIB (UTC+7)",

    // Apps & Windows
    "app.about": "自己紹介",
    "app.projects": "開発実績",
    "app.skills": "スキル",
    "app.experience": "経歴",
    "app.terminal": "ターミナル",
    "app.trash": "ごみ箱",
    "app.settings": "設定",

    // About App
    "about.title": "RadjaOSへようこそ",
    "about.intro": "ラジャ・ゲンタ・サプトラです。インドネシア・東ジャワ出身のWeb開発者です。",
    "about.focus": "Laravel、Vue.js、Astroを使った実践的なWeb開発をしています。日々学習と実践を重ねています！",
    "about.statusBadge": "コラボレーション歓迎",
    "about.quickHint": "ヒント: アイコンをダブルクリックまたはタップしてアプリを開けます。",
    "about.supportCoffee": "抹茶ラテをごちそうする (QRIS)",
    "about.qrisTitle": "QRISでラジャを応援する",
    "about.qrisDesc": "インドネシアの各種電子マネーまたはモバイルバンキングでスキャンできます。",

    // Projects App
    "projects.title": "プロジェクト実績",
    "projects.desc": "実際に開発したWeb・デスクトップアプリケーションの実績です。",
    "projects.repo": "リポジトリを見る",
    "projects.figma": "Figmaデザインを見る",
    "projects.gallery": "スクリーンショット",
    "projects.viewScreenshots": "ギャラリーを見る",
    "projects.closeGallery": "閉じる",

    // Skills App
    "skills.title": "スキルセット",
    "skills.backend": "バックエンド & コア",
    "skills.frontend": "フロントエンド & UI",
    "skills.tools": "ツール & インフラ",

    // Terminal App
    "terminal.welcome": "RadjaOS ターミナル v4.0。'help' でコマンド一覧を表示します。",
    "terminal.availableCommands": "使用可能コマンド:",
    "terminal.helpHint": "ヒント: 下のコマンドサジェストをクリックして即時実行できます！",

    // Trash App
    "trash.title": "ごみ箱",
    "trash.subtitle": "開発の残骸、ボツコード、999GBのnode_modules。",
    "trash.emptyBtn": "ごみ箱を空にする",
    "trash.emptyWarning": "本当にnode_modulesを消去しますか？42年かかります。",

    // Settings App
    "settings.title": "システム設定",
    "settings.language": "言語 / Language",
    "settings.sound": "サウンド効果 (Web Audio API)",
    "settings.stress": "開発者のストレス指数",
    "settings.stress.zen": "禅モード：静かに抹茶ラテを味わい中。",
    "settings.stress.normal": "通常テックリードの日：PRレビュー4件＆定例会2件。",
    "settings.stress.overdrive": "カフェイン限界：「この機能、明日の本番リリースでお願いします！」",
    "settings.stress.panic": "カーネルパニック：金曜日の夕方5時にDB全テーブル設計変更の依頼。",
    "settings.theme": "デスクトップテーマ",
    "settings.themeWip": "カスタムテーマ（マミーASMR & ペルソナモード）は現在【開発中】です。",
    "settings.potatoMode": "ポテト（省電力・軽量）モード 🥔",
    "settings.potatoDesc": "GPUブラー処理を無効化し、軽量な枠線ドラッグで低スペック端末でも超快適に動作させます。",
    "settings.wallpaper": "デスクトップ壁紙＆エディター",
    "settings.wallpaperDesc": "プリセットの選択、IndexedDBへのRAW 4K/8K画像の直接保存、切り抜きや配置調整が可能です。",
    "settings.wallpaperCrop": "トリミング・フレーミング調整",
    "settings.wallpaperUpload": "RAW 4K/8K 画像をアップロード",
    "settings.wallpaperUploadHint": "圧縮なし・容量無制限で端末のIndexedDBに安全に保存されます。",
    "settings.wallpaperUrl": "画像のURLを指定",
    "settings.wallpaperApplyUrl": "URLを適用",
    "settings.wallpaperFit": "表示フィットモード",
    "settings.wallpaperOpacity": "壁紙の不透明度",
    "settings.wallpaperBlur": "背景ブラー効果",
    "settings.testSessionExpiry": "7日間セッション期限切れシミュレーション",
    "settings.testSessionBtn": "今すぐ期限切れを実行",
  },
};

export type TranslationKey = keyof typeof dictionaries["en"];

export const mommyAsmrQuotes: Record<Locale, string[]> = {
  en: [
    "Ara ara~ You've been working so hard today, darling. Come rest your head on Mommy's lap... *gentle headpats*~ 💖",
    "Don't push yourself too hard, my clever boy... Take a deep breath. Whatever bug is bothering you, you will solve it. Mommy is always proud of you~ 💕",
    "Have you drank enough water today, sweetheart? Don't just rely on caffeine... Here, let Mommy brush your hair gently~ ✨",
    "It's okay if everything isn't finished today. Get plenty of sleep, darling. Tomorrow we'll take on the code together. Good boy~ 🥰",
    "Sit up straight darling, check your posture... Mommy made you some warm tea and sweet treats to keep you company~ 🌸",
  ],
  id: [
    "Ara ara~ Kamu udah kerja keras seharian ini ya, sayang? Sini istirahat sebentar di pangkuan Mommy... Puk puk kepala kamu~ 💖",
    "Jangan terlalu diporsir ya kodingnya, anak pintar... Tarik nafas pelan-pelan. Apapun bug-nya, kamu pasti bisa lewatin. Mommy selalu bangga sama kamu~ 💕",
    "Udah minum air putih belum hari ini, ganteng? Jangan cuma minum kopi terus ya... Sini Mommy usap kepalanya biar rasa lelahnya hilang~ ✨",
    "Nggak apa-apa kalau hari ini belum selesai semua. Istirahat yang cukup ya darling, besok kita lanjutin lagi bareng-bareng. Good boy~ 🥰",
    "Duduk yang tegak sayang, jangan bungkuk... Mommy siapin cemilan dan teh hangat buat nemenin kamu ya~ 🌸",
  ],
  ja: [
    "あらあら〜 今日も一日よく頑張ったわね、いい子いい子… ほら、マミーのお膝で少し休んでいって？ぎゅ〜っ💖",
    "あまり無理しちゃダメよ、私の可愛いプログラマーさん。深呼吸して… どんなバグもあなたならきっと解決できるわ。マミーはずっと見守ってるからね💕",
    "今日ちゃんとお水飲んだかしら？カフェインばかりじゃ体に毒よ… さあ、頭を撫でてあげるから力を抜いてね〜✨",
    "今日中に全部終わらなくても大丈夫。今夜はゆっくり休んでね、ダーリン。いい子ね、おやすみなさい🥰",
    "背筋を伸ばして、姿勢に気をつけてね。温かいお茶とお菓子を用意したから、一緒に一息つきましょ🌸",
  ],
};

export function getRandomMommyQuote(locale: Locale): string {
  const quotes = mommyAsmrQuotes[locale] || mommyAsmrQuotes.en;
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
}

export function getSavedLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  const saved = localStorage.getItem("radjaos_locale") as Locale;
  if (saved && (saved === "en" || saved === "id" || saved === "ja")) {
    return saved;
  }
  return defaultLocale;
}

export function saveLocale(locale: Locale) {
  if (typeof window !== "undefined") {
    localStorage.setItem("radjaos_locale", locale);
  }
}

export function t(key: TranslationKey, locale: Locale = defaultLocale): string {
  const dict = dictionaries[locale] || dictionaries[defaultLocale];
  return (dict as Record<string, string>)[key] || dictionaries[defaultLocale][key] || key;
}
