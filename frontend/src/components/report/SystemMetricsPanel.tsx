'use client';

import React from 'react';
import { Cpu, Zap, MemoryStick } from 'lucide-react';
import { Card, StatRow } from '@/components/ui/Card';
import { RadialMetric } from '@/components/ui/ProgressBar';
import { formatDuration } from '@/lib/utils';
import type { SystemMetrics } from '@/types';

interface SystemMetricsPanelProps {
  metrics: SystemMetrics;
}

export function SystemMetricsPanel({ metrics }: SystemMetricsPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-[#0a0a0a] tracking-tight">System Metrics</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          End-to-end pipeline performance and model evaluation scores
        </p>
      </div>

      {/* Radial metrics row */}
      <Card padding="lg">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">
          Model Evaluation
        </p>
        <div className="flex flex-wrap gap-6 justify-around">
          <RadialMetric value={metrics.overallConfidence} label="Overall Confidence" size={80} />
          <RadialMetric value={metrics.precision} label="Precision" size={80} />
          <RadialMetric value={metrics.recall} label="Recall" size={80} />
          <RadialMetric value={metrics.f1Score} label="F1 Score" size={80} />
          <RadialMetric value={metrics.mAP} label="mAP" size={80} />
        </div>
      </Card>

      {/* Computational metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card padding="md">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
              <Zap size={14} strokeWidth={1.5} />
            </div>
            <p className="text-xs font-semibold text-gray-600">Computational Efficiency</p>
          </div>
          <div>
            <StatRow label="Total Processing Time" value={formatDuration(metrics.processingTimeMs)} mono />
            {metrics.framesPerSecond && (
              <StatRow label="Inference Speed" value={`${metrics.framesPerSecond} FPS`} mono />
            )}
            <StatRow label="Inference Device" value={metrics.inferenceDevice.toUpperCase()} mono />
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
              <Cpu size={14} strokeWidth={1.5} />
            </div>
            <p className="text-xs font-semibold text-gray-600">System Info</p>
          </div>
          <div>
            <StatRow label="Model Version" value={metrics.modelVersion} mono />
            <StatRow label="Detection Confidence" value={`${(metrics.detectionConfidence * 100).toFixed(1)}%`} mono />
            {metrics.memoryUsageMB && (
              <StatRow label="GPU Memory Used" value={`${metrics.memoryUsageMB} MB`} mono />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
