import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { 
  Calendar, 
  Clock, 
  Music, 
  BookOpen, 
  DollarSign, 
  Timer, 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow,
  Star,
  Share2,
  Award
} from 'lucide-react';

const FiddlersLog = () => {
  const [lessons, setLessons] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedLessons, setSelectedLessons] = useState([]);
  const [practiceTimer, setPracticeTimer] = useState({
    isRunning: false,
    time: 0,
    lessonId: null
  });
  const [milestones, setMilestones] = useState({
    totalPracticeMinutes: 0,
    lessonsCompleted: 0,
    streakDays: 0
  });
  const [weather, setWeather] = useState({
    type: 'sunny', // Example default
    message: ''
  });

  const timerRef = useRef(null); // ✅ Replacing window.timerInterval

  // Weather-based practice messages
  const weatherMessages = {
    sunny: "What a lovely day to practice by the window! ☀️",
    cloudy: "Perfect weather for a cozy indoor practice session! ☁️",
    rainy: "The rain provides a beautiful backdrop for your music! 🌧️",
    snowy: "Time to warm up with some fiddle tunes! ❄️"
  };

  useEffect(() => {
    // ✅ Load lessons from localStorage on first render
    const privateLessons = JSON.parse(localStorage.getItem('privateLessons') || '[]');
    const mondayLessons = JSON.parse(localStorage.getItem('mondayCart') || '[]');

    const allLessons = [
      ...privateLessons.map(lesson => ({
        ...lesson,
        type: 'private',
        id: `private-${Date.now()}-${Math.random()}`,
        practiceMinutes: 0,
        shared: false
      })),
      ...mondayLessons.map(lesson => ({
        ...lesson,
        type: 'monday',
        id: `monday-${Date.now()}-${Math.random()}`,
        practiceMinutes: 0,
        shared: false
      }))
    ];

    setLessons(allLessons);

    // ✅ Load saved milestones
    const savedMilestones = JSON.parse(localStorage.getItem('fiddlerMilestones') || '{}');
    setMilestones(prev => ({
      ...prev,
      ...savedMilestones
    }));

    // ✅ Set weather message randomly (could be connected to real weather API)
    const weatherTypes = ['sunny', 'cloudy', 'rainy', 'snowy'];
    const randomWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
    setWeather({
      type: randomWeather,
      message: weatherMessages[randomWeather]
    });
  }, []); // ✅ Runs only once

  // ✅ Sync lessons to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('fiddlerNotes', JSON.stringify(lessons));
  }, [lessons]);

  // ✅ Practice Timer Functions with `useRef`
  const toggleTimer = (lessonId) => {
    if (practiceTimer.isRunning && practiceTimer.lessonId === lessonId) {
      clearInterval(timerRef.current);

      setLessons(prev =>
        prev.map(lesson =>
          lesson.id === lessonId
            ? { ...lesson, practiceMinutes: lesson.practiceMinutes + Math.floor(practiceTimer.time / 60) }
            : lesson
        )
      );

      setMilestones(prev => ({
        ...prev,
        totalPracticeMinutes: prev.totalPracticeMinutes + Math.floor(practiceTimer.time / 60)
      }));

      setPracticeTimer({ isRunning: false, time: 0, lessonId: null });
    } else {
      setPracticeTimer({ isRunning: true, time: 0, lessonId });

      timerRef.current = setInterval(() => {
        setPracticeTimer(prev => ({ ...prev, time: prev.time + 1 }));
      }, 1000);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ✅ Share notes with teacher (Fixed apostrophe issue)
  const handleShareNotes = (lessonId) => {
    setLessons(prev =>
      prev.map(lesson =>
        lesson.id === lessonId
          ? { ...lesson, shared: true }
          : lesson
      )
    );
    alert("Notes shared with teacher! They'll review them before your next lesson.");
  };

  // ✅ Filter lessons (Past, Upcoming, or All)
  const filteredLessons = lessons.filter(lesson => {
    const lessonDate = new Date(lesson.date);
    const today = new Date();
    
    if (filter === 'upcoming') {
      return lessonDate >= today;
    } else if (filter === 'past') {
      return lessonDate < today;
    }
    return true;
  });

  // ✅ Get weather icon
  const WeatherIcon = {
    sunny: Sun,
    cloudy: Cloud,
    rainy: CloudRain,
    snowy: CloudSnow
  }[weather.type];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-amber-50 rounded-lg p-6 mb-8 shadow-md">
        <h1 className="text-3xl text-amber-900 mb-4 font-semibold">Your Fiddler's Log</h1>
        
        {/* Weather Message */}
        <div className="flex items-center gap-2 text-amber-800 mb-4">
          <WeatherIcon className="h-5 w-5" />
          <p>{weather.message}</p>
        </div>
      </div>

      <div className="space-y-4">
        {filteredLessons.map(lesson => (
          <Card key={lesson.id} className="border-amber-200 bg-white hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-amber-900 mb-2">
                    <Music className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">
                      {lesson.type === 'private' ? 'Private Lesson' : lesson.className}
                    </h3>
                  </div>

                  {/* Practice Timer */}
                  <button
                    onClick={() => toggleTimer(lesson.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                      practiceTimer.isRunning && practiceTimer.lessonId === lesson.id
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    }`}
                  >
                    <Timer className="h-4 w-4" />
                    {practiceTimer.isRunning && practiceTimer.lessonId === lesson.id
                      ? `Stop Practice (${formatTime(practiceTimer.time)})`
                      : 'Start Practice Timer'}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FiddlersLog;