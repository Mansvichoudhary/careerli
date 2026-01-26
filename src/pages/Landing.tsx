import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Code2, Users, Lightbulb, MessageSquare, Sparkles, CheckCircle2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import UserAvatar from '@/components/Avatar';

const features = [
  {
    icon: Code2,
    title: 'Share Code Snippets',
    description: 'Post and run code directly in the feed. Get instant feedback from peers and mentors.'
  },
  {
    icon: Lightbulb,
    title: 'Work-in-Progress Welcome',
    description: 'Share unfinished projects without judgment. The journey matters as much as the destination.'
  },
  {
    icon: Users,
    title: 'Real Collaboration',
    description: 'Connect with students and mentors. Build together, learn together, grow together.'
  },
  {
    icon: MessageSquare,
    title: 'Discord-like Chat',
    description: 'Real-time channels for every topic. Get help, share ideas, and stay connected.'
  }
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'CS Student @ IIT Delhi',
    content: 'Finally a platform where I can share my buggy code without feeling embarrassed. Got amazing help debugging my first ML project!',
    avatar: 'PS'
  },
  {
    name: 'Mansvi Choudhary',
    role: 'Mentor, Full Stack Developer',
    content: 'As a mentor, I love seeing students\' thought processes. It helps me give better guidance than just reviewing polished portfolios.',
    avatar: 'MC'
  },
  {
    name: 'Arjun Patel',
    role: 'ECE Student @ NIT Trichy',
    content: 'The code snippet feature is incredible. I can share my Arduino sketches and people can actually run and test them!',
    avatar: 'AP'
  }
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo />
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Community</a>
              <a href="#cta" className="text-muted-foreground hover:text-foreground transition-colors">Get Started</a>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-soft text-primary text-sm font-medium mb-8"
            >
              <Sparkles className="h-4 w-4" />
              The Workshop, Not the Showroom
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight"
            >
              Build Your Portfolio
              <br />
              <span className="gradient-text">Without the Pressure</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              A community for engineering and CS students to share work-in-progress projects, 
              ask questions openly, and build real portfolios together.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button size="lg" className="gap-2 text-lg px-8" asChild>
                <Link to="/signup">
                  Start Your Journey
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </motion.div>
            
            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 flex items-center justify-center gap-4"
            >
              <div className="flex -space-x-3">
                <UserAvatar name="Ritik S" size="md" />
                <UserAvatar name="Khushi K" size="md" />
                <UserAvatar name="Mansvi C" size="md" />
                <UserAvatar name="Arjun P" size="md" />
              </div>
              <p className="text-muted-foreground">
                Join students building and learning together
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Grow
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete platform designed for real learning and collaboration, not just showing off.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl border border-border p-6 card-hover"
              >
                <div className="w-12 h-12 rounded-lg bg-primary-soft flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              How Career Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Three simple steps to start your journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Your Profile', desc: 'Sign up as a student or mentor. Customize your profile with skills and interests.' },
              { step: '02', title: 'Share Your Work', desc: 'Post projects, code snippets, and questions. No need to be perfect.' },
              { step: '03', title: 'Grow Together', desc: 'Get feedback, collaborate with others, and build your living portfolio.' }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              What Our Community Says
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl border border-border p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <UserAvatar name={testimonial.name} size="md" />
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary to-indigo-600 rounded-2xl p-12 text-center text-white"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Start Building?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of students and mentors who are learning, building, and growing together.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="secondary" className="gap-2 text-lg px-8 bg-white text-primary hover:bg-white/90" asChild>
                <Link to="/signup">
                  Create Free Account
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-white/70">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Free forever
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                No credit card required
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo />
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <span>© 2024 Career Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
