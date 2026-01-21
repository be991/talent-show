'use client';

import { Input } from '@/components/atoms/Input';
import { Textarea } from '@/components/atoms/Textarea';
import { PhoneInput } from '@/components/atoms/PhoneInput';
import { FileInput } from '@/components/atoms/FileInput';
import { Mail, Lock, User, Info, Search } from 'lucide-react';
import { useState } from 'react';

export default function InputTestPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    bio: '',
  });

  return (
    <div className="p-8 space-y-12 max-w-4xl mx-auto pb-24">
      <h1 className="text-4xl font-bold text-gray-900">Form Components Test</h1>
      
      {/* Base Input Types */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Basic Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Username" 
            placeholder="johndoe" 
            leftIcon={<User size={18} />}
            required
          />
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="john@example.com" 
            leftIcon={<Mail size={18} />}
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••" 
            helperText="At least 8 characters"
          />
          <Input 
            label="Search" 
            type="text" 
            placeholder="Search tickets..." 
            rightIcon={<Search size={18} />}
          />
        </div>
      </section>

      {/* Specialized Inputs */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Specialized Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PhoneInput 
            label="Phone Number" 
            placeholder="801 234 5678" 
          />
          <FileInput 
            label="Profile Photo" 
            accept="image/*"
            helperText="Upload a clear headshot (PNG, JPG)"
          />
        </div>
      </section>

      {/* Multi-line Inputs */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Multi-line Inputs</h2>
        <Textarea 
          label="Bio / Stage Name Description" 
          placeholder="Tell us about your talent..."
          showCharCount
          maxLength={500}
        />
      </section>

      {/* States */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Validation States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Error State" 
            value="Invalid Input" 
            error="This field is required" 
          />
          <Input 
            label="Disabled State" 
            value="You can't touch this" 
            disabled 
          />
          <Input 
            label="With Helper Text" 
            placeholder="Enter code" 
            helperText="The code is visible on your receipt"
            leftIcon={<Info size={18} />}
          />
          <Input 
            label="Success Appearance" 
            placeholder="Correct info" 
            className="border-green-500 focus:ring-green-500"
          />
        </div>
      </section>

      {/* Interactive Form Display */}
      <section className="space-y-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
        <h2 className="text-2xl font-semibold">Form State Live Preview</h2>
        <div className="grid grid-cols-1 gap-4">
           <Input 
            label="Try typing here" 
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            placeholder="Live update test"
          />
          <div className="mt-2 p-4 bg-white rounded-lg border text-sm font-mono whitespace-pre">
            {JSON.stringify(formData, null, 2)}
          </div>
        </div>
      </section>
    </div>
  );
}
