import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Gift, Sparkles, Calendar, Star, ArrowRight } from 'lucide-react';
import { Trophy } from 'lucide-react';

const Offers = () => {
  const navigate = useNavigate();

  const offers = [
    {
      id: 1,
      title: 'Early Bird Special',
      description: 'Book morning slots (6 AM - 10 AM) and get 20% off on all courts',
      discount: '20% OFF',
      validUntil: '2025-12-31',
      code: 'EARLY20',
      color: 'from-green-500 to-green-600',
    },
    {
      id: 2,
      title: 'Weekend Warrior',
      description: 'Enjoy 15% discount on weekend bookings for groups of 4 or more',
      discount: '15% OFF',
      validUntil: '2025-12-31',
      code: 'WEEKEND15',
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 3,
      title: 'Loyalty Rewards',
      description: 'Book 10 sessions and get your 11th session absolutely free!',
      discount: 'FREE',
      validUntil: '2025-12-31',
      code: 'LOYALTY10',
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 4,
      title: 'Student Special',
      description: 'Students get 25% off on all bookings with valid student ID',
      discount: '25% OFF',
      validUntil: '2025-12-31',
      code: 'STUDENT25',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="public-page min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
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
          <div className="inline-flex items-center justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl">
              <Gift className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Special Offers & Promotions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing deals and discounts on court bookings. Use these offers to save on your next game!
          </p>
        </div>

        {/* Offers Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {offers.map((offer) => (
            <Card 
              key={offer.id} 
              className="relative overflow-hidden backdrop-blur-xl bg-white/80 border-2 border-green-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${offer.color} rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity`}></div>
              
              <CardHeader className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                      {offer.title}
                    </CardTitle>
                    <p className="text-gray-600">
                      {offer.description}
                    </p>
                  </div>
                  <Badge className={`bg-gradient-to-r ${offer.color} text-white text-lg px-4 py-2 rounded-full shadow-lg`}>
                    {offer.discount}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="relative z-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Promo Code</p>
                      <p className="text-xl font-bold text-gray-900 font-mono">{offer.code}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => {
                        navigator.clipboard.writeText(offer.code);
                        alert(`Promo code ${offer.code} copied to clipboard!`);
                      }}
                    >
                      Copy
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Valid until: {new Date(offer.validUntil).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>

                  <Button
                    onClick={() => navigate('/public/booking')}
                    className={`w-full bg-gradient-to-r ${offer.color} hover:opacity-90 text-white rounded-full py-6 text-lg font-semibold shadow-lg transition-all duration-300 group-hover:scale-105`}
                  >
                    Use This Offer
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How to Use */}
        <Card className="backdrop-blur-xl bg-white/80 border-2 border-green-100 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-green-600" />
              How to Use Promo Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Copy the Promo Code</h3>
                  <p className="text-gray-600">Click the "Copy" button next to any promo code to copy it to your clipboard.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Start Your Booking</h3>
                  <p className="text-gray-600">Click "Use This Offer" or navigate to the booking page to start your reservation.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Apply the Code</h3>
                  <p className="text-gray-600">During checkout, paste the promo code in the coupon field and click "Apply".</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Enjoy Your Discount</h3>
                  <p className="text-gray-600">Complete your booking and enjoy the discounted rate!</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms */}
        <Card className="backdrop-blur-xl bg-white/80 border-2 border-green-100 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Promo codes cannot be combined with other offers</li>
              <li>Each promo code can only be used once per user</li>
              <li>Offers are subject to availability</li>
              <li>Turf45 reserves the right to modify or cancel offers at any time</li>
              <li>Student discounts require valid student ID verification at the venue</li>
              <li>Loyalty rewards are tracked automatically through your account</li>
            </ul>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button
            onClick={() => navigate('/public/booking')}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full px-8 py-6 text-lg font-semibold shadow-lg shadow-green-500/30"
          >
            Book a Court Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Offers;

