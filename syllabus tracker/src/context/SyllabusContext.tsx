import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Topic {
  id: string;
  name: string;
  status: 'not-started' | 'in-progress' | 'completed';
  confidence: 'low' | 'medium' | 'high';
  notes: string;
  resources: string[];
  revisions: number;
  lastRevised?: string;
  nextRevisionDue?: string;
  timeSpent: number; // in seconds
}

export interface Module {
  id: string;
  name: string;
  topics: Topic[];
}

export interface Course {
  id: string;
  name: string;
  code: string;
  color: string; // HSL color string e.g. "263 90% 66%"
  modules: Module[];
}

export interface StudySessionLog {
  id: string;
  courseId: string;
  courseName: string;
  courseCode?: string;
  topicId: string;
  topicName: string;
  durationSeconds: number;
  timestamp: string;
}

export type ViewType = 'dashboard' | 'courses' | 'revision-queue' | 'pomodoro' | 'analytics';

interface SyllabusContextType {
  courses: Course[];
  logs: StudySessionLog[];
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  selectedCourseId: string | null;
  setSelectedCourseId: (id: string | null) => void;
  
  // Actions
  addCourse: (name: string, code: string, color: string) => void;
  deleteCourse: (courseId: string) => void;
  addModule: (courseId: string, name: string) => void;
  deleteModule: (courseId: string, moduleId: string) => void;
  addTopic: (courseId: string, moduleId: string, name: string) => void;
  updateTopic: (courseId: string, moduleId: string, topicId: string, updates: Partial<Topic>) => void;
  deleteTopic: (courseId: string, moduleId: string, topicId: string) => void;
  logStudySession: (courseId: string, topicId: string, durationSeconds: number) => void;
  recordRevision: (courseId: string, moduleId: string, topicId: string, confidence: 'low' | 'medium' | 'high') => void;
}

const SyllabusContext = createContext<SyllabusContextType | undefined>(undefined);

