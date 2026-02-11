import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  Flag,
  ChevronLeft,
  ChevronRight,
  Maximize2 } from
'lucide-react';
interface EvidenceViewerProps {
  isOpen: boolean;
  onClose: () => void;
}
export function EvidenceViewer({ isOpen, onClose }: EvidenceViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(3);
  const [isVerified, setIsVerified] = useState(true);
  const [showFlagConfirm, setShowFlagConfirm] = useState(false);
  const totalPages = 45;
  // Deterministic mock line widths
  const lineWidths = useMemo(() => {
    const widths: number[] = [];
    for (let i = 0; i < 35; i++) {
      widths.push(60 + (i * 37 + 13) % 40);
    }
    return widths;
  }, []);
  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);
  if (!isOpen) return null;
  const handleZoomIn = () => {
    const next = Math.min(zoom + 25, 200);
    setZoom(next);
    setIsVerified(next === 100);
  };
  const handleZoomOut = () => {
    const next = Math.max(zoom - 25, 50);
    setZoom(next);
    setIsVerified(next === 100);
  };
  const handleResetZoom = () => {
    setZoom(100);
    setIsVerified(true);
  };
  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose} />


      {/* Viewer Container */}
      <div className="relative z-10 flex flex-col m-4 md:m-6 lg:m-8 bg-background rounded-xl shadow-2xl overflow-hidden flex-1 border border-border">
        {/* Toolbar */}
        <div className="h-14 border-b border-border bg-card flex items-center justify-between px-5 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Maximize2 className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono text-sm font-medium text-foreground">
                doc_1.pdf
              </span>
            </div>

            <div className="h-5 w-px bg-border" />

            {/* Page Controls */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors">

                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-muted-foreground tabular-nums min-w-[60px] text-center">
                <span className="font-medium text-foreground">
                  {currentPage}
                </span>{' '}
                / {totalPages}
              </span>
              <button
                onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage >= totalPages}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors">

                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Zoom Controls */}
            <div className="flex items-center bg-muted rounded-lg p-0.5">
              <button
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-card rounded-md text-muted-foreground hover:text-foreground transition-colors">

                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono w-12 text-center tabular-nums">
                {zoom}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-card rounded-md text-muted-foreground hover:text-foreground transition-colors">

                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Verification State */}
            {!isVerified ?
            <button
              onClick={handleResetZoom}
              className="flex items-center text-xs text-orange-600 font-medium hover:bg-orange-50 px-2.5 py-1.5 rounded-md transition-colors">

                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Reset to verify
              </button> :

            <span className="flex items-center text-xs text-success font-medium px-2.5 py-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Verified at 100%
              </span>
            }

            <div className="h-5 w-px bg-border" />

            {/* Close */}
            <button
              onClick={onClose}
              className="flex items-center text-sm text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-md hover:bg-muted transition-colors">

              <X className="w-4 h-4 mr-1.5" />
              <span className="text-xs font-medium">
                Close
                <kbd className="ml-1.5 text-[10px] text-muted-foreground bg-muted border border-border rounded px-1 py-0.5">
                  Esc
                </kbd>
              </span>
            </button>
          </div>
        </div>

        {/* Document Canvas */}
        <div className="flex-1 overflow-auto p-8 flex justify-center bg-muted/30">
          <div
            className="bg-white shadow-2xl transition-all duration-200 relative flex-shrink-0 rounded-sm"
            style={{
              width: `${8.5 * 96 * (zoom / 100)}px`,
              height: `${11 * 96 * (zoom / 100)}px`
            }}>

            {/* Mock Text Lines */}
            <div className="p-12 space-y-3.5 pointer-events-none select-none">
              {lineWidths.slice(0, 20).map((w, i) =>
              <div
                key={i}
                className="h-[3px] bg-foreground/15 rounded"
                style={{
                  width: `${w}%`
                }} />

              )}
              <div className="h-6" />
              <div className="h-5 bg-foreground/25 rounded w-2/5 mb-4" />
              {lineWidths.slice(20).map((w, i) =>
              <div
                key={i + 20}
                className="h-[3px] bg-foreground/15 rounded"
                style={{
                  width: `${w}%`
                }} />

              )}
            </div>

            {/* Highlight Overlay */}
            {isVerified &&
            <div className="absolute left-[8%] top-[28%] w-[84%] h-[100px] bg-purple-200/25 border-2 border-purple-300/50 rounded-sm cursor-pointer hover:bg-purple-200/35 transition-colors">
                <div className="absolute -top-2.5 -right-2.5 bg-purple-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                  Cited
                </div>
              </div>
            }
          </div>
        </div>

        {/* Footer */}
        <div className="bg-card border-t border-border px-5 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-5 text-xs text-muted-foreground">
            <span className="flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-success mr-1.5" />
              Loaded securely
            </span>
            <span className="font-mono">v2.1</span>
            <span>Verified Oct 15, 2023</span>
          </div>

          {!showFlagConfirm ?
          <button
            onClick={() => setShowFlagConfirm(true)}
            className="text-xs text-destructive hover:text-destructive font-medium flex items-center hover:bg-destructive/5 px-2.5 py-1.5 rounded-md transition-colors">

              <Flag className="w-3.5 h-3.5 mr-1.5" />
              Flag citation as wrong
            </button> :

          <div className="flex items-center space-x-2">
              <span className="text-xs text-destructive font-medium">
                Confirm flag?
              </span>
              <button
              onClick={() => setShowFlagConfirm(false)}
              className="text-xs px-2.5 py-1 rounded-md bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 transition-colors">

                Yes, flag
              </button>
              <button
              onClick={() => setShowFlagConfirm(false)}
              className="text-xs px-2.5 py-1 rounded-md border border-border text-muted-foreground hover:bg-muted transition-colors">

                Cancel
              </button>
            </div>
          }
        </div>
      </div>
    </div>);

}