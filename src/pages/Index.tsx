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
  Search,
  Menu,
  X,
  ChevronDown,
  LogIn,
  Zap,
  Target,
  TrendingUp,
  Video,
  Wifi,
  Droplets,
  Sun,
  Lightbulb,
  CheckCircle,
  PlayCircle,
  DollarSign,
  Timer,
  UserCheck,
  Map
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
    <div className="public-page min-h-screen bg-white">
      {/* Premium Navigation Bar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'backdrop-blur-xl bg-white/80 border-b border-gray-100 shadow-lg' 
          : 'backdrop-blur-md bg-white/95 border-b border-gray-50'
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
                  filter: "drop-shadow(0 2px 12px rgba(16, 185, 129, 0.4))",
                }}
              />
        </div>
        
            {/* Desktop Navigation */}
            {!isMobile && (
              <nav className="hidden md:flex items-center gap-8">
                <button onClick={() => scrollToSection('facilities')} className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                  Facilities
                </button>
                <button onClick={() => scrollToSection('pricing')} className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                  Pricing
                </button>
                <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                  About
                </button>
                <button onClick={() => scrollToSection('reviews')} className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                  Reviews
                </button>
                <button onClick={() => navigate('/support')} className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                  Contact
                </button>
              </nav>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4">
              {!isMobile && (
                <Button
                  onClick={() => navigate('/public/booking')}
                  variant="outline"
                  className="rounded-full border-2 border-green-600 text-green-600 hover:bg-green-50"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  View Availability
                </Button>
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
              <button onClick={() => scrollToSection('facilities')} className="block w-full text-left px-4 py-2 rounded-lg hover:bg-green-50 text-gray-700 font-medium">
                Facilities
              </button>
              <button onClick={() => scrollToSection('pricing')} className="block w-full text-left px-4 py-2 rounded-lg hover:bg-green-50 text-gray-700 font-medium">
                Pricing
              </button>
              <button onClick={() => scrollToSection('about')} className="block w-full text-left px-4 py-2 rounded-lg hover:bg-green-50 text-gray-700 font-medium">
                About
              </button>
              <button onClick={() => scrollToSection('reviews')} className="block w-full text-left px-4 py-2 rounded-lg hover:bg-green-50 text-gray-700 font-medium">
                Reviews
              </button>
              <button onClick={() => navigate('/support')} className="block w-full text-left px-4 py-2 rounded-lg hover:bg-green-50 text-gray-700 font-medium">
                Contact
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section - Premium Design */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Dynamic Background - Original */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80"
            alt="FIFA Approved Football Court"
            className="w-full h-full object-cover"
            />
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 via-green-800/85 to-emerald-900/90"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.3)_100%)]"></div>
          </div>

        {/* Floating Trust Badges */}
        <div className="absolute top-32 left-8 z-20 animate-fade-in hidden lg:block">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-green-100">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900">FIFA Approved</p>
                <p className="text-sm text-gray-600">Premium Turf</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Status Indicator */}
        <div className="absolute top-32 right-8 z-20 animate-fade-in hidden lg:block">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-green-100">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
              </div>
              <div>
                <p className="font-bold text-gray-900">Live Booking</p>
                <p className="text-sm text-gray-600">{liveStations.filter(s => !s.is_occupied).length} Courts Available</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center text-white animate-fade-in">
          <Badge className="mb-6 bg-green-500/20 backdrop-blur-sm text-green-100 px-6 py-3 text-base border border-green-400/30 animate-slide-up">
            🏆 FIFA Approved Football & Cricket Turf - ESTD 2021
          </Badge>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Premium Sports
            <br />
            <span className="bg-gradient-to-r from-green-300 via-emerald-200 to-green-100 bg-clip-text text-transparent">
              Facilities Redefined
          </span>
        </h1>
          
          <p className="text-xl md:text-2xl text-green-50 mb-10 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Experience world-class FIFA-approved football courts, professional cricket turfs, and premium pickleball facilities. Book your slot in seconds.
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
              onClick={() => scrollToSection('facilities')}
              variant="outline"
            size="lg"
              className="bg-transparent backdrop-blur-sm border-2 border-white/50 text-white rounded-full px-10 py-7 text-lg font-semibold hover:bg-white/10 hover:border-white transition-all duration-300"
          >
              <PlayCircle className="mr-2 h-5 w-5" />
              Explore Facilities
          </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.4s' }}>
            {[
              { number: '1000+', label: 'Matches Played', icon: Trophy },
              { number: '500+', label: 'Happy Athletes', icon: Users },
              { number: '99%', label: 'Satisfaction Rate', icon: Star },
              { number: '24/7', label: 'Support Available', icon: Shield },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <stat.icon className="h-8 w-8 text-green-300 mx-auto mb-3" />
                <p className="text-3xl font-black text-white mb-1">{stat.number}</p>
                <p className="text-sm text-green-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <div className="flex flex-col items-center">
            <p className="text-white text-sm mb-2 font-medium">Discover More</p>
            <ChevronDown className="h-8 w-8 text-white" />
          </div>
        </div>
      </section>

      {/* Quick Booking Bar */}
      <section className="bg-gradient-to-r from-green-500 to-green-600 py-6 px-4 shadow-xl sticky top-20 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-white">
            <Zap className="h-6 w-6" />
            <p className="font-semibold">Quick Booking - Get instant confirmation in seconds!</p>
                </div>
          <div className="flex gap-3">
            {['Football', 'Cricket', 'Pickleball'].map((sport) => (
                <Button
                key={sport}
                onClick={() => navigate(`/public/booking?sport=${sport.toLowerCase()}`)}
                variant="outline"
                className="bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white hover:text-green-600 rounded-full font-semibold"
              >
                {sport}
                </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Live Availability Dashboard */}
      <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <Badge className="mb-4 bg-green-500/10 text-green-700 border-green-300">Live Updates</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Available Right Now
            </h2>
            <p className="text-lg text-gray-600">Real-time availability across all courts</p>
              </div>

          {stationsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
              </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {liveStations.map((station) => (
                <Card key={station.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-green-500 group">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-xl text-gray-900">{station.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <MapPin className="h-3 w-3" />
                          {station.type === 'ps5' ? 'Football Court' : station.type === '8ball' ? 'Cricket Turf' : 'Pickleball Court'}
                        </p>
                      </div>
                      <Badge className={station.is_occupied ? 'bg-red-100 text-red-700 border-red-300' : 'bg-green-100 text-green-700 border-green-300 animate-pulse'}>
                        {station.is_occupied ? 'Occupied' : 'Available'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-sm text-gray-500">Starting from</p>
                        <p className="text-3xl font-bold text-gray-900">₹{station.hourly_rate}<span className="text-lg text-gray-500">/hr</span></p>
                      </div>
              <Button
                onClick={() => navigate('/public/booking')}
                        disabled={station.is_occupied}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full group-hover:scale-105 transition-transform disabled:opacity-50"
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
              size="lg"
              className="rounded-full border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
            >
              View All Courts & Timings
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Premium Facilities Showcase */}
      <section id="facilities" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-500/10 text-green-700 border-green-300">World-Class Infrastructure</Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Premium Sports Facilities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              State-of-the-art courts designed for professional athletes and sports enthusiasts
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Football */}
            <Card 
              onClick={() => navigate('/public/booking?sport=football')}
              className="group cursor-pointer overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 border-transparent hover:border-green-500 animate-fade-in"
            >
              <div className="relative h-72">
              <img
                src="/T45 TOP VIEW.jpeg"
                  alt="Turf45 FIFA Approved Football Court - Aerial View"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <Badge className="absolute top-4 left-4 bg-green-500 text-white border-0">FIFA Approved</Badge>
                
                {/* Mini Gallery Overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <img src="/FB MODEL 1.jpeg" alt="Football Action" className="w-16 h-16 object-cover rounded-lg border-2 border-white" />
                  <img src="/FB MODEL 2.jpeg" alt="Football Action" className="w-16 h-16 object-cover rounded-lg border-2 border-white" />
                  <img src="/FB MODEL 3.jpeg" alt="Football Action" className="w-16 h-16 object-cover rounded-lg border-2 border-white" />
                </div>
              </div>
              <CardContent className="p-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-3">Football Courts</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  FIFA-approved synthetic turf with professional-grade drainage system. Perfect for 5-a-side and 7-a-side matches.
                </p>
                <ul className="space-y-2 mb-6">
                  {['Premium FIFA-approved turf', 'Professional floodlights', 'Standard goal posts', 'Covered seating area'].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full group-hover:scale-105 transition-transform">
                  Book Football Court
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Cricket */}
            <Card 
              onClick={() => navigate('/public/booking?sport=cricket')}
              className="group cursor-pointer overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 border-transparent hover:border-green-500 animate-fade-in delay-100"
            >
              <div className="relative h-72">
              <img
                src="/Cricket.jpeg"
                  alt="Professional Cricket Turf Action"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <Badge className="absolute top-4 left-4 bg-blue-500 text-white border-0">Professional Grade</Badge>
                
                {/* Mini Gallery Overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <img src="/Cricket.jpeg" alt="Cricket Match" className="w-16 h-16 object-cover rounded-lg border-2 border-white" />
                  <img src="/Cricket 2.jpeg" alt="Cricket Action" className="w-16 h-16 object-cover rounded-lg border-2 border-white" />
                  <img src="/Practice Match.jpg" alt="Practice" className="w-16 h-16 object-cover rounded-lg border-2 border-white" />
                </div>
              </div>
              <CardContent className="p-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-3">Cricket Turfs</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Professional cricket turf with authentic bounce and pace. Ideal for practice sessions and competitive matches.
                </p>
                <ul className="space-y-2 mb-6">
                  {['Professional turf wicket', 'Practice nets available', 'Cricket equipment rental', 'Covered pavilion'].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full group-hover:scale-105 transition-transform">
                  Book Cricket Turf
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Pickleball */}
            <Card 
              onClick={() => navigate('/public/booking?sport=pickleball')}
              className="group cursor-pointer overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 border-transparent hover:border-green-500 animate-fade-in delay-200"
            >
              <div className="relative h-72">
              <img
                src="/Pickleball top view.jpeg"
                  alt="Premium Pickleball Court - Aerial View"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <Badge className="absolute top-4 left-4 bg-purple-500 text-white border-0">Indoor Court</Badge>
                
                {/* Mini Gallery Overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <img src="/Pickleball model.jpeg" alt="Pickleball" className="w-16 h-16 object-cover rounded-lg border-2 border-white" />
                  <img src="/Pickleball model 2.jpeg" alt="Pickleball" className="w-16 h-16 object-cover rounded-lg border-2 border-white" />
                  <img src="/Pickleball model 3.jpeg" alt="Pickleball" className="w-16 h-16 object-cover rounded-lg border-2 border-white" />
                  <img src="/Pickleball model 4.jpeg" alt="Pickleball" className="w-16 h-16 object-cover rounded-lg border-2 border-white" />
                </div>
              </div>
              <CardContent className="p-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-3">Pickleball Courts</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  State-of-the-art indoor pickleball courts with climate control. Perfect for players of all skill levels.
                </p>
                <ul className="space-y-2 mb-6">
                  {['Tournament-grade court', 'Climate controlled', 'Equipment provided', 'Beginner-friendly'].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full group-hover:scale-105 transition-transform">
                  Book Pickleball Court
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Facility Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Lightbulb, title: 'Pro Lighting', desc: 'LED floodlights for night games' },
              { icon: Droplets, title: 'Drainage System', desc: 'Advanced water management' },
              { icon: Wifi, title: 'Free WiFi', desc: 'Stay connected at all times' },
              { icon: Video, title: 'CCTV Security', desc: '24/7 surveillance for safety' },
              { icon: UserCheck, title: 'Trained Staff', desc: 'Professional on-ground support' },
              { icon: Timer, title: 'Flexible Timing', desc: 'Early morning to late night' },
              { icon: Shield, title: 'Insured Facility', desc: 'Complete safety coverage' },
              { icon: DollarSign, title: 'Best Pricing', desc: 'Transparent & competitive rates' },
            ].map((feature, idx) => (
              <Card key={idx} className="p-6 text-center hover:shadow-lg transition-all duration-300 border-2 border-gray-100 hover:border-green-200">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PLAYERS IN ACTION - MEGA SECTION */}
      <section className="relative py-32 px-4 overflow-hidden bg-gradient-to-br from-green-900 via-green-800 via-white/15 via-green-600/90 via-white/10 to-green-900">
        {/* Animated Background Effects */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-96 h-96 bg-green-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse delay-300"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Main Title */}
          <div className="text-center mb-20 animate-fade-in">
            <div className="inline-block mb-6">
              <div className="bg-gradient-to-r from-green-400 via-blue-400 to-pink-400 text-transparent bg-clip-text">
                <h2 className="text-6xl md:text-7xl font-black mb-4 animate-text-gradient">
                  PLAYERS IN ACTION
                </h2>
              </div>
            </div>
            <p className="text-2xl text-black max-w-3xl mx-auto animate-slide-up delay-100">
              Witness excellence, passion, and dedication in every frame
            </p>
          </div>

          {/* WOMEN'S FOOTBALL TEAM - WITH ADIDAS BRANDING */}
          <div className="mb-32 animate-fade-in delay-200">
            <div className="flex items-center justify-center gap-6 mb-12">
              <div className="h-1 w-24 bg-gradient-to-r from-transparent via-pink-500 to-pink-500"></div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-4 mb-3">
                  <h3 className="text-4xl md:text-5xl font-black text-black">WOMEN'S FOOTBALL</h3>
                  {/* Adidas Branding */}
                  <div className="bg-white px-4 py-2 rounded-lg shadow-2xl animate-pulse">
                    <span className="text-black font-black text-2xl">adidas</span>
                  </div>
                </div>
                <p className="text-black text-xl font-semibold">Official Partner</p>
              </div>
              <div className="h-1 w-24 bg-gradient-to-l from-transparent via-pink-500 to-pink-500"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group relative overflow-hidden rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-700 animate-slide-up delay-300">
                <img src="/Football 1.jpeg" alt="Women's Football Team" className="w-full h-[500px] object-cover group-hover:scale-110 transition-transform duration-700" />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-pink-900/95 via-pink-800/50 to-transparent group-hover:from-pink-900/90 transition-all"></div>
                
                {/* Adidas Logo Overlay */}
                <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border-2 border-white/30">
                  <span className="text-white font-black text-lg">adidas</span>
                </div>
                
                {/* Content */}
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center gap-3 mb-4 animate-slide-up delay-400">
                    <Trophy className="h-10 w-10 text-pink-400 animate-bounce-slow" />
                    <span className="bg-pink-500/40 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold border-2 border-white/30">
                      CHAMPIONS
                    </span>
                  </div>
                  <h4 className="text-4xl font-black text-white mb-2 drop-shadow-2xl">Team Unity</h4>
                  <p className="text-pink-100 text-lg drop-shadow-lg">Empowered by adidas • Champions by choice</p>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-700 animate-slide-up delay-400">
                <img src="/Football 2.jpeg" alt="Women's Football Action" className="w-full h-[500px] object-cover group-hover:scale-110 transition-transform duration-700" />
                
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/95 via-purple-800/50 to-transparent group-hover:from-purple-900/90 transition-all"></div>
                
                {/* Adidas Logo */}
                <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border-2 border-white/30">
                  <span className="text-white font-black text-lg">adidas</span>
                </div>
                
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center gap-3 mb-4 animate-slide-up delay-500">
                    <Heart className="h-10 w-10 text-purple-400 animate-pulse" />
                    <span className="bg-purple-500/40 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold border-2 border-white/30">
                      GAME DAY
                    </span>
                  </div>
                  <h4 className="text-4xl font-black text-white mb-2 drop-shadow-2xl">Match Ready</h4>
                  <p className="text-purple-100 text-lg drop-shadow-lg">Excellence in every play • Powered by adidas</p>
                </div>
              </div>
            </div>
          </div>

          {/* MEN'S FOOTBALL ACTION */}
          <div className="mb-32">
            <div className="flex items-center justify-center gap-6 mb-12">
              <div className="h-1 w-24 bg-gradient-to-r from-transparent via-green-500 to-green-500"></div>
              <h3 className="text-4xl md:text-5xl font-black text-black">
                ⚽ FOOTBALL
              </h3>
              <div className="h-1 w-24 bg-gradient-to-l from-transparent via-green-500 to-green-500"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {['FB MODEL 1.jpeg', 'FB MODEL 2.jpeg', 'FB MODEL 3.jpeg'].map((img, idx) => (
                <div key={idx} className={`group relative overflow-hidden rounded-3xl shadow-2xl transform hover:scale-110 hover:rotate-2 transition-all duration-700 animate-flip-in`} style={{ animationDelay: `${idx * 100}ms` }}>
                  <img src={`/${img}`} alt={`Football Pro ${idx + 1}`} className="w-full h-[450px] object-cover group-hover:scale-110 transition-transform duration-700" />
                  
                  {/* Animated Border */}
                  <div className="absolute inset-0 border-4 border-green-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-green-950/95 via-green-900/60 to-transparent opacity-80 group-hover:opacity-100 transition-all">
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="bg-green-500/30 backdrop-blur-md px-4 py-2 rounded-full inline-block mb-3 border-2 border-green-400">
                        <span className="text-white font-bold text-sm">⚽ PRO PLAYER {idx + 1}</span>
                      </div>
                      <h5 className="text-2xl font-black text-white drop-shadow-2xl">Champion Striker</h5>
                      <p className="text-green-200 text-sm drop-shadow-lg">Excellence in action</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CRICKET ACTION */}
          <div className="mb-32">
            <div className="flex items-center justify-center gap-6 mb-12">
              <div className="h-1 w-24 bg-gradient-to-r from-transparent via-orange-500 to-orange-500"></div>
              <h3 className="text-4xl md:text-5xl font-black text-black">
                🏏 CRICKET CHAMPIONS
              </h3>
              <div className="h-1 w-24 bg-gradient-to-l from-transparent via-orange-500 to-orange-500"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {['Cricket.jpeg', 'Cricket 2.jpeg'].map((img, idx) => (
                <div key={idx} className={`group relative overflow-hidden rounded-3xl shadow-2xl transform hover:scale-105 hover:-rotate-1 transition-all duration-700 animate-scale-in`} style={{ animationDelay: `${idx * 150}ms` }}>
                  <img src={`/${img}`} alt={`Cricket Action ${idx + 1}`} className="w-full h-[400px] object-cover group-hover:scale-110 transition-transform duration-700" />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-950/95 via-orange-900/60 to-transparent group-hover:from-orange-950/90 transition-all">
                    <div className="absolute bottom-8 left-8 right-8">
                      <div className="bg-orange-500/40 backdrop-blur-md px-6 py-3 rounded-full inline-block mb-4 border-2 border-orange-400 shadow-2xl">
                        <span className="text-white font-black text-lg">🏏 LIVE ACTION</span>
                      </div>
                      <h5 className="text-3xl font-black text-white drop-shadow-2xl">Cricket Excellence</h5>
                      <p className="text-orange-200 text-lg drop-shadow-lg">Professional grade performance</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PICKLEBALL PLAYERS */}
          <div className="mb-32">
            <div className="flex items-center justify-center gap-6 mb-12">
              <div className="h-1 w-24 bg-gradient-to-r from-transparent via-blue-500 to-blue-500"></div>
              <h3 className="text-4xl md:text-5xl font-black text-black">
                🎾 PICKLEBALL STARS
              </h3>
              <div className="h-1 w-24 bg-gradient-to-l from-transparent via-blue-500 to-blue-500"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {['Pickleball model.jpeg', 'Pickleball model 2.jpeg', 'Pickleball model 3.jpeg', 'Pickleball model 4.jpeg'].map((img, idx) => (
                <div key={idx} className={`group relative overflow-hidden rounded-2xl shadow-2xl transform hover:scale-110 transition-all duration-700 animate-fade-in`} style={{ animationDelay: `${idx * 100}ms` }}>
                  <img src={`/${img}`} alt={`Pickleball Pro ${idx + 1}`} className="w-full h-[350px] object-cover group-hover:scale-110 transition-transform duration-700" />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/95 via-blue-900/60 to-transparent opacity-90 group-hover:opacity-100 transition-all">
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-blue-500/40 backdrop-blur-md px-3 py-1 rounded-full inline-block mb-2 border border-blue-400">
                        <span className="text-white font-bold text-xs">🎾 STAR #{idx + 1}</span>
                      </div>
                      <h6 className="text-lg font-black text-white drop-shadow-xl">Pickleball Pro</h6>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BOOK YOUR PICKLEBALL - SUB-SECTION */}
          <div className="bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-3xl p-12 border-2 border-blue-500/30 shadow-2xl animate-fade-in">
            <div className="text-center mb-12">
              <h3 className="text-4xl md:text-5xl font-black text-black mb-4">
                🎾 BOOK YOUR PICKLEBALL COURT
              </h3>
              <p className="text-2xl text-black">Reserve your spot for the ultimate pickleball experience</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {['Pickleball45 Book slot.jpg', 'Pickleball45 book slot 3.jpg', 'Pickleball45 Book slot 2.jpg'].map((img, idx) => (
                <div 
                  key={idx}
                  className="group relative cursor-pointer transform hover:scale-110 hover:rotate-2 transition-all duration-700 rounded-2xl overflow-hidden shadow-2xl animate-slide-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                  onClick={() => navigate('/public/booking')}
                >
                  <img src={`/${img}`} alt={`Book Pickleball ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button className="bg-white text-blue-600 hover:bg-blue-50 font-black px-8 py-4 text-lg rounded-full shadow-2xl">
                      BOOK NOW
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <img src="/Pickleball45 team.jpg" alt="Pickleball Team" className="max-w-4xl mx-auto rounded-2xl shadow-2xl mb-8 animate-fade-in delay-300" />
              <Button 
                onClick={() => navigate('/public/booking')}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-12 py-6 text-2xl font-black rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300"
              >
                BOOK YOUR COURT NOW
                <ArrowRight className="ml-3 h-8 w-8" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Coaching - Animated Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <Badge className="mb-4 bg-orange-500/10 text-orange-700 border-orange-300">Expert Training</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Professional Coaching Programs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your game with certified coaches and structured training
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Football Coaching */}
            <div className="relative rounded-2xl overflow-hidden group shadow-2xl border-2 border-green-200 animate-slide-up">
              <img src="/FB Coaching 1.jpg" alt="Football Coaching" className="w-full h-[500px] object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-green-950/95 via-green-900/50 to-transparent group-hover:from-green-950/90 transition-all">
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center gap-2 mb-3 animate-slide-up delay-100">
                    <Trophy className="h-8 w-8 text-green-400" />
                    <span className="bg-green-500/30 text-green-200 px-4 py-2 rounded-full text-sm font-bold">⚽ FOOTBALL</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-3 animate-slide-up delay-150">Elite Football Training</h3>
                  <p className="text-green-100 text-lg mb-4 animate-slide-up delay-200">Professional coaching with certified trainers</p>
                  <ul className="text-green-200 space-y-2 text-sm mb-4 animate-slide-up delay-250">
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Individual & Group Sessions</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Skill Development Programs</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Match Preparation & Tactics</li>
                  </ul>
                  <Button className="bg-green-600 hover:bg-green-700 text-white animate-slide-up delay-300">
                    Enroll Now
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Multi-Sport Coaching */}
            <div className="relative rounded-2xl overflow-hidden group shadow-2xl border-2 border-orange-200 animate-slide-up delay-100">
              <img src="/FB Coaching 2.jpeg" alt="Sports Coaching" className="w-full h-[500px] object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-950/95 via-orange-900/50 to-transparent group-hover:from-orange-950/90 transition-all">
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center gap-2 mb-3 animate-slide-up delay-150">
                    <Trophy className="h-8 w-8 text-orange-400" />
                    <span className="bg-orange-500/30 text-orange-200 px-4 py-2 rounded-full text-sm font-bold">🏏 MULTI-SPORT</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-3 animate-slide-up delay-200">Cricket & Sports Mastery</h3>
                  <p className="text-orange-100 text-lg mb-4 animate-slide-up delay-250">Expert training across multiple disciplines</p>
                  <ul className="text-orange-200 space-y-2 text-sm mb-4 animate-slide-up delay-300">
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Cricket Fundamentals</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Batting & Bowling Techniques</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Fitness & Conditioning</li>
                  </ul>
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white animate-slide-up delay-350">
                    Enroll Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Turf45 */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-green-500/10 text-green-700 border-green-300">Why Turf45?</Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                The Premier Choice for Athletes
            </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                From FIFA-approved surfaces to professional-grade amenities, every aspect of Turf45 is engineered for peak athletic performance and unforgettable sports experiences.
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: Trophy,
                    title: 'FIFA Approved Standards',
                    desc: 'International quality turf certified for professional play'
                  },
                  {
                    icon: Target,
                    title: 'Professional Equipment',
                    desc: 'High-quality goal posts, nets, and sports gear'
                  },
                  {
                    icon: TrendingUp,
                    title: 'Advanced Booking System',
                    desc: 'Real-time availability with instant confirmation'
                  },
                  {
                    icon: Shield,
                    title: 'Safe & Sanitized',
                    desc: 'Regular cleaning and maintenance protocols'
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-green-200 hover:shadow-lg transition-all">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 flex-shrink-0">
                      <item.icon className="h-6 w-6 text-white" />
                            </div>
                      <div>
                      <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl blur-3xl opacity-20"></div>
              <img
                src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80"
                alt="Premium Sports Facility"
                className="relative rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & Packages */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-500/10 text-green-700 border-green-300">Flexible Options</Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from pay-per-slot or season passes. All prices include taxes - no hidden charges.
                        </p>
                      </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Pay Per Slot */}
            <Card className="border-2 border-gray-200 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="text-center mb-6">
                <Badge className="mb-4 bg-gray-100 text-gray-700">Flexible</Badge>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pay Per Slot</h3>
                <p className="text-gray-600 mb-6">Book whenever you want</p>
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  ₹600<span className="text-2xl text-gray-500">/hr</span>
                          </div>
                <p className="text-sm text-gray-500">Starting price</p>
              </div>
              <ul className="space-y-3 mb-8">
                {['Instant booking confirmation', 'Choose any available slot', 'No commitment required', 'Online payment support', 'Modify booking anytime'].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
                      <Button
                        onClick={() => navigate('/public/booking')}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-full py-6 text-lg font-semibold"
                      >
                Book Single Slot
                      </Button>
            </Card>

            {/* Monthly Pass - Featured */}
            <Card className="border-2 border-green-500 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white border-0">Most Popular</Badge>
              <div className="text-center mb-6">
                <Badge className="mb-4 bg-green-500/10 text-green-700 border-green-300">Best Value</Badge>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Monthly Pass</h3>
                <p className="text-gray-600 mb-6">Save up to 20%</p>
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  ₹12,000<span className="text-2xl text-gray-500">/month</span>
                          </div>
                <p className="text-sm text-gray-500">~25 hours of play</p>
                        </div>
              <ul className="space-y-3 mb-8">
                {['Priority booking slots', '20% discount on hourly rate', 'Free equipment rental', 'Dedicated support manager', 'Flexible time credits', 'Guest passes included'].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                onClick={() => navigate('/public/booking')}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full py-6 text-lg font-semibold"
              >
                Get Monthly Pass
              </Button>
                </Card>

            {/* Corporate/Team */}
            <Card className="border-2 border-gray-200 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="text-center mb-6">
                <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-300">Corporate</Badge>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Team Package</h3>
                <p className="text-gray-600 mb-6">For teams & corporates</p>
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  Custom
                </div>
                <p className="text-sm text-gray-500">Tailored pricing</p>
              </div>
              <ul className="space-y-3 mb-8">
                {['Block booking discounts', 'Tournament hosting', 'Coaching sessions available', 'Team roster management', 'Custom scheduling', 'Dedicated account manager'].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                onClick={() => navigate('/support')}
                variant="outline"
                className="w-full border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white rounded-full py-6 text-lg font-semibold"
              >
                Contact Sales
              </Button>
            </Card>
                </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">All prices are inclusive of GST. No hidden charges.</p>
            <Button
              onClick={() => navigate('/public/booking')}
              variant="outline"
              size="lg"
              className="rounded-full border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
            >
              View Live Availability & Book
            </Button>
          </div>
        </div>
      </section>

      {/* Booking Process */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-500/10 text-green-700 border-green-300">Simple & Fast</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Book in 3 Easy Steps
            </h2>
            <p className="text-lg text-gray-600">Get confirmed in seconds with our instant booking system</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-green-200 via-green-400 to-green-200 z-0" style={{ top: '80px' }}></div>

            {[
              {
                step: '01',
                icon: Target,
                title: 'Select Your Sport',
                desc: 'Choose from Football, Cricket, or Pickleball courts'
              },
              {
                step: '02',
                icon: Calendar,
                title: 'Pick Date & Time',
                desc: 'View real-time availability and select your preferred slot'
              },
              {
                step: '03',
                icon: CheckCircle2,
                title: 'Instant Confirmation',
                desc: 'Pay securely and receive immediate booking confirmation'
              },
            ].map((item, idx) => (
              <div key={idx} className="relative z-10">
                <Card className="p-8 text-center hover:shadow-2xl transition-all duration-300 border-2 border-green-100 hover:border-green-500 bg-white">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <item.icon className="h-10 w-10 text-white" />
                </div>
                  <div className="text-6xl font-black text-green-100 mb-4">{item.step}</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </Card>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              onClick={() => navigate('/public/booking')}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full px-10 py-7 text-lg font-bold shadow-2xl shadow-green-500/30"
            >
              Start Booking Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Ricky Mascot Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-50 via-emerald-50 to-white">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-500/10 text-green-700 border-green-300 inline-flex items-center gap-2">
              <img src="https://iili.io/flpj90Q.jpg" alt="Pickleball" className="h-6 w-6 object-contain" />
              Pickleball Mascot
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Meet Ricky - Our Pickleball Champion
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Ricky is the official mascot of Turf45's Pickleball courts! This energetic and friendly character embodies the spirit of pickleball - fun, fast-paced, and friendly.
            </p>
          </div>
          
          {/* Ricky - Large and Centered */}
          <div className="flex justify-center mb-12 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl p-12 md:p-16 shadow-2xl">
                <div className="w-64 h-64 md:w-96 md:h-96 flex items-center justify-center">
                  <img
                    src="https://iili.io/f0nWwnj.png"
                    alt="Ricky - Turf45 Pickleball Mascot"
                    className="w-full h-full object-contain drop-shadow-2xl animate-bounce-slow"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ricky in Action - Photo Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="relative group overflow-hidden rounded-2xl shadow-xl border-2 border-green-200 animate-fade-in">
              <img src="/Ricky.jpg" alt="Meet Ricky" className="w-full h-[300px] object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/90 via-green-800/30 to-transparent">
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-bold text-lg">👋 Meet Ricky!</p>
                  <p className="text-green-200 text-sm">Your friendly guide</p>
                </div>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-2xl shadow-xl border-2 border-blue-200 animate-fade-in delay-100">
              <img src="/Ricky Playing.jpg" alt="Ricky Playing" className="w-full h-[300px] object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-800/30 to-transparent">
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-bold text-lg">🎾 Ricky Plays!</p>
                  <p className="text-blue-200 text-sm">Watch and learn</p>
                </div>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-2xl shadow-xl border-2 border-purple-200 animate-fade-in delay-200">
              <img src="/Ricky Coaching.jpeg" alt="Ricky Coaching" className="w-full h-[300px] object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-800/30 to-transparent">
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-bold text-lg">📚 Coach Ricky!</p>
                  <p className="text-purple-200 text-sm">Expert tips</p>
                </div>
              </div>
            </div>
          </div>

          {/* Learn with Ricky - Educational Content */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 mb-12 border-2 border-blue-200">
            <h3 className="text-3xl font-bold text-center mb-3 text-blue-600 animate-fade-in">
              📖 Learn with Ricky
            </h3>
            <p className="text-center text-gray-600 mb-8">
              Ricky explains everything you need to know!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative group overflow-hidden rounded-xl shadow-xl border-2 border-blue-300 animate-slide-up">
                <img src="/Rules.jpg" alt="Ricky Explains Rules" className="w-full h-[280px] object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-900/40 to-transparent">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-bold">📜 Rules Explained</p>
                    <p className="text-blue-200 text-xs">Game basics</p>
                  </div>
                </div>
              </div>
              
              <div className="relative group overflow-hidden rounded-xl shadow-xl border-2 border-yellow-300 animate-slide-up delay-100">
                <img src="/Wow.jpg" alt="Ricky Pro Tips" className="w-full h-[280px] object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-yellow-950/90 via-yellow-900/40 to-transparent">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-bold">✨ Pro Tips</p>
                    <p className="text-yellow-200 text-xs">Amazing techniques</p>
                  </div>
                </div>
              </div>
              
              <div className="relative group overflow-hidden rounded-xl shadow-xl border-2 border-purple-300 animate-slide-up delay-200">
                <img src="/Proposal.jpg" alt="Ricky Game Plans" className="w-full h-[280px] object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 via-purple-900/40 to-transparent">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-bold">💡 Game Plans</p>
                    <p className="text-purple-200 text-xs">Strategy tips</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Play with Ricky Promo Banner */}
          <div className="text-center mb-8">
            <div className="relative inline-block rounded-2xl overflow-hidden shadow-2xl border-4 border-green-300 max-w-4xl mx-auto animate-fade-in">
              <img src="/PLAY WITH RICKY Code.jpg" alt="Play with Ricky Promo" className="w-full" />
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Trophy, title: 'Official Mascot', desc: 'Representing pickleball excellence' },
              { icon: Heart, title: 'Friendly Spirit', desc: 'Welcoming players of all levels' },
              { icon: Zap, title: 'Energetic Vibes', desc: 'Bringing excitement to every game' },
              { icon: Star, title: 'Premium Courts', desc: 'State-of-the-art facilities' },
            ].map((item, idx) => (
              <Card key={idx} className="p-6 text-center hover:shadow-xl transition-all duration-300 border-2 border-green-100 hover:border-green-300">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
            </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button
              onClick={() => navigate('/public/booking?sport=pickleball')}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full px-10 py-7 text-xl font-bold shadow-2xl shadow-green-500/40 hover:scale-110 transition-all duration-300"
            >
              Book Pickleball with Ricky
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials & Reviews */}
      <section id="reviews" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-8 w-8 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <Badge className="mb-4 bg-yellow-100 text-yellow-800 border-yellow-300">4.9/5 Rating</Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Loved by Athletes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join hundreds of satisfied players who choose Turf45 for their sports needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                name: 'Rajesh Kumar',
                role: 'Football Enthusiast',
                rating: 5,
                text: 'Excellent facilities! The FIFA-approved football court is top-notch. Booking was seamless and the staff is very professional. Best turf in Chennai!',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80'
              },
              {
                name: 'Priya Sharma',
                role: 'Cricket Coach',
                rating: 5,
                text: 'Outstanding cricket facilities! The turf quality is phenomenal and perfect for training sessions. My students love practicing here. Highly recommended!',
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80'
              },
              {
                name: 'Amit Patel',
                role: 'Pickleball Player',
                rating: 5,
                text: 'Best pickleball court in the city! Clean, modern, and well-maintained. The indoor setup is perfect. The online booking system makes it so convenient.',
                image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80'
              },
            ].map((review, idx) => (
              <Card key={idx} className="p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic leading-relaxed">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={review.image} alt={review.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-bold text-gray-900">{review.name}</p>
                    <p className="text-sm text-gray-600">{review.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Social Proof */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-6 text-center border-2 border-green-100">
              <p className="text-4xl font-bold text-green-600 mb-2">1000+</p>
              <p className="text-gray-600">Matches Hosted</p>
            </Card>
            <Card className="p-6 text-center border-2 border-green-100">
              <p className="text-4xl font-bold text-green-600 mb-2">500+</p>
              <p className="text-gray-600">Happy Athletes</p>
            </Card>
            <Card className="p-6 text-center border-2 border-green-100">
              <p className="text-4xl font-bold text-green-600 mb-2">4.9★</p>
              <p className="text-gray-600">Average Rating</p>
            </Card>
            <Card className="p-6 text-center border-2 border-green-100">
              <p className="text-4xl font-bold text-green-600 mb-2">99%</p>
              <p className="text-gray-600">Satisfaction Rate</p>
            </Card>
          </div>
        </div>
      </section>

      {/* About/Founder Section */}
      <section id="about" className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl blur-3xl opacity-20"></div>
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
                alt="Jai - Founder of Turf45"
                className="relative rounded-3xl shadow-2xl w-full h-[600px] object-cover"
              />
        </div>

            <div>
              <Badge className="mb-4 bg-green-500/10 text-green-700 border-green-300">Our Story</Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Meet Jai - Founder & Sports Visionary
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Founded in 2021, Turf45 was born from a passion for sports and a vision to create world-class facilities accessible to every athlete. Jai's dedication to excellence and commitment to quality has made Turf45 the premier destination for football, cricket, and pickleball in Chennai.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                "At Turf45, we believe every athlete deserves access to professional-grade facilities. Our mission is to inspire and empower athletes to reach their full potential through exceptional courts and outstanding service." - Jai, Founder
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { icon: Award, text: 'FIFA Approved Facilities' },
                  { icon: Trophy, text: 'Professional Grade Equipment' },
                  { icon: Shield, text: 'Trusted by 500+ Athletes' },
                  { icon: Target, text: 'Commitment to Excellence' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-2">
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => navigate('/public/booking')}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full px-8 py-6 text-lg font-semibold shadow-lg shadow-green-500/30"
              >
                Book Your Court Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-500/10 text-green-700 border-green-300">Help Center</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">Everything you need to know about booking at Turf45</p>
            </div>
            
          <Accordion type="single" collapsible className="w-full space-y-4">
            {[
              {
                q: 'How do I book a court at Turf45?',
                a: 'Simply click on "Book Now", select your preferred sport (Football, Cricket, or Pickleball), choose your date and time slot, and complete the payment. You\'ll receive instant confirmation via SMS and email.'
              },
              {
                q: 'What are your operating hours?',
                a: 'We\'re open from 6:00 AM to 11:00 PM, 7 days a week. Slots are available in hourly increments, and you can book as early as 6 AM or as late as 10 PM (1-hour slot until 11 PM).'
              },
              {
                q: 'Can I cancel or reschedule my booking?',
                a: 'Yes, you can cancel or reschedule up to 2 hours before your booked slot. Please refer to our Cancellation & Refund Policy for detailed information on refunds and rescheduling process.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major payment methods including Credit/Debit Cards, UPI, Net Banking, and Digital Wallets. All transactions are secure and encrypted.'
              },
              {
                q: 'Do you provide sports equipment?',
                a: 'Yes! We provide complimentary footballs and cricket equipment. For pickleball, paddles and balls are available. However, you\'re welcome to bring your own equipment if you prefer.'
              },
              {
                q: 'Is there parking available?',
                a: 'Yes, we have ample free parking space for all visitors. The parking area is well-lit and secure with CCTV surveillance.'
              },
              {
                q: 'Can I bring guests to watch?',
                a: 'Absolutely! Your guests are welcome to watch from our covered seating area at no additional charge. We have comfortable seating arrangements with a great view of the courts.'
              },
              {
                q: 'What if it rains during my booking?',
                a: 'Our cricket and football turfs have excellent drainage systems and can handle light rain. In case of heavy rain, we offer free rescheduling to another slot of your choice. Our pickleball courts are indoors and unaffected by weather.'
              },
            ].map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`} className="bg-white rounded-xl border-2 border-green-100 px-6 hover:border-green-300 transition-colors">
              <AccordionTrigger className="text-left font-semibold text-gray-900 hover:no-underline">
                  {faq.q}
              </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed">
                  {faq.a}
              </AccordionContent>
            </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <Button
              onClick={() => navigate('/support')}
              variant="outline"
              size="lg"
              className="rounded-full border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
            >
              Contact Support Team
            </Button>
          </div>
        </div>
      </section>

      {/* Achievements Carousel - MOVED UP */}
      <section className="py-20 px-4 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto mb-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Achievements 🏆
            </h2>
            <p className="text-xl text-gray-600">
              Celebrating success, building champions
            </p>
          </div>
        </div>
        
        {/* Infinite Scrolling Carousel */}
        <div className="relative mb-12">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
          
          <div className="flex gap-6 animate-scroll-left">
            {Array.from({ length: 24 }, (_, i) => i + 1).map((num) => (
              <div key={`first-${num}`} className="flex-shrink-0 w-[400px] h-[300px] rounded-xl overflow-hidden shadow-2xl border-2 border-yellow-300 group">
                <img 
                  src={`/A${num}.jpeg`} 
                  alt={`Achievement ${num}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
            
            {Array.from({ length: 24 }, (_, i) => i + 1).map((num) => (
              <div key={`second-${num}`} className="flex-shrink-0 w-[400px] h-[300px] rounded-xl overflow-hidden shadow-2xl border-2 border-yellow-300 group">
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
          <Card className="text-center bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 p-6">
            <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">100+</p>
            <p className="text-gray-600 text-sm">Tournaments</p>
          </Card>
          <Card className="text-center bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 p-6">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">5000+</p>
            <p className="text-gray-600 text-sm">Players</p>
          </Card>
          <Card className="text-center bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 p-6">
            <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">50+</p>
            <p className="text-gray-600 text-sm">Championships</p>
          </Card>
          <Card className="text-center bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 p-6">
            <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">24+</p>
            <p className="text-gray-600 text-sm">Achievements</p>
          </Card>
        </div>
      </section>

      {/* Visit Turf45 Today - Location/Contact CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-500 to-green-600 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <Map className="h-16 w-16 mx-auto mb-6 text-green-100 animate-bounce-slow" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Visit Turf45 Today
          </h2>
          <p className="text-xl text-green-50 mb-8 max-w-3xl mx-auto">
            Experience world-class sports facilities in Tiruchirappalli. We're open 7 days a week, 6 AM to 10 PM!
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <MapPin className="h-8 w-8 mx-auto mb-3 text-green-100" />
              <h3 className="font-bold mb-2">Location</h3>
              <p className="text-green-50 text-sm leading-relaxed">
                3rd Cross, RPF Road, K K Nagar<br/>
                Tiruchirappalli, Tamil Nadu 620021
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <Phone className="h-8 w-8 mx-auto mb-3 text-green-100" />
              <h3 className="font-bold mb-2">Call Us</h3>
              <a href="tel:+919159991592" className="text-green-50 hover:text-white transition-colors text-lg font-semibold">
                +91 91599 91592
              </a>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <Mail className="h-8 w-8 mx-auto mb-3 text-green-100" />
              <h3 className="font-bold mb-2">Email Us</h3>
              <a href="mailto:support@turf45.in" className="text-green-50 hover:text-white transition-colors">
                support@turf45.in
              </a>
            </div>
          </div>

          <Button
            onClick={() => navigate('/public/booking')}
            size="lg"
            className="bg-white text-green-600 hover:bg-green-50 rounded-full px-12 py-7 text-xl font-bold shadow-2xl transition-all duration-300 hover:scale-110"
          >
            Book Your Court Now
            <ArrowRight className="ml-2 h-6 w-6" />
          </Button>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <img
                src="/Turf45_transparent.png"
                alt="Turf45 Logo"
                className="h-14 w-auto object-contain mb-4"
                style={{
                  filter: "drop-shadow(0 2px 12px rgba(16, 185, 129, 0.4))",
                }}
              />
              <p className="text-gray-400 leading-relaxed mb-4">
                Premium FIFA-approved sports facilities for football, cricket, and pickleball in Chennai.
              </p>
              <div className="flex gap-3">
                {[
                  { icon: Instagram, url: 'https://instagram.com/turf45' },
                  { icon: Facebook, url: 'https://facebook.com/turf45' },
                  { icon: Twitter, url: 'https://twitter.com/turf45' },
                ].map((social, idx) => (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white/10 rounded-full hover:bg-green-500 transition-all duration-300"
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
                    </div>
                    
            {/* Quick Links */}
                      <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Book Courts', onClick: () => navigate('/public/booking') },
                  { label: 'View Availability', onClick: () => navigate('/public/booking') },
                  { label: 'Facilities', onClick: () => scrollToSection('facilities') },
                  { label: 'Pricing', onClick: () => scrollToSection('pricing') },
                  { label: 'About Us', onClick: () => scrollToSection('about') },
                ].map((link, idx) => (
                  <li key={idx}>
                    <button onClick={link.onClick} className="text-gray-400 hover:text-green-400 transition-colors">
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
                    </div>
                    
            {/* Support */}
                      <div>
              <h4 className="font-bold text-lg mb-4">Support</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Help Center', href: '/support' },
                  { label: 'Cancellation Policy', href: '/refund-policy' },
                  { label: 'Terms & Conditions', href: '/terms' },
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Contact Us', onClick: () => navigate('/support') },
                ].map((link, idx) => (
                  <li key={idx}>
                    {link.href ? (
                      <a href={link.href} className="text-gray-400 hover:text-green-400 transition-colors">
                        {link.label}
                      </a>
                    ) : (
                      <button onClick={link.onClick} className="text-gray-400 hover:text-green-400 transition-colors">
                        {link.label}
                      </button>
                    )}
                </li>
                ))}
              </ul>
                    </div>
                    
            {/* Contact */}
                      <div>
              <h4 className="font-bold text-lg mb-4">Contact Info</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-gray-400">
                  <Phone className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <a href="tel:+919159991592" className="hover:text-green-400 transition-colors">
                    +91 91599 91592
                  </a>
                </li>
                <li className="flex items-start gap-3 text-gray-400">
                  <Mail className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <a href="mailto:support@turf45.in" className="hover:text-green-400 transition-colors">
                    support@turf45.in
                  </a>
                </li>
                <li className="flex items-start gap-3 text-gray-400">
                  <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>3rd Cross, RPF Road, K K Nagar<br/>Tiruchirappalli, Tamil Nadu 620021</span>
                </li>
                <li className="flex items-start gap-3 text-gray-400">
                  <Clock className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>Open Daily: 6:00 AM - 10:00 PM</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} Turf45. All rights reserved. FIFA Approved Courts - ESTD 2021
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
  );
};

export default Index;
