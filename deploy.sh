#!/bin/bash
set -e

# ==========================================
# CONFIGURATION
# ==========================================
BASE_DIR="/opt/medicloud"
COMPOSE_FILE="${BASE_DIR}/docker-compose.yml"
CONFIG_FILE="${BASE_DIR}/config/config.yml"
NETWORK_NAME="medicloud_network"
DOMAIN_ROOT="iimlab.id"

# Load Variables from CI/CD
# Expects: IMAGE_NAME, DEPLOY_ENV, CONTAINER_NAME

log_info() { echo -e "\n✅ [INFO] $1"; }

# 1. Tentukan Subdomain berdasarkan Branch
if [ "$DEPLOY_ENV" == "prod" ]; then
    SUBDOMAIN="medicloud" # medicloud.iimlab.id
elif [ "$DEPLOY_ENV" == "dev" ]; then
    SUBDOMAIN="dev-medicloud" # dev-medicloud.iimlab.id
else
    echo "❌ Unknown environment"; exit 1
fi

FULL_HOSTNAME="${SUBDOMAIN}.${DOMAIN_ROOT}"
INTERNAL_PORT="80" # Port internal container (nginx/app)

# ==========================================
# HELPER: DYNAMIC PORT (Host Side)
# ==========================================
# Kita butuh port unik di host agar tidak bentrok antar container lain
get_free_port() {
    local port_start=4000
    local port_end=4999
    
    # Cek apakah container ini sudah punya port sebelumnya (biar konsisten)
    local existing_port=$(docker port "$CONTAINER_NAME" 80 2>/dev/null | awk -F: '{print $2}')
    
    if [ ! -z "$existing_port" ]; then
        echo "$existing_port"
        return
    fi

    # Cari port baru
    for port in $(seq $port_start $port_end); do
        if ! ss -lnt | grep -q ":$port "; then
            echo $port
            return
        fi
    done
}

HOST_PORT=$(get_free_port)
log_info "Target: ${FULL_HOSTNAME} -> Container: ${CONTAINER_NAME}:${INTERNAL_PORT} (Host Port: ${HOST_PORT})"

# ==========================================
# STEP 1: UPDATE DOCKER COMPOSE
# ==========================================
log_info "Injecting service into docker-compose.yml..."

# Hapus service lama jika ada di compose file (menggunakan yq atau sed manipulation)
# Disini kita pakai pendekatan replace block sederhana atau append jika belum ada.
# Untuk simplifikasi di bash tanpa install yq, kita pakai logic:
# Jika container sudah jalan, kita akan pakai 'docker run' manual saja 
# lalu connect ke network, agar tidak merusak formatting docker-compose.yml yang kompleks.
# TAPI, karena requestmu pakai script canggih, kita update file-nya.

# Cek apakah service sudah ada di file
if grep -q "${CONTAINER_NAME}:" "$COMPOSE_FILE"; then
    log_info "Service exists. Updating image tag..."
    # Update image line
    sed -i "/container_name: ${CONTAINER_NAME}/!b;n;c\    image: ${IMAGE_NAME}" "$COMPOSE_FILE"
else
    log_info "Appending new service..."
    # Append text ke file (pastikan indentasi YAML benar)
    cat <<EOF >> "$COMPOSE_FILE"

  ${CONTAINER_NAME}:
    image: ${IMAGE_NAME}
    container_name: ${CONTAINER_NAME}
    restart: always
    networks:
      - ${NETWORK_NAME}
    ports:
      - "${HOST_PORT}:${INTERNAL_PORT}"
    env_file:
      - .env
EOF
fi

# ==========================================
# STEP 2: UPDATE CLOUDFLARE CONFIG
# ==========================================
log_info "Updating Cloudflare Ingress Rules..."

# Cek apakah hostname sudah ada di config
if grep -q "hostname: ${FULL_HOSTNAME}" "$CONFIG_FILE"; then
    log_info "Route for ${FULL_HOSTNAME} already exists."
else
    log_info "Injecting new route..."
    # Teknik SED: Cari baris '- service: http_status:404' (baris terakhir)
    # Lalu sisipkan 2 baris aturan baru SEBELUM baris tersebut.
    
    sed -i "/- service: http_status:404/i \\  - hostname: ${FULL_HOSTNAME}\\n    service: http://${CONTAINER_NAME}:${INTERNAL_PORT}" "$CONFIG_FILE"
fi

# ==========================================
# STEP 3: DEPLOY & RESTART
# ==========================================
log_info "Applying Docker changes..."
cd "$BASE_DIR"

# Pull image terbaru
docker compose pull "${CONTAINER_NAME}"

# Up -d hanya untuk container yang berubah
docker compose up -d "${CONTAINER_NAME}"

# Restart Tunnel agar config baru terbaca
# Note: Cloudflared sebenernya support hot-reload, tapi restart paling aman.
log_info "Restarting Tunnel to apply config..."
docker compose restart tunnel

log_info "🚀 Deployed Successfully to https://${FULL_HOSTNAME}"
