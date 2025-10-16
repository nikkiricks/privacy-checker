// Browser-compatible Privacy Policy Analyzer
class PolicyAnalyzer {
  constructor() {
    this.requiredElements = [
      {
        id: 'data-controller',
        keywords: ['data controller', 'controller', 'company name', 'organization'],
        title: 'Data Controller Identity',
        description: 'Identity and contact details of data controller'
      },
      {
        id: 'dpo-contact',
        keywords: ['data protection officer', 'dpo', 'privacy officer'],
        title: 'Data Protection Officer',
        description: 'Contact details of DPO (if applicable)'
      },
      {
        id: 'processing-purpose',
        keywords: ['purpose', 'why we collect', 'use of data', 'processing'],
        title: 'Processing Purpose',
        description: 'Purposes of data processing'
      },
      {
        id: 'legal-basis',
        keywords: ['legal basis', 'lawful basis', 'legitimate interest', 'consent'],
        title: 'Legal Basis',
        description: 'Legal basis for processing'
      },
      {
        id: 'data-types',
        keywords: ['personal data', 'information collected', 'data we collect', 'categories of data'],
        title: 'Data Types Collected',
        description: 'Types of personal data collected'
      },
      {
        id: 'data-recipients',
        keywords: ['third part', 'share', 'disclose', 'recipient'],
        title: 'Data Recipients',
        description: 'Recipients or categories of recipients'
      },
      {
        id: 'data-transfers',
        keywords: ['international transfer', 'third country', 'outside eu', 'cross-border'],
        title: 'International Transfers',
        description: 'Information about international data transfers'
      },
      {
        id: 'retention-period',
        keywords: ['retention', 'how long', 'storage period', 'keep your data'],
        title: 'Retention Period',
        description: 'Data retention periods'
      },
      {
        id: 'user-rights',
        keywords: ['your rights', 'right to access', 'right to erasure', 'right to object', 'data subject rights'],
        title: 'User Rights',
        description: 'Information about data subject rights'
      },
      {
        id: 'right-to-complain',
        keywords: ['supervisory authority', 'complaint', 'regulator', 'data protection authority'],
        title: 'Right to Complain',
        description: 'Right to lodge complaint with supervisory authority'
      },
      {
        id: 'automated-decisions',
        keywords: ['automated decision', 'profiling', 'algorithmic'],
        title: 'Automated Decision-Making',
        description: 'Information about automated decision-making and profiling'
      },
      {
        id: 'data-source',
        keywords: ['source', 'where we obtained', 'collected from'],
        title: 'Data Source',
        description: 'Source of personal data (if not collected from user)'
      }
    ];
  }

  analyze(policyText) {
    const checks = [];
    const lowerText = policyText.toLowerCase();

    // Check for each required element
    this.requiredElements.forEach(element => {
      const found = element.keywords.some(keyword =>
        lowerText.includes(keyword.toLowerCase())
      );

      checks.push({
        id: `policy-${element.id}`,
        title: element.title,
        status: found ? 'pass' : 'fail',
        priority: ['data-controller', 'processing-purpose', 'user-rights'].includes(element.id)
          ? 'high'
          : 'medium',
        description: found
          ? `✓ ${element.description} mentioned`
          : `✗ ${element.description} not found`,
        fix: found
          ? null
          : `Add clear information about ${element.description.toLowerCase()} to your privacy policy.`
      });
    });

    // Check policy length
    const wordCount = policyText.split(/\s+/).length;
    checks.push({
      id: 'policy-length',
      title: 'Policy Completeness',
      status: wordCount > 500 ? 'pass' : wordCount > 200 ? 'warn' : 'fail',
      priority: 'medium',
      description: `Privacy policy is ${wordCount} words`,
      fix: wordCount < 500
        ? 'Privacy policy seems short. Ensure all GDPR requirements are thoroughly addressed.'
        : null
    });

    // Check for cookie policy
    const hasCookieInfo = lowerText.includes('cookie') || lowerText.includes('cookies');
    checks.push({
      id: 'cookie-policy',
      title: 'Cookie Policy',
      status: hasCookieInfo ? 'pass' : 'warn',
      priority: 'high',
      description: hasCookieInfo
        ? 'Cookie information found'
        : 'No cookie information found',
      fix: hasCookieInfo
        ? null
        : 'Include detailed information about cookie usage, types of cookies, and user choices.'
    });

    // Check for update date
    const hasDate = /\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4}|january|february|march|april|may|june|july|august|september|october|november|december/i.test(policyText);
    checks.push({
      id: 'policy-date',
      title: 'Last Updated Date',
      status: hasDate ? 'pass' : 'fail',
      priority: 'medium',
      description: hasDate
        ? 'Policy includes date information'
        : 'No date found in policy',
      fix: 'Include "Last Updated" date in your privacy policy and keep it current.'
    });

    // Check for contact information
    const hasContact = /email|contact|phone|address|@/i.test(policyText);
    checks.push({
      id: 'contact-info',
      title: 'Contact Information',
      status: hasContact ? 'pass' : 'fail',
      priority: 'high',
      description: hasContact
        ? 'Contact information found'
        : 'No contact information found',
      fix: 'Provide clear contact information for privacy-related inquiries.'
    });

    // Check for child privacy
    const hasChildPrivacy = lowerText.includes('child') || lowerText.includes('under 16') ||
                           lowerText.includes('under 13') || lowerText.includes('minor');
    checks.push({
      id: 'child-privacy',
      title: 'Child Privacy Protection',
      status: hasChildPrivacy ? 'pass' : 'warn',
      priority: 'medium',
      description: hasChildPrivacy
        ? 'Child privacy provisions found'
        : 'No child privacy provisions found',
      fix: 'If your service may be used by children, include specific provisions for child privacy protection.'
    });

    return checks;
  }

  calculateScore(checks) {
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
}
