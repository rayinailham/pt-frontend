import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AssessmentExplanations = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const assessmentInfo = {
    overview: {
      title: "Memahami Hasil Assessment Anda",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Pemetaan talenta ini menggabungkan tiga kerangka kerja yang telah tervalidasi secara ilmiah dan digunakan oleh profesesional
            untuk memberikan gambaran komprehensif tentang kepribadian, minat, dan kekuatan karakter Anda.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h4 className="font-semibold text-indigo-900 mb-2">RIASEC</h4>
              <p className="text-sm text-indigo-800">Minat karier dan preferensi lingkungan kerja</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Big Five (OCEAN)</h4>
              <p className="text-sm text-purple-800">Trait kepribadian inti dan kecenderungan perilaku</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">VIA Strengths</h4>
              <p className="text-sm text-blue-800">Kekuatan karakter dan kualitas positif</p>
            </div>
          </div>
        </div>
      )
    },
    riasec: {
      title: "RIASEC Holland Codes",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Dikembangkan oleh psikolog John Holland, model RIASEC mengidentifikasi enam tipe kepribadian
            yang berkorespondensi dengan lingkungan kerja dan jalur karier yang berbeda.
          </p>
          <div className="space-y-3">
            <div className="border-l-4 border-indigo-500 pl-4">
              <h4 className="font-semibold text-gray-900">Cara menginterpretasi skor Anda:</h4>
              <ul className="text-sm text-gray-700 mt-2 space-y-1">
                <li>• <strong>High scores (70-100):</strong> Preferensi kuat dan kesesuaian alami</li>
                <li>• <strong>Medium scores (30-69):</strong> Minat dan kemampuan moderat</li>
                <li>• <strong>Low scores (0-29):</strong> Minat atau preferensi terbatas</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Holland Code Anda</h4>
              <p className="text-sm text-gray-700">
                3 skor tertinggi Anda membentuk "Holland Code" - kombinasi tiga huruf yang merepresentasikan
                minat karier utama Anda. Kode ini dapat membantu memandu eksplorasi dan pengambilan keputusan karier.
              </p>
            </div>
          </div>
        </div>
      )
    },
    ocean: {
      title: "Big Five (OCEAN) Personality",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Model Big Five adalah kerangka kepribadian yang paling diterima secara luas dalam psikologi,
            mengukur lima dimensi luas yang relatif stabil sepanjang hidup.
          </p>
          <div className="space-y-3">
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-gray-900">Memahami skor Anda:</h4>
              <ul className="text-sm text-gray-700 mt-2 space-y-1">
                <li>• <strong>High scores (70-100):</strong> Ekspresi kuat dari trait ini</li>
                <li>• <strong>Medium scores (30-69):</strong> Ekspresi seimbang atau situasional</li>
                <li>• <strong>Low scores (0-29):</strong> Ekspresi trait yang kurang menonjol</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Tidak Ada Skor "Baik" atau "Buruk"</h4>
              <p className="text-sm text-gray-700">
                Setiap trait memiliki keunggulan dalam situasi yang berbeda. High dan low scores sama-sama
                memiliki kekuatan dan tantangan potensial. Kuncinya adalah memahami cara memanfaatkan
                kecenderungan alami Anda secara efektif.
              </p>
            </div>
          </div>
        </div>
      )
    },
    via: {
      title: "VIA Character Strengths",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Survey VIA (Values in Action) mengidentifikasi kekuatan karakter khas Anda -
            trait positif yang memberi energi dan merepresentasikan diri autentik Anda.
          </p>
          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900">Signature Strengths Anda:</h4>
              <ul className="text-sm text-gray-700 mt-2 space-y-1">
                <li>• <strong>Top 5 strengths (80-100):</strong> Kekuatan inti untuk dimanfaatkan dan dikembangkan</li>
                <li>• <strong>Middle strengths (50-79):</strong> Kekuatan yang dapat Anda andalkan saat dibutuhkan</li>
                <li>• <strong>Lesser strengths (0-49):</strong> Area untuk pertumbuhan potensial atau dukungan dari orang lain</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Menggunakan Kekuatan Anda</h4>
              <p className="text-sm text-gray-700">
                Penelitian menunjukkan bahwa orang yang secara rutin menggunakan signature strengths mereka
                lebih terlibat, berkinerja lebih baik, dan mengalami kesejahteraan yang lebih besar. Fokuslah
                untuk menemukan cara menerapkan top strengths Anda dalam pekerjaan dan kehidupan pribadi.
              </p>
            </div>
          </div>
        </div>
      )
    }
  };

  const tabs = [
    { id: 'overview', label: 'Ringkasan', icon: '📊' },
    { id: 'riasec', label: 'RIASEC', icon: '🎯' },
    { id: 'ocean', label: 'Big Five', icon: '🌊' },
    { id: 'via', label: 'VIA Strengths', icon: '💪' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {assessmentInfo[activeTab].title}
            </h3>
            {assessmentInfo[activeTab].content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Quick Tips */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">💡 Tips Cepat</h4>
            <p className="text-sm text-gray-600 mt-1">
              {activeTab === 'overview' && "Arahkan kursor ke elemen chart untuk melihat penjelasan detail dan saran karier."}
              {activeTab === 'riasec' && "Cari karier yang sesuai dengan 2-3 kode RIASEC teratas Anda untuk kesesuaian terbaik."}
              {activeTab === 'ocean' && "Pertimbangkan bagaimana trait kepribadian Anda selaras dengan lingkungan kerja dan dinamika tim yang berbeda."}
              {activeTab === 'via' && "Cobalah gunakan top 5 character strengths Anda setiap hari untuk meningkatkan kepuasan dan performa."}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AssessmentExplanations;
