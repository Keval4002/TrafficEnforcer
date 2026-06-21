// ============================================================
// GridLock — API Service Layer
// Simulates FastAPI responses with realistic timing.
// Swap this file's internals to integrate real backend.
// ============================================================

import type {
  StageId,
  StageProcessingResponse,
  DetectionResult,
  ViolationDetection,
  LicensePlateResult,
  SystemMetrics,
  Evidence,
  AnalysisReport,
  ApiResponse,
} from '@/types';
import { generateId, STAGE_DURATIONS, randomBetween, sleep } from '@/lib/utils';
import { MOCK_STAGE_IMAGES } from './mockImages';

// ─── Simulated API base URL (replace with real FastAPI URL) ──
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
export { API_BASE_URL }; // exported for easy reference when integrating

// ─── Stage Processing Simulation ─────────────────────────────

export async function processStage(
  sessionId: string,
  stageId: StageId,
  imageUrl: string
): Promise<StageProcessingResponse> {
  const [minMs, maxMs] = STAGE_DURATIONS[stageId];
  const delay = randomBetween(minMs, maxMs);
  await sleep(delay);

  // When integrating real backend, replace with:
  // const res = await fetch(`${API_BASE_URL}/api/v1/pipeline/${sessionId}/stage/${stageId}`, { method: 'POST' });
  // return res.json();

  const STAGE_ORDER: StageId[] = [
    'preprocessing',
    'detection',
    'violation_detection',
    'classification',
    'lpr',
    'evidence',
    'analytics',
    'report',
  ];

  const currentIndex = STAGE_ORDER.indexOf(stageId);
  const nextStage = currentIndex < STAGE_ORDER.length - 1 ? STAGE_ORDER[currentIndex + 1] : undefined;

  return {
    stageId,
    status: 'completed',
    imageUrl: MOCK_STAGE_IMAGES[stageId] || imageUrl,
    metadata: buildStageMetadata(stageId, delay),
    processingTimeMs: delay,
    nextStage,
  };
}

// ─── Detection Results ────────────────────────────────────────

export async function getDetectionResults(sessionId: string): Promise<ApiResponse<DetectionResult>> {
  await sleep(randomBetween(200, 400));

  // Replace with: return fetch(`${API_BASE_URL}/api/v1/sessions/${sessionId}/detection`).then(r => r.json());

  return {
    success: true,
    requestId: generateId('REQ'),
    timestamp: new Date().toISOString(),
    processingTimeMs: randomBetween(200, 400),
    data: {
      totalDetections: 6,
      vehicles: [
        {
          id: generateId('VH'),
          category: 'motorcycle',
          confidence: 0.963,
          boundingBox: { x: 0.12, y: 0.35, width: 0.18, height: 0.28 },
          trackingId: 'TRK-001',
        },
        {
          id: generateId('VH'),
          category: 'motorcycle',
          confidence: 0.947,
          boundingBox: { x: 0.55, y: 0.28, width: 0.32, height: 0.42 },
          trackingId: 'TRK-002',
        },
        {
          id: generateId('VH'),
          category: 'motorcycle',
          confidence: 0.891,
          boundingBox: { x: 0.72, y: 0.40, width: 0.20, height: 0.32 },
          trackingId: 'TRK-003',
        },
      ],
      drivers: [
        {
          id: generateId('DR'),
          category: 'pedestrian',
          confidence: 0.934,
          boundingBox: { x: 0.13, y: 0.30, width: 0.08, height: 0.14 },
        },
        {
          id: generateId('DR'),
          category: 'pedestrian',
          confidence: 0.912,
          boundingBox: { x: 0.57, y: 0.25, width: 0.07, height: 0.12 },
        },
      ],
      riders: [
        {
          id: generateId('RD'),
          category: 'pedestrian',
          confidence: 0.878,
          boundingBox: { x: 0.17, y: 0.32, width: 0.06, height: 0.11 },
        },
        {
          id: generateId('RD'),
          category: 'pedestrian',
          confidence: 0.843,
          boundingBox: { x: 0.20, y: 0.33, width: 0.06, height: 0.11 },
        },
      ],
      pedestrians: [
        {
          id: generateId('PD'),
          category: 'pedestrian',
          confidence: 0.901,
          boundingBox: { x: 0.38, y: 0.45, width: 0.05, height: 0.18 },
        },
      ],
      processingTimeMs: randomBetween(5000, 8000),
      modelVersion: 'YOLOv9-traffic-v2.1.0',
    },
  };
}

