import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Monitor, Clock, Timer, Wifi, Gamepad2, RefreshCcw, Headset, LogIn, ArrowLeft, Trophy, Activity, Zap } from 'lucide-react';
import { Station, Session } from '@/types/pos.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const PublicStations = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState<Station[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [timeToNextRefresh, setTimeToNextRefresh] = useState(30);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setRefreshing(true);
      
      try {
        console.log('Fetching station data...');
        
        // Fetch stations
        const { data: stationsData, error: stationsError } = await supabase
          .from('stations')
          .select('*');
          
        if (stationsError) {
          console.error('Error fetching stations:', stationsError);
          setLoadingError('Failed to load station data');
          throw stationsError;
        }
        
        // Fetch active sessions
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('sessions')
          .select('*')
          .is('end_time', null);
          
        if (sessionsError) {
          console.error('Error fetching sessions:', sessionsError);
          setLoadingError('Failed to load session data');
          throw sessionsError;
        }
        
        console.log('Fetched data:', { stations: stationsData?.length, sessions: sessionsData?.length });
        
        // Transform data to match our types
        const transformedStations: Station[] = stationsData?.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type as 'ps5' | '8ball' | 'vr',
          hourlyRate: item.hourly_rate,
          isOccupied: item.is_occupied,
          currentSession: null
        })) || [];
        
        const transformedSessions: Session[] = sessionsData?.map(item => ({
          id: item.id,
          stationId: item.station_id,
          customerId: item.customer_id,
          startTime: new Date(item.start_time),
          endTime: item.end_time ? new Date(item.end_time) : undefined,
          duration: item.duration
        })) || [];
        
        // Connect sessions to stations
        const stationsWithSessions = transformedStations.map(station => {
          const activeSession = transformedSessions.find(s => s.stationId === station.id);
          return {
            ...station,
            isOccupied: !!activeSession,
            currentSession: activeSession || null
          };
        });
        
        // Update state
        setTimeout(() => {
          setStations(stationsWithSessions);
          setSessions(transformedSessions);
          setRefreshing(false);
          setLastRefresh(new Date());
          setTimeToNextRefresh(30);
          setLoadingError(null);
          setLoading(false);
        }, 300);
      } catch (error) {
        console.error('Error fetching data:', error);
        setRefreshing(false);
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up interval to refresh data every 30 seconds
    const refreshInterval = setInterval(fetchData, 30000);
    
    // Set up countdown timer
    const countdownInterval = setInterval(() => {
      setTimeToNextRefresh(prev => {
        if (prev <= 1) return 30;
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  // Feature flag to enable/disable VR stations section
  const ENABLE_VR_STATIONS = false;

  // Separate stations by type
  const ps5Stations = stations.filter(station => station.type === 'ps5');
  const ballStations = stations.filter(station => station.type === '8ball');
  const vrStations = stations.filter(station => station.type === 'vr');

  if (loading) {
    return <ImprovedLoadingView error={loadingError} />;
  }

  if (stations.length === 0 && !loading) {
    return <NoStationsView error={loadingError} />;
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Premium Background with Subtle Sports Turf Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80"
          alt="Sports Turf Background"
          className="w-full h-full object-cover opacity-[0.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white via-green-50/20 to-emerald-50/30"></div>
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 20px,
            rgba(16, 185, 129, 0.1) 20px,
            rgba(16, 185, 129, 0.1) 21px
          )`
        }}></div>
      </div>

      {/* Animated Gradient Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-200/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Premium Back Button */}
      <Button 
        variant="ghost" 
        size="sm"
        className="absolute top-6 left-6 z-20 text-gray-700 hover:text-green-600 hover:bg-green-50 border border-gray-200 rounded-xl transition-all duration-300"
        onClick={() => navigate('/')}
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Home
      </Button>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Premium Header */}
        <header className="py-12 px-4 sm:px-6 md:px-8 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-12">
              <div className="mb-6 relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-green-400/30 to-emerald-500/30 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative">
                  <img 
                    src="/Turf45_transparent.png" 
                    alt="Turf45 Logo" 
                    className="h-24 w-auto object-contain"
                    style={{
                      filter: "drop-shadow(0 4px 20px rgba(16, 185, 129, 0.4))",
                    }}
                  />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4 text-center">
                Station Live Status
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl text-center leading-relaxed">
                Check the availability of our gaming stations in real-time
              </p>
              
              {/* Status Indicator */}
              <div className="mt-6 bg-white/80 backdrop-blur-md rounded-full px-6 py-3 flex items-center space-x-3 border border-green-100 shadow-lg">
                <div className={`w-2.5 h-2.5 rounded-full ${refreshing ? 'bg-orange-400 animate-pulse' : 'bg-green-500 animate-pulse'}`}></div>
                <div className="text-sm text-gray-700 flex items-center space-x-2 font-medium">
                  {refreshing ? (
                    <span className="flex items-center">
                      <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                      Refreshing data...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Activity className="h-4 w-4 mr-2" />
                      Auto-refresh in {timeToNextRefresh}s
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Premium Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4 max-w-6xl mx-auto">
              <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border-2 border-green-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3">
                    <Timer className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-600">Pool Tables</div>
                <div className="text-3xl font-bold text-gray-900 mt-1">{ballStations.length}</div>
                <div className="text-xs text-green-600 mt-2 flex items-center">
                  <Zap className="h-3 w-3 mr-1" />
                  {ballStations.filter(s => !s.isOccupied).length} available
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border-2 border-green-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3">
                    <Gamepad2 className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-600">PS5 Consoles</div>
                <div className="text-3xl font-bold text-gray-900 mt-1">{ps5Stations.length}</div>
                <div className="text-xs text-blue-600 mt-2 flex items-center">
                  <Zap className="h-3 w-3 mr-1" />
                  {ps5Stations.filter(s => !s.isOccupied).length} available
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border-2 border-orange-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-3">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-600">In Use</div>
                <div className="text-3xl font-bold text-gray-900 mt-1">
                  {stations.filter(s => s.isOccupied).length}
                </div>
                <div className="text-xs text-orange-600 mt-2">
                  {stations.length > 0 ? Math.round(stations.filter(s => s.isOccupied).length / stations.length * 100) : 0}% occupancy
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border-2 border-green-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3">
                    <Wifi className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-600">Network Status</div>
                <div className="text-xl font-bold text-gray-900 mt-1 flex items-center">
                  Online
                </div>
                <div className="text-xs text-green-600 mt-2 animate-pulse">Excellent connection</div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Stations Content */}
        <main className="py-8 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto transition-all duration-500" 
          style={{ 
            opacity: refreshing ? 0.7 : 1,
            transform: refreshing ? 'scale(0.99)' : 'scale(1)'
          }}>
          {/* Pool Tables Section */}
          <section className="mb-16 animate-fade-in">
            <div className="flex items-center mb-8">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-3 mr-4 shadow-lg">
                <Timer className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Pool Tables</h2>
                <p className="text-sm text-gray-600 mt-1">{ballStations.filter(s => !s.isOccupied).length} of {ballStations.length} available</p>
              </div>
            </div>
            
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {ballStations.length === 0 ? (
                <div className="col-span-full text-center py-16 bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-gray-100">
                  <Timer className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No pool tables available at this location</p>
                </div>
              ) : (
                ballStations.map((station, index) => (
                  <div 
                    key={station.id} 
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <PublicStationCard station={station} />
                  </div>
                ))
              )}
            </div>
          </section>

          {/* PlayStation Section */}
          <section className="mb-16 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-3 mr-4 shadow-lg">
                <Gamepad2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">PlayStation 5 Consoles</h2>
                <p className="text-sm text-gray-600 mt-1">{ps5Stations.filter(s => !s.isOccupied).length} of {ps5Stations.length} available</p>
              </div>
            </div>
            
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {ps5Stations.length === 0 ? (
                <div className="col-span-full text-center py-16 bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-gray-100">
                  <Gamepad2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No PS5 consoles available at this location</p>
                </div>
              ) : (
                ps5Stations.map((station, index) => (
                  <div 
                    key={station.id} 
                    className="animate-fade-in"
                    style={{ animationDelay: `${(index + ballStations.length) * 100}ms` }}
                  >
                    <PublicStationCard station={station} />
                  </div>
                ))
              )}
            </div>
          </section>

          {/* VR Gaming Section */}
          {ENABLE_VR_STATIONS && vrStations.length > 0 && (
            <section className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center mb-8">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-3 mr-4 shadow-lg">
                  <Headset className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">VR Gaming Stations</h2>
                  <p className="text-sm text-gray-600 mt-1">{vrStations.filter(s => !s.isOccupied).length} of {vrStations.length} available</p>
                </div>
              </div>
              
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {vrStations.map((station, index) => (
                  <div 
                    key={station.id} 
                    className="animate-fade-in"
                    style={{ animationDelay: `${(index + ps5Stations.length + ballStations.length) * 100}ms` }}
                  >
                    <PublicStationCard station={station} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
        
        {/* Premium Footer */}
        <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 px-4 relative overflow-hidden mt-12">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {/* Brand */}
              <div>
                <img
                  src="/Turf45_transparent.png"
                  alt="Turf45 Logo"
                  className="h-12 w-auto object-contain mb-4"
                  style={{
                    filter: "drop-shadow(0 2px 12px rgba(16, 185, 129, 0.4))",
                  }}
                />
                <p className="text-gray-400 leading-relaxed">
                  Premium sports and gaming facilities in Chennai.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-bold text-lg mb-4">Quick Links</h4>
                <ul className="space-y-3">
                  <li>
                    <button onClick={() => navigate('/')} className="text-gray-400 hover:text-green-400 transition-colors">
                      Home
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate('/public/booking')} className="text-gray-400 hover:text-green-400 transition-colors">
                      Book Courts
                    </button>
                  </li>
                  <li>
                    <a href="/support" className="text-gray-400 hover:text-green-400 transition-colors">
                      Support
                    </a>
                  </li>
                </ul>
              </div>

              {/* Info */}
              <div>
                <h4 className="font-bold text-lg mb-4">Live Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-400 text-sm">
                    <Activity className="h-4 w-4 text-green-400 mr-2 animate-pulse" />
                    <span>Auto-refreshes every 30s</span>
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <Wifi className="h-4 w-4 text-green-400 mr-2" />
                    <span>Real-time updates</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-700 pt-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-gray-400 text-sm">
                  © {new Date().getFullYear()} Turf45. All rights reserved.
                </p>
                <div className="flex items-center gap-4">
                  <a 
                    href="/login" 
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-400 transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    Admin Login
                  </a>
                  <a 
                    href="https://cuephoriatech.in" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 hover:text-green-300 transition-all text-sm font-medium"
                  >
                    <span>&lt; &gt;</span>
                    <span className="text-green-400">Cuephoria</span>
                    <span className="text-gray-300">Tech</span>
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

// Enhanced Loading View
const ImprovedLoadingView = ({ error }: { error: string | null }) => {
  const [retryCount, setRetryCount] = useState(0);
  
  useEffect(() => {
    if (error && retryCount < 3) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        window.location.reload();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [error, retryCount]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50"></div>
      
      <div className="relative z-10 w-full max-w-md flex flex-col items-center justify-center animate-fade-in">
        <div className="w-32 h-32 mb-8 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-green-400/20 rounded-full blur-2xl animate-pulse"></div>
          <img 
            src="/Turf45_transparent.png" 
            alt="Turf45 Logo" 
            className="relative w-auto h-full object-contain animate-pulse"
            style={{
              filter: "drop-shadow(0 4px 20px rgba(16, 185, 129, 0.4))",
            }}
          />
        </div>
        
        {error ? (
          <div className="text-center space-y-4 bg-white/80 backdrop-blur-md p-8 rounded-3xl border-2 border-red-100 shadow-xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <div className="text-3xl">❌</div>
            </div>
            <h2 className="text-2xl font-bold text-red-600">{error}</h2>
            <p className="text-gray-600">Please try again or contact support</p>
            <Button 
              onClick={() => window.location.reload()}
              className="mt-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full"
            >
              <RefreshCcw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="relative flex justify-center items-center">
              <div className="w-20 h-20 border-t-4 border-green-500 border-solid rounded-full animate-spin"></div>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Loading Stations
              </h2>
              <p className="text-gray-600">Getting real-time information...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// No Stations View
const NoStationsView = ({ error }: { error: string | null }) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50"></div>
      
      <div className="relative z-10 w-full max-w-md py-12 px-6 flex flex-col items-center justify-center animate-fade-in">
        <div className="w-32 h-32 mb-8 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-green-400/20 rounded-full blur-2xl animate-pulse"></div>
          <img 
            src="/Turf45_transparent.png" 
            alt="Turf45 Logo"
            className="relative w-auto h-full object-contain"
            style={{
              filter: "drop-shadow(0 4px 20px rgba(16, 185, 129, 0.4))",
            }}
          />
        </div>
        
        <div className="text-center space-y-4 bg-white/80 backdrop-blur-md p-8 rounded-3xl border-2 border-gray-100 shadow-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4">
            <div className="text-3xl">⚠️</div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">No Stations Available</h2>
          <p className="text-gray-600">
            {error || "There are currently no gaming stations in our system. Please check back later."}
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="mt-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full"
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};

// Premium Station Card
const PublicStationCard = ({ station }: { station: Station }) => {
  const isPoolTable = station.type === '8ball';
  const isVRStation = station.type === 'vr';
  const sessionStartTime = station.currentSession?.startTime;
  
  const calculateDuration = () => {
    if (!sessionStartTime) return null;
    
    const start = new Date(sessionStartTime);
    const now = new Date();
    const durationMs = now.getTime() - start.getTime();
    
    const totalSeconds = Math.floor(durationMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return {
      hours,
      minutes,
      seconds,
      formatted: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    };
  };

  const [duration, setDuration] = useState(calculateDuration());

  useEffect(() => {
    if (!station.isOccupied) return;
    
    const timer = setInterval(() => {
      setDuration(calculateDuration());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [station.isOccupied, sessionStartTime]);

  // Get colors and styles based on station type
  const getStationStyles = () => {
    if (isVRStation) {
      return {
        gradient: 'from-purple-50 to-white',
        borderColor: 'border-purple-200',
        iconBg: 'from-purple-500 to-purple-600',
        textColor: 'text-purple-600',
        progressBar: 'bg-purple-500',
        hoverBorder: 'hover:border-purple-300'
      };
    } else if (isPoolTable) {
      return {
        gradient: 'from-green-50 to-white',
        borderColor: 'border-green-200',
        iconBg: 'from-green-500 to-green-600',
        textColor: 'text-green-600',
        progressBar: 'bg-green-500',
        hoverBorder: 'hover:border-green-300'
      };
    } else {
      return {
        gradient: 'from-blue-50 to-white',
        borderColor: 'border-blue-200',
        iconBg: 'from-blue-500 to-blue-600',
        textColor: 'text-blue-600',
        progressBar: 'bg-blue-500',
        hoverBorder: 'hover:border-blue-300'
      };
    }
  };

  const styles = getStationStyles();
  
  return (
    <div className={`
      relative overflow-hidden rounded-2xl border-2 group transition-all duration-300
      bg-gradient-to-br ${styles.gradient}
      ${styles.borderColor}
      hover:shadow-xl ${styles.hoverBorder}
      hover:-translate-y-2
      backdrop-blur-sm
    `}>
      {/* Shine effect */}
      {!station.isOccupied && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ transform: 'translateX(-100%)', animation: 'shine 2s infinite' }}></div>
      )}
      
      {/* Content */}
      <div className="p-6 relative z-10">
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <Badge className={`
            px-3 py-1 text-xs font-semibold transition-all duration-300
            ${station.isOccupied
              ? 'bg-red-100 text-red-700 border-red-300'
              : 'bg-green-100 text-green-700 border-green-300 animate-pulse'}
          `}>
            {station.isOccupied ? 'Occupied' : 'Available'}
          </Badge>
        </div>
        
        {/* Station Icon and Name */}
        <div className="flex items-center mb-6 mt-2">
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center mr-4
            bg-gradient-to-br ${styles.iconBg}
            shadow-lg
            group-hover:scale-110 transition-transform duration-300
          `}>
            {isVRStation ? (
              <Headset className="h-6 w-6 text-white" />
            ) : isPoolTable ? (
              <Timer className="h-6 w-6 text-white" />
            ) : (
              <Monitor className="h-6 w-6 text-white" />
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-900">{station.name}</h3>
        </div>
        
        {/* Duration if occupied */}
        {station.isOccupied && duration && (
          <div className="mt-4">
            <div className="flex items-center mb-3">
              <Clock className={`h-4 w-4 ${styles.textColor} mr-2`} />
              <span className="text-gray-600 text-sm font-medium">Time in use</span>
            </div>
            <div className={`
              font-mono text-2xl bg-white px-4 py-3 rounded-xl text-center
              ${styles.textColor}
              border-2 ${styles.borderColor}
              shadow-inner
            `}>
              {duration.formatted}
            </div>
            
            {/* Progress bar */}
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${styles.progressBar} rounded-full transition-all duration-1000`}
                style={{ 
                  width: `${Math.min((duration.minutes / (isVRStation ? 15 : 60)) * 100, 100)}%`
                }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Available message */}
        {!station.isOccupied && (
          <div className="mt-4 py-4 px-4 text-center bg-white/80 rounded-xl border-2 border-dashed ${styles.borderColor}">
            <p className={`
              text-sm font-semibold
              ${styles.textColor}
            `}>
              {isVRStation ? "Ready for VR experience!" : "Ready for next player!"}
            </p>
            
            {/* Pulse dots */}
            <div className="flex items-center justify-center space-x-2 mt-3">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className={`w-2 h-2 rounded-full ${styles.progressBar}`}
                  style={{ 
                    animationDelay: `${i * 200}ms`,
                    animation: 'pulse 1.5s infinite ease-in-out'
                  }}
                ></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicStations;
