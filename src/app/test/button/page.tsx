'use client';

import { Button } from '@/components/atoms/Button';
import { Download, ArrowRight, Plus } from 'lucide-react';

export default function ButtonTestPage() {
  return (
    <div className="p-8 space-y-12 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold">Button Component Test</h1>
      
      {/* Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="link">Link Button</Button>
        </div>
      </section>
      
      {/* Sizes */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small Button</Button>
          <Button size="md">Medium Button</Button>
          <Button size="lg">Large Button</Button>
        </div>
      </section>
      
      {/* With Icons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">With Icons</h2>
        <div className="flex flex-wrap gap-4">
          <Button leftIcon={<Download className="w-4 h-4" />}>Download</Button>
          <Button rightIcon={<ArrowRight className="w-4 h-4" />}>Continue</Button>
          <Button leftIcon={<Plus className="w-4 h-4" />} rightIcon={<ArrowRight className="w-4 h-4" />}>
            Add Item
          </Button>
        </div>
      </section>
      
      {/* States */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">States</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Default</Button>
          <Button loading>Loading...</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>
      
      {/* Full Width */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Full Width</h2>
        <Button fullWidth>Full Width Button</Button>
      </section>
      
      {/* Interactive Test */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Interactive</h2>
        <Button onClick={() => alert('Button clicked!')}>
          Click Me
        </Button>
      </section>
    </div>
  );
}
