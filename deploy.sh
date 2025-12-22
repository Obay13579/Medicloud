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
# Expects: IMAGE_NAME, DEPLOY_ENV, CONTAINER_NAME defined by GitHub Actions

log_info() { echo -e "\n✅ [INFO] $1"; }

# 1. Tentukan Subdomain
if [ "$DEPLOY_ENV" == "prod" ]; then
    SUBDOMAIN="medicloud" 
elif [ "$DEPLOY_ENV" == "dev" ]; then
    SUBDOMAIN="dev-medicloud"
else
    echo "❌ Unknown environment"; exit 1
fi

FULL_HOSTNAME="${SUBDOMAIN}.${DOMAIN_ROOT}"
INTERNAL_PORT="80" 

# ==========================================
# HELPER: DYNAMIC PORT
# ==========================================
get_free_port() {
    local port_start=4000
    local port_end=4999
    local existing_port=$(docker port "$CONTAINER_NAME" 80 2>/dev/null | awk -F: '{print $2}')
    
    if [ ! -z "$existing_port" ]; then
        echo "$existing_port"
        return
    fi

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

if grep -q "${CONTAINER_NAME}:" "$COMPOSE_FILE"; then
    log_info "Service exists. Updating image tag..."
    sed -i "/container_name: ${CONTAINER_NAME}/!b;n;c\    image: ${IMAGE_NAME}" "$COMPOSE_FILE"
else
    log_info "Appending new service..."
    # Perhatikan baris env_file di bawah ini!
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

if grep -q "hostname: ${FULL_HOSTNAME}" "$CONFIG_FILE"; then
    log_info "Route for ${FULL_HOSTNAME} already exists."
else
    log_info "Injecting new route..."
    sed -i "/- service: http_status:404/i \\  - hostname: ${FULL_HOSTNAME}\\n    service: http://${CONTAINER_NAME}:${INTERNAL_PORT}" "$CONFIG_FILE"
fi

# ==========================================
# STEP 3: DEPLOY & RESTART
# ==========================================
log_info "Applying Docker changes..."
cd "$BASE_DIR"

# Kita paksa ganti tag image di docker-compose sesuai branch yang sedang dideploy
# (Misal lagi di main, pake tag :main. Lagi di dev, pake tag :dev)
export IMAGE_TAG="${TAG_NAME:-dev}"

# Update backend image
sed -i "s|image: .*/medicloud-backend:.*|image: ${DOCKERHUB_USERNAME}/medicloud-backend:${IMAGE_TAG}|" docker-compose.yml

# Update frontend image
sed -i "s|image: .*/medicloud-frontend:.*|image: ${DOCKERHUB_USERNAME}/medicloud-frontend:${IMAGE_TAG}|" docker-compose.yml

# Pull semua service
docker compose pull

# Restart service
docker compose up -d

log_info "Restarting Tunnel to apply config..."
docker compose restart tunnel

log_info "🚀 Deployed Successfully to https://${FULL_HOSTNAME}"
