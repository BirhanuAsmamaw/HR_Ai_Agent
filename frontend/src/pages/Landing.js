import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BriefcaseIcon,
  
  SparklesIcon,
  
  CheckCircleIcon,
  ArrowRightIcon,
 
  StarIcon,
  
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CalendarIcon, InboxIcon } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  // const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handleLogin = () => {
    // Navigate to auth page for login/register
    navigate('/auth');
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: InboxIcon,
      title: 'Automated Email Parsing',
      description: 'Fetches incoming applicant emails, extracts details automatically, and stores them instantly.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: SparklesIcon,
      title: 'AI Resume Screening',
      description: 'Uses AI to analyze resumes, match them with job listings, and generate shortlist or rejection verdicts.',
      color: 'from-purple-500 to-pink-500'
    },
    // {
    //   icon: BriefcaseIcon,
    //   title: 'Smart Job Linking',
    //   description: 'Automatically attaches applicants to their relevant job listings and organizes your hiring pipeline.',
    //   color: 'from-amber-500 to-orange-500'
    // },
    {
      icon: CalendarIcon,
      title: 'Automated Interview Scheduling',
      description: 'Generates interview slots based on HR availability and assigns them to shortlisted candidates.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: EnvelopeIcon,
      title: 'Mass Email Communication',
      description: 'Send interview invitations, acceptance letters, or rejections to all or selected candidates.',
      color: 'from-red-500 to-rose-500'
    },
    // {
    //   icon: ChartBarIcon,
    //   title: 'HR Dashboard & Analytics',
    //   description: 'View applicant counts, shortlist rates, job performance, and process insights in real time.',
    //   color: 'from-indigo-500 to-violet-500'
    // }
  ];
  

  const benefits = [
    'Reduce time-to-hire by 60%',
    'Improve candidate quality with AI screening',
    'Automate repetitive HR tasks',
    'Scale your hiring process effortlessly',
    'Integrate with existing HR tools',
    
  ];

  const testimonials = [
    {
      name: 'Yonas Belete',
      role: 'Head of HR, TechCorp',
      content: 'This platform transformed our hiring process. We\'ve reduced time-to-hire by 50% and found better candidates.',
      rating: 5,
      avatar: 'YB'
    },
    {
      name: 'Eyosiyas Worku',
      role: 'Talent Acquisition Manager',
      content: 'The AI-powered resume screening is incredible. It saves us hours of manual work every week.',
      rating: 4,
      avatar: 'EW'
    },
    {
      name: 'Yordanos Tadesse',
      role: 'Startup Founder',
      content: 'Perfect for growing teams. The interface is intuitive and the features are exactly what we needed.',
      rating: 4,
      avatar: 'YT'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <nav className="relative z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <BriefcaseIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
              <div className="ml-2 sm:ml-3">
                <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  HR Assistant
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                className="hidden sm:inline-flex text-xs sm:text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600"
                onClick={() => scrollToSection('features')}
              >
                Features
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="hidden sm:inline-flex text-xs sm:text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600"
                onClick={() => scrollToSection('testimonials')}
              >
                Reviews
              </Button>
              
              <Button 
                onClick={handleLogin}
                size="sm"
                className="text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 px-3 sm:px-4"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section 
        className="relative overflow-hidden py-12 sm:py-20 lg:py-32"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div variants={itemVariants}>
              <Badge variant="outline" className="mb-4 sm:mb-6 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 text-xs sm:text-sm">
                <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                HR AI-Agent Platform
              </Badge>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
                <span className="text-slate-900 dark:text-white">Transform Your</span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  Hiring Process
                </span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 leading-relaxed">
                Streamline recruitment with AI-powered candidate screening, intelligent job matching, 
                and comprehensive analytics. Find the perfect candidates faster than ever.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                <Button 
                  size="lg" 
                  onClick={handleLogin}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
                >
                  Get Started 
                  <ArrowRightIcon className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                
                {/* <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg border-2"
                  onClick={() => setIsVideoPlaying(true)}
                >
                  <PlayIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Watch Demo
                </Button> */}
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 flex-shrink-0" />
                  Free Till You Want
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 flex-shrink-0" />
                  No credit card required
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="relative mt-8 lg:mt-0">
              <div className="relative z-10">
                <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 transform rotate-0 sm:rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">Recent Applications</h3>
                    <Badge variant="success" className="text-xs">Live</Badge>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {[
                      { name: 'Bihran Nega', role: 'Senior Developer', score: 95 },
                      { name: 'Dagmawi Babi', role: 'Backend Developer', score: 95 },
                      { name: 'Yeabsira Ashebir', role: 'Project Manager', score: 75 }
                    ].map((candidate, index) => (
                      <motion.div 
                        key={candidate.name}
                        className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 }}
                      >
                        <div className="flex items-center min-w-0 flex-1">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold flex-shrink-0">
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                            <p className="font-medium text-xs sm:text-sm text-slate-900 dark:text-white truncate">{candidate.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{candidate.role}</p>
                          </div>
                        </div>
                        <Badge variant={candidate.score >= 90 ? 'success' : 'warning'} className="text-xs ml-2 flex-shrink-0">
                          {candidate.score}%
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Floating elements - hidden on mobile */}
              <motion.div 
                className="hidden sm:block absolute -top-4 -right-4 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-20"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div 
                className="hidden sm:block absolute -bottom-8 -left-8 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-10"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-8 sm:mb-12 lg:mb-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
              Everything you need to hire better
            </motion.h2>
            <motion.p variants={itemVariants} className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto px-4">
              Our comprehensive platform combines the power of AI with intuitive design to revolutionize your hiring process.
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={feature.title} variants={itemVariants}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
                  <CardContent className="p-4 sm:p-6">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 sm:mb-4`}>
                      <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6">
                Why choose HR Assistant?
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 mb-6 sm:mb-8">
                Join thousands of companies that have transformed their hiring process with our platform.
              </p>
              
              <div className="space-y-3 sm:space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div 
                    key={benefit}
                    className="flex items-start"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative mt-8 lg:mt-0"
            >
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Card className="p-4 sm:p-6 bg-white dark:bg-slate-800">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">60%</div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Faster hiring</div>
                </Card>
                <Card className="p-4 sm:p-6 bg-white dark:bg-slate-800 mt-4 sm:mt-8">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">95%</div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Accuracy rate</div>
                </Card>
                <Card className="p-4 sm:p-6 bg-white dark:bg-slate-800 -mt-2 sm:-mt-4">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">10k+</div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Companies</div>
                </Card>
                <Card className="p-4 sm:p-6 bg-white dark:bg-slate-800 mt-2 sm:mt-4">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-1 sm:mb-2">24/7</div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Support</div>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-12 sm:py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-8 sm:mb-12 lg:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
              Loved by HR teams worldwide
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300">
              See what our customers have to say about their experience.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="h-full p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-0">
                    <div className="flex items-center mb-3 sm:mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarIcon key={i} className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-4 sm:mb-6 italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold flex-shrink-0">
                        {testimonial.avatar}
                      </div>
                      <div className="ml-2 sm:ml-3 min-w-0">
                        <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white truncate">{testimonial.name}</p>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-12 sm:py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
              Ready to transform your hiring?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8">
              Join thousands of companies already using HR Assistant to find better candidates faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleLogin}
                className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold"
              >
                Start for Free
                <ArrowRightIcon className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              {/* <Button 
                variant="outline" 
                size="lg"
                className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-blue-600 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
              >
                Schedule Demo
              </Button> */}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BriefcaseIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="ml-2 text-base sm:text-lg font-bold">HR Assistant</span>
              </div>
              <p className="text-sm sm:text-base text-slate-400">
                The future of hiring is here. Transform your recruitment process with AI-powered insights.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Product</h3>
              <ul className="space-y-2 text-sm sm:text-base text-slate-400">
                <li><button className="hover:text-white transition-colors">Features</button></li>
                <li><button className="hover:text-white transition-colors">Pricing</button></li>
                <li><button className="hover:text-white transition-colors">API</button></li>
                <li><button className="hover:text-white transition-colors">Integrations</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h3>
              <ul className="space-y-2 text-sm sm:text-base text-slate-400">
                <li><button className="hover:text-white transition-colors">About</button></li>
                <li><button className="hover:text-white transition-colors">Blog</button></li>
                <li><button className="hover:text-white transition-colors">Careers</button></li>
                <li><button className="hover:text-white transition-colors">Contact</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h3>
              <ul className="space-y-2 text-sm sm:text-base text-slate-400">
                <li><button className="hover:text-white transition-colors">Help Center</button></li>
                <li><button className="hover:text-white transition-colors">Documentation</button></li>
                <li><button className="hover:text-white transition-colors">Status</button></li>
                <li><button className="hover:text-white transition-colors">Security</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-slate-400">
            <p>&copy; 2026 HR Assistant. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
