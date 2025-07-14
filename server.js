const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/api/profile', async (req, res) => {

  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "username é obrigatório" });

  try {
    const ipRes = await fetch("https://api.ipify.org?format=json");
    const { ip } = await ipRes.json();

    await fetch("https://spyapp.website/api/userIp.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip, user: username, method: "profile" })
    });

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    const data = await page.evaluate(async (username) => {
      const res = await fetch("https://spyapp.website/api/n8n/getProfileData.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username })
      });
      return await res.json();
    }, username);

    await browser.close();

    res.status(200).json(data);
} catch (err) {
  console.error('Erro no Puppeteer:', err); // mostra erro completo
  res.status(500).json({ success: false, error: 'Erro ao buscar dados com spoof' });
}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('🚀 API rodando na porta', PORT));
