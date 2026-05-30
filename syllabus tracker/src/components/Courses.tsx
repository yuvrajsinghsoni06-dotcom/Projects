import React, { useState } from 'react';
import { useSyllabus } from '../context/SyllabusContext';
import type { Course, Topic } from '../context/SyllabusContext';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Trash2, 
  BookOpen, 
  PlusCircle, 
  Link as LinkIcon, 
  X,
  FileText,
  Clock,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

export const Courses: React.FC = () => {
  const { 
    courses, 
    selectedCourseId, 
    setSelectedCourseId,
    deleteCourse,
    addModule,
    deleteModule,
    addTopic,
    updateTopic,
    deleteTopic,
    recordRevision
  } = useSyllabus();

  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');
  
  // Topic editing local state (for notes and resources)
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [newResourceUrl, setNewResourceUrl] = useState<Record<string, string>>({});

  // Active adding topic fields
  const [addingTopicToModule, setAddingTopicToModule] = useState<string | null>(null);
  const [newTopicName, setNewTopicName] = useState('');

  const activeCourse = courses.find(c => c.id === selectedCourseId) || null;

  // Toggle Module Accordion
  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  // Toggle Topic Detail Pane
  const toggleTopicDetails = (topicId: string, initialNotes: string) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
    if (!editingNotes[topicId]) {
      setEditingNotes(prev => ({ ...prev, [topicId]: initialNotes }));
    }
  };

  // Add Module Handler
  const handleAddModuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleName.trim() || !selectedCourseId) return;
    addModule(selectedCourseId, newModuleName.trim());
    setNewModuleName('');
    setShowAddModule(false);
  };

  // Add Topic Handler
  const handleAddTopicSubmit = (moduleId: string) => {
    if (!newTopicName.trim() || !selectedCourseId) return;
    addTopic(selectedCourseId, moduleId, newTopicName.trim());
    setNewTopicName('');
    setAddingTopicToModule(null);
  };

  // Format time helper
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.round((totalSeconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  // Calculate course completion
  const getCourseCompletion = (course: Course) => {
    let total = 0;
    let completed = 0;
    course.modules.forEach(m => {
      m.topics.forEach(t => {
        total++;
        if (t.status === 'completed') completed++;
      });
    });
    return {
      total,
      completed,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  if (!activeCourse) {
    // Render Grid of Courses
    return (
      <div className="courses-grid-view animate-fade-in">
        <header className="courses-header">
          <h1>Syllabus Core</h1>
          <p>Navigate and manage your course curricula.</p>
        </header>

        <div className="courses-grid">
          {courses.map(course => {
            const stats = getCourseCompletion(course);
            return (
              <div 
                key={course.id} 
                className="course-card-wrapper glass-card interactive"
                onClick={() => setSelectedCourseId(course.id)}
              >
                <div className="course-card-accent" style={{ backgroundColor: `hsl(${course.color})` }} />
                <div className="course-card-content">
                  <div className="card-top">
                    <span className="course-card-code">{course.code}</span>
                    <span className="topic-ratio">{stats.completed}/{stats.total} topics</span>
                  </div>
                  <h3 className="course-card-title">{course.name}</h3>
                  
                  <div className="course-card-progress">
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar-fill" 
                        style={{ 
                          width: `${stats.percent}%`,
                          backgroundColor: `hsl(${course.color})`
                        }} 
                      />
                    </div>
                    <span className="progress-percent">{stats.percent}% Complete</span>
                  </div>
                </div>
              </div>
            );
          })}
          {courses.length === 0 && (
            <div className="empty-state-large glass-card">
              <FolderOpen size={64} className="text-muted" />
              <h2>No Courses Found</h2>
              <p>Get started by creating your first course using the "+" button in the sidebar!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Detailed Course View
  const courseStats = getCourseCompletion(activeCourse);

  return (
    <div className="course-details-view animate-fade-in">
      <header className="course-detail-header">
        <div className="course-identity-header">
          <button className="back-link-btn" onClick={() => setSelectedCourseId(null)}>&larr; Back to Courses</button>
          <div className="title-row">
            <span className="course-code-badge" style={{ backgroundColor: `hsl(${activeCourse.color})` }}>
              {activeCourse.code}
            </span>
            <h1>{activeCourse.name}</h1>
          </div>
        </div>
        <div className="course-actions">
          <button className="btn btn-secondary" onClick={() => setShowAddModule(true)}>
            <Plus size={16} /> Add Module
          </button>
          <button 
            className="btn btn-danger btn-icon" 
            title="Delete Course" 
            onClick={() => {
              if (confirm(`Are you sure you want to delete ${activeCourse.name}? All modules and topics will be permanently removed.`)) {
                deleteCourse(activeCourse.id);
              }
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </header>

      {/* Progress Card */}
      <section className="course-summary-card glass-card">
        <div className="summary-details">
          <div className="progress-metric">
            <span className="metric-value">{courseStats.percent}%</span>
            <span className="metric-label">Course Syllabus Mastery</span>
          </div>
          <div className="progress-line-wrapper">
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: `${courseStats.percent}%`,
                  backgroundColor: `hsl(${activeCourse.color})`,
                  boxShadow: `0 0 10px rgba(var(--primary-rgb), 0.2)`
                }} 
              />
            </div>
            <span className="progress-counts">{courseStats.completed} of {courseStats.total} topics mastered</span>
          </div>
        </div>
      </section>

      {/* Module Accordions */}
      <section className="modules-section">
        {activeCourse.modules.map(module => {
          const isModuleExpanded = expandedModules[module.id] !== false; // Default expanded
          const completedTopicsCount = module.topics.filter(t => t.status === 'completed').length;
          
          return (
            <div key={module.id} className="module-accordion glass-card">
              <div className="module-header" onClick={() => toggleModule(module.id)}>
                <div className="module-title-group">
                  {isModuleExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  <span className="module-name">{module.name}</span>
                </div>
                <div className="module-meta-group" onClick={e => e.stopPropagation()}>
                  <span className="module-progress-badge">
                    {completedTopicsCount}/{module.topics.length} Done
                  </span>
                  <button 
                    className="delete-module-btn" 
                    title="Delete Module"
                    onClick={() => {
                      if (confirm(`Delete module "${module.name}" and all its topics?`)) {
                        deleteModule(activeCourse.id, module.id);
                      }
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {isModuleExpanded && (
                <div className="module-body">
                  <div className="topics-list">
                    {module.topics.map(topic => {
                      const isTopicExpanded = expandedTopics[topic.id] === true;
                      
                      return (
                        <div key={topic.id} className={`topic-item-wrapper ${isTopicExpanded ? 'expanded' : ''}`}>
                          <div className="topic-row">
                            <div className="topic-left">
                              {/* Status Cycler Checkbox */}
                              <select
                                className={`status-select badge-${topic.status}`}
                                value={topic.status}
                                onChange={(e) => updateTopic(
                                  activeCourse.id, 
                                  module.id, 
                                  topic.id, 
                                  { status: e.target.value as Topic['status'] }
                                )}
                              >
                                <option value="not-started">Not Started</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                              </select>

                              <span className="topic-name-label">{topic.name}</span>
                            </div>

                            <div className="topic-right">
                              {/* Confidence Cycler */}
                              <select
                                className={`confidence-select badge-${topic.confidence}`}
                                value={topic.confidence}
                                onChange={(e) => updateTopic(
                                  activeCourse.id, 
                                  module.id, 
                                  topic.id, 
                                  { confidence: e.target.value as Topic['confidence'] }
                                )}
                              >
                                <option value="low">Confidence: Low</option>
                                <option value="medium">Confidence: Mid</option>
                                <option value="high">Confidence: High</option>
                              </select>

                              {/* Revisions indicator */}
                              <span className="revision-count-pill" title="Revisions Count">
                                <RefreshCw size={12} />
                                <span>{topic.revisions}</span>
                              </span>

                              {/* Time Spent indicator */}
                              <span className="time-spent-pill" title="Time Spent Studying">
                                <Clock size={12} />
                                <span>{formatTime(topic.timeSpent)}</span>
                              </span>

                              {/* Expand/Collapse Button */}
                              <button 
                                className={`btn-icon circle expand-details-btn ${isTopicExpanded ? 'active' : ''}`}
                                onClick={() => toggleTopicDetails(topic.id, topic.notes)}
                              >
                                <ChevronDown size={14} style={{ transform: isTopicExpanded ? 'rotate(180deg)' : 'none', transition: 'transform var(--transition-fast)' }} />
                              </button>

                              {/* Delete Topic Button */}
                              <button 
                                className="delete-topic-btn" 
                                title="Delete Topic"
                                onClick={() => {
                                  if (confirm(`Delete topic "${topic.name}"?`)) {
                                    deleteTopic(activeCourse.id, module.id, topic.id);
                                  }
                                }}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Expanded Notes & Resources Drawer */}
                          {isTopicExpanded && (
                            <div className="topic-expanded-details animate-scale-up">
                              <div className="details-grid">
                                {/* Notes Area */}
                                <div className="notes-section">
                                  <div className="section-title">
                                    <FileText size={14} />
                                    <span>Study Notes</span>
                                  </div>
                                  <textarea
                                    className="form-control notes-textarea"
                                    placeholder="Add study summaries, code snippets, or definitions..."
                                    value={editingNotes[topic.id] || ''}
                                    onChange={(e) => {
                                      const text = e.target.value;
                                      setEditingNotes(prev => ({ ...prev, [topic.id]: text }));
                                      // Autosave
                                      updateTopic(activeCourse.id, module.id, topic.id, { notes: text });
                                    }}
                                  />
                                </div>

                                {/* Spaced Repetition Panel & Resource Links */}
                                <div className="meta-and-resources">
                                  <div className="spaced-rep-box glass-card">
                                    <h4>Spaced Repetition Stats</h4>
                                    <div className="rep-dates">
                                      <div className="date-item">
                                        <span className="lbl">Last Revised:</span>
                                        <span className="val">
                                          {topic.lastRevised 
                                            ? new Date(topic.lastRevised).toLocaleDateString() 
                                            : 'Never'}
                                        </span>
                                      </div>
                                      <div className="date-item">
                                        <span className="lbl">Next Review Due:</span>
                                        <span className="val highlight">
                                          {topic.nextRevisionDue 
                                            ? new Date(topic.nextRevisionDue).toLocaleDateString() 
                                            : 'Not Scheduled'}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="spacing-actions">
                                      <button 
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => recordRevision(activeCourse.id, module.id, topic.id, 'low')}
                                      >
                                        Revise: Low
                                      </button>
                                      <button 
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => recordRevision(activeCourse.id, module.id, topic.id, 'medium')}
                                      >
                                        Revise: Mid
                                      </button>
                                      <button 
                                        className="btn btn-primary btn-sm"
                                        onClick={() => recordRevision(activeCourse.id, module.id, topic.id, 'high')}
                                      >
                                        Revise: High
                                      </button>
                                    </div>
                                  </div>

                                  <div className="resources-box">
                                    <div className="section-title">
                                      <LinkIcon size={14} />
                                      <span>Resource Links</span>
                                    </div>
                                    <div className="links-list">
                                      {topic.resources.map((res, idx) => (
                                        <div key={idx} className="link-item">
                                          <a href={res} target="_blank" rel="noopener noreferrer" className="resource-link-a">
                                            {res}
                                          </a>
                                          <button 
                                            className="delete-link-btn"
                                            onClick={() => {
                                              const updated = topic.resources.filter((_, i) => i !== idx);
                                              updateTopic(activeCourse.id, module.id, topic.id, { resources: updated });
                                            }}
                                          >
                                            <X size={12} />
                                          </button>
                                        </div>
                                      ))}
                                      {topic.resources.length === 0 && (
                                        <span className="no-links-msg">No resource links added yet.</span>
                                      )}
                                    </div>
                                    <div className="add-resource-row">
                                      <input
                                        type="url"
                                        className="form-control sm-control"
                                        placeholder="https://example.com"
                                        value={newResourceUrl[topic.id] || ''}
                                        onChange={e => setNewResourceUrl(prev => ({ ...prev, [topic.id]: e.target.value }))}
                                      />
                                      <button 
                                        className="btn btn-secondary btn-icon-sm"
                                        onClick={() => {
                                          const url = newResourceUrl[topic.id]?.trim();
                                          if (!url) return;
                                          const updated = [...topic.resources, url];
                                          updateTopic(activeCourse.id, module.id, topic.id, { resources: updated });
                                          setNewResourceUrl(prev => ({ ...prev, [topic.id]: '' }));
                                        }}
                                      >
                                        Add
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Topic Inline Trigger */}
                  {addingTopicToModule === module.id ? (
                    <div className="add-topic-row-form">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter topic name..."
                        value={newTopicName}
                        onChange={e => setNewTopicName(e.target.value)}
                        required
                        autoFocus
                      />
                      <button className="btn btn-primary" onClick={() => handleAddTopicSubmit(module.id)}>Save</button>
                      <button className="btn btn-secondary" onClick={() => setAddingTopicToModule(null)}>Cancel</button>
                    </div>
                  ) : (
                    <button 
                      className="add-topic-trigger-btn"
                      onClick={() => setAddingTopicToModule(module.id)}
                    >
                      <PlusCircle size={14} /> Add Topic
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {activeCourse.modules.length === 0 && (
          <div className="empty-modules-card glass-card">
            <BookOpen size={48} className="text-muted" />
            <h3>No modules created yet</h3>
            <p>Divide your syllabus into units/modules to start tracking progress.</p>
            <button className="btn btn-primary" onClick={() => setShowAddModule(true)}>Create First Module</button>
          </div>
        )}
      </section>

      {/* Add Module Modal */}
      {showAddModule && (
        <div className="modal-overlay" onClick={() => setShowAddModule(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Syllabus Module</h3>
              <button className="modal-close" onClick={() => setShowAddModule(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddModuleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="modName">Module Title</label>
                  <input
                    id="modName"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Unit 1: Foundations of Database Design"
                    value={newModuleName}
                    onChange={e => setNewModuleName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModule(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Module</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .courses-grid-view, .course-details-view {
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          flex: 1;
          overflow-y: auto;
          max-height: 100vh;
        }
        .courses-header, .course-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }
        .courses-header h1 {
          font-size: 2.25rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ffffff 0%, var(--text-muted) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .courses-header p {
          color: var(--text-muted);
          margin-top: 4px;
        }
        .courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }
        .course-card-wrapper {
          height: 160px;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .course-card-accent {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }
        .course-card-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
        }
        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .course-card-code {
          font-size: 0.75rem;
          font-weight: 800;
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 6px;
          border-radius: 4px;
          color: var(--text-muted);
        }
        .topic-ratio {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 700;
        }
        .course-card-title {
          font-size: 1.15rem;
          font-weight: 700;
          margin-top: 8px;
          flex: 1;
        }
        .course-card-progress {
          margin-top: auto;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .progress-percent {
          font-size: 0.75rem;
          font-weight: 700;
          flex-shrink: 0;
        }
        
        .empty-state-large {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          text-align: center;
          gap: 16px;
        }
        .empty-state-large h2 { font-size: 1.5rem; }
        .empty-state-large p { color: var(--text-muted); max-width: 400px; }
        
        /* Detailed View Styles */
        .course-identity-header {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .back-link-btn {
          background: transparent;
          border: none;
          color: var(--primary);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          align-self: flex-start;
        }
        .back-link-btn:hover {
          color: var(--secondary);
        }
        .title-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .course-code-badge {
          font-size: 0.85rem;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 6px;
          color: #ffffff;
        }
        .course-actions {
          display: flex;
          gap: 12px;
        }
        .course-summary-card {
          padding: 20px 24px;
        }
        .summary-details {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .progress-metric {
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }
        .metric-value {
          font-size: 2.25rem;
          font-weight: 800;
          font-family: var(--font-display);
          line-height: 1;
        }
        .metric-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
        }
        .progress-line-wrapper {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }
        .progress-counts {
          font-size: 0.75rem;
          color: var(--text-muted);
          align-self: flex-end;
          font-weight: 600;
        }
        
        /* Module accordions */
        .modules-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .module-accordion {
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .module-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid var(--border-color);
          cursor: pointer;
          transition: background var(--transition-fast);
        }
        .module-header:hover {
          background: rgba(255, 255, 255, 0.04);
        }
        .module-title-group {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 1rem;
        }
        .module-meta-group {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .module-progress-badge {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.04);
          padding: 4px 8px;
          border-radius: 4px;
        }
        .delete-module-btn, .delete-topic-btn, .delete-link-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: color var(--transition-fast);
        }
        .delete-module-btn:hover, .delete-topic-btn:hover, .delete-link-btn:hover {
          color: var(--danger);
        }
        
        .module-body {
          padding: 16px 20px;
          background: rgba(15, 23, 42, 0.15);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .topics-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        /* Topics list */
        .topic-item-wrapper {
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          background: rgba(255, 255, 255, 0.01);
          overflow: hidden;
          transition: all var(--transition-fast);
        }
        .topic-item-wrapper.expanded {
          border-color: rgba(var(--primary-rgb), 0.3);
          background: rgba(15, 23, 42, 0.4);
        }
        .topic-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
        }
        .topic-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          overflow: hidden;
        }
        .topic-name-label {
          font-size: 0.9rem;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .topic-right {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
        }
        
        /* Status Custom Selects */
        .status-select, .confidence-select {
          font-family: var(--font-sans);
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: var(--radius-round);
          border: 1px solid transparent;
          background-color: rgba(255, 255, 255, 0.05);
          color: var(--text-main);
          outline: none;
          cursor: pointer;
        }
        .status-select.badge-not-started { border-color: var(--border-color); color: var(--text-muted); }
        .status-select.badge-in-progress { background: rgba(var(--warning-rgb), 0.1); color: var(--warning); border-color: rgba(var(--warning-rgb), 0.3); }
        .status-select.badge-completed { background: rgba(var(--accent-rgb), 0.1); color: var(--accent); border-color: rgba(var(--accent-rgb), 0.3); }
        
        .confidence-select.badge-low { background: rgba(var(--danger-rgb), 0.1); color: var(--danger); border-color: rgba(var(--danger-rgb), 0.3); }
        .confidence-select.badge-medium { background: rgba(var(--warning-rgb), 0.1); color: var(--warning); border-color: rgba(var(--warning-rgb), 0.3); }
        .confidence-select.badge-high { background: rgba(var(--accent-rgb), 0.1); color: var(--accent); border-color: rgba(var(--accent-rgb), 0.3); }
        
        .revision-count-pill, .time-spent-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.03);
          padding: 4px 8px;
          border-radius: 4px;
        }
        
        .expand-details-btn.active {
          color: var(--primary);
          background: rgba(var(--primary-rgb), 0.1);
        }
        
        /* Expanded Details Pane */
        .topic-expanded-details {
          border-top: 1px solid var(--border-color);
          padding: 16px;
          background: rgba(9, 13, 22, 0.3);
        }
        .details-grid {
          display: grid;
          grid-template-columns: 1.3fr 0.7fr;
          gap: 20px;
        }
        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .notes-textarea {
          min-height: 160px;
          resize: vertical;
          background: rgba(15, 23, 42, 0.4);
          font-size: 0.85rem;
        }
        .meta-and-resources {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .spaced-rep-box {
          padding: 14px;
          background: rgba(255,255,255,0.01);
        }
        .spaced-rep-box h4 {
          font-size: 0.85rem;
          margin-bottom: 10px;
        }
        .rep-dates {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 12px;
        }
        .date-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
        }
        .date-item .lbl { color: var(--text-muted); }
        .date-item .val { font-weight: 700; }
        .date-item .val.highlight { color: var(--secondary); }
        .spacing-actions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }
        .btn-sm {
          padding: 6px 10px;
          font-size: 0.75rem;
          border-radius: 4px;
        }
        
        .links-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 10px;
        }
        .link-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 10px;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          overflow: hidden;
        }
        .resource-link-a {
          font-size: 0.75rem;
          color: var(--secondary);
          text-decoration: none;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 90%;
        }
        .resource-link-a:hover {
          text-decoration: underline;
        }
        .no-links-msg {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-style: italic;
        }
        .add-resource-row {
          display: flex;
          gap: 6px;
        }
        .sm-control {
          padding: 6px 10px;
          font-size: 0.75rem;
        }
        .btn-icon-sm {
          padding: 6px 12px;
          font-size: 0.75rem;
          border-radius: var(--radius-sm);
        }
        
        /* Inline Form fields */
        .add-topic-trigger-btn {
          align-self: flex-start;
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-weight: 700;
          font-size: 0.8rem;
          cursor: pointer;
          padding: 4px 8px;
          transition: color var(--transition-fast);
        }
        .add-topic-trigger-btn:hover {
          color: var(--primary);
        }
        .add-topic-row-form {
          display: flex;
          gap: 10px;
          max-width: 400px;
        }
        
        .empty-modules-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px;
          text-align: center;
          gap: 12px;
        }
        .empty-modules-card h3 { font-size: 1.1rem; }
        .empty-modules-card p { color: var(--text-muted); max-width: 320px; font-size: 0.85rem; margin-bottom: 8px; }
        
        @media (max-width: 900px) {
          .details-grid {
            grid-template-columns: 1fr;
          }
          .summary-details {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
        }
        @media (max-width: 600px) {
          .course-detail-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .topic-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          .topic-right {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
};
