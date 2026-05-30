import React, { useState, useEffect, useRef } from 'react';
import { useSyllabus } from '../context/SyllabusContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Brain, 
  Award
} from 'lucide-react';

type TimerMode = 'work' | 'short-break' | 'long-break';

export const PomodoroTimer: React.FC = () => {
  const { courses, logStudySession, updateTopic } = useSyllabus();

  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  // Selector state
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');

  // Setting defaults
  const [workLength, setWorkLength] = useState(25);
  const [shortLength, setShortLength] = useState(5);
  const [longLength, setLongLength] = useState(15);

  const timerRef = useRef<number | null>(null);
  const secondsStudiedRef = useRef(0);

  // Mode configurations
  const getModeDuration = (targetMode: TimerMode): number => {
    switch (targetMode) {
      case 'work': return workLength * 60;
      case 'short-break': return shortLength * 60;
      case 'long-break': return longLength * 60;
    }
  };

  // Reset timer on length settings adjustment or mode switch
  useEffect(() => {
    setTimeLeft(getModeDuration(mode));
    setIsRunning(false);
    secondsStudiedRef.current = 0;
  }, [mode, workLength, shortLength, longLength]);

  // Synthesize notification chime using Web Audio API
  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5 note
      oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5 note
      oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.3); // G5 note
      
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.warn("Audio Context block or unsupported", e);
    }
  };

  // Handle Session Completion
  const handleSessionComplete = () => {
    setIsRunning(false);
    playAlertSound();

    if (mode === 'work') {
      setCompletedSessions(prev => prev + 1);
      
      // Log focus time to database
      if (selectedCourseId && selectedTopicId) {
        logStudySession(selectedCourseId, selectedTopicId, secondsStudiedRef.current);
        
        // Auto mark topic status as 'in-progress' if it was 'not-started'
        const course = courses.find(c => c.id === selectedCourseId);
        if (course) {
          for (const m of course.modules) {
            const topic = m.topics.find(t => t.id === selectedTopicId);
            if (topic && topic.status === 'not-started') {
              updateTopic(selectedCourseId, m.id, selectedTopicId, { status: 'in-progress' });
              break;
            }
          }
        }

        alert(`Focus Session Completed! Logged ${Math.round(secondsStudiedRef.current / 60)} minutes of study.`);
      } else {
        alert("Focus Session Completed! (Select a topic in the dropdown to log study hours next time).");
      }
      
      // Suggest break
      setMode('short-break');
    } else {
      alert("Break finished! Time to focus.");
      setMode('work');
    }
    secondsStudiedRef.current = 0;
  };

  // Main Timer Effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSessionComplete();
            return 0;
          }
          if (mode === 'work') {
            secondsStudiedRef.current += 1;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, selectedCourseId, selectedTopicId]);

  // Clean end early and log progress
  const handleStopAndLog = () => {
    if (mode === 'work' && secondsStudiedRef.current >= 10) {
      const confirmLog = confirm(`Do you want to stop early and log ${Math.round(secondsStudiedRef.current / 60)} min of study time?`);
      if (confirmLog) {
        if (selectedCourseId && selectedTopicId) {
          logStudySession(selectedCourseId, selectedTopicId, secondsStudiedRef.current);
        }
      }
    }
    setIsRunning(false);
    setTimeLeft(getModeDuration(mode));
    secondsStudiedRef.current = 0;
  };

  // Format Helper
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Filter topics for select
  const activeCourse = courses.find(c => c.id === selectedCourseId);
  const topicsList: { id: string; name: string }[] = [];
  if (activeCourse) {
    activeCourse.modules.forEach(m => {
      m.topics.forEach(t => {
        topicsList.push({ id: t.id, name: t.name });
      });
    });
  }

  // Circular calculations
  const totalDuration = getModeDuration(mode);
  const radius = 80;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - ((totalDuration - timeLeft) / totalDuration) * circumference;

  return (
    <div className="pomodoro-view-container animate-fade-in">
      <header className="timer-header">
        <h1>Focus Space</h1>
        <p>Harness the Pomodoro technique to study deeply with scheduled rests.</p>
      </header>

      <section className="timer-workspace">
        <div className="timer-display-card glass-card">
          {/* Mode Switcher */}
          <div className="mode-toggle-group">
            <button 
              className={`mode-btn ${mode === 'work' ? 'active' : ''}`}
              onClick={() => setMode('work')}
            >
              <Brain size={14} /> Focus Session
            </button>
            <button 
              className={`mode-btn ${mode === 'short-break' ? 'active' : ''}`}
              onClick={() => setMode('short-break')}
            >
              <Coffee size={14} /> Short Rest
            </button>
            <button 
              className={`mode-btn ${mode === 'long-break' ? 'active' : ''}`}
              onClick={() => setMode('long-break')}
            >
              <Coffee size={14} /> Long Rest
            </button>
          </div>

          {/* SVG Progress Ring */}
          <div className="timer-dial-wrapper">
            <svg 
              height={radius * 2} 
              width={radius * 2} 
              className={`timer-dial-svg ${isRunning ? 'breathing' : ''}`}
            >
              <circle
                stroke="rgba(255, 255, 255, 0.04)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke={`var(--${mode === 'work' ? 'primary' : 'secondary'})`}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ 
                  strokeDashoffset,
                  filter: `drop-shadow(0 0 10px var(--${mode === 'work' ? 'primary-glow' : 'secondary'}))`
                }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
            </svg>
            <div className="time-string-display">
              <span className="digits">{formatTime(timeLeft)}</span>
              <span className="mode-label">{mode === 'work' ? 'Focusing' : 'Resting'}</span>
            </div>
          </div>

          {/* Control Actions */}
          <div className="timer-controls">
            <button 
              className="btn btn-secondary circle-btn"
              onClick={handleStopAndLog}
              title="Reset Timer"
            >
              <RotateCcw size={16} />
            </button>

            <button 
              className={`btn play-btn btn-${mode === 'work' ? 'primary' : 'secondary'}`}
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              <span>{isRunning ? 'Pause' : 'Start'}</span>
            </button>
          </div>

          {/* Reward Badges */}
          <div className="session-rewards border-top">
            <Award className="reward-icon" size={16} />
            <span>Completed Sessions Today: <strong>{completedSessions} Pomodoros</strong></span>
          </div>
        </div>

        {/* Association Sidebar */}
        <div className="timer-settings-sidebar glass-card">
          <div className="settings-section">
            <h3>Associate Study Session</h3>
            <p className="description">Select a course and topic. Completing a focus session will log study time to it.</p>
            
            <div className="form-group">
              <label htmlFor="courseSelect">Active Course</label>
              <select
                id="courseSelect"
                className="form-control"
                value={selectedCourseId}
                onChange={e => {
                  setSelectedCourseId(e.target.value);
                  setSelectedTopicId('');
                }}
              >
                <option value="">-- Choose Course --</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="topicSelect">Active Topic</label>
              <select
                id="topicSelect"
                className="form-control"
                value={selectedTopicId}
                disabled={!selectedCourseId}
                onChange={e => setSelectedTopicId(e.target.value)}
              >
                <option value="">-- Choose Topic --</option>
                {topicsList.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration Customization */}
          <div className="settings-section border-top">
            <h3>Timer Customization</h3>
            
            <div className="settings-sliders">
              <div className="slider-group">
                <div className="slider-labels">
                  <span>Focus Length:</span>
                  <span className="slider-val">{workLength}m</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={workLength}
                  onChange={e => setWorkLength(parseInt(e.target.value))}
                  disabled={isRunning}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <span>Short Rest Length:</span>
                  <span className="slider-val">{shortLength}m</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="20"
                  step="1"
                  value={shortLength}
                  onChange={e => setShortLength(parseInt(e.target.value))}
                  disabled={isRunning}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <span>Long Rest Length:</span>
                  <span className="slider-val">{longLength}m</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="45"
                  step="5"
                  value={longLength}
                  onChange={e => setLongLength(parseInt(e.target.value))}
                  disabled={isRunning}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .pomodoro-view-container {
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          flex: 1;
          overflow-y: auto;
          max-height: 100vh;
        }
        .timer-header h1 {
          font-size: 2.25rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ffffff 0%, var(--text-muted) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .timer-header p {
          color: var(--text-muted);
          margin-top: 4px;
        }
        
        .timer-workspace {
          display: grid;
          grid-template-columns: 1.6fr 1.4fr;
          gap: 24px;
          align-items: start;
        }
        .timer-display-card {
          padding: 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
        }
        .mode-toggle-group {
          display: flex;
          gap: 8px;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid var(--border-color);
          padding: 4px;
          border-radius: var(--radius-sm);
        }
        .mode-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 8px 14px;
          border-radius: 6px;
          font-family: var(--font-sans);
          font-weight: 600;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .mode-btn:hover {
          color: var(--text-main);
        }
        .mode-btn.active {
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          box-shadow: var(--shadow-sm);
        }
        
        /* Dial design */
        .timer-dial-wrapper {
          position: relative;
          width: 160px;
          height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .timer-dial-svg {
          transform: rotate(-90deg);
          width: 100%;
          height: 100%;
        }
        .time-string-display {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .time-string-display .digits {
          font-size: 2.25rem;
          font-weight: 800;
          font-family: var(--font-display);
          line-height: 1.1;
          letter-spacing: -0.01em;
        }
        .time-string-display .mode-label {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        
        .timer-controls {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        .circle-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
        }
        .play-btn {
          padding: 12px 28px;
          font-size: 1rem;
          border-radius: var(--radius-round);
          min-width: 140px;
        }
        
        .session-rewards {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
          width: 100%;
          padding-top: 20px;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .session-rewards strong {
          color: var(--accent);
        }
        .reward-icon {
          color: var(--warning);
        }
        
        /* Association sidebar styling */
        .timer-settings-sidebar {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .settings-section h3 {
          font-size: 1.05rem;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .settings-section .description {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 16px;
        }
        .settings-section.border-top {
          border-top: 1px solid var(--border-color);
          padding-top: 20px;
        }
        .settings-sliders {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 12px;
        }
        .slider-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .slider-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          font-weight: 600;
        }
        .slider-labels .slider-val {
          color: var(--secondary);
          font-family: var(--font-display);
        }
        .slider-group input[type='range'] {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          height: 6px;
          border-radius: var(--radius-round);
          outline: none;
          cursor: pointer;
        }
        
        @keyframes breathing {
          0%, 100% { transform: rotate(-90deg) scale(1); }
          50% { transform: rotate(-90deg) scale(1.02); }
        }
        .breathing {
          animation: breathing 4s ease-in-out infinite;
        }
        
        @media (max-width: 900px) {
          .timer-workspace {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
