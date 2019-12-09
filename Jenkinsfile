#!groovy
pipeline {
    agent { label 'sl7'}
    stages {
        stage('Preparation') {
            steps {
                checkout scm
                sh 'npm i'
            }
        }
        stage('Unit Tests') {
            steps {
                sh 'npm test'
            }
        }
        stage('E2E Tests') {
            steps {
                sh 'npm run e2e'
            }
        }
    }
}
