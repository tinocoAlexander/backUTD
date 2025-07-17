# Etapa 1: build
FROM node:20-alpine AS builder

# Directorio de trabajo
WORKDIR /app

# Copia package.json y package-lock/npm-shrinkwrap primero para instalar dependencias
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia el resto del código
COPY . .

# Compila el TypeScript
RUN npm run build

# Etapa 2: producción
FROM node:20-alpine

WORKDIR /app

# Copia sólo los archivos necesarios de la etapa de build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Instala sólo dependencias de producción
RUN npm install --omit=dev

# Exponer el puerto (ajusta si no es 3000)
EXPOSE 3000

# Comando de inicio
CMD ["npm", "start"]
