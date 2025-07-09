import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MessageCircle, User, Send } from 'lucide-react';
import { toast } from 'sonner';

interface PropertyContactProps {
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  propertyTitle: string;
  propertyLocation: string;
}

const PropertyContact: React.FC<PropertyContactProps> = ({
  contactName,
  contactPhone,
  contactEmail,
  propertyTitle,
  propertyLocation
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: `Hi, I'm interested in "${propertyTitle}" in ${propertyLocation}. Please share more details.`
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWhatsAppContact = () => {
    // Use the specified phone number: 9121055512
    const phoneNumber = '9121055512';
    const message = encodeURIComponent('Hello, I\'m interested in your property listed on the site.');
    const whatsappUrl = `https://wa.me/91${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailContact = () => {
    // Use the specified email: snsnarayanac@gmail.com
    const emailAddress = 'snsnarayanac@gmail.com';
    const subject = encodeURIComponent('Property Inquiry – Sent via Website');
    const body = encodeURIComponent('Property Inquiry – Sent via Website');
    const emailUrl = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
    window.location.href = emailUrl;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Please fill in required fields');
      return;
    }
    toast.success('Thank you! We will contact you soon.');
    setFormData({ name: '', phone: '', email: '', message: formData.message });
  };

  return (
    <div className="space-y-6 font-body">
      {/* Contact Details */}
      {(contactName || contactPhone || contactEmail) && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 font-premium">Property Agent</h4>
          <div className="space-y-3">
            {contactName && (
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium">{contactName}</span>
              </div>
            )}
            {contactPhone && (
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium">{contactPhone}</span>
              </div>
            )}
            {contactEmail && (
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium truncate">{contactEmail}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Contact Buttons - Styled smaller with padding and pulled down */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <Button
          onClick={handleWhatsAppContact}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl py-2 px-3 text-sm shadow-soft transition-all duration-200 transform hover:scale-105"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          WhatsApp
        </Button>
        <Button
          onClick={handleEmailContact}
          variant="outline"
          className="rounded-xl py-2 px-3 text-sm border-gray-200 hover:bg-gray-50 shadow-elegant transition-all duration-200 transform hover:scale-105"
        >
          <Mail className="w-4 h-4 mr-2" />
          Email
        </Button>
      </div>

      {/* Modern Inquiry Form */}
      <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
        <h4 className="text-lg font-semibold text-gray-900 mb-6 font-premium">Send Inquiry</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="name"
            placeholder="Your Name *"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="rounded-xl border-gray-200 focus:border-blue-500 transition-colors"
          />
          <Input
            name="phone"
            placeholder="Your Phone *"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className="rounded-xl border-gray-200 focus:border-blue-500 transition-colors"
          />
          <Input
            name="email"
            type="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleInputChange}
            className="rounded-xl border-gray-200 focus:border-blue-500 transition-colors"
          />
          <Textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleInputChange}
            rows={4}
            className="rounded-xl border-gray-200 focus:border-blue-500 resize-none transition-colors"
          />
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl py-3 shadow-soft transition-all duration-200 transform hover:scale-105"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Inquiry
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PropertyContact;
