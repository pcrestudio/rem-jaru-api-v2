pipeline {
    agent { label 'remajaru' }
    
    triggers {
        githubPush()
    }

    environment {
        DOCKER_HOST = "${params.DOCKER_HOST}"
        APP_NAME = "${params.APP_NAME}"
        GITHUB_USER="${params.GITHUB_USER}"
        REPO_OWNER="${params.REPO_OWNER}"
        REPO_NAME="${params.REPO_NAME}"
        REPO_BRANCH = "${params.BRANCH_NAME}"
        BUILD_NUMBER = "${env.BUILD_NUMBER}"
        DOCKER_PORT = "${params.DOCKER_PORT}"
        DEPLOYMENT_DIR = "${WORKSPACE}/deployments/${APP_NAME}"
        ENV_FILE_CREDENTIALS_ID = "${params.ENV_FILE_CREDENTIALS_ID}"
    }

    stages {
         stage('Prepare Deployment') {
            steps {
                sh '''
                    echo "Preparing deployment directory..."
                    mkdir -p ${DEPLOYMENT_DIR}
                    chmod 755 ${DEPLOYMENT_DIR}
                    echo "Deployment directory is ready: ${DEPLOYMENT_DIR}"
                '''
            }
        }

        stage('Prepare Environment File') {
            steps {
                withCredentials([file(credentialsId: env.ENV_FILE_CREDENTIALS_ID, variable: 'ENV_FILE')]) {
                    sh '''
                        cp ${ENV_FILE} /home/rem-admin/workspace/rem-jaru-api-dev/deployments/rem-jaru-api-dev/.env
                    '''
                }
            }
        }

         stage('Build and Deploy') {
            steps {
                sh '''
                    echo "Deploying application to ${DEPLOYMENT_DIR}..."
                    
                    # Copy files to deployment directory while excluding 'deployments'
                    rsync -av --exclude 'deployments' ${WORKSPACE}/ ${DEPLOYMENT_DIR}/
                    
                    echo "Running Docker container from deployment folder..."
                    cd ${DEPLOYMENT_DIR}
                    
                    echo "Building Docker image..."
                    docker build -t ${APP_NAME}:${BUILD_NUMBER} .

                    echo "Stopping and removing existing container..."
                    
                    # Stop the container if it exists
                    if [ "$(docker ps -q -f name=${APP_NAME})" ]; then
                        docker stop ${APP_NAME}
                    fi

                    # Remove the container if it exists
                    if [ "$(docker ps -a -q -f name=${APP_NAME})" ]; then
                        docker rm ${APP_NAME}
                    fi

                    echo "Running new Docker container..."
                    docker run -d --name ${APP_NAME} --env-file ${DEPLOYMENT_DIR}/.env -p ${DOCKER_PORT}:${DOCKER_PORT} ${APP_NAME}:${BUILD_NUMBER}
                '''
            }
        }
    }

    post {
        success {
                    // Notifications for successful deployment
            emailext subject: "Jenkins Deployment Successful: ${APP_NAME} Build #${BUILD_NUMBER}",
                     body: "The deployment of ${APP_NAME} Build #${BUILD_NUMBER} was successful.",
                     to: 'sistemas@estudiorodrigo.com'

            
        }

        failure {
            // Notifications for failed deployment
            emailext subject: "Jenkins Deployment Failed: ${APP_NAME} Build #${BUILD_NUMBER}",
                     body: "The deployment of ${APP_NAME} Build #${BUILD_NUMBER} failed. Please investigate the logs.",
                     to: 'sistemas@estudiorodrigo.com'

            
        }

        always {
            cleanWs()
        }
        
    }
}
