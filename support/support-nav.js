// Support Center navigation: single source of truth for page order and grouping.
// Renders the grouped, collapsible, color-coded sidebar and the prev/next pager.
(function () {
    'use strict';

    var m = window.location.pathname.match(/^\/(zh-Hant|zh|ar|da|de|es|fil|fr|hi|id|it|ja|ko|ms|nl|no|pl|pt|ru|sv|th|tr)\//);
    var langPrefix = m ? '/' + m[1] : '';

    // Localized UI strings. Page titles mirror each page's own breadcrumb so the
    // sidebar always matches the translation already published on the page.
    var STRINGS = {
        "en": {groups: {recording: "Recording", results: "Your results", devices: "Devices & health", help: "Help", guides: "Guides"}, allSupport: "All support", previous: "Previous", next: "Next", titles: {"getting-started": "Getting Started", "how-detection-works": "How Detection Works", "storage-and-quality": "Storage & Quality", "siri-and-shortcuts": "Siri, Shortcuts & Widgets", "timeline-and-playback": "Timeline & Playback", "episodes-and-events": "Episodes & Events", "breathing-disruptions": "Breathing Disruptions", "sleep-stages": "Sleep Stages", "sleep-score": "Sleep Score & Insights", "apple-watch": "Apple Watch & Biometrics", "export-and-sharing": "Export & Sharing", "android": "Android", "faq": "FAQ", "troubleshooting": "Troubleshooting", "first-week": "Your First Week", "doctor-ready-data": "Doctor-Ready Data", "test-a-remedy": "Testing a Snoring Fix", "deeper-sleep-data": "Deeper Sleep Data", "record-a-partner": "Tracking a Partner"}},
        "da": {groups: {recording: "Optagelse", results: "Dine resultater", devices: "Enheder og helbred", help: "Hjælp", guides: "Guider"}, allSupport: "Al support", previous: "Forrige", next: "Næste", titles: {"getting-started": "Kom godt i gang", "how-detection-works": "Sådan fungerer registrering", "storage-and-quality": "Lagring & Kvalitet", "siri-and-shortcuts": "Siri, Genveje & Widgets", "timeline-and-playback": "Tidslinje & afspilning", "episodes-and-events": "Episoder & hændelser", "breathing-disruptions": "Vejrtrækningsforstyrrelser", "sleep-stages": "Søvnfaser", "sleep-score": "Søvnscore & indsigter", "apple-watch": "Apple Watch & biometri", "export-and-sharing": "Eksport & deling", "android": "Android", "faq": "FAQ", "troubleshooting": "Fejlfinding", "first-week": "Din første uge", "doctor-ready-data": "Data til lægen", "test-a-remedy": "Test en løsning mod snorken", "deeper-sleep-data": "Dybere søvndata", "record-a-partner": "Optag en partner"}},
        "de": {groups: {recording: "Aufnahme", results: "Deine Ergebnisse", devices: "Geräte & Gesundheit", help: "Hilfe", guides: "Anleitungen"}, allSupport: "Gesamte Hilfe", previous: "Zurück", next: "Weiter", titles: {"getting-started": "Erste Schritte", "how-detection-works": "Wie die Erkennung funktioniert", "storage-and-quality": "Speicher & Qualität", "siri-and-shortcuts": "Siri, Kurzbefehle & Widgets", "timeline-and-playback": "Zeitleiste & Wiedergabe", "episodes-and-events": "Episoden & Ereignisse", "breathing-disruptions": "Atemaussetzer", "sleep-stages": "Schlafphasen", "sleep-score": "Schlafbewertung & Einblicke", "apple-watch": "Apple Watch & Biometrie", "export-and-sharing": "Export & Teilen", "android": "Android", "faq": "FAQ", "troubleshooting": "Fehlerbehebung", "first-week": "Deine erste Woche", "doctor-ready-data": "Atemauswertung für den Arzt", "test-a-remedy": "Eine Schnarchlösung testen", "deeper-sleep-data": "Tiefere Schlafdaten", "record-a-partner": "Partner aufnehmen"}},
        "es": {groups: {recording: "Grabación", results: "Tus resultados", devices: "Dispositivos y salud", help: "Ayuda", guides: "Guías"}, allSupport: "Toda la ayuda", previous: "Anterior", next: "Siguiente", titles: {"getting-started": "Primeros pasos", "how-detection-works": "Cómo funciona la detección", "storage-and-quality": "Almacenamiento y calidad", "siri-and-shortcuts": "Siri, Shortcuts y widgets", "timeline-and-playback": "Línea de tiempo y reproducción", "episodes-and-events": "Episodios y eventos", "breathing-disruptions": "Interrupciones respiratorias", "sleep-stages": "Fases del sueño", "sleep-score": "Puntuación de sueño e información", "apple-watch": "Apple Watch y Biometría", "export-and-sharing": "Exportar y compartir", "android": "Android", "faq": "Preguntas frecuentes", "troubleshooting": "Solución de problemas", "first-week": "Tu primera semana", "doctor-ready-data": "Datos para el médico", "test-a-remedy": "Probar un Remedio para los Ronquidos", "deeper-sleep-data": "Análisis Profundo de Datos del Sueño", "record-a-partner": "Registrar a una pareja"}},
        "fr": {groups: {recording: "Enregistrement", results: "Vos résultats", devices: "Appareils et santé", help: "Aide", guides: "Guides"}, allSupport: "Toute l'aide", previous: "Précédent", next: "Suivant", titles: {"getting-started": "Premiers pas", "how-detection-works": "Comment fonctionne la détection", "storage-and-quality": "Stockage & Qualité", "siri-and-shortcuts": "Siri, Raccourcis & Widgets", "timeline-and-playback": "Chronologie & Lecture", "episodes-and-events": "Épisodes & Événements", "breathing-disruptions": "Perturbations respiratoires", "sleep-stages": "Phases de sommeil", "sleep-score": "Score de sommeil & Bilan", "apple-watch": "Apple Watch & données biométriques", "export-and-sharing": "Export & partage", "android": "Android", "faq": "FAQ", "troubleshooting": "Dépannage", "first-week": "Votre première semaine", "doctor-ready-data": "Données pour le médecin", "test-a-remedy": "Tester un remède contre le ronflement", "deeper-sleep-data": "Données de sommeil approfondies", "record-a-partner": "Enregistrer un partenaire"}},
        "ja": {groups: {recording: "録音", results: "結果を見る", devices: "デバイスと健康", help: "ヘルプ", guides: "ガイド"}, allSupport: "サポート一覧", previous: "前へ", next: "次へ", titles: {"getting-started": "はじめに", "how-detection-works": "検出の仕組み", "storage-and-quality": "ストレージと品質", "siri-and-shortcuts": "Siri・ショートカット・ウィジェット", "timeline-and-playback": "タイムラインと再生", "episodes-and-events": "エピソードとイベント", "breathing-disruptions": "呼吸の乱れ", "sleep-stages": "睡眠ステージ", "sleep-score": "睡眠スコアとインサイト", "apple-watch": "Apple Watch とバイオメトリクス", "export-and-sharing": "エクスポートと共有", "android": "Android", "faq": "よくある質問", "troubleshooting": "トラブルシューティング", "first-week": "最初の1週間", "doctor-ready-data": "医師向けデータ", "test-a-remedy": "いびき対策の効果を測定する", "deeper-sleep-data": "より深く知る睡眠データ", "record-a-partner": "パートナーを記録する"}},
        "ko": {groups: {recording: "녹음", results: "결과 보기", devices: "기기 및 건강", help: "도움말", guides: "가이드"}, allSupport: "전체 지원", previous: "이전", next: "다음", titles: {"getting-started": "시작하기", "how-detection-works": "소리 감지 작동 방식", "storage-and-quality": "저장 공간 및 품질", "siri-and-shortcuts": "Siri, 단축어 및 위젯", "timeline-and-playback": "타임라인 및 재생", "episodes-and-events": "에피소드 및 이벤트", "breathing-disruptions": "호흡 중단", "sleep-stages": "수면 단계", "sleep-score": "수면 점수 & 인사이트", "apple-watch": "Apple Watch & 생체 신호", "export-and-sharing": "내보내기 & 공유", "android": "Android", "faq": "자주 묻는 질문", "troubleshooting": "문제 해결", "first-week": "첫 번째 주", "doctor-ready-data": "의사에게 보여줄 데이터", "test-a-remedy": "코골이 해결책 테스트하기", "deeper-sleep-data": "심층 수면 데이터", "record-a-partner": "파트너 추적하기"}},
        "nl": {groups: {recording: "Opnemen", results: "Je resultaten", devices: "Apparaten en gezondheid", help: "Help", guides: "Gidsen"}, allSupport: "Alle ondersteuning", previous: "Vorige", next: "Volgende", titles: {"getting-started": "Aan de slag", "how-detection-works": "Hoe detectie werkt", "storage-and-quality": "Opslag & Kwaliteit", "siri-and-shortcuts": "Siri, Snelkoppelingen & Widgets", "timeline-and-playback": "Tijdlijn & Afspelen", "episodes-and-events": "Afleveringen & Gebeurtenissen", "breathing-disruptions": "Ademhalingsonderbrekingen", "sleep-stages": "Slaapfasen", "sleep-score": "Slaapscore & Inzichten", "apple-watch": "Apple Watch & biometrie", "export-and-sharing": "Exporteren & Delen", "android": "Android", "faq": "Veelgestelde vragen", "troubleshooting": "Problemen oplossen", "first-week": "Je eerste week", "doctor-ready-data": "Gegevens voor de arts", "test-a-remedy": "Een snurkoplossing testen", "deeper-sleep-data": "Dieper in slaapdata", "record-a-partner": "Partner bijhouden"}},
        "no": {groups: {recording: "Opptak", results: "Resultatene dine", devices: "Enheter og helse", help: "Hjelp", guides: "Veiledninger"}, allSupport: "All støtte", previous: "Forrige", next: "Neste", titles: {"getting-started": "Kom i gang", "how-detection-works": "Slik fungerer deteksjon", "storage-and-quality": "Lagring og kvalitet", "siri-and-shortcuts": "Siri, Snarveier & widgets", "timeline-and-playback": "Tidslinje og avspilling", "episodes-and-events": "Episoder & hendelser", "breathing-disruptions": "Pustepauser", "sleep-stages": "Søvnfaser", "sleep-score": "Søvnscore og innsikter", "apple-watch": "Apple Watch og biometri", "export-and-sharing": "Eksport og deling", "android": "Android", "faq": "Vanlige spørsmål", "troubleshooting": "Feilsøking", "first-week": "Din første uke", "doctor-ready-data": "Data til legen", "test-a-remedy": "Teste et snorketiltak", "deeper-sleep-data": "Dypere søvndata", "record-a-partner": "Spore inn en partner"}},
        "pl": {groups: {recording: "Nagrywanie", results: "Twoje wyniki", devices: "Urządzenia i zdrowie", help: "Pomoc", guides: "Przewodniki"}, allSupport: "Cała pomoc", previous: "Poprzedni", next: "Następny", titles: {"getting-started": "Pierwsze kroki", "how-detection-works": "Jak działa wykrywanie", "storage-and-quality": "Pamięć i jakość", "siri-and-shortcuts": "Siri, Skróty i widżety", "timeline-and-playback": "Oś czasu i odtwarzanie", "episodes-and-events": "Epizody i zdarzenia", "breathing-disruptions": "Przerwy w oddychaniu", "sleep-stages": "Fazy snu", "sleep-score": "Wynik snu i spostrzeżenia", "apple-watch": "Apple Watch i biometria", "export-and-sharing": "Eksport i udostępnianie", "android": "Android", "faq": "FAQ", "troubleshooting": "Rozwiązywanie problemów", "first-week": "Twój pierwszy tydzień", "doctor-ready-data": "Dane gotowe dla lekarza", "test-a-remedy": "Testowanie sposobu na chrapanie", "deeper-sleep-data": "Głębsza analiza danych snu", "record-a-partner": "Nagrywanie partnera"}},
        "ru": {groups: {recording: "Запись", results: "Ваши результаты", devices: "Устройства и здоровье", help: "Помощь", guides: "Руководства"}, allSupport: "Все разделы", previous: "Назад", next: "Далее", titles: {"getting-started": "Начало работы", "how-detection-works": "Как работает распознавание", "storage-and-quality": "Хранилище и качество", "siri-and-shortcuts": "Siri, Shortcuts & виджеты", "timeline-and-playback": "Таймлайн и воспроизведение", "episodes-and-events": "Эпизоды и события", "breathing-disruptions": "Нарушения дыхания", "sleep-stages": "Фазы сна", "sleep-score": "Оценка сна и аналитика", "apple-watch": "Apple Watch & биометрия", "export-and-sharing": "Экспорт и передача данных", "android": "Android", "faq": "Часто задаваемые вопросы", "troubleshooting": "Устранение неполадок", "first-week": "Первая неделя", "doctor-ready-data": "Данные для врача", "test-a-remedy": "Проверка средства от храпа", "deeper-sleep-data": "Углублённый анализ данных о сне", "record-a-partner": "Запись партнёра"}},
        "sv": {groups: {recording: "Inspelning", results: "Dina resultat", devices: "Enheter och hälsa", help: "Hjälp", guides: "Guider"}, allSupport: "All support", previous: "Föregående", next: "Nästa", titles: {"getting-started": "Kom igång", "how-detection-works": "Hur detektering fungerar", "storage-and-quality": "Lagring & Kvalitet", "siri-and-shortcuts": "Siri, Genvägar & Widgetar", "timeline-and-playback": "Tidslinje & Uppspelning", "episodes-and-events": "Episoder & händelser", "breathing-disruptions": "Andningsavbrott", "sleep-stages": "Sömnstadier", "sleep-score": "Sömnpoäng & Insikter", "apple-watch": "Apple Watch & biometri", "export-and-sharing": "Export & Delning", "android": "Android", "faq": "Vanliga frågor", "troubleshooting": "Felsökning", "first-week": "Din första vecka", "doctor-ready-data": "Läkarfärdig data", "test-a-remedy": "Testa ett snarkbotemedel", "deeper-sleep-data": "Djupare sömndata", "record-a-partner": "Spela in en partner"}},
        "th": {groups: {recording: "การบันทึก", results: "ผลลัพธ์ของคุณ", devices: "อุปกรณ์และสุขภาพ", help: "ความช่วยเหลือ", guides: "คู่มือ"}, allSupport: "ความช่วยเหลือทั้งหมด", previous: "ก่อนหน้า", next: "ถัดไป", titles: {"getting-started": "เริ่มต้นใช้งาน", "how-detection-works": "การตรวจจับทำงานอย่างไร", "storage-and-quality": "พื้นที่เก็บข้อมูลและคุณภาพ", "siri-and-shortcuts": "Siri, Shortcuts & วิดเจ็ต", "timeline-and-playback": "ไทม์ไลน์และการเล่นเสียง", "episodes-and-events": "ตอนและเหตุการณ์", "breathing-disruptions": "การหยุดหายใจขณะนอนหลับ", "sleep-stages": "ระยะการนอนหลับ", "sleep-score": "คะแนนการนอนหลับ & ข้อมูลเชิงลึก", "apple-watch": "Apple Watch & ข้อมูลชีวภาพ", "export-and-sharing": "ส่งออก & แชร์", "android": "Android", "faq": "คำถามที่พบบ่อย", "troubleshooting": "การแก้ไขปัญหา", "first-week": "สัปดาห์แรกของคุณ", "doctor-ready-data": "ข้อมูลสำหรับแพทย์", "test-a-remedy": "การทดสอบวิธีแก้ไขการกรน", "deeper-sleep-data": "เจาะลึกข้อมูลการนอน", "record-a-partner": "การติดตามคู่นอน"}},
        "tr": {groups: {recording: "Kayıt", results: "Sonuçlarınız", devices: "Cihazlar ve sağlık", help: "Yardım", guides: "Kılavuzlar"}, allSupport: "Tüm destek", previous: "Önceki", next: "Sonraki", titles: {"getting-started": "Başlarken", "how-detection-works": "Algılama Nasıl Çalışır", "storage-and-quality": "Depolama & Kalite", "siri-and-shortcuts": "Siri, Kısayollar & Widget'lar", "timeline-and-playback": "Zaman Çizelgesi ve Oynatma", "episodes-and-events": "Bölümler ve Olaylar", "breathing-disruptions": "Solunum Kesintileri", "sleep-stages": "Uyku Evreleri", "sleep-score": "Uyku Puanı & İçgörüler", "apple-watch": "Apple Watch & Biyometri", "export-and-sharing": "Dışa Aktarma & Paylaşma", "android": "Android", "faq": "SSS", "troubleshooting": "Sorun Giderme", "first-week": "İlk Haftanız", "doctor-ready-data": "Doktora Hazır Veriler", "test-a-remedy": "Horlama Çözümünü Test Etmek", "deeper-sleep-data": "Daha Derin Uyku Verisi", "record-a-partner": "Partneri Takip Etmek"}},
        "zh": {groups: {recording: "录音", results: "您的结果", devices: "设备与健康", help: "帮助", guides: "指南"}, allSupport: "所有支持", previous: "上一篇", next: "下一篇", titles: {"getting-started": "入门指南", "how-detection-works": "声音检测原理", "storage-and-quality": "存储与质量", "siri-and-shortcuts": "Siri、快捷指令与小组件", "timeline-and-playback": "时间轴与回放", "episodes-and-events": "片段与事件", "breathing-disruptions": "呼吸中断", "sleep-stages": "睡眠阶段", "sleep-score": "睡眠评分与洞察", "apple-watch": "Apple Watch 与生物指标", "export-and-sharing": "导出与分享", "android": "Android", "faq": "常见问题", "troubleshooting": "故障排查", "first-week": "第一周", "doctor-ready-data": "医疗就诊数据", "test-a-remedy": "测试止鼾方法", "deeper-sleep-data": "深度睡眠数据", "record-a-partner": "记录伴侣的鼾声"}},
        "ar": {groups: {recording: "التسجيل", results: "نتائجك", devices: "الأجهزة والصحة", help: "المساعدة", guides: "الأدلة"}, allSupport: "كل المساعدة", previous: "السابق", next: "التالي", titles: {"getting-started": "البدء", "how-detection-works": "كيف يعمل الاكتشاف", "storage-and-quality": "التخزين والجودة", "siri-and-shortcuts": "Siri والاختصارات والأدوات", "timeline-and-playback": "المخطط الزمني والتشغيل", "episodes-and-events": "الحلقات والأحداث", "breathing-disruptions": "اضطرابات التنفس", "sleep-stages": "مراحل النوم", "sleep-score": "نقاط النوم والرؤى", "apple-watch": "Apple Watch والقياسات الحيوية", "export-and-sharing": "التصدير والمشاركة", "android": "Android", "faq": "الأسئلة الشائعة", "troubleshooting": "استكشاف الأخطاء وإصلاحها", "first-week": "أسبوعك الأول", "doctor-ready-data": "بيانات جاهزة للطبيب", "test-a-remedy": "اختبار علاج للشخير", "deeper-sleep-data": "بيانات نوم أعمق", "record-a-partner": "تتبّع الشريك"}},
        "fil": {groups: {recording: "Pagre-record", results: "Iyong mga resulta", devices: "Mga device at kalusugan", help: "Tulong", guides: "Mga gabay"}, allSupport: "Lahat ng tulong", previous: "Nakaraan", next: "Susunod", titles: {"getting-started": "Pagsisimula", "how-detection-works": "Paano Gumagana ang Pagtukoy", "storage-and-quality": "Storage at Kalidad", "siri-and-shortcuts": "Siri, Shortcuts & Widgets", "timeline-and-playback": "Timeline at Playback", "episodes-and-events": "Mga Episode at Event", "breathing-disruptions": "Mga Pagkagambala sa Paghinga", "sleep-stages": "Mga Yugto ng Tulog", "sleep-score": "Sleep Score at Insight", "apple-watch": "Apple Watch at Biometrics", "export-and-sharing": "Export at Pagbabahagi", "android": "Android", "faq": "FAQ", "troubleshooting": "Pag-troubleshoot", "first-week": "Ang Iyong Unang Linggo", "doctor-ready-data": "Data na Handa para sa Doktor", "test-a-remedy": "Pagsubok sa Lunas sa Paghilik", "deeper-sleep-data": "Mas Malalim na Datos ng Tulog", "record-a-partner": "Pag-track sa Partner"}},
        "hi": {groups: {recording: "रिकॉर्डिंग", results: "आपके परिणाम", devices: "डिवाइस और स्वास्थ्य", help: "सहायता", guides: "गाइड"}, allSupport: "सभी सहायता", previous: "पिछला", next: "अगला", titles: {"getting-started": "शुरुआत करें", "how-detection-works": "पहचान कैसे काम करती है", "storage-and-quality": "स्टोरेज और गुणवत्ता", "siri-and-shortcuts": "Siri, Shortcuts और Widgets", "timeline-and-playback": "टाइमलाइन और प्लेबैक", "episodes-and-events": "एपिसोड और इवेंट", "breathing-disruptions": "श्वास में बाधा", "sleep-stages": "नींद के चरण", "sleep-score": "Sleep Score और जानकारी", "apple-watch": "Apple Watch और बायोमेट्रिक्स", "export-and-sharing": "एक्सपोर्ट और साझाकरण", "android": "Android", "faq": "सामान्य प्रश्न", "troubleshooting": "समस्या निवारण", "first-week": "आपका पहला हफ्ता", "doctor-ready-data": "डॉक्टर के लिए तैयार डेटा", "test-a-remedy": "खर्राटों के उपाय का परीक्षण", "deeper-sleep-data": "गहन नींद डेटा", "record-a-partner": "साथी को ट्रैक करना"}},
        "id": {groups: {recording: "Perekaman", results: "Hasil Anda", devices: "Perangkat & kesehatan", help: "Bantuan", guides: "Panduan"}, allSupport: "Semua bantuan", previous: "Sebelumnya", next: "Berikutnya", titles: {"getting-started": "Memulai", "how-detection-works": "Cara Kerja Deteksi", "storage-and-quality": "Penyimpanan & Kualitas", "siri-and-shortcuts": "Siri, Shortcuts & Widget", "timeline-and-playback": "Lini Masa & Pemutaran", "episodes-and-events": "Episode & Kejadian", "breathing-disruptions": "Gangguan Pernapasan", "sleep-stages": "Tahap Tidur", "sleep-score": "Skor Tidur & Wawasan", "apple-watch": "Apple Watch & Biometrik", "export-and-sharing": "Ekspor & Berbagi", "android": "Android", "faq": "FAQ", "troubleshooting": "Pemecahan Masalah", "first-week": "Minggu Pertama Anda", "doctor-ready-data": "Data untuk Dokter", "test-a-remedy": "Menguji Solusi Mendengkur", "deeper-sleep-data": "Data Tidur Lebih Mendalam", "record-a-partner": "Melacak Pasangan"}},
        "it": {groups: {recording: "Registrazione", results: "I tuoi risultati", devices: "Dispositivi e salute", help: "Aiuto", guides: "Guide"}, allSupport: "Tutto l'aiuto", previous: "Precedente", next: "Successivo", titles: {"getting-started": "Per iniziare", "how-detection-works": "Come funziona il rilevamento", "storage-and-quality": "Spazio e qualità", "siri-and-shortcuts": "Siri, Comandi rapidi e widget", "timeline-and-playback": "Timeline e riproduzione", "episodes-and-events": "Episodi ed eventi", "breathing-disruptions": "Disturbi della respirazione", "sleep-stages": "Fasi del sonno", "sleep-score": "Punteggio del sonno e approfondimenti", "apple-watch": "Apple Watch e dati biometrici", "export-and-sharing": "Esportazione e condivisione", "android": "Android", "faq": "FAQ", "troubleshooting": "Risoluzione dei problemi", "first-week": "La tua prima settimana", "doctor-ready-data": "Dati per il medico", "test-a-remedy": "Testare un rimedio contro il russamento", "deeper-sleep-data": "Dati approfonditi sul sonno", "record-a-partner": "Registrare un partner"}},
        "ms": {groups: {recording: "Rakaman", results: "Keputusan anda", devices: "Peranti & kesihatan", help: "Bantuan", guides: "Panduan"}, allSupport: "Semua bantuan", previous: "Sebelumnya", next: "Seterusnya", titles: {"getting-started": "Bermula", "how-detection-works": "Cara Pengesanan Berfungsi", "storage-and-quality": "Storan & Kualiti", "siri-and-shortcuts": "Siri, Shortcuts & Widget", "timeline-and-playback": "Garis Masa & Main Semula", "episodes-and-events": "Episod & Kejadian", "breathing-disruptions": "Gangguan Pernafasan", "sleep-stages": "Peringkat Tidur", "sleep-score": "Skor Tidur & Cerapan", "apple-watch": "Apple Watch & Biometrik", "export-and-sharing": "Eksport & perkongsian", "android": "Android", "faq": "Soalan Lazim", "troubleshooting": "Penyelesaian Masalah", "first-week": "Minggu Pertama Anda", "doctor-ready-data": "Data untuk Doktor", "test-a-remedy": "Menguji Penyelesaian Dengkuran", "deeper-sleep-data": "Data Tidur Mendalam", "record-a-partner": "Menjejak Pasangan"}},
        "pt": {groups: {recording: "Gravação", results: "Os seus resultados", devices: "Dispositivos e saúde", help: "Ajuda", guides: "Guias"}, allSupport: "Toda a ajuda", previous: "Anterior", next: "Seguinte", titles: {"getting-started": "Primeiros passos", "how-detection-works": "Como funciona a deteção", "storage-and-quality": "Armazenamento e Qualidade", "siri-and-shortcuts": "Siri, Atalhos & Widgets", "timeline-and-playback": "Cronologia e Reprodução", "episodes-and-events": "Episódios & Eventos", "breathing-disruptions": "Perturbações respiratórias", "sleep-stages": "Fases do sono", "sleep-score": "Pontuação do sono & Resumo", "apple-watch": "Apple Watch & dados biométricos", "export-and-sharing": "Exportação & partilha", "android": "Android", "faq": "FAQ", "troubleshooting": "Resolução de problemas", "first-week": "A sua primeira semana", "doctor-ready-data": "Dados para o médico", "test-a-remedy": "Testar uma solução para o ressonar", "deeper-sleep-data": "Dados de sono mais aprofundados", "record-a-partner": "Registar um parceiro"}},
        "zh-Hant": {groups: {recording: "錄音", results: "你的結果", devices: "裝置與健康", help: "說明", guides: "指南"}, allSupport: "所有支援", previous: "上一篇", next: "下一篇", titles: {"getting-started": "開始使用", "how-detection-works": "偵測原理", "storage-and-quality": "儲存空間與品質", "siri-and-shortcuts": "Siri、捷徑與小工具", "timeline-and-playback": "時間軸與播放", "episodes-and-events": "事件段落與聲音事件", "breathing-disruptions": "呼吸中斷", "sleep-stages": "睡眠階段", "sleep-score": "睡眠分數與洞察", "apple-watch": "Apple Watch & 生理數據", "export-and-sharing": "匯出與分享", "android": "Android", "faq": "常見問題", "troubleshooting": "疑難排解", "first-week": "使用的第一週", "doctor-ready-data": "給醫師的數據", "test-a-remedy": "測試打鼾改善方法", "deeper-sleep-data": "深入睡眠資料", "record-a-partner": "追蹤伴侶"}}
    };
    var lang = (m && STRINGS[m[1]]) ? m[1] : 'en';
    var L = STRINGS[lang], EN = STRINGS.en;

    // Title for a slug in the active language, falling back to English.
    function pageTitle(slug) {
        return (L.titles && L.titles[slug]) || EN.titles[slug] || slug;
    }
    // Group label by key, falling back to English.
    function groupLabel(k) {
        return (L.groups && L.groups[k]) || EN.groups[k] || k;
    }

    // Visual sidebar groups, in order. `key` maps to the wayfinding color;
    // `labelKey` selects the translated heading.
    var GROUPS = [
        { labelKey: 'recording', key: 'recording', pages: [
            { slug: 'getting-started' },
            { slug: 'how-detection-works' },
            { slug: 'storage-and-quality' },
            { slug: 'siri-and-shortcuts' }
        ]},
        { labelKey: 'results', key: 'results', pages: [
            { slug: 'timeline-and-playback' },
            { slug: 'episodes-and-events' },
            { slug: 'breathing-disruptions' },
            { slug: 'sleep-stages' },
            { slug: 'sleep-score' }
        ]},
        { labelKey: 'devices', key: 'devices', pages: [
            { slug: 'apple-watch' },
            { slug: 'export-and-sharing' },
            { slug: 'android' }
        ]},
        { labelKey: 'help', key: 'help', pages: [
            { slug: 'faq' },
            { slug: 'troubleshooting' }
        ]},
        { labelKey: 'guides', key: 'help', pages: [
            { slug: 'first-week', guide: true },
            { slug: 'doctor-ready-data', guide: true },
            { slug: 'test-a-remedy', guide: true },
            { slug: 'deeper-sleep-data', guide: true },
            { slug: 'record-a-partner', guide: true }
        ]}
    ];

    // Flat order for the prev/next pager.
    var ORDER = [];
    GROUPS.forEach(function (g) { g.pages.forEach(function (p) { ORDER.push(p); }); });

    var current = document.body.getAttribute('data-support-page');

    function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text) n.textContent = text;
        return n;
    }

    function renderCurrentSubLinks() {
        var sections = document.querySelectorAll('.privacy-section[id]');
        if (!sections.length) return null;
        var sub = el('div', 'support-nav-sub');
        sections.forEach(function (section) {
            var h = section.querySelector('h2');
            if (!h) return;
            var a = el('a', null, h.textContent);
            a.href = '#' + section.id;
            sub.appendChild(a);
        });
        return sub.children.length ? sub : null;
    }

    function renderSidebar() {
        var nav = document.querySelector('.support-sidebar .support-nav');
        if (!nav) return;

        var home = el('a', 'support-nav-home', L.allSupport);
        home.href = langPrefix + '/support/';
        nav.appendChild(home);

        GROUPS.forEach(function (group) {
            var hasCurrent = group.pages.some(function (p) { return p.slug === current; });

            var wrap = el('div', 'support-nav-group');
            wrap.setAttribute('data-group', group.key);
            if (!hasCurrent) wrap.classList.add('is-collapsed');

            var btn = el('button', 'support-nav-group-label');
            btn.type = 'button';
            btn.setAttribute('aria-expanded', hasCurrent ? 'true' : 'false');
            btn.appendChild(el('span', 'support-nav-group-dot'));
            btn.appendChild(document.createTextNode(groupLabel(group.labelKey)));
            btn.addEventListener('click', function () {
                var collapsed = wrap.classList.toggle('is-collapsed');
                btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
            });
            wrap.appendChild(btn);

            var items = el('div', 'support-nav-group-items');
            group.pages.forEach(function (p) {
                var a = el('a', 'support-nav-item', pageTitle(p.slug));
                a.href = langPrefix + '/support/' + p.slug;
                if (p.slug === current) a.classList.add('is-current');
                items.appendChild(a);
            });
            wrap.appendChild(items);
            nav.appendChild(wrap);
        });
    }

    function pagerCell(page, label, cls) {
        var a = el('a', cls);
        a.href = langPrefix + '/support/' + page.slug;
        a.appendChild(el('span', 'pager-label', label));
        a.appendChild(el('span', 'pager-title', pageTitle(page.slug)));
        return a;
    }

    function renderPager() {
        var pager = document.getElementById('support-pager');
        if (!pager || !current) return;
        var i = ORDER.findIndex(function (p) { return p.slug === current; });
        if (i === -1) return;

        if (i > 0) {
            pager.appendChild(pagerCell(ORDER[i - 1], L.previous, 'pager-prev'));
        } else {
            var hub = el('a', 'pager-prev');
            hub.href = langPrefix + '/support/';
            hub.appendChild(el('span', 'pager-label', L.previous));
            hub.appendChild(el('span', 'pager-title', L.allSupport));
            pager.appendChild(hub);
        }
        if (i < ORDER.length - 1) {
            pager.appendChild(pagerCell(ORDER[i + 1], L.next, 'pager-next'));
        } else {
            pager.appendChild(el('span', 'pager-spacer'));
        }
    }

    renderSidebar();
    renderPager();
})();

