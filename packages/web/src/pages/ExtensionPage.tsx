import { Chrome, Download, Shield, Mail, CheckCircle } from 'lucide-react';
import { Card, CardContent, Button } from '@/components/ui';

const features = [
  {
    icon: Mail,
    title: 'Email Protection',
    description: 'Automatically scans incoming emails for potential scams',
  },
  {
    icon: Shield,
    title: 'Real-time Alerts',
    description: 'Get instant warnings when suspicious content is detected',
  },
  {
    icon: CheckCircle,
    title: 'One-Click Analysis',
    description: 'Analyze any email with a single click',
  },
];

export function ExtensionPage() {
  const handleDownload = () => {
    // In a real app, this would trigger the extension download
    alert('Extension download coming soon!');
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <Chrome className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-txt">Browser Extension</h1>
        <p className="text-txt-muted mt-2 max-w-lg mx-auto">
          Protect your email inbox with our Chrome extension
        </p>
      </div>

      {/* Features */}
      <div className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardContent className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-txt mb-1">{feature.title}</h3>
              <p className="text-sm text-txt-muted">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Download Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-txt mb-2">
                Get ScamShield for Chrome
              </h2>
              <p className="text-txt-muted mb-4">
                Install our free extension to protect your Gmail inbox from phishing
                and scam emails. Works seamlessly in the background.
              </p>
              <Button
                size="lg"
                onClick={handleDownload}
                leftIcon={<Download className="w-5 h-5" />}
              >
                Download Extension
              </Button>
            </div>
            <div className="w-48 h-48 bg-surface rounded-xl flex items-center justify-center">
              <Chrome className="w-24 h-24 text-primary/30" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Installation Steps */}
      <Card>
        <CardContent>
          <h2 className="font-semibold text-txt mb-4">How to Install</h2>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                1
              </span>
              <div>
                <p className="font-medium text-txt">Download the extension</p>
                <p className="text-sm text-txt-muted">
                  Click the download button above to get the extension files
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                2
              </span>
              <div>
                <p className="font-medium text-txt">Open Chrome Extensions</p>
                <p className="text-sm text-txt-muted">
                  Go to chrome://extensions in your browser
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                3
              </span>
              <div>
                <p className="font-medium text-txt">Enable Developer Mode</p>
                <p className="text-sm text-txt-muted">
                  Toggle the "Developer mode" switch in the top right corner
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                4
              </span>
              <div>
                <p className="font-medium text-txt">Load the extension</p>
                <p className="text-sm text-txt-muted">
                  Click "Load unpacked" and select the downloaded folder
                </p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Coming Soon */}
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-txt-muted">
            Firefox and Safari extensions coming soon!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
