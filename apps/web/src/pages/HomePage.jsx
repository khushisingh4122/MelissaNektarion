import React from 'react';
import { useNavigate } from 'react-router-dom';
import droneImage from '../../drone.png';
import precisionImage from '../../Agricultura de Precisão_ tecnologia e o futuro da agricultura.png';
import pestImage from '../../Crop Pest Detection AI_ Protecting Your Farm and Increasing Productivity.png';
import greenImage from '../../Green 🌱🌲🌳🌴🌿🍀🍃☘️.jfif';
import {
  ArrowRight,
  BarChart3,
  Bot,
  Droplets,
  Leaf,
  Map,
  Menu,
  ShieldCheck,
  Sprout,
  Tractor,
  Users,
  Zap,
} from 'lucide-react';

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'About Us', href: '#about' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Contact', href: '#contact' },
];

const features = [
  {
    icon: Map,
    title: 'Crop Management',
    description: 'Plan, monitor, and manage every field with intelligent crop insights and live updates.',
    image: precisionImage,
  },
  {
    icon: Droplets,
    title: 'Irrigation Control',
    description: 'Automate watering based on moisture and weather forecasts to reduce waste and improve yield.',
    image: greenImage,
  },
  {
    icon: Sprout,
    title: 'Fertilizer & Soil Care',
    description: 'Optimize soil nutrition and nutrient timing for healthier plants and stronger crop output.',
    image: precisionImage,
  },
  {
    icon: BarChart3,
    title: 'Pest Detection',
    description: 'Identify pests early with AI-powered crop scanning and timely field alerts.',
    image: pestImage,
  },
];

