import React, { useState } from 'react';
import { ReportRow, RowStatus } from '../../hooks/useOrbitalState';
import { StatusChip } from '../ui/StatusChip';
import { ChevronRight, Filter } from 'lucide-react';
interface ReportTabProps {
  rows: ReportRow[];
  onOpenRow: (rowId: string) => void;
}
export function ReportTab({ rows, onOpenRow }: ReportTabProps) {
  const tabs = [
  {
    id: 'all',
    label: 'All',
    count: rows.length
  },
  {
    id: 'needs_review',
    label: 'Needs Review',
    count: rows.filter((r) => r.status === 'needs_review').length
  },
  {
    id: 'citation_failed',
    label: 'Citation Failed',
    count: rows.filter((r) => r.status === 'citation_failed').length
  },
  {
    id: 'missing_input',
    label: 'Missing Input',
    count: rows.filter((r) => r.status === 'missing_input').length
  }];

  const [activeTab, setActiveTab] = useState('all');
  const filteredRows =
  activeTab === 'all' ? rows : rows.filter((r) => r.status === activeTab);
  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="flex items-center space-x-1 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) =>
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-white border border-border text-muted-foreground hover:bg-muted hover:text-foreground'}`}>

            {tab.label}
            <span
            className={`ml-2 text-xs py-0.5 px-1.5 rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-muted'}`}>

              {tab.count}
            </span>
          </button>
        )}
        <div className="w-px h-6 bg-border mx-2"></div>
        <button className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-muted">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-lg shadow-ui-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-cyan-50/60 sticky top-0 z-10 border-b border-cyan-100">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-cyan-700 uppercase tracking-wider w-16">
                  ID
                </th>
                <th className="px-6 py-3 text-xs font-medium text-cyan-700 uppercase tracking-wider w-1/3">
                  Question
                </th>
                <th className="px-6 py-3 text-xs font-medium text-cyan-700 uppercase tracking-wider">
                  Answer Preview
                </th>
                <th className="px-6 py-3 text-xs font-medium text-cyan-700 uppercase tracking-wider w-32">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-medium text-cyan-700 uppercase tracking-wider w-24">
                  Conf.
                </th>
                <th className="px-6 py-3 text-xs font-medium text-cyan-700 uppercase tracking-wider w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRows.map((row) =>
              <tr
                key={row.id}
                onClick={() => onOpenRow(row.id)}
                className="hover:bg-cyan-50/40 cursor-pointer transition-colors group">

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs text-muted-foreground">
                      {row.id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-foreground line-clamp-2">
                      {row.question}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {row.answer || '—'}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusChip status={row.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden mr-2">
                        <div
                        className={`h-full rounded-full ${row.confidence > 0.8 ? 'bg-success-500' : row.confidence > 0.5 ? 'bg-warning-500' : 'bg-destructive-500'}`}
                        style={{
                          width: `${row.confidence * 100}%`
                        }} />

                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>);

}