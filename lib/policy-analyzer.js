// Browser-compatible Privacy Policy Analyzer
class PolicyAnalyzer {
  constructor() {
    this.requiredElements = [
      {
        id: 'data-controller',
        keywords: ['data controller', 'controller', 'company name', 'organization'],
        title: 'Data Controller Identity',
        description: 'Identity and contact details of data controller',
        gdprArticle: {
          article: 'Art. 13.1.a',
          link: 'https://gdpr.eu/article-13-personal-data-collected/',
          fullRef: 'Article 13(1)(a) GDPR',
          explanation: 'Requires the identity and contact details of the controller to be provided to the data subject at the time of data collection.'
        }
      },
      {
        id: 'dpo-contact',
        keywords: ['data protection officer', 'dpo', 'privacy officer'],
        title: 'Data Protection Officer',
        description: 'Contact details of DPO (if applicable)',
        gdprArticle: {
          article: 'Art. 13.1.b',
          link: 'https://gdpr.eu/article-13-personal-data-collected/',
          fullRef: 'Article 13(1)(b) GDPR',
          explanation: 'Where applicable, the contact details of the data protection officer must be provided.'
        }
      },
      {
        id: 'processing-purpose',
        keywords: ['purpose', 'why we collect', 'use of data', 'processing'],
        title: 'Processing Purpose',
        description: 'Purposes of data processing',
        gdprArticle: {
          article: 'Art. 13.1.c',
          link: 'https://gdpr.eu/article-13-personal-data-collected/',
          fullRef: 'Article 13(1)(c) GDPR',
          explanation: 'The purposes of the processing for which personal data are intended must be clearly stated.'
        }
      },
      {
        id: 'legal-basis',
        keywords: ['legal basis', 'lawful basis', 'legitimate interest', 'consent'],
        title: 'Legal Basis',
        description: 'Legal basis for processing',
        gdprArticle: {
          article: 'Art. 13.1.c',
          link: 'https://gdpr.eu/article-13-personal-data-collected/',
          fullRef: 'Article 13(1)(c) & Art. 6 GDPR',
          explanation: 'The legal basis for processing must be specified (e.g., consent, contract, legitimate interests, legal obligation).'
        }
      },
      {
        id: 'data-types',
        keywords: ['personal data', 'information collected', 'data we collect', 'categories of data'],
        title: 'Data Types Collected',
        description: 'Types of personal data collected',
        gdprArticle: {
          article: 'Art. 13.1',
          link: 'https://gdpr.eu/article-13-personal-data-collected/',
          fullRef: 'Article 13(1) GDPR',
          explanation: 'The controller must inform data subjects about the categories of personal data being processed.'
        }
      },
      {
        id: 'data-recipients',
        keywords: ['third part', 'share', 'disclose', 'recipient'],
        title: 'Data Recipients',
        description: 'Recipients or categories of recipients',
        gdprArticle: {
          article: 'Art. 13.1.e',
          link: 'https://gdpr.eu/article-13-personal-data-collected/',
          fullRef: 'Article 13(1)(e) GDPR',
          explanation: 'The recipients or categories of recipients of personal data must be disclosed, if any.'
        }
      },
      {
        id: 'data-transfers',
        keywords: ['international transfer', 'third country', 'outside eu', 'cross-border'],
        title: 'International Transfers',
        description: 'Information about international data transfers',
        gdprArticle: {
          article: 'Art. 13.1.f',
          link: 'https://gdpr.eu/article-13-personal-data-collected/',
          fullRef: 'Article 13(1)(f) & Art. 44-50 GDPR',
          explanation: 'Where applicable, information about transfers of personal data to third countries or international organisations must be provided, including appropriate safeguards.'
        }
      },
      {
        id: 'retention-period',
        keywords: ['retention', 'how long', 'storage period', 'keep your data'],
        title: 'Retention Period',
        description: 'Data retention periods',
        gdprArticle: {
          article: 'Art. 13.2.a',
          link: 'https://gdpr.eu/article-13-personal-data-collected/',
          fullRef: 'Article 13(2)(a) GDPR',
          explanation: 'The controller must inform data subjects about the period for which personal data will be stored, or the criteria used to determine that period.'
        }
      },
      {
        id: 'user-rights',
        keywords: ['your rights', 'right to access', 'right to erasure', 'right to object', 'data subject rights'],
        title: 'User Rights',
        description: 'Information about data subject rights',
        gdprArticle: {
          article: 'Art. 13.2.b',
          link: 'https://gdpr.eu/article-13-personal-data-collected/',
          fullRef: 'Article 13(2)(b) & Art. 15-22 GDPR',
          explanation: 'Data subjects must be informed of their rights including: access (Art. 15), rectification (Art. 16), erasure (Art. 17), restriction of processing (Art. 18), data portability (Art. 20), and objection (Art. 21).'
        }
      },
      {
        id: 'right-to-complain',
        keywords: ['supervisory authority', 'complaint', 'regulator', 'data protection authority'],
        title: 'Right to Complain',
        description: 'Right to lodge complaint with supervisory authority',
        gdprArticle: {
          article: 'Art. 13.2.d',
          link: 'https://gdpr.eu/article-13-personal-data-collected/',
          fullRef: 'Article 13(2)(d) & Art. 77 GDPR',
          explanation: 'Data subjects have the right to lodge a complaint with a supervisory authority, and this right must be communicated clearly.'
        }
      },
      {
        id: 'automated-decisions',
        keywords: ['automated decision', 'profiling', 'algorithmic'],
        title: 'Automated Decision-Making',
        description: 'Information about automated decision-making and profiling',
        gdprArticle: {
          article: 'Art. 13.2.f',
          link: 'https://gdpr.eu/article-13-personal-data-collected/',
          fullRef: 'Article 13(2)(f) & Art. 22 GDPR',
          explanation: 'Where automated decision-making, including profiling, exists, meaningful information about the logic involved and the significance and envisaged consequences must be provided.'
        }
      },
      {
        id: 'data-source',
        keywords: ['source', 'where we obtained', 'collected from'],
        title: 'Data Source',
        description: 'Source of personal data (if not collected from user)',
        gdprArticle: {
          article: 'Art. 14.2.f',
          link: 'https://gdpr.eu/article-14-identifying-data-not-obtained-from-data-subject/',
          fullRef: 'Article 14(2)(f) GDPR',
          explanation: 'Where personal data have not been obtained from the data subject, the source of the personal data must be provided, and if applicable, whether it came from publicly accessible sources.'
        }
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
          : `Add clear information about ${element.description.toLowerCase()} to your privacy policy.`,
        gdprArticle: element.gdprArticle
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
        : null,
      gdprArticle: {
        article: 'Art. 12.1',
        link: 'https://gdpr.eu/article-12-transparent-information-communication-and-modalities/',
        fullRef: 'Article 12(1) GDPR',
        explanation: 'Information must be provided in a concise, transparent, intelligible and easily accessible form, using clear and plain language.'
      }
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
        : 'Include detailed information about cookie usage, types of cookies, and user choices.',
      gdprArticle: {
        article: 'Art. 4.11 & ePrivacy',
        link: 'https://gdpr.eu/article-4-definitions/',
        fullRef: 'Article 4(11) GDPR & ePrivacy Directive',
        explanation: 'Consent for cookies requires clear information about their purpose. The ePrivacy Directive requires prior consent for non-essential cookies.'
      }
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
      fix: 'Include "Last Updated" date in your privacy policy and keep it current.',
      gdprArticle: {
        article: 'Art. 12.1',
        link: 'https://gdpr.eu/article-12-transparent-information-communication-and-modalities/',
        fullRef: 'Article 12(1) GDPR',
        explanation: 'Transparency requires that data subjects can understand when the privacy information was last updated to assess its currency.'
      }
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
      fix: 'Provide clear contact information for privacy-related inquiries.',
      gdprArticle: {
        article: 'Art. 13.1.a',
        link: 'https://gdpr.eu/article-13-personal-data-collected/',
        fullRef: 'Article 13(1)(a) GDPR',
        explanation: 'The identity and contact details of the controller must be provided to enable data subjects to exercise their rights.'
      }
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
      fix: 'If your service may be used by children, include specific provisions for child privacy protection.',
      gdprArticle: {
        article: 'Art. 8',
        link: 'https://gdpr.eu/article-8-conditions-applicable-to-childs-consent/',
        fullRef: 'Article 8 GDPR',
        explanation: 'Special protections apply where processing is based on consent of children. For children under 16 (or lower age set by Member State), parental consent is required for information society services.'
      }
    });

    return checks;
  }

