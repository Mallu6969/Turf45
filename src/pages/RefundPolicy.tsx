import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Clock, CheckCircle2, XCircle, AlertTriangle, LogIn } from 'lucide-react';
import { Trophy } from 'lucide-react';

const RefundPolicy = () => {
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
            Cancellation & Refund Policy
          </h1>
          <p className="text-lg text-gray-600">
            Clear rules and refund timelines for your bookings
          </p>
        </div>

        <Card className="backdrop-blur-xl bg-white/80 border-2 border-green-100 shadow-xl mb-8">
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-green-600" />
                  Overview
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  At Turf45, we understand that plans can change. This policy outlines our cancellation and refund procedures to ensure transparency and fairness for all our customers. Please read this policy carefully before making a booking.
                </p>
              </section>

              {/* Cancellation Policy */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <Clock className="h-6 w-6 text-green-600" />
                  Cancellation Policy
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Cancellation 24+ Hours Before Booking</h3>
                        <p className="text-gray-700">
                          If you cancel your booking at least 24 hours before the scheduled time, you will receive a <strong>100% refund</strong> to your original payment method. The refund will be processed within 5-7 business days.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Cancellation 2-24 Hours Before Booking</h3>
                        <p className="text-gray-700">
                          If you cancel your booking between 2-24 hours before the scheduled time, you will receive a <strong>50% refund</strong> to your original payment method. The refund will be processed within 5-7 business days.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Cancellation Less Than 2 Hours Before Booking</h3>
                        <p className="text-gray-700">
                          Cancellations made less than 2 hours before the scheduled time are <strong>non-refundable</strong>. This policy helps us manage court availability and ensure fair access for all customers.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">No-Show Policy</h3>
                        <p className="text-gray-700">
                          If you fail to show up for your booking without prior cancellation, the booking is <strong>non-refundable</strong>. We recommend setting reminders to avoid missing your scheduled time.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Refund Processing */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  Refund Processing
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    All eligible refunds will be processed to your original payment method:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li><strong>Credit/Debit Cards:</strong> Refunds typically appear within 5-7 business days</li>
                    <li><strong>UPI Payments:</strong> Refunds typically appear within 3-5 business days</li>
                    <li><strong>Net Banking:</strong> Refunds typically appear within 5-10 business days</li>
                    <li><strong>Wallet Payments:</strong> Refunds typically appear within 2-3 business days</li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-4">
                    Note: Processing times may vary depending on your bank or payment provider. If you don't see your refund after the specified time, please contact our support team.
                  </p>
                </div>
              </section>

              {/* Rescheduling */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Rescheduling Policy</h2>
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-gray-700 leading-relaxed">
                    You can reschedule your booking up to <strong>2 hours before</strong> the scheduled time at no additional charge, subject to availability. To reschedule, please contact our support team or use the booking management feature in your account.
                  </p>
                </div>
              </section>

              {/* Special Circumstances */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Special Circumstances</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Weather-Related Cancellations</h3>
                    <p className="text-gray-700">
                      In case of severe weather conditions that make it unsafe to use the facilities, we will offer a <strong>full refund</strong> or allow you to reschedule at no charge. We will notify you as early as possible if weather conditions affect your booking.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Facility Issues</h3>
                    <p className="text-gray-700">
                      If we are unable to provide the booked facility due to maintenance, technical issues, or other facility-related problems, you will receive a <strong>full refund</strong> or the option to reschedule at no charge.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Medical Emergencies</h3>
                    <p className="text-gray-700">
                      In case of genuine medical emergencies, please contact our support team with documentation. We will review each case individually and may offer a full or partial refund at our discretion.
                    </p>
                  </div>
                </div>
              </section>

              {/* Contact for Refunds */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h2>
                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <p className="text-gray-700 mb-4">
                    If you have questions about cancellations or refunds, or need assistance with a refund request, please contact our support team:
                  </p>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <strong>Phone:</strong> <a href="tel:+919345187098" className="text-green-600 hover:underline">+91 93451 87098</a>
                    </p>
                    <p className="text-gray-700">
                      <strong>Email:</strong> <a href="mailto:contact@turf45.in" className="text-green-600 hover:underline">contact@turf45.in</a>
                    </p>
                    <p className="text-gray-700">
                      <strong>WhatsApp:</strong> <a href="https://wa.me/919345187098" className="text-green-600 hover:underline">+91 93451 87098</a>
                    </p>
                  </div>
                </div>
              </section>

              {/* Policy Updates */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Policy Updates</h2>
                <p className="text-gray-700 leading-relaxed">
                  Turf45 reserves the right to update this cancellation and refund policy at any time. Any changes will be posted on this page with an updated revision date. Continued use of our services after policy changes constitutes acceptance of the updated terms.
                </p>
                <p className="text-gray-600 text-sm mt-4">
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

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 px-4 mt-16">
        <div className="max-w-7xl mx-auto">
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

export default RefundPolicy;

