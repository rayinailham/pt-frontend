import { useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

const OceanBarChart = ({ data }) => {
  const [showExplanation, setShowExplanation] = useState(false);

  // Transform OCEAN data for bar chart
  const chartData = data ? [
    { 
      trait: 'Openness', 
      value: data.openness || 0, 
      fullName: 'Openness to Experience',
      color: '#8b5cf6'
    },
    { 
      trait: 'Conscientiousness', 
      value: data.conscientiousness || 0, 
      fullName: 'Conscientiousness',
      color: '#06b6d4'
    },
    { 
      trait: 'Extraversion', 
      value: data.extraversion || 0, 
      fullName: 'Extraversion',
      color: '#10b981'
    },
    { 
      trait: 'Agreeableness', 
      value: data.agreeableness || 0, 
      fullName: 'Agreeableness',
      color: '#f59e0b'
    },
    { 
      trait: 'Neuroticism', 
      value: data.neuroticism || 0, 
      fullName: 'Neuroticism',
      color: '#ef4444'
    }
  ] : [];

  const oceanExplanations = {
    openness: {
      title: "Openness to Experience",
      description: "Mencerminkan imajinasi, kreativitas, dan kemauan untuk mencoba hal-hal baru.",
      high: "Kreatif, ingin tahu, berpikiran terbuka, menikmati variasi dan pengalaman baru",
      low: "Praktis, konvensional, lebih suka rutinitas dan pengalaman yang familiar",
      careers: ["Artist", "Researcher", "Consultant", "Entrepreneur"]
    },
    conscientiousness: {
      title: "Conscientiousness",
      description: "Mengukur organisasi, tanggung jawab, dan disiplin diri.",
      high: "Terorganisir, dapat diandalkan, pekerja keras, berorientasi pada tujuan, disiplin",
      low: "Fleksibel, spontan, mungkin kesulitan dengan deadline dan organisasi",
      careers: ["Manager", "Accountant", "Engineer", "Administrator"]
    },
    extraversion: {
      title: "Extraversion",
      description: "Menunjukkan tingkat energi, sosiabilitas, dan ketegasan.",
      high: "Ramah, energik, banyak bicara, menikmati situasi sosial",
      low: "Pendiam, tenang, lebih suka kesendirian, berpikir sebelum berbicara",
      careers: ["Sales", "Teacher", "Public Relations", "Event Coordinator"]
    },
    agreeableness: {
      title: "Agreeableness",
      description: "Mencerminkan kerjasama, kepercayaan, dan perhatian terhadap orang lain.",
      high: "Kooperatif, percaya, suka membantu, empatik, berorientasi tim",
      low: "Kompetitif, skeptis, langsung, independen, analitis",
      careers: ["Counselor", "Social Worker", "Nurse", "Human Resources"]
    },
    neuroticism: {
      title: "Neuroticism",
      description: "Mengukur stabilitas emosional dan manajemen stres.",
      high: "Sensitif terhadap stres, mengalami emosi yang kuat, mungkin sering khawatir",
      low: "Tenang, stabil secara emosional, tangguh, menangani stres dengan baik",
      careers: ["Crisis Management", "Emergency Services", "Leadership Roles"]
    }
  };

  const getScoreLevel = (score) => {
    if (score >= 70) return { level: 'High', color: 'text-green-600' };
    if (score >= 30) return { level: 'Medium', color: 'text-yellow-600' };
    return { level: 'Low', color: 'text-red-600' };
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const traitKey = label.toLowerCase();
      const explanation = oceanExplanations[traitKey];
      const scoreLevel = getScoreLevel(data.value);

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-sm"
        >
          <h4 className="font-semibold text-gray-900 mb-2">{explanation?.title}</h4>
          <p className="text-sm text-gray-600 mb-3">{explanation?.description}</p>
          <div className="flex items-center gap-2 mb-2">
            <div className="text-lg font-bold" style={{ color: data.payload.color }}>
              Skor Anda: {data.value}
            </div>
            <span className={`text-sm font-medium ${scoreLevel.color}`}>
              ({scoreLevel.level})
            </span>
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <div><strong>High scores:</strong> {explanation?.high}</div>
            <div><strong>Low scores:</strong> {explanation?.low}</div>
            <div><strong>Karier terkait:</strong> {explanation?.careers.join(', ')}</div>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  if (!data) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Big Five (OCEAN) Personality</h3>
        <p className="text-gray-600">No OCEAN data available.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
    >
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Big Five (OCEAN) Personality</h3>
      </div>

      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="mb-6 p-4 bg-purple-50 rounded-lg"
      >
        <h4 className="font-semibold text-purple-900 mb-2">Tentang Big Five</h4>
        <p className="text-sm text-purple-800 mb-3">
          Model Big Five adalah kerangka kepribadian yang paling diterima secara luas dalam psikologi.
          Model ini mengukur lima dimensi luas kepribadian yang relatif stabil sepanjang hidup.
        </p>
        <div className="text-xs text-purple-700 mb-3">
          <strong>Interpretasi Skor:</strong> High (70-100) | Medium (30-69) | Low (0-29)
        </div>
        <div className="grid grid-cols-1 gap-3 text-xs">
          {Object.entries(oceanExplanations).map(([key, explanation]) => {
            const userScore = data?.[key] || 0;
            const scoreLevel = getScoreLevel(userScore);
            return (
              <div key={key} className="bg-white p-3 rounded border">
                <div className="flex justify-between items-start mb-1">
                  <strong className="text-purple-900">{explanation.title}:</strong>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-purple-600">{userScore}</span>
                    <span className={`text-xs ${scoreLevel.color}`}>({scoreLevel.level})</span>
                  </div>
                </div>
                <p className="text-gray-700">{explanation.description}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="trait" 
              tick={{ fontSize: 12, fill: '#374151' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#6b7280' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3">
        {chartData.map((item, index) => (
          <motion.div
            key={item.trait}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="text-center p-3 bg-gray-50 rounded"
          >
            <div 
              className="text-lg font-bold mb-1" 
              style={{ color: item.color }}
            >
              {item.value}
            </div>
            <div className="text-xs text-gray-600 font-medium">{item.trait}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default OceanBarChart;
