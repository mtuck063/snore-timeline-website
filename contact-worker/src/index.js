// Relays the contact form on snoretimeline.com/support/contact to the developer's
// inbox. Nothing is stored or logged: the message goes out as one email and the
// Worker forgets it. The sender's IP address is never put in the email.
import { EmailMessage } from "cloudflare:email";

const MAX_MESSAGE = 5000;
const MAX_FIELD = 200;
// The page re-encodes every image as a JPEG of at most 1600 px and 500 KB
// before sending. The caps keep three images inside the free plan's 10 ms of
// CPU, which parsing, checking and line-wrapping them all spend.
const MAX_IMAGES = 3;
const MAX_IMAGE_BASE64 = 700_000; // ~520 KB decoded
// Rejecting any non-base64 character also rules out a forged MIME boundary,
// since boundaries need "-" and line breaks. A full anchored match costs twice the CPU.
const NOT_BASE64 = /[^A-Za-z0-9+/=]/;

export default {
    async fetch(request, env) {
        const origin = request.headers.get("Origin");
        const cors = {
            "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Vary": "Origin",
        };

        if (request.method === "OPTIONS") {
            return new Response(null, { status: 204, headers: cors });
        }
        if (request.method !== "POST") {
            return json({ ok: false, error: "method" }, 405, cors);
        }
        // Browsers always send Origin on a cross-site POST; anything else is a script.
        if (origin !== env.ALLOWED_ORIGIN) {
            return json({ ok: false, error: "origin" }, 403, cors);
        }

        // Refuse oversized bodies before parsing them costs CPU.
        if (Number(request.headers.get("Content-Length") || 0) > MAX_IMAGES * MAX_IMAGE_BASE64 + 20_000) {
            return json({ ok: false, error: "image" }, 413, cors);
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return json({ ok: false, error: "invalid" }, 400, cors);
        }

        // Honeypot: the field is hidden from people, so only bots fill it.
        // Report success so they don't learn to skip it.
        if (typeof body.website === "string" && body.website.length > 0) {
            return json({ ok: true }, 200, cors);
        }

        const message = clean(body.message, MAX_MESSAGE, true);
        const replyTo = clean(body.email, MAX_FIELD, false);
        const details = clean(body.details, MAX_FIELD, false);

        if (message.length < 2) {
            return json({ ok: false, error: "empty" }, 400, cors);
        }
        if (replyTo && !/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(replyTo)) {
            return json({ ok: false, error: "email" }, 400, cors);
        }

        const images = body.images === undefined ? [] : body.images;
        if (!Array.isArray(images) || images.length > MAX_IMAGES ||
            !images.every((img) => typeof img === "string" && img.length > 0 && img.length <= MAX_IMAGE_BASE64 && !NOT_BASE64.test(img))) {
            return json({ ok: false, error: "image" }, 400, cors);
        }

        const footer = [];
        if (details) footer.push(`Details: ${details}`);
        footer.push(replyTo ? `Reply to: ${replyTo}` : "Reply to: anonymous");
        if (images.length) footer.push(`Screenshots: ${images.length} attached`);
        const text = [message, "", "--", ...footer].join("\n");

        // Gmail threads identical subjects into one conversation, so each
        // message gets its send time: "Snore Timeline Feedback · Oct 14, 7:33:12 AM".
        const sentAt = new Intl.DateTimeFormat("en-US", {
            timeZone: env.TIME_ZONE,
            month: "short", day: "numeric",
            hour: "numeric", minute: "2-digit", second: "2-digit",
        }).format(new Date());

        const raw = buildMime({
            from: env.FROM_ADDRESS,
            to: env.DESTINATION,
            replyTo,
            subject: `Snore Timeline Feedback · ${sentAt}`,
            text,
            images,
        });

        try {
            await env.MAILER.send(new EmailMessage(env.FROM_ADDRESS, env.DESTINATION, raw));
        } catch (err) {
            // Visible only in a live `wrangler tail`; observability is off, so nothing is kept.
            console.error("send failed:", err && err.message);
            return json({ ok: false, error: "send" }, 502, cors);
        }
        return json({ ok: true }, 200, cors);
    },
};

function json(payload, status, headers) {
    return new Response(JSON.stringify(payload), {
        status,
        headers: { ...headers, "Content-Type": "application/json" },
    });
}

// Single-line fields lose every control character, which also rules out
// header injection through Reply-To. The message keeps its line breaks.
function clean(value, max, multiline) {
    if (typeof value !== "string") return "";
    const stripped = multiline
        ? value.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "")
        : value.replace(/[\u0000-\u001F\u007F]/g, "");
    return stripped.trim().slice(0, max);
}

function base64Utf8(str) {
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary);
}

// RFC 2047 encoded-word, so non-English subjects survive.
function encodeHeader(str) {
    return `=?UTF-8?B?${base64Utf8(str)}?=`;
}

function buildMime({ from, to, replyTo, subject, text, images }) {
    const domain = from.split("@")[1];
    const headers = [
        `From: Snore Timeline Contact Form <${from}>`,
        `To: <${to}>`,
        `Subject: ${encodeHeader(subject)}`,
        `Date: ${new Date().toUTCString()}`,
        `Message-ID: <${crypto.randomUUID()}@${domain}>`,
        "MIME-Version: 1.0",
    ];
    if (replyTo) headers.push(`Reply-To: <${replyTo}>`);

    const textPart = [
        "Content-Type: text/plain; charset=UTF-8",
        "Content-Transfer-Encoding: base64",
        "",
        wrap76(base64Utf8(text)),
    ].join("\r\n");

    if (!images.length) {
        return headers.join("\r\n") + "\r\n" + textPart;
    }

    const boundary = `----snore-${crypto.randomUUID()}`;
    headers.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
    const parts = [textPart];
    images.forEach((data, i) => {
        const name = `screenshot-${i + 1}.jpg`;
        parts.push([
            `Content-Type: image/jpeg; name="${name}"`,
            `Content-Disposition: attachment; filename="${name}"`,
            "Content-Transfer-Encoding: base64",
            "",
            wrap76(data),
        ].join("\r\n"));
    });
    return headers.join("\r\n") + "\r\n\r\n" +
        parts.map((part) => `--${boundary}\r\n${part}`).join("\r\n") +
        `\r\n--${boundary}--\r\n`;
}

// Base64 body lines must be at most 76 characters. Slicing keeps a 2 MB
// attachment well inside the Worker's CPU budget.
function wrap76(b64) {
    const lines = [];
    for (let i = 0; i < b64.length; i += 76) lines.push(b64.slice(i, i + 76));
    return lines.join("\r\n");
}
