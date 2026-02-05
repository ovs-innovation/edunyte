import React, { useEffect, useRef } from 'react';
import Vivus from 'vivus';

interface InjectableSvgProps {
   src: string;
   alt?: string;
   className?: string;
}

const InjectableSvg: React.FC<InjectableSvgProps> = ({ src, alt = '', className = '' }) => {
   const containerRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const fetchAndInjectSvg = async () => {
         if (!containerRef.current) return;
         try {
            const response = await fetch(src);
            const svgText = await response.text();
            
            if (containerRef.current) {
               containerRef.current.innerHTML = svgText;
               const svgElement = containerRef.current.querySelector('svg');

               if (svgElement) {
                  // svgElement.style.width = '100%';
                  // svgElement.style.height = '100%';
                  svgElement.setAttribute('class', (svgElement.getAttribute('class') || '') + ' injected-svg');

                  const vivusInstance = new Vivus(svgElement as unknown as HTMLElement, {
                     duration: 80,
                     file: src,
                  });

                  vivusInstance.finish(); 

                  containerRef.current.addEventListener('mouseenter', () => {
                     vivusInstance.reset().play();
                  });
               }
            }
         } catch (error) {
            console.error('Error fetching and injecting SVG:', error);
         }
      };

      fetchAndInjectSvg();
   }, [src]);

   return (
      <div 
         ref={containerRef} 
         className={`injectable ${className}`} 
         title={alt}
         style={{ 
            display: 'contents', 
         }}
      >
      </div>
   );
};

export default InjectableSvg;



