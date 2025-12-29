
import React, { useState, useEffect } from 'react';
import { 
  Plus, Save, Image as ImageIcon, Trash2, ArrowLeft, Phone, 
  MapPin, Check, Maximize2, Sparkles, Loader2, Volume2, 
  StopCircle, MessageCircle, Copy, X, Smartphone, ChevronRight
} from 'lucide-react';
import DocuarqLogo from './components/DocuarqLogo';
import CompareSlider from './components/CompareSlider';
import { Project, ViewMode } from './types';
import { gemini } from './services/geminiService';

const App: React.FC = () => {
  // Logic remains identical
  const [view, setView] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({
    clientName: '',
    projectTitle: '',
    description: '',
    beforeImg: '',
    afterImg: '',
    galleryImages: [],
    videoUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeImage, setActiveImage] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('docuarq_projects');
    if (saved) setProjects(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('docuarq_projects', JSON.stringify(projects));
  }, [projects]);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after' | 'gallery') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (type === 'before') setCurrentProject(prev => ({ ...prev, beforeImg: base64 }));
      else if (type === 'after') setCurrentProject(prev => ({ ...prev, afterImg: base64 }));
      else if (type === 'gallery') {
        setCurrentProject(prev => ({
          ...prev,
          galleryImages: [...(prev.galleryImages || []), { src: base64, description: '' }]
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateDescription = async () => {
    if (!currentProject.afterImg) return notify("Sube una propuesta primero");
    setAiLoading(true);
    try {
      const desc = await gemini.describeArchitecture(
        currentProject.afterImg, 
        currentProject.projectTitle || "Sin Titulo", 
        currentProject.clientName || "Cliente"
      );
      setCurrentProject(prev => ({ ...prev, description: desc }));
      notify("Narrativa generada");
    } catch (e) {
      notify("Error de conexión IA");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSpeak = async () => {
    if (isPlaying) return;
    if (!currentProject.description) return notify("Sin descripción");
    setIsPlaying(true);
    try {
      const intro = `Hola ${currentProject.clientName || 'estimado cliente'}. `;
      await gemini.speakProposal(intro + currentProject.description);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleSaveProject = () => {
    if (!currentProject.clientName || !currentProject.projectTitle) {
      return notify("Completa los campos obligatorios");
    }
    const newProject: Project = {
      ...currentProject as Project,
      id: currentProject.id || Date.now().toString(),
      createdAt: currentProject.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProjects(prev => {
      const exists = prev.find(p => p.id === newProject.id);
      if (exists) return prev.map(p => p.id === newProject.id ? newProject : p);
      return [newProject, ...prev];
    });
    notify("Proyecto guardado");
    setView(ViewMode.DASHBOARD);
  };

  const handleDeleteProject = (id: string) => {
    if (!confirm("¿Eliminar propuesta permanentemente?")) return;
    setProjects(prev => prev.filter(p => p.id !== id));
    notify("Eliminado");
  };

  const handleEditProject = (project: Project) => {
    setCurrentProject(project);
    setView(ViewMode.EDIT);
  };

  const handlePreviewProject = (project: Project) => {
    setCurrentProject(project);
    setActiveImage(project.afterImg);
    setView(ViewMode.PRESENTATION);
  };

  const handleCreateNew = () => {
    setCurrentProject({
      clientName: '',
      projectTitle: '',
      description: '',
      beforeImg: '',
      afterImg: '',
      galleryImages: [],
      videoUrl: ''
    });
    setView(ViewMode.EDIT);
  };

  // --- VIEWS ---

  if (view === ViewMode.DASHBOARD) {
    return (
      <div className="min-h-screen bg-studio pb-32">
        <header className="glass sticky top-0 z-40 border-b border-black/5 px-8 py-8">
          <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-8">
            <DocuarqLogo />
            <button 
              onClick={handleCreateNew}
              className="group bg-black text-white px-10 py-4 rounded-full font-black text-xs tracking-[0.2em] shadow-[0_20px_40px_rgba(0,0,0,0.15)] flex items-center gap-3 transition-all hover:-translate-y-1 hover:shadow-[0_30px_60px_rgba(0,0,0,0.2)]"
            >
              <Plus size={18} strokeWidth={3} /> NUEVA PROPUESTA
            </button>
          </div>
        </header>

        <main className="max-w-[1400px] mx-auto p-8 md:p-16">
          <div className="mb-16">
            <h2 className="text-4xl font-black text-black tracking-tight mb-2">GALERÍA DE ESTUDIO</h2>
            <p className="text-slate-400 font-medium tracking-wide">Gestiona tus presentaciones de alto impacto</p>
          </div>

          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 bg-white/50 rounded-[3rem] border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6">
                <ImageIcon size={32} />
              </div>
              <p className="text-lg font-bold text-slate-400">Comienza tu próxima gran obra</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
              {projects.map(p => (
                <div key={p.id} className="group bg-white rounded-[2.5rem] overflow-hidden architectural-shadow transition-all duration-700 hover:-translate-y-2">
                  <div className="h-72 bg-slate-900 relative overflow-hidden">
                    <img 
                      src={p.afterImg || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-px bg-red-600"></span>
                        <p className="text-[9px] font-black tracking-[0.3em] opacity-70 uppercase">{p.clientName}</p>
                      </div>
                      <h3 className="text-2xl font-black leading-tight tracking-tight uppercase">{p.projectTitle}</h3>
                    </div>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="flex gap-4">
                      <button 
                        onClick={() => handlePreviewProject(p)} 
                        className="flex-1 bg-black text-white py-4 rounded-2xl font-black text-[10px] tracking-[0.2em] hover:bg-red-600 transition-colors uppercase"
                      >
                        Presentar HD
                      </button>
                      <button 
                        onClick={() => handleEditProject(p)} 
                        className="w-14 h-14 bg-slate-100 text-black rounded-2xl flex items-center justify-center hover:bg-black hover:text-white transition-all"
                      >
                        <Maximize2 size={20} />
                      </button>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Activo</span>
                      </div>
                      <button onClick={() => handleDeleteProject(p.id)} className="text-slate-300 hover:text-red-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  if (view === ViewMode.EDIT) {
    return (
      <div className="min-h-screen bg-white">
        <div className="glass sticky top-0 z-50 px-8 py-6 flex justify-between items-center border-b border-black/5">
          <button onClick={() => setView(ViewMode.DASHBOARD)} className="group flex items-center gap-3 text-slate-400 hover:text-black font-black text-xs tracking-widest transition-colors">
            <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" /> VOLVER
          </button>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => handlePreviewProject(currentProject as Project)}
              className="hidden md:flex items-center gap-2 bg-slate-100 text-black px-8 py-3 rounded-full font-black text-xs tracking-widest hover:bg-slate-200"
            >
              <Smartphone size={16} /> VISTA CLIENTE
            </button>
            <button 
              onClick={handleSaveProject}
              className="bg-black text-white px-10 py-3 rounded-full font-black text-xs tracking-widest shadow-xl hover:bg-red-600 transition-all flex items-center gap-3"
            >
              <Save size={18} /> GUARDAR
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-8 md:p-20 space-y-24">
          <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-4 mb-10">
              <span className="text-4xl font-black text-red-600/20 italic tracking-tighter">01</span>
              <h3 className="text-2xl font-black uppercase tracking-tight">Estructura del Proyecto</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Cliente / Inversionista</label>
                <input 
                  type="text" 
                  value={currentProject.clientName} 
                  onChange={e => setCurrentProject(prev => ({ ...prev, clientName: e.target.value }))}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-black rounded-3xl px-8 py-5 text-black font-bold outline-none transition-all placeholder:text-slate-300"
                  placeholder="Ej: Residencia Valdés"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Concepto de Diseño</label>
                <input 
                  type="text" 
                  value={currentProject.projectTitle} 
                  onChange={e => setCurrentProject(prev => ({ ...prev, projectTitle: e.target.value }))}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-black rounded-3xl px-8 py-5 text-black font-bold outline-none transition-all placeholder:text-slate-300"
                  placeholder="Ej: Minimalismo Tropical"
                />
              </div>
            </div>
          </section>

          <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-4 mb-10">
              <span className="text-4xl font-black text-red-600/20 italic tracking-tighter">02</span>
              <h3 className="text-2xl font-black uppercase tracking-tight">Visuales HD (Antes/Después)</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="relative group aspect-video bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 overflow-hidden hover:border-black transition-all">
                {currentProject.beforeImg ? (
                  <img src={currentProject.beforeImg} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 architectural-shadow">
                      <ImageIcon size={24} />
                    </div>
                    <p className="text-[10px] font-black tracking-widest uppercase">Subir Estado Actual</p>
                  </>
                )}
                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'before')} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
              <div className="relative group aspect-video bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 overflow-hidden hover:border-red-600 transition-all">
                {currentProject.afterImg ? (
                  <img src={currentProject.afterImg} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 architectural-shadow">
                      <Sparkles size={24} className="text-red-600" />
                    </div>
                    <p className="text-[10px] font-black tracking-widest uppercase">Subir Propuesta Digital</p>
                  </>
                )}
                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'after')} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
          </section>

          <section className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-black text-red-600/20 italic tracking-tighter">03</span>
                <h3 className="text-2xl font-black uppercase tracking-tight">Narrativa Arquitectónica</h3>
              </div>
              <button 
                onClick={handleGenerateDescription}
                disabled={aiLoading}
                className="bg-black text-white px-8 py-3 rounded-full font-black text-[9px] tracking-[0.2em] uppercase hover:bg-red-600 disabled:opacity-50 flex items-center gap-3 transition-all"
              >
                {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} 
                {currentProject.description ? 'Re-interpretar con IA' : 'Analizar Propuesta'}
              </button>
            </div>
            <div className="relative">
              <textarea 
                value={currentProject.description}
                onChange={e => setCurrentProject(prev => ({ ...prev, description: e.target.value }))}
                placeholder="La IA analizará la iluminación, materiales y texturas de tu imagen para crear una narrativa sugerente..."
                className="w-full bg-slate-50 border-none rounded-[2rem] px-10 py-10 text-slate-700 focus:ring-4 focus:ring-black/5 font-medium transition-all min-h-[200px] leading-relaxed text-lg"
              />
              <div className="absolute top-8 left-0 w-1 h-12 bg-red-600 rounded-r"></div>
            </div>
          </section>

          <section className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-4 mb-10">
              <span className="text-4xl font-black text-red-600/20 italic tracking-tighter">04</span>
              <h3 className="text-2xl font-black uppercase tracking-tight">Perspectivas de Detalle</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {currentProject.galleryImages?.map((img, idx) => (
                <div key={idx} className="relative group aspect-square rounded-3xl overflow-hidden shadow-sm">
                  <img src={img.src} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <button 
                    onClick={() => {
                      const newG = [...(currentProject.galleryImages || [])];
                      newG.splice(idx, 1);
                      setCurrentProject(prev => ({ ...prev, galleryImages: newG }));
                    }}
                    className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {(currentProject.galleryImages?.length || 0) < 4 && (
                <div className="relative aspect-square border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-300 hover:border-black hover:text-black transition-all cursor-pointer">
                  <Plus size={32} strokeWidth={1} />
                  <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'gallery')} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (view === ViewMode.PRESENTATION) {
    const allViews = [currentProject.afterImg!, ...(currentProject.galleryImages?.map(g => g.src) || [])];

    return (
      <div className="min-h-screen bg-white text-black relative">
        {lightbox && (
          <div 
            className="fixed inset-0 z-[100] bg-black backdrop-blur-3xl flex items-center justify-center p-8 animate-fade-in"
            onClick={() => setLightbox(null)}
          >
            <button className="absolute top-10 right-10 text-white/40 hover:text-white">
              <X size={48} strokeWidth={1} />
            </button>
            <img src={lightbox} className="max-h-[85vh] max-w-full rounded-2xl shadow-[0_0_100px_rgba(255,255,255,0.1)]" />
          </div>
        )}

        <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-black/5 px-10 py-6 flex justify-between items-center">
          <DocuarqLogo size="sm" />
          <div className="flex gap-8 items-center">
            <button onClick={() => setView(ViewMode.DASHBOARD)} className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase hover:text-black transition-colors">Cerrar Sesión</button>
            <a href="tel:0985458261" className="bg-black text-white px-8 py-3 rounded-full text-[10px] font-black tracking-[0.3em] flex items-center gap-3 hover:bg-red-600 transition-all">
              <Phone size={14} /> CONTACTAR
            </a>
          </div>
        </nav>

        <main className="max-w-[1200px] mx-auto px-8 py-32 md:py-48 space-y-40">
          <header className="text-center space-y-10 max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-slate-50 text-slate-900 rounded-full text-[10px] font-black uppercase tracking-[0.3em] animate-fade-in">
              <Sparkles size={16} className="text-red-600" /> Propuesta Exclusiva
            </div>
            <h1 className="text-6xl md:text-9xl font-black text-black leading-[0.9] tracking-tighter uppercase italic">
              {currentProject.projectTitle}
            </h1>
            <p className="text-2xl md:text-3xl text-slate-400 font-medium lowercase tracking-tight">
              Diseño concebido para <span className="text-black font-black uppercase tracking-widest">{currentProject.clientName}</span>
            </p>

            {currentProject.description && (
              <div className="mt-24 p-12 md:p-20 rounded-[4rem] bg-slate-50 relative border border-slate-100 animate-fade-in overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                   <button 
                    onClick={handleSpeak}
                    disabled={isPlaying}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl ${isPlaying ? 'bg-red-600 text-white animate-pulse' : 'bg-black text-white hover:scale-110'}`}
                   >
                     {isPlaying ? <StopCircle size={32} strokeWidth={1.5} /> : <Volume2 size={32} strokeWidth={1.5} />}
                   </button>
                </div>
                <p className="text-2xl md:text-4xl text-black leading-tight font-light italic text-center px-4 tracking-tight">
                  "{currentProject.description}"
                </p>
              </div>
            )}
          </header>

          <section className="space-y-12">
             <div className="flex flex-col md:flex-row justify-between items-end gap-6">
               <div className="space-y-2">
                  <h2 className="text-5xl font-black tracking-tighter uppercase italic">Transformación</h2>
                  <div className="w-20 h-1 bg-red-600"></div>
               </div>
               <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] hidden md:block">Interactive Slider Experience</div>
             </div>
             <div className="p-3 bg-slate-100 rounded-[2.5rem] architectural-shadow">
               <CompareSlider 
                 beforeImage={currentProject.beforeImg!} 
                 afterImage={activeImage || currentProject.afterImg!} 
               />
             </div>
          </section>

          <section className="space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-black tracking-tighter uppercase italic">Atmósferas</h2>
              <p className="text-slate-400 font-medium tracking-widest uppercase text-[10px]">Perspectivas capturadas de la propuesta</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {allViews.map((img, idx) => (
                <div 
                  key={idx} 
                  onClick={() => {
                    setActiveImage(img);
                    const section = document.querySelector('section');
                    if (section) window.scrollTo({ top: section.offsetTop - 120, behavior: 'smooth' });
                  }}
                  className={`relative aspect-[4/5] rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-700 hover:-translate-y-3 ${activeImage === img ? 'ring-8 ring-red-600 ring-offset-8 scale-105' : 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setLightbox(img); }}
                    className="absolute top-6 right-6 glass text-black p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                  >
                    <Maximize2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <footer className="bg-black rounded-[4rem] p-16 md:p-32 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-12">
              <div className="space-y-6">
                <h3 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.85]">Construyamos el futuro</h3>
                <p className="text-slate-400 max-w-2xl mx-auto text-xl font-medium">Estamos listos para materializar esta visión con precisión técnica y excelencia arquitectónica.</p>
              </div>

              <div className="flex flex-col md:flex-row justify-center gap-8 w-full max-w-3xl">
                <a 
                  href="https://wa.me/593985458261" 
                  target="_blank"
                  className="flex-1 bg-[#25D366] text-white px-12 py-6 rounded-[2rem] font-black text-sm tracking-widest flex items-center justify-center gap-4 shadow-2xl hover:-translate-y-1 transition-all uppercase"
                >
                  <MessageCircle size={28} /> WhatsApp Directo
                </a>
                <div className="flex-1 glass border border-white/10 px-12 py-6 rounded-[2rem] font-black text-sm tracking-widest flex items-center justify-center gap-4 uppercase">
                  <MapPin size={28} className="text-red-600" /> Quito, EC
                </div>
              </div>
            </div>
          </footer>
        </main>

        <div className="fixed bottom-12 right-12 z-[60] flex flex-col gap-4">
           {notification && (
            <div className="bg-black text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-fade-in border border-white/10">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-ping"></div>
              <span className="text-[10px] font-black tracking-[0.2em] uppercase">{notification}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default App;
