pipeline{
    agent any
    environment{
        IMAGE_NAME = "shrawanambarte0101/project-ops"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }
    stages{
        stage('git checkout'){
            steps{
                checkout scmGit(branches: [[name: '*/master']], extensions: [], userRemoteConfigs: [[url: 'https://github.com/shrawan949/project.git']])
   
            }
        }
        stage('docker build '){
            steps{
                sh """
                docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
                docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest
                """
            }
        }
        stage('docker login and push'){
            steps{
                withCredentials([
                    usernamePassword(
                        credentialsId: 'docker-cred',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]){
                    sh """
                    echo "\$DOCKER_PASSWORD"|docker login -u"\$DOCKER_USERNAME" --password-stdin 
                    docker push ${IMAGE_NAME}:${IMAGE_TAG}
                    docker push ${IMAGE_NAME}:latest
                    docker logout
                    """
                }
            }
        }
        stage('Deploy to kubernetes'){
            steps{
                sh """
                kubectl set image deployment/project app=${IMAGE_NAME}:${IMAGE_TAG} -n practice"""
            }
        }
    }
    post{
        success{
            echo "CI/CD Deployment COMPLETED SUCCESFULLY"
        }
        failure{
            echo "CI/CD pipeline falied"
        }
    }
}
