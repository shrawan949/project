pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    tools {
        nodejs 'NodeJS'
    }

    environment {
        FRONTEND_IMAGE = 'shrawanambarte0101/notes-frontend'
        BACKEND_IMAGE  = 'shrawanambarte0101/notes-backend'
        K8S_NAMESPACE  = 'notes-app'
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
                    echo "Source code and Kubernetes manifests found."
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
                            "${scannerHome}/bin/sonar-scanner" \
                              -Dsonar.projectKey=mini-notes-app \
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
                      -t shrawanambarte0101:${BUILD_NUMBER} \
                      application/frontend

                    docker build \
                      -t shrawanambart0101:${BUILD_NUMBER} \
                      application/backend
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DH_USER',
                        passwordVariable: 'DH_PASSWORD'
                    )
                ]) {
                    sh '''
                        set -eu
                        set +x

                        echo "$DH_PASSWORD" | docker login \
                          --username "$DH_USER" \
                          --password-stdin

                        docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}
                        docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}

                        docker logout
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([
                    file(
                        credentialsId: 'kubeconfig-admin.yaml',
                        variable: 'KUBECONFIG_FILE'
                    )
                ]) {
                    sh '''
                        set -eu
                        export KUBECONFIG="$KUBECONFIG_FILE"

                        kubectl get nodes

                        kubectl apply -f kubernetes/namespace.yml
                        kubectl apply -f kubernetes/

                        kubectl set image deployment/notes-frontend \
                          frontend=${FRONTEND_IMAGE}:${BUILD_NUMBER} \
                          -n ${K8S_NAMESPACE}

                        kubectl set image deployment/notes-backend \
                          backend=${BACKEND_IMAGE}:${BUILD_NUMBER} \
                          -n ${K8S_NAMESPACE}

                        kubectl rollout status deployment/notes-frontend \
                          -n ${K8S_NAMESPACE} --timeout=180s

                        kubectl rollout status deployment/notes-backend \
                          -n ${K8S_NAMESPACE} --timeout=180s

                        kubectl get pods,services -n ${K8S_NAMESPACE}
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
