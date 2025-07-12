import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const CloudinaryTester: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [testing, setTesting] = useState(false);

  const testCloudinaryAccess = async () => {
    setTesting(true);
    setTestResult('');
    
    // Test with a known Cloudinary URL pattern
    const testUrls = [
      'https://res.cloudinary.com/doxwyrp8n/image/upload/v1234567890/real_estate/test.jpg',
      'https://res.cloudinary.com/demo/image/upload/sample.jpg', // Demo image
    ];
    
    let results = '';
    
    for (const url of testUrls) {
      results += `\n🧪 Testing URL: ${url}\n`;
      
      try {
        // Test HEAD request
        const headResponse = await fetch(url, { method: 'HEAD' });
        results += `   HEAD: ${headResponse.status} - ${headResponse.statusText}\n`;
        results += `   Headers: ${JSON.stringify(Object.fromEntries(headResponse.headers.entries()))}\n`;
        
        // Test image loading
        const img = new Image();
        const loadPromise = new Promise((resolve, reject) => {
          img.onload = () => resolve('✅ Image loads successfully');
          img.onerror = (e) => reject(`❌ Image failed to load: ${e}`);
          setTimeout(() => reject('⏰ Image load timeout'), 5000);
        });
        
        img.src = url;
        const loadResult = await loadPromise;
        results += `   Load test: ${loadResult}\n`;
        
      } catch (error) {
        results += `   ❌ Error: ${error}\n`;
      }
    }
    
    setTestResult(results);
    setTesting(false);
  };

  const testUploadAndDisplay = async () => {
    setTesting(true);
    setTestResult('🧪 Testing complete upload and display flow...\n');
    
    try {
      // Create a test image
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, 50, 50);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(50, 0, 50, 50);
        ctx.fillStyle = '#0000ff';
        ctx.fillRect(0, 50, 50, 50);
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(50, 50, 50, 50);
      }
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png');
      });
      
      const testFile = new File([blob], 'test-upload.png', { type: 'image/png' });
      
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', testFile);
      formData.append('upload_preset', 'kkdrealestate');
      formData.append('folder', 'real_estate');
      
      const uploadResponse = await fetch(
        'https://api.cloudinary.com/v1_1/doxwyrp8n/image/upload',
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }
      
      const uploadData = await uploadResponse.json();
      setTestResult(prev => prev + `✅ Upload successful: ${uploadData.secure_url}\n`);
      
      // Test immediate access
      const img = new Image();
      const loadPromise = new Promise((resolve, reject) => {
        img.onload = () => resolve('✅ Image displays immediately after upload');
        img.onerror = (e) => reject(`❌ Image failed to display: ${e}`);
        setTimeout(() => reject('⏰ Image display timeout'), 10000);
      });
      
      img.src = uploadData.secure_url;
      const displayResult = await loadPromise;
      setTestResult(prev => prev + `${displayResult}\n`);
      
      toast.success('Complete test passed! Upload and display working.');
      
    } catch (error) {
      setTestResult(prev => prev + `❌ Test failed: ${error}\n`);
      toast.error(`Test failed: ${error}`);
    }
    
    setTesting(false);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-blue-800">🧪 Cloudinary Troubleshooter</h3>
        <p className="text-sm text-blue-600">Test image upload and display functionality</p>
      </div>
      
      <div className="flex gap-2">
        <Button 
          onClick={testCloudinaryAccess}
          disabled={testing}
          variant="outline"
          size="sm"
        >
          Test CORS & Access
        </Button>
        <Button 
          onClick={testUploadAndDisplay}
          disabled={testing}
          variant="outline"
          size="sm"
        >
          Test Upload & Display
        </Button>
      </div>
      
      {testResult && (
        <div className="bg-white border rounded p-3">
          <h4 className="font-medium mb-2">Test Results:</h4>
          <pre className="text-xs text-gray-800 whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}
    </div>
  );
};

export default CloudinaryTester;
