const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'sandbox.smtp.mailtrap.io',
            port: 2525,
            secure: false, // Mailtrap usa 2525 (não-SSL)
            auth: {
                user: process.env.SMTP_USER,  // a3663e2263b71ade25a40452c29997a1
                pass: process.env.SMTP_PASS   // seu_password_aqui
            }
        });

        // ✅ Teste conexão ao iniciar
        this.transporter.verify((error, success) => {
            if (error) {
                console.error('❌ Mailtrap conexão falhou:', error.message);
            } else {
                console.log('✅ Mailtrap conectado!');
            }
        });
    }

    async sendEmail(to, subject, html) {
        const mailOptions = {
            from: `"API Backend" <no-reply@api.com>`,
            to,
            subject,
            html
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Email OK → ${to}: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error(`❌ Email falhou → ${to}:`, error.message);
            throw error;
        }
    }

    // 🎉 BOAS-VINDAS (já existia)
    async sendWelcomeEmail(email, uid) {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #28a745;">🎉 Bem-vindo à API Backend!</h1>
                <p>Sua conta foi criada com sucesso!</p>
                <p><strong>ID da conta:</strong> ${uid}</p>
                <hr>
                <p><em>Comece agora fazendo login na sua aplicação.</em></p>
            </div>
        `;
        return await this.sendEmail(email, '🎉 Conta Criada com Sucesso!', html);
    }

    // 👤 ACESSO RECENTE (já existia)
    async sendRecentAccessEmail(email, uid, ip, location = 'Sorocaba-SP') {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #007bff;">👤 Novo Login Detectado</h2>
                <p><strong>ID da conta:</strong> ${uid}</p>
                <p><strong>Endereço IP:</strong> ${ip}</p>
                <p><strong>Localização:</strong> ${location}</p>
                <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                <hr>
                <p><em>Esta é uma notificação automática de segurança.</em></p>
                <p>Se você não reconhece este acesso, <strong>proteja sua conta imediatamente</strong>.</p>
            </div>
        `;
        return await this.sendEmail(email, '👤 Novo acesso na sua conta', html);
    }

    // 🔄 RECUPERAÇÃO SENHA (já existia)
    async sendRecoveryEmail(email, token) {
        const resetUrl = `http://localhost:3001/api/public/reset-password/${token}`;
        const expires = new Date(Date.now() + 60 * 60 * 1000).toLocaleString('pt-BR');
        
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #ffc107;">🔄 Recuperar Senha</h1>
                <p>Solicitamos redefinição de senha para esta conta.</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 18px;">
                        🔓 Redefinir Senha
                    </a>
                </p>
                <p><strong>Token válido até:</strong> ${expires}</p>
                <hr>
                <p><em>Não solicitou? Ignore este email.</em></p>
            </div>
        `;
        return await this.sendEmail(email, '🔄 Recuperação de Senha - API Backend', html);
    }

    // ✅ NOVO: Perfil atualizado
    async sendProfileUpdateEmail(newEmail, oldEmail) {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #28a745;">✅ Perfil atualizado com sucesso</h2>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <tr><td style="padding: 8px;"><strong>Novo email:</strong></td><td>${newEmail}</td></tr>
                    <tr><td style="padding: 8px;"><strong>Email anterior:</strong></td><td>${oldEmail}</td></tr>
                    <tr><td style="padding: 8px;"><strong>Data/Hora:</strong></td><td>${new Date().toLocaleString('pt-BR')}</td></tr>
                </table>
                <hr>
                <p style="color: #dc3545; font-weight: bold;">
                    Se você <strong>não reconhece</strong> esta alteração,
                    <a href="http://localhost:3000/security" style="color: #007bff;">proteja sua conta agora</a>.
                </p>
            </div>
        `;
        return await this.sendEmail(newEmail, '✅ Perfil atualizado - API Backend', html);
    }

    // 🔐 NOVO: Senha alterada
    async sendPasswordChangeEmail(email) {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #28a745;">🔐 Senha alterada com sucesso</h2>
                <p>Sua senha foi atualizada com segurança.</p>
                <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                <hr>
                <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
                    <p style="color: #856404; margin: 0;">
                        <strong>⚠️ Segurança:</strong> Se você <strong>não solicitou</strong> esta alteração,
                        faça login e altere sua senha imediatamente.
                    </p>
                </div>
                <p style="margin-top: 20px;"><em>Notificação automática de segurança.</em></p>
            </div>
        `;
        return await this.sendEmail(email, '🔐 Senha alterada - API Backend', html);
    }
}

module.exports = new EmailService();
