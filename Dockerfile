# Use uma imagem base com Node e Chromium
FROM ghcr.io/puppeteer/puppeteer:latest

# Cria diretório da app
WORKDIR /app

# Copia os arquivos
COPY . .

# Instala dependências
RUN npm install

# Expõe a porta que o app usa
EXPOSE 3000

# Comando para iniciar o app
CMD ["npm", "start"]

