'use client';

import { motion, useScroll, useTransform, useSpring, useMotionValue, useVelocity, useAnimationFrame } from 'framer-motion';
import { 
  Ticket, 
  Trophy, 
  Calendar, 
  MapPin, 
  Phone,
  Star,
  Sparkles,
  ChevronDown,
  Instagram,
  Twitter,
  Facebook,
  Heart,
  MessageCircle,
  ArrowRight,
  Zap,
  Play,
  Leaf
} from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';

// Theme colors
const GREEN = '#2D5016';
const GREEN_LIGHT = '#4A7A2A';
const GREEN_DARK = '#1E3610';
const BG_CREAM = '#EAECE6';  // Darker/Warmer cream (Sage tint)
const BG_WARM = '#EFF1EC';   // Warmer white (Light Sage tint)

// ========== TEXT SCRAMBLE EFFECT ==========
const chars = '!<>-_\\/[]{}—=+*^?#________';

function useTextScramble(text: string, isActive: boolean) {
  const [displayText, setDisplayText] = useState(text);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setDisplayText(text.split('').map(() => chars[Math.floor(Math.random() * chars.length)]).join(''));
      setIsComplete(false);
      return;
    }

    let iteration = 0;
    const maxIterations = text.length;
    
    const interval = setInterval(() => {
      setDisplayText(
        text.split('').map((char, index) => {
          if (index < iteration) return char;
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('')
      );
      
      iteration += 1/3;
      
      if (iteration >= maxIterations) {
        clearInterval(interval);
        setDisplayText(text);
        setIsComplete(true);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [text, isActive]);

  return { displayText, isComplete };
}

// ========== MAGNETIC BUTTON COMPONENT ==========
function MagneticButton({ children, className, onClick, style }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties }) {

  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.3);
    y.set((e.clientY - centerY) * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const springConfig = { stiffness: 150, damping: 15 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  return (
    <motion.button
      ref={ref}
      className={className}
      style={{ x: springX, y: springY, ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}

// ========== SMOOTH SCROLL VELOCITY TEXT ==========
function VelocityText({ children, baseVelocity = 5 }: { children: string; baseVelocity?: number }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });

  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

  const directionFactor = useRef<number>(1);
  
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-hidden whitespace-nowrap flex flex-nowrap">
      <motion.div className="flex whitespace-nowrap flex-nowrap" style={{ x }}>
        {[...Array(4)].map((_, i) => (
          <span key={i} className="mr-8 text-8xl md:text-[12rem] font-black" style={{ color: 'rgba(45,80,22,0.08)' }}>
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function wrap(min: number, max: number, v: number) {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
}

// ========== HORIZONTAL SCROLL SECTION ==========
function HorizontalScrollSection({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

  return (
    <section ref={containerRef} className="relative h-[180vh]">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div style={{ x }} className="flex gap-8 pl-[5vw]">
          {children}
        </motion.div>
      </div>
    </section>
  );
}

// ========== STACKED CARDS THAT FAN OUT ==========
function StackedFanCards({ items }: { items: { image: string; name: string; description: string }[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"]
  });

  return (
    <div ref={containerRef} className="relative h-[500px] flex items-center justify-center" style={{ perspective: '1500px' }}>
      {items.map((item, index) => {
        const rotation = useTransform(
          scrollYProgress,
          [0, 1],
          [(index - Math.floor(items.length / 2)) * 2, (index - Math.floor(items.length / 2)) * 15]
        );
        const translateX = useTransform(
          scrollYProgress,
          [0, 1],
          [0, (index - Math.floor(items.length / 2)) * 120]
        );
        const translateY = useTransform(
          scrollYProgress,
          [0, 1],
          [index * 4, 0]
        );
        const scale = useTransform(
          scrollYProgress,
          [0, 1],
          [1 - index * 0.02, 1]
        );

        return (
          <motion.div
            key={item.name}
            className="absolute w-64 h-80 rounded-3xl overflow-hidden shadow-2xl cursor-pointer border-4 border-white"
            style={{
              zIndex: items.length - index,
              rotateZ: rotation,
              x: translateX,
              y: translateY,
              scale,
              transformOrigin: 'center bottom',
            }}
            whileHover={{ scale: 1.1, zIndex: 100, rotateZ: 0 }}
          >
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${GREEN}, transparent)` }} />
            <motion.div 
              className="absolute bottom-0 left-0 right-0 p-6"
              initial={{ opacity: 0, y: 20 }}
              whileHover={{ opacity: 1, y: 0 }}
            >
              <p className="text-white font-black text-xl">{item.name}</p>
              <p className="text-white/80 text-sm">{item.description}</p>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ========== CIRCULAR PROGRESS TEXT ==========
function CircularText({ text }: { text: string }) {
  return (
    <motion.div 
      className="relative w-32 h-32"
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <path
            id="circlePath"
            d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
          />
        </defs>
        <text fill={GREEN} fontSize="10" fontWeight="bold" letterSpacing="3">
          <textPath href="#circlePath">
            {text}
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Play className="w-8 h-8" style={{ color: GREEN, fill: GREEN }} />
      </div>
    </motion.div>
  );
}

// ========== CURSOR GLOW EFFECT ==========
function CursorGlow() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  return (
    <motion.div
      className="fixed w-[500px] h-[500px] rounded-full pointer-events-none z-0"
      style={{
        background: 'radial-gradient(circle, rgba(45,80,22,0.08) 0%, transparent 70%)',
        left: mousePosition.x - 250,
        top: mousePosition.y - 250,
      }}
      animate={{
        left: mousePosition.x - 250,
        top: mousePosition.y - 250,
      }}
      transition={{ type: "spring", damping: 30, stiffness: 200 }}
    />
  );
}

// ========== MAIN COMPONENT ==========
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroInView, setHeroInView] = useState(false);
  
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroScale = useTransform(heroScroll, [0, 0.5], [1, 0.85]);
  const heroOpacity = useTransform(heroScroll, [0, 0.5], [1, 0]);
  const heroBlur = useTransform(heroScroll, [0, 0.5], [0, 10]);

  useEffect(() => {
    const timer = setTimeout(() => setHeroInView(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Unsplash images (free to use)
  const performerImages = [
    { 
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80', 
      name: 'Musicians',
      description: 'Make the crowd feel the beat'
    },
    { 
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80', 
      name: 'Singers',
      description: 'Let your voice be heard'
    },
    { 
      image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&q=80', 
      name: 'Dancers',
      description: 'Move to the rhythm'
    },
    { 
      image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80', 
      name: 'Performers',
      description: 'Bring your unique talent'
    },
    { 
      image: 'https://images.unsplash.com/photo-1478147427282-58a87a120781?w=800&q=80', 
      name: 'Entertainers',
      description: 'Make them remember you'
    },
  ];

  const { displayText: nutesaText } = useTextScramble('NUTESA', heroInView);
  const { displayText: gotText } = useTextScramble('GOT', heroInView);
  const { displayText: talentText } = useTextScramble('TALENT', heroInView);

  const eventDetails = [
    { title: 'Registration', value: '₦10,000', subtitle: 'Contestant Entry', icon: Ticket },
    { title: 'Grand Prize', value: '₦500K', subtitle: 'For the Winner', icon: Trophy },
    { title: 'Date', value: 'TBA', subtitle: 'Coming Soon', icon: Calendar },
    { title: 'Venue', value: 'TBA', subtitle: 'To Be Announced', icon: MapPin },
  ];

  const contacts = [
    { name: 'Debrain', phone: '09064151889' },
    { name: 'Chamoo', phone: '07068770621' },
    { name: 'Joker', phone: '08078898079' },
  ];

  return (
    <main className="text-gray-900 overflow-x-hidden" style={{ backgroundColor: BG_WARM }}>
      <CursorGlow />
      
      {/* ========== HERO SECTION ========== */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden"
        style={{ background: `linear-gradient(to bottom, ${BG_WARM}, ${BG_CREAM}, ${BG_WARM})` }}
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          {/* Subtle pattern */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232D5016' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          
          {/* Floating images with orbit effect */}
          {[
            { src: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80', delay: 0, duration: 25 },
            { src: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80', delay: 5, duration: 30 },
            { src: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&q=80', delay: 10, duration: 20 },
            { src: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=400&q=80', delay: 15, duration: 28 },
          ].map((img, index) => (
            <motion.div
              key={index}
              className="absolute w-28 h-36 md:w-36 md:h-44 rounded-2xl overflow-hidden shadow-xl"
              style={{
                left: `${20 + index * 20}%`,
                top: `${15 + (index % 2) * 50}%`,
                border: `3px solid ${GREEN}`,
              }}
              animate={{
                y: [0, -30, 0, 30, 0],
                x: [0, 20, 0, -20, 0],
                rotateZ: [-5, 5, -5],
                rotateY: [0, 15, 0, -15, 0],
              }}
              transition={{
                duration: img.duration,
                repeat: Infinity,
                delay: img.delay,
                ease: "easeInOut",
              }}
            >
              <Image 
                src={img.src} 
                alt="" 
                fill 
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${GREEN}40, transparent)` }} />
            </motion.div>
          ))}

          {/* Ambient glow */}
          <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full blur-[200px]" style={{ backgroundColor: 'rgba(45,80,22,0.08)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[180px]" style={{ backgroundColor: 'rgba(45,80,22,0.06)' }} />
        </div>
        
        <motion.div 
          style={{ scale: heroScale, opacity: heroOpacity, filter: `blur(${heroBlur}px)` }}
          className="relative z-10 text-center max-w-6xl mx-auto"
        >
          {/* Main Heading with Scramble Effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-7xl sm:text-9xl md:text-[11rem] lg:text-[14rem] font-black tracking-tighter leading-[0.8] select-none">
              <motion.span 
                className="block"
                style={{ color: GREEN }}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
              >
                {nutesaText}
              </motion.span>
              <motion.span 
                className="block text-gray-900"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
              >
                {gotText} <span style={{ color: GREEN }}>{talentText}</span>
              </motion.span>
            </h1>
          </motion.div>
          
          {/* Circular rotating badge */}
          <motion.div
            className="absolute -right-10 top-1/2 -translate-y-1/2 hidden lg:block"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <CircularText text="✦ SEASON 10 ✦ TALENT STARDOM ✦ " />
          </motion.div>
          
          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mt-8 mb-12"
          >
            Are you ready to <span className="text-gray-900 font-semibold">shine?</span> Do you have what it takes to become the next{' '}
            <span className="font-bold" style={{ color: GREEN }}>BIG STAR?</span>
          </motion.p>
          
          {/* CTA Buttons with Magnetic Effect */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <MagneticButton 
              onClick={() => console.log('Get Your Ticket clicked')}
              className="group relative px-10 py-5 text-gray-900 font-bold text-lg rounded-full overflow-hidden border-2 shadow-lg"
              style={{ borderColor: GREEN, backgroundColor: BG_CREAM }}
            >
              <motion.div
                className="absolute inset-0"
                style={{ backgroundColor: GREEN }}
                initial={{ y: '100%' }}
                whileHover={{ y: 0 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors">
                <Ticket className="w-5 h-5" />
                Get Your Ticket — ₦1,500
              </span>
            </MagneticButton>
            
            <MagneticButton 
              onClick={() => console.log('Register as Contestant clicked')}
              className="group relative px-10 py-5 text-white font-bold text-lg rounded-full overflow-hidden shadow-lg"
              style={{ backgroundColor: GREEN }}
            >
              <motion.div
                className="absolute inset-0 bg-white/20"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                style={{ skewX: '-20deg' }}
              />
              <span className="relative z-10 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Register as Contestant
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </MagneticButton>
          </motion.div>
        </motion.div>
        
        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 rounded-full flex justify-center pt-2"
            style={{ borderColor: GREEN }}
          >
            <motion.div 
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: GREEN }}
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
          <span className="text-gray-500 text-xs uppercase tracking-widest">Scroll</span>
        </motion.div>
      </section>

      {/* ========== VELOCITY MARQUEE ========== */}
      <section className="py-8 border-y" style={{ borderColor: 'rgba(45,80,22,0.1)' }}>
        <VelocityText baseVelocity={2}>NUTESA GOT TALENT • SEASON 10 • </VelocityText>
      </section>

      {/* ========== CATEGORIES - STACKED FAN CARDS ========== */}
      <section className="relative py-32 px-4" style={{ background: `linear-gradient(to bottom, ${BG_WARM}, ${BG_CREAM}, ${BG_WARM})` }}>
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.p className="text-sm font-semibold tracking-widest mb-4" style={{ color: GREEN }}>
              SHOWCASE YOUR TALENT
            </motion.p>
            <h2 className="text-5xl sm:text-6xl md:text-8xl font-black text-gray-900">
              Categories
            </h2>
          </motion.div>
          
          <StackedFanCards items={performerImages} />
          
          {/* "And many more" */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mt-16"
          >
            <span className="text-2xl text-gray-500">
              ...and <span className="font-bold" style={{ color: GREEN }}>countless</span> more talents
            </span>
          </motion.div>
        </div>
      </section>

      {/* ========== HORIZONTAL SCROLL - EVENT DETAILS ========== */}
      <HorizontalScrollSection>
        {eventDetails.map((detail, index) => {
          // Add some simple skew based on index for a dynamic feel
          const skewEffect = index % 2 === 0 ? 0 : 0;
          
          return (
            <motion.div
              key={detail.title}
            className="flex-shrink-0 w-[80vw] sm:w-[60vw] md:w-[40vw] lg:w-[30vw] h-[60vh] border-2 rounded-[3rem] p-10 flex flex-col justify-between group transition-all duration-500 shadow-lg hover:shadow-2xl"
            style={{ borderColor: 'rgba(45,80,22,0.2)', backgroundColor: BG_CREAM }}
            whileHover={{ scale: 1.02, borderColor: GREEN }}
          >
            <motion.div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(45,80,22,0.1)' }}
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <detail.icon className="w-10 h-10" style={{ color: GREEN }} />
            </motion.div>
            
            <div>
              <p className="text-gray-500 text-sm font-medium mb-2 uppercase tracking-widest">{detail.title}</p>
              <p className="text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 mb-2">{detail.value}</p>
              <p className="text-gray-500">{detail.subtitle}</p>
            </div>
            
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full"
                style={{ backgroundColor: GREEN }}
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                transition={{ duration: 1.5, delay: index * 0.2 }}
              />
            </div>
            </motion.div>
          );
        })}
      </HorizontalScrollSection>

      {/* ========== CTA SECTION ========== */}
      <section className="relative py-40 px-4 overflow-hidden" style={{ background: `linear-gradient(to bottom, ${BG_WARM}, ${BG_CREAM}, ${BG_WARM})` }}>
        {/* Dramatic background */}
        <div className="absolute inset-0">
          {/* Spotlight effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[200px]" style={{ backgroundColor: 'rgba(45,80,22,0.1)' }} />
          
          {/* Rotating rings */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border rounded-full"
            style={{ borderColor: 'rgba(45,80,22,0.1)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border rounded-full"
            style={{ borderColor: 'rgba(45,80,22,0.15)' }}
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border rounded-full"
            style={{ borderColor: 'rgba(45,80,22,0.1)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Floating leaves/stars */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 30}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              <Leaf className="w-6 h-6" style={{ color: GREEN, fill: 'rgba(45,80,22,0.3)' }} />
            </motion.div>
          ))}
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative">
          {/* Eyebrow text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold tracking-[0.3em] mb-6"
            style={{ color: GREEN }}
          >
            ✦ YOUR MOMENT AWAITS ✦
          </motion.p>
          
          <motion.h2 
            className="text-6xl sm:text-7xl md:text-9xl font-black mb-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-gray-900">This is</span>
            <br />
            <motion.span 
              className="relative inline-block"
              style={{ color: GREEN }}
              animate={{ 
                textShadow: [
                  '0 0 40px rgba(45,80,22,0.2)',
                  '0 0 80px rgba(45,80,22,0.4)',
                  '0 0 40px rgba(45,80,22,0.2)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              YOUR
              <motion.span
                className="absolute -right-8 -top-4"
                animate={{ rotate: [0, 15, 0, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-8 h-8" style={{ color: GREEN }} />
              </motion.span>
            </motion.span>
            <span className="text-gray-900"> Stage</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-xl md:text-2xl max-w-2xl mx-auto mb-12"
          >
            Showcase your <span className="text-gray-900 font-semibold">talent</span>, compete for <span className="font-semibold" style={{ color: GREEN }}>glory</span>, and become a <span className="text-gray-900 font-semibold">star</span>
          </motion.p>
          
          {/* Prize reminder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-3 px-6 py-3 border-2 rounded-full mb-10 shadow-sm"
            style={{ borderColor: 'rgba(45,80,22,0.2)', backgroundColor: BG_CREAM }}
          >
            <Trophy className="w-5 h-5" style={{ color: GREEN }} />
            <span className="text-gray-500">Grand Prize:</span>
            <span className="font-bold text-lg" style={{ color: GREEN }}>₦500,000</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <MagneticButton 
              onClick={() => console.log('Register Now clicked')}
              className="group relative px-16 py-8 text-white font-black text-2xl rounded-full overflow-hidden shadow-xl"
              style={{ backgroundColor: GREEN }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              />
              {/* Pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-white/30"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="relative z-10 flex items-center gap-3">
                <Sparkles className="w-7 h-7" />
                Register Now
                <ArrowRight className="w-7 h-7 group-hover:translate-x-2 transition-transform" />
              </span>
            </MagneticButton>
          </motion.div>
        </div>
      </section>

      {/* ========== CONTACT SECTION ========== */}
      <section className="relative py-32 px-4 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[200px]" style={{ backgroundColor: 'rgba(45,80,22,0.05)' }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[150px]" style={{ backgroundColor: 'rgba(45,80,22,0.08)' }} />
        </div>
        
        <div className="max-w-5xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 border rounded-full mb-6"
              style={{ borderColor: GREEN, backgroundColor: 'rgba(45,80,22,0.05)' }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Phone className="w-4 h-4" style={{ color: GREEN }} />
              <span className="text-sm font-semibold" style={{ color: GREEN }}>GET IN TOUCH</span>
            </motion.div>
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black mb-4 text-gray-900">
              For <span style={{ color: GREEN }}>Inquiries</span>
            </h2>
            <p className="text-gray-500 text-lg">
              Have questions? Reach out to our team
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
            {contacts.map((contact, index) => (
              <motion.a
                key={contact.name}
                href={`tel:${contact.phone}`}
                initial={{ opacity: 0, y: 50, rotateX: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6, type: "spring" }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative border-2 rounded-3xl p-8 text-center transition-all overflow-hidden shadow-lg hover:shadow-xl"
                style={{ borderColor: 'rgba(45,80,22,0.2)', backgroundColor: BG_CREAM }}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500" style={{ background: 'linear-gradient(135deg, rgba(45,80,22,0.05), rgba(45,80,22,0.02))' }} />
                
                {/* Icon with animated ring */}
                <div className="relative mx-auto mb-6">
                  <motion.div 
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
                    style={{ backgroundColor: 'rgba(45,80,22,0.1)' }}
                    whileHover={{ rotate: 10 }}
                  >
                    <Phone className="w-8 h-8" style={{ color: GREEN }} />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 border-2 rounded-2xl"
                    style={{ borderColor: 'rgba(45,80,22,0.3)' }}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  />
                </div>
                
                <p className="font-black text-gray-900 text-2xl mb-2">{contact.name}</p>
                <p className="text-gray-500 group-hover:text-gray-900 transition-colors text-lg font-medium" style={{ '--hover-color': GREEN } as any}>{contact.phone}</p>
                
                {/* Tap to call hint */}
                <p className="text-gray-400 text-xs mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  Tap to call →
                </p>
              </motion.a>
            ))}
          </div>
          
          {/* WhatsApp CTA - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center"
          >
            <p className="text-gray-500 text-sm mb-6">Or chat with us directly</p>
            <MagneticButton
              onClick={() => window.open('https://wa.me/2349064151889', '_blank')}
              className="group relative inline-flex items-center gap-4 px-14 py-7 text-white font-bold text-xl rounded-full shadow-xl overflow-hidden"
              style={{ backgroundColor: GREEN }}
            >
              {/* Shimmer */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              />
              <MessageCircle className="w-8 h-8 relative z-10" />
              <span className="relative z-10">Chat on WhatsApp</span>
              <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform" />
            </MagneticButton>
          </motion.div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="relative py-24 px-4 overflow-hidden" style={{ backgroundColor: GREEN }}>
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-white/5 rounded-full blur-[200px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-white/5 rounded-full blur-[150px]" />
          
          {/* Animated grid lines */}
          <motion.div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
              backgroundSize: '100px 100px',
            }}
            animate={{ backgroundPosition: ['0px 0px', '100px 100px'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        
        <div className="max-w-6xl mx-auto relative">
          {/* Main footer content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            {/* Glowing Logo */}
            <motion.div
              className="inline-block mb-8"
              animate={{ 
                textShadow: [
                  '0 0 20px rgba(255,255,255,0.3)',
                  '0 0 60px rgba(255,255,255,0.5)',
                  '0 0 20px rgba(255,255,255,0.3)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <h3 className="text-6xl sm:text-7xl md:text-8xl font-black text-white">
                NGT<span className="text-white/80">10</span>
              </h3>
            </motion.div>
            
            <motion.p 
              className="text-xl text-white/80 mb-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              NUTESA GOT TALENT
            </motion.p>
            <motion.p 
              className="text-white/60 text-sm font-semibold tracking-[0.3em] mb-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              ✦ SEASON 10 ✦ TALENT STARDOM ✦
            </motion.p>
          </motion.div>

          {/* Organizer info with cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-16"
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/15 transition-colors">
              <p className="text-white/60 text-xs uppercase tracking-widest mb-2">Organized by</p>
              <p className="text-white font-bold text-lg">NUTESA</p>
              <p className="text-white/50 text-xs mt-1">Nigeria Universities Technology Education Students Association</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/15 transition-colors">
              <p className="text-white/60 text-xs uppercase tracking-widest mb-2">Production Team</p>
              <p className="text-white font-bold text-lg">TEAM RAISE</p>
              <p className="text-white/50 text-xs mt-1">From the Office of the DOS</p>
            </div>
          </motion.div>
          
          {/* Social Links - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col items-center mb-16"
          >
            <p className="text-white/50 text-sm mb-6">Follow us on social media</p>
            <div className="flex items-center gap-4">
              {[
                { Icon: Instagram, label: 'Instagram' },
                { Icon: Twitter, label: 'Twitter' },
                { Icon: Facebook, label: 'Facebook' },
              ].map(({ Icon, label }, index) => (
                <motion.a 
                  key={index}
                  href="#" 
                  className="group relative w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center text-white/60 transition-all duration-300 hover:bg-white hover:text-gray-900 hover:border-transparent hover:shadow-lg"
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-7 h-7" />
                  <span className="absolute -bottom-8 text-xs text-white/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    {label}
                  </span>
                </motion.a>
              ))}
            </div>
          </motion.div>
          
          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-8"
          />
          
          {/* Copyright and credits */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm"
          >
            <p className="text-white/50">
              © 2024 NUTESA Got Talent. All rights reserved.
            </p>
            <p className="text-white/50 flex items-center gap-2">
              Made with 
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Heart className="w-4 h-4 text-red-400 fill-red-400" />
              </motion.span>
              by Team Raise
            </p>
          </motion.div>
        </div>
      </footer>
    </main>
  );
}
