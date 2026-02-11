import React from 'react';
import { Clock, CheckCircle2, RotateCcw } from 'lucide-react';
interface OperatorChecklistProps {
  onReset: () => void;
}
export function OperatorChecklist({ onReset }: OperatorChecklistProps) {
  return (
    <div className="bg-white border border-border rounded-lg shadow-ui-sm overflow-hidden mb-6">
      <div className="bg-orange-50 px-4 py-2 border-b border-orange-100 flex items-center justify-between">
        <span className="text-xs font-bold text-orange-800 uppercase tracking-wide">
          Fixture Context
        </span>
        <span className="text-xs text-orange-700 font-mono">pack_01_clean</span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Demo Sequence
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Follow these steps to demonstrate the flow.
            </p>
          </div>
          <div className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            <Clock className="w-3 h-3 mr-1.5" />
            02:14 elapsed
          </div>
        </div>

        <div className="space-y-2">
          {[
          {
            label: 'Matter Ingested',
            done: true
          },
          {
            label: 'Report Generated',
            done: true
          },
          {
            label: 'Review 3 Rows',
            done: false
          },
          {
            label: 'Verify Evidence',
            done: false
          },
          {
            label: 'Export Results',
            done: false
          }].
          map((step, i) =>
          <div key={i} className="flex items-center text-sm">
              <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${step.done ? 'bg-success-100 border-success-200 text-success-600' : 'border-border text-transparent'}`}>

                <CheckCircle2 className="w-3 h-3" />
              </div>
              <span
              className={
              step.done ?
              'text-foreground line-through opacity-50' :
              'text-foreground'
              }>

                {step.label}
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center px-3 py-2 border border-border rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">

            <RotateCcw className="w-3.5 h-3.5 mr-2" />
            Load Pack Again
          </button>
        </div>
      </div>
    </div>);

}