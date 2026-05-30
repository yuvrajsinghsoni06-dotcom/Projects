import React, { useState } from 'react';
import { useSyllabus } from '../context/SyllabusContext';
import type { Course, Module, Topic } from '../context/SyllabusContext';
import { 
  RefreshCw, 
  Search, 
  SlidersHorizontal, 
  Calendar,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface QueueItem {
  course: Course;
  module: Module;
  topic: Topic;
  dueDate: Date | null;
  daysDifference: number; // relative to now
}

export const RevisionQueue: React.FC = () => {
  const { courses, recordRevision } = useSyllabus();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'due' | 'all'>('due');

  // Compile all topics that have been started or completed
  const getQueueItems = (): QueueItem[] => {
    const list: QueueItem[] = [];
    const now = new Date();

    courses.forEach(course => {
      course.modules.forEach(module => {
        module.topics.forEach(topic => {
          // Only show topics that have been started or completed (active study)
          if (topic.status !== 'not-started') {
            let dueDate: Date | null = null;
            let daysDifference = 0;

            if (topic.nextRevisionDue) {
              dueDate = new Date(topic.nextRevisionDue);
              const diffTime = dueDate.getTime() - now.getTime();
              daysDifference = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }

            list.push({
              course,
              module,
              topic,
              dueDate,
              daysDifference
            });
          }
        });
      });
    });

    return list;
  };

  const allItems = getQueueItems();

  // Filter items
  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.course.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCourse = selectedCourseFilter === 'all' || item.course.id === selectedCourseFilter;
    
    const matchesTab = activeTab === 'due'
      ? (item.dueDate === null || item.daysDifference <= 0) // Overdue, due today, or never revised
      : true; // All scheduled items

    return matchesSearch && matchesCourse && matchesTab;
  });

  // Sort: Overdue items first (most negative daysDifference first), then never revised (dueDate is null), then future due dates
  const sortedItems = filteredItems.sort((a, b) => {
    if (a.dueDate === null && b.dueDate === null) return 0;
    if (a.dueDate === null) return -1; // place pending revisions first
    if (b.dueDate === null) return 1;
    return a.dueDate.getTime() - b.dueDate.getTime();
  });

  // Count items
  const totalDueCount = allItems.filter(i => i.dueDate === null || i.daysDifference <= 0).length;

  return (
    <div className="revision-queue-view animate-fade-in">
      <header className="queue-header">
        <div className="header-title">
          <h1>Revision Center</h1>
          <p>Boost long-term retention using adaptive spaced repetition schedules.</p>
        </div>
        <div className="queue-badge-stat glass-card">
          <RefreshCw size={16} className={totalDueCount > 0 ? 'animate-spin-slow text-warning' : 'text-accent'} />
          <span>{totalDueCount} Revisions Pending</span>
        </div>
      </header>

      {/* Spaced Repetition Scientific Explanation Tip */}
      <section className="sr-tip-card glass-card">
        <Sparkles size={24} className="text-secondary glow-icon" />
        <div className="tip-content">
          <h4>Spaced Repetition Tip</h4>
          <p>
            Reviewing information right before you are about to forget it strengthens neural pathways. 
            Logging a <strong>High</strong> confidence pushes the next review further into the future, 
            while a <strong>Low</strong> confidence schedules it again for tomorrow.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="controls-bar glass-card">
        <div className="search-box">
          <Search size={16} className="text-muted" />
          <input
            type="text"
            placeholder="Search topic or course..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filters-group">
          <SlidersHorizontal size={16} className="text-muted" />
          <select 
            value={selectedCourseFilter}
            onChange={e => setSelectedCourseFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Tab Switcher */}
      <section className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'due' ? 'active' : ''}`}
          onClick={() => setActiveTab('due')}
        >
          Due & Overdue
          <span className="count-bubble">{totalDueCount}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Scheduled Active Topics
          <span className="count-bubble sec">{allItems.length}</span>
        </button>
      </section>

      {/* Queue List */}
      <section className="queue-list-container">
        {sortedItems.map(({ course, module, topic, dueDate, daysDifference }) => {
          
          return (
            <div key={topic.id} className="queue-card glass-card">
              <div className="queue-card-left">
                <div className="meta-info">
                  <span className="course-code-tag" style={{ borderLeft: `3px solid hsl(${course.color})` }}>
                    {course.code}
                  </span>
                  <span className="module-name-tag">{module.name}</span>
                </div>
                <h3 className="topic-title">{topic.name}</h3>
                
                <div className="topic-history">
                  <span className="history-item">
                    <CheckCircle size={12} />
                    Status: <strong className={`status-text-${topic.status}`}>{topic.status}</strong>
                  </span>
                  <span className="history-item">
                    <RefreshCw size={12} />
                    Revisions: <strong>{topic.revisions}</strong>
                  </span>
                  <span className="history-item">
                    <Clock size={12} />
                    Total Study: <strong>{Math.round(topic.timeSpent / 60)} mins</strong>
                  </span>
                </div>
              </div>

              <div className="queue-card-right">
                <div className="due-status-info">
                  <Calendar size={14} />
                  {dueDate === null ? (
                    <span className="due-label pending">Pending First Revision</span>
                  ) : daysDifference < 0 ? (
                    <span className="due-label overdue">{Math.abs(daysDifference)} Days Overdue</span>
                  ) : daysDifference === 0 ? (
                    <span className="due-label due-today">Due Today</span>
                  ) : (
                    <span className="due-label scheduled">Due in {daysDifference} days ({dueDate.toLocaleDateString()})</span>
                  )}
                </div>

                <div className="revision-log-action">
                  <span className="action-title">Log Today's Retention Quality:</span>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => recordRevision(course.id, module.id, topic.id, 'low')}
                      title="Slight recall difficulty. Review tomorrow."
                    >
                      Low
                    </button>
                    <button 
                      className="btn btn-secondary btn-sm btn-warn-hover"
                      onClick={() => recordRevision(course.id, module.id, topic.id, 'medium')}
                      title="Good recall with some effort. Review in 3 days."
                    >
                      Mid
                    </button>
                    <button 
                      className="btn btn-accent btn-sm"
                      onClick={() => recordRevision(course.id, module.id, topic.id, 'high')}
                      title="Instant, perfect recall. Review in 7+ days."
                    >
                      High
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {sortedItems.length === 0 && (
          <div className="empty-queue-card glass-card">
            <CheckCircle size={48} className="text-accent" />
            <h3>Your queue is clean!</h3>
            <p>
              {activeTab === 'due' 
                ? 'No topics due for revision today. Start working on new topics in your courses!'
                : 'No active topics found. Start working on a topic in Syllabus Core to schedule revisions.'}
            </p>
          </div>
        )}
      </section>

      <style>{`
        .revision-queue-view {
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          flex: 1;
          overflow-y: auto;
          max-height: 100vh;
        }
        .queue-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }
        .header-title h1 {
          font-size: 2.25rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ffffff 0%, var(--text-muted) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .header-title p {
          color: var(--text-muted);
          margin-top: 4px;
        }
        .queue-badge-stat {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 18px;
          font-size: 0.9rem;
          font-weight: 700;
        }
        
        /* Tip Card */
        .sr-tip-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 18px 24px;
          background: rgba(var(--secondary-rgb), 0.05);
          border-color: rgba(var(--secondary-rgb), 0.15);
        }
        .glow-icon {
          color: var(--secondary);
          filter: drop-shadow(0 0 8px rgba(var(--secondary-rgb), 0.4));
          flex-shrink: 0;
          margin-top: 2px;
        }
        .tip-content h4 {
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 4px;
          color: #ffffff;
        }
        .tip-content p {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.5;
        }
        
        /* Search and controls */
        .controls-bar {
          display: flex;
          gap: 16px;
          padding: 12px 20px;
        }
        .search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0 14px;
        }
        .search-box input {
          width: 100%;
          height: 38px;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-main);
          font-family: var(--font-sans);
          font-size: 0.9rem;
        }
        .filters-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .filter-select {
          height: 38px;
          padding: 0 14px;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-main);
          outline: none;
          font-family: var(--font-sans);
          font-size: 0.85rem;
          cursor: pointer;
        }
        
        /* Tab Switcher */
        .tabs-container {
          display: flex;
          gap: 12px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 2px;
        }
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--text-muted);
          padding: 12px 8px;
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .tab-btn:hover {
          color: var(--text-main);
        }
        .tab-btn.active {
          color: var(--primary);
          border-color: var(--primary);
        }
        .count-bubble {
          font-size: 0.75rem;
          font-weight: 800;
          background: rgba(var(--warning-rgb), 0.15);
          color: var(--warning);
          padding: 2px 8px;
          border-radius: var(--radius-round);
          border: 1px solid rgba(var(--warning-rgb), 0.2);
        }
        .count-bubble.sec {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-muted);
          border-color: var(--border-color);
        }
        .tab-btn.active .count-bubble.sec {
          background: rgba(var(--primary-rgb), 0.1);
          color: var(--primary);
          border-color: rgba(var(--primary-rgb), 0.2);
        }
        
        /* Queue List */
        .queue-list-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .queue-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
        }
        .queue-card-left {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }
        .meta-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .course-code-tag {
          font-size: 0.75rem;
          font-weight: 800;
          padding-left: 6px;
          color: var(--text-main);
        }
        .module-name-tag {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .topic-title {
          font-size: 1.15rem;
          font-weight: 700;
        }
        .topic-history {
          display: flex;
          gap: 20px;
        }
        .history-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .history-item strong {
          color: var(--text-main);
        }
        .status-text-completed { color: var(--accent); }
        .status-text-in-progress { color: var(--warning); }
        
        .queue-card-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 14px;
          flex-shrink: 0;
        }
        .due-status-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          font-weight: 700;
        }
        .due-label.overdue {
          color: var(--danger);
          animation: pulse 1.5s infinite;
        }
        .due-label.due-today {
          color: var(--warning);
        }
        .due-label.scheduled {
          color: var(--text-muted);
        }
        .due-label.pending {
          color: var(--secondary);
        }
        
        .revision-log-action {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }
        .revision-log-action .action-title {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 700;
          text-transform: uppercase;
        }
        .action-buttons {
          display: flex;
          gap: 6px;
        }
        
        .btn-warn-hover:hover {
          background: var(--warning) !important;
          color: #ffffff !important;
          border-color: var(--warning) !important;
        }
        
        .empty-queue-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          text-align: center;
          gap: 16px;
        }
        .empty-queue-card h3 { font-size: 1.35rem; }
        .empty-queue-card p { color: var(--text-muted); max-width: 420px; font-size: 0.9rem; }
        
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spinSlow 8s linear infinite;
        }
        
        @media (max-width: 900px) {
          .queue-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .queue-card-right {
            width: 100%;
            align-items: flex-start;
            border-top: 1px solid var(--border-color);
            padding-top: 14px;
          }
          .revision-log-action {
            align-items: flex-start;
            width: 100%;
          }
          .controls-bar {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};