// ─── Violation Detection Results ──────────────────────────────

export async function getViolationResults(sessionId: string): Promise<ApiResponse<ViolationDetection[]>> {
  await sleep(randomBetween(200, 400));

  return {
    success: true,
    requestId: generateId('REQ'),
    timestamp: new Date().toISOString(),
    processingTimeMs: randomBetween(200, 400),
    data: [
      {
        id: generateId('VIO'),
        type: 'helmet_non_compliance',
        label: 'Helmet Non-Compliance',
        severity: 'critical',
        confidence: 0.961,
        description:
          'Two riders detected on the motorcycle without helmets. Both the rider and pillion passenger are in violation of mandatory helmet laws.',
        affectedEntities: ['TRK-001'],
        legalReference: 'MV Act Section 129',
        fineAmount: 1000,
        boundingBox: { x: 0.12, y: 0.30, width: 0.18, height: 0.20 },
      },
      {
        id: generateId('VIO'),
        type: 'triple_riding',
        label: 'Triple Riding',
        severity: 'high',
        confidence: 0.934,
        description:
          'Three persons detected on a single two-wheeler, which is a serious violation of traffic safety regulations.',
        affectedEntities: ['TRK-001'],
        legalReference: 'MV Act Section 128',
        fineAmount: 1000,
        boundingBox: { x: 0.10, y: 0.28, width: 0.22, height: 0.32 },
      },
      {
        id: generateId('VIO'),
        type: 'stop_line_violation',
        label: 'Stop-Line Violation',
        severity: 'medium',
        confidence: 0.887,
        description:
          'Vehicle detected crossing the designated stop line at an intersection, indicating non-compliance with traffic signal rules.',
        affectedEntities: ['TRK-002'],
        legalReference: 'MV Act Section 119',
        fineAmount: 500,
        boundingBox: { x: 0.55, y: 0.60, width: 0.32, height: 0.08 },
      },
    ],
  };
}

// ─── License Plate Recognition ────────────────────────────────

export async function getLicensePlateResult(sessionId: string): Promise<ApiResponse<LicensePlateResult>> {
  await sleep(randomBetween(200, 400));

  return {
    success: true,
    requestId: generateId('REQ'),
    timestamp: new Date().toISOString(),
    processingTimeMs: randomBetween(200, 400),
    data: {
      detected: true,
      plateNumber: 'AP 28R 6104',
      ocrConfidence: 0.943,
      plateType: 'private',
      state: 'Andhra Pradesh',
      registrationDetails: {
        owner: 'REDACTED (PII)',
        vehicleType: 'Motorcycle',
        registrationYear: 2021,
        insuranceValid: true,
      },
      boundingBox: { x: 0.13, y: 0.58, width: 0.12, height: 0.05 },
    },
  };
}

// ─── System Metrics ───────────────────────────────────────────

export async function getSystemMetrics(sessionId: string): Promise<ApiResponse<SystemMetrics>> {
  await sleep(randomBetween(100, 300));

  return {
    success: true,
    requestId: generateId('REQ'),
    timestamp: new Date().toISOString(),
    processingTimeMs: randomBetween(100, 300),
    data: {
      overallConfidence: 0.938,
      detectionConfidence: 0.941,
      precision: 0.923,
      recall: 0.907,
      f1Score: 0.915,
      mAP: 0.891,
      processingTimeMs: randomBetween(26000, 38000),
      framesPerSecond: 12.4,
      memoryUsageMB: 1842,
      modelVersion: 'GridLock-CV-v2.1.0',
      inferenceDevice: 'cuda',
    },
  };
}

