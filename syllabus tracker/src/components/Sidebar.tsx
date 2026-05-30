import React, { useState } from 'react';
import { useSyllabus } from '../context/SyllabusContext';
import type { ViewType } from '../context/SyllabusContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  RefreshCw, 
  Timer, 
  BarChart3, 
  Sun, 
  Moon, 
  Plus, 
  GraduationCap, 
  Flame
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    courses, 
    activeView, 
    setActiveView, 
    theme, 
    toggleTheme, 
    setSelectedCourseId, 
    addCourse,
    logs
  } = useSyllabus();

  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseColor, setNewCourseColor] = useState('200 95% 55%'); // Default color

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim() || !newCourseCode.trim()) return;
    addCourse(newCourseName.trim(), newCourseCode.trim(), newCourseColor);
    setNewCourseName('');
    setNewCourseCode('');
    setShowAddCourse(false);
  };

  const navItems = [
    { id: 'dashboard' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses' as ViewType, label: 'Syllabus Core', icon: BookOpen },
    { id: 'revision-queue' as ViewType, label: 'Revision Queue', icon: RefreshCw },
    { id: 'pomodoro' as ViewType, label: 'Focus Timer', icon: Timer },
    { id: 'analytics' as ViewType, label: 'Analytics', icon: BarChart3 },
  ];

  const colors = [
    '200 95% 55%', // Sky Blue
    '263 90% 66%', // Violet
    '325 90% 60%', // Pink/Magenta
    '142 70% 50%', // Emerald Green
    '38 92% 50%',  // Amber
    '350 89% 60%', // Rose
  ];

  // Calculate Streak & Study Stats
  const calculateStreak = () => {
    if (logs.length === 0) return 0;
    const dates = logs.map(l => l.timestamp.split('T')[0]);
    const uniqueSortedDates = Array.from(new Set(dates)).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    if (uniqueSortedDates[0] !== today && uniqueSortedDates[0] !== yesterday) {
      return 0;
    }
    
    let expectedDate = new Date(uniqueSortedDates[0]);
    for (let i = 0; i < uniqueSortedDates.length; i++) {
      const current = new Date(uniqueSortedDates[i]);
      const diffTime = Math.abs(expectedDate.getTime() - current.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        streak++;
        expectedDate = current;
      } else {
        break;
      }
    }
    return streak;
  };

  const totalStudyTimeToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySeconds = logs
      .filter(l => l.timestamp.startsWith(todayStr))
      .reduce((sum, l) => sum + l.durationSeconds, 0);
    return Math.round(todaySeconds / 60); // minutes
  };

  return (
    <aside className="sidebar-container glass-panel">
      <div className="sidebar-header">
        <GraduationCap className="app-logo-icon" />
        <div className="app-title-wrapper">
          <h2>Antigravity</h2>
          <span>Syllabus Tracker</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              className={`nav-button ${isActive ? 'active' : ''}`}
              onClick={() => {
                setActiveView(item.id);
                if (item.id === 'courses') {
                  setSelectedCourseId(null);
                }
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-section">
        <div className="section-header">
          <span>Active Courses</span>
          <button className="add-btn" onClick={() => setShowAddCourse(true)} title="Add New Course">
            <Plus size={14} />
          </button>
        </div>
        
        <div className="course-shortcuts">
          {courses.map(course => (
            <button
              key={course.id}
              className="course-shortcut-btn"
              onClick={() => {
                setSelectedCourseId(course.id);
                setActiveView('courses');
              }}
            >
              <span 
                className="color-dot" 
                style={{ backgroundColor: `hsl(${course.color})`, boxShadow: `0 0 8px hsl(${course.color})` }}
              />
              <span className="course-code">{course.code}</span>
              <span className="course-name">{course.name}</span>
            </button>
          ))}
          {courses.length === 0 && (
            <span className="no-courses-label">No courses added yet.</span>
          )}
        </div>
      </div>

      {/* Focus Stats Widget */}
      <div className="sidebar-widget-wrapper">
        <div className="stats-widget glass-card">
          <div className="streak-stats">
            <div className="stat-item">
              <Flame className="streak-icon" size={20} />
              <div className="stat-content">
                <span className="stat-value">{calculateStreak()} Days</span>
                <span className="stat-label">Study Streak</span>
              </div>
            </div>
            <div className="stat-item border-left">
              <Timer className="timer-icon" size={20} />
              <div className="stat-content">
                <span className="stat-value">{totalStudyTimeToday()}m</span>
                <span className="stat-label">Focus Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme Mode">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      {/* Add Course Modal */}
      {showAddCourse && (
        <div className="modal-overlay" onClick={() => setShowAddCourse(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Course</h3>
              <button className="modal-close" onClick={() => setShowAddCourse(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddCourse}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="courseName">Course Name</label>
                  <input
                    id="courseName"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Data Structures & Algorithms"
                    value={newCourseName}
                    onChange={e => setNewCourseName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="courseCode">Course Code / ID</label>
                  <input
                    id="courseCode"
                    type="text"
                    className="form-control"
                    placeholder="e.g. CS-202"
                    value={newCourseCode}
                    onChange={e => setNewCourseCode(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Select Accent Color</label>
                  <div className="color-selector">
                    {colors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`color-select-dot ${newCourseColor === color ? 'selected' : ''}`}
                        style={{ backgroundColor: `hsl(${color})` }}
                        onClick={() => setNewCourseColor(color)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddCourse(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Course</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Internal styles for Sidebar since some parameters are layout specific */}
      <style>{`
        .sidebar-container {
          width: var(--sidebar-width);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border-color);
          padding: 24px 16px;
          flex-shrink: 0;
          z-index: 10;
        }
        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
          padding: 0 8px;
        }
        .app-logo-icon {
          color: var(--primary);
          width: 32px;
          height: 32px;
        }
        .app-title-wrapper h2 {
          font-size: 1.25rem;
          color: var(--text-main);
          font-weight: 700;
          line-height: 1.1;
        }
        .app-title-wrapper span {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 24px;
        }
        .nav-button {
          display: flex;
          align-items: center;
          gap: 12px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 12px 14px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-family: var(--font-sans);
          font-weight: 600;
          font-size: 0.9rem;
          text-align: left;
          transition: all var(--transition-fast);
        }
        .nav-button:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.04);
        }
        .nav-button.active {
          color: #ffffff;
          background: var(--primary);
          box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.25);
        }
        .sidebar-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 8px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .add-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          transition: all var(--transition-fast);
        }
        .add-btn:hover {
          color: var(--primary);
          background: rgba(255, 255, 255, 0.05);
        }
        .course-shortcuts {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-height: 200px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .course-shortcut-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 8px 10px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-family: var(--font-sans);
          font-size: 0.85rem;
          text-align: left;
          transition: all var(--transition-fast);
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .course-shortcut-btn:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.04);
        }
        .color-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .course-code {
          font-weight: 700;
          color: var(--text-main);
          font-size: 0.8rem;
          flex-shrink: 0;
        }
        .course-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .no-courses-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          padding: 8px;
          font-style: italic;
        }
        .sidebar-widget-wrapper {
          margin-top: auto;
          margin-bottom: 16px;
        }
        .stats-widget {
          padding: 14px;
          background: rgba(15, 23, 42, 0.3);
        }
        .streak-stats {
          display: flex;
          justify-content: space-between;
        }
        .stat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }
        .stat-item.border-left {
          border-left: 1px solid var(--border-color);
          padding-left: 12px;
        }
        .streak-icon {
          color: var(--warning);
          filter: drop-shadow(0 0 6px rgba(var(--warning-rgb), 0.5));
        }
        .timer-icon {
          color: var(--secondary);
          filter: drop-shadow(0 0 6px rgba(var(--secondary-rgb), 0.5));
        }
        .stat-content {
          display: flex;
          flex-direction: column;
        }
        .stat-value {
          font-size: 0.9rem;
          font-weight: 700;
          font-family: var(--font-display);
          color: var(--text-main);
        }
        .stat-label {
          font-size: 0.65rem;
          color: var(--text-muted);
        }
        .sidebar-footer {
          border-top: 1px solid var(--border-color);
          padding-top: 16px;
        }
        .theme-toggle-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-family: var(--font-sans);
          font-weight: 600;
          font-size: 0.85rem;
          text-align: left;
          transition: all var(--transition-fast);
        }
        .theme-toggle-btn:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.04);
        }
        .color-selector {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }
        .color-select-dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .color-select-dot:hover {
          transform: scale(1.1);
        }
        .color-select-dot.selected {
          border-color: #ffffff;
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
        }
        @media (max-width: 1024px) {
          .sidebar-container {
            width: 100%;
            min-height: auto;
            border-right: none;
            border-bottom: 1px solid var(--border-color);
            padding: 16px;
          }
          .sidebar-header {
            margin-bottom: 16px;
          }
          .sidebar-nav {
            flex-direction: row;
            overflow-x: auto;
            margin-bottom: 16px;
          }
          .nav-button {
            padding: 8px 12px;
          }
          .sidebar-section, .sidebar-widget-wrapper, .sidebar-footer {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
};
