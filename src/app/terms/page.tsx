import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service · Bizno",
  description: "Terms and conditions of use for Bizno - Digital Readiness OS",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-void py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-100 mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-slate-400 mb-6">Last updated: March 29, 2026</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">1. Definitions</h2>
            <ul className="list-disc list-inside text-slate-400 mb-4 space-y-2">
              <li><strong>&ldquo;Service&rdquo;:</strong> The Bizno digital readiness platform, including website and mobile applications</li>
              <li><strong>&ldquo;User&rdquo;:</strong> Any individual or entity accessing or using the Service</li>
              <li><strong>&ldquo;Account&rdquo;:</strong> The registered user profile created to access the Service</li>
              <li><strong>&ldquo;Content&rdquo;:</strong> Any data, text, images, or other materials uploaded to the Service</li>
              <li><strong>&ldquo;We&rdquo; / &ldquo;Us&rdquo; / &ldquo;Our&rdquo;:</strong> Bizno (Joto Ltd), the operator of the Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">2. Acceptance of Terms</h2>
            <p className="text-slate-400 mb-4">
              By accessing or using Bizno (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service and our Privacy Policy. 
              If you disagree with any part of the terms, you may not access the Service. 
              These terms constitute a legally binding agreement between you and Bizno (Joto Ltd).
            </p>
            <p className="text-slate-400 mb-4">
              You must be at least 16 years old to use the Service. By using the Service, you represent and warrant that you meet this requirement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">3. Description of Service</h2>
            <p className="text-slate-400 mb-4">
              Bizno is a digital readiness platform that helps businesses track their setup progress, 
              manage team members, and streamline business launch activities. The Service includes both 
              web and mobile applications.
            </p>
            <p className="text-slate-400 mb-4">
              We reserve the right to modify, suspend, or discontinue any part of the Service at any time without notice. 
              We shall not be liable to you or any third party for any modification, suspension, or discontinuation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">4. User Accounts</h2>
            <h3 className="text-xl font-medium text-slate-300 mb-3">4.1 Account Creation</h3>
            <ul className="list-disc list-inside text-slate-400 mb-4 space-y-2">
              <li>You must provide accurate, current, and complete information when creating an account</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You must notify us immediately of any unauthorized access or security breach</li>
              <li>You may not create multiple accounts for the same individual or entity without our consent</li>
              <li>You are responsible for all activities that occur under your account</li>
            </ul>

            <h3 className="text-xl font-medium text-slate-300 mb-3">4.2 Account Security</h3>
            <p className="text-slate-400 mb-4">
              You agree to use strong passwords and enable two-factor authentication where available. 
              We are not responsible for any loss or damage arising from your failure to comply with these security obligations.
            </p>

            <h3 className="text-xl font-medium text-slate-300 mb-3">4.3 Account Termination</h3>
            <p className="text-slate-400 mb-4">
              We reserve the right to suspend or terminate accounts that:
            </p>
            <ul className="list-disc list-inside text-slate-400 mb-4 space-y-2">
              <li>Violate these terms or our policies</li>
              <li>Engage in fraudulent, abusive, or illegal activity</li>
              <li>Remain inactive for an extended period</li>
              <li>Are created using false information</li>
            </ul>
            <p className="text-slate-400 mb-4">
              Upon termination, your right to use the Service will immediately cease. 
              All provisions of these terms which by their nature should survive termination shall survive.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">5. Acceptable Use</h2>
            <p className="text-slate-400 mb-4">You agree not to use the Service to:</p>
            <ul className="list-disc list-inside text-slate-400 mb-4 space-y-2">
              <li>Violate any applicable local, national, or international laws or regulations</li>
              <li>Infringe upon intellectual property rights or other proprietary rights</li>
              <li>Send spam, unsolicited communications, or harass other users</li>
              <li>Attempt to gain unauthorized access to the Service or related systems</li>
              <li>Interfere with or disrupt the integrity or performance of the Service</li>
              <li>Upload or transmit malicious code, viruses, or harmful files</li>
              <li>Collect or harvest personal data about other users without consent</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">5. Team Invitations and Collaboration</h2>
            <p className="text-slate-400 mb-4">
              When inviting team members, you confirm that you have authority to invite them and 
              that they consent to receiving invitations. Team members must comply with these terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">6. Data and Content</h2>
            <h3 className="text-xl font-medium text-slate-300 mb-3">6.1 Your Data</h3>
            <p className="text-slate-400 mb-4">
              You retain ownership of your business data and content. By using the Service, 
              you grant us a license to host and process this data solely to provide the Service.
            </p>

            <h3 className="text-xl font-medium text-slate-300 mb-3">6.2 Data Backup</h3>
            <p className="text-slate-400 mb-4">
              While we maintain regular backups, you are responsible for maintaining copies 
              of critical business data. We recommend exporting important data periodically.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">7. Service Availability</h2>
            <p className="text-slate-400 mb-4">
              We strive to maintain 99.9% uptime but do not guarantee uninterrupted access. 
              The Service may be temporarily unavailable for maintenance, updates, or circumstances 
              beyond our control.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">8. Modifications to Service</h2>
            <p className="text-slate-400 mb-4">
              We reserve the right to modify or discontinue the Service at any time, with or 
              without notice. We are not liable for any modification, suspension, or discontinuation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">9. Limitation of Liability</h2>
            <p className="text-slate-400 mb-4">
              To the maximum extent permitted by law, Bizno shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages arising from your use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">10. Governing Law</h2>
            <p className="text-slate-400 mb-4">
              These terms shall be governed by the laws of the United Kingdom. Any disputes 
              shall be resolved in the courts of England and Wales.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">11. Changes to Terms</h2>
            <p className="text-slate-400 mb-4">
              We may update these terms from time to time. We will notify users of significant 
              changes via email or through the Service. Continued use constitutes acceptance of 
              updated terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">12. Contact Information</h2>
            <p className="text-slate-400">
              For questions about these terms, contact us at{" "}
              <a href="mailto:legal@bizno.co.uk" className="text-electric hover:underline">
                legal@bizno.co.uk
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
