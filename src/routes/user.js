const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('../config/database');
const { authenticateUser } = require('../middleware/authMiddleware');
const emailService = require('../utils/emailService');

router.use(authenticateUser);

// 🔐 VALIDAÇÃO SENHA FORTE
function validateStrongPassword(password) {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongRegex.test(password)) return { valid: false, errors: [] };
    
    const errors = [];
    if (password.length < 12) errors.push('mínimo 12 caracteres');
    if (password.includes('123456')) errors.push('sequência 123456');
    if (password.toLowerCase().includes('password')) errors.push('"password"');
    if (password.toLowerCase().includes('senha')) errors.push('"senha"');
    if (/^(.)\1+$/.test(password)) errors.push('caracteres repetidos');
    
    return { valid: errors.length === 0, errors };
}

// ✅ /me - COM VERIFICAÇÃO req.user
router.get('/me', async (req, res) => {
    try {
        // 🔍 DEBUG: Verificar req.user
        if (!req.user || !req.user.uid) {
            console.error('❌ req.user inválido:', req.user);
            return res.status(401).json({ error: 'Token inválido ou expirado' });
        }
        
        console.log('🔍 /me chamado por:', req.user.uid);
        const [rows] = await pool.execute(
            `SELECT uid, email, role, last_ip, last_login, login_attempts, created_at,
                    DATE_FORMAT(last_login, '%d/%m/%Y %H:%i') as last_login_formatted
             FROM users WHERE uid = ?`,
            [req.user.uid]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        const user = rows[0];
        res.json({ 
            success: true, 
            user: {
                uid: user.uid,
                email: user.email,
                role: user.role,
                is_admin: user.role === 'admin',
                last_ip: user.last_ip,
                last_login: user.last_login_formatted,
                login_attempts: user.login_attempts || 0,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('❌ ERRO /me:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

// ✏️ /profile - COM VERIFICAÇÃO
router.put('/profile', async (req, res) => {
    try {
        if (!req.user || !req.user.uid) {
            return res.status(401).json({ error: 'Token inválido' });
        }
        
        const uid = req.user.uid;
        const { email } = req.body;
        const oldEmail = req.user.email;
        
        if (!email) {
            return res.status(400).json({ error: 'Novo email obrigatório' });
        }
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Email inválido' });
        }
        
        if (email === oldEmail) {
            return res.status(400).json({ error: 'Email já é o atual' });
        }
        
        const [existing] = await pool.execute(
            'SELECT uid FROM users WHERE email = ? AND uid != ?',
            [email, uid]
        );
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email já em uso' });
        }
        
        await pool.execute(
            'UPDATE users SET email = ?, updated_at = NOW() WHERE uid = ?',
            [email, uid]
        );
        
        emailService.sendProfileUpdateEmail(email, oldEmail)
            .catch(err => console.log('⚠️ Email perfil falhou:', err.message));
        
        res.json({ success: true, message: 'Perfil atualizado!', user: { uid, email } });
        
    } catch (error) {
        console.error('❌ ERRO PROFILE:', error);
        res.status(500).json({ error: 'Erro ao atualizar' });
    }
});

// 🔐 /change-password - COM VERIFICAÇÃO
router.post('/change-password', async (req, res) => {
    try {
        if (!req.user || !req.user.uid) {
            return res.status(401).json({ error: 'Token inválido' });
        }
        
        const { currentPassword, newPassword } = req.body;
        const uid = req.user.uid;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Senhas obrigatórias' });
        }
        
        const [currentRows] = await pool.execute(
            'SELECT password, email FROM users WHERE uid = ?', [uid]
        );
        if (currentRows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        if (!(await bcrypt.compare(currentPassword, currentRows[0].password))) {
            return res.status(401).json({ error: 'Senha atual incorreta' });
        }
        
        const passwordValidation = validateStrongPassword(newPassword);
        if (!passwordValidation.valid) {
            return res.status(400).json({ 
                error: 'Senha fraca',
                requirements: '12+ chars: A-z, #, 0-9',
                issues: passwordValidation.errors 
            });
        }
        
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);
        await pool.execute(
            'UPDATE users SET password = ?, login_attempts = 0, updated_at = NOW() WHERE uid = ?',
            [hashedNewPassword, uid]
        );
        
        emailService.sendPasswordChangeEmail(currentRows[0].email)
            .catch(err => console.log('⚠️ Email senha falhou:', err.message));
        
        res.json({ success: true, message: 'Senha alterada!' });
        
    } catch (error) {
        console.error('❌ ERRO PASSWORD:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

// 📋 HISTÓRICO DE LOGIN
router.get('/login-history', async (req, res) => {
    try {
        if (!req.user || !req.user.uid) {
            return res.status(401).json({ error: 'Token inválido' });
        }
        
        const [rows] = await pool.execute(
            `SELECT last_ip, last_login, login_attempts, last_failed_login,
                    DATE_FORMAT(last_login, '%d/%m/%Y %H:%i') as formatted_login,
                    DATE_FORMAT(last_failed_login, '%d/%m/%Y %H:%i') as formatted_failed
             FROM users WHERE uid = ?`,
            [req.user.uid]
        );
        
        res.json({
            success: true,
            history: rows[0] || {
                last_ip: 'N/A',
                formatted_login: 'Nunca',
                login_attempts: 0,
                formatted_failed: 'N/A'
            }
        });
        
    } catch (error) {
        console.error('❌ ERRO HISTORY:', error);
        res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
});

module.exports = router;
