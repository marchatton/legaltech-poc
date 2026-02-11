import React from 'react';
import { useOrbitalState } from './hooks/useOrbitalState';
import { GlobalShell } from './components/shell/GlobalShell';
import { DemoToolbar } from './components/demo/DemoToolbar';
import { MattersListPage } from './pages/MattersListPage';
import { NewMatterPage } from './pages/NewMatterPage';
import { MatterDetailPage } from './pages/MatterDetailPage';
export function App() {
  const state = useOrbitalState();
  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans">
      {state.isDemoMode &&
      <DemoToolbar
        onLoadPack={() => state.createMatter('Demo Matter (Pack 01)')} />

      }

      <GlobalShell
        currentPage={state.currentPage}
        selectedMatter={state.selectedMatter}
        onNavigate={state.navigateTo}
        isDemoMode={state.isDemoMode}>

        {state.currentPage === 'matters' &&
        <MattersListPage
          matters={state.matters}
          onNavigate={state.navigateTo}
          onCreateMatter={() => state.navigateTo('new-matter')}
          isDemoMode={state.isDemoMode} />

        }

        {state.currentPage === 'new-matter' &&
        <NewMatterPage
          onCreate={state.createMatter}
          onNavigate={state.navigateTo} />

        }

        {state.currentPage === 'matter-detail' && state.selectedMatter &&
        <MatterDetailPage
          matter={state.selectedMatter}
          rows={state.rows}
          artefacts={state.artefacts}
          chatMessages={state.chatMessages}
          activeTab={state.activeTab}
          onTabChange={state.setActiveTab}
          selectedRow={state.selectedRow}
          isDrawerOpen={state.isDrawerOpen}
          isEvidenceOpen={state.isEvidenceOpen}
          onOpenRow={state.openRowDrawer}
          onCloseDrawer={state.closeDrawer}
          onOpenEvidence={state.openEvidence}
          onCloseEvidence={state.closeEvidence}
          onChatMessage={state.addChatMessage}
          isDemoMode={state.isDemoMode} />

        }
      </GlobalShell>
    </div>);

}