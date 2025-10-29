// Privacy Checker Web App
let currentResults = null;

// DOM Elements
const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const analyzePolicyBtn = document.getElementById('analyzePolicyBtn');
const policyFile = document.getElementById('policyFile');
const policyText = document.getElementById('policyText');
const fileName = document.getElementById('fileName');
const loading = document.getElementById('loading');
const resultsSection = document.getElementById('results');
const exportBtn = document.getElementById('exportBtn');
const newScanBtn = document.getElementById('newScanBtn');
const privacyModal = document.getElementById('privacyModal');
const privacyPolicyLink = document.getElementById('privacyPolicyLink');
const closeModal = document.getElementById('closeModal');
const testOurPolicy = document.getElementById('testOurPolicy');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupEventListeners();
  setupModalListeners();
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
  analyzePolicyBtn.addEventListener('click', handlePolicyAnalysis);
  policyFile.addEventListener('change', handleFileUpload);
  exportBtn.addEventListener('click', exportReport);
  newScanBtn.addEventListener('click', resetScan);
}

// Modal Listeners
function setupModalListeners() {
  // Open modal
  privacyPolicyLink.addEventListener('click', (e) => {
    e.preventDefault();
    privacyModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  });

  // Close modal
  closeModal.addEventListener('click', () => {
    privacyModal.style.display = 'none';
    document.body.style.overflow = 'auto';
  });

  // Close modal on backdrop click
  privacyModal.addEventListener('click', (e) => {
    if (e.target === privacyModal) {
      privacyModal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });

  // Close modal on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && privacyModal.style.display === 'flex') {
      privacyModal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });

  // Test our policy button
  testOurPolicy.addEventListener('click', () => {
    // Extract policy text from modal
    const policyContent = document.querySelector('.privacy-policy-content');
    const policyTextContent = policyContent.innerText;

    // Close modal
    privacyModal.style.display = 'none';
    document.body.style.overflow = 'auto';

    // Switch to policy tab
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(tc => tc.classList.remove('active'));
    document.querySelector('[data-tab="policy"]').classList.add('active');
    document.getElementById('policy-tab').classList.add('active');

    // Fill in the textarea
    policyText.value = policyTextContent;

    // Scroll to textarea
    policyText.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Auto-analyze after a short delay
    setTimeout(() => {
      analyzePolicyBtn.click();
    }, 500);
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
    const financialRisk = analyzer.calculateFinancialRisk(checks);

    currentResults = {
      type: 'policy',
      timestamp: new Date().toISOString(),
      checks,
      score,
      financialRisk
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
  const { score, checks, financialRisk } = results;

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

  // Display Financial Risk Section
  if (financialRisk && financialRisk.violations.length > 0) {
    displayFinancialRisk(financialRisk);
  } else {
    document.getElementById('financialRiskSection').style.display = 'none';
  }

  // Display GDPR Comparison Section
  displayGDPRComparison(checks);

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

// Display Financial Risk Section
function displayFinancialRisk(financialRisk) {
  const section = document.getElementById('financialRiskSection');
  const { violations, minExposure, maxExposure, averageExposure } = financialRisk;

  let html = `
    <div class="risk-header">
      <h3>⚠️ YOUR ESTIMATED FINE EXPOSURE</h3>
      <p class="risk-subtitle">Based on violations found in your privacy policy and actual GDPR enforcement data</p>
    </div>
  `;

  if (violations.length > 0) {
    html += '<div class="risk-violations">';
    violations.forEach(violation => {
      html += `
        <div class="risk-item">
          <div class="risk-icon">❌</div>
          <div class="risk-details">
            <div class="risk-name">${violation.name}</div>
            <div class="risk-amount">€${violation.min}M - €${violation.max}M potential fine</div>
            <div class="risk-article">${violation.article}</div>
          </div>
        </div>
      `;
    });
    html += '</div>';

    html += `
      <div class="risk-total">
        <div class="risk-total-label">TOTAL POTENTIAL EXPOSURE:</div>
        <div class="risk-total-amount">€${minExposure}M - €${maxExposure}M</div>
        <div class="risk-average">Average estimated fine: €${averageExposure}M</div>
      </div>
    `;

    html += `
      <div class="risk-context">
        <p><strong>Industry Context:</strong> The average GDPR fine is €2.36 million. Based on your compliance score and the violations identified, your organization faces significant regulatory risk if audited by a supervisory authority.</p>
        <p><strong>Note:</strong> Fine amounts are based on actual GDPR enforcement actions against major companies. Actual fines depend on factors including company revenue, violation severity, and cooperation with authorities.</p>
      </div>
    `;
  } else {
    html += `
      <div class="risk-none">
        <div class="risk-icon-good">✅</div>
        <div class="risk-none-text">
          <strong>Excellent!</strong> No major violations detected. Your privacy policy appears to meet GDPR requirements.
        </div>
      </div>
    `;
  }

  section.innerHTML = html;
  section.style.display = 'block';
}

// Display GDPR Comparison Section
function displayGDPRComparison(checks) {
  const section = document.getElementById('gdprComparison');
  const container = document.getElementById('comparisonContainer');

  // Filter only checks that have GDPR article references
  const gdprChecks = checks.filter(check => check.gdprArticle);

  if (gdprChecks.length === 0) {
    section.style.display = 'none';
    return;
  }

  container.innerHTML = '';

  gdprChecks.forEach(check => {
    const row = document.createElement('div');
    row.className = `comparison-row status-${check.status}`;

    const statusIcon = check.status === 'pass' ? '✓' : check.status === 'fail' ? '✗' : '⚠';
    const statusText = check.status === 'pass' ? 'COMPLIANT' : check.status === 'fail' ? 'MISSING' : 'PARTIAL';

    row.innerHTML = `
      <div class="comparison-left">
        <div class="comparison-header">📜 GDPR Requirement</div>
        <div class="comparison-title">${check.title}</div>
        <div class="comparison-gdpr-article">
          <div class="gdpr-article-title">GDPR Citation:</div>
          <a href="${check.gdprArticle.link}" target="_blank" rel="noopener" class="gdpr-article-link">
            ${check.gdprArticle.article}
          </a>
          <div class="gdpr-article-explanation">${check.gdprArticle.explanation}</div>
        </div>
      </div>
      <div class="comparison-right">
        <div class="comparison-header">📄 Your Policy Status</div>
        <div class="comparison-policy-status status-${check.status}">
          <div class="comparison-status-icon">${statusIcon}</div>
          <div class="comparison-status-text">${statusText}</div>
          <div class="comparison-status-description">${check.description}</div>
          ${check.fix ? `<div class="comparison-fix">${check.fix}</div>` : ''}
        </div>
      </div>
    `;

    container.appendChild(row);
  });

  section.style.display = 'block';
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

  // Add GDPR Article Reference
  if (check.gdprArticle) {
    html += `
      <div class="gdpr-reference">
        <div class="gdpr-header">
          <span class="gdpr-label">📖 GDPR Reference:</span>
          <a href="${check.gdprArticle.link}" target="_blank" rel="noopener" class="gdpr-link">
            ${check.gdprArticle.article}
          </a>
        </div>
        <div class="gdpr-explanation">${check.gdprArticle.explanation}</div>
      </div>
    `;
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
  const { score, checks, url, type, timestamp, financialRisk } = results;

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
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --pink: #f4c2c2;
      --peach: #f5d5a8;
      --mint: #c8e6c9;
      --sky: #b3d4e0;
      --lavender: #d4c5f9;
      --cream: #fef9e7;
      --coral: #ff6b6b;
      --mustard: #f4a261;
      --sage: #a8dadc;
      --burgundy: #6d4c41;
      --navy: #1d3557;
    }
    body {
      font-family: 'Futura', 'Trebuchet MS', Arial, sans-serif;
      line-height: 1.6;
      color: var(--navy);
      background: var(--cream);
      padding: 20px;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      background: white;
      border-left: 8px solid var(--pink);
      border-right: 8px solid var(--sky);
    }
    .header {
      background: var(--peach);
      color: var(--navy);
      padding: 3rem 2rem;
      text-align: center;
      border-bottom: 4px solid var(--mustard);
    }
    .header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      letter-spacing: 4px;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
    }
    .header p {
      letter-spacing: 1px;
      margin: 0.5rem 0;
    }
    .content {
      padding: 3rem 2rem;
    }
    .score-section {
      text-align: center;
      margin: 2rem 0 3rem;
    }
    .score-box {
      width: 180px;
      height: 180px;
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      border: 4px solid var(--navy);
      margin: 1rem;
    }
    .score-box.score-good { background: var(--mint); color: var(--navy); }
    .score-box.score-medium { background: var(--peach); color: var(--navy); }
    .score-box.score-bad { background: var(--coral); color: white; }
    .score-value {
      font-size: 4rem;
      line-height: 1;
    }
    .score-label {
      font-size: 0.8rem;
      margin-top: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .summary {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin: 2rem 0;
      flex-wrap: wrap;
    }
    .summary-item {
      text-align: center;
      padding: 1.5rem;
      background: white;
      border: 3px solid var(--navy);
      min-width: 100px;
    }
    .summary-number {
      font-size: 2.5rem;
      font-weight: 700;
      line-height: 1;
    }
    .summary-pass .summary-number { color: var(--sage); }
    .summary-fail .summary-number { color: var(--coral); }
    .summary-warn .summary-number { color: var(--mustard); }
    .summary-label {
      color: var(--navy);
      margin-top: 0.5rem;
      text-transform: uppercase;
      font-size: 0.8rem;
      letter-spacing: 1px;
    }
    .category {
      margin: 3rem 0;
    }
    .category-title {
      font-size: 1.3rem;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: var(--navy);
      color: white;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-align: center;
    }
    .check {
      background: white;
      border: 3px solid var(--navy);
      padding: 1.5rem;
      margin-bottom: 1rem;
      page-break-inside: avoid;
    }
    .check.check-pass { border-left: 8px solid var(--mint); }
    .check.check-fail { border-left: 8px solid var(--coral); }
    .check.check-warn { border-left: 8px solid var(--mustard); }
    .check h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--navy);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 1rem;
    }
    .check p {
      color: var(--burgundy);
      margin-bottom: 0.5rem;
      line-height: 1.8;
    }
    .gdpr-reference {
      background: var(--lavender);
      padding: 1rem;
      margin: 1rem 0;
      border-left: 4px solid var(--navy);
    }
    .gdpr-reference strong {
      font-weight: 700;
      color: var(--navy);
      text-transform: uppercase;
      letter-spacing: 1px;
      font-size: 0.85rem;
    }
    .gdpr-reference a {
      color: var(--navy);
      text-decoration: none;
      border-bottom: 2px solid var(--coral);
      font-weight: 700;
      padding: 0.25rem 0.5rem;
      background: white;
      border: 2px solid var(--navy);
      text-transform: uppercase;
      letter-spacing: 1px;
      font-size: 0.85rem;
    }
    .gdpr-explanation {
      color: var(--burgundy);
      line-height: 1.8;
      font-size: 0.95rem;
      margin-top: 0.75rem;
      padding-left: 1.5rem;
      position: relative;
    }
    .gdpr-explanation::before {
      content: "→";
      position: absolute;
      left: 0;
      color: var(--coral);
      font-weight: 700;
    }
    .check-fix {
      background: var(--mint);
      padding: 1rem;
      border-left: 4px solid var(--sage);
      margin-top: 1rem;
      color: var(--navy);
    }
    .check-fix::before {
      content: "→ ";
      font-weight: 700;
    }
    .financial-risk-section {
      margin: 3rem 0;
      background: var(--coral);
      border: 4px solid var(--navy);
      padding: 2rem;
    }
    .risk-header {
      text-align: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 3px solid var(--navy);
    }
    .risk-header h3 {
      font-size: 1.5rem;
      color: white;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 0.5rem;
    }
    .risk-subtitle {
      color: var(--cream);
      font-size: 0.95rem;
      letter-spacing: 1px;
    }
    .risk-violations {
      background: white;
      border: 3px solid var(--navy);
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    .risk-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      margin-bottom: 1rem;
      background: var(--cream);
      border-left: 4px solid var(--coral);
    }
    .risk-icon {
      font-size: 1.5rem;
      line-height: 1;
    }
    .risk-details {
      flex: 1;
    }
    .risk-name {
      font-weight: 700;
      color: var(--navy);
      text-transform: uppercase;
      letter-spacing: 1px;
      font-size: 0.95rem;
      margin-bottom: 0.5rem;
    }
    .risk-amount {
      color: var(--coral);
      font-weight: 700;
      font-size: 1.1rem;
      margin-bottom: 0.25rem;
    }
    .risk-article {
      color: var(--burgundy);
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .risk-total {
      background: var(--navy);
      color: white;
      padding: 2rem;
      text-align: center;
      border: 4px solid var(--mustard);
      margin-bottom: 1.5rem;
    }
    .risk-total-label {
      font-size: 0.9rem;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 1rem;
    }
    .risk-total-amount {
      font-size: 2.5rem;
      font-weight: 700;
      letter-spacing: 1px;
      margin-bottom: 0.5rem;
    }
    .risk-average {
      font-size: 1rem;
      color: var(--peach);
      letter-spacing: 1px;
    }
    .risk-context {
      background: white;
      border: 3px solid var(--navy);
      padding: 1.5rem;
    }
    .risk-context p {
      color: var(--burgundy);
      line-height: 1.8;
      margin-bottom: 1rem;
    }
    .risk-context strong {
      color: var(--navy);
      text-transform: uppercase;
      letter-spacing: 1px;
      font-size: 0.9rem;
    }
    .risk-none {
      display: flex;
      gap: 1.5rem;
      align-items: center;
      background: var(--mint);
      border: 3px solid var(--navy);
      padding: 2rem;
    }
    .risk-icon-good {
      font-size: 3rem;
    }
    .risk-none-text {
      color: var(--navy);
      font-size: 1.1rem;
      line-height: 1.6;
    }
    .risk-none-text strong {
      display: block;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 0.5rem;
    }
    .footer {
      background: var(--navy);
      color: white;
      padding: 2rem;
      text-align: center;
      border-top: 8px solid var(--mustard);
    }
    .footer p {
      margin: 0.5rem 0;
      letter-spacing: 1px;
      font-size: 0.85rem;
    }
    @media print {
      body { background: white; }
      .container { border: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔒 Privacy Check Report</h1>
      <p>${type === 'website' ? `URL: ${url}` : 'Privacy Policy Analysis'}</p>
      <p>Generated: ${new Date(timestamp).toLocaleString()}</p>
    </div>

    <div class="content">
      <div class="score-section">
        <div class="score-box ${score >= 80 ? 'score-good' : score >= 60 ? 'score-medium' : 'score-bad'}">
          <div class="score-value">${score}</div>
          <div class="score-label">Privacy Score</div>
        </div>

        <div class="summary">
          <div class="summary-item summary-pass">
            <div class="summary-number">${passed.length}</div>
            <div class="summary-label">Passed</div>
          </div>
          <div class="summary-item summary-fail">
            <div class="summary-number">${failed.length}</div>
            <div class="summary-label">Failed</div>
          </div>
          <div class="summary-item summary-warn">
            <div class="summary-number">${warnings.length}</div>
            <div class="summary-label">Warnings</div>
          </div>
        </div>
      </div>

      ${financialRisk && financialRisk.violations.length > 0 ? `
        <div class="financial-risk-section">
          <div class="risk-header">
            <h3>⚠️ YOUR ESTIMATED FINE EXPOSURE</h3>
            <p class="risk-subtitle">Based on violations found in your privacy policy and actual GDPR enforcement data</p>
          </div>

          <div class="risk-violations">
            ${financialRisk.violations.map(violation => `
              <div class="risk-item">
                <div class="risk-icon">❌</div>
                <div class="risk-details">
                  <div class="risk-name">${violation.name}</div>
                  <div class="risk-amount">€${violation.min}M - €${violation.max}M potential fine</div>
                  <div class="risk-article">${violation.article}</div>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="risk-total">
            <div class="risk-total-label">TOTAL POTENTIAL EXPOSURE:</div>
            <div class="risk-total-amount">€${financialRisk.minExposure}M - €${financialRisk.maxExposure}M</div>
            <div class="risk-average">Average estimated fine: €${financialRisk.averageExposure}M</div>
          </div>

          <div class="risk-context">
            <p><strong>Industry Context:</strong> The average GDPR fine is €2.36 million. Based on your compliance score and the violations identified, your organization faces significant regulatory risk if audited by a supervisory authority.</p>
            <p><strong>Note:</strong> Fine amounts are based on actual GDPR enforcement actions against major companies. Actual fines depend on factors including company revenue, violation severity, and cooperation with authorities.</p>
          </div>
        </div>
      ` : financialRisk && financialRisk.violations.length === 0 ? `
        <div class="financial-risk-section">
          <div class="risk-header">
            <h3>✅ EXCELLENT COMPLIANCE</h3>
            <p class="risk-subtitle">Your privacy policy appears to meet GDPR requirements</p>
          </div>
          <div class="risk-none">
            <div class="risk-icon-good">✅</div>
            <div class="risk-none-text">
              <strong>No major violations detected!</strong>
              Your privacy policy appears to meet GDPR requirements. Continue to monitor and update your policy as your data practices evolve.
            </div>
          </div>
        </div>
      ` : ''}

      ${Object.entries(groupChecksByCategory(checks)).map(([cat, catChecks]) => {
        if (catChecks.length === 0) return '';
        return `
          <div class="category">
            <h2 class="category-title">${cat}</h2>
            ${catChecks.map(check => `
              <div class="check check-${check.status}">
                <h3>${check.status === 'pass' ? '✓' : check.status === 'fail' ? '✗' : '⚠'} ${check.title}</h3>
                <p>${check.description}</p>
                ${check.gdprArticle ? `
                  <div class="gdpr-reference">
                    <strong>📖 GDPR Reference: <a href="${check.gdprArticle.link}" target="_blank">${check.gdprArticle.article}</a></strong>
                    <div class="gdpr-explanation">${check.gdprArticle.explanation}</div>
                  </div>
                ` : ''}
                ${check.fix ? `<div class="check-fix">${check.fix}</div>` : ''}
              </div>
            `).join('')}
          </div>
        `;
      }).join('')}
    </div>

    <div class="footer">
      <p>Privacy Checker - Open Source GDPR Compliance Tool</p>
      <p>For informational purposes only. Not legal advice. Consult legal counsel for compliance questions.</p>
    </div>
  </div>
</body>
</html>`;
}

// Reset Scan
function resetScan() {
  resultsSection.style.display = 'none';
  currentResults = null;
  policyText.value = '';
  fileName.textContent = '';
}

// Loading States
function showLoading(text = 'Loading...') {
  loading.style.display = 'block';
  resultsSection.style.display = 'none';
  document.getElementById('loadingText').textContent = text;

  // Disable buttons
  analyzePolicyBtn.disabled = true;
}

function hideLoading() {
  loading.style.display = 'none';

  // Enable buttons
  analyzePolicyBtn.disabled = false;
}
