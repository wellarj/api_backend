const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const router = express.Router();
const pool = require('../config/database');
const { gerarToken } = require('../utils/tokenUtils');
const emailService = require('../utils/emailService');

// Rate Limit por IP (5 tentativas/15min)
const rateLimitMap = new Map();

function checkRateLimit(ip, action = 'login') {
    const key = `${ip}_${action}`;
    const now = Date.now();
    const window = 15 * 60 * 1000; // 15min
    
    if (!rateLimitMap.has(key)) {
        rateLimitMap.set(key, { count: 1, reset: now });
        return true;
    }
    
    const record = rateLimitMap.get(key);
    if (now - record.reset > window) {
        rateLimitMap.set(key, { count: 1, reset: now });
        return true;
    }
    
    if (record.count >= 5) return false;
    record.count++;
    rateLimitMap.set(key, record);
    return true;
}

// 🔐 VALIDAÇÃO SENHA FORTE
function validateStrongPassword(password) {
    // Critérios: 8+ chars, maiúscula, minúscula, número, especial
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (!strongRegex.test(password)) {
        return {
            valid: false,
            errors: []
        };
    }
    
    const errors = [];
    
    // Verificações adicionais
    if (password.length < 12) errors.push('mínimo 12 caracteres');
    if (password.includes('123456')) errors.push('sequência 123456');
    if (password.toLowerCase().includes('password')) errors.push('"password"');
    if (password.toLowerCase().includes('senha')) errors.push('"senha"');
    if (/^(.)\1+$/.test(password)) errors.push('caracteres repetidos');
    
    return {
        valid: errors.length === 0,
        errors
    };
}

