import React from 'react';

// Komponen untuk ikon media sosial agar lebih rapi
const SocialIcon = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-300">
    <span className="sr-only">{children.type.name}</span>
    {children}
  </a>
);

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Konten utama footer dengan padding vertikal yang lebih besar */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
            
            {/* Bagian Kiri: Logo dan Deskripsi Singkat */}
            <div className="md:col-span-2 lg:col-span-2">
              <h2 className="text-2xl font-bold text-white">Peta Talenta</h2>
              <p className="mt-4 text-gray-400 max-w-md">
                Platform pemetaan talenta berbasis AI. Membantu siswa dan siswi untuk menemukan dan mengembangkan talenta terbaik melalui analisis berbasis data.
              </p>
            </div>

            {/* Bagian Tengah: Tautan Navigasi */}
            <div className="md:col-span-2 lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h3 className="text-sm font-semibold tracking-wider uppercase text-gray-300">Solusi</h3>
                <ul className="mt-4 space-y-3">
                  <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">Rekrutmen</a></li>
                  <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">Asesmen</a></li>
                  <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">Pengembangan</a></li>
                  <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">Analitik</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-wider uppercase text-gray-300">Perusahaan</h3>
                <ul className="mt-4 space-y-3">
                  <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">Tentang Kami</a></li>
                  <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">Karier</a></li>
                  <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">Kontak</a></li>
                </ul>
              </div>
               <div>
                <h3 className="text-sm font-semibold tracking-wider uppercase text-gray-300">Legal</h3>
                <ul className="mt-4 space-y-3">
                  <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">Privasi</a></li>
                  <li><a href="#" className="text-base text-gray-400 hover:text-white transition-colors">Syarat</a></li>
                </ul>
              </div>
            </div>

            {/* Bagian Kanan: Media Sosial */}
            <div className="md:col-span-4 lg:col-span-1">
               <h3 className="text-sm font-semibold tracking-wider uppercase text-gray-300">Terhubung Dengan Kami</h3>
               <div className="mt-4 flex space-x-5">
                  <SocialIcon href="#">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                  </SocialIcon>
                  <SocialIcon href="#">
                     <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                  </SocialIcon>
                  <SocialIcon href="#">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12.011c0 4.602 3.203 8.442 7.437 9.632.548.1.75-.238.75-.529v-1.853c-3.106.674-3.76-1.498-3.76-1.498-.498-1.265-1.216-1.6-1.216-1.6-1-.685.076-.67.076-.67 1.104.077 1.688 1.132 1.688 1.132.98 1.677 2.57 1.192 3.196.912.1-.708.384-1.192.7-1.466-2.44-.277-5-1.218-5-5.424 0-1.197.428-2.176 1.13-2.944-.114-.278-.49-1.392.108-2.902 0 0 .922-.296 3.022 1.126A10.53 10.53 0 0112 5.003c.958 0 1.922.13 2.834.384 2.1-1.422 3.02-1.126 3.02-1.126.6 1.51.222 2.624.11 2.902.703.768 1.13 1.747 1.13 2.944 0 4.218-2.562 5.145-5.012 5.414.396.34.75.99.75 2.002v-2.977c0-.293.202-.63.75-.528C18.797 20.453 22 16.613 22 12.011 22 6.477 17.523 2 12 2z" clipRule="evenodd" /></svg>
                  </SocialIcon>
               </div>
            </div>

          </div>
        </div>

        {/* Garis pemisah */}
        <div className="border-t border-gray-700"></div>

        {/* Bagian Bawah: Copyright */}
        <div className="py-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-400 text-center sm:text-left">
            © {new Date().getFullYear()} Peta Talenta. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
             <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
             <span className="text-gray-600">|</span>
             <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
