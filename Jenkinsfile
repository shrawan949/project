pipeline {
    agent any

    options {
        timestamps()
        skipDefaultCheckout(true)
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    environment {
        BACKEND_IMAGE     = 'shrawanambarte0101/notes-backend'
        FRONTEND_IMAGE    = 'shrawanambarte0101/notes-frontend'
        K8S_NAMESPACE     = 'notes-app'
        SONAR_PROJECT_KEY = 'mini-notes-app'
        PATH              = "/usr/bin:/usr/local/bin:${env.PATH}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm

                sh '''
                    set -eu
                    test -f application/frontend/package.json
                    test -f application/frontend/package-lock.json
                    test -f application/frontend/Dockerfile
                    test -f application/backend/package.json
                    test -f application/backend/package-lock.json
                    test -f application/backend/Dockerfile
                    test -d kubernetes
                    echo "Source files validated successfully."
                '''
            }
        }

        stage('Build Frontend') {
            steps {
                dir('application/frontend') {
                    sh '''
                        set -eu
                        npm ci
                        npm run build
                    '''
                }
            }
        }

        stage('Check Backend') {
            steps {
                dir('application/backend') {
                    sh '''
                        set -eu
                        npm ci
                        node --check src/index.js
                        npm run test --if-present
                    '''
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarQube-01'

                    withSonarQubeEnv('SonarQube') {
                        withCredentials([
                            string(
                                credentialsId: 'sonar-token',
                                variable: 'SONAR_TOKEN'
                            )
                        ]) {
                            withEnv([
                                "SONAR_SCANNER=${scannerHome}/bin/sonar-scanner"
                            ]) {
                                sh '''
                                    set -eu
                                    "$SONAR_SCANNER" \
                                      -Dsonar.projectKey="$SONAR_PROJECT_KEY" \
                                      -Dsonar.projectName=Mini-Notes-App \
                                      -Dsonar.sources=application/frontend/src,application/backend/src \
                                      -Dsonar.exclusions=**/node_modules/**,**/dist/** \
                                      -Dsonar.sourceEncoding=UTF-8 \
                                      -Dsonar.token="$SONAR_TOKEN"
                                '''
                            }
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    set -eu

                    docker build \
                      -t ${BACKEND_IMAGE}:${BUILD_NUMBER} \
                      application/backend

                    docker build \
                      -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} \
                      application/frontend

                    docker images
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh '''
                        set -eu
                        trap 'docker logout >/dev/null 2>&1 || true' EXIT

                        echo "$DOCKER_PASSWORD" | docker login \
                          --username "$DOCKER_USER" \
                          --password-stdin

                        docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}
                        docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}
                    '''
                }
            }
        }

        stage('Verify Kubernetes Connection') {
            steps {
                withCredentials([
                    file(
                        credentialsId: 'kubeconfig-admin',
                        variable: 'KUBECONFIG_FILE'
                    )
                ]) {
                    sh '''
                        set -eu
                        export KUBECONFIG="$KUBECONFIG_FILE"

                        kubectl get nodes
                        kubectl get namespace "$K8S_NAMESPACE"
                        kubectl get deployments -n "$K8S_NAMESPACE"
                        kubectl get pods -n "$K8S_NAMESPACE"
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([
                    file(
                        credentialsId: 'kubeconfig-admin',
                        variable: 'KUBECONFIG_FILE'
                    )
                ]) {
                    sh '''
                        set -eu
                        export KUBECONFIG="$KUBECONFIG_FILE"

                        kubectl set image deployment/notes-backend \
                          backend=${BACKEND_IMAGE}:${BUILD_NUMBER} \
                          -n "$K8S_NAMESPACE"

                        kubectl set image deployment/notes-frontend \
                          frontend=${FRONTEND_IMAGE}:${BUILD_NUMBER} \
                          -n "$K8S_NAMESPACE"

                        kubectl rollout status deployment/notes-backend \
                          -n "$K8S_NAMESPACE" --timeout=180s

                        kubectl rollout status deployment/notes-frontend \
                          -n "$K8S_NAMESPACE" --timeout=180s

                        kubectl get deployments -n "$K8S_NAMESPACE"
                        kubectl get pods -n "$K8S_NAMESPACE" -o wide
                        kubectl get services -n "$K8S_NAMESPACE"

                        echo "Deployment completed successfully."
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: Build, SonarQube analysis, Docker push and Kubernetes deployment completed.'
        }

        failure {
            echo 'FAILED: Check Jenkins Console Output for the failing stage.'
        }

        always {
            echo "Pipeline build number: ${BUILD_NUMBER}"
        }
    }
}
