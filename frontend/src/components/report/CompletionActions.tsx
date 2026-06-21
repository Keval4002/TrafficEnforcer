'use client';

import React from 'react';
import { Download, Save, Share2, ArrowLeft, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAnalysisStore } from '@/store/analysisStore';

interface CompletionActionsProps {
  caseNumber?: string;
}

export function CompletionActions({ caseNumber }: CompletionActionsProps) {
  const router = useRouter();
  const resetSession = useAnalysisStore((s) => s.resetSession);

  const handleAnalyzeAnother = () => {
    resetSession();
    router.push('/');
  };

  const handleDownloadReport = () => {
    // Placeholder: triggers download of report JSON
    const reportData = {
      message: 'PDF report generation will be handled by the FastAPI backend',
      caseNumber,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gridlock-report-${caseNumber ?? 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-30">
      <div className="px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Case info */}
          <div>
            <p className="text-xs font-mono text-gray-400">Analysis Complete</p>
            {caseNumber && (
              <p className="text-sm font-semibold text-[#0a0a0a] mt-0.5">
                Case #{caseNumber}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              id="save-evidence-btn"
              variant="secondary"
              size="sm"
              icon={<Save size={14} />}
              iconPosition="left"
              onClick={() => alert('Evidence saved. (Backend integration required for persistent storage.)')}
            >
              Save Evidence
            </Button>

            <Button
              id="export-results-btn"
              variant="secondary"
              size="sm"
              icon={<Share2 size={14} />}
              iconPosition="left"
              onClick={() => alert('Export to external system. (Backend integration required.)')}
            >
              Export Results
            </Button>

            <Button
              id="download-report-btn"
              variant="secondary"
              size="sm"
              icon={<FileText size={14} />}
              iconPosition="left"
              onClick={handleDownloadReport}
            >
              Download Report
            </Button>

            <Button
              id="analyze-another-btn"
              variant="primary"
              size="sm"
              icon={<ArrowLeft size={14} />}
              iconPosition="left"
              onClick={handleAnalyzeAnother}
            >
              Analyze Another
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
