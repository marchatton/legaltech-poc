import React from 'react';
import { X, ExternalLink, Copy, Check, AlertCircle } from 'lucide-react';
import { ReportRow } from '../../hooks/useOrbitalState';
import { StatusChip } from '../ui/StatusChip';
interface RowDrawerProps {
  isOpen: boolean;
  row: ReportRow | null;
  onClose: () => void;
  onOpenEvidence: (citationId: string, page: number) => void;
}
export function RowDrawer({
  isOpen,
  row,
  onClose,
  onOpenEvidence
}: RowDrawerProps) {
  if (!isOpen || !row) return null;
  return (
    <div className="absolute inset-y-0 right-0 w-[500px] max-w-full bg-background border-l border-border shadow-ui-lg transform transition-transform duration-300 ease-in-out z-20 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-start justify-between bg-muted/30">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-mono text-xs text-muted-foreground bg-white border border-border px-1.5 py-0.5 rounded">
              {row.id}
            </span>
            <StatusChip status={row.status} />
          </div>
          <h2 className="font-serif font-medium text-lg text-foreground leading-tight">
            {row.question}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors">

          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Answer Section */}
        <section>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Extracted Answer
          </h3>
          <div className="bg-white border border-border rounded-lg p-4 shadow-ui-sm">
            <p className="text-foreground text-sm leading-relaxed">
              {row.answer}
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-center text-xs text-muted-foreground">
                <span className="font-medium mr-1">Confidence:</span>
                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden mr-2">
                  <div
                    className={`h-full rounded-full ${row.confidence > 0.8 ? 'bg-success-500' : row.confidence > 0.5 ? 'bg-warning-500' : 'bg-destructive-500'}`}
                    style={{
                      width: `${row.confidence * 100}%`
                    }} />

                </div>
                {Math.round(row.confidence * 100)}%
              </div>
              <button className="text-xs text-primary hover:text-primary-600 font-medium flex items-center">
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </button>
            </div>
          </div>
        </section>

        {/* Evidence Section */}
        <section>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Evidence & Citations
          </h3>

          {row.citationId ?
          <div className="space-y-3">
              <div
              onClick={() =>
              row.citationId &&
              row.citationPage &&
              onOpenEvidence(row.citationId, row.citationPage)
              }
              className="group flex items-start p-3 bg-purple-50/60 border border-purple-200 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors">

                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className="text-xs font-bold text-purple-800 bg-white px-1.5 py-0.5 rounded border border-purple-200 mr-2">
                      Page {row.citationPage}
                    </span>
                    <span className="text-xs text-purple-600 font-mono">
                      {row.citationId}.pdf
                    </span>
                  </div>
                  <p className="text-xs text-purple-700 line-clamp-2 italic opacity-90">
                    "...{row.answer.substring(0, 80)}..."
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-purple-400 group-hover:text-purple-600 mt-0.5" />
              </div>
            </div> :

          <div className="bg-destructive-50 border border-destructive-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-4 h-4 text-destructive-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive-800">
                  No citation found
                </p>
                <p className="text-xs text-destructive-700 mt-1">
                  The model generated an answer but could not pinpoint the exact
                  source text.
                </p>
              </div>
            </div>
          }
        </section>

        {/* Metadata Section */}
        <section>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Metadata
          </h3>
          <div className="bg-cyan-50/50 border border-cyan-100 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-cyan-700">Schema Field</span>
              <span className="font-mono text-foreground">
                contract_effective_date
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-cyan-700">Data Type</span>
              <span className="font-mono text-foreground">date (ISO 8601)</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-cyan-700">Extraction Model</span>
              <span className="font-mono text-foreground">
                orbital-v4-legal
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border bg-background flex space-x-3">
        <button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center shadow-sm">
          <Check className="w-4 h-4 mr-2" />
          Mark Reviewed
        </button>
        <button className="flex-1 bg-white border border-border text-foreground hover:bg-muted px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">
          Flag Issue
        </button>
      </div>
    </div>);

}