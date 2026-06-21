// ============================================================
// Traffic Enforcer — API Service Layer
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

// Keep track of sessionId to imageSet mapping
const sessionImageSets = new Map<string, string>();

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

  // Detect which image was selected
  let imageSet = 'test1';
  if (imageUrl.includes('testImage2')) {
    imageSet = 'test2';
  } else if (imageUrl.includes('testImage3')) {
    imageSet = 'test3';
  }
  sessionImageSets.set(sessionId, imageSet);

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

  // Serve the generated mock image set
  const stageImageUrl = stageId === 'report' ? null : `/mock-images/${imageSet}/${stageId}.jpg`;

  return {
    stageId,
    status: 'completed',
    imageUrl: stageImageUrl || imageUrl,
    metadata: buildStageMetadata(sessionId, stageId, delay),
    processingTimeMs: delay,
    nextStage,
  };
}

// ─── Detection Results ────────────────────────────────────────

export async function getDetectionResults(sessionId: string): Promise<ApiResponse<DetectionResult>> {
  await sleep(randomBetween(200, 400));
  const imageSet = sessionImageSets.get(sessionId) || 'test1';

  let data: DetectionResult;
  if (imageSet === 'test2') {
    data = {
      totalDetections: 3,
      vehicles: [
        {
          id: generateId('VH'),
          category: 'car',
          confidence: 0.941,
          boundingBox: { x: 0.38, y: 0.33, width: 0.25, height: 0.40 },
          trackingId: 'TRK-201',
        },
        {
          id: generateId('VH'),
          category: 'auto_rickshaw',
          confidence: 0.882,
          boundingBox: { x: 0.12, y: 0.40, width: 0.19, height: 0.27 },
          trackingId: 'TRK-202',
        },
        {
          id: generateId('VH'),
          category: 'truck',
          confidence: 0.914,
          boundingBox: { x: 0.69, y: 0.29, width: 0.22, height: 0.38 },
          trackingId: 'TRK-203',
        },
      ],
      drivers: [
        {
          id: generateId('DR'),
          category: 'pedestrian',
          confidence: 0.952,
          boundingBox: { x: 0.42, y: 0.35, width: 0.10, height: 0.15 },
        },
      ],
      riders: [],
      pedestrians: [],
      processingTimeMs: randomBetween(5000, 8000),
      modelVersion: 'TrafficEnforcer-CV-v2.1.0',
    };
  } else if (imageSet === 'test3') {
    data = {
      totalDetections: 3,
      vehicles: [
        {
          id: generateId('VH'),
          category: 'motorcycle',
          confidence: 0.953,
          boundingBox: { x: 0.21, y: 0.52, width: 0.12, height: 0.20 },
          trackingId: 'TRK-301',
        },
        {
          id: generateId('VH'),
          category: 'bus',
          confidence: 0.971,
          boundingBox: { x: 0.42, y: 0.33, width: 0.26, height: 0.46 },
          trackingId: 'TRK-302',
        },
        {
          id: generateId('VH'),
          category: 'bicycle',
          confidence: 0.854,
          boundingBox: { x: 0.73, y: 0.54, width: 0.10, height: 0.17 },
          trackingId: 'TRK-303',
        },
      ],
      drivers: [
        {
          id: generateId('DR'),
          category: 'pedestrian',
          confidence: 0.924,
          boundingBox: { x: 0.23, y: 0.48, width: 0.05, height: 0.08 },
        },
      ],
      riders: [],
      pedestrians: [],
      processingTimeMs: randomBetween(5000, 8000),
      modelVersion: 'TrafficEnforcer-CV-v2.1.0',
    };
  } else {
    // Default/Test 1
    data = {
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
      modelVersion: 'TrafficEnforcer-CV-v2.1.0',
    };
  }

  return {
    success: true,
    requestId: generateId('REQ'),
    timestamp: new Date().toISOString(),
    processingTimeMs: randomBetween(200, 400),
    data,
  };
}

// ─── Violation Detection Results ──────────────────────────────

