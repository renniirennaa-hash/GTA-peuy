# SA-MP Community Hub (publik)
Chat, voice war (WebRTC), modpack, login nama saja. Tanpa akun, tanpa database.

## Jalankan
    npm install
    npm start        # http://localhost:3000

## Deploy publik
- Pakai hosting Node.js yang mendukung WebSocket (Render, Railway, Fly.io, VPS).
- WAJIB HTTPS, kalau tidak browser memblokir mikrofon.
- Modpack tersimpan di posts.json (di hosting gratis file ini bisa reset saat restart).

## Agar voice tembus di semua jaringan (TURN)
Tanpa TURN, sebagian jaringan (seluler, kampus, kantor) tidak bisa saling dengar.
Set environment variable dari penyedia TURN (Metered, Twilio, atau coturn sendiri):
    TURN_URL=turn:host:3478,turns:host:443?transport=tcp
    TURN_USER=xxx
    TURN_PASS=xxx

## Batasan
Voice mesh: ideal maksimal ~6-8 orang per server. Untuk perang besar, ganti ke LiveKit/SFU.