  calculateScore(checks) {
    if (checks.length === 0) return 0;

    // Financial risk-based scoring using actual GDPR fine amounts
    const riskWeights = {
      'policy-legal-basis': 10,          // €1.2B fine risk (Meta)
      'policy-data-transfers': 10,       // €1.2B fine risk (Meta international transfers)
      'policy-data-recipients': 8,       // €746M fine risk (Amazon third-party sharing)
      'policy-automated-decisions': 7,   // €345M fine risk (H&M profiling)
      'policy-user-rights': 7,           // €225M fine risk (WhatsApp transparency)
      'policy-cookie-policy': 5,         // €90M fine risk (Google cookies)
      'policy-retention-period': 4,      // €79M fine risk (data retention issues)
      'policy-data-controller': 3,       // €30M fine risk (identification failures)
      'policy-dpo-contact': 2,           // €20M fine risk (DPO issues)
      'policy-processing-purpose': 6,    // €60M fine risk (purpose limitation)
      'policy-data-types': 4,            // €40M fine risk (transparency)
      'policy-right-to-complain': 3,     // €30M fine risk
      'policy-data-source': 2,           // €20M fine risk
      'policy-length': 2,                // Transparency requirement
      'policy-date': 1,                  // Transparency requirement
      'policy-contact-info': 3,          // €30M fine risk
      'policy-child-privacy': 5          // €50M fine risk (child consent)
    };

    let totalRisk = 0;
    let mitigatedRisk = 0;

    checks.forEach(check => {
      const weight = riskWeights[check.id] || 1;
      totalRisk += weight;

      if (check.status === 'pass') {
        mitigatedRisk += weight;
      } else if (check.status === 'warn') {
        mitigatedRisk += weight * 0.5;
      }
    });

    return Math.round((mitigatedRisk / totalRisk) * 100);
  }