export async function getViolationResults(sessionId: string): Promise<ApiResponse<ViolationDetection[]>> {
  await sleep(randomBetween(200, 400));
  const imageSet = sessionImageSets.get(sessionId) || 'test1';

  let data: ViolationDetection[];
  if (imageSet === 'test2') {
    data = [
      {
        id: generateId('VIO'),
        type: 'stop_line_violation',
        label: 'Stop-Line Violation',
        severity: 'medium',
        confidence: 0.887,
        description:
          'Vehicle detected crossing the designated stop line at the intersection while the signal was red.',
        affectedEntities: ['TRK-201'],
        legalReference: 'MV Act Section 119',
        fineAmount: 500,
        boundingBox: { x: 0.38, y: 0.33, width: 0.25, height: 0.40 },
      },
    ];
  } else if (imageSet === 'test3') {
    data = [
      {
        id: generateId('VIO'),
        type: 'wrong_side_driving',
        label: 'Wrong-Side Driving',
        severity: 'critical',
        confidence: 0.952,
        description:
          'Motorcycle detected traveling in the opposite direction of lane flow, posing an immediate danger to other motorists.',
        affectedEntities: ['TRK-301'],
        legalReference: 'MV Act Section 184',
        fineAmount: 5000,
        boundingBox: { x: 0.21, y: 0.52, width: 0.12, height: 0.20 },
      },
    ];
  } else {
    // Default / Test 1
    data = [
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
    ];
  }

  return {
    success: true,
    requestId: generateId('REQ'),
    timestamp: new Date().toISOString(),
    processingTimeMs: randomBetween(200, 400),
    data,
  };
}

// ─── License Plate Recognition ────────────────────────────────

export async function getLicensePlateResult(sessionId: string): Promise<ApiResponse<LicensePlateResult>> {
  await sleep(randomBetween(200, 400));
  const imageSet = sessionImageSets.get(sessionId) || 'test1';

  let data: LicensePlateResult;
  if (imageSet === 'test2') {
    data = {
      detected: true,
      plateNumber: 'MH 12 PQ 7890',
      ocrConfidence: 0.927,
      plateType: 'private',
      state: 'Maharashtra',
      registrationDetails: {
        owner: 'REDACTED (PII)',
        vehicleType: 'Car (Sedan)',
        registrationYear: 2019,
        insuranceValid: true,
      },
      boundingBox: { x: 0.48, y: 0.60, width: 0.10, height: 0.05 },
    };
  } else if (imageSet === 'test3') {
    data = {
      detected: true,
      plateNumber: 'DL 3C AY 4567',
      ocrConfidence: 0.941,
      plateType: 'private',
      state: 'Delhi',
      registrationDetails: {
        owner: 'REDACTED (PII)',
        vehicleType: 'Motorcycle',
        registrationYear: 2022,
        insuranceValid: true,
      },
      boundingBox: { x: 0.24, y: 0.63, width: 0.08, height: 0.04 },
    };
  } else {
    // Default / Test 1
    data = {
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
    };
  }

  return {
    success: true,
    requestId: generateId('REQ'),
    timestamp: new Date().toISOString(),
    processingTimeMs: randomBetween(200, 400),
    data,
  };
}

// ─── System Metrics ───────────────────────────────────────────

