import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DesignSystemTestPage() {
  return (
    <div className="min-h-screen bg-talent-mesh p-8 md:p-12 space-y-12">
      <header className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-black text-gradient-gold animate-fade-in">
          NGT1.0 Design System
        </h1>
        <p className="text-xl text-muted-foreground animate-slide-up">
          Validating colors, typography, and components for "Talent Stardom".
        </p>
      </header>

      {/* Colors Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold border-b pb-2">Colors & Tokens</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <ColorSwatch name="Primary Gold" hex="#F5C542" className="bg-primary-gold text-dark" />
          <ColorSwatch name="Primary Green" hex="#2D5016" className="bg-primary-green text-white" />
          <ColorSwatch name="Dark" hex="#0A0E1A" className="bg-dark text-white" />
          <ColorSwatch name="Success" hex="#10B981" className="bg-success text-white" />
          <ColorSwatch name="Warning" hex="#F59E0B" className="bg-warning text-white" />
          <ColorSwatch name="Error" hex="#EF4444" className="bg-error text-white" />
          <ColorSwatch name="Info" hex="#3B82F6" className="bg-info text-white" />
          <ColorSwatch name="Muted" hex="var(--muted)" className="bg-muted text-muted-foreground" />
        </div>
      </section>

      {/* Components Section */}
      <section className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold border-b pb-2">Buttons & Interaction</h2>
          <div className="flex flex-wrap gap-4">
            <Button className="btn-primary">Primary Button</Button>
            <Button className="btn-green">Green Button</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Badge className="bg-primary-gold text-dark">Contestant</Badge>
            <Badge className="bg-primary-green text-white">Audience</Badge>
            <Badge variant="outline">Pending Approval</Badge>
            <Badge className="bg-success">Active Ticket</Badge>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold border-b pb-2">Cards & Surfaces</h2>
          <div className="grid gap-4">
            <Card className="card-talent">
              <CardHeader>
                <CardTitle className="text-primary-green uppercase tracking-wider text-sm font-black">
                  Contestant Registration
                </CardTitle>
                <CardDescription>₦10,000 — Full Access</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Includes photo upload, talent category selection, and stage name registration.
                </p>
              </CardContent>
            </Card>

            <div className="glass-card p-6 text-white bg-dark/80">
              <h3 className="text-lg font-bold text-primary-gold mb-2">Exclusive Access</h3>
              <p className="opacity-80">
                This item uses the glassmorphism aesthetic planned for the hero sections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Typography Section */}
      <section className="space-y-6 bg-white/50 p-8 rounded-2xl border border-gray-100">
        <h2 className="text-2xl font-bold border-b pb-2">Typography Scale</h2>
        <div className="space-y-4">
          <p className="text-6xl font-black">Extra Bold Heading</p>
          <p className="text-4xl font-bold">Main Section Title</p>
          <p className="text-2xl font-semibold">Sub-heading Text</p>
          <p className="text-base text-gray-700 leading-relaxed">
            Body text using the Inter system font stack. It's designed to be highly readable on mobile and desktop. 
            Maecenas sed diam eget risus varius blandit sit amet non magna. 
            Donec sed odio dui.
          </p>
          <p className="text-sm text-muted-foreground uppercase tracking-widest">Small Caption or Label</p>
        </div>
      </section>
    </div>
  );
}

function ColorSwatch({ name, hex, className }: { name: string; hex: string; className: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={`h-24 w-full rounded-xl shadow-inner flex items-center justify-center font-bold text-xs p-2 text-center ${className}`}>
        {name}
      </div>
      <span className="text-[10px] font-mono text-center uppercase text-muted-foreground">{hex}</span>
    </div>
  );
}
