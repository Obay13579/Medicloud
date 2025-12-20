# 1. Pakai Node.js versi ringan
FROM node:20-alpine

# FIX: Install OpenSSL untuk Prisma di Alpine (Mengatasi warning libssl)
RUN apk -U add openssl

# 2. Set folder kerja
WORKDIR /app

# 3. Copy file package.json
COPY package*.json ./

# 4. FIX UTAMA: Copy folder prisma SEBELUM npm install
# Agar saat postinstall jalan, schema-nya sudah ada
COPY prisma ./prisma/

# 5. Install dependencies (Sekarang aman karena folder prisma sudah ada)
RUN npm install

# 6. Copy sisa codingan backend
COPY . .

# 7. Generate Prisma Client (Opsional, jaga-jaga kalau postinstall gagal)
RUN npx prisma generate

# 8. Build TypeScript
RUN npm run build

# 9. Expose & Start
EXPOSE 3000
CMD ["npm", "start"]