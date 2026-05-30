import { SyllabusProvider, useSyllabus } from './context/SyllabusContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Courses } from './components/Courses';
import { RevisionQueue } from './components/RevisionQueue';
import { PomodoroTimer } from './components/PomodoroTimer';
import { Analytics } from './components/Analytics';

function MainApp() {
  const { activeView } = useSyllabus();

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'courses':
        return <Courses />;
      case 'revision-queue':
        return <RevisionQueue />;
      case 'pomodoro':
        return <PomodoroTimer />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content-area">
        {renderView()}
      </main>
      <style>{`
        .main-content-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          overflow: hidden;
          position: relative;
        }
      `}</style>
    </div>
  );
}

function App() {
  return (
    <SyllabusProvider>
      <MainApp />
    </SyllabusProvider>
  );
}

export default App;
