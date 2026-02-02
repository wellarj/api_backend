const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('../config/database');
const { authenticateUser } = require('../middleware/authMiddleware');

// 🔐 Middleware de autenticação (já existente)
router.use(authenticateUser);

// 👤 /me - Informações do usuário logado
router.get('/me', async (req, res) => {
    try {
        const uid = req.user.uid;
        
        // Buscar dados completos do usuário
        const [rows] = await pool.execute(
            `SELECT uid, email, role, last_ip, last_login, 
                    login_attempts, created_at,
                    DATE_FORMAT(last_login, '%d/%m/%Y %H:%i') as last_login_formatted
             FROM users WHERE uid = ?`,
            [uid]
        );
        
        const user = rows[0];
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        console.log('👤 /me acessado:', uid);
        res.json({ 
            success: true,
            user: {
                uid: user.uid,
                email: user.email,
                role: user.role,
                last_ip: user.last_ip,
                last_login: user.last_login_formatted,
                login_attempts: user.login_attempts || 0,
                created_at: user.created_at,
                is_admin: user.role === 'admin'
            }
        });
        
    } catch (error) {
        console.error('❌ ERRO /me:', error.message);
        res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
});

// ✏️ Editar perfil (email, nome opcional)
router.put('/profile', async (req, res) => {
    try {
        const uid = req.user.uid;
        const { email } = req.body;
        
        // Validações
        if (email && email !== req.user.email) {
            // Verificar se novo email já existe
            const [existing] = await pool.execute(
                'SELECT uid FROM users WHERE email = ? AND uid != ?',
                [email, uid]
            );
            if (existing.length > 0) {
                return res.status(400).json({ error: 'Email já está em uso' });
            }
        }
        
        // Atualizar apenas campos fornecidos
        const updates = [];
        const values = [];
        
        if (email) {
            updates.push('email = ?');
            values.push(email);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ error: 'Nenhum campo para atualizar' });
        }
        
        values.push(uid);
        await pool.execute(
            `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE uid = ?`,
            values
        );
        
        console.log('✏️ Perfil atualizado:', uid, 'Novo email:', email);
        res.json({ 
            success: true, 
            message: 'Perfil atualizado com sucesso!',
            user: { uid, email: email || req.user.email }
        });
        
    } catch (error) {
        console.error('❌ ERRO UPDATE PERFIL:', error.message);
        res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
});

// 🔐 Trocar senha (endpoint SEPARADO)
router.post('/change-password', async (req, res) => {
    try {
        const uid = req.user.uid;
        const { currentPassword, newPassword } = req.body;
        
        // Validações
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Senha atual e nova são obrigatórias' });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Nova senha deve ter 6+ caracteres' });
        }
        
        // Verificar senha atual
        const [rows] = await pool.execute('SELECT password FROM users WHERE uid = ?', [uid]);
        const user = rows[0];
        
        if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
            return res.status(401).json({ error: 'Senha atual incorreta' });
        }
        
        // Hash nova senha
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);
        
        await pool.execute(
            'UPDATE users SET password = ?, login_attempts = 0, updated_at = NOW() WHERE uid = ?',
            [hashedNewPassword, uid]
        );
        
        console.log('🔐 Senha alterada:', uid);
        res.json({ 
            success: true, 
            message: 'Senha alterada com sucesso!' 
        });
        
    } catch (error) {
        console.error('❌ ERRO CHANGE PASSWORD:', error.message);
        res.status(500).json({ error: 'Erro ao trocar senha' });
    }
});

// 📋 Histórico de logins (últimos 10)
router.get('/login-history', async (req, res) => {
    try {
        const uid = req.user.uid;
        
        const [rows] = await pool.execute(
            `SELECT last_ip, last_login, login_attempts, 
                    DATE_FORMAT(last_login, '%d/%m/%Y %H:%i') as formatted_date
             FROM users WHERE uid = ?`,
            [uid]
        );
        
        const history = rows[0] || {};
        res.json({
            success: true,
            history: {
                last_ip: history.last_ip,
                last_login: history.formatted_date,
                login_attempts: history.login_attempts || 0
            }
        });
        
    } catch (error) {
        console.error('❌ ERRO LOGIN HISTORY:', error.message);
        res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
});

module.exports = router;