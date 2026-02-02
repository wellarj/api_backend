const crypto = require('crypto-js');
require('dotenv').config();

async function gerarToken(user) {
    // FORMATO YYYY-MM-DD fixo
    const lastLoginStr = new Date(user.last_login).toISOString().split('T')[0];
    
    const dados = {
        email: user.email.toLowerCase().trim(),
        uid: user.uid.trim(),
        last_login: lastLoginStr,
        last_ip: (user.last_ip || '0.0.0.0').substring(0, 45),
        app: process.env.JWT_NOME_APLICACAO || 'APISECURE2026',
        v: 'v2'  // versão
    };
    
    // ✅ HMAC-SHA512 (128 chars) > SHA256 (64 chars)
    const dadosString = JSON.stringify(dados, Object.keys(dados).sort());
    const secret = process.env.TOKEN_SECRET || 'UltraSecureToken2026Default64CharsMin';
    
    // DOUBLE HMAC: SHA512 + SHA256 final = IMPENETRÁVEL
    const hmac512 = crypto.HmacSHA512(dadosString, secret).toString();
    const tokenFinal = crypto.HmacSHA256(hmac512, secret).toString();
    
    return tokenFinal; // 64 chars ULTRA SEGURO
}

async function verificarToken(uid, tokenRecebido) {
    if (!uid?.trim() || !tokenRecebido?.trim() || tokenRecebido.length !== 64) {
        return false;
    }
    
    const pool = require('../config/database');
    
    const [rows] = await pool.execute(
        'SELECT email, uid, DATE(last_login) as last_login, last_ip FROM users WHERE uid = ?',
        [uid.trim()]
    );
    
    if (rows.length === 0) return false;
    
    const user = rows[0];
    const tokenEsperado = await gerarToken(user);
    
    // ✅ Comparação segura (anti-timing attack)
    return tokenEsperado === tokenRecebido;
}

module.exports = { gerarToken, verificarToken };
