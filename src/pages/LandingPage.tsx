import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  TrendingUp, 
  Camera, 
  Brain, 
  Map, 
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Activity,
  Users,
  Target,
  Zap,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const features = [
  {
    icon: <Camera className="w-6 h-6" />,
    title: 'AI-Powered Vision',
    description: 'Real-time vehicle detection and traffic density analysis using computer vision',
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: 'Predictive Intelligence',
    description: 'Machine learning models predict accident-prone zones before incidents occur',
  },
  {
    icon: <Map className="w-6 h-6" />,
    title: 'Dynamic Risk Mapping',
    description: 'Interactive heatmaps showing real-time and historical risk patterns',
  },
  {
    icon: <AlertTriangle className="w-6 h-6" />,
    title: 'Smart Alerts',
    description: 'Proactive notifications for high-risk situations and anomalies',
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: 'Enforcement Optimization',
    description: 'AI-driven recommendations for optimal patrol and camera placement',
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Impact Analytics',
    description: 'Before-and-after analysis to measure intervention effectiveness',
  },
];

const stats = [
  { value: '94.2%', label: 'Prediction Accuracy' },
  { value: '127', label: 'Accidents Prevented' },
  { value: '48', label: 'Active Cameras' },
  { value: '312', label: 'Lives Protected' },
];

const principles = [
  'No automated fines or penalties',
  'No facial recognition technology',
  'Human-in-the-loop decision making',
  'Transparent and explainable AI',
];

export function LandingPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-hero-pattern" />
        <div className="absolute inset-0 grid-pattern opacity-20" />
        
        {/* Animated circles */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-primary/10 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm border-primary/30 bg-primary/5">
              <Sparkles className="w-4 h-4 mr-2 text-primary" />
              AI-Powered Traffic Safety Platform
            </Badge>
          </motion.div>
          
          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-5xl md:text-7xl font-bold mb-6"
          >
            <span className="text-foreground">Transform Traffic Safety</span>
            <br />
            <span className="text-gradient">From Reactive to Predictive</span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10"
          >
            TRAFIQ.AI combines computer vision, historical analytics, and predictive AI 
            to identify accident-prone zones before incidents occur — enabling smarter, 
            ethical, and more effective road safety management.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <Button 
              variant="hero" 
              size="xl" 
              onClick={() => navigate('/dashboard')}
            >
              Launch Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="glass" size="xl">
              Watch Demo
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </motion.div>
          
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="glass-panel p-4"
              >
                <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>
      
      {/* Features Section */}
      <section className="py-24 px-6 bg-gradient-dark">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4">
              <Zap className="w-4 h-4 mr-2" />
              Capabilities
            </Badge>
            <h2 className="font-display text-4xl font-bold mb-4">
              Intelligent Traffic Safety
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform combines cutting-edge AI with human oversight to create 
              a responsible, effective approach to traffic safety management.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-panel-hover p-6 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Ethics Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="online" className="mb-4">
                <Shield className="w-4 h-4 mr-2" />
                Ethical AI
              </Badge>
              <h2 className="font-display text-4xl font-bold mb-4">
                Human-Centered Design
              </h2>
              <p className="text-muted-foreground mb-8">
                TRAFIQ.AI is designed to assist authorities, not replace them. 
                We believe in transparent, accountable AI that enhances human 
                decision-making without compromising privacy or civil liberties.
              </p>
              <div className="space-y-4">
                {principles.map((principle, index) => (
                  <motion.div
                    key={principle}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-foreground">{principle}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-panel p-8"
            >
              <div className="aspect-video bg-secondary/50 rounded-xl flex items-center justify-center mb-6 overflow-hidden relative">
                {/* Animated visualization */}
                <div className="grid-pattern absolute inset-0 opacity-30" />
                <motion.div
                  className="absolute"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Shield className="w-24 h-24 text-primary/30" />
                </motion.div>
                <Activity className="w-16 h-16 text-primary z-10" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">
                Authority-Assisting, Not Replacing
              </h3>
              <p className="text-muted-foreground text-sm">
                Our AI provides insights and recommendations while keeping humans 
                in control of all enforcement decisions. No automated penalties, 
                ever.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform
            <br />
            <span className="text-gradient">Traffic Safety?</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Experience the future of intelligent traffic management. 
            Explore our live demo and see predictive safety in action.
          </p>
          <Button 
            variant="hero" 
            size="xl" 
            onClick={() => navigate('/dashboard')}
          >
            Enter Command Center
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">
              TRAFIQ<span className="text-primary">.AI</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 TRAFIQ.AI — Smart Traffic Risk Prediction Platform
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
