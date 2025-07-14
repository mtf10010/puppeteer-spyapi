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
    // Obter IP do visitante
    const ipRes = await fetch("https://api.ipify.org?format=json");
    const { ip } = await ipRes.json();

    // Enviar IP pro sistema deles (spyapp)
    await fetch("https://spyapp.website/api/userIp.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip, user: username, method: "profile" })
    });

    // Abrir navegador com Puppeteer (só pra spoof, se quiser renderizar depois)
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Fazer requisição à API original fora do contexto do browser
    const response = await fetch("https://spyapp.website/api/n8n/getProfileData.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username })
    });

    const data = await response.json();

    await browser.close();

    res.status(200).json(data);
  } catch (err) {
    console.error('Erro no Puppeteer:', err);
    res.status(500).json({ success: false, error: 'Erro ao buscar dados com spoof' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('🚀 API rodando na porta', PORT));