export async function getSystemMetrics(sessionId: string): Promise<ApiResponse<SystemMetrics>> {
  await sleep(randomBetween(100, 300));
  const imageSet = sessionImageSets.get(sessionId) || 'test1';

  return {
    success: true,
    requestId: generateId('REQ'),
    timestamp: new Date().toISOString(),
    processingTimeMs: randomBetween(100, 300),
    data: {
      overallConfidence: imageSet === 'test1' ? 0.938 : imageSet === 'test2' ? 0.915 : 0.947,
      detectionConfidence: imageSet === 'test1' ? 0.941 : imageSet === 'test2' ? 0.923 : 0.951,
      precision: imageSet === 'test1' ? 0.923 : imageSet === 'test2' ? 0.908 : 0.936,
      recall: imageSet === 'test1' ? 0.907 : imageSet === 'test2' ? 0.892 : 0.918,
      f1Score: imageSet === 'test1' ? 0.915 : imageSet === 'test2' ? 0.900 : 0.927,
      mAP: imageSet === 'test1' ? 0.891 : imageSet === 'test2' ? 0.874 : 0.909,
      processingTimeMs: randomBetween(26000, 38000),
      framesPerSecond: 12.4,
      memoryUsageMB: 1842,
      modelVersion: 'TrafficEnforcer-CV-v2.1.0',
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
  const imageSet = sessionImageSets.get(sessionId) || 'test1';
  const customImageUrl = `/mock-images/${imageSet}/evidence.jpg`;
  
  return {
    evidenceId: generateId('EVD'),
    caseNumber: `${imageSet === 'test2' ? 'TE-T2' : imageSet === 'test3' ? 'TE-T3' : 'TE'}-${new Date().getFullYear()}-${randomBetween(10000, 99999)}`,
    timestamp: new Date().toISOString(),
    capturedAt: new Date(Date.now() - randomBetween(60000, 300000)).toISOString(),
    locationMetadata: {
      camera: `CAM-${randomBetween(100, 999)}`,
      intersection: imageSet === 'test1'
        ? 'Pune-Mumbai Highway Junction 14A'
        : imageSet === 'test2'
        ? 'Delhi Ring Road - Stop Line Segment B'
        : 'Bengaluru Outer Ring Road - Wrong Side Lane',
      coordinates: imageSet === 'test1'
        ? { lat: 18.5204, lng: 73.8567 }
        : imageSet === 'test2'
        ? { lat: 28.6139, lng: 77.2090 }
        : { lat: 12.9716, lng: 77.5946 },
    },
    annotatedImageUrl: customImageUrl,
    rawImageUrl: imageUrl,
    chainOfCustody: generateId('COC'),
  };
}

function buildStageMetadata(sessionId: string, stageId: StageId, processingTimeMs: number): Record<string, unknown> {
  const base = { processingTimeMs, timestamp: new Date().toISOString() };
  const imageSet = sessionImageSets.get(sessionId) || 'test1';

  switch (stageId) {
    case 'preprocessing':
      return {
        ...base,
        inputResolution: imageSet === 'test3' ? '960×540' : '800×600',
        outputResolution: imageSet === 'test3' ? '960×540' : '800×600',
        noiseReduction: 'bilateral_filter',
        contrastEnhancement: 'clahe',
        sharpeningKernel: '3x3_unsharp_mask',
        compressionRatio: 0.72,
      };
    case 'detection':
      return {
        ...base,
        model: 'YOLOv9-traffic-v2.1.0',
        detectedEntities: imageSet === 'test1' ? 9 : 3,
        inferenceDevice: 'CUDA GPU',
        gpuMemoryUsedMB: 1842,
        confidenceThreshold: 0.45,
        nmsThreshold: 0.5,
      };
    case 'violation_detection':
      return {
        ...base,
        model: 'TrafficEnforcer-ViolationNet-v1.4',
        violationsFound: imageSet === 'test1' ? 2 : 1,
        rulesEvaluated: 12,
        ruleEngine: 'spatial_constraint_v2',
      };
    case 'classification':
      return {
        ...base,
        classesEvaluated: 7,
        topClassConfidence: imageSet === 'test1' ? 0.961 : imageSet === 'test2' ? 0.887 : 0.952,
        model: 'TrafficEnforcer-Classifier-v1.2',
      };
    case 'lpr':
      return {
        ...base,
        platesDetected: 1,
        ocrEngine: 'TrOCR-traffic-v2',
        plateConfidence: imageSet === 'test1' ? 0.943 : imageSet === 'test2' ? 0.927 : 0.941,
        characterConfidence: imageSet === 'test1'
          ? [0.97, 0.99, 0.95, 0.98, 0.96, 0.94, 0.97, 0.99]
          : [0.95, 0.94, 0.98, 0.99, 0.93, 0.92, 0.96, 0.97, 0.94, 0.95],
      };
    case 'evidence':
      return {
        ...base,
        annotationsAdded: imageSet === 'test1' ? 8 : 4,
        watermarkApplied: true,
        evidencePackageSize: '4.2 MB',
        hashAlgorithm: 'SHA-256',
      };
    case 'analytics':
      return {
        ...base,
        metricsComputed: 8,
        precision: imageSet === 'test1' ? 0.923 : imageSet === 'test2' ? 0.908 : 0.936,
        recall: imageSet === 'test1' ? 0.907 : imageSet === 'test2' ? 0.892 : 0.918,
        f1Score: imageSet === 'test1' ? 0.915 : imageSet === 'test2' ? 0.900 : 0.927,
        mAP: imageSet === 'test1' ? 0.891 : imageSet === 'test2' ? 0.874 : 0.909,
      };
    case 'report':
      return {
        ...base,
        reportFormat: 'JSON + PDF',
        sectionsGenerated: 6,
        totalFindings: imageSet === 'test1' ? 2 : 1,
      };
    default:
      return base;
  }
}
