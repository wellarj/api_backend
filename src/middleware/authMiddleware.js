const { verificarToken } = require('../utils/tokenUtils');
const pool = require('../config/database');

async function authenticateUser(req, res, next) {
    try {
        const uid = req.headers['x-uid'];
        const token = req.headers['x-token'];
        
        if (!uid || !token) {
            return res.status(401).json({ error: 'UID e TOKEN obrigatórios' });
        }
        
        const tokenValido = await verificarToken(uid, token);
        if (!tokenValido) {
            return res.status(401).json({ error: 'Token inválido' });
        }
        
        const [rows] = await pool.execute(
            'SELECT uid, email, role FROM users WHERE uid = ?', 
            [uid]
        );
        
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }
        
        req.user = rows[0];
        next();
    } catch (error) {
        res.status(500).json({ error: 'Erro autenticação' });
    }
}

module.exports = { authenticateUser };
