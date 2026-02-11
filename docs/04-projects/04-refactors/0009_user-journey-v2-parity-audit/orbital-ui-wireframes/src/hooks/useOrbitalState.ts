import { useState, useEffect } from 'react';

// --- Types ---

export type Page = 'matters' | 'new-matter' | 'matter-detail';

export type MatterStatus =
'Active' |
'Needs Attention' |
'Complete' |
'In Progress' |
'Ingesting';

export type RowStatus =
'needs_review' |
'reviewed' |
'missing_input' |
'citation_failed';

export type ArtefactKind = 'csv' | 'docx' | 'unsafe';

export interface Matter {
  id: string;
  name: string;
  status: MatterStatus;
  createdAt: string;
  progress: number;
  totalQuestions: number;
  reviewedQuestions: number;
  environment: 'demo-dev' | 'demo-prod';
}

export interface ReportRow {
  id: string;
  question: string;
  answer: string;
  status: RowStatus;
  citationId?: string;
  citationPage?: number;
  confidence: number;
}

export interface Artefact {
  id: string;
  filename: string;
  kind: ArtefactKind;
  createdAt: string;
  sourceRunId: string;
  isUnsafe: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: {id: string;page: number;label: string;}[];
  isStreaming?: boolean;
}

// --- Mock Data ---

const MOCK_MATTERS: Matter[] = [
{
  id: 'mat_8f92k1',
  name: 'Acme Corp v. GlobalTech Industries',
  status: 'Active',
  createdAt: '2023-10-15',
  progress: 45,
  totalQuestions: 12,
  reviewedQuestions: 5,
  environment: 'demo-dev'
},
{
  id: 'mat_3j29x8',
  name: 'Estate of Margaret Chen',
  status: 'Needs Attention',
  createdAt: '2023-10-12',
  progress: 80,
  totalQuestions: 20,
  reviewedQuestions: 16,
  environment: 'demo-dev'
},
{
  id: 'mat_7p44m2',
  name: 'Meridian Holdings Compliance Review',
  status: 'In Progress',
  createdAt: '2023-10-10',
  progress: 15,
  totalQuestions: 50,
  reviewedQuestions: 7,
  environment: 'demo-dev'
},
{
  id: 'mat_9k11z5',
  name: 'Pacific Northwest Environmental Assessment',
  status: 'Complete',
  createdAt: '2023-09-28',
  progress: 100,
  totalQuestions: 35,
  reviewedQuestions: 35,
  environment: 'demo-dev'
},
{
  id: 'mat_2b66q9',
  name: 'Davidson Family Trust Restructuring',
  status: 'Active',
  createdAt: '2023-11-01',
  progress: 0,
  totalQuestions: 8,
  reviewedQuestions: 0,
  environment: 'demo-dev'
}];


const MOCK_ROWS: ReportRow[] = [
{
  id: 'row_1',
  question: 'What is the effective date of the agreement?',
  answer: 'The effective date is defined as January 1, 2024.',
  status: 'reviewed',
  citationId: 'doc_1',
  citationPage: 3,
  confidence: 0.98
},
{
  id: 'row_2',
  question: 'Identify all parties to the contract.',
  answer: 'Acme Corp (Buyer) and GlobalTech Industries (Seller).',
  status: 'reviewed',
  citationId: 'doc_1',
  citationPage: 1,
  confidence: 0.99
},
{
  id: 'row_3',
  question: 'What are the termination provisions?',
  answer: 'Either party may terminate with 30 days written notice for cause.',
  status: 'needs_review',
  citationId: 'doc_1',
  citationPage: 15,
  confidence: 0.85
},
{
  id: 'row_4',
  question: 'List all indemnification clauses.',
  answer: 'Section 12.1 covers indemnification for IP infringement.',
  status: 'citation_failed',
  citationId: 'doc_1',
  citationPage: 12,
  confidence: 0.6
},
{
  id: 'row_5',
  question: 'What is the governing law jurisdiction?',
  answer: 'State of Delaware.',
  status: 'missing_input',
  confidence: 0.4
},
{
  id: 'row_6',
  question: 'Are there any non-compete clauses?',
  answer: 'Yes, Section 8 contains a 2-year non-compete clause.',
  status: 'needs_review',
  citationId: 'doc_1',
  citationPage: 8,
  confidence: 0.92
},
{
  id: 'row_7',
  question: 'What is the payment schedule?',
  answer: 'Net 30 days from invoice receipt.',
  status: 'reviewed',
  citationId: 'doc_1',
  citationPage: 5,
  confidence: 0.95
},
{
  id: 'row_8',
  question: 'Is arbitration mandatory?',
  answer: 'Yes, binding arbitration in New York City.',
  status: 'needs_review',
  citationId: 'doc_1',
  citationPage: 18,
  confidence: 0.88
}];


