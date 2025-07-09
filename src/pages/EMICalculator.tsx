import React, { useState, useEffect } from 'react';
import { Calculator, ArrowLeft, Download, Mail, RotateCcw, Info, TrendingUp, PieChart, BarChart3, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '@/config/emailjs-config';
import Header from '@/components/Header';

interface EMIResult {
  monthlyEMI: number;
  totalInterest: number;
  totalPayment: number;
  loanAmount: number;
  eligibility?: {
    maxLoanAmount: number;
    isEligible: boolean;
    message: string;
  };
}

interface AmortizationData {
  year: number;
  principal: number;
  interest: number;
  balance: number;
  totalPaid: number;
}

interface BankComparison {
  bankName: string;
  interestRate: number;
  emi: number;
  totalInterest: number;
  totalPayment: number;
}

const EMICalculator = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    propertyPrice: '',
    downPayment: '',
    interestRate: '8.5',
    loanTenure: 20,
    monthlyIncome: '',
    existingEMIs: '',
    prepaymentAmount: '',
    interestType: 'reducing' // reducing or flat
  });

  const [results, setResults] = useState<EMIResult | null>(null);
  const [amortizationData, setAmortizationData] = useState<AmortizationData[]>([]);
  const [bankComparisons, setBankComparisons] = useState<BankComparison[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [prepaymentImpact, setPrepaymentImpact] = useState<any>(null);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  // Check if EmailJS is configured
  const isEmailJSConfigured = () => {
    return EMAILJS_CONFIG.PUBLIC_KEY !== "YOUR_EMAILJS_PUBLIC_KEY" && 
           EMAILJS_CONFIG.SERVICE_ID !== "YOUR_SERVICE_ID" && 
           EMAILJS_CONFIG.TEMPLATE_ID !== "YOUR_TEMPLATE_ID";
  };

  // Fallback toast function if useToast is not available
  const showToast = (title: string, description: string, variant?: 'default' | 'destructive') => {
    if (toast) {
      toast({ title, description, variant });
    } else {
      // Fallback to browser alert if toast is not available
      alert(`${title}: ${description}`);
    }
  };

  // Sample bank data for comparison
  const bankRates = [
    { name: 'SBI', rate: 8.50 },
    { name: 'HDFC', rate: 8.65 },
    { name: 'ICICI', rate: 8.70 },
    { name: 'Axis Bank', rate: 8.75 },
    { name: 'Kotak', rate: 8.80 }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Enhanced number formatting with NaN protection
  const formatNumber = (num: string) => {
    const value = num.replace(/[^\d]/g, '');
    if (!value || value === '') return '';
    const numValue = Number(value);
    if (isNaN(numValue)) return '';
    return new Intl.NumberFormat('en-IN').format(numValue);
  };

  // Safe number parsing with NaN protection and defaults
  const parseNumber = (str: string) => {
    if (!str || str.trim() === '') return 0;
    const cleanStr = str.replace(/[^\d]/g, '');
    const numValue = Number(cleanStr);
    return isNaN(numValue) ? 0 : numValue;
  };

  // Calculate loan amount with validation and error handling
  const calculateLoanAmount = () => {
    const propertyPrice = parseNumber(formData.propertyPrice);
    const downPayment = parseNumber(formData.downPayment);
    
    // Prevent negative loan amounts and invalid scenarios
    if (propertyPrice <= 0 || downPayment < 0) return 0;
    if (downPayment >= propertyPrice) return 0;
    
    return propertyPrice - downPayment;
  };

  const calculateEMI = () => {
    const loanAmount = calculateLoanAmount();
    const monthlyRate = parseFloat(formData.interestRate) / (12 * 100);
    const numberOfPayments = formData.loanTenure * 12;

    if (loanAmount <= 0 || monthlyRate <= 0 || numberOfPayments <= 0) {
      return;
    }

    let monthlyEMI: number;
    let totalInterest: number;

    if (formData.interestType === 'reducing') {
      // Reducing balance EMI calculation
      monthlyEMI = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                   (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      totalInterest = (monthlyEMI * numberOfPayments) - loanAmount;
    } else {
      // Flat rate calculation
      totalInterest = (loanAmount * parseFloat(formData.interestRate) * formData.loanTenure) / 100;
      monthlyEMI = (loanAmount + totalInterest) / numberOfPayments;
    }

    const totalPayment = loanAmount + totalInterest;

    // Calculate loan eligibility if income is provided
    let eligibility;
    if (formData.monthlyIncome) {
      const monthlyIncome = parseNumber(formData.monthlyIncome);
      const existingEMIs = parseNumber(formData.existingEMIs || '0');
      const maxEMIAllowed = (monthlyIncome * 0.4) - existingEMIs; // 40% of income
      const maxLoanAmount = (maxEMIAllowed * (Math.pow(1 + monthlyRate, numberOfPayments) - 1)) / 
                            (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments));
      
      eligibility = {
        maxLoanAmount,
        isEligible: monthlyEMI <= maxEMIAllowed,
        message: monthlyEMI <= maxEMIAllowed ? 
          'You are eligible for this loan amount!' : 
          `Your maximum eligible EMI is ${formatCurrency(maxEMIAllowed)}`
      };
    }

    const result: EMIResult = {
      monthlyEMI,
      totalInterest,
      totalPayment,
      loanAmount,
      eligibility
    };

    setResults(result);
    generateAmortizationSchedule(loanAmount, monthlyRate, numberOfPayments, monthlyEMI);
    generateBankComparisons(loanAmount, formData.loanTenure);
    
    // Calculate prepayment impact if provided
    if (formData.prepaymentAmount) {
      calculatePrepaymentImpact(loanAmount, monthlyRate, numberOfPayments, monthlyEMI);
    }

    setShowResults(true);
  };

  const generateBankComparisons = (loanAmount: number, tenure: number) => {
    const comparisons: BankComparison[] = bankRates.map(bank => {
      const monthlyRate = bank.rate / (12 * 100);
      const numberOfPayments = tenure * 12;
      const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                  (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      const totalInterest = (emi * numberOfPayments) - loanAmount;
      const totalPayment = loanAmount + totalInterest;
      
      return {
        bankName: bank.name,
        interestRate: bank.rate,
        emi,
        totalInterest,
        totalPayment
      };
    });
    
    setBankComparisons(comparisons);
  };

  const generateAmortizationSchedule = (
    loanAmount: number, 
    monthlyRate: number, 
    numberOfPayments: number, 
    monthlyEMI: number
  ) => {
    const schedule: AmortizationData[] = [];
    let balance = loanAmount;
    let totalPaid = 0;

    for (let year = 1; year <= formData.loanTenure; year++) {
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;

      for (let month = 1; month <= 12 && balance > 0; month++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyEMI - interestPayment;
        
        yearlyPrincipal += principalPayment;
        yearlyInterest += interestPayment;
        balance -= principalPayment;
        totalPaid += monthlyEMI;
      }

      schedule.push({
        year,
        principal: yearlyPrincipal,
        interest: yearlyInterest,
        balance: Math.max(0, balance),
        totalPaid
      });
    }

    setAmortizationData(schedule);
  };

  const calculatePrepaymentImpact = (
    loanAmount: number,
    monthlyRate: number,
    numberOfPayments: number,
    originalEMI: number
  ) => {
    const prepayment = parseNumber(formData.prepaymentAmount);
    const newLoanAmount = loanAmount - prepayment;
    
    if (newLoanAmount <= 0) {
      setPrepaymentImpact({
        newTenure: 0,
        interestSaved: results?.totalInterest || 0,
        newEMI: 0
      });
      return;
    }

    // Calculate new tenure with same EMI
    const newTenureMonths = Math.log(1 + (newLoanAmount * monthlyRate) / originalEMI) / 
                           Math.log(1 + monthlyRate);
    const newTenureYears = newTenureMonths / 12;
    
    // Calculate interest saved
    const originalTotalInterest = (originalEMI * numberOfPayments) - loanAmount;
    const newTotalInterest = (originalEMI * newTenureMonths) - newLoanAmount;
    const interestSaved = originalTotalInterest - newTotalInterest;

    setPrepaymentImpact({
      newTenure: newTenureYears,
      interestSaved,
      newEMI: originalEMI
    });
  };

  const resetForm = () => {
    setFormData({
      propertyPrice: '',
      downPayment: '',
      interestRate: '8.5',
      loanTenure: 20,
      monthlyIncome: '',
      existingEMIs: '',
      prepaymentAmount: '',
      interestType: 'reducing'
    });
    setResults(null);
    setAmortizationData([]);
    setShowResults(false);
    setPrepaymentImpact(null);
  };

  const sendEmailSummary = async () => {
    if (!currentUser) {
      showToast(
        "Authentication Required",
        "Please log in to send EMI summary via email.",
        "destructive"
      );
      return;
    }

    if (!results) {
      showToast(
        "No Data Available",
        "Please calculate EMI first before sending summary.",
        "destructive"
      );
      return;
    }

    setIsEmailSending(true);

    try {
      // Check if EmailJS is properly configured
      if (!isEmailJSConfigured()) {
        // EmailJS not configured - use fallback method
        await sendEmailFallback();
        return;
      }

      // Generate email content
      const emailContent = generateEmailContent();

      // Initialize EmailJS with actual configuration
      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

      const templateParams = {
        to_email: currentUser.email,
        to_name: currentUser.displayName || 'Valued Customer',
        subject: 'Your EMI Calculation Summary',
        message: emailContent,
      };

      await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, templateParams);

      showToast(
        "✅ Email Sent Successfully",
        `EMI summary sent to ${currentUser.email}`
      );

    } catch (error) {
      console.error('Email sending failed:', error);
      // Try fallback method if EmailJS fails
      await sendEmailFallback();
    } finally {
      setIsEmailSending(false);
    }
  };

  const sendEmailFallback = async () => {
    try {
      // Create a mailto link as fallback
      const emailContent = generateEmailContent();
      const subject = encodeURIComponent('Your EMI Calculation Summary');
      const body = encodeURIComponent(emailContent);
      const mailtoLink = `mailto:${currentUser?.email}?subject=${subject}&body=${body}`;
      
      // Try to open default email client
      window.open(mailtoLink, '_blank');
      
      showToast(
        "📧 Email Client Opened",
        "Your default email client has been opened with the EMI summary. Please send the email manually.",
      );
    } catch (error) {
      console.error('Fallback email failed:', error);
      // Final fallback - copy to clipboard
      try {
        const emailContent = generateEmailContent();
        await navigator.clipboard.writeText(emailContent);
        showToast(
          "📋 Summary Copied",
          "EMI summary has been copied to clipboard. You can paste it into an email.",
        );
      } catch (clipboardError) {
        console.error('Clipboard fallback failed:', clipboardError);
        showToast(
          "⚙️ Configuration Required",
          "EmailJS not configured. Please check the setup instructions in the documentation.",
          "destructive"
        );
      }
    }
  };

  const generateEmailContent = () => {
    if (!results) return '';

    const timestamp = new Date().toLocaleString();
    const loanAmount = calculateLoanAmount();

    return `
🏠 MORTGAGE EMI SUMMARY REPORT

📅 Generated: ${timestamp}
👤 User: ${currentUser?.email}

💰 LOAN DETAILS:
• Property Price: ${formatCurrency(parseNumber(formData.propertyPrice))}
• Down Payment: ${formatCurrency(parseNumber(formData.downPayment))}
• Loan Amount: ${formatCurrency(loanAmount)}
• Interest Rate: ${formData.interestRate}% per annum
• Loan Tenure: ${formData.loanTenure} years
• Interest Type: ${formData.interestType === 'reducing' ? 'Reducing Balance' : 'Flat Rate'}

📊 MONTHLY EMI BREAKDOWN:
• Monthly EMI: ${formatCurrency(results.monthlyEMI)}
• Total Interest: ${formatCurrency(results.totalInterest)}
• Total Payment: ${formatCurrency(results.totalPayment)}

${formData.monthlyIncome ? `
💼 ELIGIBILITY CHECK:
• Monthly Income: ${formatCurrency(parseNumber(formData.monthlyIncome))}
• Existing EMIs: ${formatCurrency(parseNumber(formData.existingEMIs || '0'))}
• Loan Status: ${results.eligibility?.isEligible ? 'ELIGIBLE ✅' : 'NOT ELIGIBLE ❌'}
${results.eligibility?.message ? `• Note: ${results.eligibility.message}` : ''}
` : ''}

${prepaymentImpact ? `
🎯 PREPAYMENT IMPACT:
• Prepayment Amount: ${formatCurrency(parseNumber(formData.prepaymentAmount))}
• New Loan Tenure: ${prepaymentImpact.newTenure.toFixed(1)} years
• Interest Saved: ${formatCurrency(prepaymentImpact.interestSaved)}
• Time Saved: ${(formData.loanTenure - prepaymentImpact.newTenure).toFixed(1)} years
` : ''}

---
This summary was generated by Prime Vista Homes EMI Calculator.
For more property investment opportunities, visit our website.

⚠️ Note: This calculation is for informational purposes only. Actual loan terms may vary based on lender policies and your credit profile.
    `.trim();
  };

  const generatePDF = async () => {
    if (!results) {
      showToast(
        "No Data Available",
        "Please calculate EMI first before generating PDF.",
        "destructive"
      );
      return;
    }

    setIsPdfGenerating(true);

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      pdf.setFontSize(20);
      pdf.setTextColor(220, 38, 38); // Red color
      pdf.text('MORTGAGE EMI SUMMARY', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Date and user info
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
      if (currentUser?.email) {
        pdf.text(`User: ${currentUser.email}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 20;
      }

      // Loan Details Section
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('LOAN DETAILS', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      const loanAmount = calculateLoanAmount();
      const loanDetails = [
        `Property Price: ${formatCurrency(parseNumber(formData.propertyPrice))}`,
        `Down Payment: ${formatCurrency(parseNumber(formData.downPayment))}`,
        `Loan Amount: ${formatCurrency(loanAmount)}`,
        `Interest Rate: ${formData.interestRate}% per annum`,
        `Loan Tenure: ${formData.loanTenure} years`,
        `Interest Type: ${formData.interestType === 'reducing' ? 'Reducing Balance' : 'Flat Rate'}`
      ];

      loanDetails.forEach(detail => {
        pdf.text(detail, 20, yPosition);
        yPosition += 8;
      });

      yPosition += 10;

      // EMI Results Section
      pdf.setFontSize(14);
      pdf.text('EMI CALCULATION RESULTS', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.setTextColor(220, 38, 38);
      pdf.text(`Monthly EMI: ${formatCurrency(results.monthlyEMI)}`, 20, yPosition);
      yPosition += 15;

      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Total Interest: ${formatCurrency(results.totalInterest)}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Total Payment: ${formatCurrency(results.totalPayment)}`, 20, yPosition);
      yPosition += 15;

      // Eligibility Check Section
      if (results.eligibility && formData.monthlyIncome) {
        pdf.setFontSize(14);
        pdf.text('ELIGIBILITY CHECK', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.text(`Monthly Income: ${formatCurrency(parseNumber(formData.monthlyIncome))}`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Existing EMIs: ${formatCurrency(parseNumber(formData.existingEMIs || '0'))}`, 20, yPosition);
        yPosition += 8;
        
        pdf.setTextColor(results.eligibility.isEligible ? 0 : 255, results.eligibility.isEligible ? 128 : 0, 0);
        pdf.text(`Status: ${results.eligibility.isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}`, 20, yPosition);
        yPosition += 8;
        
        pdf.setTextColor(0, 0, 0);
        if (results.eligibility.message) {
          const messageLines = pdf.splitTextToSize(results.eligibility.message, pageWidth - 40);
          messageLines.forEach((line: string) => {
            pdf.text(line, 20, yPosition);
            yPosition += 6;
          });
        }
        yPosition += 10;
      }

      // Prepayment Impact Section
      if (prepaymentImpact) {
        pdf.setFontSize(14);
        pdf.text('PREPAYMENT IMPACT', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.text(`Prepayment Amount: ${formatCurrency(parseNumber(formData.prepaymentAmount))}`, 20, yPosition);
        yPosition += 8;
        pdf.text(`New Loan Tenure: ${prepaymentImpact.newTenure.toFixed(1)} years`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Interest Saved: ${formatCurrency(prepaymentImpact.interestSaved)}`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Time Saved: ${(formData.loanTenure - prepaymentImpact.newTenure).toFixed(1)} years`, 20, yPosition);
        yPosition += 15;
      }

      // Chart Section
      const chartElement = document.getElementById('emi-chart-container');
      if (chartElement) {
        try {
          const canvas = await html2canvas(chartElement as HTMLElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          });
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 150;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          if (yPosition + imgHeight > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.setFontSize(14);
          pdf.text('PAYMENT BREAKDOWN CHART', 20, yPosition);
          yPosition += 15;
          
          pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 10;
        } catch (error) {
          console.error('Error capturing chart:', error);
        }
      }

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Generated by Prime Vista Homes EMI Calculator', pageWidth / 2, pageHeight - 10, { align: 'center' });
      pdf.text('Note: This calculation is for informational purposes only. Actual loan terms may vary.', pageWidth / 2, pageHeight - 5, { align: 'center' });

      // Save PDF
      const fileName = `emi-summary-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      showToast(
        "✅ PDF Generated Successfully",
        `EMI summary downloaded as ${fileName}`
      );

    } catch (error) {
      console.error('PDF generation failed:', error);
      showToast(
        "PDF Generation Failed",
        "Failed to generate PDF. Please try again.",
        "destructive"
      );
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const pieData = results ? [
    { name: 'Principal', value: results.loanAmount, color: '#ef4444' },
    { name: 'Interest', value: results.totalInterest, color: '#f97316' }
  ] : [];

  const COLORS = ['#ef4444', '#f97316'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="space-y-3 mb-6">
            <div className="relative flex items-center justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="absolute left-0 -top-1 text-gray-600 hover:text-gray-900 border-gray-300 hover:bg-gray-50 p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="text-center">
                <h1 className="text-lg font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">EMI Calculator</h1>
                <p className="text-sm text-gray-600 mt-1">Calculate your home loan EMI and plan your finances</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <div className="space-y-4">
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-gray-900">Loan Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Property Price */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="propertyPrice" className="font-medium text-sm">Property Price</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3 h-3 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Total cost of the property you want to purchase</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="propertyPrice"
                      type="text"
                      placeholder="Enter property price"
                      value={formData.propertyPrice ? formatNumber(formData.propertyPrice) : ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, '');
                        setFormData(prev => ({ ...prev, propertyPrice: value }));
                      }}
                      className="text-base"
                    />
                  </div>

                  {/* Down Payment */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="downPayment" className="font-medium text-sm">Down Payment</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3 h-3 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Initial payment made upfront (usually 10-20% of property price)</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="downPayment"
                      type="text"
                      placeholder="Enter down payment"
                      value={formData.downPayment ? formatNumber(formData.downPayment) : ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, '');
                        setFormData(prev => ({ ...prev, downPayment: value }));
                      }}
                      className="text-base"
                    />
                  </div>

                  {/* Loan Amount Display */}
                  <div className={`p-3 rounded-lg transition-colors ${
                    (() => {
                      const loanAmount = calculateLoanAmount();
                      if (loanAmount <= 0 && formData.propertyPrice && formData.downPayment) {
                        const propertyPrice = parseNumber(formData.propertyPrice);
                        const downPayment = parseNumber(formData.downPayment);
                        if (downPayment >= propertyPrice) {
                          return "bg-red-50 border border-red-200";
                        }
                      }
                      return "bg-blue-50";
                    })()
                  }`}>
                    <Label className="text-xs font-medium text-blue-900">Loan Amount</Label>
                    <p className={`text-lg font-bold transition-colors ${
                      (() => {
                        const loanAmount = calculateLoanAmount();
                        if (loanAmount <= 0 && formData.propertyPrice && formData.downPayment) {
                          const propertyPrice = parseNumber(formData.propertyPrice);
                          const downPayment = parseNumber(formData.downPayment);
                          if (downPayment >= propertyPrice) {
                            return "text-red-700";
                          }
                        }
                        return "text-blue-900";
                      })()
                    }`}>
                      {(() => {
                        const loanAmount = calculateLoanAmount();
                        if (loanAmount <= 0) {
                          if (formData.propertyPrice && formData.downPayment) {
                            const propertyPrice = parseNumber(formData.propertyPrice);
                            const downPayment = parseNumber(formData.downPayment);
                            if (downPayment >= propertyPrice) {
                              return "Down payment cannot exceed property price";
                            }
                          }
                          return "₹0";
                        }
                        return formatCurrency(loanAmount);
                      })()}
                    </p>
                  </div>

                  {/* Interest Rate */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="interestRate" className="font-medium text-sm">Annual Interest Rate (%)</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3 h-3 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Current home loan interest rates typically range from 7% to 10%</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.1"
                      placeholder="8.5"
                      value={formData.interestRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
                      className="text-base"
                    />
                  </div>

                  {/* Loan Tenure */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium text-sm">Loan Tenure: {formData.loanTenure} years</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3 h-3 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Longer tenure = Lower EMI but higher total interest</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Slider
                      value={[formData.loanTenure]}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, loanTenure: value[0] }))}
                      max={30}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1 year</span>
                      <span>30 years</span>
                    </div>
                  </div>

                  {/* Interest Type */}
                  <div className="space-y-1">
                    <Label className="font-medium text-sm">Interest Calculation Method</Label>
                    <Select value={formData.interestType} onValueChange={(value) => setFormData(prev => ({ ...prev, interestType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reducing">Reducing Balance (Recommended)</SelectItem>
                        <SelectItem value="flat">Flat Rate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Optional Fields - Loan Eligibility Check */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="eligibility" className="border rounded-lg shadow-sm">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <CardTitle className="text-base font-semibold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">Loan eligibility check</CardTitle>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="space-y-4 pt-0">
                      <div className="space-y-2">
                        <Label htmlFor="monthlyIncome" className="font-medium text-sm">Monthly Income (for eligibility check)</Label>
                        <Input
                          id="monthlyIncome"
                          type="text"
                          placeholder="Enter monthly income"
                          value={formData.monthlyIncome ? formatNumber(formData.monthlyIncome) : ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            setFormData(prev => ({ ...prev, monthlyIncome: value }));
                          }}
                          className="text-base"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="existingEMIs" className="font-medium text-sm">Existing EMIs</Label>
                        <Input
                          id="existingEMIs"
                          type="text"
                          placeholder="Enter existing EMI payments"
                          value={formData.existingEMIs ? formatNumber(formData.existingEMIs) : ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            setFormData(prev => ({ ...prev, existingEMIs: value }));
                          }}
                          className="text-base"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="prepaymentAmount" className="font-medium text-sm">One-time Prepayment</Label>
                        <Input
                          id="prepaymentAmount"
                          type="text"
                          placeholder="Enter prepayment amount"
                          value={formData.prepaymentAmount ? formatNumber(formData.prepaymentAmount) : ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            setFormData(prev => ({ ...prev, prepaymentAmount: value }));
                          }}
                          className="text-base"
                        />
                      </div>
                    </CardContent>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button 
                  onClick={calculateEMI}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 text-sm font-semibold rounded-full"
                  disabled={calculateLoanAmount() <= 0}
                  size="sm"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate EMI
                </Button>
                <Button 
                  variant="outline"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-full"
                  size="sm"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-3">
              {showResults && results ? (
                <>
                  {/* EMI Result Cards */}
                  <div className="grid gap-1">
                    <Card className="shadow-sm bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
                      <CardContent className="p-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-red-700">Monthly EMI</p>
                            <p className="text-lg font-bold text-red-900">{formatCurrency(results.monthlyEMI)}</p>
                          </div>
                          <TrendingUp className="w-4 h-4 text-red-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-1">
                      <Card className="shadow-sm">
                        <CardContent className="p-2">
                          <p className="text-xs font-medium text-gray-600">Total Interest</p>
                          <p className="text-sm font-bold text-gray-900">{formatCurrency(results.totalInterest)}</p>
                        </CardContent>
                      </Card>
                      <Card className="shadow-sm">
                        <CardContent className="p-2">
                          <p className="text-xs font-medium text-gray-600">Total Payment</p>
                          <p className="text-sm font-bold text-gray-900">{formatCurrency(results.totalPayment)}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Eligibility Check */}
                  {results.eligibility && (
                    <Card className={`shadow-sm ${results.eligibility.isEligible ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                      <CardContent className="p-3">
                        <h3 className="font-semibold mb-1 text-sm">Loan Eligibility</h3>
                        <p className={`text-xs ${results.eligibility.isEligible ? 'text-green-800' : 'text-yellow-800'}`}>
                          {results.eligibility.message}
                        </p>
                        {!results.eligibility.isEligible && (
                          <p className="text-xs text-gray-600 mt-1">
                            Max eligible loan: {formatCurrency(results.eligibility.maxLoanAmount)}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Charts */}
                  <Card className="shadow-sm">
                    <CardHeader className="pb-1">
                      <CardTitle className="text-xs font-semibold">Payment Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 p-2">
                      <div className="h-56" id="emi-chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              outerRadius={60}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip formatter={(value: number) => [formatCurrency(value), 'Amount']} />
                            <Legend />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Prepayment Impact */}
                  {prepaymentImpact && (
                    <Card className="shadow-sm bg-blue-50 border-blue-200">
                      <CardHeader className="pb-1">
                        <CardTitle className="text-xs font-semibold text-blue-900">Prepayment Impact</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 p-2">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-xs text-blue-700">New Loan Tenure:</span>
                            <span className="font-semibold text-xs text-blue-900">{prepaymentImpact.newTenure.toFixed(1)} years</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-blue-700">Interest Saved:</span>
                            <span className="font-semibold text-xs text-blue-900">{formatCurrency(prepaymentImpact.interestSaved)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-blue-700">Time Saved:</span>
                            <span className="font-semibold text-xs text-blue-900">{(formData.loanTenure - prepaymentImpact.newTenure).toFixed(1)} years</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Advanced Details */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="amortization">
                      <AccordionTrigger className="text-left py-1">
                        <div className="flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" />
                          <span className="text-xs">Amortization Schedule</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={amortizationData.slice(0, 10)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="year" />
                                <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                                <RechartsTooltip formatter={(value: number) => [formatCurrency(value), 'Amount']} />
                                <Legend />
                                <Bar dataKey="principal" fill="#ef4444" name="Principal" />
                                <Bar dataKey="interest" fill="#f97316" name="Interest" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                          
                          <div className="max-h-40 overflow-y-auto">
                            <table className="w-full text-xs">
                              <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                  <th className="px-1 py-0.5 text-left">Year</th>
                                  <th className="px-1 py-0.5 text-right">Principal</th>
                                  <th className="px-1 py-0.5 text-right">Interest</th>
                                  <th className="px-1 py-0.5 text-right">Balance</th>
                                </tr>
                              </thead>
                              <tbody>
                                {amortizationData.map((row) => (
                                  <tr key={row.year} className="border-b">
                                    <td className="px-1 py-0.5">{row.year}</td>
                                    <td className="px-1 py-0.5 text-right">{formatCurrency(row.principal)}</td>
                                    <td className="px-1 py-0.5 text-right">{formatCurrency(row.interest)}</td>
                                    <td className="px-1 py-0.5 text-right">{formatCurrency(row.balance)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="flex-1 py-1 text-xs h-8"
                            onClick={sendEmailSummary}
                            disabled={isEmailSending || !currentUser}
                          >
                            {isEmailSending ? (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <Mail className="w-3 h-3 mr-1" />
                            )}
                            {isEmailSending ? 'Sending...' : 'Email Summary'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {!currentUser 
                              ? "Please log in to send email" 
                              : !isEmailJSConfigured() 
                                ? "Will open email client or copy to clipboard" 
                                : "Send EMI summary to your email"
                            }
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button 
                      variant="outline" 
                      className="flex-1 py-1 text-xs h-8"
                      onClick={generatePDF}
                      disabled={isPdfGenerating}
                    >
                      {isPdfGenerating ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Download className="w-3 h-3 mr-1" />
                      )}
                      {isPdfGenerating ? 'Generating...' : 'Download PDF'}
                    </Button>
                  </div>
                </>
              ) : (
                <Card className="shadow-sm">
                  <CardContent className="p-6 text-center">
                    <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-gray-600 mb-2">Ready to Calculate</h3>
                    <p className="text-sm text-gray-500">Enter your loan details and click "Calculate EMI" to see results</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 md:hidden z-30">
        <Button 
          onClick={calculateEMI}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 text-sm font-semibold rounded-full"
          disabled={calculateLoanAmount() <= 0}
          size="sm"
        >
          <Calculator className="w-4 h-4 mr-2" />
          Calculate EMI
        </Button>
      </div>
    </div>
  );
};

export default EMICalculator;
