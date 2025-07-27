import { useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { viaCategories, strengthLabels } from '../../data/via';

const ViaisChart = ({ data }) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');



  const getScoreLevel = (score) => {
    if (score >= 80) return { level: 'Top Strength', color: 'text-green-600' };
    if (score >= 50) return { level: 'Middle Strength', color: 'text-yellow-600' };
    return { level: 'Lesser Strength', color: 'text-red-600' };
  };



  // Transform VIA data for chart
  const getChartData = () => {
    if (!data) return [];
    
    const allStrengths = Object.entries(data).map(([key, value]) => ({
      name: strengthLabels[key] || key,
      value: value || 0,
      key: key,
      category: Object.entries(viaCategories).find(([_, cat]) => 
        cat.strengths.includes(key)
      )?.[0] || 'other'
    }));

    if (selectedCategory === 'all') {
      return allStrengths.sort((a, b) => b.value - a.value);
    }

    return allStrengths
      .filter(strength => strength.category === selectedCategory)
      .sort((a, b) => b.value - a.value);
  };

  const chartData = getChartData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const categoryInfo = viaCategories[data.payload.category];
      const scoreLevel = getScoreLevel(data.value);

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-xs"
        >
          <h4 className="font-semibold text-gray-900 mb-2">{label}</h4>
          <div className="flex items-center gap-2 mb-2">
            <div className="text-lg font-bold" style={{ color: categoryInfo?.color }}>
              Skor Anda: {data.value}
            </div>
            <span className={`text-sm font-medium ${scoreLevel.color}`}>
              ({scoreLevel.level})
            </span>
          </div>
          <div className="text-xs text-gray-500">
            <strong>Kategori:</strong> {categoryInfo?.name}
          </div>
        </motion.div>
      );
    }
    return null;
  };

  if (!data) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">VIA Character Strengths</h3>
        <p className="text-gray-600">No VIA data available.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
    >
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">VIA Character Strengths</h3>
      </div>

      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="mb-6 p-4 bg-blue-50 rounded-lg"
      >
        <h4 className="font-semibold text-blue-900 mb-2">Tentang VIA Character Strengths</h4>
        <p className="text-sm text-blue-800 mb-3">
          Survey VIA (Values in Action) mengidentifikasi kekuatan karakter teratas Anda di antara 24 kekuatan
          yang diorganisir ke dalam 6 kategori kebajikan. Kekuatan ini merepresentasikan trait positif inti Anda.
        </p>
        <div className="text-xs text-blue-700 mb-3">
          <strong>Interpretasi Skor:</strong> Top Strength (80-100) | Middle Strength (50-79) | Lesser Strength (0-49)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {Object.entries(viaCategories).map(([key, category]) => (
            <div key={key} className="bg-white p-2 rounded border">
              <strong style={{ color: category.color }}>{category.name}:</strong>
              <span className="text-gray-700 ml-1">
                {category.strengths.map(s => strengthLabels[s]).join(', ')}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Category Filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            selectedCategory === 'all' 
              ? 'bg-gray-800 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Strengths
        </button>
        {Object.entries(viaCategories).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === key 
                ? 'text-white' 
                : 'text-gray-700 hover:opacity-80'
            }`}
            style={{ 
              backgroundColor: selectedCategory === key ? category.color : '#f3f4f6',
              borderColor: category.color,
              borderWidth: '1px'
            }}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10, fill: '#374151' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#6b7280' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top Strengths Summary */}
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">
          Top {selectedCategory === 'all' ? '5' : '3'} Strengths
          {selectedCategory !== 'all' && ` in ${viaCategories[selectedCategory].name}`}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {chartData.slice(0, selectedCategory === 'all' ? 5 : 3).map((item, index) => {
            const categoryInfo = viaCategories[item.category];
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center p-3 bg-gray-50 rounded border"
              >
                <div 
                  className="text-lg font-bold mb-1" 
                  style={{ color: categoryInfo?.color }}
                >
                  {item.value}
                </div>
                <div className="text-xs text-gray-600 font-medium">{item.name}</div>
                <div className="text-xs text-gray-500 mt-1">{categoryInfo?.name}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default ViaisChart;
