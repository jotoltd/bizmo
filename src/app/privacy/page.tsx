import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy · Bizno",
  description: "Privacy policy for Bizno - Digital Readiness OS",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-void py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-100 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-slate-400 mb-6">Last updated: March 2026</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">1. Introduction</h2>
            <p className="text-slate-400 mb-4">
              Bizno (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) respects your privacy and is committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and safeguard your information when you use our digital readiness platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-medium text-slate-300 mb-3">2.1 Personal Information</h3>
            <ul className="list-disc list-inside text-slate-400 mb-4 space-y-2">
              <li>Email address (for account creation and communication)</li>
              <li>Business information you provide (business names, types)</li>
              <li>Team member email addresses (for invitations)</li>
              <li>Account activity and business progress data</li>
            </ul>

            <h3 className="text-xl font-medium text-slate-300 mb-3">2.2 Usage Data</h3>
            <ul className="list-disc list-inside text-slate-400 mb-4 space-y-2">
              <li>IP address and browser information</li>
              <li>Device information (for mobile app users)</li>
              <li>Pages visited and features used</li>
              <li>Time spent on the platform</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-slate-400 mb-4 space-y-2">
              <li>Provide and maintain our digital readiness platform</li>
              <li>Send notifications about business deadlines and updates</li>
              <li>Process team invitations and manage access</li>
              <li>Improve our services and user experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">4. Data Storage and Security</h2>
            <p className="text-slate-400 mb-4">
              We use Supabase for secure data storage with industry-standard encryption. 
              Your data is stored in secure data centers with access controls and regular security audits. 
              We implement appropriate technical and organizational measures to protect your personal data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">5. Your Rights</h2>
            <p className="text-slate-400 mb-4">Under GDPR and applicable data protection laws, you have the right to:</p>
            <ul className="list-disc list-inside text-slate-400 mb-4 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing</li>
              <li>Data portability</li>
              <li>Withdraw consent</li>
            </ul>
            <p className="text-slate-400">
              To exercise these rights, contact us at privacy@bizno.co.uk
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">6. Cookies and Analytics</h2>
            <p className="text-slate-400 mb-4">
              We use essential cookies for authentication and session management. 
              We also use privacy-focused analytics (Plausible) that does not track individual users or use cookies. 
              You can manage cookie preferences through your browser settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">7. Third-Party Services</h2>
            <p className="text-slate-400 mb-4">We use the following third-party services:</p>
            <ul className="list-disc list-inside text-slate-400 mb-4 space-y-2">
              <li>Supabase (database and authentication)</li>
              <li>Resend (email delivery)</li>
              <li>Plausible Analytics (privacy-focused analytics)</li>
              <li>Vercel (hosting and analytics)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">8. Contact Us</h2>
            <p className="text-slate-400">
              For privacy-related questions or to exercise your rights, email us at{" "}
              <a href="mailto:privacy@bizno.co.uk" className="text-electric hover:underline">
                privacy@bizno.co.uk
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
