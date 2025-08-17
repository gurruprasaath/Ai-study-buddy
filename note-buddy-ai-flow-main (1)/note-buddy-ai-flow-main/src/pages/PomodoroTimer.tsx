import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Settings, Coffee, Brain, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroSession {
  id: string;
  date: string;
  completedPomodoros: number;
  totalFocusTime: number; // in minutes
}

const PomodoroTimer = () => {
  // Timer state (declare first)
  const [mode, setMode] = useState<TimerMode>(() => sessionStorage.getItem('pomodoro_mode') as TimerMode || 'work');
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = sessionStorage.getItem('pomodoro_timeLeft');
    return saved ? Number(saved) : 25 * 60;
  });
  const [isRunning, setIsRunning] = useState(() => sessionStorage.getItem('pomodoro_isRunning') === 'true');
  const [completedPomodoros, setCompletedPomodoros] = useState(() => {
    const saved = sessionStorage.getItem('pomodoro_completedPomodoros');
    return saved ? Number(saved) : 0;
  });
  const [currentTask, setCurrentTask] = useState(() => sessionStorage.getItem('pomodoro_currentTask') || '');

  // Music player state (declare after timer state)
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [musicUrl, setMusicUrl] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(() => sessionStorage.getItem('pomodoro_isPlaying') === 'true');
  const defaultMusic = "https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b1b7c7.mp3"; // royalty-free relaxing music
  const audioRef = React.useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Persist music file name and URL in sessionStorage
    if (musicFile) {
      const url = URL.createObjectURL(musicFile);
      setMusicUrl(url);
      sessionStorage.setItem('pomodoro_musicFileName', musicFile.name);
      // File objects can't be stored directly, so only name is saved
      return () => URL.revokeObjectURL(url);
    } else {
      setMusicUrl(defaultMusic);
      sessionStorage.removeItem('pomodoro_musicFileName');
    }
  }, [musicFile]);

  // Block player when not in break mode or break ends
  useEffect(() => {
    if (mode === 'shortBreak' || mode === 'longBreak') {
      if (isPlaying && audioRef.current) {
        audioRef.current.play();
      }
    } else {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  // Persist isPlaying state
  sessionStorage.setItem('pomodoro_isPlaying', isPlaying ? 'true' : 'false');
  }, [mode, isPlaying]);
  // ...existing code...
  // Removed duplicate state declarations for timer and music player

  // Timer settings
  const [workDuration, setWorkDuration] = useState(() => {
    const saved = sessionStorage.getItem('pomodoro_workDuration');
    return saved ? Number(saved) : 25;
  });
  const [shortBreakDuration, setShortBreakDuration] = useState(() => {
    const saved = sessionStorage.getItem('pomodoro_shortBreakDuration');
    return saved ? Number(saved) : 5;
  });
  const [longBreakDuration, setLongBreakDuration] = useState(() => {
    const saved = sessionStorage.getItem('pomodoro_longBreakDuration');
    return saved ? Number(saved) : 15;
  });

  const [todayStats] = useState<PomodoroSession>({
    id: '1',
    date: '2024-01-15',
    completedPomodoros: 3,
    totalFocusTime: 75
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          sessionStorage.setItem('pomodoro_timeLeft', String(newTime));
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Persist all state changes
  useEffect(() => {
    sessionStorage.setItem('pomodoro_mode', mode);
    sessionStorage.setItem('pomodoro_timeLeft', String(timeLeft));
    sessionStorage.setItem('pomodoro_isRunning', isRunning ? 'true' : 'false');
    sessionStorage.setItem('pomodoro_completedPomodoros', String(completedPomodoros));
    sessionStorage.setItem('pomodoro_currentTask', currentTask);
    sessionStorage.setItem('pomodoro_workDuration', String(workDuration));
    sessionStorage.setItem('pomodoro_shortBreakDuration', String(shortBreakDuration));
    sessionStorage.setItem('pomodoro_longBreakDuration', String(longBreakDuration));
  }, [mode, timeLeft, isRunning, completedPomodoros, currentTask, workDuration, shortBreakDuration, longBreakDuration]);

  // Cross-tab sync: listen for sessionStorage changes
  useEffect(() => {
    const syncState = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('pomodoro_')) {
        if (e.key === 'pomodoro_mode') setMode(e.newValue as TimerMode);
        if (e.key === 'pomodoro_timeLeft') setTimeLeft(e.newValue ? Number(e.newValue) : 0);
        if (e.key === 'pomodoro_isRunning') setIsRunning(e.newValue === 'true');
        if (e.key === 'pomodoro_completedPomodoros') setCompletedPomodoros(e.newValue ? Number(e.newValue) : 0);
        if (e.key === 'pomodoro_currentTask') setCurrentTask(e.newValue || '');
        if (e.key === 'pomodoro_workDuration') setWorkDuration(e.newValue ? Number(e.newValue) : 25);
        if (e.key === 'pomodoro_shortBreakDuration') setShortBreakDuration(e.newValue ? Number(e.newValue) : 5);
        if (e.key === 'pomodoro_longBreakDuration') setLongBreakDuration(e.newValue ? Number(e.newValue) : 15);
        if (e.key === 'pomodoro_isPlaying') setIsPlaying(e.newValue === 'true');
        // Can't sync File object, but could sync file name if needed
      }
    };
    window.addEventListener('storage', syncState);
    return () => window.removeEventListener('storage', syncState);
  }, []);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (mode === 'work') {
      setCompletedPomodoros(prev => prev + 1);
      // After 4 pomodoros, suggest long break
      const nextMode = (completedPomodoros + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
      setMode(nextMode);
      setTimeLeft(nextMode === 'longBreak' ? longBreakDuration * 60 : shortBreakDuration * 60);
    } else {
      setMode('work');
      setTimeLeft(workDuration * 60);
    }
  };

  // Remove old startTimer
  const pauseTimer = () => setIsRunning(false);
  
  const resetTimer = () => {
    setIsRunning(false);
    const duration = mode === 'work' ? workDuration : 
                    mode === 'shortBreak' ? shortBreakDuration : longBreakDuration;
    setTimeLeft(duration * 60);
  };


  // When switching modes, pause and reset timer to correct duration
  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    let duration = newMode === 'work' ? workDuration : newMode === 'shortBreak' ? shortBreakDuration : longBreakDuration;
    setTimeLeft(duration * 60);
  };

  // When user clicks Start, start timer for the current mode (do not reset timeLeft)
  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalDuration = mode === 'work' ? workDuration * 60 : 
                         mode === 'shortBreak' ? shortBreakDuration * 60 : longBreakDuration * 60;
    return ((totalDuration - timeLeft) / totalDuration) * 100;
  };

  const getModeColor = () => {
    const colors = {
      work: 'from-red-500 to-orange-500',
      shortBreak: 'from-green-500 to-emerald-500',
      longBreak: 'from-blue-500 to-purple-500'
    };
    return colors[mode];
  };

  const getModeIcon = () => {
    const icons = {
      work: <Brain className="h-6 w-6" />,
      shortBreak: <Coffee className="h-6 w-6" />,
      longBreak: <Coffee className="h-6 w-6" />
    };
    return icons[mode];
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          ⏲️ <span className="bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">Pomodoro Timer</span>
        </h1>
        <p className="text-xl text-gray-600">
          Boost your productivity with focused work sessions and regular breaks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timer */}
        <div className="lg:col-span-2">
          <Card className="text-center">
            <CardHeader>
              <div className="flex items-center justify-center space-x-2 mb-4">
                {getModeIcon()}
                <h2 className="text-2xl font-bold capitalize">
                  {mode === 'shortBreak' ? 'Short Break' : 
                   mode === 'longBreak' ? 'Long Break' : mode}
                </h2>
              </div>
              {/* Mode Selector */}
              <div className="flex justify-center space-x-2">
                <Button
                  variant={mode === 'work' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => switchMode('work')}
                  className={mode === 'work' ? 'bg-red-500 hover:bg-red-600' : ''}
                >
                  Work
                </Button>
                <Button
                  variant={mode === 'shortBreak' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => switchMode('shortBreak')}
                  className={mode === 'shortBreak' ? 'bg-green-500 hover:bg-green-600' : ''}
                >
                  Short Break
                </Button>
                <Button
                  variant={mode === 'longBreak' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => switchMode('longBreak')}
                  className={mode === 'longBreak' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                >
                  Long Break
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Timer Display */}
              <div className={`mx-auto w-64 h-64 rounded-full bg-gradient-to-br ${getModeColor()} flex items-center justify-center shadow-2xl`}>
                <div className="text-6xl font-bold text-white">
                  {formatTime(timeLeft)}
                </div>
              </div>

              {/* Music player removed from break tab. Now only in global timer. */}

              {/* Progress Bar */}
              <div className="space-y-2">
                <Progress value={getProgress()} className="h-2" />
                <p className="text-sm text-gray-600">
                  {Math.round(getProgress())}% complete
                </p>
              </div>

              {/* Controls */}
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={isRunning ? pauseTimer : startTimer}
                  size="lg"
                  className={`bg-gradient-to-r ${getModeColor()} hover:opacity-90`}
                >
                  {isRunning ? <Pause className="h-6 w-6 mr-2" /> : <Play className="h-6 w-6 mr-2" />}
                  {isRunning ? 'Pause' : 'Start'}
                </Button>
                <Button
                  onClick={resetTimer}
                  variant="outline"
                  size="lg"
                >
                  <RotateCcw className="h-6 w-6 mr-2" />
                  Reset
                </Button>
              </div>

              {/* Current Task */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Current Task (Optional)
                </label>
                <input
                  type="text"
                  value={currentTask}
                  onChange={(e) => setCurrentTask(e.target.value)}
                  placeholder="What are you working on?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats and Settings */}
        <div className="space-y-6">
          {/* Today's Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-sky-600 mb-2">
                  {completedPomodoros}
                </div>
                <p className="text-sm text-gray-600">Completed Pomodoros</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Focus Time</span>
                  <span className="font-medium">{todayStats.totalFocusTime}min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sessions</span>
                  <span className="font-medium">{todayStats.completedPomodoros}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Goal</span>
                  <span className="font-medium">8 sessions</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Timer Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Work Duration
                </label>
                <Select value={workDuration.toString()} onValueChange={(value) => setWorkDuration(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="20">20 minutes</SelectItem>
                    <SelectItem value="25">25 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Short Break
                </label>
                <Select value={shortBreakDuration.toString()} onValueChange={(value) => setShortBreakDuration(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 minutes</SelectItem>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Long Break
                </label>
                <Select value={longBreakDuration.toString()} onValueChange={(value) => setLongBreakDuration(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="20">20 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;