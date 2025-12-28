
import React from 'react';

const DocuarqLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: { box: 'text-xl px-0.5', text: 'text-xl', sub: 'text-[7px]' },
    md: { box: 'text-3xl px-1 pb-1', text: 'text-3xl', sub: 'text-[9px]' },
    lg: { box: 'text-5xl px-2 pb-2', text: 'text-5xl', sub: 'text-[12px]' },
  };

  const { box, text, sub } = sizeClasses[size];

  return (
    <div className="flex flex-col select-none leading-none items-start">
      <div className="flex items-end">
        <div className={`bg-black text-white font-bold ${box} tracking-tighter`}>docu</div>
        <div className={`text-[#ff0000] font-bold ${text} tracking-tighter -ml-0.5`}>arq</div>
      </div>
      <div className={`flex gap-1 font-bold mt-0.5 tracking-widest ${sub}`}>
        <span className="text-[#ff0000]">DOCUMENTOS</span>
        <span className="text-black">ARQUITECTÓNICOS</span>
      </div>
    </div>
  );
};

export default DocuarqLogo;
