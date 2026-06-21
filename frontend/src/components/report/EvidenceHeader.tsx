'use client';

import React from 'react';
import { Calendar, MapPin, Camera, Hash, Shield } from 'lucide-react';
import { cn, formatTimestamp } from '@/lib/utils';
import type { Evidence } from '@/types';
import { LabelBadge } from '@/components/ui/Badge';

interface EvidenceHeaderProps {
  evidence: Evidence;
}

export function EvidenceHeader({ evidence }: EvidenceHeaderProps) {
  return (
    <div className="card rounded-2xl overflow-hidden">
      {/* Annotated image */}
      {evidence.annotatedImageUrl && (
        <div className="relative bg-[#0a0a0a]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={evidence.annotatedImageUrl}
            alt="Annotated evidence image"
            className="w-full max-h-[480px] object-contain"
          />
          {/* Evidence ID overlay */}
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/10">
            <Shield size={12} className="text-white/60" />
            <span className="text-xs font-mono text-white">{evidence.evidenceId}</span>
          </div>
          {/* Case number overlay */}
          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/10">
            <span className="text-xs font-mono text-white">{evidence.caseNumber}</span>
          </div>
        </div>
      )}

      {/* Metadata bar */}
      <div className="px-5 py-4 border-t border-gray-100">
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {/* Timestamp */}
          <MetaItem icon={<Calendar size={13} />} label="Captured">
            {formatTimestamp(evidence.capturedAt)}
          </MetaItem>

          {/* Camera */}
          {evidence.locationMetadata.camera && (
            <MetaItem icon={<Camera size={13} />} label="Camera">
              {evidence.locationMetadata.camera}
            </MetaItem>
          )}

          {/* Location */}
          {evidence.locationMetadata.intersection && (
            <MetaItem icon={<MapPin size={13} />} label="Location">
              {evidence.locationMetadata.intersection}
            </MetaItem>
          )}

          {/* Chain of custody */}
          <MetaItem icon={<Hash size={13} />} label="Chain of Custody">
            <span className="font-mono text-gray-400 truncate max-w-[140px]">{evidence.chainOfCustody}</span>
          </MetaItem>
        </div>
      </div>

      {/* Tags */}
      <div className="px-5 pb-4 flex gap-2 flex-wrap">
        <LabelBadge variant="default">Evidence Package</LabelBadge>
        <LabelBadge variant="default">SHA-256 Verified</LabelBadge>
        <LabelBadge variant="default">Tamper-Proof</LabelBadge>
        {evidence.locationMetadata.coordinates && (
          <LabelBadge variant="outline">
            {evidence.locationMetadata.coordinates.lat.toFixed(4)},{' '}
            {evidence.locationMetadata.coordinates.lng.toFixed(4)}
          </LabelBadge>
        )}
      </div>
    </div>
  );
}

function MetaItem({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-xs text-[#0a0a0a] font-semibold mt-0.5">{children}</p>
      </div>
    </div>
  );
}