// Helper function to calculate next revision date
const calculateNextRevisionDate = (confidence: 'low' | 'medium' | 'high', currentRevisions: number): string => {
  const date = new Date();
  let days = 1;
  if (confidence === 'low') {
    days = 1;
  } else if (confidence === 'medium') {
    days = 3;
  } else if (confidence === 'high') {
    days = 7 + currentRevisions * 4; // Spaced interval grows with more revisions
  }
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

const DEFAULT_COURSES: Course[] = [
  {
    id: 'course-webdev',
    name: 'Full Stack Web Development',
    code: 'CS-101',
    color: '200 95% 55%', // Sky blue HSL
    modules: [
      {
        id: 'mod-fe-basics',
        name: 'Module 1: Frontend Foundations',
        topics: [
          {
            id: 'top-html',
            name: 'Semantic HTML & Accessibility',
            status: 'completed',
            confidence: 'high',
            notes: 'Semantic tags (header, main, section, nav) improve SEO and screen reader navigation. ARIA roles should only be used when no semantic element is available.',
            resources: ['https://developer.mozilla.org/en-US/docs/Glossary/Semantics', 'https://webaim.org/'],
            revisions: 2,
            lastRevised: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            nextRevisionDue: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            timeSpent: 7200,
          },
          {
            id: 'top-css',
            name: 'CSS Grid, Flexbox & Custom Variables',
            status: 'completed',
            confidence: 'medium',
            notes: 'Use Flexbox for 1D layout (rows/columns) and CSS Grid for 2D layouts. Custom properties (variables) are live in DOM and support transitions.',
            resources: ['https://css-tricks.com/snippets/css/a-guide-to-flexbox/'],
            revisions: 1,
            lastRevised: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            nextRevisionDue: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            timeSpent: 10800,
          },
          {
            id: 'top-responsive',
            name: 'Responsive Design & Fluid Typo',
            status: 'in-progress',
            confidence: 'low',
            notes: 'Implement mobile-first styling with min-width media queries. Use rem and clamp() for smooth typography Scaling.',
            resources: [],
            revisions: 0,
            timeSpent: 3600,
          }
        ]
      },
      {
        id: 'mod-react-core',
        name: 'Module 2: React Core Fundamentals',
        topics: [
          {
            id: 'top-state',
            name: 'State, Props & Lifecycle Hooks',
            status: 'completed',
            confidence: 'high',
            notes: 'Props are configuration passed down, immutable. State is private managed data, mutable via setter. Hooks must run in the same order every render.',
            resources: ['https://react.dev/learn/state-a-components-memory'],
            revisions: 3,
            lastRevised: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            nextRevisionDue: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
            timeSpent: 14400,
          },
          {
            id: 'top-effect',
            name: 'useEffect & Side Effect Cleanup',
            status: 'in-progress',
            confidence: 'medium',
            notes: 'Cleanup functions in useEffect run when dependencies change, and on component unmount. Avoid infinite loops by providing full dependencies.',
            resources: [],
            revisions: 1,
            lastRevised: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            nextRevisionDue: new Date(Date.now() + 0 * 24 * 60 * 60 * 1000).toISOString(), // Due today!
            timeSpent: 9000,
          },
          {
            id: 'top-context',
            name: 'State Management (Context API & Custom Hooks)',
            status: 'not-started',
            confidence: 'low',
            notes: '',
            resources: [],
            revisions: 0,
            timeSpent: 0,
          }
        ]
      }
    ]
  },
  {
    id: 'course-dsa',
    name: 'Data Structures & Algorithms',
    code: 'CS-202',
    color: '263 90% 66%', // Violet HSL
    modules: [
      {
        id: 'mod-linear',
        name: 'Module 1: Linear Data Structures',
        topics: [
          {
            id: 'top-arrays',
            name: 'Dynamic Arrays & Slidings Windows',
            status: 'completed',
            confidence: 'high',
            notes: 'Dynamic arrays double size when full, giving amortized O(1) insertions. Sliding window technique optimized nested loops from O(N^2) to O(N).',
            resources: ['https://leetcode.com/'],
            revisions: 2,
            lastRevised: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            nextRevisionDue: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
            timeSpent: 5400,
          },
          {
            id: 'top-lists',
            name: 'Linked Lists (Singly & Doubly)',
            status: 'completed',
            confidence: 'medium',
            notes: 'Fast insertion/deletion at pointers O(1), but slow lookup O(N). Doubly linked lists use extra memory for previous pointer.',
            resources: [],
            revisions: 1,
            lastRevised: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            nextRevisionDue: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            timeSpent: 7200,
          }
        ]
      },
      {
        id: 'mod-nonlinear',
        name: 'Module 2: Non-Linear Structures',
        topics: [
          {
            id: 'top-trees',
            name: 'Binary Trees & Traversals (DFS/BFS)',
            status: 'in-progress',
            confidence: 'medium',
            notes: 'DFS uses Call Stack (Recursion), BFS uses a Queue. Pre-order, in-order, post-order are variations of DFS.',
            resources: [],
            revisions: 1,
            lastRevised: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            nextRevisionDue: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            timeSpent: 9000,
          },
          {
            id: 'top-graphs',
            name: 'Graph Representation & Dijkstra Algorithm',
            status: 'not-started',
            confidence: 'low',
            notes: '',
            resources: [],
            revisions: 0,
            timeSpent: 0,
          }
        ]
      }
    ]
  }
];

const DEFAULT_LOGS: StudySessionLog[] = [
  {
    id: 'log-1',
    courseId: 'course-webdev',
    courseName: 'Full Stack Web Development',
    courseCode: 'CS-101',
    topicId: 'top-html',
    topicName: 'Semantic HTML & Accessibility',
    durationSeconds: 3600,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-2',
    courseId: 'course-webdev',
    courseName: 'Full Stack Web Development',
    courseCode: 'CS-101',
    topicId: 'top-state',
    topicName: 'State, Props & Lifecycle Hooks',
    durationSeconds: 5400,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-3',
    courseId: 'course-dsa',
    courseName: 'Data Structures & Algorithms',
    courseCode: 'CS-202',
    topicId: 'top-trees',
    topicName: 'Binary Trees & Traversals (DFS/BFS)',
    durationSeconds: 4500,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const SyllabusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('syllabus_tracker_courses');
    return saved ? JSON.parse(saved) : DEFAULT_COURSES;
  });

  const [logs, setLogs] = useState<StudySessionLog[]>(() => {
    const saved = localStorage.getItem('syllabus_tracker_logs');
    return saved ? JSON.parse(saved) : DEFAULT_LOGS;
  });

  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('syllabus_tracker_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('syllabus_tracker_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('syllabus_tracker_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('syllabus_tracker_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const addCourse = (name: string, code: string, color: string) => {
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      name,
      code,
      color,
      modules: []
    };
    setCourses(prev => [...prev, newCourse]);
  };

  const deleteCourse = (courseId: string) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
    if (selectedCourseId === courseId) {
      setSelectedCourseId(null);
    }
  };

  const addModule = (courseId: string, name: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      const newModule: Module = {
        id: `mod-${Date.now()}`,
        name,
        topics: []
      };
      return {
        ...c,
        modules: [...c.modules, newModule]
      };
    }));
  };

  const deleteModule = (courseId: string, moduleId: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      return {
        ...c,
        modules: c.modules.filter(m => m.id !== moduleId)
      };
    }));
  };

  const addTopic = (courseId: string, moduleId: string, name: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      return {
        ...c,
        modules: c.modules.map(m => {
          if (m.id !== moduleId) return m;
          const newTopic: Topic = {
            id: `top-${Date.now()}`,
            name,
            status: 'not-started',
            confidence: 'low',
            notes: '',
            resources: [],
            revisions: 0,
            timeSpent: 0
          };
          return {
            ...m,
            topics: [...m.topics, newTopic]
          };
        })
      };
    }));
  };

  const updateTopic = (courseId: string, moduleId: string, topicId: string, updates: Partial<Topic>) => {
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      return {
        ...c,
        modules: c.modules.map(m => {
          if (m.id !== moduleId) return m;
          return {
            ...m,
            topics: m.topics.map(t => {
              if (t.id !== topicId) return t;
              return { ...t, ...updates };
            })
          };
        })
      };
    }));
  };

  const deleteTopic = (courseId: string, moduleId: string, topicId: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      return {
        ...c,
        modules: c.modules.map(m => {
          if (m.id !== moduleId) return m;
          return {
            ...m,
            topics: m.topics.filter(t => t.id !== topicId)
          };
        })
      };
    }));
  };

  const logStudySession = (courseId: string, topicId: string, durationSeconds: number) => {
    // 1. Find course and topic to get names
    const targetCourse = courses.find(c => c.id === courseId);
    let topicName = 'Unknown Topic';
    let moduleId = '';
    let currentTimeSpent = 0;
    
    if (targetCourse) {
      for (const m of targetCourse.modules) {
        const found = m.topics.find(t => t.id === topicId);
        if (found) {
          topicName = found.name;
          moduleId = m.id;
          currentTimeSpent = found.timeSpent;
          break;
        }
      }
    }

    if (!targetCourse || !moduleId) return;

    // 2. Update time spent in course state
    updateTopic(courseId, moduleId, topicId, {
      timeSpent: currentTimeSpent + durationSeconds
    });

    // 3. Add to study logs
    const newLog: StudySessionLog = {
      id: `log-${Date.now()}`,
      courseId,
      courseName: targetCourse.name,
      courseCode: targetCourse.code,
      topicId,
      topicName,
      durationSeconds,
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const recordRevision = (courseId: string, moduleId: string, topicId: string, confidence: 'low' | 'medium' | 'high') => {
    // Find the current revisions count
    const targetCourse = courses.find(c => c.id === courseId);
    if (!targetCourse) return;
    const targetModule = targetCourse.modules.find(m => m.id === moduleId);
    if (!targetModule) return;
    const targetTopic = targetModule.topics.find(t => t.id === topicId);
    if (!targetTopic) return;

    const newRevisionsCount = targetTopic.revisions + 1;
    const nextRevisionDateStr = calculateNextRevisionDate(confidence, newRevisionsCount);
    
    updateTopic(courseId, moduleId, topicId, {
      confidence,
      revisions: newRevisionsCount,
      lastRevised: new Date().toISOString(),
      nextRevisionDue: nextRevisionDateStr,
      status: 'completed' // Mark as completed when revised
    });

    // Also log study time: say 10 minutes (600s) default revision log duration
    logStudySession(courseId, topicId, 600);
  };

  return (
    <SyllabusContext.Provider value={{
      courses,
      logs,
      activeView,
      setActiveView,
      theme,
      toggleTheme,
      selectedCourseId,
      setSelectedCourseId,
      
      addCourse,
      deleteCourse,
      addModule,
      deleteModule,
      addTopic,
      updateTopic,
      deleteTopic,
      logStudySession,
      recordRevision
    }}>
      {children}
    </SyllabusContext.Provider>
  );
};

export const useSyllabus = () => {
  const context = useContext(SyllabusContext);
  if (context === undefined) {
    throw new Error('useSyllabus must be used within a SyllabusProvider');
  }
  return context;
};
