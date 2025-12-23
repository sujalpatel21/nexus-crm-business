import { Header } from '@/components/layout/Header';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  HelpCircle, 
  MessageSquare, 
  Book, 
  Video, 
  Mail,
  ExternalLink,
  Search,
} from 'lucide-react';

const faqs = [
  {
    question: 'How do I create a new lead?',
    answer: 'Navigate to Lead Management from the sidebar, then click the "Add Lead" button in the top right corner. Fill in the required information and click "Create Lead".'
  },
  {
    question: 'How do I assign a task to a team member?',
    answer: 'Go to Task Management, create a new task or edit an existing one. In the task form, you can select an assignee from the dropdown list of team members.'
  },
  {
    question: 'Can I link tasks to specific projects?',
    answer: 'Yes! When creating or editing a task, you can link it to a project by selecting from the "Project" dropdown. This helps organize tasks by project.'
  },
  {
    question: 'How do I track project progress?',
    answer: 'In Project Management, click on any project card to open its details. Use the progress slider to update the completion percentage. Changes are saved automatically.'
  },
  {
    question: 'How do I use the calendar?',
    answer: 'Click on any date in the calendar to create a new event. You can also click on existing events to edit them. Events can be linked to projects for better organization.'
  },
  {
    question: 'How do I send messages?',
    answer: 'Go to Messages, select who you want to send as, optionally select a project context, type your message, and press Enter or click Send.'
  },
];

const resources = [
  { icon: Book, title: 'Documentation', description: 'Comprehensive guides and tutorials', url: '#' },
  { icon: Video, title: 'Video Tutorials', description: 'Step-by-step video walkthroughs', url: '#' },
  { icon: MessageSquare, title: 'Community Forum', description: 'Connect with other users', url: '#' },
];

export default function Help() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: '',
  });

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'Message sent!', description: 'We\'ll get back to you soon.' });
    setContactForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen">
      <Header 
        title="Help & Support" 
        subtitle="Get help with using the application"
      />
      
      <div className="p-6 max-w-5xl space-y-8">
        {/* Search */}
        <div className="glass-card p-8 text-center animate-fade-in-up">
          <HelpCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h2 className="font-display text-2xl font-bold mb-2">How can we help you?</h2>
          <p className="text-muted-foreground mb-6">Search our knowledge base or browse FAQs below</p>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-border h-12"
            />
          </div>
        </div>

        {/* Resources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resources.map((resource, index) => (
            <a
              key={resource.title}
              href={resource.url}
              className="glass-card p-6 hover:scale-[1.02] transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-neon/20 flex items-center justify-center mb-4">
                <resource.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold mb-1">{resource.title}</h3>
              <p className="text-sm text-muted-foreground">{resource.description}</p>
              <div className="flex items-center gap-1 mt-3 text-primary text-sm">
                Learn more <ExternalLink className="w-3 h-3" />
              </div>
            </a>
          ))}
        </div>

        {/* FAQs */}
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <h3 className="font-display font-semibold text-lg mb-4">Frequently Asked Questions</h3>
          <Accordion type="single" collapsible className="w-full">
            {filteredFaqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border">
                <AccordionTrigger className="text-left hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {filteredFaqs.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No matching questions found. Try a different search term.
            </p>
          )}
        </div>

        {/* Contact Form */}
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-neon/20 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg">Contact Support</h3>
              <p className="text-sm text-muted-foreground">Can't find what you're looking for? Send us a message.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Your Name</Label>
                <Input
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="bg-muted/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="bg-muted/50"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                className="bg-muted/50 min-h-[120px]"
                required
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="bg-gradient-neon text-primary-foreground hover:opacity-90">
                Send Message
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
