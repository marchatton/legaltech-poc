import React from 'react';
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileType,
  AlertTriangle,
  ArrowRight } from
'lucide-react';
export function ExportsTab() {
  const hasFailedCitations = true;
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h2 className="font-serif font-semibold text-2xl text-foreground mb-2">
          Exports
        </h2>
        <p className="text-muted-foreground">
          Generate and download reports for this matter.
        </p>
      </div>

      {/* Run Selector */}
      <div className="bg-card border border-border rounded-lg p-5 shadow-ui-sm mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          Source Run
        </label>
        <select className="w-full max-w-md bg-muted/30 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400">
          <option>Run #882 (Latest) — Oct 15, 2023</option>
          <option>Run #881 — Oct 12, 2023</option>
        </select>
      </div>

      {/* Blocked Banner */}
      {hasFailedCitations &&
      <div className="mb-6 bg-destructive/5 border border-destructive/20 rounded-lg p-4 flex items-start">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-semibold text-destructive">
              Export Blocked
            </h3>
            <p className="mt-1 text-sm text-destructive/80">
              3 rows have failed citations. Review or resolve them before
              exporting.
            </p>
            <button className="mt-2 inline-flex items-center text-sm font-medium text-destructive hover:underline">
              Review failed rows
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>
      }

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
        {
          label: 'Summary CSV',
          icon: FileSpreadsheet,
          desc: 'Key findings with confidence scores.'
        },
        {
          label: 'Detail CSV',
          icon: FileSpreadsheet,
          desc: 'All rows including metadata and citations.'
        },
        {
          label: 'Citations CSV',
          icon: FileSpreadsheet,
          desc: 'Citation references with page numbers.'
        },
        {
          label: 'Full Report (DOCX)',
          icon: FileType,
          desc: 'Formatted document for client presentation.'
        }].
        map((opt, i) =>
        <div
          key={i}
          className={`border rounded-lg p-5 flex flex-col transition-all ${hasFailedCitations ? 'bg-muted/20 border-border opacity-60' : 'bg-card border-border hover:border-primary/30 hover:shadow-ui-md cursor-pointer'}`}>

            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-purple-50 rounded-lg border border-purple-100">
                <opt.icon className="w-5 h-5 text-purple-600" />
              </div>
              {hasFailedCitations &&
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  Locked
                </span>
            }
            </div>
            <h3 className="font-serif font-medium text-foreground mb-1">
              {opt.label}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 flex-1">
              {opt.desc}
            </p>
            <button
            disabled={hasFailedCitations}
            className="w-full flex items-center justify-center px-4 py-2 bg-card border border-border rounded-md text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors">

              <Download className="w-4 h-4 mr-2" />
              Generate
            </button>
          </div>
        )}
      </div>
    </div>);

}