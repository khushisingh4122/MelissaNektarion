import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Award, BatteryCharging, Bug, ChevronDown, FileText, FlaskConical, Leaf, Mail, MapPinned, MessageCircle, Paperclip, Phone, PhoneCall, Plane, Radio, Search, Send, Sprout, Stethoscope, Users } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useTranslation } from '../i18n/useTranslation.jsx';
import { supportContacts } from '../data/sampleSupportContacts.js';
import { governmentSchemes } from '../data/sampleData.js';
import SchemeCard from '../components/SchemeCard.jsx';

const categories = [
  ['Drone Issues', 'Connection, battery, startup, flight problems', Plane, 'bg-blue-50 border-blue-100 text-blue-700'],
  ['Crop Issues', 'Crop health, disease, nutrition, recommendations', Leaf, 'bg-emerald-50 border-emerald-100 text-emerald-700'],
  ['Mission Help', 'Creating, starting, tracking, mission errors', Sprout, 'bg-violet-50 border-violet-100 text-violet-700'],
  ['Sensor Help', 'Sensor data, readings, calibration', Radio, 'bg-orange-50 border-orange-100 text-orange-700'],
];

const faqs = [
  ['How do I create a mission?', Sprout, 'Open Mission Planning, choose your field, set the route, and save the mission.'],
  ['Why isn’t my drone connecting?', Plane, 'Check that the drone is powered on, nearby, and has a stable connection.'],
  ['What does crop health score mean?', Leaf, 'The score summarizes the detected condition of your crop and highlights areas needing attention.'],
  ['How does pest detection work?', Bug, 'Upload a crop image in Pest Detection to receive the detected pest and recommended action.'],
  ['How can I view my sensor data?', Radio, 'Open Sensor Data to see the latest readings from your connected farm sensors.'],
  ['What should I do if the drone battery is low?', BatteryCharging, 'Land safely, replace or charge the battery, and only restart a mission when it is ready.'],
];

const helpDeskGroups = [
  { title: 'Disease specialists', category: 'Pest Control Experts', icon: Stethoscope, tone: 'bg-rose-50 border-rose-100 text-rose-700' },
  { title: 'Fertilizer suppliers', category: 'Fertilizer Suppliers', icon: FlaskConical, tone: 'bg-amber-50 border-amber-100 text-amber-700' },
  { title: 'Agriculture officers', category: 'Local Agriculture Officers', icon: MapPinned, tone: 'bg-sky-50 border-sky-100 text-sky-700' },
];

