import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  ArrowRight, 
  Star, 
  CheckCircle2, 
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  Twitter,
  Trophy,
  Users,
  Shield,
  Award,
  Heart,
  Menu,
  X,
  Target,
  Sparkles,
  Lightbulb,
  BookOpen,
  Play
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from "@/components/ui/card";

interface Station {
  id: string;
  name: string;
  type: 'turf' | 'pickleball';
  hourly_rate: number;
  is_occupied: boolean;
}

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [liveStations, setLiveStations] = useState<Station[]>([]);
  const [stationsLoading, setStationsLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Handle scroll for header transparency
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch live station data
  useEffect(() => {
    const fetchLiveStations = async () => {
      try {
        const { data, error } = await supabase
          .from('stations')
          .select('*')
          .order('name');
        
        if (error) throw error;
        setLiveStations(data || []);
        setStationsLoading(false);
      } catch (error) {
        console.error('Error fetching stations:', error);
        setStationsLoading(false);
      }
    };

    fetchLiveStations();
    const interval = setInterval(fetchLiveStations, 30000);
    
    const channel = supabase
      .channel('stations-live')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'stations' },
        () => fetchLiveStations()
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="public-page min-h-screen bg-black">
      {/* Premium Navigation Bar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'backdrop-blur-xl bg-black/80 border-b border-green-500/20 shadow-lg shadow-green-500/10' 
          : 'backdrop-blur-md bg-black/95 border-b border-green-500/10'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img
                src="/Turf45_transparent.png"
                alt="Turf45 - FIFA Approved Courts"
                className="h-12 md:h-14 w-auto object-contain transition-all duration-300 hover:scale-105"
                style={{
                  filter: "drop-shadow(0 2px 12px rgba(16, 185, 129, 0.6))",
                }}
              />
            </div>
        
            {/* Desktop Navigation */}
            {!isMobile && (
              <nav className="hidden md:flex items-center gap-8">
                <button onClick={() => scrollToSection('facilities')} className="text-gray-300 hover:text-green-400 transition-colors font-medium">
                  Facilities
                </button>
                <button onClick={() => scrollToSection('coaching')} className="text-gray-300 hover:text-green-400 transition-colors font-medium">
                  Coaching
                </button>
                <button onClick={() => scrollToSection('ricky')} className="text-gray-300 hover:text-green-400 transition-colors font-medium">
                  Meet Ricky
                </button>
                <button onClick={() => scrollToSection('achievements')} className="text-gray-300 hover:text-green-400 transition-colors font-medium">
                  Achievements
                </button>
                <button onClick={() => navigate('/support')} className="text-gray-300 hover:text-green-400 transition-colors font-medium">
                  Contact
                </button>
              </nav>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4">
              {!isMobile && (
                <Button
                  onClick={() => navigate('/public/stations')}
                  variant="outline"
                  className="rounded-full border-2 border-green-500 text-green-400 hover:bg-green-500/10"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Live Status
                </Button>
              )}

              <Button
                onClick={() => navigate('/public/booking')}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full px-6 shadow-lg shadow-green-500/30 transition-all duration-300 hover:scale-105"
              >
                Book Now
              </Button>

              {isMobile && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-white"
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && isMobile && (
          <div className="md:hidden border-t border-green-500/20 bg-black/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-3">
              <button onClick={() => scrollToSection('facilities')} className="block w-full text-left px-4 py-2 rounded-lg hover:bg-green-500/10 text-gray-300 font-medium">
                Facilities
              </button>
              <button onClick={() => scrollToSection('coaching')} className="block w-full text-left px-4 py-2 rounded-lg hover:bg-green-500/10 text-gray-300 font-medium">
                Coaching
              </button>
              <button onClick={() => scrollToSection('ricky')} className="block w-full text-left px-4 py-2 rounded-lg hover:bg-green-500/10 text-gray-300 font-medium">
                Meet Ricky
              </button>
              <button onClick={() => scrollToSection('achievements')} className="block w-full text-left px-4 py-2 rounded-lg hover:bg-green-500/10 text-gray-300 font-medium">
                Achievements
              </button>
              <button onClick={() => navigate('/support')} className="block w-full text-left px-4 py-2 rounded-lg hover:bg-green-500/10 text-gray-300 font-medium">
                Contact
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section with T45 TOP VIEW Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Aerial View Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="/T45 TOP VIEW.jpeg"
            alt="Turf45 Aerial View"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]"></div>
        </div>

        {/* Floating Badges */}
        <div className="absolute top-32 left-8 z-20 animate-fade-in hidden lg:block">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-green-500/30">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-white">FIFA Approved</p>
                <p className="text-sm text-green-300">Premium Turf</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Status */}
        <div className="absolute top-32 right-8 z-20 animate-fade-in hidden lg:block">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-green-500/30">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
              </div>
              <div>
                <p className="font-bold text-white">Live Booking</p>
                <p className="text-sm text-green-300">{liveStations.filter(s => !s.is_occupied).length} Courts Available</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center text-white animate-fade-in">
          <div className="mb-6 inline-block bg-green-500/20 backdrop-blur-sm text-green-100 px-6 py-3 text-base border border-green-400/30 animate-slide-up rounded-full">
            🏆 FIFA Approved Football & Cricket Turf - ESTD 2021
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Premium Sports
            <br />
            <span className="bg-gradient-to-r from-green-300 via-emerald-200 to-green-100 bg-clip-text text-transparent">
              Facilities Redefined
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-green-50 mb-10 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Experience world-class FIFA-approved turf, professional cricket ground, and premium pickleball facilities. Book your slot in seconds.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Button
              onClick={() => navigate('/public/booking')}
              size="lg"
              className="bg-white text-green-600 hover:bg-green-50 rounded-full px-10 py-7 text-lg font-bold shadow-2xl transition-all duration-300 hover:scale-110 group"
            >
              Book Your Court Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button
              onClick={() => navigate('/public/stations')}
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 rounded-full px-10 py-7 text-lg font-bold backdrop-blur-sm transition-all duration-300"
            >
              View Live Status
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <Trophy className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">100+</p>
              <p className="text-green-200 text-sm">Tournaments</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">5000+</p>
              <p className="text-blue-200 text-sm">Players</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <Award className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">50+</p>
              <p className="text-yellow-200 text-sm">Championships</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <Star className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">4.9</p>
              <p className="text-purple-200 text-sm">Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Showcase Section */}
      <section id="facilities" className="py-20 px-4 bg-gradient-to-b from-black via-gray-950 to-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 bg-clip-text text-transparent">
            World-Class Sports Facilities
          </h2>
          <p className="text-center text-gray-400 text-lg mb-16">
            FIFA-Approved Turf & Premium Pickleball Court
          </p>
          
          {/* Main Court Showcases */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 animate-fade-in">
            {/* Multi-Sport Turf */}
            <div className="relative group overflow-hidden rounded-2xl shadow-2xl border-2 border-green-500/30 cursor-pointer" onClick={() => navigate('/public/booking')}>
              <img 
                src="/T45 TOP VIEW.jpeg" 
                alt="Multi-Sport Turf Aerial View"
                className="w-full h-[500px] object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-950/95 via-green-900/40 to-transparent">
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="h-7 w-7 text-green-400" />
                    <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-bold border border-green-500">
                      FIFA APPROVED
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">Multi-Sport Turf</h3>
                  <p className="text-green-200 text-lg mb-4">Professional Football & Cricket Ground</p>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Now
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Pickleball Court */}
            <div className="relative group overflow-hidden rounded-2xl shadow-2xl border-2 border-blue-500/30 cursor-pointer" onClick={() => navigate('/public/booking')}>
              <img 
                src="/Pickleball top view.jpeg" 
                alt="Pickleball Court Aerial View"
                className="w-full h-[500px] object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/95 via-blue-900/40 to-transparent">
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-7 w-7 text-blue-400" />
                    <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-bold border border-blue-500">
                      INDOOR COURT
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">Pickleball Court</h3>
                  <p className="text-blue-200 text-lg mb-4">Premium All-Weather Court</p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Photos Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="relative overflow-hidden rounded-xl aspect-square group">
              <img src="/Football 1.jpeg" alt="Women's Football" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-pink-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="absolute bottom-3 left-3 text-white font-bold">Women's Football</p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl aspect-square group">
              <img src="/Cricket.jpeg" alt="Cricket Action" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="absolute bottom-3 left-3 text-white font-bold">Cricket</p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl aspect-square group">
              <img src="/Practice Match.jpg" alt="Practice Match" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-green-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="absolute bottom-3 left-3 text-white font-bold">Matches</p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl aspect-square group">
              <img src="/Pickleball side wall.jpeg" alt="Pickleball" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="absolute bottom-3 left-3 text-white font-bold">Pickleball</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Women's Football Team Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-green-950/30 via-black to-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-pink-400 via-purple-300 to-pink-500 bg-clip-text text-transparent">
            Women's Football Team
          </h2>
          <p className="text-center text-gray-400 text-lg mb-16">
            Empowering women through sports 💪⚽
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="relative group overflow-hidden rounded-2xl shadow-2xl border-2 border-pink-500/30">
              <img src="/Football 1.jpeg" alt="Women's Football Team" className="w-full h-[450px] object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-pink-950/90 via-pink-900/40 to-transparent">
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="h-7 w-7 text-pink-400" />
                    <span className="bg-pink-500/20 text-pink-300 px-3 py-1 rounded-full text-sm font-bold">
                      WOMEN'S TEAM
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">Girls Football Squad</h3>
                  <p className="text-pink-100 text-lg">Champions on and off the field</p>
                </div>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-2xl shadow-2xl border-2 border-pink-500/30">
              <img src="/Football 2.jpeg" alt="Women's Football Action" className="w-full h-[450px] object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-pink-950/90 via-pink-900/40 to-transparent">
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="h-7 w-7 text-pink-400" />
                    <span className="bg-pink-500/20 text-pink-300 px-3 py-1 rounded-full text-sm font-bold">
                      TEAM SPIRIT
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">Team Unity</h3>
                  <p className="text-pink-100 text-lg">Together we achieve more</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA for Women's Program */}
          <div className="text-center bg-gradient-to-r from-pink-900/20 to-purple-900/20 border border-pink-500/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-3">Join Our Women's Football Program</h3>
            <p className="text-gray-300 mb-6">Professional training and a supportive community await you</p>
            <Button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-8 py-3 text-lg">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Professional Coaching Section */}
      <section id="coaching" className="py-20 px-4 bg-gradient-to-b from-black via-gray-950 to-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-500 bg-clip-text text-transparent">
            Professional Coaching Programs
          </h2>
          <p className="text-center text-gray-400 text-lg mb-16">
            Expert training sessions for all skill levels
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Football Coaching */}
            <div className="relative rounded-2xl overflow-hidden group shadow-2xl border-2 border-green-500/30">
              <img src="/FB Coaching 1.jpg" alt="Football Coaching Session" className="w-full h-[450px] object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-green-950/95 via-green-900/50 to-transparent">
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="h-7 w-7 text-green-400" />
                    <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-bold">
                      FOOTBALL
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">Football Coaching</h3>
                  <p className="text-green-100 text-lg mb-4">Professional training with certified coaches</p>
                  <ul className="text-green-200 space-y-1 text-sm">
                    <li>✓ Individual & Group Sessions</li>
                    <li>✓ Skill Development Programs</li>
                    <li>✓ Match Preparation</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Multi-Sport Coaching */}
            <div className="relative rounded-2xl overflow-hidden group shadow-2xl border-2 border-orange-500/30">
              <img src="/FB Coaching 2.jpeg" alt="Sports Coaching Session" className="w-full h-[450px] object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-950/95 via-orange-900/50 to-transparent">
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="h-7 w-7 text-orange-400" />
                    <span className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-sm font-bold">
                      MULTI-SPORT
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">Cricket & Sports Coaching</h3>
                  <p className="text-orange-100 text-lg mb-4">Expert training across multiple sports</p>
                  <ul className="text-orange-200 space-y-1 text-sm">
                    <li>✓ Cricket Fundamentals</li>
                    <li>✓ Batting & Bowling Techniques</li>
                    <li>✓ Fitness & Conditioning</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Players in Action Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-950 to-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-green-400 via-blue-300 to-purple-500 bg-clip-text text-transparent">
            Players in Action
          </h2>
          <p className="text-center text-gray-400 text-lg mb-16">
            Real players, real passion
          </p>
          
          {/* Men's Football Models */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Trophy className="h-8 w-8 text-green-400" />
              <h3 className="text-3xl font-bold text-green-400">Men's Football Action</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['FB MODEL 1.jpeg', 'FB MODEL 2.jpeg', 'FB MODEL 3.jpeg'].map((img, idx) => (
                <div key={idx} className="relative group overflow-hidden rounded-2xl shadow-2xl border-2 border-green-500/30">
                  <img src={`/${img}`} alt={`Football Model ${idx + 1}`} className="w-full h-[400px] object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-6 left-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-5 w-5 text-green-400" />
                        <span className="text-green-300 font-bold">Men's Squad</span>
                      </div>
                      <p className="text-white font-bold text-lg">⚽ Football Pro</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Cricket Action */}
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-8">
                <Trophy className="h-8 w-8 text-orange-400" />
                <h3 className="text-3xl font-bold text-orange-400">Cricket Action</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['Cricket.jpeg', 'Cricket 2.jpeg'].map((img, idx) => (
                  <div key={idx} className="relative group overflow-hidden rounded-2xl shadow-2xl border-2 border-orange-500/30">
                    <img src={`/${img}`} alt={`Cricket Match ${idx + 1}`} className="w-full h-[350px] object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-950/70 to-transparent">
                      <div className="absolute bottom-4 left-4">
                        <p className="text-white font-bold text-lg">🏏 Cricket Action</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Pickleball Champions */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <Target className="h-8 w-8 text-blue-400" />
              <h3 className="text-3xl font-bold text-blue-400">Pickleball Champions</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {['Pickleball model.jpeg', 'Pickleball model 2.jpeg', 'Pickleball model 3.jpeg', 'Pickleball model 4.jpeg'].map((img, idx) => (
                <div key={idx} className="relative group overflow-hidden rounded-2xl shadow-2xl border-2 border-blue-500/30">
                  <img src={`/${img}`} alt={`Pickleball Model ${idx + 1}`} className="w-full h-[350px] object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-4 left-4">
                      <p className="text-white font-bold">🎾 Pickleball Pro</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Meet Ricky Section */}
      <section id="ricky" className="py-20 px-4 bg-gradient-to-b from-black via-blue-950/30 to-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 via-purple-300 to-pink-500 bg-clip-text text-transparent">
            Meet Ricky - Your Sports Guide
          </h2>
          <p className="text-center text-gray-400 text-lg mb-16">
            Our friendly mascot here to help you learn and play! 🎾
          </p>
          
          {/* Ricky Introduction */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="relative group">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-blue-500/30">
                <img src="/Ricky.jpg" alt="Ricky Mascot" className="w-full h-[400px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-900/30 to-transparent">
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-6 w-6 text-blue-400" />
                      <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-bold">
                        MASCOT
                      </span>
                    </div>
                    <p className="text-white font-bold text-2xl">Meet Ricky! 👋</p>
                    <p className="text-blue-200 text-sm mt-1">Your friendly pickleball guide</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-green-500/30">
                <img src="/Ricky Playing.jpg" alt="Ricky Playing" className="w-full h-[400px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-green-950/90 via-green-900/30 to-transparent">
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="h-6 w-6 text-green-400" />
                      <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-bold">
                        IN ACTION
                      </span>
                    </div>
                    <p className="text-white font-bold text-2xl">Ricky Plays! 🎾</p>
                    <p className="text-green-200 text-sm mt-1">Watch and learn from Ricky</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-orange-500/30">
                <img src="/Ricky Coaching.jpeg" alt="Ricky Coaching" className="w-full h-[400px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-950/90 via-orange-900/30 to-transparent">
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-6 w-6 text-orange-400" />
                      <span className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-sm font-bold">
                        COACHING
                      </span>
                    </div>
                    <p className="text-white font-bold text-2xl">Coach Ricky! 📚</p>
                    <p className="text-orange-200 text-sm mt-1">Expert tips and guidance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Learn with Ricky */}
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-2 border-purple-500/30 rounded-3xl p-8 mb-12">
            <h3 className="text-3xl font-bold text-center mb-3 text-purple-300">
              📖 Learn with Ricky
            </h3>
            <p className="text-center text-gray-300 mb-8">
              Ricky explains everything you need to know!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Rules */}
              <div className="relative group overflow-hidden rounded-xl shadow-2xl border-2 border-blue-400/40 bg-gradient-to-br from-blue-900/40 to-cyan-900/40">
                <img src="/Rules.jpg" alt="Ricky Explains Rules" className="w-full h-[350px] object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-900/50 to-transparent">
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-6 w-6 text-blue-300" />
                      <span className="bg-blue-500/30 text-blue-200 px-3 py-1 rounded-full text-xs font-bold">
                        GAME RULES
                      </span>
                    </div>
                    <p className="text-white font-bold text-xl">📜 Rules Explained</p>
                    <p className="text-blue-200 text-sm mt-1">Learn the game basics</p>
                  </div>
                </div>
              </div>
              
              {/* Wow Tips */}
              <div className="relative group overflow-hidden rounded-xl shadow-2xl border-2 border-yellow-400/40 bg-gradient-to-br from-yellow-900/40 to-orange-900/40">
                <img src="/Wow.jpg" alt="Ricky Amazing Tips" className="w-full h-[350px] object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-950/90 via-orange-900/50 to-transparent">
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-6 w-6 text-yellow-300" />
                      <span className="bg-yellow-500/30 text-yellow-200 px-3 py-1 rounded-full text-xs font-bold">
                        PRO TIPS
                      </span>
                    </div>
                    <p className="text-white font-bold text-xl">✨ Wow! Pro Tips</p>
                    <p className="text-yellow-200 text-sm mt-1">Amazing tricks & techniques</p>
                  </div>
                </div>
              </div>
              
              {/* Proposals */}
              <div className="relative group overflow-hidden rounded-xl shadow-2xl border-2 border-purple-400/40 bg-gradient-to-br from-purple-900/40 to-pink-900/40">
                <img src="/Proposal.jpg" alt="Ricky Proposals" className="w-full h-[350px] object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 via-purple-900/50 to-transparent">
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-6 w-6 text-purple-300" />
                      <span className="bg-purple-500/30 text-purple-200 px-3 py-1 rounded-full text-xs font-bold">
                        IDEAS
                      </span>
                    </div>
                    <p className="text-white font-bold text-xl">💡 Game Plans</p>
                    <p className="text-purple-200 text-sm mt-1">Strategy & proposals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Play with Ricky Promo */}
          <div className="text-center">
            <div className="relative inline-block rounded-2xl overflow-hidden shadow-2xl border-4 border-blue-500/50 max-w-3xl mx-auto">
              <img src="/PLAY WITH RICKY Code.jpg" alt="Play with Ricky Promo" className="w-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/60 via-transparent to-transparent pointer-events-none"></div>
            </div>
            <div className="mt-8">
              <Button 
                onClick={() => navigate('/public/booking')}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-10 py-4 text-lg font-bold rounded-full shadow-xl"
              >
                🎾 Play with Ricky Today!
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Carousel */}
      <section id="achievements" className="py-20 px-4 bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden">
        <div className="max-w-7xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-yellow-400 via-orange-300 to-yellow-500 bg-clip-text text-transparent">
            Our Achievements
          </h2>
          <p className="text-center text-gray-400 text-lg mb-4">
            Celebrating success, building champions 🏆
          </p>
        </div>
        
        {/* Infinite Scrolling Carousel */}
        <div className="relative mb-12">
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
          
          {/* Scrolling Container */}
          <div className="flex gap-6 animate-scroll-left">
            {/* First set */}
            {Array.from({ length: 24 }, (_, i) => i + 1).map((num) => (
              <div key={`first-${num}`} className="flex-shrink-0 w-[400px] h-[300px] rounded-xl overflow-hidden shadow-2xl border-2 border-yellow-500/30 group">
                <img 
                  src={`/A${num}.jpeg`} 
                  alt={`Achievement ${num}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
            
            {/* Duplicate for seamless loop */}
            {Array.from({ length: 24 }, (_, i) => i + 1).map((num) => (
              <div key={`second-${num}`} className="flex-shrink-0 w-[400px] h-[300px] rounded-xl overflow-hidden shadow-2xl border-2 border-yellow-500/30 group">
                <img 
                  src={`/A${num}.jpeg`} 
                  alt={`Achievement ${num}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Achievement Stats */}
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-xl p-6">
            <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">100+</p>
            <p className="text-yellow-300 text-sm">Tournaments</p>
          </div>
          <div className="text-center bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-6">
            <Users className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">5000+</p>
            <p className="text-green-300 text-sm">Players</p>
          </div>
          <div className="text-center bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl p-6">
            <Award className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">50+</p>
            <p className="text-green-300 text-sm">Championships</p>
          </div>
          <div className="text-center bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6">
            <Star className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">24+</p>
            <p className="text-purple-300 text-sm">Achievements</p>
          </div>
        </div>
      </section>

      {/* Pickleball Promotion Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-black via-blue-950/20 to-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
            Book Your Pickleball Court
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {['Pickleball45 Book slot.jpg', 'Pickleball45 book slot 3.jpg', 'Pickleball45 Book slot 2.jpg'].map((img, idx) => (
              <div 
                key={idx}
                className="cursor-pointer transform hover:scale-105 transition-transform duration-500"
                onClick={() => navigate('/public/booking')}
              >
                <img src={`/${img}`} alt={`Book Pickleball Slot ${idx + 1}`} className="w-full rounded-2xl shadow-2xl" />
              </div>
            ))}
          </div>
          
          {/* Pickleball Team */}
          <div className="text-center">
            <img src="/Pickleball45 team.jpg" alt="Pickleball Team" className="max-w-4xl mx-auto rounded-2xl shadow-2xl" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-950 to-black border-t border-green-500/20 pt-16 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <img
                src="/Turf45_transparent.png"
                alt="Turf45"
                className="h-16 w-auto mb-4"
                style={{ filter: "drop-shadow(0 2px 8px rgba(16, 185, 129, 0.4))" }}
              />
              <p className="text-gray-400 text-sm mb-4">
                FIFA-approved sports facilities offering premium turf and pickleball courts.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('facilities')} className="text-gray-400 hover:text-green-400 transition-colors text-sm">Facilities</button></li>
                <li><button onClick={() => scrollToSection('coaching')} className="text-gray-400 hover:text-green-400 transition-colors text-sm">Coaching</button></li>
                <li><button onClick={() => navigate('/public/booking')} className="text-gray-400 hover:text-green-400 transition-colors text-sm">Book a Court</button></li>
                <li><button onClick={() => navigate('/public/stations')} className="text-gray-400 hover:text-green-400 transition-colors text-sm">Live Status</button></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-white mb-4">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-gray-400 text-sm">
                  <MapPin className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Turf45, Sports Complex, City</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400 text-sm">
                  <Phone className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span>+91 1234567890</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400 text-sm">
                  <Mail className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span>info@turf45.com</span>
                </li>
              </ul>
            </div>

            {/* Hours */}
            <div>
              <h4 className="font-bold text-white mb-4">Operating Hours</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Monday - Friday: 6 AM - 11 PM</li>
                <li>Saturday - Sunday: 5 AM - 12 AM</li>
                <li className="text-green-400 font-semibold mt-3">Open All Days</li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 Turf45. All rights reserved. | FIFA Approved Courts since 2021
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