const MOCK_ARTEFACTS: Artefact[] = [
{
  id: 'art_1',
  filename: 'export_full_20231015.csv',
  kind: 'csv',
  createdAt: '2023-10-15 14:30',
  sourceRunId: 'run_882',
  isUnsafe: false
},
{
  id: 'art_2',
  filename: 'report_summary.docx',
  kind: 'docx',
  createdAt: '2023-10-15 14:32',
  sourceRunId: 'run_882',
  isUnsafe: false
},
{
  id: 'art_3',
  filename: 'raw_extraction_unsafe.csv',
  kind: 'unsafe',
  createdAt: '2023-10-15 14:28',
  sourceRunId: 'run_882',
  isUnsafe: true
}];


const MOCK_CHAT: ChatMessage[] = [
{
  id: 'msg_1',
  role: 'user',
  content: 'Does this contract mention force majeure?'
},
{
  id: 'msg_2',
  role: 'assistant',
  content:
  'Yes, Section 14.2 contains a Force Majeure clause that excuses performance for "acts of God, war, or government regulation" for up to 60 days.',
  sources: [{ id: 'doc_1', page: 14, label: 'Section 14.2' }]
}];


// --- Hook ---

export function useOrbitalState() {
  // Navigation State
  const [currentPage, setCurrentPage] = useState<Page>('matters');
  const [selectedMatterId, setSelectedMatterId] = useState<string | null>(null);

  // Data State
  const [matters, setMatters] = useState<Matter[]>(MOCK_MATTERS);
  const [rows, setRows] = useState<ReportRow[]>(MOCK_ROWS);
  const [artefacts, setArtefacts] = useState<Artefact[]>(MOCK_ARTEFACTS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(MOCK_CHAT);

  // UI State
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('report');

  // Computed
  const selectedMatter = matters.find((m) => m.id === selectedMatterId) || null;
  const selectedRow = rows.find((r) => r.id === selectedRowId) || null;

  // Actions
  const navigateTo = (page: Page, matterId?: string) => {
    setCurrentPage(page);
    if (matterId) {
      setSelectedMatterId(matterId);
      // Reset UI state when entering a matter
      setActiveTab('report');
      setIsDrawerOpen(false);
      setIsEvidenceOpen(false);
      setSelectedRowId(null);
    }
  };

  const openRowDrawer = (rowId: string) => {
    setSelectedRowId(rowId);
    setIsDrawerOpen(true);
    // If we open a row, we might want to close evidence initially or keep it open if it was
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    // Keep row selected but close drawer UI
  };

  const openEvidence = (citationId: string, page: number) => {
    setIsEvidenceOpen(true);
    // In a real app, we'd load the specific doc/page
  };

  const closeEvidence = () => {
    setIsEvidenceOpen(false);
  };

  const toggleDemoMode = () => {
    setIsDemoMode(!isDemoMode);
  };

  const createMatter = (name: string) => {
    const newMatter: Matter = {
      id: `mat_${Math.random().toString(36).substr(2, 6)}`,
      name,
      status: 'Ingesting',
      createdAt: new Date().toISOString().split('T')[0],
      progress: 0,
      totalQuestions: 0,
      reviewedQuestions: 0,
      environment: 'demo-dev'
    };
    setMatters([newMatter, ...matters]);
    navigateTo('matter-detail', newMatter.id);
  };

  const addChatMessage = (content: string) => {
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content
    };
    setChatMessages([...chatMessages, newMsg]);

    // Simulate streaming response
    setTimeout(() => {
      const responseMsg: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: 'Generating response...',
        isStreaming: true
      };
      setChatMessages((prev) => [...prev, responseMsg]);

      setTimeout(() => {
        setChatMessages((prev) =>
        prev.map((msg) =>
        msg.id === responseMsg.id ?
        {
          ...msg,
          content:
          'This is a simulated response based on the document context. In a real application, this would stream from the LLM.',
          isStreaming: false,
          sources: [{ id: 'doc_1', page: 1, label: 'Page 1' }]
        } :
        msg
        )
        );
      }, 1500);
    }, 600);
  };

  return {
    // State
    currentPage,
    selectedMatter,
    matters,
    rows,
    artefacts,
    chatMessages,
    isDemoMode,
    selectedRow,
    isDrawerOpen,
    isEvidenceOpen,
    activeTab,

    // Actions
    navigateTo,
    setActiveTab,
    openRowDrawer,
    closeDrawer,
    openEvidence,
    closeEvidence,
    toggleDemoMode,
    createMatter,
    addChatMessage
  };
}