/* Magnify pop-out connectors: draw a "zoom cone" from the highlighted
   region on the phone to the zoomed-in detail card. */
(function () {
    var SVGNS = 'http://www.w3.org/2000/svg';
    function draw() {
        var wide = window.matchMedia('(min-width: 681px)').matches;
        document.querySelectorAll('.feature-magnify').forEach(function (fm) {
            var region = fm.querySelector('.magnify-region');
            var img = fm.querySelector('.magnify-detail img');
            var svg = fm.querySelector('.magnify-connector');
            if (!region || !img) return;
            if (!wide) { if (svg) svg.innerHTML = ''; return; }
            if (!svg) {
                svg = document.createElementNS(SVGNS, 'svg');
                svg.setAttribute('class', 'magnify-connector');
                svg.setAttribute('aria-hidden', 'true');
                fm.insertBefore(svg, fm.firstChild);
            }
            var f = fm.getBoundingClientRect();
            var r = region.getBoundingClientRect();
            var d = img.getBoundingClientRect();
            svg.setAttribute('width', f.width);
            svg.setAttribute('height', f.height);
            svg.setAttribute('viewBox', '0 0 ' + f.width + ' ' + f.height);
            var rx = r.right - f.left, rt = r.top - f.top, rb = r.bottom - f.top;
            var dx = d.left - f.left, dt = d.top - f.top, db = d.bottom - f.top;
            svg.innerHTML =
                '<polygon class="mc-fill" points="' + rx + ',' + rt + ' ' + dx + ',' + dt + ' ' + dx + ',' + db + ' ' + rx + ',' + rb + '"/>' +
                '<line class="mc-line" x1="' + rx + '" y1="' + rt + '" x2="' + dx + '" y2="' + dt + '"/>' +
                '<line class="mc-line" x1="' + rx + '" y1="' + rb + '" x2="' + dx + '" y2="' + db + '"/>' +
                '<circle class="mc-dot" cx="' + rx + '" cy="' + ((rt + rb) / 2) + '" r="3"/>';
        });
    }
    if (document.querySelector('.feature-magnify')) {
        window.addEventListener('load', draw);
        window.addEventListener('resize', draw);
        document.querySelectorAll('.feature-magnify img').forEach(function (im) {
            if (!im.complete) im.addEventListener('load', draw);
        });
        if (window.ResizeObserver) {
            var ro = new ResizeObserver(function () { draw(); });
            document.querySelectorAll('.feature-magnify').forEach(function (fm) { ro.observe(fm); });
        }
        draw();
    }
})();

