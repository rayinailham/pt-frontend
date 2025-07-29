import { motion } from 'framer-motion';

const AssessmentRelation = ({ delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="mb-12"
    >
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-50 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Integrasi Tiga Dimensi Assessment</h2>
            <p className="text-gray-500 font-medium">Pendekatan Holistik untuk Talent Mapping</p>
          </div>

          <p className="text-gray-600 leading-relaxed text-center max-w-4xl mx-auto mb-10">
            Sistem assessment kami mengintegrasikan tiga dimensi fundamental kepribadian manusia untuk memberikan
            analisis yang komprehensif dan akurat. Setiap assessment saling melengkapi dan memperkuat validitas
            hasil analisis secara keseluruhan.
          </p>

          {/* Three Pillars Visualization */}
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 text-center transition-all duration-300">
              <div className="w-14 h-14 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">VIA Character Strengths</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">Mengidentifikasi kekuatan karakter dan nilai-nilai inti</p>
              <div className="text-xs text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-full inline-block">
                Dimensi: Karakter & Nilai
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 text-center transition-all duration-300">
              <div className="w-14 h-14 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">RIASEC Interests</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">Menganalisis minat karier dan preferensi lingkungan kerja</p>
              <div className="text-xs text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-full inline-block">
                Dimensi: Minat & Motivasi
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 text-center transition-all duration-300">
              <div className="w-14 h-14 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">OCEAN Personality</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">Mengukur trait kepribadian fundamental</p>
              <div className="text-xs text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-full inline-block">
                Dimensi: Kepribadian & Perilaku
              </div>
            </div>
          </div>

          {/* Integration Flow */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-6 text-center">Bagaimana Ketiga Assessment Bekerja Sama</h4>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center mr-4 flex-shrink-0 mt-0.5">
                  <span className="text-sm font-semibold text-gray-700">1</span>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-1">Triangulasi Data</h5>
                  <p className="text-sm text-gray-600 leading-relaxed">Setiap assessment memberikan perspektif unik yang saling memvalidasi dan memperkuat akurasi hasil analisis.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center mr-4 flex-shrink-0 mt-0.5">
                  <span className="text-sm font-semibold text-gray-700">2</span>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-1">Analisis Holistik</h5>
                  <p className="text-sm text-gray-600 leading-relaxed">Kombinasi karakter, minat, dan kepribadian memberikan gambaran lengkap tentang potensi dan preferensi karier Anda.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center mr-4 flex-shrink-0 mt-0.5">
                  <span className="text-sm font-semibold text-gray-700">3</span>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-1">Rekomendasi Terintegrasi</h5>
                  <p className="text-sm text-gray-600 leading-relaxed">Hasil akhir berupa persona karier yang menggabungkan insights dari ketiga dimensi untuk memberikan panduan yang akurat dan actionable.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AssessmentRelation;