// Diagnostics from the Android app for the contact form.
//
// The app opens the form with its diagnostics report in the URL fragment:
// /support/contact?v=2.2&d=...#diag=<gzip, base64url>. Browsers never send the
// fragment to a server, so the report reaches no one until the person sends
// the form. This script reads it, wipes it from the address bar and history,
// shows the person what it holds, and hands it to the form's submit handler
// through window.SnoreDiag, only while the box stays ticked.
(function () {
    'use strict';

    var MAX_TEXT_BYTES = 1000000; // matches the app's DiagnosticsBundle.MAX_TEXT_BYTES

    var STRINGS = {
        en: { label: 'Diagnostics', from: 'from the app', attach: 'Attach diagnostics ({size})', view: 'View what’s included', hint: 'Your phone model, app settings, recent recording interruptions and the app’s event log. No recordings, no personal details.', close: 'Close' },
        ar: { label: 'بيانات التشخيص', from: 'من التطبيق', attach: 'إرفاق بيانات التشخيص ({size})', view: 'عرض المحتوى', hint: 'طراز هاتفك وإعدادات التطبيق وانقطاعات التسجيل الأخيرة وسجل أحداث التطبيق. لا تسجيلات ولا بيانات شخصية.', close: 'إغلاق' },
        da: { label: 'Diagnostik', from: 'fra appen', attach: 'Vedhæft diagnostik ({size})', view: 'Se indholdet', hint: 'Din telefonmodel, appens indstillinger, nylige afbrydelser af optagelsen og appens hændelseslog. Ingen optagelser, ingen personlige oplysninger.', close: 'Luk' },
        de: { label: 'Diagnosedaten', from: 'aus der App', attach: 'Diagnosedaten anhängen ({size})', view: 'Inhalt ansehen', hint: 'Dein Handymodell, die App-Einstellungen, letzte Aufnahmeunterbrechungen und das Ereignisprotokoll der App. Keine Aufnahmen, keine persönlichen Daten.', close: 'Schließen' },
        es: { label: 'Diagnóstico', from: 'de la app', attach: 'Adjuntar diagnóstico ({size})', view: 'Ver el contenido', hint: 'El modelo de tu teléfono, los ajustes de la app, las interrupciones recientes de la grabación y el registro de eventos de la app. Sin grabaciones ni datos personales.', close: 'Cerrar' },
        tl: { label: 'Diagnostics', from: 'mula sa app', attach: 'Ilakip ang diagnostics ({size})', view: 'Tingnan ang laman', hint: 'Ang modelo ng iyong phone, mga setting ng app, mga kamakailang pagkaputol ng recording at ang event log ng app. Walang recording, walang personal na detalye.', close: 'Isara' },
        fr: { label: 'Diagnostic', from: 'de l’app', attach: 'Joindre le diagnostic ({size})', view: 'Voir le contenu', hint: 'Le modèle de votre téléphone, les réglages de l’app, les interruptions récentes d’enregistrement et le journal d’événements de l’app. Aucun enregistrement, aucune donnée personnelle.', close: 'Fermer' },
        hi: { label: 'डायग्नोस्टिक्स', from: 'ऐप से', attach: 'डायग्नोस्टिक्स जोड़ें ({size})', view: 'क्या शामिल है देखें', hint: 'आपके फ़ोन का मॉडल, ऐप की सेटिंग्स, हाल में रिकॉर्डिंग में आई रुकावटें और ऐप का इवेंट लॉग। कोई रिकॉर्डिंग नहीं, कोई निजी जानकारी नहीं।', close: 'बंद करें' },
        id: { label: 'Diagnostik', from: 'dari aplikasi', attach: 'Lampirkan diagnostik ({size})', view: 'Lihat isinya', hint: 'Model ponsel Anda, pengaturan aplikasi, gangguan rekaman terbaru, dan log peristiwa aplikasi. Tanpa rekaman, tanpa data pribadi.', close: 'Tutup' },
        it: { label: 'Diagnostica', from: 'dall’app', attach: 'Allega la diagnostica ({size})', view: 'Vedi il contenuto', hint: 'Il modello del telefono, le impostazioni dell’app, le interruzioni recenti della registrazione e il registro eventi dell’app. Nessuna registrazione, nessun dato personale.', close: 'Chiudi' },
        ja: { label: '診断情報', from: 'アプリから', attach: '診断情報を添付（{size}）', view: '内容を見る', hint: 'お使いのスマホの機種、アプリの設定、最近の録音の中断、アプリのイベントログ。録音データや個人情報は含まれません。', close: '閉じる' },
        ko: { label: '진단 정보', from: '앱에서', attach: '진단 정보 첨부 ({size})', view: '포함된 내용 보기', hint: '휴대폰 모델, 앱 설정, 최근 녹음 중단 기록, 앱 이벤트 로그. 녹음 파일과 개인 정보는 포함되지 않습니다.', close: '닫기' },
        ms: { label: 'Diagnostik', from: 'daripada apl', attach: 'Lampirkan diagnostik ({size})', view: 'Lihat kandungan', hint: 'Model telefon anda, tetapan apl, gangguan rakaman terkini dan log peristiwa apl. Tiada rakaman, tiada maklumat peribadi.', close: 'Tutup' },
        nl: { label: 'Diagnose', from: 'uit de app', attach: 'Diagnose bijvoegen ({size})', view: 'Bekijk de inhoud', hint: 'Je telefoonmodel, de app-instellingen, recente onderbrekingen van de opname en het gebeurtenislogboek van de app. Geen opnames, geen persoonlijke gegevens.', close: 'Sluiten' },
        no: { label: 'Diagnostikk', from: 'fra appen', attach: 'Legg ved diagnostikk ({size})', view: 'Se innholdet', hint: 'Telefonmodellen din, appinnstillingene, nylige avbrudd i opptaket og appens hendelseslogg. Ingen opptak, ingen personopplysninger.', close: 'Lukk' },
        pl: { label: 'Diagnostyka', from: 'z aplikacji', attach: 'Dołącz diagnostykę ({size})', view: 'Zobacz zawartość', hint: 'Model telefonu, ustawienia aplikacji, ostatnie przerwy w nagrywaniu i dziennik zdarzeń aplikacji. Bez nagrań i danych osobowych.', close: 'Zamknij' },
        pt: { label: 'Diagnóstico', from: 'do app', attach: 'Anexar diagnóstico ({size})', view: 'Ver o conteúdo', hint: 'O modelo do seu telefone, as configurações do app, as interrupções recentes da gravação e o registro de eventos do app. Sem gravações, sem dados pessoais.', close: 'Fechar' },
        ru: { label: 'Диагностика', from: 'из приложения', attach: 'Приложить диагностику ({size})', view: 'Посмотреть содержимое', hint: 'Модель телефона, настройки приложения, недавние перерывы в записи и журнал событий приложения. Без записей и личных данных.', close: 'Закрыть' },
        sv: { label: 'Diagnostik', from: 'från appen', attach: 'Bifoga diagnostik ({size})', view: 'Visa innehållet', hint: 'Din telefonmodell, appens inställningar, senaste avbrotten i inspelningen och appens händelselogg. Inga inspelningar, inga personuppgifter.', close: 'Stäng' },
        th: { label: 'ข้อมูลวินิจฉัย', from: 'จากแอป', attach: 'แนบข้อมูลวินิจฉัย ({size})', view: 'ดูสิ่งที่รวมอยู่', hint: 'รุ่นโทรศัพท์ของคุณ การตั้งค่าแอป การบันทึกที่ถูกขัดจังหวะล่าสุด และบันทึกเหตุการณ์ของแอป ไม่มีไฟล์บันทึกเสียงและไม่มีข้อมูลส่วนตัว', close: 'ปิด' },
        tr: { label: 'Tanılama', from: 'uygulamadan', attach: 'Tanılama verilerini ekle ({size})', view: 'İçeriği gör', hint: 'Telefon modelin, uygulama ayarları, son kayıt kesintileri ve uygulamanın olay günlüğü. Kayıt yok, kişisel bilgi yok.', close: 'Kapat' },
        uk: { label: 'Діагностика', from: 'із застосунку', attach: 'Додати діагностику ({size})', view: 'Переглянути вміст', hint: 'Модель телефона, налаштування застосунку, нещодавні перерви в записі та журнал подій застосунку. Без записів і особистих даних.', close: 'Закрити' },
        'zh-Hans': { label: '诊断信息', from: '来自应用', attach: '附上诊断信息（{size}）', view: '查看包含的内容', hint: '你的手机型号、应用设置、最近的录音中断记录和应用事件日志。不含录音，不含个人信息。', close: '关闭' },
        'zh-Hant': { label: '診斷資訊', from: '來自 App', attach: '附上診斷資訊（{size}）', view: '查看包含的內容', hint: '你的手機型號、App 設定、最近的錄音中斷紀錄和 App 事件記錄。不含錄音，不含個人資訊。', close: '關閉' }
    };
    var T = STRINGS[document.documentElement.lang] || STRINGS.en;

    var text = null;
    var attach = null;

    function readFragment() {
        var m = /^#diag=([A-Za-z0-9_-]+)$/.exec(window.location.hash);
        if (!m) return null;
        // Drop the report from the address bar and this history entry before anything else.
        try {
            history.replaceState(history.state, '', window.location.pathname + window.location.search);
        } catch (e) { /* the report stays in the URL; harmless, it never left the phone */ }
        return m[1];
    }

    function base64UrlToBytes(s) {
        var b64 = s.replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4) b64 += '=';
        var bin = atob(b64);
        var bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return bytes;
    }

    function gunzip(bytes) {
        var stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
        return new Response(stream).text();
    }

    function utf8Base64(str) {
        var bytes = new TextEncoder().encode(str);
        var bin = '';
        for (var i = 0; i < bytes.length; i += 0x8000) {
            bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
        }
        return btoa(bin);
    }

    function sizeLabel(str) {
        var kb = Math.max(1, Math.round(new TextEncoder().encode(str).length / 1024));
        return kb + ' KB';
    }

    function render(form) {
        var anchor = form.querySelector('.contact-trap');
        var wrap = document.createElement('div');
        wrap.className = 'contact-diag';

        var heading = document.createElement('span');
        heading.className = 'contact-label';
        heading.textContent = T.label + ' ';
        var from = document.createElement('span');
        from.className = 'contact-optional';
        from.textContent = T.from;
        heading.appendChild(from);

        var row = document.createElement('label');
        row.className = 'contact-diag-toggle';
        attach = document.createElement('input');
        attach.type = 'checkbox';
        attach.checked = true;
        attach.id = 'contact-diag';
        var caption = document.createElement('span');
        caption.textContent = T.attach.replace('{size}', sizeLabel(text));
        row.appendChild(attach);
        row.appendChild(caption);

        var view = document.createElement('button');
        view.type = 'button';
        view.className = 'contact-diag-view';
        view.textContent = T.view;

        var hint = document.createElement('p');
        hint.className = 'contact-hint';
        hint.textContent = T.hint;

        var dialog = document.createElement('dialog');
        dialog.className = 'contact-diag-dialog';
        dialog.setAttribute('aria-label', T.label);
        var pre = document.createElement('pre');
        pre.textContent = text;
        var close = document.createElement('button');
        close.type = 'button';
        close.className = 'contact-lightbox-close';
        close.setAttribute('aria-label', T.close);
        close.textContent = '×';
        close.addEventListener('click', function () { dialog.close(); });
        dialog.appendChild(pre);
        dialog.appendChild(close);
        view.addEventListener('click', function () { dialog.showModal(); });

        wrap.appendChild(heading);
        wrap.appendChild(row);
        wrap.appendChild(view);
        wrap.appendChild(hint);
        wrap.appendChild(dialog);
        form.insertBefore(wrap, anchor);
    }

    window.SnoreDiag = {
        // Base64 of the UTF-8 report while attached, else undefined (JSON.stringify drops it).
        payload: function () {
            return text && attach && attach.checked ? utf8Base64(text) : undefined;
        },
        // After a successful send: forget the report and remove its controls.
        clear: function () {
            text = null;
            var wrap = document.querySelector('.contact-diag');
            if (wrap) wrap.remove();
        }
    };

    var encoded = readFragment();
    if (!encoded || typeof DecompressionStream === 'undefined') return;
    var form = document.getElementById('contact-form');
    if (!form) return;
    var bytes;
    try { bytes = base64UrlToBytes(encoded); } catch (e) { return; }
    gunzip(bytes).then(function (decoded) {
        if (!decoded) return;
        if (new TextEncoder().encode(decoded).length > MAX_TEXT_BYTES) {
            decoded = decoded.slice(decoded.length - MAX_TEXT_BYTES / 4);
        }
        text = decoded;
        render(form);
    }).catch(function () { /* unreadable report: the form works without it */ });
})();
