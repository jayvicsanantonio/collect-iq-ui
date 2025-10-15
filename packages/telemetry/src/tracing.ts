/**
 * AWS X-Ray tracing utilities
 * Provides instrumentation for AWS SDK calls and custom subsegments
 *
 * Requirements: 9.4
 */

import { logger } from './logger.js';

/**
 * X-Ray subsegment interface
 * Note: In production, this would use aws-xray-sdk-core
 * For now, we provide a lightweight wrapper that can be enhanced
 */
interface Subsegment {
  name: string;
  startTime: number;
  annotations?: Record<string, string | number | boolean>;
  metadata?: Record<string, unknown>;
}

class TracingService {
  private enabled: boolean;
  private activeSubsegments: Map<string, Subsegment>;

  constructor() {
    this.enabled = process.env.XRAY_ENABLED !== 'false';
    this.activeSubsegments = new Map();
  }

  /**
   * Start a custom subsegment for business logic tracing
   */
  startSubsegment(name: string, annotations?: Record<string, string | number | boolean>): string {
    if (!this.enabled) {
      return name;
    }

    const subsegment: Subsegment = {
      name,
      startTime: Date.now(),
      annotations,
    };

    this.activeSubsegments.set(name, subsegment);

    logger.debug('X-Ray subsegment started', {
      operation: 'xray_subsegment_start',
      subsegmentName: name,
      annotations,
    });

    return name;
  }

  /**
   * End a custom subsegment
   */
  endSubsegment(name: string, metadata?: Record<string, unknown>): void {
    if (!this.enabled) {
      return;
    }

    const subsegment = this.activeSubsegments.get(name);
    if (!subsegment) {
      logger.warn('Attempted to end non-existent subsegment', {
        operation: 'xray_subsegment_end',
        subsegmentName: name,
      });
      return;
    }

    const duration = Date.now() - subsegment.startTime;

    logger.debug('X-Ray subsegment ended', {
      operation: 'xray_subsegment_end',
      subsegmentName: name,
      durationMs: duration,
      annotations: subsegment.annotations,
      metadata,
    });

    this.activeSubsegments.delete(name);
  }

  /**
   * Add annotation to current segment
   * Annotations are indexed and searchable in X-Ray console
   */
  addAnnotation(key: string, value: string | number | boolean): void {
    if (!this.enabled) {
      return;
    }

    logger.debug('X-Ray annotation added', {
      operation: 'xray_annotation',
      key,
      value,
    });
  }

  /**
   * Add metadata to current segment
   * Metadata is not indexed but provides additional context
   */
  addMetadata(key: string, value: unknown): void {
    if (!this.enabled) {
      return;
    }

    logger.debug('X-Ray metadata added', {
      operation: 'xray_metadata',
      key,
      valueType: typeof value,
    });
  }

  /**
   * Wrap an async function with X-Ray tracing
   */
  async trace<T>(
    name: string,
    fn: () => Promise<T>,
    annotations?: Record<string, string | number | boolean>,
  ): Promise<T> {
    const subsegmentId = this.startSubsegment(name, annotations);

    try {
      const result = await fn();
      this.endSubsegment(subsegmentId, { success: true });
      return result;
    } catch (error) {
      this.endSubsegment(subsegmentId, {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Wrap a synchronous function with X-Ray tracing
   */
  traceSync<T>(
    name: string,
    fn: () => T,
    annotations?: Record<string, string | number | boolean>,
  ): T {
    const subsegmentId = this.startSubsegment(name, annotations);

    try {
      const result = fn();
      this.endSubsegment(subsegmentId, { success: true });
      return result;
    } catch (error) {
      this.endSubsegment(subsegmentId, {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Check if tracing is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Export singleton instance
export const tracing = new TracingService();

/**
 * Decorator for tracing async methods
 * Usage: @traced('operationName')
 */
export function traced(name: string, annotations?: Record<string, string | number | boolean>) {
  return function (_target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      return tracing.trace(
        name || propertyKey,
        () => originalMethod.apply(this, args),
        annotations,
      );
    };

    return descriptor;
  };
}
