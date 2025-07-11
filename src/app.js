// Multi-branch pipeline demo application
const http = require('http');
const port = process.env.PORT || 3000;

// Get branch information from environment (set by Jenkins)
const branchName = process.env.BRANCH_NAME || 'unknown';
const buildNumber = process.env.BUILD_NUMBER || 'unknown';
const environment = getBranchEnvironment(branchName);

// Determine environment based on branch name
function getBranchEnvironment(branch) {
  if (branch === 'main' || branch === 'master') return 'production';
  if (branch === 'develop') return 'staging';
  if (branch.startsWith('feature/')) return 'development';
  if (branch.startsWith('hotfix/')) return 'hotfix';
  return 'unknown';
}

// Create HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  
  const response = {
    message: `Hello from Multi-Branch Pipeline Demo!`,
    branch: branchName,
    build: buildNumber,
    environment: environment,
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      info: '/info'
    }
  };

  if (req.url === '/health') {
    res.end(JSON.stringify({
      status: 'healthy',
      branch: branchName,
      environment: environment
    }));
  } else if (req.url === '/info') {
    res.end(JSON.stringify({
      application: 'multi-branch-demo',
      version: '1.0.0',
      branch: branchName,
      build: buildNumber,
      environment: environment
    }));
  } else {
    res.end(JSON.stringify(response, null, 2));
  }
});

// Start server
server.listen(port, () => {
  console.log(`🚀 Multi-Branch Demo Server running on port ${port}`);
  console.log(`🌿 Branch: ${branchName}`);
  console.log(`🏗️ Build: ${buildNumber}`);
  console.log(`🎯 Environment: ${environment}`);
  console.log(`🔗 Access: http://localhost:${port}`);
});