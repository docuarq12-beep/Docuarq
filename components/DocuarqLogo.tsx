
import React from 'react';

const DocuarqLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: { box: 'text-lg px-1 py-0.5', text: 'text-lg', sub: 'text-[6px] tracking-[0.2em]' },
    md: { box: 'text-2xl px-1.5 py-1', text: 'text-2xl', sub: 'text-[8px] tracking-[0.3em]' },
    lg: { box: 'text-5xl px-3 py-2', text: 'text-5xl', sub: 'text-[14px] tracking-[0.4em]' },
  };

  const { box, text, sub } = sizeClasses[size];

  return (
    <div className="flex flex-col select-none leading-none items-start group">
      <div className="flex items-end">
        <div className={`bg-black text-white font-black ${box} tracking-tighter transition-transform group-hover:-translate-y-0.5`}>docu</div>
        <div className={`text-[#ff0000] font-black ${text} tracking-tighter -ml-0.5 transition-transform group-hover:translate-y-0.5`}>arq</div>
      </div>
      <div className={`flex gap-1 font-black mt-1 uppercase ${sub} opacity-90`}>
        <span className="text-[#ff0000]">Documentos</span>
        <span className="text-black">Arquitectónicos</span>
      </div>
    </div>
  );
};

export default DocuarqLogo;
