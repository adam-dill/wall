const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
dotenv.config();

const sendPasswordReset = async (req, to, token) => {
    const url = `${req.protocol}://${req.get('host')}/login/reset/${token}`;
    var transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user:process.env.MAIL_USER,
            pass:process.env.MAIL_PASS
        }
      });
      
    var mailOptions = {
        from: 'donotreply@wall.adamdill.com',
        to,
        subject: 'Wall Password Reset Request',
        html: `
            <p>A request has been made to your account to reset your password. Select the link below to create a new password. Note, the link provided will only last 1 hour.<p>
            <a href="${url}" target="_blank">${url}</a>
        `
    };
    return await transporter.sendMail(mailOptions);
}

module.exports = { 
    sendPasswordReset
}