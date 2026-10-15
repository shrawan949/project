pipeline {
    agent any

    options {
        timestamps()
        skipDefaultCheckout(true)
        timeout(time: 30, unit: 'MINUTES')
    }

    environment {
        BACKEND_IMAGE  = 'shrawanambarte0101/notes-backend'
        FRONTEND_IMAGE = 'shrawanambarte0101/notes-frontend'
        K8S_NAMESPACE  = 'notes-app'
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

                    echo "Source files validated."
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
                        sh """
                            set -eu
                            '${scannerHome}/bin/sonar-scanner' \
                              -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                              -Dsonar.projectName=Mini-Notes-App \
                              -Dsonar.sources=application/frontend/src,application/backend/src \
                              -Dsonar.exclusions=**/node_modules/**,**/dist/** \
                              -Dsonar.sourceEncoding=UTF-8
                        """
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    set -eu

                    docker build \
                      -t shrawanambarte0101/notes-backend:${BUILD_NUMBER} \
                      application/backend

                    docker build \
                      -t shrawanambarte0101/notes-frontend:${BUILD_NUMBER} \
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

                        echo "$DOCKER_PASSWORD" | docker login \
                          -u "$DOCKER_USER" \
                          --password-stdin

                        docker push shrawanambarte0101/notes-backend:${BUILD_NUMBER}
                        docker push shrawanambarte0101/notes-frontend:${BUILD_NUMBER}

                        docker logout
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
                        export KUBECONFIG="$KUBECONFIG_FILE_NEW"

                        echo "Checking Kubernetes cluster..."
                        kubectl get nodes

                        echo "Applying Kubernetes manifests..."
                        kubectl apply -f kubernetes/namespace.yml
                        kubectl apply -f kubernetes/

                        echo "Updating frontend image..."
                        kubectl set image deployment/notes-frontend \
                          frontend=shrawanambarte0101/notes-frontend:${BUILD_NUMBER} \
                          -n notes-app

                        echo "Updating backend image..."
                        kubectl set image deployment/notes-backend \
                          backend=shrawanambarte0101/notes-backend:${BUILD_NUMBER} \
                          -n notes-app

                        echo "Waiting for frontend rollout..."
                        kubectl rollout status deployment/notes-frontend \
                          -n notes-app --timeout=180s

                        echo "Waiting for backend rollout..."
                        kubectl rollout status deployment/notes-backend \
                          -n notes-app --timeout=180s

                        echo "Final Kubernetes status:"
                        kubectl get pods,services -n notes-app
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: Notes application deployed successfully.'
        }

        failure {
            echo 'FAILED: Check the Jenkins Console Output.'
        }

        always {
            echo "Pipeline build number: ${BUILD_NUMBER}"
        }
    }
}

