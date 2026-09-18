import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, BatteryCharging, Bug, ChevronDown, Leaf, Mail, MessageCircle, Paperclip, Phone, Plane, Radio, Send, Sprout } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useTranslation } from '../i18n/useTranslation.jsx';

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

export default function FarmerSupportPage() {
  const { t } = useTranslation();
  const [question, setQuestion] = useState('');
  const [problemType, setProblemType] = useState('');
  const [description, setDescription] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

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

        <div className="grid gap-5 lg:grid-cols-[1.45fr_0.8fr]">
          <main className="space-y-5">
            <div className="flex gap-2"><div className="relative flex-1"><MessageCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Search your question... e.g. Why isn’t my drone connecting?" className="h-11 bg-white pl-10" /></div><Button asChild className="h-11 bg-emerald-700 hover:bg-emerald-800"><Link to="/ai-chatbot" state={{ question }}>Search</Link></Button></div>
            <div><h2 className="text-sm font-bold text-slate-800">Quick Help Categories</h2><p className="text-xs text-slate-500">Choose a topic to get instant support</p></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{categories.map(([title, text, Icon, colors]) => <button type="button" key={title} className={`rounded-lg border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${colors}`} onClick={() => setQuestion(title)}><Icon className="mb-3 h-6 w-6" /><h3 className="text-sm font-bold text-slate-800">{title}</h3><p className="mt-1 text-xs text-slate-600">{text}</p><ArrowRight className="ml-auto mt-3 h-4 w-4" /></button>)}</div>
            <Card className="border-slate-200"><CardContent className="p-4"><h2 className="text-sm font-bold text-slate-800">Frequently Asked Questions</h2><p className="mb-3 text-xs text-slate-500">Find answers to common questions</p><div className="space-y-2">{faqs.map(([text, Icon, answer], index) => <div className="overflow-hidden rounded-lg border border-slate-200" key={text}><button type="button" className="flex w-full items-center gap-3 p-3 text-left text-xs font-medium text-slate-700 hover:bg-slate-50" onClick={() => setOpenFaq(openFaq === index ? null : index)}><Icon className="h-4 w-4 text-emerald-700" /><span className="flex-1">{text}</span><ChevronDown className={`h-4 w-4 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} /></button>{openFaq === index && <p className="px-10 pb-3 text-xs text-slate-500">{answer}</p>}</div>)}</div></CardContent></Card>
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4"><div className="flex items-center gap-3"><MessageCircle className="h-6 w-6 text-emerald-700" /><div><p className="text-sm font-semibold text-emerald-950">Need more help?</p><p className="text-xs text-emerald-900/60">Ask our AI assistant for personalized support.</p></div></div><Button asChild size="sm" className="bg-emerald-700 hover:bg-emerald-800"><Link to="/ai-chatbot">Chat with AI <ArrowRight className="ml-1 h-3 w-3" /></Link></Button></div>
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
