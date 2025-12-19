import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, FileText, Shield, AlertCircle } from 'lucide-react';
import { Trophy } from 'lucide-react';

const Terms = () => {
  const navigate = useNavigate();
  
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Terms & Conditions
          </h1>
          <p className="text-lg text-gray-600">
            Rules of use, booking terms, venue rules, and liability basics
          </p>
        </div>

        <Card className="backdrop-blur-xl bg-white/80 border-2 border-green-100 shadow-xl mb-8">
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Acceptance */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <FileText className="h-6 w-6 text-green-600" />
                  1. Acceptance of Terms
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  By accessing and using Turf45's services, including but not limited to booking courts, making payments, and using our facilities, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
            </p>
          </section>
          
              {/* Booking Terms */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <Shield className="h-6 w-6 text-green-600" />
                  2. Booking Terms
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">2.1 Court Reservations</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Turf45 provides FIFA approved football, cricket, and pickleball turf facilities on a reservation basis, subject to availability. All bookings are confirmed only after successful payment. Bookings are non-transferable unless explicitly authorized by Turf45 management.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">2.2 Booking Duration</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Standard booking slots are 30 minutes. Multiple consecutive slots can be booked. Extensions are subject to availability and additional charges at the current hourly rate.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">2.3 Payment Terms</h3>
                    <p className="text-gray-700 leading-relaxed">
                      All bookings must be paid in full at the time of reservation. We accept credit/debit cards, UPI, net banking, and digital wallets. Prices are subject to change, but confirmed bookings will be honored at the rate agreed at the time of booking.
                    </p>
                  </div>
                </div>
              </section>

              {/* Venue Rules */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-green-600" />
                  3. Venue Rules and Conduct
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">3.1 Facility Conduct</h3>
                    <p className="text-gray-700 leading-relaxed">
                      All users must maintain appropriate conduct within our premises. Turf45 reserves the right to refuse service or remove anyone engaging in disruptive, abusive, inappropriate, or illegal behavior without refund.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">3.2 Equipment and Facilities</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Players are responsible for any damage caused to equipment, courts, or fixtures through improper use, negligence, or willful misconduct. Damages will be charged at repair or replacement cost. Please report any existing damage to facility staff immediately upon arrival.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">3.3 Safety and Health</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Users participate at their own risk. Turf45 is not liable for injuries sustained during facility use. Users must follow all safety guidelines and instructions provided by staff. Appropriate sports attire and footwear are required.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">3.4 Prohibited Items and Activities</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>Smoking, alcohol, or illegal substances</li>
                      <li>Food and beverages on the playing surface</li>
                      <li>Unauthorized equipment or modifications</li>
                      <li>Pets (except service animals)</li>
                      <li>Any activity that may damage the facilities or endanger others</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Cancellations */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cancellations and Refunds</h2>
                <p className="text-gray-700 leading-relaxed">
                  Please refer to our <a href="/refund-policy" className="text-green-600 hover:underline font-semibold">Cancellation & Refund Policy</a> for detailed information about cancellation terms, refund eligibility, and processing timelines.
            </p>
          </section>
          
              {/* Liability */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Liability and Indemnification</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">5.1 Limitation of Liability</h3>
                    <p className="text-gray-700 leading-relaxed">
                      To the maximum extent permitted by law, Turf45, its owners, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of our facilities.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">5.2 Personal Injury</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Users acknowledge that participation in sports activities involves inherent risks. By using our facilities, users assume all risks associated with such activities and agree that Turf45 shall not be liable for any personal injury, death, or property damage.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">5.3 Indemnification</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Users agree to indemnify and hold harmless Turf45, its owners, employees, and affiliates from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from their use of the facilities, violation of these terms, or infringement of any rights of another.
                    </p>
                  </div>
                </div>
              </section>

              {/* Privacy */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Privacy and Data Protection</h2>
                <p className="text-gray-700 leading-relaxed">
                  Your privacy is important to us. Please review our <a href="/privacy" className="text-green-600 hover:underline font-semibold">Privacy Policy</a> to understand how we collect, use, and protect your personal information.
            </p>
          </section>
          
              {/* Modifications */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Modifications to Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  Turf45 reserves the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting on this page. Your continued use of our services after any modifications constitutes acceptance of the updated terms. We encourage you to review these terms periodically.
                </p>
              </section>

              {/* Governing Law */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Governing Law</h2>
                <p className="text-gray-700 leading-relaxed">
                  These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms or your use of our services shall be subject to the exclusive jurisdiction of the courts in Chennai, Tamil Nadu.
            </p>
          </section>
          
              {/* Contact */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Information</h2>
                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <p className="text-gray-700 mb-4">
                    For questions about these Terms and Conditions, please contact us:
                  </p>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <strong>Phone:</strong> <a href="tel:+919345187098" className="text-green-600 hover:underline">+91 93451 87098</a>
                    </p>
                    <p className="text-gray-700">
                      <strong>Email:</strong> <a href="mailto:contact@turf45.in" className="text-green-600 hover:underline">contact@turf45.in</a>
                    </p>
                    <p className="text-gray-700">
                      <strong>Address:</strong> Chennai, Tamil Nadu
                    </p>
                  </div>
                </div>
              </section>

              {/* Last Updated */}
              <section>
                <p className="text-gray-600 text-sm">
                  Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </section>
        </div>
          </CardContent>
        </Card>
        
        {/* CTA */}
        <div className="text-center mt-8">
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

export default Terms;