  calculateFinancialRisk(checks) {
    // Calculate estimated fine exposure based on violations
    const fineRanges = {
      'policy-legal-basis': { min: 310, max: 1200, name: 'Missing legal basis for processing' },
      'policy-data-transfers': { min: 290, max: 1200, name: 'International data transfer violations' },
      'policy-data-recipients': { min: 225, max: 746, name: 'Unclear third-party sharing' },
      'policy-automated-decisions': { min: 200, max: 345, name: 'Automated decision-making disclosure' },
      'policy-user-rights': { min: 150, max: 225, name: 'User rights not clearly stated' },
      'policy-cookie-policy': { min: 50, max: 90, name: 'Cookie consent violations' },
      'policy-retention-period': { min: 30, max: 79, name: 'Data retention period missing' },
      'policy-processing-purpose': { min: 30, max: 60, name: 'Purpose of processing unclear' },
      'policy-child-privacy': { min: 20, max: 50, name: 'Child privacy protections missing' },
      'policy-data-controller': { min: 10, max: 30, name: 'Data controller identification' },
      'policy-contact-info': { min: 10, max: 30, name: 'Contact information missing' },
      'policy-right-to-complain': { min: 10, max: 30, name: 'Right to lodge complaint missing' },
      'policy-dpo-contact': { min: 5, max: 20, name: 'DPO contact details missing' },
      'policy-data-types': { min: 10, max: 40, name: 'Data categories not specified' },
      'policy-data-source': { min: 5, max: 20, name: 'Data source not disclosed' }
    };

    let violations = [];
    let minExposure = 0;
    let maxExposure = 0;

    checks.forEach(check => {
      if (check.status === 'fail' && fineRanges[check.id]) {
        const fine = fineRanges[check.id];
        violations.push({
          name: fine.name,
          min: fine.min,
          max: fine.max,
          article: check.gdprArticle?.article || 'GDPR'
        });
        minExposure += fine.min;
        maxExposure += fine.max;
      } else if (check.status === 'warn' && fineRanges[check.id]) {
        const fine = fineRanges[check.id];
        violations.push({
          name: fine.name,
          min: Math.round(fine.min * 0.3),
          max: Math.round(fine.max * 0.3),
          article: check.gdprArticle?.article || 'GDPR'
        });
        minExposure += Math.round(fine.min * 0.3);
        maxExposure += Math.round(fine.max * 0.3);
      }
    });

    return {
      violations,
      minExposure,
      maxExposure,
      averageExposure: Math.round((minExposure + maxExposure) / 2)
    };
  }
}
