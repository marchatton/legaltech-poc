import React, { useState } from 'react';
import { Search, Plus, MoreHorizontal, ArrowRight } from 'lucide-react';
import { Matter, Page } from '../hooks/useOrbitalState';
import { DemoHistory } from '../components/demo/DemoHistory';
interface MattersListPageProps {
  matters: Matter[];
  onNavigate: (page: Page, matterId?: string) => void;
  onCreateMatter: () => void;
  isDemoMode?: boolean;
}
export function MattersListPage({
  matters,
  onNavigate,
  onCreateMatter,
  isDemoMode = false
}: MattersListPageProps) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const filteredMatters = matters.filter(
    (m) =>
    (m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.id.toLowerCase().includes(search.toLowerCase())) && (
    !activeFilter ||
    activeFilter === 'Active' && m.status === 'Active' ||
    activeFilter === 'Needs Attention' &&
    m.status === 'Needs Attention' ||
    activeFilter === 'Demo Packs')
  );
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif font-medium text-3xl text-foreground mb-2">
            Matters
          </h1>
          <p className="text-muted-foreground">
            Manage your legal review projects.
          </p>
        </div>
        <button
          onClick={onCreateMatter}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center shadow-sm">

          <Plus className="w-4 h-4 mr-2" />
          New Matter
        </button>
      </div>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-96">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search matters by name or ID..."
                className="w-full bg-white border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 transition-all shadow-sm" />

            </div>

            <div className="flex space-x-2">
              {['Active', 'Needs Attention', 'Demo Packs'].map((filter) =>
              <button
                key={filter}
                onClick={() =>
                setActiveFilter(activeFilter === filter ? null : filter)
                }
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors shadow-sm ${activeFilter === filter ? 'bg-primary text-primary-foreground border-primary' : 'bg-white border-border text-muted-foreground hover:text-foreground hover:bg-muted'}`}>

                  {filter}
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="bg-white border border-border rounded-lg shadow-ui-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMatters.map((matter) =>
                <tr
                  key={matter.id}
                  onClick={() => onNavigate('matter-detail', matter.id)}
                  className="hover:bg-muted/30 cursor-pointer transition-colors group">

                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {matter.name}
                        </p>
                        <p className="text-xs font-mono text-muted-foreground mt-0.5">
                          {matter.id}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${matter.status === 'Active' ? 'bg-success/10 text-success border-success/20' : matter.status === 'Needs Attention' ? 'bg-orange-50 text-orange-700 border-orange-200' : matter.status === 'Complete' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : 'bg-muted text-muted-foreground border-border'}`}>

                        {matter.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full max-w-[140px]">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">
                            {matter.reviewedQuestions}/{matter.totalQuestions}
                          </span>
                          <span className="font-medium text-foreground">
                            {matter.progress}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                          className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${matter.progress}%`
                          }} />

                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        {matter.createdAt}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted transition-colors opacity-0 group-hover:opacity-100">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Demo History Sidebar */}
        {isDemoMode &&
        <div className="w-72 flex-shrink-0">
            <DemoHistory />
          </div>
        }
      </div>
    </div>);

}