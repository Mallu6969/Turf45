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
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
  Play,
  Trophy,
  Users,
  Sparkles,
  Shield,
  Award,
  Heart,
  Search,
  Menu,
  X,
  ChevronLeft,
  ChevronDown,
  LogIn
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { RickyMascot } from "@/components/RickyMascot";

interface Station {
  id: string;
  name: string;
  type: 'ps5' | '8ball' | 'vr';
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
    <div className="public-page min-h-screen bg-gradient-to-br from-white via-green-50/20 to-white">
      {/* Navigation Bar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'backdrop-blur-md bg-white/60 border-b border-green-100/50 shadow-md' 
          : 'backdrop-blur-xl bg-white/90 border-b border-green-100 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img
                src="/Turf45_transparent.png"
                alt="Turf45 - Premium Sports Facility"
                className="h-12 md:h-14 w-auto object-contain transition-all duration-300 hover:scale-105"
                style={{
                  filter: "drop-shadow(0 2px 8px rgba(16, 185, 129, 0.3))",
                }}
              />
        </div>
        
            {/* Desktop Navigation */}
            {!isMobile && (
              <nav className="hidden md:flex items-center gap-8">
                <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                  About Us
                </button>
                <button onClick={() => scrollToSection('facilities')} className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                  Facilities
                </button>
                <button onClick={() => scrollToSection('how-it-works')} className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                  How It Works
                </button>
                <button onClick={() => scrollToSection('reviews')} className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                  Reviews
                </button>
                <button onClick={() => navigate('/support')} className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                  Support
                </button>
              </nav>
            )}

