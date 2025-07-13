// Comprehensive multi-branch pipeline with branch-specific behavior
pipeline {
    // Agent selection based on branch
    agent any
        // Use different agents for different branches if needed
        // label getBranchAgent(env.BRANCH_NAME)
        
    tools {
        nodejs 'NodeJS-24'  // Name configured in Global Tool Configuration
    }
    
    // Global environment variables
    environment {
        // Application configuration
        APP_NAME = 'multi-branch-demo'
        APP_VERSION = "1.0.${BUILD_NUMBER}"
        
        // Docker registry configuration
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_IMAGE = "${APP_NAME}"
        
        // Branch-specific environment variables
        TARGET_ENVIRONMENT = getBranchEnvironment(env.BRANCH_NAME)
        DEPLOY_ENABLED = shouldDeploy(env.BRANCH_NAME)
        
        // Notification settings
        SLACK_CHANNEL = getBranchSlackChannel(env.BRANCH_NAME)
    }
    
    // Pipeline options
    options {
        // Build timeout varies by branch type (defaulting to 45 minutes)
        timeout(time: 45, unit: 'MINUTES')
        
        // Keep different number of builds per branch (defaulting to 10)
        buildDiscarder(logRotator(
            numToKeepStr: '10'
        ))
        
        // Add timestamps to console output
        timestamps()
        
        // Skip default checkout - we'll handle it in stages
        skipDefaultCheckout()
    }
    
    // Branch-specific parameters
    parameters {
        booleanParam(
            name: 'DEPLOY_TO_PRODUCTION',
            defaultValue: false,
            description: 'Deploy to production environment (only for main/master branches)'
        )
        booleanParam(
            name: 'RUN_PERFORMANCE_TESTS',
            defaultValue: true,
            description: 'Run performance tests (recommended for main/master branches)'
        )
        booleanParam(
            name: 'SKIP_INTEGRATION_TESTS',
            defaultValue: false,
            description: 'Skip integration tests for faster feedback (useful for feature branches)'
        )
        booleanParam(
            name: 'ENABLE_DEBUG_MODE',
            defaultValue: false,
            description: 'Enable debug mode for detailed logging'
        )
    }
    
    stages {
        // Stage 1: Environment Information & Validation
        stage('Environment Setup') {
            steps {
                script {
                    // Checkout source code first
                    checkout scm
                    
                    // Set branch-specific configurations
                    echo "🔧 Setting Branch-Specific Configurations"
                    echo "========================================="
                    
                    // Configure branch-specific settings
                    def branchTimeout = getBranchTimeout(env.BRANCH_NAME)
                    def buildRetention = getBranchBuildRetention(env.BRANCH_NAME)
                    echo "Build timeout: ${branchTimeout} minutes"
                    echo "Build retention: ${buildRetention} builds"
                    
                    // Set concurrent build policy for production branches
                    if (env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'master') {
                        echo "🔒 Production branch detected - disabling concurrent builds"
                        currentBuild.description = "PRODUCTION: ${env.BRANCH_NAME} #${env.BUILD_NUMBER}"
                    }
                    
                    // Validate parameter usage based on branch
                    echo "📋 Parameter Validation:"
                    if (params.DEPLOY_TO_PRODUCTION && !(env.BRANCH_NAME in ['main', 'master'])) {
                        echo "⚠️ Warning: DEPLOY_TO_PRODUCTION is only recommended for main/master branches"
                    }
                    
                    if (params.RUN_PERFORMANCE_TESTS && env.BRANCH_NAME.startsWith('feature/')) {
                        echo "ℹ️ Info: Performance tests enabled for feature branch (may increase build time)"
                    }
                    
                    if (params.SKIP_INTEGRATION_TESTS && (env.BRANCH_NAME in ['main', 'master'])) {
                        echo "⚠️ Warning: Skipping integration tests is not recommended for production branches"
                    }
                    
                    // Display comprehensive branch information
                    echo ""
                    echo "🌿 BRANCH INFORMATION"
                    echo "===================="
                    echo "Branch Name: ${env.BRANCH_NAME}"
                    echo "Build Number: ${env.BUILD_NUMBER}"
                    echo "Build URL: ${env.BUILD_URL}"
                    echo "Target Environment: ${env.TARGET_ENVIRONMENT}"
                    echo "Deploy Enabled: ${env.DEPLOY_ENABLED}"
                    echo "Workspace: ${env.WORKSPACE}"
                    echo "Node Name: ${env.NODE_NAME}"
                    echo "Jenkins URL: ${env.JENKINS_URL}"
                    echo "Debug Mode: ${params.ENABLE_DEBUG_MODE}"
                    
                    // Branch-specific information
                    def branchType = getBranchType(env.BRANCH_NAME)
                    echo "Branch Type: ${branchType}"
                    
                    // Set build description
                    currentBuild.description = "${branchType} build for ${env.BRANCH_NAME}"
                    
                    // Validate branch naming conventions
                    validateBranchName(env.BRANCH_NAME)
                    
                    // Enable debug logging if requested
                    if (params.ENABLE_DEBUG_MODE) {
                        echo "🐛 DEBUG MODE ENABLED"
                        echo "===================="
                        echo "Git Information:"
                        sh '''
                            echo "Git HEAD: $(git rev-parse HEAD)"
                            echo "Git Branch: $(git symbolic-ref --short HEAD 2>/dev/null || echo 'detached')"
                            echo "Git Remote: $(git remote get-url origin 2>/dev/null || echo 'no remote')"
                            echo "Git Status:"
                            git status --porcelain || echo "Clean working directory"
                        '''
                        echo "Environment Variables:"
                        sh 'printenv | grep -E "(JENKINS|BUILD|BRANCH|GIT)" | sort'
                    }
                }
            }
        }
        
        // Stage 2: Source Code Checkout & Validation
        stage('Checkout & Validate') {
            steps {
                script {
                    echo "📥 Source Code Analysis"
                    echo "======================"
                    
                    // List changed files (useful for feature branches)
                    if (env.CHANGE_ID) {
                        echo "This is a Pull Request build"
                        echo "PR Number: ${env.CHANGE_ID}"
                        echo "PR Title: ${env.CHANGE_TITLE}"
                        echo "PR Author: ${env.CHANGE_AUTHOR}"
                    }
                    
                    // Show Git information
                    sh '''
                        echo "Git Information:"
                        echo "Commit: $(git rev-parse HEAD)"
                        echo "Author: $(git log -1 --pretty=format:'%an <%ae>')"
                        echo "Message: $(git log -1 --pretty=format:'%s')"
                        echo "Changed files:"
                        git diff --name-only HEAD~1 || echo "No previous commit to compare"
                    '''
                }
            }
        }
        
        // Stage 3: Branch-Specific Build Process
        stage('Build Application') {
            steps {
                script {
                    echo "🏗️ Building Application for ${env.TARGET_ENVIRONMENT}"
                    echo "=============================================="
                    
                    // Branch-specific build commands
                    switch (env.BRANCH_NAME) {
                        case 'main':
                        case 'master':
                            echo "🚀 Production Build Process"
                            sh '''
                                npm install --production
                                npm run build
                                echo "Production optimizations applied"
                                echo "Build artifacts created for production"
                            '''
                            break
                            
                        case 'develop':
                            echo "🔧 Staging Build Process"
                            sh '''
                                npm install
                                npm run build
                                echo "Staging build with debug symbols"
                            '''
                            break
                            
                        default:
                            if (env.BRANCH_NAME.startsWith('feature/')) {
                                echo "💡 Feature Branch Build Process"
                                sh '''
                                    npm install
                                    npm run build
                                    echo "Feature branch build - development mode"
                                '''
                            } else if (env.BRANCH_NAME.startsWith('hotfix/')) {
                                echo "🚨 Hotfix Branch Build Process"
                                sh '''
                                    npm install --production
                                    npm run build
                                    echo "Hotfix build - production-ready"
                                '''
                            } else {
                                echo "🔄 Standard Build Process"
                                sh '''
                                    npm install
                                    npm run build
                                '''
                            }
                    }
                }
            }
        }
        
        // Stage 4: Branch-Specific Testing
        stage('Test Suite') {
            parallel {
                // Unit Tests - Always run
                stage('Unit Tests') {
                    steps {
                        script {
                            echo "🧪 Running Unit Tests for ${env.BRANCH_NAME}"
                            
                            // Set branch name for tests
                            withEnv(["BRANCH_NAME=${env.BRANCH_NAME}"]) {
                                sh '''
                                    echo "Executing unit tests..."
                                    npm test
                                '''
                            }
                        }
                    }
                    post {
                        always {
                            // Archive test results if they exist
                            script {
                                if (fileExists('test-results.xml')) {
                                    junit 'test-results.xml'
                                }
                            }
                        }
                    }
                }
                
                // Integration Tests - Branch conditional
                stage('Integration Tests') {
                    when {
                        not {
                            anyOf {
                                // Skip for feature branches if parameter is set
                                allOf {
                                    branch 'feature/*'
                                    expression { params.SKIP_INTEGRATION_TESTS == true }
                                }
                            }
                        }
                    }
                    steps {
                        echo "🔗 Running Integration Tests"
                        sh '''
                            echo "Starting integration test suite..."
                            node tests/app.test.js
                            echo "Integration tests completed"
                        '''
                    }
                }
                
                // Performance Tests - Production branches only
                stage('Performance Tests') {
                    when {
                        anyOf {
                            branch 'main'
                            branch 'master'
                            expression { params.RUN_PERFORMANCE_TESTS == true }
                        }
                    }
                    steps {
                        echo "⚡ Running Performance Tests"
                        sh '''
                            echo "Starting performance benchmarks..."
                            echo "Memory usage test: PASSED"
                            echo "Response time test: PASSED"
                            echo "Load test: PASSED"
                            echo "Performance tests completed"
                        '''
                    }
                }
            }
        }
        
        // Stage 5: Security & Quality Gates
        stage('Quality Gates') {
            parallel {
                // Security Scan
                stage('Security Scan') {
                    steps {
                        echo "🔒 Security Analysis for ${env.BRANCH_NAME}"
                        sh '''
                            echo "Running security scans..."
                            echo "Dependency vulnerability scan: PASSED"
                            echo "Code security analysis: PASSED"
                            echo "Container security scan: PASSED"
                        '''
                    }
                }
                
                // Code Quality (more strict for main branches)
                stage('Code Quality') {
                    steps {
                        script {
                            echo "📊 Code Quality Analysis"
                            
                            def qualityGate = env.BRANCH_NAME in ['main', 'master'] ? 'strict' : 'standard'
                            echo "Quality gate level: ${qualityGate}"
                            
                            sh '''
                                echo "Running code quality checks..."
                                echo "Linting: PASSED"
                                echo "Code coverage: 85% (acceptable)"
                                echo "Complexity analysis: PASSED"
                            '''
                        }
                    }
                }
            }
        }
        
        // Stage 6: Docker Build (if applicable)
        stage('Docker Build') {
            // Remove the Docker agent and run Docker commands directly on the Jenkins master because docker cli was not installed on agent
            // agent {
            //     docker {
            //         image 'docker:latest'
            //         args '-v /var/run/docker.sock:/var/run/docker.sock'
            //     }
            // }
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    branch 'develop'
                    branch 'feature/*'
                }
            }
            steps {
                script {
                    echo "🐳 Building Docker Image for ${env.BRANCH_NAME}"
                    
                    // Create branch-specific Docker tag
                    def dockerTag = createDockerTag(env.BRANCH_NAME, env.BUILD_NUMBER)
                    
                    sh """
                        echo "Building Docker image with tag: ${dockerTag}"
                        
                        # Create Dockerfile for this demo
                        cat > Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
ENV BRANCH_NAME=${env.BRANCH_NAME}
ENV BUILD_NUMBER=${env.BUILD_NUMBER}
CMD ["npm", "start"]
EOF
                        
                        # Build Docker image
                        docker build -t ${env.DOCKER_IMAGE}:${dockerTag} .
                        docker tag ${env.DOCKER_IMAGE}:${dockerTag} ${env.DOCKER_IMAGE}:${env.BRANCH_NAME}-latest
                        
                        echo "Docker image built successfully: ${env.DOCKER_IMAGE}:${dockerTag}"
                    """
                    
                    // Store Docker tag for later stages
                    env.DOCKER_TAG = dockerTag
                }
            }
        }
        
        // Stage 7: Branch-Specific Deployment
        stage('Deploy') {
            parallel {
                // Automatic deployment for certain branches
                stage('Auto Deploy') {
                    when {
                        allOf {
                            expression { env.DEPLOY_ENABLED == 'true' }
                            anyOf {
                                branch 'develop'
                                allOf {
                                    branch 'feature/*'
                                    expression { env.BRANCH_NAME != 'feature/experimental' }
                                }
                            }
                        }
                    }
                    steps {
                        script {
                            echo "🚀 Automatic Deployment to ${env.TARGET_ENVIRONMENT}"
                            
                            sh """
                                echo "Deploying to ${env.TARGET_ENVIRONMENT} environment..."
                                
                                # Simulate deployment
                                echo "1. Stopping existing services..."
                                echo "2. Deploying new version..."
                                echo "3. Running health checks..."
                                echo "4. Updating load balancer..."
                                
                                # Start application container
                                docker run -d \\
                                    --name ${env.APP_NAME}-${env.BRANCH_NAME} \\
                                    -p 3000:3000 \\
                                    ${env.DOCKER_IMAGE}:${env.DOCKER_TAG}
                                
                                echo "Deployment completed successfully!"
                                echo "Application URL: http://localhost:3000"
                            """
                        }
                    }
                }
                
                // Manual approval for production
                stage('Production Deploy') {
                    when {
                        allOf {
                            anyOf {
                                branch 'main'
                                branch 'master'
                            }
                            expression { params.DEPLOY_TO_PRODUCTION == true }
                        }
                    }
                    input {
                        message "Deploy to production?"
                        ok "Deploy"
                        submitter "admin,release-manager"
                        parameters {
                            string(name: 'RELEASE_VERSION', description: 'Release version tag')
                            choice(name: 'DEPLOYMENT_STRATEGY', choices: ['blue-green', 'rolling', 'canary'], description: 'Deployment strategy')
                        }
                    }
                    steps {
                        script {
                            echo "🏭 Production Deployment Initiated"
                            echo "Release Version: ${RELEASE_VERSION}"
                            echo "Strategy: ${DEPLOYMENT_STRATEGY}"
                            
                            sh '''
                                echo "Starting production deployment..."
                                echo "Using deployment strategy: $DEPLOYMENT_STRATEGY"
                                echo "Production deployment completed!"
                            '''
                        }
                    }
                }
            }
        }
    }
    
    // Post-build actions
    post {
        always {
            script {
                echo "🧹 Post-Build Cleanup and Reporting"
                
                // Generate branch-specific build report
                def buildReport = generateBuildReport(env.BRANCH_NAME, currentBuild)
                
                // Archive artifacts based on branch
                archiveBranchArtifacts(env.BRANCH_NAME)
                
                // Cleanup temporary containers
                sh '''
                    echo "Cleaning up temporary containers..."
                    docker ps -a --filter "name=temp-" --format "{{.Names}}" | xargs -r docker rm -f
                '''
            }
        }
        
        success {
            script {
                echo "✅ Pipeline Success for ${env.BRANCH_NAME}"
                
                // Branch-specific success actions
                switch (env.BRANCH_NAME) {
                    case 'main':
                    case 'master':
                        echo "🎉 Production branch build successful!"
                        // Send success notification to production team
                        break
                    case 'develop':
                        echo "🎉 Staging branch build successful!"
                        // Send notification to QA team
                        break
                    default:
                        if (env.BRANCH_NAME.startsWith('feature/')) {
                            echo "🎉 Feature branch build successful!"
                            // Notify feature developer
                        }
                }
            }
        }
        
        failure {
            script {
                echo "❌ Pipeline Failed for ${env.BRANCH_NAME}"
                
                // Branch-specific failure handling
                def failureReport = generateFailureReport(env.BRANCH_NAME, currentBuild)
                echo failureReport
                
                // Different notification strategies per branch
                switch (env.BRANCH_NAME) {
                    case 'main':
                    case 'master':
                        echo "🚨 CRITICAL: Production branch failure!"
                        // Immediate escalation
                        break
                    default:
                        echo "⚠️ Development branch failure - developer notified"
                }
            }
        }
        
        unstable {
            echo "⚠️ Pipeline Unstable for ${env.BRANCH_NAME} - Tests failed but build succeeded"
        }
    }
}

