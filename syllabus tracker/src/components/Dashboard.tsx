import React from 'react';
import { useSyllabus } from '../context/SyllabusContext';
import type { Course, Topic } from '../context/SyllabusContext';
import { 
  BookOpen, 
  CheckCircle, 
  Hourglass, 
  Calendar, 
  Clock, 
  AlertCircle,
  Play
} from 'lucide-react';


export const Dashboard: React.FC = () => {
  const { courses, logs, setActiveView, setSelectedCourseId } = useSyllabus();

  // Helper: Format duration (seconds -> hours/minutes)
  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.round((seconds % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Helper: Calculate total topics
  const getTopicsStats = () => {
    let total = 0;
    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;
    let totalTime = 0;

    courses.forEach(course => {
      course.modules.forEach(module => {
        module.topics.forEach(topic => {
          total++;
          totalTime += topic.timeSpent;
          if (topic.status === 'completed') completed++;
          else if (topic.status === 'in-progress') inProgress++;
          else notStarted++;
        });
      });
    });

    const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, notStarted, completionPercent, totalTime };
  };

  const stats = getTopicsStats();

  // Get revision items due today or overdue
  const getRevisionDueCount = () => {
    const now = new Date();
    let count = 0;
    courses.forEach(course => {
      course.modules.forEach(module => {
        module.topics.forEach(topic => {
          if (topic.nextRevisionDue) {
            const dueDate = new Date(topic.nextRevisionDue);
            if (dueDate <= now) {
              count++;
            }
          }
        });
      });
    });
    return count;
  };

  const revisionDueCount = getRevisionDueCount();

  // Get up to 4 upcoming revisions
  const getUpcomingRevisions = () => {
    const list: { course: Course; topic: Topic; daysLeft: number }[] = [];
    const now = new Date();

    courses.forEach(course => {
      course.modules.forEach(module => {
        module.topics.forEach(topic => {
          if (topic.nextRevisionDue) {
            const due = new Date(topic.nextRevisionDue);
            const diffTime = due.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            list.push({ course, topic, daysLeft: diffDays });
          }
        });
      });
    });

    // Sort by due date (soonest first)
    return list
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 4);
  };

  const upcomingRevisions = getUpcomingRevisions();

  // Circular progress stroke calculation
  const radius = 45;
  const circumference = 2 * Math.PI * radius; // ~282.74
  const strokeDashoffset = circumference - (stats.completionPercent / 100) * circumference;

  return (
    <div className="dashboard-container animate-fade-in">
      <header className="dashboard-header-wrapper">
        <div className="welcome-text">
          <h1>Study Command Center</h1>
          <p>Track syllabus, optimize spacing, crush your study goals.</p>
        </div>
        <div className="date-widget glass-card">
          <Calendar size={18} className="text-secondary" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </header>

      {/* Main Stats Grid */}
      <section className="stats-grid">
        <div className="stat-card glass-card">
          <div className="stat-card-icon c-primary">
            <BookOpen size={24} />
          </div>
          <div className="stat-card-info">
            <span className="info-label">Active Courses</span>
            <span className="info-value">{courses.length}</span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-card-icon c-accent">
            <CheckCircle size={24} />
          </div>
          <div className="stat-card-info">
            <span className="info-label">Topics Completed</span>
            <span className="info-value">{stats.completed} <small>/ {stats.total}</small></span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-card-icon c-secondary">
            <Clock size={24} />
          </div>
          <div className="stat-card-info">
            <span className="info-label">Total Focus Time</span>
            <span className="info-value">{formatDuration(stats.totalTime)}</span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-card-icon c-warning">
            <Hourglass size={24} />
          </div>
          <div className="stat-card-info">
            <span className="info-label">Revisions Due</span>
            <span className="info-value">{revisionDueCount}</span>
          </div>
        </div>
      </section>

      {/* Core Progress & Distribution */}
      <section className="progress-details-section">
        <div className="overall-progress-card glass-card">
          <div className="card-header">
            <h3>Overall Syllabus Mastery</h3>
          </div>
          <div className="overall-progress-body">
            <div className="progress-circle-wrapper">
              <svg className="progress-svg" viewBox="0 0 100 100">
                <circle 
                  className="progress-bg-circle" 
                  cx="50" cy="50" r={radius} 
                />
                <circle 
                  className="progress-fill-circle" 
                  cx="50" cy="50" r={radius}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{
                    stroke: 'url(#progress-gradient)',
                    filter: 'drop-shadow(0 0 8px rgba(var(--primary-rgb), 0.5))'
                  }}
                />
                <defs>
                  <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="100%" stopColor="var(--secondary)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="progress-circle-text">
                <span className="percentage">{stats.completionPercent}%</span>
                <span className="label">Complete</span>
              </div>
            </div>
            
            <div className="progress-legend">
              <div className="legend-item">
                <span className="legend-dot status-completed"></span>
                <div className="legend-info">
                  <span className="value">{stats.completed} Topics</span>
                  <span className="label">Completed</span>
                </div>
              </div>
              <div className="legend-item">
                <span className="legend-dot status-in-progress"></span>
                <div className="legend-info">
                  <span className="value">{stats.inProgress} Topics</span>
                  <span className="label">In Progress</span>
                </div>
              </div>
              <div className="legend-item">
                <span className="legend-dot status-not-started"></span>
                <div className="legend-info">
                  <span className="value">{stats.notStarted} Topics</span>
                  <span className="label">Not Started</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Completion Breakdown */}
        <div className="course-progress-breakdown glass-card">
          <div className="card-header">
            <h3>Course Progress Overview</h3>
          </div>
          <div className="course-breakdown-body">
            {courses.map(course => {
              let courseTotal = 0;
              let courseDone = 0;
              course.modules.forEach(m => {
                m.topics.forEach(t => {
                  courseTotal++;
                  if (t.status === 'completed') courseDone++;
                });
              });
              const coursePercent = courseTotal > 0 ? Math.round((courseDone / courseTotal) * 100) : 0;
              return (
                <div key={course.id} className="course-progress-row">
                  <div className="course-row-header">
                    <div className="course-identity" onClick={() => { setSelectedCourseId(course.id); setActiveView('courses'); }}>
                      <span className="course-dot" style={{ backgroundColor: `hsl(${course.color})` }} />
                      <span className="code">{course.code}</span>
                      <span className="name">{course.name}</span>
                    </div>
                    <span className="percent-val">{coursePercent}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill" 
                      style={{ 
                        width: `${coursePercent}%`, 
                        backgroundColor: `hsl(${course.color})`,
                        boxShadow: `0 0 10px rgba(${coursePercent > 0 ? `hsl(${course.color})` : '0,0,0'}, 0.3)`
                      }} 
                    />
                  </div>
                  <span className="topic-counts">{courseDone} of {courseTotal} topics finished</span>
                </div>
              );
            })}
            {courses.length === 0 && (
              <div className="empty-state-card">
                <BookOpen size={40} className="text-muted" />
                <p>No courses found. Add a course in the sidebar to get started!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Revisions and Logs Row */}
      <section className="dashboard-grid-two-cols">
        {/* Spaced Revisions */}
        <div className="revisions-panel glass-card">
          <div className="card-header justify-between">
            <h3>Revision Queue (Spaced Repetition)</h3>
            <button className="text-btn" onClick={() => setActiveView('revision-queue')}>View All</button>
          </div>
          <div className="revisions-list">
            {upcomingRevisions.map(({ course, topic, daysLeft }) => (
              <div key={topic.id} className="revision-list-item">
                <div className="revision-topic-info">
                  <span className="course-code-tag" style={{ borderLeft: `3px solid hsl(${course.color})` }}>
                    {course.code}
                  </span>
                  <span className="topic-name">{topic.name}</span>
                </div>
                <div className="revision-meta">
                  {daysLeft <= 0 ? (
                    <span className="badge badge-low animate-pulse">OVERDUE</span>
                  ) : (
                    <span className="badge badge-medium">In {daysLeft} {daysLeft === 1 ? 'day' : 'days'}</span>
                  )}
                  <button 
                    className="btn-icon circle" 
                    title="Revise Now"
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      setActiveView('revision-queue');
                    }}
                  >
                    <Play size={12} fill="currentColor" />
                  </button>
                </div>
              </div>
            ))}
            {upcomingRevisions.length === 0 && (
              <div className="empty-substate">
                <CheckCircle size={32} className="text-accent" />
                <p>All caught up! No revisions scheduled.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Study Session Logs */}
        <div className="logs-panel glass-card">
          <div className="card-header justify-between">
            <h3>Recent Study Sessions</h3>
            <button className="text-btn" onClick={() => setActiveView('analytics')}>View Analytics</button>
          </div>
          <div className="logs-list">
            {logs.slice(0, 4).map(log => (
              <div key={log.id} className="log-list-item">
                <div className="log-info">
                  <span className="log-topic">{log.topicName}</span>
                  <span className="log-course">{log.courseName}</span>
                </div>
                <div className="log-time-meta">
                  <span className="duration">
                    <Clock size={12} />
                    {Math.round(log.durationSeconds / 60)} mins
                  </span>
                  <span className="date">
                    {new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="empty-substate">
                <AlertCircle size={32} className="text-muted" />
                <p>No study sessions recorded yet. Start studying via Focus Timer!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <style>{`
        .dashboard-container {
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          flex: 1;
          overflow-y: auto;
          max-height: 100vh;
        }
        .dashboard-header-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }
        .welcome-text h1 {
          font-size: 2.25rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ffffff 0%, var(--text-muted) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .welcome-text p {
          color: var(--text-muted);
          font-size: 1rem;
          margin-top: 4px;
        }
        .date-widget {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 18px;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
        }
        .stat-card-icon {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-card-icon.c-primary { background: rgba(var(--primary-rgb), 0.1); color: var(--primary); }
        .stat-card-icon.c-accent { background: rgba(var(--accent-rgb), 0.1); color: var(--accent); }
        .stat-card-icon.c-secondary { background: rgba(var(--secondary-rgb), 0.1); color: var(--secondary); }
        .stat-card-icon.c-warning { background: rgba(var(--warning-rgb), 0.1); color: var(--warning); }
        
        .stat-card-info {
          display: flex;
          flex-direction: column;
        }
        .info-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .info-value {
          font-size: 1.5rem;
          font-weight: 800;
          font-family: var(--font-display);
        }
        .info-value small {
          font-size: 0.9rem;
          color: var(--text-muted);
          font-weight: 400;
        }
        
        .progress-details-section {
          display: grid;
          grid-template-columns: 1.2fr 1.8fr;
          gap: 24px;
        }
        .overall-progress-card {
          padding: 24px;
        }
        .card-header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }
        .card-header.justify-between {
          justify-content: space-between;
        }
        .card-header h3 {
          font-size: 1.1rem;
          font-weight: 700;
        }
        .text-btn {
          background: transparent;
          border: none;
          color: var(--primary);
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: color var(--transition-fast);
        }
        .text-btn:hover {
          color: var(--secondary);
        }
        .overall-progress-body {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
        }
        .progress-circle-wrapper {
          position: relative;
          width: 140px;
          height: 140px;
        }
        .progress-svg {
          transform: rotate(-90deg);
          width: 100%;
          height: 100%;
        }
        .progress-bg-circle {
          fill: none;
          stroke: rgba(255, 255, 255, 0.05);
          stroke-width: 8;
        }
        .progress-fill-circle {
          fill: none;
          stroke-width: 8;
          stroke-linecap: round;
          transition: stroke-dashoffset var(--transition-slow) ease-in-out;
        }
        .progress-circle-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .progress-circle-text .percentage {
          font-size: 1.8rem;
          font-weight: 800;
          font-family: var(--font-display);
        }
        .progress-circle-text .label {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
        }
        
        .progress-legend {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .legend-dot.status-completed { background-color: var(--accent); }
        .legend-dot.status-in-progress { background-color: var(--warning); }
        .legend-dot.status-not-started { background-color: var(--text-muted); }
        .legend-info {
          display: flex;
          flex-direction: column;
        }
        .legend-info .value {
          font-size: 0.85rem;
          font-weight: 700;
          line-height: 1.1;
        }
        .legend-info .label {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        
        .course-progress-breakdown {
          padding: 24px;
        }
        .course-breakdown-body {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .course-progress-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .course-row-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .course-identity {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }
        .course-identity:hover .name {
          color: var(--primary);
        }
        .course-identity .code {
          font-size: 0.75rem;
          font-weight: 800;
          padding: 2px 6px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          color: var(--text-muted);
        }
        .course-identity .name {
          font-weight: 600;
          font-size: 0.9rem;
          transition: color var(--transition-fast);
        }
        .course-row-header .percent-val {
          font-weight: 700;
          font-size: 0.9rem;
        }
        .progress-bar-container {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: var(--radius-round);
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          border-radius: var(--radius-round);
          transition: width var(--transition-slow);
        }
        .topic-counts {
          font-size: 0.75rem;
          color: var(--text-muted);
          align-self: flex-end;
        }
        
        .dashboard-grid-two-cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .revisions-panel, .logs-panel {
          padding: 24px;
        }
        .revisions-list, .logs-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .revision-list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
        }
        .revision-topic-info {
          display: flex;
          align-items: center;
          gap: 12px;
          overflow: hidden;
        }
        .course-code-tag {
          font-size: 0.75rem;
          font-weight: 800;
          padding-left: 6px;
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .revision-topic-info .topic-name {
          font-size: 0.85rem;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .revision-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .btn-icon.circle {
          border-radius: 50%;
          width: 28px;
          height: 28px;
        }
        .btn-icon.circle:hover {
          color: #ffffff;
          background: var(--primary);
          border-color: var(--primary);
        }
        
        .log-list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
        }
        .log-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding-right: 12px;
        }
        .log-topic {
          font-size: 0.85rem;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .log-course {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        .log-time-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          flex-shrink: 0;
        }
        .log-time-meta .duration {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--secondary);
        }
        .log-time-meta .date {
          font-size: 0.65rem;
          color: var(--text-muted);
        }
        
        .empty-substate {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          gap: 8px;
          text-align: center;
        }
        .empty-substate p {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .animate-pulse {
          animation: pulse 1.5s infinite;
        }
        
        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 900px) {
          .progress-details-section {
            grid-template-columns: 1fr;
          }
          .dashboard-grid-two-cols {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 600px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .dashboard-container {
            padding: 16px;
          }
          .dashboard-header-wrapper {
            flex-direction: column;
            align-items: flex-start;
          }
          .overall-progress-body {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};
