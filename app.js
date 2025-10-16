// Privacy Checker Web App
let currentResults = null;

// DOM Elements
const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const scanBtn = document.getElementById('scanBtn');
const urlInput = document.getElementById('urlInput');
const analyzePolicyBtn = document.getElementById('analyzePolicyBtn');
const policyFile = document.getElementById('policyFile');
const policyText = document.getElementById('policyText');
const fileName = document.getElementById('fileName');
const loading = document.getElementById('loading');
const resultsSection = document.getElementById('results');
const exportBtn = document.getElementById('exportBtn');
const newScanBtn = document.getElementById('newScanBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupEventListeners();
});

// Tab Switching
function setupTabs() {
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(`${tabName}-tab`).classList.add('active');

      // Hide results when switching tabs
      resultsSection.style.display = 'none';
    });
  });
}

// Event Listeners
function setupEventListeners() {
  scanBtn.addEventListener('click', handleWebsiteScan);
  analyzePolicyBtn.addEventListener('click', handlePolicyAnalysis);
  policyFile.addEventListener('change', handleFileUpload);
  exportBtn.addEventListener('click', exportReport);
  newScanBtn.addEventListener('click', resetScan);

  // Allow Enter key to submit
  urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleWebsiteScan();
  });
}

// Website Scanning
async function handleWebsiteScan() {
  const url = urlInput.value.trim();

  if (!url) {
    alert('Please enter a URL');
    return;
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    alert('Please enter a valid URL (including http:// or https://)');
    return;
  }

  showLoading('Scanning website...');

  try {
    const checks = await scanWebsite(url);
    const score = calculateScore(checks);

    currentResults = {
      type: 'website',
      url,
      timestamp: new Date().toISOString(),
      checks,
      score
    };

    displayResults(currentResults);
  } catch (error) {
    console.error('Scan error:', error);
    alert(`Error scanning website: ${error.message}`);
  } finally {
    hideLoading();
  }
}

// Scan Website (Client-side limitations apply)
async function scanWebsite(url) {
  const checks = [];

  // Check HTTPS
  const urlObj = new URL(url);
  checks.push({
    id: 'https-enabled',
    title: 'HTTPS Encryption',
    status: urlObj.protocol === 'https:' ? 'pass' : 'fail',
    priority: 'high',
    description: urlObj.protocol === 'https:'
      ? 'Site uses HTTPS encryption'
      : 'Site does not use HTTPS',
    fix: 'Implement HTTPS with a valid SSL/TLS certificate.'
  });

  // Try to fetch and check headers
  try {
    const response = await fetch(url, { mode: 'no-cors' });
    // Note: With no-cors, we can't actually read the response
    // This will succeed if the request goes through, but we can't check headers

    checks.push({
      id: 'site-accessible',
      title: 'Site Accessibility',
      status: 'pass',
      priority: 'low',
      description: 'Site is accessible',
      fix: null
    });
  } catch (error) {
    checks.push({
      id: 'site-accessible',
      title: 'Site Accessibility',
      status: 'fail',
      priority: 'high',
      description: `Could not access site: ${error.message}`,
      fix: 'Ensure the URL is correct and the site is online.'
    });
  }

  // Add info about web scanning limitations
  checks.push({
    id: 'web-scanning-note',
    title: 'Website Scanning - Limited',
    status: 'warn',
    priority: 'low',
    description: 'Browser-based website scanning has significant limitations due to security restrictions (CORS). This tool is optimized for privacy policy analysis.',
    details: [
      'Cannot access cookies from other domains',
      'Cannot read response headers from cross-origin requests',
      'Cannot analyze page content from other domains',
      'Privacy policy analysis works perfectly without these limitations'
    ],
    fix: 'Use the Privacy Policy tab for comprehensive GDPR compliance analysis.'
  });

  return checks;
}

// Privacy Policy Analysis
async function handlePolicyAnalysis() {
  const text = policyText.value.trim();

  if (!text) {
    alert('Please paste your privacy policy or upload a file');
    return;
  }

  showLoading('Analyzing privacy policy...');

  try {
    const analyzer = new PolicyAnalyzer();
    const checks = analyzer.analyze(text);
    const score = analyzer.calculateScore(checks);

    currentResults = {
      type: 'policy',
      timestamp: new Date().toISOString(),
      checks,
      score
    };

    displayResults(currentResults);
  } catch (error) {
    console.error('Analysis error:', error);
    alert(`Error analyzing policy: ${error.message}`);
  } finally {
    hideLoading();
  }
}

