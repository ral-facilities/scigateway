#!groovy
pipeline {
    agent { label 'sl7'}
    stages {
        stage('Preparation') {
            steps {
                checkout scm
                sh 'yarn'
            }
        }
        stage('Unit Tests') {
            steps {
                sh 'yarn test'
            }
        }
        stage('E2E Tests') {
            steps {
                sh 'yarn e2e'
            }
        }
    }
}
