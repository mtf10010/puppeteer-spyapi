const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/api/profile', async (req, res) => {
  const fetch = (await import('node-fetch')).default;

  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "username é obrigatório" });
  }

  try {
    // Obter IP do usuário
    const ipRes = await fetch("https://api.ipify.org?format=json");
    const { ip } = await ipRes.json();

    // Registrar IP no backend da spyapp
    await fetch("https://spyapp.website/api/userIp.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip, user: username, method: "profile" })
    });

    // Lançar navegador (spoof de ambiente)
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Requisição para API real
    const response = await fetch("https://spyapp.website/api/n8n/getProfileData.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username })
    });

    const text = await response.text();
    console.log("📦 RESPOSTA DA API SPYAPP:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (jsonErr) {
      throw new Error("Resposta não é JSON válido: " + text);
    }

    await browser.close();

    res.status(200).json(data);
  } catch (err) {
    console.error('Erro no Puppeteer:', err);
    res.status(500).json({ success: false, error: 'Erro ao buscar dados com spoof' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('🚀 API rodando na porta', PORT));