// File Upload
function handleFileUpload(e) {
  const file = e.target.files[0];

  if (!file) return;

  fileName.textContent = file.name;

  const reader = new FileReader();
  reader.onload = (event) => {
    policyText.value = event.target.result;
  };
  reader.readAsText(file);
}

// Calculate Score
function calculateScore(checks) {
  if (checks.length === 0) return 0;

  let totalWeight = 0;
  let earnedPoints = 0;

  checks.forEach(check => {
    const weight = check.priority === 'high' ? 3 : check.priority === 'medium' ? 2 : 1;
    totalWeight += weight;

    if (check.status === 'pass') {
      earnedPoints += weight;
    } else if (check.status === 'warn') {
      earnedPoints += weight * 0.5;
    }
  });

  return Math.round((earnedPoints / totalWeight) * 100);
}

// Display Results
function displayResults(results) {
  const { score, checks } = results;

  // Update score
  const scoreValue = document.getElementById('scoreValue');
  const scoreCircle = document.querySelector('.score-circle');

  scoreValue.textContent = score;

  // Set score color
  scoreCircle.classList.remove('score-good', 'score-medium', 'score-bad');
  if (score >= 80) {
    scoreCircle.classList.add('score-good');
  } else if (score >= 60) {
    scoreCircle.classList.add('score-medium');
  } else {
    scoreCircle.classList.add('score-bad');
  }

  // Update counts
  const passed = checks.filter(c => c.status === 'pass');
  const failed = checks.filter(c => c.status === 'fail');
  const warnings = checks.filter(c => c.status === 'warn');

  document.getElementById('passCount').textContent = passed.length;
  document.getElementById('failCount').textContent = failed.length;
  document.getElementById('warnCount').textContent = warnings.length;

  // Group checks by category
  const categories = groupChecksByCategory(checks);

  // Render checks
  const container = document.getElementById('checksContainer');
  container.innerHTML = '';

  Object.entries(categories).forEach(([categoryName, categoryChecks]) => {
    if (categoryChecks.length === 0) return;

    const categorySection = document.createElement('div');
    categorySection.className = 'category-section';

    const categoryTitle = document.createElement('h3');
    categoryTitle.className = 'category-title';
    categoryTitle.textContent = categoryName;
    categorySection.appendChild(categoryTitle);

    categoryChecks.forEach(check => {
      const checkEl = createCheckElement(check);
      categorySection.appendChild(checkEl);
    });

    container.appendChild(categorySection);
  });

  // Show results
  resultsSection.style.display = 'block';

  // Scroll to results
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Group checks by category
function groupChecksByCategory(checks) {
  const categories = {
    'Cookies': [],
    'Trackers': [],
    'Consent': [],
    'Security': [],
    'Privacy Policy': [],
    'Other': []
  };

  checks.forEach(check => {
    if (check.id.includes('cookie')) {
      categories['Cookies'].push(check);
    } else if (check.id.includes('tracker') || check.id.includes('analytics') || check.id.includes('social')) {
      categories['Trackers'].push(check);
    } else if (check.id.includes('consent')) {
      categories['Consent'].push(check);
    } else if (check.id.includes('https') || check.id.includes('ssl') || check.id.includes('hsts') || check.id.includes('mixed')) {
      categories['Security'].push(check);
    } else if (check.id.includes('policy')) {
      categories['Privacy Policy'].push(check);
    } else {
      categories['Other'].push(check);
    }
  });

  return categories;
}

// Create Check Element
function createCheckElement(check) {
  const checkDiv = document.createElement('div');
  checkDiv.className = `check-item check-${check.status}`;

  const icon = check.status === 'pass' ? '✓' :
               check.status === 'fail' ? '✗' : '⚠';

  let html = `
    <div class="check-header">
      <div class="check-icon">${icon}</div>
      <div class="check-title">${check.title}</div>
      <div class="check-priority priority-${check.priority}">${check.priority}</div>
    </div>
    <div class="check-description">${check.description}</div>
  `;

  if (check.details && check.details.length > 0) {
    html += '<div class="check-details">';
    if (Array.isArray(check.details)) {
      check.details.forEach(detail => {
        html += `<div>• ${detail}</div>`;
      });
    } else {
      html += check.details;
    }
    html += '</div>';
  }

  if (check.fix) {
    html += `<div class="check-fix">${check.fix}</div>`;
  }

  checkDiv.innerHTML = html;
  return checkDiv;
}

// Export Report
function exportReport() {
  if (!currentResults) return;

  const html = generateHTMLReport(currentResults);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `privacy-report-${new Date().toISOString().split('T')[0]}.html`;
  a.click();

  URL.revokeObjectURL(url);
}

// Generate HTML Report
function generateHTMLReport(results) {
  const { score, checks, url, type, timestamp } = results;

  const passed = checks.filter(c => c.status === 'pass');
  const failed = checks.filter(c => c.status === 'fail');
  const warnings = checks.filter(c => c.status === 'warn');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Check Report</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1000px; margin: 40px auto; padding: 20px; background: #f5f5f5; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 8px; margin-bottom: 30px; }
    h1 { margin: 0 0 10px 0; }
    .score { text-align: center; margin: 30px 0; }
    .score-circle { width: 150px; height: 150px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 3em; font-weight: bold; margin: 20px; }
    .score-good { background: #4caf50; color: white; }
    .score-medium { background: #ff9800; color: white; }
    .score-bad { background: #f44336; color: white; }
    .summary { display: flex; justify-content: center; gap: 40px; margin: 20px 0; }
    .check { background: white; border-left: 4px solid #ddd; padding: 20px; margin: 15px 0; border-radius: 4px; }
    .check-pass { border-left-color: #4caf50; }
    .check-fail { border-left-color: #f44336; }
    .check-warn { border-left-color: #ff9800; }
    .category { margin: 40px 0; }
    .category h2 { border-bottom: 2px solid #667eea; padding-bottom: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔒 Privacy Check Report</h1>
    <p>${type === 'website' ? `URL: ${url}` : 'Privacy Policy Analysis'}</p>
    <p>Generated: ${new Date(timestamp).toLocaleString()}</p>
  </div>

  <div class="score">
    <div class="score-circle ${score >= 80 ? 'score-good' : score >= 60 ? 'score-medium' : 'score-bad'}">
      ${score}
    </div>
    <div class="summary">
      <div><h3 style="color: #4caf50">${passed.length}</h3><p>Passed</p></div>
      <div><h3 style="color: #f44336">${failed.length}</h3><p>Failed</p></div>
      <div><h3 style="color: #ff9800">${warnings.length}</h3><p>Warnings</p></div>
    </div>
  </div>

  ${Object.entries(groupChecksByCategory(checks)).map(([cat, catChecks]) => {
    if (catChecks.length === 0) return '';
    return `
      <div class="category">
        <h2>${cat}</h2>
        ${catChecks.map(check => `
          <div class="check check-${check.status}">
            <h3>${check.status === 'pass' ? '✓' : check.status === 'fail' ? '✗' : '⚠'} ${check.title}</h3>
            <p>${check.description}</p>
            ${check.fix ? `<p style="background: #e3f2fd; padding: 10px; border-radius: 4px; margin-top: 10px;">💡 ${check.fix}</p>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }).join('')}

  <footer style="text-align: center; margin-top: 60px; color: #666; border-top: 1px solid #ddd; padding-top: 20px;">
    <p>Generated by Privacy Checker - For informational purposes only</p>
  </footer>
</body>
</html>`;
}

// Reset Scan
function resetScan() {
  resultsSection.style.display = 'none';
  currentResults = null;
  urlInput.value = '';
  policyText.value = '';
  fileName.textContent = '';
}

// Loading States
function showLoading(text = 'Loading...') {
  loading.style.display = 'block';
  resultsSection.style.display = 'none';
  document.getElementById('loadingText').textContent = text;

  // Disable buttons
  scanBtn.disabled = true;
  analyzePolicyBtn.disabled = true;
}

function hideLoading() {
  loading.style.display = 'none';

  // Enable buttons
  scanBtn.disabled = false;
  analyzePolicyBtn.disabled = false;
}
