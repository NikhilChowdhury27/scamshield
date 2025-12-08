import { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  AlertTriangle,
  CheckCircle,
  Phone,
  Users,
  ExternalLink,
  Volume2,
  Copy,
  Check,
} from 'lucide-react';
import { Card, CardContent, RiskBadge, Button, Alert } from '@/components/ui';
import type { ScamAnalysis, RiskLevel, SearchVerification } from '@scamshield/shared';
import { SCAM_TYPES, snakeToTitle } from '@scamshield/shared';

interface ResultCardProps {
  analysis: ScamAnalysis;
  searchVerification?: SearchVerification | null;
  onSpeak?: (text: string) => void;
}

const RiskIcon = ({ level }: { level: RiskLevel }) => {
  switch (level) {
    case 'HIGH':
      return <ShieldAlert className="w-8 h-8 text-danger" />;
    case 'MEDIUM':
      return <Shield className="w-8 h-8 text-warning" />;
    case 'LOW':
      return <ShieldCheck className="w-8 h-8 text-success" />;
  }
};

const riskBgColors: Record<RiskLevel, string> = {
  HIGH: 'bg-danger/10 border-danger/30',
  MEDIUM: 'bg-warning/10 border-warning/30',
  LOW: 'bg-success/10 border-success/30',
};

export function ResultCard({ analysis, searchVerification, onSpeak }: ResultCardProps) {
  const [copied, setCopied] = useState(false);
  const scamTypeInfo = SCAM_TYPES[analysis.scam_type];

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Risk Summary Card */}
      <Card className={`border ${riskBgColors[analysis.risk_label]}`}>
        <CardContent>
          <div className="flex items-start gap-4">
            <RiskIcon level={analysis.risk_label} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <RiskBadge level={analysis.risk_label} size="lg" />
                <span className="text-sm text-txt-muted">
                  Score: {Math.round(analysis.risk_score * 100)}%
                </span>
              </div>
              <h3 className="text-lg font-semibold text-txt mb-1">
                {scamTypeInfo?.name || snakeToTitle(analysis.scam_type)}
              </h3>
              <p className="text-txt-muted">{analysis.summary_for_elder}</p>
              {onSpeak && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSpeak(analysis.summary_for_elder)}
                  leftIcon={<Volume2 className="w-4 h-4" />}
                  className="mt-2"
                >
                  Read Aloud
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Red Flags */}
      {analysis.red_flags.length > 0 && (
        <Card>
          <CardContent>
            <h4 className="font-semibold text-txt flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Warning Signs Found
            </h4>
            <ul className="space-y-2">
              {analysis.red_flags.map((flag, idx) => (
                <li key={idx} className="flex items-start gap-2 text-txt-muted">
                  <span className="text-warning">•</span>
                  <span>{flag.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Safe Actions */}
      {analysis.safe_actions_for_elder.length > 0 && (
        <Card>
          <CardContent>
            <h4 className="font-semibold text-txt flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-success" />
              What You Should Do
            </h4>
            <ul className="space-y-2">
              {analysis.safe_actions_for_elder.map((action, idx) => (
                <li key={idx} className="flex items-start gap-2 text-txt-muted">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Callback Script */}
      {analysis.call_script_if_scammer_calls_back && (
        <Card>
          <CardContent>
            <h4 className="font-semibold text-txt flex items-center gap-2 mb-3">
              <Phone className="w-5 h-5 text-primary" />
              If They Call Back, Say This
            </h4>
            <blockquote className="pl-4 border-l-4 border-primary italic text-txt-muted">
              "{analysis.call_script_if_scammer_calls_back}"
            </blockquote>
          </CardContent>
        </Card>
      )}

      {/* Family Alert */}
      {analysis.family_alert_text && (
        <Card>
          <CardContent>
            <h4 className="font-semibold text-txt flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-primary" />
              Share with Family
            </h4>
            <p className="text-txt-muted mb-3">{analysis.family_alert_text}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleCopy(analysis.family_alert_text)}
              leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? 'Copied!' : 'Copy Message'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Web Verification */}
      {searchVerification && (
        <Card>
          <CardContent>
            <h4 className="font-semibold text-txt flex items-center gap-2 mb-3">
              <ExternalLink className="w-5 h-5 text-primary" />
              Web Research Results
            </h4>
            <p className="text-txt-muted mb-3">{searchVerification.result}</p>
            {searchVerification.sources.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-txt">Sources:</p>
                {searchVerification.sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-primary hover:underline truncate"
                  >
                    {source.title || source.url}
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Transcription */}
      {analysis.transcription && (
        <Card>
          <CardContent>
            <h4 className="font-semibold text-txt mb-3">Audio Transcription</h4>
            <p className="text-txt-muted whitespace-pre-wrap">{analysis.transcription}</p>
          </CardContent>
        </Card>
      )}

      {/* Reporting */}
      {analysis.regulatory_reporting_suggestions.length > 0 && (
        <Card>
          <CardContent>
            <h4 className="font-semibold text-txt mb-3">Report This Scam</h4>
            <div className="space-y-3">
              {analysis.regulatory_reporting_suggestions.map((agency, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 text-txt-muted flex-shrink-0" />
                  <div>
                    <p className="font-medium text-txt">{agency.agency}</p>
                    <p className="text-sm text-txt-muted">{agency.description}</p>
                    {agency.website && (
                      <a
                        href={agency.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {agency.website}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Alert variant="info">
        {analysis.disclaimer_for_elder}
      </Alert>
    </div>
  );
}
