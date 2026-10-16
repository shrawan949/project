#!/bin/bash
set -e

# Verify Prometheus binary exists
if ! command -v prometheus >/dev/null 2>&1; then
    echo "Prometheus binary missing. Please tell me before reinstalling."
    exit 1
fi

# Create configuration and storage directories
id prometheus >/dev/null 2>&1 || \
useradd --system --no-create-home --shell /sbin/nologin prometheus

mkdir -p /etc/prometheus /var/lib/prometheus

# Prometheus configuration
cat > /etc/prometheus/prometheus.yml <<'EOF'
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: prometheus
    static_configs:
      - targets: ['localhost:9090']
EOF

chown -R prometheus:prometheus /etc/prometheus /var/lib/prometheus

# Prometheus service
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
RestartSec=5

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

# Automatically configure Grafana data source
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
echo "===== SERVICE STATUS ====="
systemctl --no-pager --full status prometheus
systemctl --no-pager --full status grafana-server

echo
echo "Prometheus: http://YOUR-PUBLIC-IP:9090"
echo "Grafana:    http://YOUR-PUBLIC-IP:3000"
echo "Grafana login: admin / admin"
