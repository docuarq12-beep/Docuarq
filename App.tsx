
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Save, Image as ImageIcon, Trash2, ArrowLeft, Phone, 
  MapPin, Check, Maximize2, Sparkles, Loader2, Volume2, 
  StopCircle, MessageCircle, Copy, X, ExternalLink, Smartphone 
} from 'lucide-react';
import DocuarqLogo from './components/DocuarqLogo';
import CompareSlider from './components/CompareSlider';
import { Project, ViewMode, GalleryImage } from './types';
import { gemini } from './services/geminiService';

const App: React.FC = () => {
  // State
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

  // Load initial data from localStorage for demo persistence
  useEffect(() => {
    const saved = localStorage.getItem('docuarq_projects');
    if (saved) {
      setProjects(JSON.parse(saved));
    }
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
      notify("Descripción generada con éxito");
    } catch (e) {
      notify("Error al generar descripción");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSpeak = async () => {
    if (isPlaying) return;
    if (!currentProject.description) return notify("No hay descripción para narrar");
    
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
      return notify("Nombre y Título son obligatorios");
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
    if (!confirm("¿Eliminar proyecto?")) return;
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

  // --- RENDERING VIEWS ---

  if (view === ViewMode.DASHBOARD) {
    return (
      <div className="min-h-screen bg-dots pb-20">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 px-6 py-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <DocuarqLogo />
            <button 
              onClick={handleCreateNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <Plus size={20} /> NUEVA PROPUESTA
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6 md:p-12">
          <div className="flex items-center gap-3 mb-10">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">PROYECTOS RECIENTES</h2>
            <div className="h-0.5 flex-1 bg-slate-200"></div>
          </div>

          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <ImageIcon size={64} strokeWidth={1} />
              <p className="mt-4 font-medium">No hay proyectos. ¡Crea el primero!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map(p => (
                <div key={p.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm group hover:shadow-2xl transition-all duration-500">
                  <div className="h-56 bg-slate-100 relative overflow-hidden">
                    <img src={p.afterImg || 'https://picsum.photos/400/300'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-5 left-5 text-white">
                      <p className="text-[10px] font-bold tracking-[0.2em] opacity-80 uppercase mb-1">{p.clientName}</p>
                      <h3 className="text-xl font-bold leading-tight">{p.projectTitle}</h3>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex gap-2">
                      <button onClick={() => handlePreviewProject(p)} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-black transition-colors">VER PROPUESTA</button>
                      <button onClick={() => handleEditProject(p)} className="px-4 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"><Maximize2 size={18} /></button>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">v1.2 Released</span>
                      <button onClick={() => handleDeleteProject(p.id)} className="text-red-400 hover:text-red-600 transition-colors p-2"><Trash2 size={16} /></button>
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
        <div className="bg-white border-b sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
          <button onClick={() => setView(ViewMode.DASHBOARD)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors">
            <ArrowLeft size={18} /> PANEL
          </button>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handlePreviewProject(currentProject as Project)}
              className="hidden md:flex items-center gap-2 bg-slate-100 text-slate-700 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-slate-200 transition-colors"
            >
              <Smartphone size={18} /> VISTA CLIENTE
            </button>
            <button 
              onClick={handleSaveProject}
              className="bg-blue-600 text-white px-8 py-2.5 rounded-full font-bold text-sm shadow-xl hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Save size={18} /> GUARDAR
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-12">
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">01</span>
              <h3 className="text-xl font-black uppercase tracking-tight">DATOS DEL PROYECTO</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre del Cliente</label>
                <input 
                  type="text" 
                  value={currentProject.clientName} 
                  onChange={e => setCurrentProject(prev => ({ ...prev, clientName: e.target.value }))}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-blue-600 font-medium transition-all"
                  placeholder="Ej: Familia Rodriguez"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Título de Propuesta</label>
                <input 
                  type="text" 
                  value={currentProject.projectTitle} 
                  onChange={e => setCurrentProject(prev => ({ ...prev, projectTitle: e.target.value }))}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-blue-600 font-medium transition-all"
                  placeholder="Ej: Transformación Minimalista"
                />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">02</span>
              <h3 className="text-xl font-black uppercase tracking-tight">TRANSFORMACIÓN (HD)</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="relative group aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 overflow-hidden hover:border-blue-300 transition-colors">
                {currentProject.beforeImg ? (
                  <img src={currentProject.beforeImg} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon size={32} strokeWidth={1.5} />
                    <p className="text-xs font-bold mt-3">SUBIR ANTES</p>
                  </>
                )}
                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'before')} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
              <div className="relative group aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 overflow-hidden hover:border-blue-300 transition-colors">
                {currentProject.afterImg ? (
                  <img src={currentProject.afterImg} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Sparkles size={32} strokeWidth={1.5} />
                    <p className="text-xs font-bold mt-3">SUBIR PROPUESTA</p>
                  </>
                )}
                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'after')} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">03</span>
                <h3 className="text-xl font-black uppercase tracking-tight text-purple-600 flex items-center gap-2">
                  NARRATIVA IA <Sparkles size={18} />
                </h3>
              </div>
              <button 
                onClick={handleGenerateDescription}
                disabled={aiLoading}
                className="bg-purple-50 text-purple-700 px-4 py-2 rounded-full font-bold text-[10px] tracking-widest uppercase hover:bg-purple-100 disabled:opacity-50 flex items-center gap-2 transition-all border border-purple-200"
              >
                {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} 
                {currentProject.description ? 'RE-GENERAR' : 'GENERAR CON GEMINI'}
              </button>
            </div>
            <textarea 
              value={currentProject.description}
              onChange={e => setCurrentProject(prev => ({ ...prev, description: e.target.value }))}
              placeholder="La IA analizará tu propuesta para crear una descripción arquitectónica evocadora..."
              className="w-full bg-slate-50 border-none rounded-3xl px-6 py-6 text-slate-700 focus:ring-2 focus:ring-purple-500 font-medium transition-all min-h-[160px] leading-relaxed italic"
            />
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">04</span>
              <h3 className="text-xl font-black uppercase tracking-tight">VISTAS ADICIONALES</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {currentProject.galleryImages?.map((img, idx) => (
                <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden shadow-sm">
                  <img src={img.src} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => {
                      const newG = [...(currentProject.galleryImages || [])];
                      newG.splice(idx, 1);
                      setCurrentProject(prev => ({ ...prev, galleryImages: newG }));
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {(currentProject.galleryImages?.length || 0) < 4 && (
                <div className="relative aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-300 hover:border-blue-200 hover:text-blue-300 transition-all cursor-pointer">
                  <Plus size={24} />
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
      <div className="min-h-screen bg-white text-slate-900 relative">
        {lightbox && (
          <div 
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in"
            onClick={() => setLightbox(null)}
          >
            <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
              <X size={32} />
            </button>
            <img src={lightbox} className="max-h-[90vh] max-w-full rounded-xl shadow-2xl" />
          </div>
        )}

        <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center">
          <DocuarqLogo size="sm" />
          <div className="flex gap-4">
            <button onClick={() => setView(ViewMode.DASHBOARD)} className="text-[10px] font-bold tracking-widest text-slate-400 uppercase hover:text-slate-900 transition-colors">SALIR</button>
            <a href="tel:0985458261" className="bg-slate-900 text-white px-5 py-2 rounded-full text-[10px] font-bold tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-colors">
              <Phone size={12} /> CONTACTAR
            </a>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto px-6 py-24 md:py-32 space-y-24">
          <header className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-fade-in">
              <Sparkles size={14} /> PROPUESTA ARQUITECTÓNICA
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight tracking-tighter">
              {currentProject.projectTitle}
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 font-medium">
              Concepto exclusivo para <span className="text-slate-900 border-b-4 border-red-500">{currentProject.clientName}</span>
            </p>

            {currentProject.description && (
              <div className="mt-12 bg-slate-50 p-8 md:p-12 rounded-[40px] relative border border-slate-100 shadow-sm animate-fade-in">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                   <button 
                    onClick={handleSpeak}
                    disabled={isPlaying}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl ${isPlaying ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-900 text-white hover:bg-blue-600 scale-110'}`}
                   >
                     {isPlaying ? <StopCircle size={24} /> : <Volume2 size={24} />}
                   </button>
                </div>
                <p className="text-lg md:text-2xl text-slate-700 leading-relaxed font-light italic text-center px-4">
                  "{currentProject.description}"
                </p>
                <div className="mt-6 flex justify-center">
                  <div className="h-1 w-20 bg-slate-200 rounded-full"></div>
                </div>
              </div>
            )}
          </header>

          <section className="space-y-6">
             <div className="flex flex-col md:flex-row justify-between items-end gap-4">
               <div>
                  <h2 className="text-3xl font-black tracking-tight uppercase">TRANSFORMACIÓN</h2>
                  <p className="text-slate-400 font-medium">Visualización de alto impacto (HD)</p>
               </div>
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">Arrastra el deslizador →</div>
             </div>
             <div className="p-1.5 bg-slate-100 rounded-3xl border border-slate-200 shadow-inner">
               <CompareSlider 
                 beforeImage={currentProject.beforeImg!} 
                 afterImage={activeImage || currentProject.afterImg!} 
               />
             </div>
          </section>

          <section className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-black tracking-tight uppercase">PERSPECTIVAS</h2>
              <p className="text-slate-400 font-medium">Haz clic para cambiar la vista principal</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {allViews.map((img, idx) => (
                <div 
                  key={idx} 
                  onClick={() => {
                    setActiveImage(img);
                    window.scrollTo({ top: document.querySelector('section')?.offsetTop ? document.querySelector('section')!.offsetTop - 100 : 0, behavior: 'smooth' });
                  }}
                  className={`relative aspect-square rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 shadow-md ${activeImage === img ? 'ring-4 ring-blue-600 ring-offset-4 scale-105' : 'opacity-70 grayscale hover:grayscale-0 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setLightbox(img); }}
                    className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Maximize2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <footer className="bg-slate-900 rounded-[50px] p-12 md:p-20 text-white relative overflow-hidden text-center space-y-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 space-y-4">
              <h3 className="text-4xl md:text-5xl font-black tracking-tight">¿Hacemos esto realidad?</h3>
              <p className="text-slate-400 max-w-xl mx-auto text-lg">Estamos listos para iniciar la ejecución técnica de su proyecto bajo los estándares más altos de Docuarq.</p>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row justify-center gap-6">
              <a 
                href="https://wa.me/593985458261" 
                target="_blank"
                className="bg-[#25D366] text-white px-10 py-5 rounded-3xl font-bold flex items-center justify-center gap-3 shadow-xl hover:scale-105 transition-all"
              >
                <MessageCircle size={24} /> AGENDAR REUNIÓN
              </a>
              <div className="bg-slate-800 border border-slate-700 px-10 py-5 rounded-3xl font-bold flex items-center justify-center gap-3">
                <MapPin size={24} className="text-red-500" /> QUITO, ECUADOR
              </div>
            </div>
          </footer>
        </main>
      </div>
    );
  }

  return (
    <div className="fixed bottom-10 right-10 z-[200]">
      {notification && (
        <div className="bg-black text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in border border-white/10">
          <Check size={18} className="text-green-400" />
          <span className="text-xs font-bold tracking-widest uppercase">{notification}</span>
        </div>
      )}
    </div>
  );
};

export default App;