const stats = [
  ['25K+', 'Happy Farmers'],
  ['1.2M+', 'Acres Monitored'],
  ['30%', 'Average Yield Increase'],
  ['40%', 'Water Saved'],
];

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f4f7f1] text-slate-900">
      <main className="mx-auto max-w-[1600px] px-0 pb-20 pt-0">
        <section className="relative isolate min-h-[760px] overflow-hidden border-b border-[#dfe9de] bg-[#edf5ee]">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(7,30,18,0.28) 0%, rgba(7,30,18,0.08) 42%, rgba(7,30,18,0.42) 100%), url('${droneImage}')`,
              backgroundPosition: 'center center',
              backgroundSize: 'cover',
              filter: 'saturate(1.16) contrast(1.08)',
            }}
          />

          <div className="absolute left-10 top-14 h-52 w-52 rounded-full bg-emerald-200/25 blur-[90px]" />
          <div className="absolute bottom-20 right-16 h-44 w-44 rounded-full bg-lime-200/20 blur-[80px]" />

          <div className="relative z-10 w-full px-0 pt-2 sm:px-1 lg:px-2">
            <nav className="flex min-h-12 items-center justify-between gap-4 px-0 py-2 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1f5d3d]/90 text-white shadow-sm">
                  <Leaf className="h-4 w-4" />
                </div>
                <div className="leading-none">
                  <p className="text-base font-bold tracking-[-0.02em] text-white drop-shadow-sm">Mellisanectorian</p>
                  <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.12em] text-white/75">Grow Better. Live Better.</p>
                </div>
              </div>

              <div className="hidden items-center gap-6 md:flex">
                {navItems.map((item) => (
                  <a key={item.label} href={item.href} className="text-[13px] font-medium text-white/90 transition hover:text-white">
                    {item.label}
                  </a>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="hidden items-center gap-1.5 rounded-full bg-[#1f5d3d] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-900/15 transition hover:bg-[#184a31] md:inline-flex"
                >
                  Get Started
                  <ArrowRight className="h-3 w-3" />
                </button>
                <button className="inline-flex rounded-full border border-white/45 bg-black/10 p-2 md:hidden" aria-label="Menu">
                  <Menu className="h-4 w-4 text-white" />
                </button>
              </div>
            </nav>

            <div className="relative flex min-h-[640px] items-center justify-center pb-10 pt-10 text-center lg:pb-14 lg:pt-14">
              <div className="mx-auto max-w-[620px] translate-y-8 space-y-4 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-black/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                  <Leaf className="h-3.5 w-3.5" />
                  Smart Farming Platform
                </div>

                <h1 className="mx-auto max-w-[620px] text-[1.85rem] font-bold leading-[1.05] tracking-[-0.04em] sm:text-[2.6rem] lg:text-[3.35rem]">
                  The Future of Farming
                  <span className="block text-[#d9f3c7]">Takes Flight.</span>
                </h1>

                <p className="mx-auto max-w-[500px] text-xs leading-5 text-white/90 sm:text-sm">
                  Smarter fields, healthier crops, and better decisions powered by drones, AI, and real-time farm intelligence.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4">
                  <button
                    onClick={() => navigate('/login')}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#1f5d3d] shadow-lg shadow-black/10 transition hover:bg-emerald-50"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <a
                    href="#solutions"
                    className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-black/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    Explore Solutions
                  </a>
                </div>
              </div>

            </div>
          </div>
        </section>

        <section id="solutions" className="mt-16 bg-[#f2f3ed] px-4 py-14 text-center sm:px-8 lg:px-12">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#718446]">What we’re offering</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-[#183d2d] sm:text-4xl">Tools for better harvests</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Practical technology for healthier fields, stronger crops, and more confident decisions.
          </p>

          <div className="mx-auto mt-9 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description, image }) => (
              <article key={title} className="overflow-hidden bg-white text-left shadow-[0_12px_30px_rgba(24,61,45,0.08)] transition hover:-translate-y-1">
                <div className="relative h-36 overflow-hidden">
                  <img src={image} alt="" className="h-full w-full object-cover transition duration-500 hover:scale-105" />
                  <div className="absolute inset-0 bg-[#183d2d]/20" />
                  <div className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#183d2d]">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-[#183d2d]">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{description}</p>
                  <a href="#contact" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#718446]">
                    Learn more <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 bg-[#123d2b] px-5 py-8 text-white sm:px-8 lg:px-10">
          <div className="grid gap-6 md:grid-cols-4">
            {stats.map(([value, label]) => (
              <div key={label} className="border-r border-emerald-700/60 px-4 py-5 text-center last:border-r-0">
                <p className="text-3xl font-black text-white">{value}</p>
                <p className="mt-1 text-sm text-emerald-100/80">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="mt-20 bg-[#e6eadc] px-4 py-14 sm:px-8 lg:px-12">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-[340px] overflow-hidden bg-[#183d2d] shadow-[0_18px_40px_rgba(24,61,45,0.15)]">
              <img src={greenImage} alt="Green agricultural landscape" className="absolute inset-0 h-full w-full object-cover opacity-85" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#102c20]/90 via-[#183d2d]/10 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <p className="text-xs uppercase tracking-[0.2em] text-[#c8df9d]">Our vision</p>
                <p className="mt-2 max-w-xs text-2xl font-bold text-white">Healthier crops. Sustainable futures.</p>
              </div>
            </div>

            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#718446]">About Mellisanectorian</p>
              <h3 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.04em] text-[#183d2d] sm:text-4xl">
                Technology that works with nature.
              </h3>
              <p className="mt-5 text-base leading-7 text-slate-700">
                We connect drones, AI, pollination intelligence, and live field data in one calm, clear platform made for modern farmers.
              </p>
              <div className="mt-7 grid grid-cols-2 gap-3 text-sm font-semibold text-[#183d2d] sm:grid-cols-3">
                <span className="border-l-2 border-[#718446] pl-3">Drone intelligence</span>
                <span className="border-l-2 border-[#718446] pl-3">Crop health</span>
                <span className="border-l-2 border-[#718446] pl-3">Smart decisions</span>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="mt-20 bg-[#183d2d] px-5 py-12 text-white sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#c8df9d]">Contact</p>
              <h2 className="mt-3 max-w-md text-3xl font-bold tracking-[-0.04em]">Let’s grow something better together.</h2>
            </div>

            <div className="flex flex-col gap-2 text-sm text-white/75 md:items-end">
              <a href="mailto:hello@agriconnect.in" className="transition hover:text-white">hello@agriconnect.in</a>
              <a href="tel:+919000012345" className="transition hover:text-white">+91 90000 12345</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;