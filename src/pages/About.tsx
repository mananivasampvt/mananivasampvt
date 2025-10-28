import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StoryGallery from '@/components/StoryGallery';
import { Button } from '@/components/ui/button';
import { Award, Users, Building, Heart, MapPin, Phone, Mail, MessageCircle } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
}

const About = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setError(null);
      console.log('Fetching team members from Firestore...');
      console.log('Database instance:', db);
      console.log('Project ID:', db.app.options.projectId);
      
      const collectionRef = collection(db, 'teamMembers');
      console.log('Team members collection reference:', collectionRef);
      
      const querySnapshot = await getDocs(collectionRef);
      console.log('Team members query executed successfully. Number of documents:', querySnapshot.size);
      console.log('Team member documents:', querySnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })));
      
      const teamData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Processing team member document:', { id: doc.id, data });
        
        return {
          id: doc.id,
          name: data.name || 'Unknown',
          role: data.role || 'Team Member',
          description: data.description || 'No description available',
          image: data.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400'
        };
      }) as TeamMember[];
      
      console.log('Processed team members data:', teamData);
      setTeamMembers(teamData.reverse()); // Reverse to show most recently added first
      
      if (teamData.length === 0) {
        console.log('No team members found in the database');
      }
      
    } catch (error: any) {
      console.error('Detailed error fetching team members:', {
        error,
        code: error?.code,
        message: error?.message,
        stack: error?.stack
      });
      
      let errorMessage = 'Unable to load team members. ';
      
      if (error?.code === 'permission-denied') {
        errorMessage += 'Database access denied. Please check Firestore security rules.';
        console.error('Permission denied - Firestore security rules may be blocking access to teamMembers collection');
      } else if (error?.code === 'unauthenticated') {
        errorMessage += 'Authentication required to view team members.';
      } else if (error?.code === 'unavailable') {
        errorMessage += 'Database temporarily unavailable. Please try again later.';
      } else {
        errorMessage += `Error: ${error?.message || 'Unknown error occurred'}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { icon: Building, value: '', label: 'Properties Listed' },
    { icon: Users, value: '', label: 'Happy Clients' },
    { icon: MapPin, value: '', label: 'Locations Covered' },
    { icon: Award, value: '', label: 'Satisfaction Rate' },
  ];

  const handlePhoneCall = () => {
    window.location.href = 'tel:9849834102';
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent("Hello, I'm interested in real estate services.");
    const whatsappUrl = `https://wa.me/919849834102?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailContact = () => {
    const emailAddress = 'mananivasam@gmail.com';
    const subject = encodeURIComponent('Inquiry about Real Estate Services');
    const body = encodeURIComponent("Hello,\n\nI'm interested in learning more about your real estate services. Please contact me at your earliest convenience.\n\nThank you!");
    const mailtoUrl = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section id="hero" className="relative pt-20 lg:pt-32 pb-16 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497604401993-f2e922e5cb0a?q=80&w=2070')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              About
              <span className="block lg:inline bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
                Mana Nivasam
              </span>
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Your trusted partner in luxury real estate, connecting dreams with reality since 2025.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story with Admin-Managed Gallery */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="fade-in-up">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 lg:mb-6">Our Story</h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-4 lg:mb-6 leading-relaxed">
                Founded with a vision to revolutionize the real estate experience, Mana Nivasam has grown 
                from a small startup to one of the most trusted names in premium property services.
              </p>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 lg:mb-8 leading-relaxed">
                We believe that finding the perfect property should be an exciting journey, not a stressful 
                ordeal. Our team of experienced professionals works tirelessly to match our clients with 
                properties that not only meet their needs but exceed their expectations.
              </p>
              <div className="flex items-center space-x-4">
                <Heart className="w-6 h-6 lg:w-8 lg:h-8 text-red-500" />
                <span className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
                  Serving with passion and integrity
                </span>
              </div>
            </div>
            <div className="fade-in-up" style={{animationDelay: '0.2s'}}>
              <StoryGallery />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Our Achievements</h2>
            <p className="text-sm sm:text-base lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Numbers that speak for our commitment to excellence
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center fade-in-up" 
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-premium-gradient rounded-2xl mx-auto mb-2 sm:mb-3 lg:mb-4 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{stat.value}</div>
                <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Team Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Meet Our Team</h2>
            <p className="text-sm sm:text-base lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Dedicated professionals committed to your real estate success
            </p>
          </div>
          
          {/* Debug Information */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-8 text-center">
              <p className="font-medium">Error loading team members:</p>
              <p className="text-sm mt-1">{error}</p>
              <Button
                onClick={fetchTeamMembers}
                className="mt-3 text-sm bg-red-600 hover:bg-red-700 text-white"
              >
                Retry Loading Team Members
              </Button>
            </div>
          )}
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="text-center animate-pulse">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6"></div>
                  <div className="h-4 sm:h-6 bg-gray-200 rounded mb-2 mx-auto w-24 sm:w-32"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded mb-4 mx-auto w-16 sm:w-24"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded mx-auto w-full"></div>
                </div>
              ))}
            </div>
          ) : teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {teamMembers.map((member, index) => (
                <div 
                  key={member.id} 
                  className="text-center fade-in-up hover-lift" 
                  style={{animationDelay: `${index * 0.2}s`}}
                >
                  <div className="relative mb-4 sm:mb-6">
                    <img 
                      src={member.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400'} 
                      alt={member.name}
                      className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 object-cover rounded-full mx-auto shadow-xl transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400';
                      }}
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20"></div>
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2 transition-colors duration-300 hover:text-purple-600">{member.name}</h3>
                  <p className="text-sm sm:text-base text-purple-600 font-semibold mb-2 sm:mb-4 transition-colors duration-300 hover:text-purple-800">{member.role}</p>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed transition-colors duration-300 hover:text-gray-800">{member.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Team Members Found</h3>
              <p className="text-gray-600 mb-4">
                {error ? 'There was an error loading team members.' : 'No team members have been added yet.'}
              </p>
              <Button
                onClick={fetchTeamMembers}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                Refresh Team Members
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA with Fixed Contact Actions */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-purple-900 to-pink-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto text-white">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6">
              Ready to Find Your Dream Property?
            </h2>
            <p className="text-sm sm:text-base lg:text-xl text-gray-200 mb-8 sm:mb-12 leading-relaxed">
              Let our expert team guide you through your real estate journey. 
              Contact us today for a personalized consultation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              <Button 
                onClick={handlePhoneCall}
                className="btn-luxury text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Call Us Now
              </Button>
              <Button 
                onClick={handleWhatsAppContact}
                className="bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                WhatsApp
              </Button>
              <Button 
                variant="outline" 
                onClick={handleEmailContact}
                className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-purple-900 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Email Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
