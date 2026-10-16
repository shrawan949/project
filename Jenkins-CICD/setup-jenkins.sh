
#!/bin/bash
set -euo pipefail

echo "======================================"
echo " Installing Jenkins LTS on RHEL 9"
echo "======================================"

# 1. Update packages
dnf install -y wget curl git fontconfig

# 2. Install Java 21
dnf install -y java-21-openjdk java-21-openjdk-devel

# 3. Verify Java
java -version

# 4. Add the official Jenkins LTS repository
wget -O /etc/yum.repos.d/jenkins.repo \
  https://pkg.jenkins.io/rpm-stable/jenkins.repo

# 5. Import Jenkins signing key
rpm --import https://pkg.jenkins.io/rpm-stable/jenkins.io-2026.key

# 6. Install Jenkins
dnf install -y jenkins

# 7. Enable and start Jenkins
systemctl daemon-reload
systemctl enable --now jenkins

# 8. Wait briefly and check status
sleep 5
systemctl --no-pager --full status jenkins || true

# 9. Display Jenkins information
echo
echo "======================================"
echo " Jenkins installation completed"
echo "======================================"
echo "Java version:"
java -version

echo
echo "Jenkins service:"
systemctl is-active jenkins

echo
echo "Initial administrator password:"
if [ -f /var/lib/jenkins/secrets/initialAdminPassword ]; then
    cat /var/lib/jenkins/secrets/initialAdminPassword
else
    echo "Password not available yet. Check Jenkins logs."
fi

echo
echo "Open Jenkins at:"
echo "http://YOUR_JENKINS_PUBLIC_IP:8080"

