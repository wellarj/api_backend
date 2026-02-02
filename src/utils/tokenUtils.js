const crypto = require('crypto-js');
const nodeCrypto = require('crypto');
require('dotenv').config();

const TOKEN_TTL_MIN = 30; // 30 minutos

async function gerarToken(user) {
    const dados = {
        uid: user.uid.trim(),
        email: user.email.toLowerCase().trim(),
        app: process.env.JWT_NOME_APLICACAO || 'APISECURE2026',
        v: 'v3'
    };

    const dadosString = JSON.stringify(dados, Object.keys(dados).sort());
    const secret = process.env.TOKEN_SECRET;

    const hmac512 = crypto.HmacSHA512(dadosString, secret).toString();
    return crypto.HmacSHA256(hmac512, secret).toString();
}

async function verificarToken(uid, tokenRecebido, userAgent = '') {
    if (!uid || !tokenRecebido || tokenRecebido.length !== 64) {
        return false;
    }

    const pool = require('../config/database');

    const [rows] = await pool.execute(
        `SELECT email, uid, last_login, last_ip 
         FROM users WHERE uid = ?`,
        [uid.trim()]
    );

    if (rows.length === 0) return false;

    const user = rows[0];

    const tokenEsperado = await gerarToken(user, userAgent);

    // comparação segura real
    const buffA = Buffer.from(tokenEsperado, 'hex');
    const buffB = Buffer.from(tokenRecebido, 'hex');

    if (buffA.length !== buffB.length) return false;

    return nodeCrypto.timingSafeEqual(buffA, buffB);
}

module.exports = { gerarToken, verificarToken };
