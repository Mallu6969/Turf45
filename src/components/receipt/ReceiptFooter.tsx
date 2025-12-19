import React from 'react';

const ReceiptFooter: React.FC = () => {
  return (
    <div className="border-t-2 border-dashed border-gray-400 pt-4 mt-6 text-center receipt-footer">
      {/* Thank You Message */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-green-600 mb-1">
          Thank You for Visiting!
        </h3>
        <p className="text-xs text-gray-600">
          We hope you enjoyed your experience at Turf45
        </p>
      </div>
      
      {/* Terms & Conditions - With page-break protection */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4 terms-section">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Terms & Conditions:</h4>
        <ul className="text-[10px] text-gray-600 space-y-1 text-left">
          <li>• Goods once sold cannot be returned or exchanged</li>
          <li>• Please check the bill before leaving the counter</li>
          <li>• Table session charges are non-refundable</li>
          <li>• Membership benefits are subject to terms and conditions</li>
          <li>• Management reserves the right to admission</li>
        </ul>
      </div>
      
      {/* Social Media & Contact */}
      <div className="text-xs text-gray-600 mb-3">
        <p className="font-semibold mb-1">Stay Connected!</p>
        <p>Follow us on Instagram & Facebook: <span className="font-medium text-green-600">@turf45</span></p>
        <p className="mt-1">Visit us: <span className="font-medium text-green-600">www.turf45.in</span></p>
      </div>
      
      {/* Powered By */}
      <div className="text-[10px] text-gray-400 border-t border-gray-200 pt-2">
        <a 
          href="https://cuephoriatech.in" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <span>&lt; &gt;</span>
          <span className="font-semibold">Cuephoria Tech</span>
        </a>
        <p className="mt-1">For support: contact@turf45.in</p>
      </div>
      
      {/* Decorative Bottom */}
      <div className="mt-3 text-center">
        <p className="text-lg font-bold text-green-600">★ ★ ★</p>
      </div>
    </div>
  );
};

export default ReceiptFooter;
