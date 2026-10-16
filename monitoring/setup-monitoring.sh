#!/bin/bash
set -e

if [ "$(id -u)" -ne 0 ]; then
    echo "Run: sudo bash setup-monitoring.sh"
    exit 1
fi

dnf install -y curl wget tar

# Create Prometheus user
id prometheus >/dev/null 2>&1 || \
useradd --system --no-create-home --shell /sbin/nologin prometheus

# Download latest Prometheus release
ARCH=$(uname -m)
case "$ARCH" in
    x86_64) ARCH=amd64 ;;
    aarch64) ARCH=arm64 ;;
    *) echo "Unsupported architecture"; exit 1 ;;
esac

VERSION=$(curl -fsSL https://api.github.com/repos/prometheus/prometheus/releases/latest | grep -m1 '"tag_name"' | cut -d '"' -f4)
VERSION=${VERSION#v}

cd /tmp
wget -q "https://github.com/prometheus/prometheus/releases/download/v${VERSION}/prometheus-${VERSION}.linux-${ARCH}.tar.gz"
tar -xzf "prometheus-${VERSION}.linux-${ARCH}.tar.gz"
cd "prometheus-${VERSION}.linux-${ARCH}"

install -m 755 prometheus /usr/local/bin/prometheus
install -m 755 promtool /usr/local/bin/promtool

mkdir -p /etc/prometheus /var/lib/prometheus
cp -r consoles console_libraries /etc/prometheus/

cat > /etc/prometheus/prometheus.yml <<'EOF'
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: prometheus
    static_configs:
      - targets: ['localhost:9090']
EOF

chown -R prometheus:prometheus /etc/prometheus /var/lib/prometheus

# Prometheus systemd service
cat > /etc/systemd/system/prometheus.service <<'EOF'
[Unit]
Description=Prometheus Monitoring
After=network-online.target
Wants=network-online.target

[Service]
User=prometheus
Group=prometheus
ExecStart=/usr/local/bin/prometheus \
  --config.file=/etc/prometheus/prometheus.yml \
  --storage.tsdb.path=/var/lib/prometheus \
  --web.listen-address=0.0.0.0:9090
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# Install Grafana
rpm --import https://rpm.grafana.com/gpg.key

cat > /etc/yum.repos.d/grafana.repo <<'EOF'
[grafana]
name=Grafana OSS
baseurl=https://rpm.grafana.com
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://rpm.grafana.com/gpg.key
EOF

dnf install -y grafana

# Configure Prometheus as Grafana data source
mkdir -p /etc/grafana/provisioning/datasources

cat > /etc/grafana/provisioning/datasources/prometheus.yml <<'EOF'
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://127.0.0.1:9090
    isDefault: true
EOF

# Start services
systemctl daemon-reload
systemctl enable --now prometheus
systemctl enable --now grafana-server

echo
echo "Prometheus and Grafana installed successfully!"
echo "Prometheus port: 9090"
echo "Grafana port: 3000"
echo "Grafana default login: admin / admin"
echo "Change the Grafana password after login."
echo
systemctl --no-pager status prometheus
systemctl --no-pager status grafana-server
