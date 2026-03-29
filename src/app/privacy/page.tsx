import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy · Bizno",
  description: "Privacy policy for Bizno - UK GDPR compliant data protection policy for Digital Readiness OS",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-void py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-100 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-slate-400 mb-6">Last updated: March 29, 2026</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">1. Introduction</h2>
            <p className="text-slate-400 mb-4">
              Bizno (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) respects your privacy and is committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and safeguard your information when you use our digital readiness platform 
              in compliance with the UK General Data Protection Regulation (UK GDPR), Data Protection Act 2018, and other applicable laws.
            </p>
            <p className="text-slate-400 mb-4">
              <strong>Data Controller:</strong> Bizno (Joto Ltd)<br />
              <strong>Registered Address:</strong> United Kingdom<br />
              <strong>Contact:</strong> privacy@bizno.co.uk
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">2. Legal Basis for Processing</h2>
            <p className="text-slate-400 mb-4">We process your personal data under the following legal bases:</p>
            <ul className="list-disc list-inside text-slate-400 mb-4 space-y-2">
              <li><strong>Contract:</strong> Processing necessary to provide our services to you</li>
              <li><strong>Consent:</strong> Where you have given explicit consent (e.g., marketing emails)</li>
              <li><strong>Legitimate Interests:</strong> For security, fraud prevention, and service improvement</li>
              <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">3. Information We Collect</h2>
            
            <h3 className="text-xl font-medium text-slate-300 mb-3">3.1 Personal Information</h3>
            <ul className="list-disc list-inside text-slate-400 mb-4 space-y-2">
              <li>Email address (for account creation and communication)</li>
              <li>Business information you provide (business names, types)</li>
              <li>Team member email addresses (for invitations)</li>
              <li>Account activity and business progress data</li>
              <li>IP address and device identifiers</li>
              <li>Browser type and operating system</li>
            </ul>

            <h3 className="text-xl font-medium text-slate-300 mb-3">3.2 Usage Data</h3>
            <ul className="list-disc list-inside text-slate-400 mb-4 space-y-2">
              <li>Pages visited and features used</li>
              <li>Time spent on the platform</li>
              <li>Click patterns and navigation paths</li>
              <li>Device information (for mobile app users)</li>
              <li>Session duration and frequency of use</li>
            </ul>

            <h3 className="text-xl font-medium text-slate-300 mb-3">3.3 Cookies and Similar Technologies</h3>
            <p className="text-slate-400 mb-4">
              We use the following types of cookies:
            </p>
            <ul className="list-disc list-inside text-slate-400 mb-4 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for authentication, session management, and security. Cannot be disabled.</li>
              <li><strong>Analytics Cookies:</strong> We use Plausible Analytics (privacy-focused, no cookies, no personal data tracking)</li>
              <li><strong>Functionality Cookies:</strong> Remember your preferences and settings</li>
            </ul>
            <p className="text-slate-400 mb-4">
              You can manage cookie preferences through your browser settings. For more information, visit <a href="https://www.aboutcookies.org" className="text-electric hover:underline">aboutcookies.org</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">4. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-slate-400 mb-4 space-y-2">
              <li>Provide and maintain our digital readiness platform</li>
              <li>Create and manage your user account</li>
              <li>Send notifications about business deadlines, tasks, and updates</li>
              <li>Process team invitations and manage access permissions</li>
              <li>Send transactional emails (account creation, password resets, invitations)</li>
              <li>Send marketing communications (only with your consent)</li>
              <li>Analyze usage patterns to improve our services</li>
              <li>Detect and prevent fraud, security incidents, and abuse</li>
              <li>Comply with legal obligations and respond to legal requests</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">5. Data Retention</h2>
            <p className="text-slate-400 mb-4">
              We retain your personal data only for as long as necessary:
            </p>
            <ul className="list-disc list-inside text-slate-400 mb-4 space-y-2">
              <li><strong>Account Data:</strong> Retained while your account is active. Deleted within 30 days of account deletion.</li>
              <li><strong>Business Data:</strong> Retained while associated businesses exist. Deleted when business is deleted.</li>
              <li><strong>Communication Records:</strong> Retained for 12 months for customer service purposes.</li>
              <li><strong>Usage Logs:</strong> Retained for 90 days for security and debugging.</li>
              <li><strong>Analytics Data:</strong> Anonymized after 90 days.</li>
            </ul>
            <p className="text-slate-400 mb-4">
              In some cases, we may retain data longer if required by law or for legitimate business purposes (e.g., fraud prevention).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">6. Data Storage and Security</h2>
            <p className="text-slate-400 mb-4">
              We implement appropriate technical and organizational measures to protect your personal data:
            </p>
            <ul className="list-disc list-inside text-slate-400 mb-4 space-y-2">
              <li>Encryption in transit (TLS 1.3) and at rest (AES-256)</li>
              <li>Regular security audits and penetration testing</li>
              <li>Access controls and role-based permissions</li>
              <li>Regular staff training on data protection</li>
              <li>Incident response procedures</li>
            </ul>
            <p className="text-slate-400 mb-4">
              Despite our efforts, no security system is impenetrable. We will notify you and relevant authorities of any data breach 
              as required by applicable law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">7. International Data Transfers</h2>
            <p className="text-slate-400 mb-4">
              Your data is primarily stored in the United Kingdom (Supabase EU regions). Some of our service providers 
              may process data outside the UK/EU. When this occurs, we ensure appropriate safeguards are in place:
            </p>
            <ul className="list-disc list-inside text-slate-400 mb-4 space-y-2">
              <li>Standard Contractual Clauses (SCCs) approved by the ICO</li>
              <li>Adequacy decisions for countries with equivalent data protection</li>
              <li>Service providers certified under recognized privacy frameworks</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">8. Your Rights</h2>
            <p className="text-slate-400 mb-4">Under UK GDPR, you have the following rights:</p>
            <ul className="list-disc list-inside text-slate-400 mb-4 space-y-2">
              <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> Request deletion of your data</li>
              <li><strong>Right to Restriction:</strong> Limit how we process your data</li>
              <li><strong>Right to Object:</strong> Object to processing based on legitimate interests or direct marketing</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time (does not affect prior processing)</li>
              <li><strong>Right to Complain:</strong> Lodge a complaint with the Information Commissioner&apos;s Office (ICO)</li>
            </ul>
            <p className="text-slate-400 mb-4">
              To exercise these rights, email us at <a href="mailto:privacy@bizno.co.uk" className="text-electric hover:underline">privacy@bizno.co.uk</a>. 
              We will respond within 30 days. We may need to verify your identity before processing your request.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">9. Third-Party Services</h2>
            <p className="text-slate-400 mb-4">We use the following data processors:</p>
            <ul className="list-disc list-inside text-slate-400 mb-4 space-y-2">
              <li><strong>Supabase:</strong> Database hosting, authentication, and storage (EU-based)</li>
              <li><strong>Resend:</strong> Email delivery service (US-based, SCCs in place)</li>
              <li><strong>Plausible Analytics:</strong> Privacy-focused analytics (EU-based, no cookies)</li>
              <li><strong>Vercel:</strong> Web hosting and edge delivery (US-based, SCCs in place)</li>
              <li><strong>Stripe (if applicable):</strong> Payment processing (SCCs in place)</li>
            </ul>
            <p className="text-slate-400 mb-4">
              Each processor is vetted for GDPR compliance and only processes data necessary for their service provision.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">10. Children&apos;s Privacy</h2>
            <p className="text-slate-400 mb-4">
              Our services are not intended for children under 16 years of age. We do not knowingly collect personal data from children. 
              If you become aware that a child has provided us with personal data, please contact us immediately and we will delete 
              such information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">11. Data Breach Notification</h2>
            <p className="text-slate-400 mb-4">
              In the event of a personal data breach, we will:
            </p>
            <ul className="list-disc list-inside text-slate-400 mb-4 space-y-2">
              <li>Notify the ICO within 72 hours if required</li>
              <li>Notify affected users without undue delay if the breach poses a high risk to their rights</li>
              <li>Provide information about the nature of the breach and steps taken</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">12. Changes to This Policy</h2>
            <p className="text-slate-400 mb-4">
              We may update this privacy policy from time to time. We will notify you of any material changes by:
            </p>
            <ul className="list-disc list-inside text-slate-400 mb-4 space-y-2">
              <li>Posting the updated policy on this page with a new &ldquo;Last updated&rdquo; date</li>
              <li>Sending an email notification for significant changes</li>
              <li>Displaying a notice in the platform</li>
            </ul>
            <p className="text-slate-400 mb-4">
              Your continued use of our services after changes indicates acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">13. Contact Us</h2>
            <p className="text-slate-400 mb-4">
              For privacy-related questions, to exercise your rights, or to make a complaint:
            </p>
            <ul className="list-disc list-inside text-slate-400 mb-4 space-y-2">
              <li>Email: <a href="mailto:privacy@bizno.co.uk" className="text-electric hover:underline">privacy@bizno.co.uk</a></li>
              <li>Data Protection Officer: privacy@bizno.co.uk</li>
            </ul>
            <p className="text-slate-400 mb-4">
              You also have the right to complain to the Information Commissioner&apos;s Office (ICO):
            </p>
            <p className="text-slate-400 mb-4">
              <strong>ICO Contact:</strong><br />
              Website: <a href="https://ico.org.uk" className="text-electric hover:underline">ico.org.uk</a><br />
              Helpline: 0303 123 1113<br />
              Address: Information Commissioner&apos;s Office, Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">14. Cookie Policy</h2>
            <p className="text-slate-400 mb-4">
              This Cookie Policy explains how we use cookies and similar technologies.
            </p>
            <h3 className="text-xl font-medium text-slate-300 mb-3">What Are Cookies?</h3>
            <p className="text-slate-400 mb-4">
              Cookies are small text files stored on your device when you visit websites. They help websites 
              function properly and provide information to website owners.
            </p>
            <h3 className="text-xl font-medium text-slate-300 mb-3">How to Manage Cookies</h3>
            <p className="text-slate-400 mb-4">
              Most web browsers allow you to control cookies through their settings. You can:
            </p>
            <ul className="list-disc list-inside text-slate-400 mb-4 space-y-2">
              <li>View cookies stored on your device</li>
              <li>Delete existing cookies</li>
              <li>Block third-party cookies</li>
              <li>Block all cookies (may affect functionality)</li>
            </ul>
            <p className="text-slate-400 mb-4">
              Note: Blocking essential cookies will prevent you from using our platform.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
