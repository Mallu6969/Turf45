import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Shield, Lock, Eye, Database, Mail } from 'lucide-react';
import { Trophy } from 'lucide-react';

const Privacy = () => {
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
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600">
            How we collect, use, and protect your personal information
          </p>
        </div>

        <Card className="backdrop-blur-xl bg-white/80 border-2 border-green-100 shadow-xl mb-8">
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <Shield className="h-6 w-6 text-green-600" />
                  Introduction
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  At Turf45, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services, including our website, mobile application, and facility bookings.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  By using our services, you consent to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
            </p>
          </section>
          
              {/* Information Collection */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <Database className="h-6 w-6 text-green-600" />
                  1. Information We Collect
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">1.1 Personal Information</h3>
                    <p className="text-gray-700 leading-relaxed mb-2">
                      We collect personal information that you provide directly to us, including:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li><strong>Name:</strong> To identify you and personalize your experience</li>
                      <li><strong>Phone Number:</strong> For booking confirmations, reminders, and customer support</li>
                      <li><strong>Email Address:</strong> For booking confirmations, receipts, and communications</li>
                      <li><strong>Payment Information:</strong> Processed securely through our payment gateway (we do not store full card details)</li>
                      <li><strong>Address:</strong> For billing and location-based services (if provided)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">1.2 Usage Data</h3>
                    <p className="text-gray-700 leading-relaxed mb-2">
                      We automatically collect information about how you use our services:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>Booking history and preferences</li>
                      <li>Device information (type, operating system, browser)</li>
                      <li>IP address and location data</li>
                      <li>Pages visited and time spent on our platform</li>
                      <li>Search queries and interactions with our services</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">1.3 Cookies and Tracking Technologies</h3>
                    <p className="text-gray-700 leading-relaxed">
                      We use cookies, web beacons, and similar tracking technologies to enhance your experience, analyze usage patterns, and improve our services. You can control cookie preferences through your browser settings.
                    </p>
                  </div>
                </div>
              </section>

              {/* Information Usage */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <Eye className="h-6 w-6 text-green-600" />
                  2. How We Use Your Information
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use the collected information for the following purposes:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Processing Bookings:</strong> To process and confirm your court reservations, manage payments, and send booking confirmations</li>
                  <li><strong>Customer Service:</strong> To respond to your inquiries, provide support, and resolve issues</li>
                  <li><strong>Communication:</strong> To send booking reminders, updates, promotional offers (with your consent), and important service notifications</li>
                  <li><strong>Service Improvement:</strong> To analyze usage patterns, improve our facilities, and enhance user experience</li>
                  <li><strong>Security:</strong> To detect, prevent, and address fraud, security issues, and unauthorized access</li>
                  <li><strong>Legal Compliance:</strong> To comply with legal obligations, enforce our terms, and protect our rights</li>
                  <li><strong>Personalization:</strong> To customize your experience and provide relevant recommendations</li>
            </ul>
          </section>
          
              {/* Information Sharing */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <Lock className="h-6 w-6 text-green-600" />
                  3. Information Sharing and Disclosure
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">3.1 We Do Not Sell Your Data</h3>
                    <p className="text-gray-700 leading-relaxed">
                      We do not sell, rent, or trade your personal information to third parties for their marketing purposes.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">3.2 Service Providers</h3>
                    <p className="text-gray-700 leading-relaxed mb-2">
                      We may share your information with trusted third-party service providers who assist us in operating our services:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li><strong>Payment Processors:</strong> To process payments securely (e.g., Razorpay)</li>
                      <li><strong>Cloud Services:</strong> To store and manage data securely</li>
                      <li><strong>Analytics Providers:</strong> To analyze usage and improve our services</li>
                      <li><strong>Communication Services:</strong> To send SMS and email notifications</li>
            </ul>
                    <p className="text-gray-700 leading-relaxed mt-2">
                      These service providers are contractually obligated to protect your information and use it only for the purposes we specify.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">3.3 Legal Requirements</h3>
                    <p className="text-gray-700 leading-relaxed">
                      We may disclose your information if required by law, court order, or government regulation, or if we believe disclosure is necessary to protect our rights, property, or safety, or that of our users or others.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">3.4 Business Transfers</h3>
                    <p className="text-gray-700 leading-relaxed">
                      In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity, subject to the same privacy protections.
                    </p>
                  </div>
                </div>
          </section>
          
              {/* Data Security */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We implement industry-standard security measures to protect your personal information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure payment processing through PCI-DSS compliant gateways</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication measures</li>
                  <li>Employee training on data protection</li>
            </ul>
                <p className="text-gray-600 text-sm mt-4">
                  However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                </p>
              </section>

              {/* Your Rights */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights and Choices</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">5.1 Access and Correction</h3>
                    <p className="text-gray-700 leading-relaxed">
                      You have the right to access, update, or correct your personal information. You can do this through your account settings or by contacting us directly.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">5.2 Data Deletion</h3>
                    <p className="text-gray-700 leading-relaxed">
                      You can request deletion of your personal information, subject to legal and contractual obligations. We may retain certain information as required by law or for legitimate business purposes.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">5.3 Marketing Communications</h3>
                    <p className="text-gray-700 leading-relaxed">
                      You can opt-out of marketing communications at any time by clicking the unsubscribe link in emails or contacting us. You will still receive essential service-related communications.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">5.4 Cookie Preferences</h3>
                    <p className="text-gray-700 leading-relaxed">
                      You can control cookies through your browser settings. Note that disabling cookies may affect the functionality of our services.
                    </p>
                  </div>
                </div>
              </section>

              {/* Data Retention */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
                <p className="text-gray-700 leading-relaxed">
                  We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required or permitted by law. Booking records and transaction data are typically retained for accounting and legal compliance purposes.
                </p>
              </section>

              {/* Children's Privacy */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Children's Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child, we will take steps to delete such information promptly.
                </p>
              </section>

              {/* Policy Updates */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Policy Updates</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of significant changes by posting the updated policy on this page and updating the "Last updated" date. Your continued use of our services after changes constitutes acceptance of the updated policy.
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <Mail className="h-6 w-6 text-green-600" />
                  9. Contact Us
                </h2>
                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <p className="text-gray-700 mb-4">
                    If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <strong>Email:</strong> <a href="mailto:contact@turf45.in" className="text-green-600 hover:underline">contact@turf45.in</a>
                    </p>
                    <p className="text-gray-700">
                      <strong>Phone:</strong> <a href="tel:+919345187098" className="text-green-600 hover:underline">+91 93451 87098</a>
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

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 px-4 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-400">© {new Date().getFullYear()} Turf45. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <a 
                  href="/login" 
                  className="text-sm text-gray-400 hover:text-green-400 transition-colors"
                >
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

export default Privacy;
