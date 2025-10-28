import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UserPropertyForm from '@/components/UserPropertyForm';

const NewListings = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-20 lg:pt-32 pb-16 bg-gradient-to-br from-teal-900 via-blue-900 to-purple-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              List Your
              <span className="block lg:inline bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
                {' '}Property
              </span>
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Share your property details with us and reach thousands of potential buyers and renters
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <UserPropertyForm />
        </div>
      </section>

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
};

export default NewListings;