// ─── Final Report ─────────────────────────────────────────────

export async function getFinalReport(sessionId: string, imageUrl: string): Promise<ApiResponse<AnalysisReport>> {
  const [detection, violations, lpr, metrics] = await Promise.all([
    getDetectionResults(sessionId),
    getViolationResults(sessionId),
    getLicensePlateResult(sessionId),
    getSystemMetrics(sessionId),
  ]);

  const now = new Date().toISOString();

  return {
    success: true,
    requestId: generateId('REQ'),
    timestamp: now,
    processingTimeMs: metrics.data.processingTimeMs,
    data: {
      sessionId,
      status: 'completed',
      createdAt: now,
      completedAt: now,
      totalProcessingTimeMs: metrics.data.processingTimeMs,
      evidence: buildEvidence(sessionId, imageUrl),
      detection: detection.data,
      violations: violations.data,
      licensePlate: lpr.data,
      metrics: metrics.data,
      pipelineStages: [],
    },
  };
}

// ─── Private Helpers ──────────────────────────────────────────

function buildEvidence(sessionId: string, imageUrl: string): Evidence {
  return {
    evidenceId: generateId('EVD'),
    caseNumber: `GL-${new Date().getFullYear()}-${randomBetween(10000, 99999)}`,
    timestamp: new Date().toISOString(),
    capturedAt: new Date(Date.now() - randomBetween(60000, 300000)).toISOString(),
    locationMetadata: {
      camera: `CAM-${randomBetween(100, 999)}`,
      intersection: 'Pune-Mumbai Highway Junction 14A',
      coordinates: { lat: 18.5204, lng: 73.8567 },
    },
    annotatedImageUrl: imageUrl,
    rawImageUrl: imageUrl,
    chainOfCustody: generateId('COC'),
  };
}

function buildStageMetadata(stageId: StageId, processingTimeMs: number): Record<string, unknown> {
  const base = { processingTimeMs, timestamp: new Date().toISOString() };

  switch (stageId) {
    case 'preprocessing':
      return {
        ...base,
        inputResolution: '1920×1080',
        outputResolution: '1280×720',
        noiseReduction: 'bilateral_filter',
        contrastEnhancement: 'clahe',
        sharpeningKernel: '3x3_unsharp_mask',
        compressionRatio: 0.72,
      };
    case 'detection':
      return {
        ...base,
        model: 'YOLOv9-traffic-v2.1.0',
        detectedEntities: 9,
        inferenceDevice: 'CUDA GPU',
        gpuMemoryUsedMB: 1842,
        confidenceThreshold: 0.45,
        nmsThreshold: 0.5,
      };
    case 'violation_detection':
      return {
        ...base,
        model: 'GridLock-ViolationNet-v1.4',
        violationsFound: 3,
        rulesEvaluated: 12,
        ruleEngine: 'spatial_constraint_v2',
      };
    case 'classification':
      return {
        ...base,
        classesEvaluated: 7,
        topClassConfidence: 0.961,
        model: 'GridLock-Classifier-v1.2',
      };
    case 'lpr':
      return {
        ...base,
        platesDetected: 1,
        ocrEngine: 'TrOCR-traffic-v2',
        plateConfidence: 0.943,
        characterConfidence: [0.97, 0.99, 0.95, 0.98, 0.96, 0.94, 0.97, 0.99],
      };
    case 'evidence':
      return {
        ...base,
        annotationsAdded: 8,
        watermarkApplied: true,
        evidencePackageSize: '4.2 MB',
        hashAlgorithm: 'SHA-256',
      };
    case 'analytics':
      return {
        ...base,
        metricsComputed: 8,
        precision: 0.923,
        recall: 0.907,
        f1Score: 0.915,
        mAP: 0.891,
      };
    case 'report':
      return {
        ...base,
        reportFormat: 'JSON + PDF',
        sectionsGenerated: 6,
        totalFindings: 3,
      };
    default:
      return base;
  }
}