// Helper functions for multi-branch logic
def getBranchAgent(branchName) {
    // Return different agent labels based on branch
    branchName = branchName ?: 'unknown'
    switch (branchName) {
        case 'main':
        case 'master':
            return 'production-agent'
        case 'develop':
            return 'staging-agent'
        default:
            return 'any'
    }
}

def getBranchEnvironment(branchName) {
    branchName = branchName ?: 'unknown'
    switch (branchName) {
        case 'main':
        case 'master':
            return 'production'
        case 'develop':
            return 'staging'
        default:
            if (branchName.startsWith('feature/')) return 'development'
            if (branchName.startsWith('hotfix/')) return 'hotfix'
            return 'development'
    }
}

def shouldDeploy(branchName) {
    // Define which branches should auto-deploy
    branchName = branchName ?: 'unknown'
    return branchName in ['develop'] || branchName.startsWith('feature/') ? 'true' : 'false'
}

def getBranchTimeout(branchName) {
    // Different timeouts for different branch types
    branchName = branchName ?: 'unknown'
    switch (branchName) {
        case 'main':
        case 'master':
            return 60  // Production builds get more time
        case 'develop':
            return 45
        default:
            return 30  // Feature branches are faster
    }
}

def getBranchBuildRetention(branchName) {
    // Keep more builds for important branches
    branchName = branchName ?: 'unknown'
    switch (branchName) {
        case 'main':
        case 'master':
            return '50'  // Keep more production builds
        case 'develop':
            return '20'
        default:
            return '10'  // Fewer builds for feature branches
    }
}

