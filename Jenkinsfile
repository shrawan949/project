
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
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm

                sh '''
                    set -eu

                    test -f application/frontend/package.json
                    test -f application/frontend/Dockerfile
                    test -f application/backend/package.json
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
                            sh """
                                set -eu

                                '${scannerHome}/bin/sonar-scanner' \
                                  -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                                  -Dsonar.projectName=Mini-Notes-App \
                                  -Dsonar.sources=application/frontend/src,application/backend/src \
                                  -Dsonar.exclusions=**/node_modules/**,**/dist/** \
                                  -Dsonar.sourceEncoding=UTF-8 \
                                  -Dsonar.token=\$SONAR_TOKEN
                            """
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
                      -t shrawanambarte0101/notes-backend:${BUILD_NUMBER}\
                      application/backend

                    docker build \
                      -t shrawanambarte0101/notes-frontend:${BUILD_NUMBER} \
                      application/frontend

                    echo "Docker images built successfully."
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

                        docker push shrawanambarte0101/notes-backend:${BUILD_NUMBER}
                        docker push shrawanambarte0101/notes-frontend:${BUILD_NUMBER}


                        echo "Both images pushed successfully."
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

                        echo "Checking Kubernetes nodes..."
                        kubectl get nodes

                        echo "Checking namespace..."
                        kubectl get namespace "${K8S_NAMESPACE}"

                        echo "Checking deployments..."
                        kubectl get deployments -n notes-app
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

                        echo "Updating backend image..."
                         kubectl set image deployment/notes-frontend \
                          frontend=shrawanambarte0101/notes-frontend:${BUILD_NUMBER} \
                          -n notes-app

                        echo "Updating frontend image..."
                         kubectl set image deployment/notes-backend \
                          backend=shrawanambarte0101/notes-backend:${BUILD_NUMBER} \
                          -n notes-app

                        echo "Waiting for backend rollout..."
                        kubectl set image deployment/notes-backend \
                          backend=shrawanambarte0101/notes-backend:${BUILD_NUMBER} \
                          -n notes-app

                        echo "Waiting for frontend rollout..."
                        kubectl rollout status deployment/notes-frontend \
                          -n notes-app --timeout=180s

                        echo "Final pod status:"
                        kubectl get pods -n notes-app -o wide

                        echo "Kubernetes services:"
                        kubectl get services -n notes-app

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

