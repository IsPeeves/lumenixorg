import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Menu, X, Globe, Zap, ChevronLeft, ChevronRight, Send, Phone, Mail, MapPin, Sun, User } from 'lucide-react';
import Logo from '../components/Logo';
import { supabase } from '../supabase';
import { Project } from '../types';

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('order', { ascending: true });
      
      if (error) {
        console.error('Error fetching projects:', error);
      } else {
        setProjects(data || []);
      }
      setLoadingProjects(false);
    };

    fetchProjects();
  }, []);

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
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
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
              className="md:hidden p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden bg-white border-t border-gray-100 py-4"
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
                <div className="border-t border-gray-100 my-2"></div>
                <Link to="/admin" className="text-gray-700 hover:text-primary transition-colors text-left py-2 flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Acessar Painel</span>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-16 min-h-screen flex items-center bg-gradient-to-br from-primary via-primary-dark to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                Criamos Sites e Landing Pages que 
                <span className="text-yellow-300"> Iluminam</span> seu Negócio
              </h1>
              <p className="text-xl md:text-2xl mb-4 text-gray-200">
                Automatizando o Futuro.
              </p>
              <div className="mb-8 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                  <span className="text-gray-200">Design responsivo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                  <span className="text-gray-200">Automação personalizada</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                  <span className="text-gray-200">Resultados rápidos</span>
                </div>
              </div>
              <button 
                onClick={() => scrollToSection('contact')}
                className="bg-yellow-300 hover:bg-yellow-400 text-black px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
              >
                Peça seu Orçamento
              </button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-white rounded-3xl transform rotate-6 opacity-20"></div>
                <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-32 bg-primary rounded-lg flex items-center justify-center">
                      <Sun className="h-12 w-12 text-white animate-float" />
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
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
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
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Criação de Sites</h3>
              <p className="text-gray-600 mb-6">
                Sites personalizados, otimizados e escaláveis para sua presença online. 
                Desenvolvemos soluções responsivas que funcionam perfeitamente em todos os dispositivos.
              </p>
              <button className="text-primary font-semibold hover:text-primary-dark transition-colors">
                Saiba Mais →
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Automação de Processos</h3>
              <p className="text-gray-600 mb-6">
                Soluções inteligentes para otimizar fluxos de trabalho e aumentar eficiência. 
                Automatizamos tarefas repetitivas para que você foque no que realmente importa.
              </p>
              <button className="text-primary font-semibold hover:text-primary-dark transition-colors">
                Saiba Mais →
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-20 bg-white">
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
              <div className="bg-gray-100 rounded-3xl p-8">
                <div className="relative overflow-hidden rounded-2xl">
                  <img 
                    src={projects[currentProject]?.image_url} 
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
                      className="inline-block bg-primary hover:bg-primary-dark px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Ver Projeto
                    </a>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6">
                  <button 
                    onClick={prevProject}
                    className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <ChevronLeft className="h-6 w-6 text-gray-600" />
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
                    className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <ChevronRight className="h-6 w-6 text-gray-600" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center text-gray-500">
              <p>Nenhum projeto no portfólio ainda.</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
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
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Informações de Contato</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Telefone</p>
                      <p className="text-gray-600">(11) 99999-9999</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">E-mail</p>
                      <p className="text-gray-600">contato@lumenix.com</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Localização</p>
                      <p className="text-gray-600">São Paulo, SP</p>
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
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                {formSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Mensagem Enviada!</h3>
                    <p className="text-gray-600">Entraremos em contato em breve.</p>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Nome
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        placeholder="Seu nome completo"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">
                        E-mail ou WhatsApp
                      </label>
                      <input
                        type="text"
                        id="contact"
                        required
                        value={formData.contact}
                        onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        placeholder="seu@email.com ou (11) 99999-9999"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Mensagem
                      </label>
                      <textarea
                        id="message"
                        rows={4}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        placeholder="Conte-nos sobre seu projeto..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary-dark text-white px-6 py-4 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center space-x-2"
                    >
                      <Send className="h-5 w-5" />
                      <span>Enviar Mensagem</span>
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <Logo className="mb-4" showText={true} theme="light" />
              <p className="text-gray-400 mb-4">
                Automatizando o Futuro com soluções criativas e tecnologia eficiente.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Links Úteis</h4>
              <div className="space-y-2">
                <button onClick={() => scrollToSection('home')} className="block text-gray-400 hover:text-white transition-colors">
                  Início
                </button>
                <button onClick={() => scrollToSection('services')} className="block text-gray-400 hover:text-white transition-colors">
                  Serviços
                </button>
                <button onClick={() => scrollToSection('portfolio')} className="block text-gray-400 hover:text-white transition-colors">
                  Portfólio
                </button>
                <button onClick={() => scrollToSection('contact')} className="block text-gray-400 hover:text-white transition-colors">
                  Contato
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <div className="space-y-2 text-gray-400">
                <p>(11) 99999-9999</p>
                <p>contato@lumenix.com</p>
                <p>São Paulo, SP</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Lumenix. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
