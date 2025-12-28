FROM node:18-bullseye-slim

# Instalar PDFtk y QPDF
# Usamos bullseye-slim porque tiene mejor soporte para estas herramientas que alpine
RUN apt-get update && \
    apt-get install -y pdftk qpdf procps && \
    rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3001

# Comando de inicio
CMD ["node", "src/server.js"]