export default function FarmerSupportPage() {
  const { t } = useTranslation();
  const [question, setQuestion] = useState('');
  const [problemType, setProblemType] = useState('');
  const [description, setDescription] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [directoryMode, setDirectoryMode] = useState('schemes');
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryCategory, setDirectoryCategory] = useState('all');

  const specialistCategories = ['all', ...new Set(supportContacts.map((contact) => contact.category))];
  const directorySchemes = governmentSchemes.filter((scheme) => {
    const term = directorySearch.toLowerCase();
    return (scheme.name.toLowerCase().includes(term) || scheme.description.toLowerCase().includes(term))
      && (directoryCategory === 'all' || scheme.type === directoryCategory);
  });
  const directorySpecialists = supportContacts.filter((contact) => {
    const term = directorySearch.toLowerCase();
    return (contact.name.toLowerCase().includes(term) || contact.specialization.toLowerCase().includes(term) || contact.category.toLowerCase().includes(term))
      && (directoryCategory === 'all' || contact.category === directoryCategory);
  }).sort((first, second) => first.distance - second.distance);
  const directoryCategories = directoryMode === 'schemes'
    ? ['all', ...new Set(governmentSchemes.map((scheme) => scheme.type))]
    : specialistCategories;

  const submitReport = (event) => {
    event.preventDefault();
    if (!problemType || !description.trim()) {
      toast.error('Choose a problem type and describe the issue.');
      return;
    }
    toast.success('Your problem report has been submitted.');
    setProblemType('');
    setDescription('');
  };

  return (
    <DashboardLayout>
      <Helmet><title>{`${t('nav.support')} - ${t('app.title')}`}</title></Helmet>
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="relative h-40 overflow-hidden rounded-2xl bg-cover bg-center" style={{ backgroundImage: "linear-gradient(90deg, rgba(246,252,247,.96) 0%, rgba(246,252,247,.72) 48%, rgba(246,252,247,.12) 100%), url('/ai-images/IMG_0044.jpg')" }}>
          <div className="relative z-10 flex h-full flex-col justify-center px-6 sm:px-8">
            <div className="flex items-center gap-3"><div className="rounded-full bg-emerald-100 p-3 text-emerald-700"><MessageCircle className="h-6 w-6" /></div><div><h1 className="text-2xl font-bold text-emerald-950 sm:text-3xl">Farmer Support</h1><p className="text-sm text-emerald-900/70">Get help, find answers, and resolve issues quickly.</p></div></div>
            <p className="absolute right-8 top-8 hidden max-w-[150px] rotate-[-3deg] text-right text-sm font-semibold italic text-emerald-900 sm:block">We&apos;re here to help<br />you grow! <Leaf className="ml-auto mt-1 h-4 w-4" /></p>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-emerald-100 bg-white/90 p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Farmer resource directory</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">Find schemes and people who can help</h2>
              <p className="mt-1 text-sm text-slate-500">Search official support programs, disease experts, fertilizer suppliers, and local agriculture officers.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:min-w-[300px]">
              <button type="button" onClick={() => { setDirectoryMode('schemes'); setDirectoryCategory('all'); }} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition ${directoryMode === 'schemes' ? 'border-emerald-700 bg-emerald-700 text-white shadow-sm' : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}`}><FileText className="h-4 w-4 shrink-0" /><span>Find a scheme</span></button>
              <button type="button" onClick={() => { setDirectoryMode('specialists'); setDirectoryCategory('all'); }} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition ${directoryMode === 'specialists' ? 'border-emerald-700 bg-emerald-700 text-white shadow-sm' : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}`}><PhoneCall className="h-4 w-4 shrink-0" /><span>Get help numbers</span></button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [governmentSchemes.length, 'Government schemes', FileText],
              [supportContacts.length, 'Nearby specialists', Users],
              [supportContacts.filter((contact) => contact.category === 'Fertilizer Suppliers').length, 'Fertilizer suppliers', FlaskConical],
              [supportContacts.filter((contact) => contact.category === 'Pest Control Experts').length, 'Disease & pest experts', Stethoscope],
            ].map(([count, label, Icon]) => <div key={label} className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3"><Icon className="h-5 w-5 text-emerald-700" /><div><p className="text-xl font-bold text-emerald-950">{count}</p><p className="text-[11px] text-emerald-800/70">{label}</p></div></div>)}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={directorySearch} onChange={(event) => setDirectorySearch(event.target.value)} placeholder={directoryMode === 'schemes' ? 'Search schemes, benefits, or eligibility...' : 'Search names, expertise, or categories...'} className="h-11 bg-slate-50 pl-10" /></div>
            <Select value={directoryCategory} onValueChange={setDirectoryCategory}><SelectTrigger className="h-11 w-full sm:w-64"><SelectValue placeholder="Filter directory" /></SelectTrigger><SelectContent>{directoryCategories.map((category) => <SelectItem key={category} value={category}>{category === 'all' ? 'All categories' : category}</SelectItem>)}</SelectContent></Select>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800"><span className="h-2 w-2 rounded-full bg-emerald-600" />{directoryMode === 'schemes' ? 'Government schemes' : 'Specialist help numbers'}</div>
          {directoryMode === 'schemes' ? (
            directorySchemes.length ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{directorySchemes.map((scheme) => <SchemeCard key={scheme.id} scheme={scheme} />)}</div> : <p className="py-8 text-center text-sm text-slate-500">No schemes match your search.</p>
          ) : (
            directorySpecialists.length ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{directorySpecialists.map((contact) => <Card key={contact.id} className="border-slate-200"><CardContent className="space-y-4 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-slate-900">{contact.name}</h3><p className="mt-1 text-xs text-emerald-700">{contact.category}</p></div><span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700"><Award className="h-3 w-3" />{contact.rating}</span></div><div className="space-y-2 text-xs text-slate-500"><p>{contact.specialization} · {contact.experience}</p><p className="flex items-center gap-1"><MapPinned className="h-3.5 w-3.5" />{contact.location} · {contact.distance} km away</p><p>{contact.reviews} farmer reviews</p></div><div className="flex gap-2 border-t pt-3"><Button asChild className="flex-1 gap-2 bg-emerald-700 hover:bg-emerald-800"><a href={`tel:${contact.phone}`}><PhoneCall className="h-4 w-4" />Call</a></Button><Button asChild variant="outline" className="gap-2"><a href={`tel:${contact.phone}`} aria-label={`Contact ${contact.name}`}><Phone className="h-4 w-4" /></a></Button></div></CardContent></Card>)}</div> : <p className="py-8 text-center text-sm text-slate-500">No specialists match your search.</p>
          )}
        </section>

        <div className="grid gap-5 lg:grid-cols-[1.45fr_0.8fr]">
          <main className="space-y-5">
            <div className="flex gap-2"><div className="relative flex-1"><MessageCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Search your question... e.g. Why isn’t my drone connecting?" className="h-11 bg-white pl-10" /></div><Button asChild className="h-11 bg-emerald-700 hover:bg-emerald-800"><Link to="/ai-chatbot" state={{ question }}>Search</Link></Button></div>
            <div><h2 className="text-sm font-bold text-slate-800">Quick Help Categories</h2><p className="text-xs text-slate-500">Choose a topic to get instant support</p></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{categories.map(([title, text, Icon, colors]) => <button type="button" key={title} className={`rounded-lg border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${colors}`} onClick={() => setQuestion(title)}><Icon className="mb-3 h-6 w-6" /><h3 className="text-sm font-bold text-slate-800">{title}</h3><p className="mt-1 text-xs text-slate-600">{text}</p><ArrowRight className="ml-auto mt-3 h-4 w-4" /></button>)}</div>
            <Card className="border-slate-200"><CardContent className="p-4"><h2 className="text-sm font-bold text-slate-800">Frequently Asked Questions</h2><p className="mb-3 text-xs text-slate-500">Find answers to common questions</p><div className="space-y-2">{faqs.map(([text, Icon, answer], index) => <div className="overflow-hidden rounded-lg border border-slate-200" key={text}><button type="button" className="flex w-full items-center gap-3 p-3 text-left text-xs font-medium text-slate-700 hover:bg-slate-50" onClick={() => setOpenFaq(openFaq === index ? null : index)}><Icon className="h-4 w-4 text-emerald-700" /><span className="flex-1">{text}</span><ChevronDown className={`h-4 w-4 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} /></button>{openFaq === index && <p className="px-10 pb-3 text-xs text-slate-500">{answer}</p>}</div>)}</div></CardContent></Card>
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4"><div className="flex items-center gap-3"><MessageCircle className="h-6 w-6 text-emerald-700" /><div><p className="text-sm font-semibold text-emerald-950">Need more help?</p><p className="text-xs text-emerald-900/60">Ask our AI assistant for personalized support.</p></div></div><Button asChild size="sm" className="bg-emerald-700 hover:bg-emerald-800"><Link to="/ai-chatbot">Chat with AI <ArrowRight className="ml-1 h-3 w-3" /></Link></Button></div>

            <Card className="border-emerald-100 bg-[#f5f7f1]"><CardContent className="p-4"><div className="mb-4"><h2 className="text-sm font-bold text-slate-800">Agri Help Desk</h2><p className="text-xs text-slate-500">Find fertilizer, disease, and field specialists.</p></div><div className="grid gap-3 md:grid-cols-3">{helpDeskGroups.map(({ title, category, icon: Icon, tone }) => { const contact = supportContacts.find((item) => item.category === category); return <div key={category} className={`rounded-xl border p-4 ${tone}`}><Icon className="h-5 w-5" /><p className="mt-3 text-sm font-bold text-slate-800">{title}</p><p className="mt-1 text-xs text-slate-600">{contact?.specialization}</p><p className="mt-3 text-xs font-semibold text-slate-700">{contact?.name}</p><p className="text-[11px] text-slate-500">{contact?.location}</p>{contact && <a href={`tel:${contact.phone}`} className="mt-3 flex items-center gap-1 text-xs font-semibold text-emerald-700"><PhoneCall className="h-3 w-3" />{contact.phone}</a>}</div>; })}</div></CardContent></Card>
          </main>

          <aside className="space-y-5">
            <Card className="border-emerald-100 bg-emerald-50/70"><CardContent className="p-5"><div className="flex items-center gap-3"><MessageCircle className="h-5 w-5 text-emerald-700" /><h2 className="text-sm font-bold text-emerald-950">Chat with AI Assistant</h2></div><p className="mt-2 text-xs text-slate-600">Get instant answers to your questions about drones, crops, missions and more.</p><Button asChild className="mt-4 w-full bg-emerald-700 hover:bg-emerald-800"><Link to="/ai-chatbot">Open AI Chat <ArrowRight className="ml-1 h-3 w-3" /></Link></Button></CardContent></Card>
            <Card><CardContent className="space-y-3 p-5"><h2 className="text-sm font-bold text-slate-800">Contact Support</h2><p className="text-xs text-slate-500">Our team is here to help you.</p><a className="flex items-center gap-2 text-xs font-medium text-emerald-700" href="mailto:support@melissanektarion.com"><Mail className="h-4 w-4" /> support@melissanektarion.com</a><div className="flex items-center gap-2 text-xs text-slate-500"><Phone className="h-4 w-4" /> +91 98765 43210</div><p className="text-[10px] text-slate-400">Mon - Fri, 9:00 AM - 6:00 PM</p></CardContent></Card>
            <Card><CardContent className="p-5"><h2 className="flex items-center gap-2 text-sm font-bold text-slate-800"><AlertTriangle className="h-5 w-5 text-emerald-700" /> Report a Problem</h2><p className="mt-1 text-xs text-slate-500">Describe the issue you&apos;re facing and we&apos;ll help you resolve it.</p><form onSubmit={submitReport} className="mt-4 space-y-3"><div className="space-y-1"><Label className="text-xs">Problem Type</Label><Select value={problemType} onValueChange={setProblemType}><SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select issue type" /></SelectTrigger><SelectContent><SelectItem value="drone">Drone issue</SelectItem><SelectItem value="mission">Mission issue</SelectItem><SelectItem value="sensor">Sensor data issue</SelectItem><SelectItem value="analysis">Analysis result issue</SelectItem><SelectItem value="other">Other issue</SelectItem></SelectContent></Select></div><div className="space-y-1"><Label htmlFor="description" className="text-xs">Description</Label><Textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Please describe your problem in detail..." rows={4} maxLength={500} className="text-xs" /><p className="text-right text-[10px] text-slate-400">{description.length}/500</p></div><Button type="button" variant="outline" className="h-9 w-full justify-start gap-2 text-xs"><Paperclip className="h-3 w-3" /> Attach Screenshot (Optional)</Button><Button type="submit" className="h-10 w-full gap-2 bg-emerald-700 hover:bg-emerald-800"><Send className="h-3 w-3" /> Submit</Button></form></CardContent></Card>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
