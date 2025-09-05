import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Menu, X, Globe, Zap, ChevronLeft, ChevronRight, Send, Phone, Mail, MapPin, Sun, User, MessageCircle } from 'lucide-react';
import Logo from '../components/Logo';
import { useData } from '../contexts/DataContext';


const LandingPage: React.FC = () => {
  const { projects, loading: loadingProjects } = useData();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    if (loadingProjects) return;
    if (projects.length === 0) return;
    setCurrentProject(0);
  }, [loadingProjects, projects]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você integraria o envio para um backend ou serviço de email
    console.log('Form data:', formData);
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({ name: '', contact: '', message: '' });
    }, 3000);
  };

  const nextProject = () => {
    if (projects.length === 0) return;
    setCurrentProject((prev) => (prev + 1) % projects.length);
  };

  const prevProject = () => {
    if (projects.length === 0) return;
    setCurrentProject((prev) => (prev - 1 + projects.length) % projects.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center">
              <div className="flex space-x-8">
                <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-primary transition-colors">
                  Início
                </button>
                <button onClick={() => scrollToSection('services')} className="text-gray-700 hover:text-primary transition-colors">
                  Serviços
                </button>
                <button onClick={() => scrollToSection('portfolio')} className="text-gray-700 hover:text-primary transition-colors">
                  Portfólio
                </button>
                <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-primary transition-colors">
                  Contato
                </button>
              </div>
              <Link to="/admin" className="ml-8 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-2 transition-colors">
                <User className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden bg-white border-t border-gray-200 py-4"
            >
              <div className="flex flex-col space-y-4 px-4">
                <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-primary transition-colors text-left py-2">
                  Início
                </button>
                <button onClick={() => scrollToSection('services')} className="text-gray-700 hover:text-primary transition-colors text-left py-2">
                  Serviços
                </button>
                <button onClick={() => scrollToSection('portfolio')} className="text-gray-700 hover:text-primary transition-colors text-left py-2">
                  Portfólio
                </button>
                <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-primary transition-colors text-left py-2">
                  Contato
                </button>
                <div className="border-t border-gray-200 my-2"></div>
                <Link to="/admin" className="text-gray-700 hover:text-primary transition-colors text-left py-2 flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Acessar Painel</span>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Technological Background Effect */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-primary/5"></div>
        
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-70">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(46, 33, 84, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(46, 33, 84, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite'
          }}></div>
        </div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-primary/80 rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
        
        {/* Circuit Lines */}
        <div className="absolute inset-0 opacity-60">
          <svg className="w-full h-full" viewBox="0 0 1000 1000">
            <defs>
              <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2E2154" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
            <path d="M100,200 L300,200 L300,400 L500,400 L500,600 L700,600" 
                  stroke="url(#circuitGradient)" strokeWidth="2" fill="none"
                  className="animate-pulse" />
            <path d="M200,100 L200,300 L400,300 L400,500 L600,500 L600,700" 
                  stroke="url(#circuitGradient)" strokeWidth="2" fill="none"
                  className="animate-pulse" style={{animationDelay: '1s'}} />
            <circle cx="300" cy="200" r="4" fill="#2E2154" className="animate-ping" />
            <circle cx="500" cy="400" r="4" fill="#3B82F6" className="animate-ping" style={{animationDelay: '0.5s'}} />
            <circle cx="400" cy="300" r="4" fill="#2E2154" className="animate-ping" style={{animationDelay: '1.5s'}} />
          </svg>
        </div>
        
        {/* Code Rain Effect */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute text-xs font-mono text-primary"
              style={{
                left: `${i * 10}%`,
                animation: `codeRain ${5 + Math.random() * 3}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            >
              {['<div>', '</div>', 'function()', 'const x =', 'return', 'import', 'export'][Math.floor(Math.random() * 7)]}
            </div>
          ))}
        </div>
      </div>
      
      {/* Hero Section */}
      <section id="home" className="pt-16 min-h-screen flex items-center relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-gray-900 bg-white/80 backdrop-blur-sm rounded-2xl p-8"
            >
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                Criamos Sites e Landing Pages que 
                <span className="text-primary"> Iluminam</span> seu Negócio
              </h1>
              <p className="text-xl md:text-2xl mb-4 text-gray-600">
                Automatizando o Futuro.
              </p>
              <div className="mb-8 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-gray-600">Design responsivo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-gray-600">Automação personalizada</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-gray-600">Resultados rápidos</span>
                </div>
              </div>
              <motion.button 
                onClick={() => scrollToSection('contact')}
                className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl relative overflow-hidden group"
                whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <span className="relative z-10">Peça seu Orçamento</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-dark to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-white opacity-0 group-active:opacity-20 transition-opacity duration-150"></div>
              </motion.button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-pink-400 rounded-3xl transform rotate-6 opacity-40"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-32 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                      <Sun className="h-12 w-12 text-white animate-bounce" />
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16 bg-white/80 backdrop-blur-sm rounded-2xl p-8 mx-auto max-w-4xl"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Nossas Soluções
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A Lumenix é uma empresa criativa especializada em criação de sites e automação de processos. 
              Combinamos design leve, tecnologia eficiente e soluções inteligentes para ajudar sua empresa 
              a ganhar presença digital e produtividade.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Criação de Sites</h3>
              <p className="text-gray-600 mb-6">
                Sites personalizados, otimizados e escaláveis para sua presença online. 
                Desenvolvemos soluções responsivas que funcionam perfeitamente em todos os dispositivos.
              </p>
              <button className="text-primary font-semibold hover:text-primary-light transition-colors">
                Saiba Mais →
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Automação de Processos</h3>
              <p className="text-gray-600 mb-6">
                Soluções inteligentes para otimizar fluxos de trabalho e aumentar eficiência. 
                Automatizamos tarefas repetitivas para que você foque no que realmente importa.
              </p>
              <button className="text-primary font-semibold hover:text-primary-light transition-colors">
                Saiba Mais →
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-20 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Projetos que Brilham
            </h2>
            <p className="text-xl text-gray-600">
              Conheça alguns dos nossos trabalhos mais recentes
            </p>
          </motion.div>

          {loadingProjects ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : projects.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative max-w-4xl mx-auto"
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg">
                <div className="relative overflow-hidden rounded-2xl">
                  <img 
                    src={projects[currentProject]?.image} 
                    alt={projects[currentProject]?.title}
                    className="w-full h-64 md:h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{projects[currentProject]?.title}</h3>
                    <p className="text-gray-200 mb-4">{projects[currentProject]?.description}</p>
                    <a 
                      href={projects[currentProject]?.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block bg-primary hover:bg-primary-dark px-6 py-2 rounded-lg font-semibold transition-colors text-white"
                    >
                      Ver Projeto
                    </a>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6">
                  <button 
                    onClick={prevProject}
                    className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full shadow-lg hover:shadow-xl transition-shadow border border-gray-300"
                  >
                    <ChevronLeft className="h-6 w-6 text-gray-700" />
                  </button>

                  <div className="flex space-x-2">
                    {projects.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentProject(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentProject ? 'bg-primary' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  <button 
                    onClick={nextProject}
                    className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full shadow-lg hover:shadow-xl transition-shadow border border-gray-300"
                  >
                    <ChevronRight className="h-6 w-6 text-gray-700" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center text-gray-600">
              <p>Nenhum projeto no portfólio ainda.</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Vamos Conversar?
            </h2>
            <p className="text-xl text-gray-600">
              Entre em contato conosco e vamos iluminar seu projeto juntos
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="bg-gray-50 rounded-2xl p-8 shadow-lg border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Informações de Contato</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Telefone</p>
                      <p className="text-gray-600">(34) 98404-6131</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">E-mail</p>
                      <p className="text-gray-600">comercial@lumenixtech.com.br</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Localização</p>
                      <p className="text-gray-600">Minas Gerais, MG</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="bg-gray-50 rounded-2xl p-8 shadow-lg border border-gray-200">
                {formSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-300">
                      <Send className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Mensagem Enviada!</h3>
                    <p className="text-gray-600">Entraremos em contato em breve.</p>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                        Nome
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors placeholder-gray-500"
                        placeholder="Seu nome completo"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact" className="block text-sm font-medium text-gray-900 mb-2">
                        E-mail ou WhatsApp
                      </label>
                      <input
                        type="text"
                        id="contact"
                        required
                        value={formData.contact}
                        onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors placeholder-gray-500"
                        placeholder="seu@email.com ou (34) 9999-9999"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">
                        Mensagem
                      </label>
                      <textarea
                        id="message"
                        rows={4}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors placeholder-gray-500"
                        placeholder="Conte-nos sobre seu projeto..."
                      />
                    </div>

                    <motion.button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary-dark text-white px-6 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl relative overflow-hidden group active:scale-95"
                      whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(124, 58, 237, 0.3), 0 10px 10px -5px rgba(124, 58, 237, 0.1)" }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-dark to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 bg-white opacity-0 group-active:opacity-10 transition-opacity duration-150"></div>
                      <Send className="h-5 w-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                      <span className="relative z-10">Enviar Mensagem</span>
                    </motion.button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-primary py-12 relative z-30 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <Logo className="mb-4" showText={true} theme="dark" />
              <p className="text-primary mb-4">
                Automatizando o Futuro com soluções criativas e tecnologia eficiente.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-primary">Links Úteis</h4>
              <div className="space-y-2">
                <button onClick={() => scrollToSection('home')} className="block text-primary hover:text-primary-dark hover:underline transition-all duration-300">
                  Início
                </button>
                <button onClick={() => scrollToSection('services')} className="block text-primary hover:text-primary-dark hover:underline transition-all duration-300">
                  Serviços
                </button>
                <button onClick={() => scrollToSection('portfolio')} className="block text-primary hover:text-primary-dark hover:underline transition-all duration-300">
                  Portfólio
                </button>
                <button onClick={() => scrollToSection('contact')} className="block text-primary hover:text-primary-dark hover:underline transition-all duration-300">
                  Contato
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-primary">Contato</h4>
              <div className="space-y-2 text-primary">
                <p>(34) 98404-6131</p>
                <p>comercial@lumenixtech.com.br</p>
                <p>Minas Gerais, MG</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-primary">
            <p>&copy; 2025 Lumenix. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <motion.a
        href="https://wa.me/5534984046131?text=Olá! Gostaria de saber mais sobre os serviços da Lumenix."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 z-50 flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <MessageCircle size={24} />
      </motion.a>
    </div>
  );
};

export default LandingPage;