// 🟢 PING - Health check
router.get('/ping', (req, res) => {
    res.json({ 
        message: 'API Pública OK', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// 🔑 LOGIN - Com validação senha forte
router.post('/login', async (req, res) => {
    const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
    
    if (!checkRateLimit(clientIp, 'login')) {
        return res.status(429).json({ 
            error: 'Muitas tentativas. Tente novamente em 15 minutos.' 
        });
    }
    
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }
        
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            if (user) {
                await pool.execute(
                    'UPDATE users SET login_attempts = login_attempts + 1, last_failed_login = NOW() WHERE uid = ?',
                    [user.uid]
                );
            }
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        
        // ✅ LOGIN CORRETO - Reset contagem + atualizar dados
        await pool.execute(
            'UPDATE users SET login_attempts = 0, last_failed_login = NULL, last_login = NOW(), last_ip = ? WHERE uid = ?',
            [clientIp, user.uid]
        );
        
        // 🎁 Gerar token
        const token = await gerarToken({
            email: user.email,
            uid: user.uid,
            last_login: new Date(),
            last_ip: clientIp
        });
        
        // 📧 Notificar acesso recente (ASSÍNCRONO)
        emailService.sendRecentAccessEmail(user.email, user.uid, clientIp, 'Sorocaba-SP')
            .catch(err => console.log('⚠️ Notificação acesso falhou:', err.message));
        
        console.log('✅ Login OK:', user.uid, 'IP:', clientIp);
        res.json({ 
            success: true, 
            uid: user.uid, 
            token,
            message: 'Login realizado com sucesso'
        });
        
    } catch (error) {
        console.error('❌ ERRO LOGIN:', error.message);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ➕ REGISTER - SENHA FORTE OBRIGATÓRIA
router.post('/register', async (req, res) => {
    const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
    
    if (!checkRateLimit(clientIp, 'register')) {
        return res.status(429).json({ 
            error: 'Muitas tentativas de registro. Tente em 15 minutos.' 
        });
    }
    
    try {
        const { email, password } = req.body;
        
        // Validações básicas
        if (!email || !password) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }
        
        // 🔐 VALIDAÇÃO SENHA FORTE
        const passwordValidation = validateStrongPassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({ 
                error: 'Senha muito fraca',
                requirements: 'Mínimo 12 caracteres com: maiúscula, minúscula, número e símbolo (@$!%*?&)',
                examples: ['MeuApp2026!23', 'LeoSecure#4567'],
                issues: passwordValidation.errors
            });
        }
        
        // Verificar email único
        const [existing] = await pool.execute('SELECT uid FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Este email já está cadastrado' });
        }
        
        // Criar usuário
        const uid = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const hashedPassword = await bcrypt.hash(password, 12);
        
        await pool.execute(
            'INSERT INTO users (uid, email, password, last_ip, login_attempts, role, created_at) VALUES (?, ?, ?, ?, 0, "user", NOW())',
            [uid, email, hashedPassword, clientIp]
        );
        
        // 📧 Email de boas-vindas (ASSÍNCRONO)
        emailService.sendWelcomeEmail(email, uid)
            .catch(err => console.log('⚠️ Email boas-vindas falhou:', err.message));
        
        console.log('✅ Novo usuário registrado:', uid, 'Senha forte ✓');
        res.status(201).json({ 
            success: true, 
            uid, 
            message: 'Conta criada com sucesso! Verifique seu email.'
        });
        
    } catch (error) {
        console.error('❌ ERRO REGISTER:', error.message);
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
});

// 📧 RECOVERY PASSWORD - SENHA FORTE NO RESET
router.post('/recovery', async (req, res) => {
    const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
    
    if (!checkRateLimit(clientIp, 'recovery')) {
        return res.status(429).json({ 
            error: 'Muitas tentativas de recuperação. Tente em 15 minutos.' 
        });
    }
    
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email é obrigatório' });
        }
        
        // Verificar se usuário existe (segurança - não revelar)
        const [rows] = await pool.execute('SELECT uid FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.json({ 
                message: 'Se o email existir, enviamos instruções de recuperação.' 
            });
        }
        
        const user = rows[0];
        const recoveryToken = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
        
        await pool.execute(
            'UPDATE users SET recovery_token = ?, recovery_expires = ? WHERE uid = ?',
            [recoveryToken, expires, user.uid]
        );
        
        // 📧 Enviar email de recuperação
        await emailService.sendRecoveryEmail(email, recoveryToken);
        
        console.log('📧 Recovery solicitado:', email);
        res.json({ 
            success: true, 
            message: 'Instruções de recuperação enviadas para seu email.' 
        });
        
    } catch (error) {
        console.error('❌ ERRO RECOVERY:', error.message);
        res.status(500).json({ error: 'Erro ao processar recuperação' });
    }
});

// 🔄 RESET PASSWORD - SENHA FORTE OBRIGATÓRIA
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({ error: 'Nova senha é obrigatória' });
        }
        
        // 🔐 VALIDAÇÃO SENHA FORTE
        const passwordValidation = validateStrongPassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({ 
                error: 'Senha muito fraca',
                requirements: 'Mínimo 12 caracteres com: maiúscula, minúscula, número e símbolo (@$!%*?&)',
                examples: ['MeuApp2026!23', 'LeoSecure#4567'],
                issues: passwordValidation.errors
            });
        }
        
        // Verificar token válido e não expirado
        const [rows] = await pool.execute(
            'SELECT uid, email FROM users WHERE recovery_token = ? AND recovery_expires > NOW()',
            [token]
        );
        
        if (rows.length === 0) {
            return res.status(400).json({ error: 'Token inválido ou expirado' });
        }
        
        const user = rows[0];
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Atualizar senha + limpar token
        await pool.execute(
            'UPDATE users SET password = ?, recovery_token = NULL, recovery_expires = NULL WHERE uid = ?',
            [hashedPassword, user.uid]
        );
        
        console.log('✅ Senha redefinida (FORTE):', user.email);
        res.json({ 
            success: true, 
            message: 'Senha redefinida com sucesso! Faça login.' 
        });
        
    } catch (error) {
        console.error('❌ ERRO RESET:', error.message);
        res.status(500).json({ error: 'Erro ao redefinir senha' });
    }
});

module.exports = router;