def getBranchSlackChannel(branchName) {
    branchName = branchName ?: 'unknown'
    switch (branchName) {
        case 'main':
        case 'master':
            return '#production-alerts'
        case 'develop':
            return '#staging-updates'
        default:
            return '#development'
    }
}

def getBranchType(branchName) {
    branchName = branchName ?: 'unknown'
    if (branchName in ['main', 'master']) return 'Production'
    if (branchName == 'develop') return 'Staging'
    if (branchName.startsWith('feature/')) return 'Feature'
    if (branchName.startsWith('hotfix/')) return 'Hotfix'
    if (branchName.startsWith('release/')) return 'Release'
    return 'Unknown'
}

def validateBranchName(branchName) {
    // Enforce branch naming conventions
    branchName = branchName ?: 'unknown'
    def validPrefixes = ['main', 'master', 'develop', 'feature/', 'hotfix/', 'release/']
    def isValid = validPrefixes.any { branchName.startsWith(it) }
    
    if (!isValid) {
        echo "⚠️ Warning: Branch name '${branchName}' doesn't follow naming conventions"
        echo "Expected prefixes: ${validPrefixes.join(', ')}"
    }
}

def createDockerTag(branchName, buildNumber) {
    // Create clean Docker tag from branch name
    branchName = branchName ?: 'unknown'
    def cleanBranch = branchName.replaceAll('[^a-zA-Z0-9.-]', '-').toLowerCase()
    return "${cleanBranch}-${buildNumber}"
}

def generateBuildReport(branchName, build) {
    def report = """
    BUILD REPORT
    ============
    Branch: ${branchName}
    Build Number: ${build.number}
    Duration: ${build.durationString}
    Result: ${build.result ?: 'SUCCESS'}
    Timestamp: ${new Date()}
    """
    
    echo report
    return report
}

def generateFailureReport(branchName, build) {
    def report = """
    FAILURE REPORT
    ==============
    Branch: ${branchName}
    Build Number: ${build.number}
    Failed Stage: ${env.STAGE_NAME ?: 'Unknown'}
    Duration: ${build.durationString}
    
    Investigation Steps:
    1. Check console output for detailed errors
    2. Review recent commits for potential issues
    3. Verify branch-specific configurations
    4. Check resource availability
    """
    
    return report
}

def archiveBranchArtifacts(branchName) {
    // Archive different artifacts based on branch
    switch (branchName) {
        case 'main':
        case 'master':
            // Archive production artifacts
            if (fileExists('dist/')) {
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
            }
            break
        default:
            // Archive basic artifacts for other branches
            if (fileExists('package.json')) {
                archiveArtifacts artifacts: 'package.json', fingerprint: true
            }
    }
}