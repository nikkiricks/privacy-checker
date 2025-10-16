# Privacy Checker

A simple, web-based privacy policy analyzer that runs entirely in your browser. Analyze privacy policies for GDPR compliance and get detailed, actionable recommendations - all client-side with no data sent to servers.

## Project Status

**Current Status:** Ready for initial deployment

**Last Updated:** October 16, 2024

### Next Two Weeks Roadmap (Oct 16 - Oct 30, 2024)

#### Week 1 (Oct 16 - Oct 23)
- [ ] Initial GitHub repository setup and push
- [ ] Deploy to Netlify/Surge for live testing
- [ ] User testing with sample privacy policies
- [ ] Bug fixes and UI refinements based on feedback
- [ ] Documentation improvements

#### Week 2 (Oct 24 - Oct 30)
- [ ] Performance optimization for large policy documents
- [ ] Enhanced error handling and user feedback
- [ ] Mobile responsive design improvements
- [ ] Add more comprehensive test cases
- [ ] Prepare for public launch

### Recent Changes
- Git repository initialized
- Project structure finalized
- Core GDPR compliance analyzer implemented
- Export to HTML functionality added

## Features

- **Privacy Policy Analyzer** - Upload or paste policy text for comprehensive GDPR compliance checks
- **Client-Side Processing** - All analysis happens in your browser, no data sent to servers
- **Interactive Reports** - Beautiful, detailed results with actionable recommendations
- **Export Reports** - Download HTML reports for sharing with stakeholders
- **Zero Backend** - Pure static web app, deploy anywhere
- **Privacy-First** - No cookies, no tracking, no data collection

## Quick Start

### Run Locally

#### Option 1: Open Directly
```bash
cd privacy_checker
open index.html
```

#### Option 2: Use a Local Server (Recommended)
```bash
# Python
python3 -m http.server 8000
# Visit http://localhost:8000

# Node.js
npx http-server -p 8000

# PHP
php -S localhost:8000
```

### Deploy to Production

#### Surge (60 seconds)
```bash
npx surge
# Follow prompts - your site is live!
```

#### Netlify Drop (No CLI)
1. Visit [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the entire `privacy_checker/` folder
3. Your site is live!

#### Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

#### GitHub Pages
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/privacy-checker.git
git push -u origin main
# Enable GitHub Pages in repository settings
```

## How to Use

### Analyze a Privacy Policy

1. Open the web app (locally or deployed)
2. Click the "Privacy Policy" tab
3. Upload a `.txt` or `.md` file, or paste your privacy policy text
4. Click "Analyze Policy"
5. Review the GDPR compliance results with detailed scoring
6. Export as HTML to share with your team

### Understanding Your Results

**Privacy Scores**
- **90-100** - Excellent privacy practices, GDPR compliant
- **75-89** - Good, minor improvements recommended
- **60-74** - Fair, several issues need attention
- **Below 60** - Poor, major privacy concerns to address

**Priority Levels**

**High Priority** (Fix immediately)
- Missing required GDPR disclosures
- No data controller information
- Undefined data retention periods
- Missing user rights information

**Medium Priority** (Address soon)
- Incomplete contact details
- Missing DPO information
- Vague processing purposes

**Low Priority** (Nice to have)
- More detailed data categorization
- Additional clarity on legal basis
- Enhanced transparency measures

## What Gets Checked

### GDPR Requirements (15+ Checks)

- Data controller identity and contact information
- Data Protection Officer details
- Processing purposes and legal basis
- Types of personal data collected
- Data recipients and third-party sharing
- International data transfers
- Data retention periods
- User rights (access, erasure, rectification, portability)
- Right to complain to supervisory authority
- Automated decision-making disclosure
- Data source information
- Cookie policy
- Last updated date
- Child privacy protection
- Contact information for privacy inquiries

## Project Structure

```
privacy_checker/
├── README.md              # Documentation
├── index.html             # Main web application
├── app.js                 # Application logic
├── styles.css             # Styling
├── lib/
│   └── policy-analyzer.js # Privacy policy GDPR analyzer
├── package.json           # Project metadata
├── netlify.toml          # Netlify deployment config
└── .gitignore            # Git ignore patterns
```

## Browser Support

- Firefox 88+
- Chrome 90+
- Safari 14+
- Edge 90+

## Development

### Local Development

```bash
# Start a local server
python3 -m http.server 8000
# Visit http://localhost:8000
```

### Making Changes

1. Edit files directly in the repository
2. Refresh browser to see changes
3. Redeploy when ready

### Testing

Test the privacy policy analyzer with a sample policy:
1. Create a text file with privacy policy content
2. Upload it through the web app
3. Verify all GDPR checks run correctly

## Deployment Options

### Custom Domain

#### Surge
```bash
surge --domain yourdomain.com
```
Add CNAME record: `na-west1.surge.sh`

#### Netlify
1. Go to Site settings → Domain management
2. Add custom domain
3. Follow DNS configuration instructions

### Analytics (Optional)

Add privacy-friendly analytics to `index.html`:
```html
<!-- Before </body> tag -->
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

## Security & Privacy

- All processing happens client-side in your browser
- No data is sent to external servers
- No cookies or tracking
- No analytics or telemetry
- Fully open source and auditable

## Troubleshooting

### Site not loading after deployment
- Verify `index.html` is in the root directory
- Check all file paths are relative
- Clear browser cache and try again

### Styles not loading
- Ensure `styles.css` is in the same directory as `index.html`
- Check browser console for errors
- Verify file paths in HTML

### Policy analysis not working
- Check browser console for JavaScript errors
- Verify the text is pasted or file is uploaded correctly
- Try a different browser

## Limitations

This is a client-side web app, which means:
- **Privacy policy analysis works perfectly** with no limitations
- Cannot scan external websites due to browser security (CORS)
- All processing happens in your browser - no backend required

## Future Enhancements

- Multi-language support
- Historical scan tracking
- PDF report export
- Batch policy analysis
- Custom check templates
- Additional compliance frameworks (CCPA, etc.)

## Contributing

This is an open-source project focused on improving web privacy. Contributions welcome!

1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Resources

- [GDPR Official Text](https://gdpr-info.eu/)
- [ICO Guidance](https://ico.org.uk/for-organisations/guide-to-data-protection/)
- [Surge Documentation](https://surge.sh/help/)
- [Netlify Documentation](https://docs.netlify.com/)

## License

MIT License - See LICENSE file for details

## Legal Disclaimer

This tool is for informational purposes only and does not constitute legal advice. For compliance questions, consult with a qualified legal professional specializing in data protection law.

---

**Ready to deploy!** A simple, privacy-first policy analyzer that runs entirely in your browser.
