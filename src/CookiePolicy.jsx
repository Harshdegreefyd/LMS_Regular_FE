// import { useState, useEffect } from "react";

// // === Utility Functions ===
// function areCookiesEnabled() {
//   try {
//     document.cookie = "cookietest=1; SameSite=Strict";
//     const enabled = document.cookie.indexOf("cookietest=") !== -1;
//     document.cookie = "cookietest=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
//     return enabled;
//   } catch {
//     return false;
//   }
// }

// function saveConsent(value) {
//   // Always save to memory
//   window.__cookieConsent = value;
  
//   // Try to save persistently
//   if (areCookiesEnabled()) {
//     // Save for 30 days for accepted, session-only for rejected
//     const maxAge = value === "accepted" ? 31536000 : 0;
//     document.cookie = `cookieConsent=${value}; path=/; max-age=${maxAge}; SameSite=Strict`;
//   }
// }

// function loadConsent() {
//   // Check cookies first
//   const match = document.cookie.match(/(^| )cookieConsent=([^;]+)/);
//   if (match) return match[2];
  
//   // Check memory
//   return window.__cookieConsent || null;
// }

// // === React Component ===
// export default function CookieBanner() {
//   const [showBanner, setShowBanner] = useState(false);
//   const [visible, setVisible] = useState(false);
//   const [isClosing, setIsClosing] = useState(false);

//   useEffect(() => {
//     const consent = loadConsent();
    
//     // Show banner if no consent OR if previously rejected
//     if (!consent || consent === "rejected") {
//       setShowBanner(true);
//       setTimeout(() => setVisible(true), 100);
//     }
//   }, []);

//   const closeBanner = () => {
//     setIsClosing(true);
//     setVisible(false);
//     setTimeout(() => {
//       setShowBanner(false);
//       setIsClosing(false);
//     }, 400);
//   };

//   const handleAccept = () => {
//     saveConsent("accepted");
//     closeBanner();
//   };

//   const handleReject = () => {
//     saveConsent("rejected");
//     closeBanner();
//   };

//   if (!showBanner) return null;

//   return (
//     <>
//       {/* Backdrop */}
//       <div 
//         className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300
//           ${visible ? "opacity-100" : "opacity-0"}`}
//       />
      
//       {/* Banner */}
//       <div
//         className={`fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6
//           transform transition-all duration-400 ease-out
//           ${visible ? "translate-y-0" : "translate-y-full"}
//           ${isClosing ? "scale-95" : "scale-100"}`}
//       >
//         <div className="max-w-4xl mx-auto">
//           <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 
//             backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl
//             p-6 md:p-8 relative overflow-hidden">
            
//             {/* Animated background elements */}
//             <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 
//               animate-pulse" />
//             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r 
//               from-blue-500 via-purple-500 to-pink-500" />
            
//             {/* Content */}
//             <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
              
//               {/* Icon and Message */}
//               <div className="flex-1 flex items-start gap-4">
//                 <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600
//                   rounded-xl flex items-center justify-center text-2xl animate-bounce">
//                   🍪
//                 </div>
                
//                 <div className="space-y-2">
//                   <h3 className="text-white font-semibold text-lg md:text-xl">
//                     We value your privacy
//                   </h3>
//                   <p className="text-slate-300 text-sm md:text-base leading-relaxed">
//                     We use cookies to enhance your browsing experience, serve personalized content, 
//                     and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
//                     {!areCookiesEnabled() && (
//                       <span className="block mt-2 text-amber-300 text-xs">
//                         ⚠️ Third-party cookies are blocked. This banner will appear on each visit.
//                       </span>
//                     )}
//                   </p>
//                   <a
//                     href="/cookie-policy"
//                     className="inline-flex items-center text-blue-400 hover:text-blue-300 
//                       text-sm font-medium transition-colors group"
//                   >
//                     Learn more about our cookie policy
//                     <svg className="ml-1 w-4 h-4 group-hover:translate-x-0.5 transition-transform" 
//                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
//                         d="M9 5l7 7-7 7" />
//                     </svg>
//                   </a>
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex flex-col sm:flex-row gap-3 lg:flex-col xl:flex-row min-w-fit">
//                 <button
//                   onClick={handleReject}
//                   className="px-6 py-3 rounded-xl border border-slate-600 text-slate-300 
//                     hover:bg-slate-700 hover:border-slate-500 transition-all duration-200
//                     font-medium text-sm md:text-base whitespace-nowrap
//                     hover:scale-105 active:scale-95"
//                 >
//                   Reject All
//                 </button>
//                 <button
//                   onClick={handleAccept}
//                   className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600
//                     hover:from-blue-700 hover:to-purple-700 text-white font-semibold
//                     shadow-lg hover:shadow-xl transition-all duration-200
//                     text-sm md:text-base whitespace-nowrap
//                     hover:scale-105 active:scale-95 relative overflow-hidden group"
//                 >
//                   <span className="relative z-10">Accept All</span>
//                   <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 
//                     opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
//                 </button>
//               </div>
//             </div>

//             {/* Close button */}
//             <button
//               onClick={closeBanner}
//               className="absolute top-4 right-4 w-8 h-8 rounded-full 
//                 bg-slate-700/50 hover:bg-slate-600 text-slate-400 hover:text-white
//                 transition-colors duration-200 flex items-center justify-center
//                 hover:scale-110 active:scale-95"
//               aria-label="Close banner"
//             >
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
//                   d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }


import { useState, useEffect } from "react";

