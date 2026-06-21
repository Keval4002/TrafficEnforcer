'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/layout/TopNav';
import { PipelineSidebar } from '@/components/analysis/PipelineSidebar';
import { ImageCanvas } from '@/components/analysis/ImageCanvas';
import { StageOutputPanel } from '@/components/analysis/StageOutputPanel';
import { EvidenceHeader } from '@/components/report/EvidenceHeader';
import { DetectionSummary } from '@/components/report/DetectionSummary';
import { ViolationsPanel } from '@/components/report/ViolationsPanel';
import { LicensePlateCard } from '@/components/report/LicensePlateCard';
import { SystemMetricsPanel } from '@/components/report/SystemMetricsPanel';
import { CompletionActions } from '@/components/report/CompletionActions';
import { useAnalysisStore } from '@/store/analysisStore';

interface AnalysisPageProps {
  params: Promise<{ id: string }>;
}

export default function AnalysisPage({ params }: AnalysisPageProps) {
  const session = useAnalysisStore((s) => s.session);
  const router = useRouter();

  // Resolve params
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  useEffect(() => {
    params.then((p) => setSessionId(p.id));
  }, [params]);

  // Redirect if no uploaded image (e.g. direct URL access)
  useEffect(() => {
    if (sessionId && !session.uploadedImage && session.id !== sessionId) {
      router.replace('/');
    }
  }, [sessionId, session.uploadedImage, session.id, router]);

  const isReport =
    session.view === 'report' &&
    session.report &&
    (session.selectedStageId === 'report' || session.selectedStageId === null);

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <TopNav />

      <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
        {/* Pipeline Sidebar */}
        <PipelineSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {!isReport ? (
            /* ── Processing View ── */
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 min-h-0">
                <ImageCanvas />
              </div>
              <StageOutputPanel />
            </div>
          ) : (
            /* ── Report View ── */
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-6 py-8 pb-24 space-y-10">

                  {/* Page header */}
                  <div className="border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-xs font-semibold text-emerald-600">Analysis Complete</span>
                      </div>
                    </div>
                    <h1 className="text-2xl font-bold text-[#0a0a0a] tracking-tight">
                      Violation Detection Report
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                      Full pipeline analysis — {session.report!.violations.length} violation
                      {session.report!.violations.length !== 1 ? 's' : ''} detected
                    </p>
                  </div>

                  {/* Evidence */}
                  <EvidenceHeader evidence={session.report!.evidence} />

                  {/* Two-column grid for detection + violations */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <DetectionSummary detection={session.report!.detection} />
                    <ViolationsPanel violations={session.report!.violations} />
                  </div>

                  {/* License plate */}
                  <LicensePlateCard lpr={session.report!.licensePlate} />

                  {/* System metrics */}
                  <SystemMetricsPanel metrics={session.report!.metrics} />

                  {/* Bottom spacer for sticky bar */}
                  <div className="h-16" />
                </div>
              </div>

              {/* Completion actions — sticky bottom */}
              <CompletionActions caseNumber={session.report!.evidence.caseNumber} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
