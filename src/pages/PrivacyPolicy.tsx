import React, { useEffect, useState } from 'react';
import { ArrowLeft, Shield, Database, Cookie, Users, FileText, Clock, Phone, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  useEffect(() => {
    // Smooth page transition and scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Add page transition animation
    document.body.style.opacity = '0';
    setTimeout(() => {
      document.body.style.opacity = '1';
      document.body.style.transition = 'opacity 0.3s ease-in-out';
    }, 50);

    // Set page title for SEO
    document.title = 'Privacy Policy | Mana Nivasam - Real Estate Services';
    
    // Add meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Privacy Policy for Mana Nivasam Real Estate Services. Learn how we protect and handle your personal information.');
    }

    return () => {
      document.body.style.transition = '';
      document.title = 'Mana Nivasam - Premium Real Estate Services';
    };
  }, []);

  const handleBackNavigation = () => {
    navigate(-1);
  };

  const sections = [
    {
      id: 'introduction',
      title: 'Introduction',
      icon: Shield,
      content: `Welcome to Mana Nivasam. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our real estate services. By accessing or using our services, you consent to the practices described in this policy.`
    },
    {
      id: 'data-collection',
      title: 'What Data We Collect',
      icon: Database,
      content: `We collect information that you provide directly to us, including:
      
• Personal Information: Name, email address, phone number, and mailing address
• Property Preferences: Budget range, preferred locations, property types, and search criteria
• Communication Data: Messages, inquiries, and feedback you send to us
• Account Information: Username, password, and profile preferences
• Financial Information: Income details for loan eligibility (encrypted and secure)
• Location Data: With your consent, we may collect your device location to show nearby properties
• Usage Information: How you interact with our website and services
• Device Information: Browser type, operating system, and device identifiers`,
      subsections: [
        {
          title: 'Automatically Collected Information',
          content: 'We automatically collect certain information when you visit our website, including IP address, browser type, operating system, referring URLs, and pages visited.'
        }
      ]
    },
    {
      id: 'data-usage',
      title: 'How We Use Your Data',
      icon: Users,
      content: `We use the collected information for the following purposes:
      
• Property Services: To help you find, buy, sell, or rent properties that match your preferences
• Communication: To respond to your inquiries, provide customer support, and send important updates
• Personalization: To customize your experience and show relevant property recommendations
• Marketing: To send you promotional materials about our services (with your consent)
• Legal Compliance: To comply with legal obligations and protect our rights
• Analytics: To analyze website usage and improve our services
• Security: To detect, prevent, and address technical issues and fraudulent activities
• Transaction Processing: To facilitate property transactions and handle payments securely`,
      subsections: [
        {
          title: 'Marketing Communications',
          content: 'We may send you promotional emails about new properties, market updates, and special offers. You can opt-out at any time using the unsubscribe link in our emails.'
        }
      ]
    },
    {
      id: 'cookies',
      title: 'Cookies and Tracking Technologies',
      icon: Cookie,
      content: `We use cookies and similar tracking technologies to enhance your browsing experience:
      
• Essential Cookies: Required for basic website functionality
• Analytics Cookies: Help us understand how visitors use our website
• Preference Cookies: Remember your settings and preferences
• Marketing Cookies: Used to deliver relevant advertisements
• Social Media Cookies: Enable sharing content on social platforms
      
You can control cookie settings through your browser preferences. Note that disabling certain cookies may affect website functionality.`,
      subsections: [
        {
          title: 'Third-Party Cookies',
          content: 'We may use third-party services like Google Analytics and Facebook Pixel to analyze website traffic and improve our marketing efforts.'
        }
      ]
    },
    {
      id: 'data-sharing',
      title: 'Data Sharing and Third-Party Services',
      icon: FileText,
      content: `We may share your information with trusted third parties in the following circumstances:
      
• Property Partners: Real estate agents, developers, and property owners to facilitate transactions
• Service Providers: Companies that help us operate our business (hosting, analytics, customer support)
• Legal Compliance: When required by law, court order, or government request
• Business Transfers: In case of merger, acquisition, or sale of our business
• Consent: When you explicitly agree to share information with specific third parties
      
We never sell your personal information to third parties for their marketing purposes without your explicit consent.`,
      subsections: [
        {
          title: 'International Transfers',
          content: 'Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data.'
        }
      ]
    },
    {
      id: 'user-rights',
      title: 'Your Rights and Choices',
      icon: Users,
      content: `You have the following rights regarding your personal information:
      
• Access: Request a copy of the personal information we hold about you
• Correction: Ask us to correct or update inaccurate information
• Deletion: Request deletion of your personal information (subject to legal requirements)
• Portability: Request a copy of your data in a commonly used format
• Restriction: Ask us to limit how we use your information
• Objection: Object to certain uses of your information
• Withdrawal: Withdraw consent for data processing where applicable
      
To exercise these rights, please contact us using the information provided below.`,
      subsections: [
        {
          title: 'Account Management',
          content: 'You can update your account information and privacy preferences by logging into your account or contacting our support team.'
        }
      ]
    },
    {
      id: 'data-retention',
      title: 'Data Retention',
      icon: Clock,
      content: `We retain your personal information for as long as necessary to provide our services and comply with legal obligations:
      
• Account Information: Retained while your account is active and for 3 years after closure
• Transaction Data: Kept for 7 years for legal and tax purposes
• Marketing Data: Retained until you opt-out or for 2 years of inactivity
• Website Analytics: Anonymized data retained for up to 26 months
• Customer Support Records: Kept for 3 years after the last interaction
      
We regularly review and securely delete data that is no longer needed.`,
      subsections: [
        {
          title: 'Data Security',
          content: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.'
        }
      ]
    },
    {
      id: 'contact',
      title: 'Contact Information',
      icon: Phone,
      content: `If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
      
• Email: privacy@mananivasam.com
• Phone: +91 91210 55512
• Address: Mana Nivasam Real Estate Services
• Business Hours: Monday to Saturday, 9:00 AM to 7:00 PM IST
      
We will respond to your inquiry within 30 days and work to resolve any privacy concerns promptly.`,
      subsections: [
        {
          title: 'Data Protection Officer',
          content: 'For specific data protection inquiries, you may contact our Data Protection Officer at dpo@mananivasam.com.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Skip to main content for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>
      
      <Header />
      
      {/* Hero Section with Breadcrumb - Mobile Optimized */}
      <section className="relative pt-16 md:pt-20 pb-8 md:pb-12 bg-gradient-to-r from-purple-600 via-blue-600 to-blue-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-600/30 to-blue-600/30"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
          {/* Back Navigation */}
          <div className="mb-4 md:mb-6">
            <Button
              onClick={handleBackNavigation}
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 p-2"
              aria-label="Go back to previous page"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
              <span className="text-sm md:text-base">Back</span>
            </Button>
          </div>
          
          {/* Title Section - Mobile Optimized */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-4 md:mb-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl flex items-center justify-center border border-white/20">
                <Shield className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent px-2">
              Privacy Policy
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100 mb-6 md:mb-8 leading-relaxed px-2">
              Your privacy matters to us. Learn how we protect and handle your personal information.
            </p>
            <div className="text-xs sm:text-sm text-blue-200">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Table of Contents - Hidden on mobile */}
      <nav className="py-8 md:py-12 bg-white border-b border-gray-100 hidden md:block" aria-label="Privacy Policy Table of Contents">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Table of Contents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {sections.map((section, index) => {
                const IconComponent = section.icon;
                return (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="group p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50 hover:from-blue-50 hover:to-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label={`Navigate to ${section.title} section`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {index + 1}. {section.title}
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Mobile Optimized with Dropdowns */}
      <main id="main-content" className="py-8 md:py-16 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {sections.map((section, index) => {
              const IconComponent = section.icon;
              const isExpanded = expandedSections[section.id];
              
              return (
                <article
                  key={section.id}
                  id={section.id}
                  className="mb-4 md:mb-16 scroll-mt-20 md:scroll-mt-24"
                  aria-labelledby={`${section.id}-heading`}
                >
                  <div className="bg-white rounded-lg md:rounded-2xl shadow-lg md:shadow-xl border border-gray-100 overflow-hidden hover:shadow-xl md:hover:shadow-2xl transition-shadow duration-500">
                    {/* Section Header - Mobile Dropdown Style */}
                    <header className="bg-white md:bg-gradient-to-r md:from-blue-600 md:to-purple-600 border-b border-gray-200 md:border-none">
                      {/* Mobile Dropdown Header */}
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="md:hidden w-full px-4 py-4 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:bg-gray-50 transition-colors duration-200"
                        aria-expanded={isExpanded}
                        aria-controls={`${section.id}-content`}
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <h2 id={`${section.id}-heading`} className="text-lg font-bold text-gray-900 leading-tight truncate">
                            {index + 1}. {section.title}
                          </h2>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-600 transition-transform duration-200" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600 transition-transform duration-200" />
                          )}
                        </div>
                      </button>

                      {/* Desktop Header (Always Visible) */}
                      <div className="hidden md:block px-6 md:px-8 py-4 md:py-6">
                        <div className="flex items-center space-x-3 md:space-x-4">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-5 h-5 md:w-6 md:h-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h2 id={`${section.id}-heading-desktop`} className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-tight">
                              {index + 1}. {section.title}
                            </h2>
                          </div>
                        </div>
                      </div>
                    </header>
                    
                    {/* Section Content - Collapsible on Mobile */}
                    <div 
                      id={`${section.id}-content`}
                      className={`
                        transition-all duration-300 ease-in-out overflow-hidden
                        md:block
                        ${isExpanded ? 'block' : 'hidden md:block'}
                      `}
                    >
                      <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8">
                        <div className="prose prose-sm sm:prose md:prose-lg max-w-none">
                          <div className="text-gray-700 leading-relaxed whitespace-pre-line mb-4 md:mb-6 text-sm sm:text-base">
                            {section.content}
                          </div>
                          
                          {/* Subsections - Mobile Optimized */}
                          {section.subsections && section.subsections.map((subsection, subIndex) => (
                            <div key={subIndex} className="mt-6 md:mt-8 p-4 md:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg md:rounded-xl border border-blue-100">
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 md:mb-3 flex items-center">
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-2 md:mr-3 flex-shrink-0"></div>
                                <span className="leading-tight">{subsection.title}</span>
                              </h3>
                              <div className="text-gray-700 leading-relaxed text-sm sm:text-base">
                                {subsection.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>

      {/* Contact CTA Section - Mobile Optimized */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 md:mb-8">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 border border-white/20">
                <Mail className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 px-2">
                Have Questions About Your Privacy?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 md:mb-8 px-2">
                We're here to help. Contact our privacy team for any questions or concerns.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto">
              <a
                href="mailto:privacy@mananivasam.com"
                className="group p-4 md:p-6 bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <Mail className="w-6 h-6 md:w-8 md:h-8 text-white mb-2 md:mb-3 mx-auto group-hover:scale-110 transition-transform" />
                <div className="text-base md:text-lg font-semibold mb-1 md:mb-2">Email Us</div>
                <div className="text-sm md:text-base text-blue-100 break-all">privacy@mananivasam.com</div>
              </a>
              
              <a
                href="tel:+918985816481"
                className="group p-4 md:p-6 bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <Phone className="w-6 h-6 md:w-8 md:h-8 text-white mb-2 md:mb-3 mx-auto group-hover:scale-110 transition-transform" />
                <div className="text-base md:text-lg font-semibold mb-1 md:mb-2">Call Us</div>
                <div className="text-sm md:text-base text-blue-100">+91 91210 55512</div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