// === Utility Functions ===
function isFirstPartyCookiesEnabled() {
  try {
    // Test with minimal cookie attributes for first-party context
    const testValue = Date.now().toString();
    document.cookie = `cookietest=${testValue}; path=/`;
    const enabled = document.cookie.includes(`cookietest=${testValue}`);
    // Clean up
    document.cookie = "cookietest=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    return enabled;
  } catch (error) {
    console.warn('First-party cookie test failed:', error);
    return false;
  }
}

function saveConsent(value) {
  // Always save to memory first for immediate access
  window.__cookieConsent = value;
  
  try {
    if (isFirstPartyCookiesEnabled()) {
      // Save as first-party cookie with minimal attributes
      const maxAge = value === "accepted" ? 31536000 : 86400; // 1 year or 1 day
      document.cookie = `cookieConsent=${value}; path=/; max-age=${maxAge}`;
      
      // Verify it was saved
      setTimeout(() => {
        const saved = document.cookie.match(/(^| )cookieConsent=([^;]+)/);
        if (!saved) {
          console.warn('Cookie persistence failed, using session storage only');
        } else {
          console.log('Cookie consent saved successfully:', value);
        }
      }, 100);
    } else {
      console.warn('First-party cookies disabled, using memory storage only');
    }
  } catch (error) {
    console.warn('Cookie save error:', error);
  }
}

function loadConsent() {
  try {
    // Check cookies first
    const match = document.cookie.match(/(^| )cookieConsent=([^;]+)/);
    if (match && match[2]) {
      console.log('Loaded consent from cookie:', match[2]);
      return match[2];
    }
  } catch (error) {
    console.warn('Cookie read error:', error);
  }
  
  // Check memory storage
  const memoryConsent = window.__cookieConsent;
  if (memoryConsent) {
    console.log('Loaded consent from memory:', memoryConsent);
    return memoryConsent;
  }
  
  console.log('No previous consent found');
  return null;
}

// === React Component ===
export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [cookieStatus, setCookieStatus] = useState('checking');

  useEffect(() => {
    const consent = loadConsent();
    const firstPartyCookiesWork = isFirstPartyCookiesEnabled();
    
    // Set cookie status immediately
    setCookieStatus(firstPartyCookiesWork ? 'enabled' : 'blocked');
    console.log('Cookie status set to:', firstPartyCookiesWork ? 'enabled' : 'blocked');
    
    // Show banner logic:
    // 1. No consent exists (first visit)
    // 2. Consent was "rejected" (always show on refresh for rejected)
    // 3. Cookies are blocked and we have no persistent storage
    const shouldShow = !consent || 
                       consent === "rejected" || 
                       (!firstPartyCookiesWork && !consent);
    
    if (shouldShow) {
      console.log('Showing cookie banner. Reason:', {
        noConsent: !consent,
        wasRejected: consent === "rejected",
        cookiesBlocked: !firstPartyCookiesWork,
        currentConsent: consent
      });
      setShowBanner(true);
      setTimeout(() => setVisible(true), 100);
    } else {
      console.log('Cookie banner hidden. Current consent:', consent);
    }
  }, []);

  const closeBanner = () => {
    setIsClosing(true);
    setVisible(false);
    setTimeout(() => {
      setShowBanner(false);
      setIsClosing(false);
    }, 400);
  };

  const handleAccept = () => {
    saveConsent("accepted");
    closeBanner();
  };

  const handleReject = () => {
    saveConsent("rejected");
    closeBanner();
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300
          ${visible ? "opacity-100" : "opacity-0"}`}
      />
      
      {/* Banner */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6
          transform transition-all duration-400 ease-out
          ${visible ? "translate-y-0" : "translate-y-full"}
          ${isClosing ? "scale-95" : "scale-100"}`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 
            backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl
            p-6 md:p-8 relative overflow-hidden">
            
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 
              animate-pulse" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r 
              from-blue-500 via-purple-500 to-pink-500" />
            
            {/* Content */}
            <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
              
              {/* Icon and Message */}
              <div className="flex-1 flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600
                  rounded-xl flex items-center justify-center text-2xl animate-bounce">
                  🍪
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-white font-semibold text-lg md:text-xl">
                    We value your privacy
                  </h3>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                    We use cookies to enhance your browsing experience, serve personalized content, 
                    and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                    
                    {cookieStatus === 'enabled' && (
                      <span className="block mt-2 text-green-300 text-xs">
                        ✓ Cookie storage is working. Your preference will be saved.
                      </span>
                    )}
                  </p>
                  <a
                    href="/cookie-policy"
                    className="hidden items-center text-blue-400 hover:text-blue-300 
                      text-sm font-medium transition-colors group"
                  >
                    Learn more about our cookie policy
                    <svg className="ml-1 w-4 h-4 group-hover:translate-x-0.5 transition-transform" 
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 lg:flex-col xl:flex-row min-w-fit">
                <button
                  onClick={handleReject}
                  className="px-6 py-3 rounded-xl border border-slate-600 text-slate-300 
                    hover:bg-slate-700 hover:border-slate-500 transition-all duration-200
                    font-medium text-sm md:text-base whitespace-nowrap
                    hover:scale-105 active:scale-95"
                >
                  Reject All
                </button>
                <button
                  onClick={handleAccept}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600
                    hover:from-blue-700 hover:to-purple-700 text-white font-semibold
                    shadow-lg hover:shadow-xl transition-all duration-200
                    text-sm md:text-base whitespace-nowrap
                    hover:scale-105 active:scale-95 relative overflow-hidden group"
                >
                  <span className="relative z-10">Accept All</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </button>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={closeBanner}
              className="absolute top-4 right-4 w-8 h-8 rounded-full 
                bg-slate-700/50 hover:bg-slate-600 text-slate-400 hover:text-white
                transition-colors duration-200 flex items-center justify-center
                hover:scale-110 active:scale-95"
              aria-label="Close banner"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}