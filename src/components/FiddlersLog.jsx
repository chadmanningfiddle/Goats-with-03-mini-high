import React, { useState, useEffect } from 'react';
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

  // Weather-based practice messages
  const weatherMessages = {
    sunny: "What a lovely day to practice by the window! ☀️",
    cloudy: "Perfect weather for a cozy indoor practice session! ☁️",
    rainy: "The rain provides a beautiful backdrop for your music! 🌧️",
    snowy: "Time to warm up with some fiddle tunes! ❄️"
  };

  useEffect(() => {
    // Load lessons from localStorage
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

    // Load saved milestones
    const savedMilestones = JSON.parse(localStorage.getItem('fiddlerMilestones') || '{}');
    setMilestones(prev => ({
      ...prev,
      ...savedMilestones
    }));

    // Set weather message (could be connected to real weather API)
    const weatherTypes = ['sunny', 'cloudy', 'rainy', 'snowy'];
    const randomWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
    setWeather({
      type: randomWeather,
      message: weatherMessages[randomWeather]
    });
  }, []);

  // Practice Timer Functions
  const toggleTimer = (lessonId) => {
    if (practiceTimer.isRunning && practiceTimer.lessonId === lessonId) {
      // Stop timer
      clearInterval(window.timerInterval);
      
      // Update lesson practice time
      setLessons(prev => prev.map(lesson => 
        lesson.id === lessonId 
          ? { ...lesson, practiceMinutes: lesson.practiceMinutes + Math.floor(practiceTimer.time / 60) }
          : lesson
      ));

      // Update milestones
      setMilestones(prev => ({
        ...prev,
        totalPracticeMinutes: prev.totalPracticeMinutes + Math.floor(practiceTimer.time / 60)
      }));

      setPracticeTimer({
        isRunning: false,
        time: 0,
        lessonId: null
      });
    } else {
      // Start timer
      setPracticeTimer({
        isRunning: true,
        time: 0,
        lessonId
      });

      window.timerInterval = setInterval(() => {
        setPracticeTimer(prev => ({
          ...prev,
          time: prev.time + 1
        }));
      }, 1000);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Share notes with teacher
  const handleShareNotes = (lessonId) => {
    setLessons(prev => prev.map(lesson => 
      lesson.id === lessonId 
        ? { ...lesson, shared: true }
        : lesson
    ));
    alert('Notes shared with teacher! They'll review them before your next lesson.');
  };

  // Check for milestone achievements
  const checkMilestones = () => {
    const milestoneMessages = [];
    
    if (milestones.totalPracticeMinutes >= 60 && !milestones.hourAchieved) {
      milestoneMessages.push("🎵 You've practiced for an hour! Wonderful dedication!");
      setMilestones(prev => ({ ...prev, hourAchieved: true }));
    }
    
    if (milestones.lessonsCompleted >= 5 && !milestones.fiveLessonsAchieved) {
      milestoneMessages.push("🌟 Five lessons completed! You're making great progress!");
      setMilestones(prev => ({ ...prev, fiveLessonsAchieved: true }));
    }

    if (milestoneMessages.length > 0) {
      alert(milestoneMessages.join('\n'));
      localStorage.setItem('fiddlerMilestones', JSON.stringify(milestones));
    }
  };

  const handleSelectLesson = (lessonId) => {
    setSelectedLessons(prev => 
      prev.includes(lessonId)
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const handleSaveNotes = (lessonId, notes) => {
    setLessons(prev => 
      prev.map(lesson => 
        lesson.id === lessonId 
          ? { ...lesson, notes: notes }
          : lesson
      )
    );
    localStorage.setItem('fiddlerNotes', JSON.stringify(lessons));
  };

  const handleCancelLessons = () => {
    if (selectedLessons.length === 0) {
      alert('Please select lessons to cancel');
      return;
    }
    
    if (window.confirm('Are you sure you want to cancel the selected lessons?')) {
      const updatedLessons = lessons.filter(lesson => 
        !selectedLessons.includes(lesson.id)
      );
      setLessons(updatedLessons);
      setSelectedLessons([]);
      
      const privateLessons = updatedLessons.filter(l => l.type === 'private');
      const mondayLessons = updatedLessons.filter(l => l.type === 'monday');
      localStorage.setItem('privateLessons', JSON.stringify(privateLessons));
      localStorage.setItem('mondayCart', JSON.stringify(mondayLessons));
    }
  };

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

  // Get weather icon based on type
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

        {/* Milestones Summary */}
        <div className="bg-amber-100/50 rounded-lg p-4 mt-4">
          <h2 className="text-amber-900 font-medium flex items-center gap-2 mb-2">
            <Award className="h-5 w-5" />
            Your Musical Journey
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-600" />
              <span>Practice Time: {milestones.totalPracticeMinutes} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-amber-600" />
              <span>Lessons Completed: {milestones.lessonsCompleted}</span>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-amber-600" />
              <span>Practice Streak: {milestones.streakDays} days</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex gap-4 flex-wrap">
        <select 
          className="px-4 py-2 rounded-md border border-amber-200 bg-white text-amber-900"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Lessons</option>
          <option value="upcoming">Upcoming Lessons</option>
          <option value="past">Past Lessons</option>
        </select>

        {selectedLessons.length > 0 && (
          <button
            onClick={handleCancelLessons}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Cancel Selected Lessons
          </button>
        )}
      </div>

      <div className="space-y-4">
        {filteredLessons.map(lesson => (
          <Card key={lesson.id} className="border-amber-200 bg-white hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selectedLessons.includes(lesson.id)}
                  onChange={() => handleSelectLesson(lesson.id)}
                  className="mt-1.5 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-amber-900 mb-2">
                    <Music className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">
                      {lesson.type === 'private' ? 'Private Lesson' : lesson.className}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-amber-700">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(lesson.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-700">
                      <Clock className="h-4 w-4" />
                      <span>{lesson.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-amber-700 mb-4">
                    <DollarSign className="h-4 w-4" />
                    <span>
                      {lesson.paid 
                        ? 'Paid' 
                        : `Payment Due: $${lesson.price}`}
                    </span>
                  </div>

                  {/* Practice Timer */}
                  <div className="flex items-center gap-4 mb-4">
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
                    <span className="text-amber-600">
                      Total Practice: {lesson.practiceMinutes} minutes
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-amber-900 mb-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <label htmlFor={`notes-${lesson.id}`} className="font-medium">
                          Practice Notes
                        </label>
                      </div>
                      <button
                        onClick={() => handleShareNotes(lesson.id)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm ${
                          lesson.shared
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        }`}
                      >
                        <Share2 className="h-4 w-4" />
                        {lesson.shared ? 'Shared with Teacher' : 'Share with Teacher'}
                      </button>
                    </div>
                    <textarea
                      id={`notes-${lesson.id}`}
                      value={lesson.notes || ''}
                      onChange={(e) => handleSaveNotes(lesson.id, e.target.value)}
                      placeholder="Write your practice notes here..."
                      className="w-full p-3 rounded-md border border-amber-200 bg-amber-50 text-amber-900 placeholder-amber-400"
                      rows="3"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredLessons.length === 0 && (
          <div className="text-center py-8 text-amber-700">
            No lessons found. Time to book some musical adventures!
          </div>
        )}
      </div>
    </div>
  );
};

export default FiddlersLog;