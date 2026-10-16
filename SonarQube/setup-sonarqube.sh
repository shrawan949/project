
# Configure kernel requirements
cat > /etc/sysctl.d/99-sonarqube.conf <<'EOF'
vm.max_map_count=524288
fs.file-max=131072
EOF

sysctl --system

# Create persistent directories
mkdir -p /opt/sonarqube/{postgres,data,extensions,logs}

# Create a Podman network
podman network exists sonar-net || podman network create sonar-net

# Start PostgreSQL
podman run -d \
  --name sonar-db \
  --network sonar-net \
  --restart unless-stopped \
  -e POSTGRES_USER=sonar \
  -e POSTGRES_PASSWORD='REPLACE_WITH_STRONG_PASSWORD' \
  -e POSTGRES_DB=sonarqube \
  -v /opt/sonarqube/postgres:/var/lib/postgresql/data:Z \
  docker.io/library/postgres:15

# Wait for PostgreSQL
until podman exec sonar-db pg_isready -U sonar -d sonarqube; do
  sleep 5
done

# Download SonarQube Community Build
podman pull docker.io/library/sonarqube:community

# Start SonarQube
podman run -d \
  --name sonarqube \
  --network sonar-net \
  --restart unless-stopped \
  -p 9000:9000 \
  -e SONAR_JDBC_URL='jdbc:postgresql://sonar-db:5432/sonarqube' \
  -e SONAR_JDBC_USERNAME=sonar \
  -e SONAR_JDBC_PASSWORD='REPLACE_WITH_STRONG_PASSWORD' \
  -v /opt/sonarqube/data:/opt/sonarqube/data:Z \
  -v /opt/sonarqube/extensions:/opt/sonarqube/extensions:Z \
  -v /opt/sonarqube/logs:/opt/sonarqube/logs:Z \
  docker.io/library/sonarqube:community

