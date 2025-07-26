import { useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend } from 'recharts';

const RiasecRadarChart = ({ data }) => {
  const [showExplanation, setShowExplanation] = useState(false);

  // Transform RIASEC data for radar chart
  const chartData = data ? [
    { trait: 'Realistic', value: data.realistic || 0, fullName: 'Realistic (Doer)' },
    { trait: 'Investigative', value: data.investigative || 0, fullName: 'Investigative (Thinker)' },
    { trait: 'Artistic', value: data.artistic || 0, fullName: 'Artistic (Creator)' },
    { trait: 'Social', value: data.social || 0, fullName: 'Social (Helper)' },
    { trait: 'Enterprising', value: data.enterprising || 0, fullName: 'Enterprising (Persuader)' },
    { trait: 'Conventional', value: data.conventional || 0, fullName: 'Conventional (Organizer)' }
  ] : [];

  const riasecExplanations = {
    realistic: {
      title: "Realistic (Doer)",
      description: "Lebih suka pekerjaan praktis, aktivitas langsung, dan bekerja dengan alat, mesin, atau hewan.",
      careers: ["Engineer", "Mechanic", "Farmer", "Carpenter", "Pilot"]
    },
    investigative: {
      title: "Investigative (Thinker)",
      description: "Menikmati penelitian, analisis, dan memecahkan masalah kompleks melalui investigasi sistematis.",
      careers: ["Scientist", "Researcher", "Doctor", "Analyst", "Programmer"]
    },
    artistic: {
      title: "Artistic (Creator)",
      description: "Menghargai kreativitas, ekspresi diri, dan bekerja dalam lingkungan yang tidak terstruktur.",
      careers: ["Designer", "Writer", "Artist", "Musician", "Actor"]
    },
    social: {
      title: "Social (Helper)",
      description: "Lebih suka membantu, mengajar, dan bekerja dengan orang untuk memecahkan masalah.",
      careers: ["Teacher", "Counselor", "Social Worker", "Nurse", "Therapist"]
    },
    enterprising: {
      title: "Enterprising (Persuader)",
      description: "Menikmati memimpin, membujuk, dan mengelola orang lain untuk mencapai tujuan.",
      careers: ["Manager", "Sales Rep", "Entrepreneur", "Lawyer", "Executive"]
    },
    conventional: {
      title: "Conventional (Organizer)",
      description: "Lebih suka pekerjaan terstruktur, mengikuti prosedur, dan mengorganisir data.",
      careers: ["Accountant", "Administrator", "Banker", "Secretary", "Clerk"]
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
      const explanation = riasecExplanations[traitKey];
      const scoreLevel = getScoreLevel(data.value);

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-xs"
        >
          <h4 className="font-semibold text-gray-900 mb-2">{explanation?.title}</h4>
          <p className="text-sm text-gray-600 mb-2">{explanation?.description}</p>
          <div className="flex items-center gap-2 mb-2">
            <div className="text-lg font-bold text-indigo-600">
              Skor Anda: {data.value}
            </div>
            <span className={`text-sm font-medium ${scoreLevel.color}`}>
              ({scoreLevel.level})
            </span>
          </div>
          <div className="text-xs text-gray-500">
            <strong>Karier umum:</strong> {explanation?.careers.join(', ')}
          </div>
        </motion.div>
      );
    }
    return null;
  };

  if (!data) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">RIASEC Holland Codes</h3>
        <p className="text-gray-600">No RIASEC data available.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
    >
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">RIASEC Holland Codes</h3>
      </div>

      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="mb-6 p-4 bg-indigo-50 rounded-lg"
      >
        <h4 className="font-semibold text-indigo-900 mb-2">Tentang RIASEC</h4>
        <p className="text-sm text-indigo-800 mb-3">
          Model RIASEC, dikembangkan oleh psikolog John Holland, mengkategorikan orang dan lingkungan kerja
          ke dalam enam tipe. Skor Anda menunjukkan preferensi dan kekuatan di setiap area.
        </p>
        <div className="text-xs text-indigo-700 mb-3">
          <strong>Interpretasi Skor:</strong> High (70-100) | Medium (30-69) | Low (0-29)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {Object.entries(riasecExplanations).map(([key, explanation]) => {
            const userScore = data?.[key] || 0;
            const scoreLevel = getScoreLevel(userScore);
            return (
              <div key={key} className="bg-white p-2 rounded border">
                <div className="flex justify-between items-start mb-1">
                  <strong className="text-indigo-900">{explanation.title}:</strong>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-indigo-600">{userScore}</span>
                    <span className={`text-xs ${scoreLevel.color}`}>({scoreLevel.level})</span>
                  </div>
                </div>
                <span className="text-gray-700">{explanation.description}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis 
              dataKey="trait" 
              tick={{ fontSize: 12, fill: '#374151' }}
              className="text-sm font-medium"
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              tick={{ fontSize: 10, fill: '#6b7280' }}
            />
            <Radar
              name="RIASEC Scores"
              dataKey="value"
              stroke="#4f46e5"
              fill="#4f46e5"
              fillOpacity={0.2}
              strokeWidth={2}
              dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4 }}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
        {chartData.map((item, index) => (
          <motion.div
            key={item.trait}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="text-center p-2 bg-gray-50 rounded"
          >
            <div className="text-lg font-bold text-indigo-600">{item.value}</div>
            <div className="text-xs text-gray-600">{item.trait}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RiasecRadarChart;
