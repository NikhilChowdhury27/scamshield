import { BookOpen } from 'lucide-react';
import { ScamTypeCard } from '@/components/features';
import { SCAM_TYPES } from '@scamshield/shared';

// Featured scam types to display
const FEATURED_SCAM_TYPES = [
  'grandparent_scam',
  'fake_tech_support',
  'fake_government_or_tax',
  'lottery_or_prize_scam',
  'romance_scam',
  'bank_account_scam',
  'phishing_or_credential_harvest',
  'investment_or_crypto_scam',
];

export function LearnPage() {
  const scamTypes = FEATURED_SCAM_TYPES.map((id) => SCAM_TYPES[id]).filter(Boolean);

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-txt">Learn About Scams</h1>
        <p className="text-txt-muted mt-2 max-w-lg mx-auto">
          Knowledge is your best defense. Learn to recognize common scams and protect yourself.
        </p>
      </div>

      {/* Tips Card */}
      <div className="bg-primary/10 rounded-xl p-6">
        <h2 className="font-semibold text-primary mb-3">General Safety Tips</h2>
        <ul className="space-y-2 text-sm text-txt-muted">
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">1.</span>
            <span>Never give personal information to unsolicited callers or messages.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">2.</span>
            <span>If it sounds too good to be true, it probably is.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">3.</span>
            <span>Take your time - scammers create urgency to prevent you from thinking clearly.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">4.</span>
            <span>When in doubt, hang up and call the organization directly using a number you trust.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">5.</span>
            <span>Talk to a family member or friend before making any financial decisions.</span>
          </li>
        </ul>
      </div>

      {/* Scam Types Grid */}
      <div>
        <h2 className="text-xl font-semibold text-txt mb-4">Common Scam Types</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {scamTypes.map((scamType) => (
            <ScamTypeCard key={scamType.id} scamType={scamType} />
          ))}
        </div>
      </div>

      {/* Resources */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h2 className="font-semibold text-txt mb-3">Helpful Resources</h2>
        <div className="space-y-3">
          <a
            href="https://www.ftc.gov/scams"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-lg bg-canvas hover:bg-border/20 transition-colors"
          >
            <p className="font-medium text-primary">FTC Scam Alerts</p>
            <p className="text-sm text-txt-muted">Official scam warnings from the Federal Trade Commission</p>
          </a>
          <a
            href="https://www.aarp.org/money/scams-fraud/"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-lg bg-canvas hover:bg-border/20 transition-colors"
          >
            <p className="font-medium text-primary">AARP Fraud Watch Network</p>
            <p className="text-sm text-txt-muted">Resources and support for fraud prevention</p>
          </a>
          <a
            href="https://www.ic3.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-lg bg-canvas hover:bg-border/20 transition-colors"
          >
            <p className="font-medium text-primary">FBI Internet Crime Complaint Center</p>
            <p className="text-sm text-txt-muted">Report and learn about internet crimes</p>
          </a>
        </div>
      </div>
    </div>
  );
}
