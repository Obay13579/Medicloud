#!/bin/bash

# Warna untuk output biar enak dibaca
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}[INFO] Memulai Setup Environment MediCloud...${NC}"

# 1. Update & Install Dependencies Dasar
echo -e "${YELLOW}[STEP 1] Update System & Install Basic Tools...${NC}"
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg git build-essential

# 2. Setup Docker Repository & Install Docker
echo -e "${YELLOW}[STEP 2] Installing Docker Engine...${NC}"
# Hapus docker lama jika ada biar conflict free
sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null

# Add Docker's official GPG key:
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Setup Docker Permission (Agar tidak perlu sudo saat docker run)
sudo usermod -aG docker $USER

echo -e "${GREEN}[INFO] Docker terinstall!${NC}"

# 3. Install Node.js v20 (LTS)
echo -e "${YELLOW}[STEP 3] Installing Node.js v20...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verifikasi Node
node -v
npm -v

# 4. Install PNPM (Package Manager Pilihan Kita)
echo -e "${YELLOW}[STEP 4] Installing PNPM...${NC}"
sudo npm install -g pnpm

# Verifikasi PNPM
pnpm -v

echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN}✅ SETUP SELESAI!${NC}"
echo -e "${YELLOW}PENTING:${NC} Silahkan LOGOUT dan LOGIN kembali (atau restart terminal)"
echo -e "agar permission Docker aktif tanpa 'sudo'."
echo -e "${GREEN}====================================================${NC}"
