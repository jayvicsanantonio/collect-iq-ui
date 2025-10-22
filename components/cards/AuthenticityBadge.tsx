'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

export interface AuthenticityBadgeProps {
  score: number; // 0-1
  rationale?: string | null;
  breakdown?: {
    visualHashConfidence: number | null;
    textMatchConfidence: number | null;
    holoPatternConfidence: number | null;
  };
  fakeDetected?: boolean | null;
  className?: string;
}

/**
 * AuthenticityBadge component displays a color-coded authenticity score
 * with a tooltip showing detailed breakdown.
 *
 * Color coding:
 * - Green (> 0.8): High confidence authentic
 * - Yellow (0.5-0.8): Medium confidence, needs review
 * - Red (< 0.5): Low confidence, likely fake
 *
 * Accessibility: Uses icons and patterns in addition to color
 */
export function AuthenticityBadge({
  score,
  rationale,
  breakdown,
  fakeDetected,
  className,
}: AuthenticityBadgeProps) {
  // Determine color and icon based on score
  const getScoreVariant = (score: number) => {
    if (score > 0.8) {
      return {
        color: 'bg-emerald-500 text-white border-emerald-600',
        icon: CheckCircle,
        label: 'Authentic',
        ariaLabel: 'High confidence authentic',
      };
    } else if (score >= 0.5) {
      return {
        color: 'bg-amber-500 text-black border-amber-600',
        icon: AlertCircle,
        label: 'Review',
        ariaLabel: 'Medium confidence, needs review',
      };
    } else {
      return {
        color: 'bg-red-500 text-white border-red-600',
        icon: AlertTriangle,
        label: 'Warning',
        ariaLabel: 'Low confidence, likely fake',
      };
    }
  };

  const variant = getScoreVariant(score);
  const Icon = variant.icon;
  const percentage = Math.round(score * 100);
  
  // Show warning if fake detected
  const showWarning = fakeDetected || score < 0.5;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-pill)] border-2 font-medium text-sm transition-all duration-200 hover:scale-105 cursor-help',
              variant.color,
              className
            )}
            role="status"
            aria-label={`${variant.ariaLabel}: ${percentage}% confidence`}
          >
            <Icon className="w-4 h-4" aria-hidden="true" />
            <span className="font-semibold">{percentage}%</span>
            <span className="hidden sm:inline">{variant.label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="max-w-sm sm:max-w-md lg:max-w-lg p-4 space-y-3 w-auto min-w-[280px]"
          aria-live="polite"
        >
          <div className="space-y-2">
            <div className="font-semibold text-base">
              Authenticity Score: {percentage}%
            </div>

            {breakdown && (
              <div className="space-y-2 text-sm">
                <div className="text-muted-foreground font-medium">
                  Detailed Breakdown:
                </div>

                <div className="space-y-1.5">
                  {breakdown.visualHashConfidence !== null && 
                   breakdown.visualHashConfidence !== undefined && (
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-2 whitespace-nowrap">
                        <span
                          className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"
                          aria-hidden="true"
                        />
                        Visual Hash
                      </span>
                      <span className="font-medium whitespace-nowrap">
                        {Math.round(breakdown.visualHashConfidence * 100)}%
                      </span>
                    </div>
                  )}

                  {breakdown.textMatchConfidence !== null && 
                   breakdown.textMatchConfidence !== undefined && (
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-2 whitespace-nowrap">
                        <span
                          className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0"
                          aria-hidden="true"
                        />
                        Text Match
                      </span>
                      <span className="font-medium whitespace-nowrap">
                        {Math.round(breakdown.textMatchConfidence * 100)}%
                      </span>
                    </div>
                  )}

                  {breakdown.holoPatternConfidence !== null && 
                   breakdown.holoPatternConfidence !== undefined && (
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-2 whitespace-nowrap">
                        <span
                          className="w-2 h-2 rounded-full bg-cyan-500 flex-shrink-0"
                          aria-hidden="true"
                        />
                        Holo Pattern
                      </span>
                      <span className="font-medium whitespace-nowrap">
                        {Math.round(breakdown.holoPatternConfidence * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {showWarning && (
              <div className="pt-2 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-[var(--destructive)]">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="font-medium">
                    {fakeDetected 
                      ? 'Potential counterfeit detected' 
                      : 'Low authenticity score - verify carefully'}
                  </span>
                </div>
              </div>
            )}

            {rationale && (
              <div className="pt-2 border-t border-border">
                <div className="text-xs text-muted-foreground">{rationale}</div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