            {/* Search & Actions */}
            <div className="flex items-center gap-4">
              {!isMobile && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search here..."
                    className="pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-white/50 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 w-48"
                  />
      </div>
              )}

          <Button
                onClick={() => navigate('/public/booking')}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full px-6 shadow-lg shadow-green-500/30 transition-all duration-300 hover:scale-105"
              >
                Book Now
          </Button>

              {isMobile && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && isMobile && (
          <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-3">
              <button onClick={() => scrollToSection('about')} className="block w-full text-left px-4 py-2 rounded-lg hover:bg-green-50 text-gray-700 font-medium">
                About Us
              </button>
              <button onClick={() => scrollToSection('facilities')} className="block w-full text-left px-4 py-2 rounded-lg hover:bg-green-50 text-gray-700 font-medium">
                Facilities
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left px-4 py-2 rounded-lg hover:bg-green-50 text-gray-700 font-medium">
                How It Works
              </button>
              <button onClick={() => scrollToSection('reviews')} className="block w-full text-left px-4 py-2 rounded-lg hover:bg-green-50 text-gray-700 font-medium">
                Reviews
              </button>
              <button onClick={() => navigate('/support')} className="block w-full text-left px-4 py-2 rounded-lg hover:bg-green-50 text-gray-700 font-medium">
                Support
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Enhanced Background with Clean Gradient */}
        <div className="absolute inset-0 z-0">
          {/* Background image */}
          <img
            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80"
            alt="Football Court"
            className="w-full h-full object-cover"
            />
          
          {/* Green gradient overlay for premium feel */}
          <div className="absolute inset-0 bg-gradient-to-b from-green-900/50 via-green-800/40 to-green-900/60 z-10"></div>
          
          {/* Additional subtle green accent for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/25 via-transparent to-green-800/30 z-10"></div>
          </div>

        {/* Floating Badge */}
        <div className="absolute top-8 left-8 z-20">
          <Badge className="bg-white/90 backdrop-blur-md text-green-600 px-4 py-2 rounded-full border border-green-200 shadow-lg">
            All-in-one Sports Facilities Center
          </Badge>
        </div>

        {/* Social Media Icons */}
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-20 hidden lg:flex flex-col gap-4">
          <a href="https://instagram.com/turf45" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/90 backdrop-blur-md rounded-full hover:bg-white transition-all hover:scale-110 shadow-lg">
            <Instagram className="h-5 w-5 text-green-600" />
          </a>
          <a href="https://twitter.com/turf45" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/90 backdrop-blur-md rounded-full hover:bg-white transition-all hover:scale-110 shadow-lg">
            <Twitter className="h-5 w-5 text-green-600" />
          </a>
          <a href="https://facebook.com/turf45" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/90 backdrop-blur-md rounded-full hover:bg-white transition-all hover:scale-110 shadow-lg">
            <Facebook className="h-5 w-5 text-green-600" />
          </a>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-slide-up">
            Refresh, Relax, and Rediscover<br />
            <span className="bg-gradient-to-r from-green-300 via-emerald-200 to-green-100 bg-clip-text text-transparent animate-text-gradient">
              Life's Simple Pleasures
          </span>
        </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed animate-slide-up drop-shadow-lg" style={{ animationDelay: '0.2s' }}>
            Rediscover the beauty in life's simplest pleasures, and let every moment here remind you of the joy of true relaxation.
          </p>
          
          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Button
              onClick={() => navigate('/public/booking')}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full px-8 py-6 text-lg font-semibold shadow-2xl shadow-green-500/50 transition-all duration-300 hover:scale-110 hover:shadow-green-500/70 group animate-breathe"
            >
              Book a Slot
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          <Button
              onClick={() => navigate('/public/booking')}
              variant="outline"
            size="lg"
              className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-full px-8 py-6 text-lg font-semibold hover:bg-white/20 hover:border-white/50 transition-all duration-300 hover:scale-105"
          >
              See Today's Availability
          </Button>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <ChevronDown className="h-8 w-8 text-white/80" />
        </div>

      </section>

      {/* Welcome Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white via-green-50/30 to-gray-50/50 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Outdoor Area Card */}
            <Card className="relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-slide-up">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80"
                alt="Football Court"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <CardContent className="p-6 relative z-10">
                <Badge className="mb-3 bg-green-500/10 text-green-700 border-green-300">Outdoor area</Badge>
                <p className="text-gray-700 font-medium">Versatile space for a wide range of activities.</p>
                <ArrowRight className="mt-4 h-5 w-5 text-green-600 group-hover:translate-x-2 transition-transform" />
              </CardContent>
            </Card>

            {/* Sports Center Card */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-white to-green-50/30 border-2 border-green-200/60 group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-green-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardContent className="p-8 h-full flex flex-col justify-between">
                <div>
                  <Badge className="mb-4 bg-green-500/10 text-green-700 border-green-300">Sports center</Badge>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Welcome to Turf45, where we inspire athletes and fitness enthusiasts to reach new heights.
                  </h3>
                </div>
                <Button
                  onClick={() => navigate('/public/booking')}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full w-fit group-hover:scale-105 transition-transform"
                >
                  Get in touch
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Indoor Court Card */}
            <Card className="relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80"
                alt="Indoor Court"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <CardContent className="p-6 relative z-10">
                <Badge className="mb-3 bg-green-500/10 text-green-700 border-green-300">Indoor</Badge>
                <h4 className="font-bold text-gray-900 mb-2">Pickleball Court</h4>
                <p className="text-gray-700 text-sm mb-4">Explore the ideal space to play, train, and reach new heights. Where passion meets.</p>
                <div className="flex gap-2">
                  <button className="p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors">
                    <ChevronLeft className="h-4 w-4 text-gray-700" />
                  </button>
                  <button className="p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors">
                    <ChevronRight className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Discover Excellence Section */}
      <section id="facilities" className="py-20 px-4 bg-gradient-to-br from-green-50/40 via-white to-gray-50/30 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            {/* Left Content */}
            <div className="flex-1 animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-2">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Turf45</h2>
              </div>

              <div className="flex gap-2 mb-6">
                <Button variant="outline" className="rounded-full">Competition</Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full">Training</Button>
                <Button variant="outline" className="rounded-full">Friendly match</Button>
              </div>

              <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Discover Excellence in Courts, Fields, and Beyond
              </h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                We provide premium courts for both individual and group training. Our advanced sports facilities boast diverse courts and fields for every athlete.
              </p>

              <Button
                onClick={() => navigate('/public/booking')}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full px-8 py-6 text-lg font-semibold shadow-lg shadow-green-500/30"
              >
                Book a Court
              </Button>

              {/* Refer Friends */}
              <div className="mt-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-green-200 shadow-lg">
                <h4 className="font-semibold text-gray-900 mb-4">Refer a friend</h4>
                <div className="flex items-center gap-4">
                  <Button variant="outline" className="rounded-full">Share link</Button>
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="flex-1 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
                <img
                  src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80"
                  alt="Sports Facility"
                  className="w-full h-[600px] object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sport Selector Cards */}
      <section className="py-20 px-4 relative overflow-hidden animate-fade-in">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Choose Your Sport
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select from our premium facilities and book your preferred court
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Football Card */}
            <Card 
              onClick={() => navigate('/public/booking?sport=football')}
              className="relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-transparent hover:border-green-500 animate-slide-up"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80"
                alt="Football Court"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <CardContent className="p-6 relative z-10">
                <Badge className="mb-3 bg-green-500/10 text-green-700 border-green-300">Playground</Badge>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Football</h3>
                <p className="text-gray-600 mb-4">State-of-the-Art FIFA Approved Football Courts for All Athletes.</p>
                <Button 
                  variant="ghost" 
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 p-0 group"
                >
                  Book Now
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>

            {/* Cricket Card */}
            <Card 
              onClick={() => navigate('/public/booking?sport=cricket')}
              className="relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-transparent hover:border-green-500 animate-slide-up"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80"
                alt="Cricket Court"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <CardContent className="p-6 relative z-10">
                <Badge className="mb-3 bg-green-500/10 text-green-700 border-green-300">Playground</Badge>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Cricket</h3>
                <p className="text-gray-600 mb-4">Top-Tier Cricket Facilities for Professional Training.</p>
                <Button 
                  variant="ghost" 
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 p-0 group"
                >
                  Book Now
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>

            {/* Pickleball Card */}
            <Card 
              onClick={() => navigate('/public/booking?sport=pickleball')}
              className="relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-transparent hover:border-green-500 animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80"
                alt="Pickleball Court"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />

              <CardContent className="p-6 relative z-10">
                <Badge className="mb-3 bg-green-500/10 text-green-700 border-green-300">Tennis court</Badge>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Pickleball</h3>
                <p className="text-gray-600 mb-4">State-of-the-Art Courts and Fields for All Athletes.</p>
                <Button 
                  variant="ghost" 
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 p-0 group"
                >
                  Book Now
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-gray-600 mt-8">
            Reserve a court for individual practice, team sessions, or personalized coaching to elevate your performance.
          </p>
                              </div>
      </section>

      {/* Available Today Preview */}
      <section className="py-20 px-4 bg-gradient-to-b from-white via-green-50/25 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Available Today
            </h2>
            <p className="text-lg text-gray-600">
              Quick preview of today's available slots
            </p>
                              </div>

          {stationsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
                            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {liveStations.slice(0, 3).map((station) => (
                <Card key={station.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{station.name}</h3>
                        <p className="text-sm text-gray-600">
                          {station.type === 'ps5' ? 'Football' : station.type === '8ball' ? 'Cricket' : 'Pickleball'}
                        </p>
                      </div>
                      <Badge className={station.is_occupied ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                              {station.is_occupied ? 'Occupied' : 'Available'}
                            </Badge>
                          </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">₹{station.hourly_rate}/hr</span>
                      <Button
                        onClick={() => navigate('/public/booking')}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white rounded-full"
                      >
                        Book Now
                      </Button>
                          </div>
                        </div>
                </Card>
              ))}
                </div>
              )}

          <div className="text-center mt-8">
            <Button
              onClick={() => navigate('/public/booking')}
              variant="outline"
              className="rounded-full border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
            >
              View All Available Slots
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Book your court in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Choose Your Court', description: 'Select from Football, Cricket, or Pickleball courts', icon: Trophy },
              { step: '2', title: 'Pick Your Slot', description: 'Choose your preferred date and time slot', icon: Calendar },
              { step: '3', title: 'Pay & Confirm', description: 'Complete payment and get instant confirmation', icon: CheckCircle2 },
            ].map((item, index) => (
              <Card key={index} className="text-center p-8 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-200 hover:-translate-y-2 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 transition-transform duration-300 hover:scale-110">
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-green-600 mb-4">{item.step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </Card>
            ))}
              </div>
            </div>
      </section>

      {/* Pickleball Mascot - Ricky Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-50/30 via-white to-emerald-50/20 relative overflow-hidden animate-fade-in">
        {/* Subtle decorative background elements */}
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute top-0 left-0 w-96 h-96 bg-green-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Ricky Mascot Image */}
            <div className="relative animate-slide-up">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
                {/* Ricky Mascot - transparent background, no white background */}
                <div className="aspect-square flex items-center justify-center bg-transparent p-8">
                  <RickyMascot
                    size="xl"
                    className="mx-auto"
                  />
                </div>
              </div>
            </div>

            {/* Right: Content with Pickleball Logo */}
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-4 mb-6">
                {/* Pickleball Logo */}
                <div className="flex-shrink-0">
                  <img
                    src="https://iili.io/flpj90Q.jpg"
                    alt="Pickleball Logo"
                    className="h-16 w-16 object-contain"
                  />
                </div>
                <Badge className="bg-green-500/10 text-green-700 border-green-300">Pickleball Mascot</Badge>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Meet Ricky - Our Pickleball Mascot
              </h2>
              
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Ricky is the official mascot of Turf45's Pickleball courts! This energetic and friendly rabbit loves pickleball and is here to welcome you to our premium pickleball facilities. Join Ricky on the court for an amazing pickleball experience!
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3 p-4 bg-white/80 rounded-xl border border-green-100">
                  <Trophy className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Official Pickleball Mascot</h3>
                    <p className="text-gray-600 text-sm">Ricky represents our commitment to pickleball excellence</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white/80 rounded-xl border border-green-100">
                  <Heart className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Friendly & Energetic</h3>
                    <p className="text-gray-600 text-sm">Ricky brings fun and excitement to every game</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white/80 rounded-xl border border-green-100">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Premium Facilities</h3>
                    <p className="text-gray-600 text-sm">Play on state-of-the-art pickleball courts with Ricky</p>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => navigate('/public/booking?sport=pickleball')}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full px-8 py-6 text-lg font-semibold shadow-lg shadow-green-500/30 transition-all duration-300 hover:scale-105"
              >
                Book Pickleball Court
              </Button>
            </div>
              </div>
            </div>
      </section>

      {/* Why Players Choose Turf45 */}
      <section className="py-20 px-4 bg-gradient-to-br from-white via-green-50/35 to-white animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Why Players Choose Turf45</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From FIFA-approved surfaces to pro-grade lighting, every detail is engineered for peak performance and unforgettable sessions.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                title: "Pro Surfaces & Lighting",
                body: "FIFA-approved football turf, ICC-inspired cricket wickets, and USA Pickleball-ready courts with calibrated lighting for clean ball tracking day or night.",
                points: ["Match-quality grass infill", "Even bounce & traction", "Weather-ready drainage"],
              },
              {
                title: "Player Services",
                body: "On-ground coordinators, hydration points, digital waivers, and instant confirmations keep you focused on the game—not logistics.",
                points: ["Fast check-in", "Real-time slot sync", "On-call support"],
              },
              {
                title: "Performance & Safety",
                body: "Regular turf audits, shock-absorbent underlay, and sanitization between sessions to reduce fatigue and keep your squad protected.",
                points: ["Impact-tested padding", "Non-slip sidelines", "Pre-game inspection"],
              },
            ].map((item, idx) => (
              <Card key={idx} className="p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-100/70 hover:-translate-y-2 animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md">
                    <Shield className="h-5 w-5" />
                </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{item.body}</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {item.points.map((p) => (
                        <li key={p} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>{p}</span>
                </li>
                      ))}
              </ul>
            </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Packages & Training */}
      <section className="py-20 px-4 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Memberships, Coaching & Group Play</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Flexible options for solo practice, squads, academies, and corporate leagues. Pay per slot or lock in season passes.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="p-8 border border-green-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-slide-up">
              <Badge className="mb-4 bg-green-500/10 text-green-700 border-green-300">Season Pass</Badge>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">6-Week Grind</h3>
              <p className="text-gray-600 mb-4">Lock in consistent training with priority slots and lower hourly rates.</p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />Reserved prime-time windows</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />Up to 20% savings on add-on slots</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />Team roster tagging</li>
              </ul>
              <Button onClick={() => navigate('/public/booking')} className="rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white w-full">View Slots</Button>
            </Card>

            <Card className="p-8 border border-green-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <Badge className="mb-4 bg-amber-100 text-amber-700 border-amber-300">Coaching</Badge>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Skill Labs</h3>
              <p className="text-gray-600 mb-4">Certified coaches for fundamentals, match IQ, and conditioning.</p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />1:1 or small-group sessions</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />Video breakdown add-on</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />Warm-up & cooldown protocols</li>
              </ul>
              <Button onClick={() => navigate('/public/booking')} className="rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white w-full">Book Coaching</Button>
            </Card>

            <Card className="p-8 border border-green-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">Groups & Events</Badge>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Leagues & Corporate</h3>
              <p className="text-gray-600 mb-4">End-to-end turf management for leagues, corporate days, and tournaments.</p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />Block bookings & bulk pricing</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />Officials & equipment on request</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />On-site coordination & PA support</li>
              </ul>
              <Button onClick={() => navigate('/support')} variant="outline" className="rounded-full border-2 border-green-600 text-green-700 hover:bg-green-50 w-full">Talk to Us</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 px-4 bg-gradient-to-b from-white via-green-50/30 to-white animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-slide-up">
            <div className="flex items-center justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600">
              Trusted by athletes and sports enthusiasts
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Rajesh Kumar', rating: 5, text: 'Excellent facilities! The football court is FIFA approved and well-maintained. Booking was super easy.' },
              { name: 'Priya Sharma', rating: 5, text: 'Love the cricket facilities here. Professional setup and great customer service. Highly recommended!' },
              { name: 'Amit Patel', rating: 5, text: 'Best pickleball court in the city. Clean, modern, and the booking system is very convenient.' },
            ].map((review, index) => (
              <Card key={index} className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{review.text}"</p>
                <p className="font-semibold text-gray-900">— {review.name}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section id="about" className="py-20 px-4 relative overflow-hidden animate-fade-in">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <Badge className="mb-4 bg-green-500/10 text-green-700 border-green-300">Our Story</Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Meet Jai - Our Founder
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                With a passion for sports and a vision to create world-class facilities, Jai founded Turf45 to provide athletes and sports enthusiasts with premium courts and fields. His dedication to excellence and commitment to quality has made Turf45 the premier destination for football, cricket, and pickleball in the region.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                At Turf45, we believe that every athlete deserves access to top-tier facilities. Our mission is to inspire and empower athletes to reach their full potential through our state-of-the-art courts and exceptional service.
              </p>
              <Button
                onClick={() => navigate('/public/booking')}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full px-8 py-6 text-lg font-semibold shadow-lg shadow-green-500/30"
              >
                Book Your Court Today
              </Button>
            </div>
            <div className="relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-green-400/20 rounded-3xl blur-2xl animate-pulse"></div>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
                  alt="Founder"
                  className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-50/25 via-white to-white animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about booking
            </p>
            </div>
            
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="payment-failed" className="bg-white rounded-xl border-2 border-green-100 px-6">
              <AccordionTrigger className="text-left font-semibold text-gray-900 hover:no-underline">
                What should I do if payment fails?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                If your payment fails, please try again. If the issue persists, contact our support team at +91 93451 87098 or email contact@turf45.in. We'll help you complete your booking.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cancel-reschedule" className="bg-white rounded-xl border-2 border-green-100 px-6">
              <AccordionTrigger className="text-left font-semibold text-gray-900 hover:no-underline">
                Can I cancel or reschedule my booking?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Yes, you can cancel or reschedule your booking up to 2 hours before your scheduled time. Please refer to our <a href="/refund-policy" className="text-green-600 hover:underline">Cancellation & Refund Policy</a> for detailed information.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="confirmation" className="bg-white rounded-xl border-2 border-green-100 px-6">
              <AccordionTrigger className="text-left font-semibold text-gray-900 hover:no-underline">
                How will I receive booking confirmation?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                You'll receive an instant confirmation via SMS and email after successful payment. You can also view your booking details in your account dashboard.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="arrival-time" className="bg-white rounded-xl border-2 border-green-100 px-6">
              <AccordionTrigger className="text-left font-semibold text-gray-900 hover:no-underline">
                When should I arrive for my booking?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                We recommend arriving 10-15 minutes before your scheduled time to complete check-in and warm-up. Your court will be ready at your booked time.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
                  </div>
                    </section>
                    
      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/Turf45_transparent.png"
                  alt="Turf45 Logo"
                  className="h-12 w-auto object-contain"
                  style={{
                    filter: "drop-shadow(0 2px 8px rgba(16, 185, 129, 0.3))",
                  }}
                />
                      </div>
              <p className="text-gray-400 text-sm">
                Premium sports facilities for football, cricket, and pickleball. Book your court today!
              </p>
                    </div>
                    
                      <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/support" className="hover:text-green-400 transition-colors">Support</a></li>
                <li><a href="/refund-policy" className="hover:text-green-400 transition-colors">Cancellation & Refund Policy</a></li>
                <li><a href="/terms" className="hover:text-green-400 transition-colors">Terms & Conditions</a></li>
                <li><a href="/privacy" className="hover:text-green-400 transition-colors">Privacy Policy</a></li>
              </ul>
                    </div>
                    
                      <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a href="tel:+919345187098" className="hover:text-green-400 transition-colors">+91 93451 87098</a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:contact@turf45.in" className="hover:text-green-400 transition-colors">contact@turf45.in</a>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Chennai, Tamil Nadu</span>
                </li>
              </ul>
                    </div>
                    
                      <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <a href="https://instagram.com/turf45" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-green-500 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://twitter.com/turf45" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-green-500 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://facebook.com/turf45" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-green-500 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                  </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-400">© {new Date().getFullYear()} Turf45. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <a 
                  href="/login" 
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-400 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Management Login
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
  );
};

export default Index;
