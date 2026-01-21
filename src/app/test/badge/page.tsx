'use client';

import { Badge } from '@/components/atoms/Badge';
import { Check, AlertTriangle, XCircle, Info, Star, Tag, Clock } from 'lucide-react';
import { useState } from 'react';

export default function BadgeTestPage() {
  const [tags, setTags] = useState(['Singing', 'Dancing', 'Comedy']);

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <div className="p-8 space-y-12 max-w-4xl mx-auto pb-24">
      <h1 className="text-4xl font-bold text-gray-900">Badge Component Test</h1>
      
      {/* Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">Variants</h2>
        <div className="flex flex-wrap gap-3">
          <Badge variant="success">Verified</Badge>
          <Badge variant="warning">Pending</Badge>
          <Badge variant="error">Rejected</Badge>
          <Badge variant="info">New</Badge>
          <Badge variant="default">Default</Badge>
        </div>
      </section>

      {/* Sizes */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">Sizes</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Badge size="sm" variant="success">Small</Badge>
          <Badge size="md" variant="success">Medium</Badge>
          <Badge size="lg" variant="success">Large</Badge>
        </div>
      </section>

      {/* With Icons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">With Icons</h2>
        <div className="flex flex-wrap gap-3">
          <Badge variant="success" icon={<Check size={14} />}>Approved</Badge>
          <Badge variant="warning" icon={<AlertTriangle size={14} />}>Review</Badge>
          <Badge variant="error" icon={<XCircle size={14} />}>Failed</Badge>
          <Badge variant="info" icon={<Info size={14} />}>Info</Badge>
        </div>
      </section>

      {/* With Dot Indicator */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">Dot Indicator</h2>
        <div className="flex flex-wrap gap-3">
          <Badge variant="success" dot>Online</Badge>
          <Badge variant="warning" dot>Away</Badge>
          <Badge variant="error" dot>Offline</Badge>
          <Badge variant="info" dot>Busy</Badge>
          <Badge variant="default" dot>Unknown</Badge>
        </div>
      </section>

      {/* Pill Shape */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">Pill Shape</h2>
        <div className="flex flex-wrap gap-3">
          <Badge variant="success" pill>Pill Success</Badge>
          <Badge variant="warning" pill>Pill Warning</Badge>
          <Badge variant="error" pill>Pill Error</Badge>
          <Badge variant="info" pill icon={<Star size={14} />}>Featured</Badge>
        </div>
      </section>

      {/* Removable Badges */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">Removable Tags</h2>
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <Badge 
              key={tag} 
              variant="info" 
              pill
              removable 
              onRemove={() => removeTag(tag)}
              icon={<Tag size={14} />}
            >
              {tag}
            </Badge>
          ))}
          {tags.length === 0 && (
            <p className="text-gray-500 text-sm">All tags removed. Refresh to reset.</p>
          )}
        </div>
      </section>

      {/* Real-World Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">Real-World Examples</h2>
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Ticket #NGT10-001</h3>
              <p className="text-sm text-gray-500">Contestant Registration</p>
            </div>
            <Badge variant="success" dot pill>Verified</Badge>
          </div>
          
          <div className="p-4 bg-white rounded-xl border border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Ticket #NGT10-002</h3>
              <p className="text-sm text-gray-500">Bank Transfer Pending</p>
            </div>
            <Badge variant="warning" icon={<Clock size={14} />} pill>Awaiting Approval</Badge>
          </div>
          
          <div className="p-4 bg-white rounded-xl border border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Ticket #NGT10-003</h3>
              <p className="text-sm text-gray-500">Payment Failed</p>
            </div>
            <Badge variant="error" icon={<XCircle size={14} />} pill>Rejected</Badge>
          </div>
        </div>
      </section>
    </div>
  );
}
