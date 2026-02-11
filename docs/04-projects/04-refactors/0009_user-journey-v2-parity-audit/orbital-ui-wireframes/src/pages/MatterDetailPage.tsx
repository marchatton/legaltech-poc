import React from 'react';
import {
  Play,
  FileText,
  MessageSquare,
  Download,
  FolderOpen,
  Archive,
  Zap } from
'lucide-react';
import {
  Matter,
  ReportRow,
  Artefact,
  ChatMessage } from
'../hooks/useOrbitalState';
import { ReportTab } from '../components/matter/ReportTab';
import { RowDrawer } from '../components/matter/RowDrawer';
import { EvidenceViewer } from '../components/matter/EvidenceViewer';
import { ChatTab } from '../components/matter/ChatTab';
import { ExportsTab } from '../components/matter/ExportsTab';
import { ArtefactsTab } from '../components/matter/ArtefactsTab';
import { OperatorChecklist } from '../components/demo/OperatorChecklist';
interface MatterDetailPageProps {
  matter: Matter;
  rows: ReportRow[];
  artefacts: Artefact[];
  chatMessages: ChatMessage[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  selectedRow: ReportRow | null;
  isDrawerOpen: boolean;
  isEvidenceOpen: boolean;
  onOpenRow: (rowId: string) => void;
  onCloseDrawer: () => void;
  onOpenEvidence: (citationId: string, page: number) => void;
  onCloseEvidence: () => void;
  onChatMessage: (content: string) => void;
  isDemoMode: boolean;
}
export function MatterDetailPage({
  matter,
  rows,
  artefacts,
  chatMessages,
  activeTab,
  onTabChange,
  selectedRow,
  isDrawerOpen,
  isEvidenceOpen,
  onOpenRow,
  onCloseDrawer,
  onOpenEvidence,
  onCloseEvidence,
  onChatMessage,
  isDemoMode
}: MatterDetailPageProps) {
  const needsReview = rows.filter((r) => r.status === 'needs_review').length;
  const citationFailed = rows.filter(
    (r) => r.status === 'citation_failed'
  ).length;
  const tabs = [
  {
    id: 'report',
    label: 'Report',
    icon: FileText,
    count: rows.length,
    alert: needsReview + citationFailed > 0
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FolderOpen,
    count: 3
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: MessageSquare,
    count: chatMessages.length
  },
  {
    id: 'artefacts',
    label: 'Artefacts',
    icon: Archive,
    count: artefacts.length
  },
  {
    id: 'exports',
    label: 'Exports',
    icon: Download
  }];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-3 min-w-0">
            <h1 className="font-serif font-semibold text-2xl text-foreground truncate">
              {matter.name}
            </h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${matter.status === 'Active' ? 'bg-success/10 text-success border-success/20' : matter.status === 'Needs Attention' ? 'bg-orange-50 text-orange-700 border-orange-200' : matter.status === 'Complete' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : 'bg-muted text-muted-foreground border-border'}`}>

              {matter.status}
            </span>
          </div>

          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Progress with label */}
            <div className="flex items-center space-x-3 bg-cyan-50 rounded-lg px-3 py-2 border border-cyan-100">
              <Zap className="w-4 h-4 text-cyan-600 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-cyan-900">
                  {matter.reviewedQuestions}/{matter.totalQuestions} questions
                </span>
                <div className="w-28 h-1.5 bg-cyan-100 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${matter.progress}%`
                    }} />

                </div>
              </div>
            </div>

            <button
              disabled={matter.progress === 100}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">

              <Play className="w-4 h-4 mr-2" />
              Quick Start
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 -mb-px">
          {tabs.map((tab) =>
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}>

              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
              {tab.count !== undefined &&
            <span
              className={`ml-2 text-[11px] px-1.5 py-0.5 rounded-full font-medium ${activeTab === tab.id ? 'bg-cyan-100 text-cyan-700' : 'bg-muted text-muted-foreground'}`}>

                  {tab.count}
                </span>
            }
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative flex">
        {/* Main Panel */}
        <div className="relative flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            {isDemoMode && activeTab === 'report' &&
            <OperatorChecklist onReset={() => {}} />
            }

            {activeTab === 'report' &&
            <ReportTab rows={rows} onOpenRow={onOpenRow} />
            }

            {activeTab === 'chat' &&
            <ChatTab
              messages={chatMessages}
              onSendMessage={onChatMessage}
              onOpenSource={onOpenEvidence} />

            }

            {activeTab === 'exports' && <ExportsTab />}

            {activeTab === 'artefacts' &&
            <ArtefactsTab artefacts={artefacts} />
            }

            {activeTab === 'documents' &&
            <div className="flex flex-col items-center justify-center h-full text-center p-12">
                <div className="w-16 h-16 bg-cyan-50 rounded-2xl flex items-center justify-center mb-5">
                  <FolderOpen className="w-8 h-8 text-cyan-500" />
                </div>
                <h3 className="font-serif font-medium text-lg text-foreground mb-2">
                  Document Library
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Browse and manage source documents for this matter. Documents
                  are indexed automatically after upload.
                </p>
                <div className="mt-6 flex items-center space-x-3">
                  <div className="flex items-center text-xs text-cyan-700 bg-cyan-50 px-3 py-1.5 rounded-full">
                    <FileText className="w-3.5 h-3.5 mr-1.5" />3 documents
                    indexed
                  </div>
                  <div className="flex items-center text-xs text-success font-medium bg-success/10 px-3 py-1.5 rounded-full">
                    All ready
                  </div>
                </div>
              </div>
            }
          </div>

          {/* Row Drawer (Overlay) — scoped inside main panel */}
          <RowDrawer
            isOpen={isDrawerOpen}
            row={selectedRow}
            onClose={onCloseDrawer}
            onOpenEvidence={onOpenEvidence} />

        </div>
      </div>

      {/* Evidence Viewer (Full-screen overlay) */}
      <EvidenceViewer isOpen={isEvidenceOpen} onClose={onCloseEvidence} />
    </div>);

}