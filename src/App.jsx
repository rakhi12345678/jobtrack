import { useState, useRef, useCallback } from 'react';
import TopBar from './components/TopBar.jsx';
import StatsBar from './components/StatsBar.jsx';
import Board from './components/Board.jsx';
import Drawer from './components/Drawer.jsx';
import Confetti from './components/Confetti.jsx';
import Toast from './components/Toast.jsx';
import { useApplications } from './hooks/useApplications.js';

export default function App() {
  const { apps, addApp, updateApp, deleteApp } = useApplications();

  const [searchTerm, setSearchTerm] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confettiKey, setConfettiKey] = useState(null);
  const [toast, setToast] = useState({ message: '', visible: false });
  const toastTimer = useRef(null);

  const editingApp = editingId ? apps.find((a) => a.id === editingId) : null;

  const showToast = useCallback((message) => {
    clearTimeout(toastTimer.current);
    setToast({ message, visible: true });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 1800);
  }, []);

  function openNewDrawer() {
    setEditingId(null);
    setDrawerOpen(true);
  }

  function openEditDrawer(id) {
    setEditingId(id);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingId(null);
  }

  function handleSave(formData) {
    const wasOffer = editingApp?.status === 'offer';

    if (editingId) {
      updateApp(editingId, formData);
      showToast('Application updated.');
    } else {
      addApp(formData);
      showToast('Application logged.');
    }

    if (formData.status === 'offer' && !wasOffer) {
      setConfettiKey(Date.now());
      showToast('🎉 Offer logged — congratulations!');
    }

    closeDrawer();
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this application? This cannot be undone.')) return;
    deleteApp(id);
    closeDrawer();
    showToast('Application deleted.');
  }

  return (
    <div id="app">
      <div className="bg-glow bg-glow-a" />
      <div className="bg-glow bg-glow-b" />

      <TopBar searchTerm={searchTerm} onSearchChange={setSearchTerm} onAddClick={openNewDrawer} />
      <StatsBar apps={apps} />
      <Board apps={apps} searchTerm={searchTerm} onCardClick={openEditDrawer} onAddClick={openNewDrawer} />

      <Drawer
        isOpen={drawerOpen}
        app={editingApp}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={closeDrawer}
      />

      <Confetti burstKey={confettiKey} />
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
