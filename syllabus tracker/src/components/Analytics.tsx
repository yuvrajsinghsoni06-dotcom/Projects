import React from 'react';
import { useSyllabus } from '../context/SyllabusContext';
import { 
  Clock, 
  TrendingUp
} from 'lucide-react';

export const Analytics: React.FC = () => {
  const { courses, logs } = useSyllabus();

  // Helper: Format duration (seconds -> hours/minutes)
  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.round((seconds % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Compile general statistics
  const getGeneralStats = () => {
    let totalTopics = 0;
    let completedTopics = 0;
    let inProgressTopics = 0;
    let notStartedTopics = 0;
    let totalTime = 0;

    let confidenceLow = 0;
    let confidenceMedium = 0;
    let confidenceHigh = 0;

    courses.forEach(course => {
      course.modules.forEach(module => {
        module.topics.forEach(topic => {
          totalTopics++;
          totalTime += topic.timeSpent;

          if (topic.status === 'completed') completedTopics++;
          else if (topic.status === 'in-progress') inProgressTopics++;
          else notStartedTopics++;

          if (topic.confidence === 'low') confidenceLow++;
          else if (topic.confidence === 'medium') confidenceMedium++;
          else confidenceHigh++;
        });
      });
    });

    const totalSessions = logs.length;
    const avgSessionSecs = totalSessions > 0 ? Math.round(totalTime / totalSessions) : 0;

    return {
      totalTopics,
      completedTopics,
      inProgressTopics,
      notStartedTopics,
      totalTime,
      totalSessions,
      avgSessionSecs,
      confidenceLow,
      confidenceMedium,
      confidenceHigh
    };
  };

  const stats = getGeneralStats();

  // Calculate percentages for charts
  const getConfidencePercents = () => {
    const total = stats.confidenceLow + stats.confidenceMedium + stats.confidenceHigh;
    if (total === 0) return { low: 0, medium: 0, high: 0 };
    return {
      low: Math.round((stats.confidenceLow / total) * 100),
      medium: Math.round((stats.confidenceMedium / total) * 100),
      high: Math.round((stats.confidenceHigh / total) * 100)
    };
  };

  const confidencePercents = getConfidencePercents();

  return (
    <div className="analytics-view-container animate-fade-in">
      <header className="analytics-header">
        <h1>Analytics & Insights</h1>
        <p>Review your study statistics, progress distribution, and session history.</p>
      </header>

      {/* Grid of Key stats */}
      <section className="analytics-stats-grid">
        <div className="analytics-stat-card glass-card">
          <div className="card-top">
            <span className="lbl">Total Study Hours</span>
            <Clock size={16} className="text-secondary" />
          </div>
          <span className="val">{formatDuration(stats.totalTime)}</span>
          <span className="footer-lbl">Across all active courses</span>
        </div>

        <div className="analytics-stat-card glass-card">
          <div className="card-top">
            <span className="lbl">Focus Sessions Logged</span>
            <TrendingUp size={16} className="text-accent" />
          </div>
          <span className="val">{stats.totalSessions} sessions</span>
          <span className="footer-lbl">Pomodoros & revisions</span>
        </div>

        <div className="analytics-stat-card glass-card">
          <div className="card-top">
            <span className="lbl">Average Session Duration</span>
            <Clock size={16} className="text-warning" />
          </div>
          <span className="val">{Math.round(stats.avgSessionSecs / 60)} mins</span>
          <span className="footer-lbl">Per session focus average</span>
        </div>
      </section>

      {/* Charts & Ratios */}
      <section className="analytics-charts-section">
        {/* Confidence Levels */}
        <div className="chart-card glass-card">
          <h3>Retention Confidence Distribution</h3>
          <p className="subtitle">Breakdown of understanding levels across active topics</p>
          
          <div className="confidence-chart-body">
            <div className="chart-bars-stack">
              <div className="bar-label-row">
                <span>High Confidence</span>
                <span className="val-text">{stats.confidenceHigh} topics ({confidencePercents.high}%)</span>
              </div>
              <div className="bar-container">
                <div className="bar-fill high" style={{ width: `${confidencePercents.high}%` }} />
              </div>

              <div className="bar-label-row">
                <span>Medium Confidence</span>
                <span className="val-text">{stats.confidenceMedium} topics ({confidencePercents.medium}%)</span>
              </div>
              <div className="bar-container">
                <div className="bar-fill medium" style={{ width: `${confidencePercents.medium}%` }} />
              </div>

              <div className="bar-label-row">
                <span>Low Confidence</span>
                <span className="val-text">{stats.confidenceLow} topics ({confidencePercents.low}%)</span>
              </div>
              <div className="bar-container">
                <div className="bar-fill low" style={{ width: `${confidencePercents.low}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Syllabus Completion Ratios */}
        <div className="chart-card glass-card">
          <h3>Syllabus Status breakdown</h3>
          <p className="subtitle">Current state of curriculum progression</p>
          
          <div className="status-ratio-body">
            <div className="circle-ratio-display">
              <div className="status-progress-bars">
                <div className="progress-item">
                  <div className="lbl-row">
                    <span>Completed</span>
                    <strong>{stats.completedTopics} topics</strong>
                  </div>
                  <div className="progress-line"><div className="line-fill bg-accent" style={{ width: `${stats.totalTopics > 0 ? (stats.completedTopics/stats.totalTopics)*100 : 0}%` }} /></div>
                </div>

                <div className="progress-item">
                  <div className="lbl-row">
                    <span>In Progress</span>
                    <strong>{stats.inProgressTopics} topics</strong>
                  </div>
                  <div className="progress-line"><div className="line-fill bg-warning" style={{ width: `${stats.totalTopics > 0 ? (stats.inProgressTopics/stats.totalTopics)*100 : 0}%` }} /></div>
                </div>

                <div className="progress-item">
                  <div className="lbl-row">
                    <span>Not Started</span>
                    <strong>{stats.notStartedTopics} topics</strong>
                  </div>
                  <div className="progress-line"><div className="line-fill bg-muted" style={{ width: `${stats.totalTopics > 0 ? (stats.notStartedTopics/stats.totalTopics)*100 : 0}%` }} /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Session History Logs Table */}
      <section className="logs-history-section glass-card">
        <div className="section-header">
          <h3>Full Session Log History</h3>
        </div>
        <div className="table-responsive">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Course</th>
                <th>Topic Studied</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>
                    <span className="log-code-badge">{log.courseCode || log.courseName.slice(0, 3).toUpperCase()}</span>
                    <span className="log-course-name">{log.courseName}</span>
                  </td>
                  <td className="log-topic-cell">{log.topicName}</td>
                  <td className="log-duration-cell">{formatDuration(log.durationSeconds)}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="no-logs-cell">No study sessions recorded yet. Start studying via Focus Timer!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <style>{`
        .analytics-view-container {
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          flex: 1;
          overflow-y: auto;
          max-height: 100vh;
        }
        .analytics-header h1 {
          font-size: 2.25rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ffffff 0%, var(--text-muted) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .analytics-header p {
          color: var(--text-muted);
          margin-top: 4px;
        }
        
        .analytics-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .analytics-stat-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .analytics-stat-card .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .analytics-stat-card .lbl {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }
        .analytics-stat-card .val {
          font-size: 1.75rem;
          font-weight: 800;
          font-family: var(--font-display);
        }
        .analytics-stat-card .footer-lbl {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        
        .analytics-charts-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .chart-card {
          padding: 24px;
        }
        .chart-card h3 {
          font-size: 1.1rem;
          font-weight: 700;
        }
        .chart-card .subtitle {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 2px;
          margin-bottom: 20px;
        }
        
        .confidence-chart-body {
          display: flex;
          flex-direction: column;
        }
        .chart-bars-stack {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .bar-label-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .bar-label-row .val-text {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .bar-container {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: var(--radius-round);
          overflow: hidden;
        }
        .bar-fill {
          height: 100%;
          border-radius: var(--radius-round);
        }
        .bar-fill.high { background: var(--accent); }
        .bar-fill.medium { background: var(--warning); }
        .bar-fill.low { background: var(--danger); }
        
        .status-progress-bars {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .progress-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .progress-item .lbl-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }
        .progress-item .lbl-row span { color: var(--text-muted); font-weight: 600; }
        .progress-item .lbl-row strong { font-weight: 700; }
        .progress-line {
          width: 100%;
          height: 6px;
          background: rgba(255,255,255,0.04);
          border-radius: var(--radius-round);
          overflow: hidden;
        }
        .line-fill {
          height: 100%;
          border-radius: var(--radius-round);
        }
        .line-fill.bg-accent { background: var(--accent); }
        .line-fill.bg-warning { background: var(--warning); }
        .line-fill.bg-muted { background: var(--text-muted); }
        
        /* Logs Table */
        .logs-history-section {
          padding: 24px;
        }
        .logs-history-section .section-header {
          margin-bottom: 16px;
        }
        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }
        .logs-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .logs-table th {
          padding: 12px 16px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border-color);
          letter-spacing: 0.05em;
        }
        .logs-table td {
          padding: 14px 16px;
          font-size: 0.85rem;
          border-bottom: 1px solid var(--border-color);
        }
        .logs-table tr:last-child td {
          border-bottom: none;
        }
        .log-code-badge {
          font-size: 0.7rem;
          font-weight: 800;
          background: rgba(255,255,255,0.05);
          padding: 2px 6px;
          border-radius: 4px;
          margin-right: 8px;
          color: var(--text-muted);
        }
        .log-course-name {
          font-weight: 500;
        }
        .log-topic-cell {
          font-weight: 600;
        }
        .log-duration-cell {
          font-weight: 700;
          color: var(--secondary);
        }
        .no-logs-cell {
          text-align: center;
          color: var(--text-muted);
          font-style: italic;
          padding: 32px !important;
        }
        
        @media (max-width: 900px) {
          .analytics-stats-grid {
            grid-template-columns: 1fr;
          }
          .analytics-charts-section {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
