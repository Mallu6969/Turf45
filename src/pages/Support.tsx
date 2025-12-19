import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, MessageCircle, Clock, MapPin, ArrowLeft, Send } from 'lucide-react';
import { Trophy } from 'lucide-react';

const Support = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert('Thank you for contacting us! We will get back to you soon.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-green-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-green-500/20 to-green-400/20 rounded-full blur-lg"></div>
                <div className="relative bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-2">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                  Turf45
                </h1>
                <p className="text-xs text-gray-500">Premium Sports Facility</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-green-600"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Support & Contact
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're here to help! Get quick assistance for booking, payment issues, or any questions you may have.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Quick Contact Cards */}
          <Card className="backdrop-blur-xl bg-white/80 border-2 border-green-100 shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Call Us</CardTitle>
                  <p className="text-sm text-gray-600">Direct phone support</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <a 
                href="tel:+919345187098" 
                className="text-2xl font-bold text-green-600 hover:text-green-700 transition-colors"
              >
                +91 93451 87098
              </a>
              <p className="text-sm text-gray-500 mt-2">Available during business hours</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/80 border-2 border-green-100 shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">WhatsApp</CardTitle>
                  <p className="text-sm text-gray-600">Instant messaging support</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <a 
                href="https://wa.me/919345187098" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl font-bold text-green-600 hover:text-green-700 transition-colors"
              >
                +91 93451 87098
              </a>
              <p className="text-sm text-gray-500 mt-2">Quick response guaranteed</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/80 border-2 border-green-100 shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Email Us</CardTitle>
                  <p className="text-sm text-gray-600">Send us a detailed message</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <a 
                href="mailto:contact@turf45.in" 
                className="text-xl font-bold text-green-600 hover:text-green-700 transition-colors break-all"
              >
                contact@turf45.in
              </a>
              <p className="text-sm text-gray-500 mt-2">We'll respond within 24 hours</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/80 border-2 border-green-100 shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Business Hours</CardTitle>
                  <p className="text-sm text-gray-600">When we're available</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-semibold text-gray-900">Monday - Sunday</p>
                <p className="text-gray-600">6:00 AM - 10:00 PM</p>
                <p className="text-sm text-gray-500 mt-4">Extended hours available for bookings</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="backdrop-blur-xl bg-white/80 border-2 border-green-100 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Send us a Message</CardTitle>
            <p className="text-gray-600">Fill out the form below and we'll get back to you as soon as possible.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white resize-none"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl py-6 text-lg font-semibold shadow-lg shadow-green-500/30"
              >
                <Send className="mr-2 h-5 w-5" />
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="mt-8 backdrop-blur-xl bg-white/80 border-2 border-green-100 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Visit Us</CardTitle>
                <p className="text-sm text-gray-600">Our physical location</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-900 font-medium">Turf45 Sports Facility</p>
            <p className="text-gray-600">Chennai, Tamil Nadu</p>
            <p className="text-sm text-gray-500 mt-4">We welcome walk-in visitors during business hours</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Support;

