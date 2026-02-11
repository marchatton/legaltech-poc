import React from 'react';
import { FileText, Download, AlertTriangle, Clock } from 'lucide-react';
import { Artefact } from '../../hooks/useOrbitalState';
interface ArtefactsTabProps {
  artefacts: Artefact[];
}
export function ArtefactsTab({ artefacts }: ArtefactsTabProps) {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-serif font-medium text-2xl text-foreground mb-2">
            Artefacts
          </h2>
          <p className="text-muted-foreground">
            Download previously generated files.
          </p>
        </div>

        {/* Kind Filter */}
        <div className="flex space-x-2">
          {['All', 'CSV', 'DOCX', 'Unsafe'].map((filter, i) =>
          <button
            key={filter}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${i === 0 ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-white border-border text-muted-foreground hover:text-foreground hover:bg-purple-50 hover:border-purple-200'}`}>

              {filter}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-border rounded-lg shadow-ui-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-purple-50/50 border-b border-purple-100">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-purple-700 uppercase tracking-wider">
                Filename
              </th>
              <th className="px-6 py-3 text-xs font-medium text-purple-700 uppercase tracking-wider">
                Kind
              </th>
              <th className="px-6 py-3 text-xs font-medium text-purple-700 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-xs font-medium text-purple-700 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-xs font-medium text-purple-700 uppercase tracking-wider text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {artefacts.map((art) =>
            <tr key={art.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-muted-foreground mr-3" />
                    <span className="text-sm font-medium text-foreground">
                      {art.filename}
                    </span>
                    {art.isUnsafe &&
                  <span
                    className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-destructive-100 text-destructive-800 uppercase tracking-wide cursor-help"
                    title="This artefact was generated with safety checks disabled.">

                        Unsafe
                      </span>
                  }
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-mono text-muted-foreground uppercase">
                    {art.kind}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                    {art.createdAt}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-mono bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded text-purple-700">
                    {art.sourceRunId}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors">
                    <Download className="w-4 h-4 mr-1.5" />
                    Download
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>);

}