/* Route the "Open app" button to the visitor's store: Android -> Google Play,
   iOS and desktop keep the App Store link already in the markup. */
(function () {
    var cta = document.querySelector('.support-topbar-cta');
    if (cta && /Android/i.test(navigator.userAgent || '')) {
        cta.setAttribute('href', 'https://play.google.com/store/apps/details?id=com.meneliktucker.snoretimeline');
    }
})();

/* Footer language switcher: each language links to the current page, so readers
   stay where they are when switching. Reuses the homepage .lang-switcher styles. */
(function () {
    var col = document.querySelector('.support-footer .support-footer-col');
    if (!col) return;
    var LANGS = [
        ['en', 'ca', 'English'], ['ar', 'sa', 'العربية'], ['zh', 'cn', '中文'],
        ['zh-Hant', 'tw', '繁體中文'], ['da', 'dk', 'Dansk'], ['nl', 'nl', 'Nederlands'],
        ['fil', 'ph', 'Filipino'], ['fr', 'fr', 'Français'], ['de', 'de', 'Deutsch'],
        ['hi', 'in', 'हिन्दी'], ['id', 'id', 'Bahasa Indonesia'], ['it', 'it', 'Italiano'],
        ['ja', 'jp', '日本語'], ['ko', 'kr', '한국어'], ['ms', 'my', 'Bahasa Melayu'],
        ['no', 'no', 'Norsk'], ['pl', 'pl', 'Polski'], ['pt', 'pt', 'Português'],
        ['ru', 'ru', 'Русский'], ['es', 'es', 'Español'], ['sv', 'se', 'Svenska'],
        ['th', 'th', 'ไทย'], ['tr', 'tr', 'Türkçe']
    ];
    var m = window.location.pathname.match(/^\/(zh-Hant|zh|ar|da|de|es|fil|fr|hi|id|it|ja|ko|ms|nl|no|pl|pt|ru|sv|th|tr)\/support\//);
    var cur = m ? m[1] : 'en';
    var rest = 'support/' + (document.body.getAttribute('data-support-page') || '');
    function href(code) { return (code === 'en' ? '' : '/' + code) + '/' + rest; }
    var c = LANGS.filter(function (l) { return l[0] === cur; })[0] || LANGS[0];
    var opts = LANGS.map(function (l) {
        return '<a href="' + href(l[0]) + '"' + (l[0] === cur ? ' class="active"' : '') +
            '><img class="lang-flag" src="/flags/' + l[1] + '.svg" alt=""><span class="lang-name">' + l[2] + '</span></a>';
    }).join('');
    col.insertAdjacentHTML('beforeend',
        '<div class="lang-switcher"><button class="lang-switcher-btn" aria-label="Change language">' +
        '<img class="lang-flag" src="/flags/' + c[1] + '.svg" alt=""><span>' + c[2] + '</span>' +
        '<svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>' +
        '</button><div class="lang-dropdown">' + opts + '</div></div>');

    var sw = col.querySelector('.lang-switcher'), btn = sw.querySelector('.lang-switcher-btn'), backdrop = null;
    var isMobile = function () { return window.matchMedia('(max-width: 600px)').matches; };
    function close() { sw.classList.remove('open'); document.body.classList.remove('lang-sheet-open'); if (backdrop) { backdrop.remove(); backdrop = null; } }
    function open() {
        sw.classList.add('open');
        if (isMobile()) { document.body.classList.add('lang-sheet-open'); backdrop = document.createElement('div'); backdrop.className = 'lang-backdrop'; backdrop.addEventListener('click', close); document.body.appendChild(backdrop); }
    }
    btn.addEventListener('click', function (e) { e.stopPropagation(); sw.classList.contains('open') ? close() : open(); });
    document.addEventListener('click', function (e) { if (!sw.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
})();

// Platform-aware topbar "Download" CTA: swap Apple → Android robot + Play on Android.
(function () {
    if (!/android/i.test(navigator.userAgent || '')) return;
    var play = 'https://play.google.com/store/apps/details?id=com.meneliktucker.snoretimeline';
    var robot = '<path d="M17.6 9.48l1.84-3.18a.4.4 0 0 0-.15-.55.4.4 0 0 0-.54.16l-1.86 3.23a11.4 11.4 0 0 0-9.78 0L5.25 5.91a.4.4 0 0 0-.54-.16.4.4 0 0 0-.15.55L6.4 9.48A10.8 10.8 0 0 0 1 17.5h22a10.8 10.8 0 0 0-5.4-8.02zM7 14.75a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"/>';
    document.querySelectorAll('[data-store-cta]').forEach(function (a) {
        a.setAttribute('href', play);
        var icon = a.querySelector('.store-cta-icon');
        if (icon) icon.innerHTML = robot;
    });
}());
