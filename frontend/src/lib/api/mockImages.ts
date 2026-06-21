import type { StageId } from '@/types';

/**
 * MOCK IMAGES CONFIGURATION
 * 
 * To use local mock photos for intermediary pipeline stages:
 * 1. Place your mock images in the `public/mock-images/stages/` directory.
 * 2. Update the values in this object to point to your local files 
 *    (e.g., '/mock-images/stages/preprocessing.jpg').
 * 
 * Currently, it uses placeholder generation service (placehold.co) to avoid missing image errors.
 */
export const MOCK_STAGE_IMAGES: Record<StageId, string | null> = {
  preprocessing: '/mock-images/stages/preprocessing.jpg',
  detection: '/mock-images/stages/detection.jpg',
  violation_detection: '/mock-images/stages/violation_detection.jpg',
  classification: '/mock-images/stages/classification.jpg',
  lpr: '/mock-images/stages/lpr.jpg',
  evidence: '/mock-images/stages/evidence.jpg',
  analytics: '/mock-images/stages/analytics.jpg',
  report: null, // Report doesn't have a single image, it shows the evidence image
};
