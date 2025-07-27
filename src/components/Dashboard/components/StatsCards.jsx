import { CheckCircle, Clock, Coins, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const StatsCards = ({ data, loading, statusCounts }) => {
  const cards = [
    {
      title: 'Token Balance',
      value: loading.tokenBalance ? null : (data.tokenBalance?.token_balance || 0),
      icon: Coins,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'from-amber-50 to-orange-50',
      textColor: 'text-amber-700',
      loading: loading.tokenBalance
    },
    {
      title: 'Completed',
      value: loading.results ? null : statusCounts.completed,
      icon: CheckCircle,
      color: 'from-emerald-500 to-green-500',
      bgColor: 'from-emerald-50 to-green-50',
      textColor: 'text-emerald-700',
      loading: loading.results
    },
    {
      title: 'Processing',
      value: loading.results ? null : statusCounts.processing,
      icon: Clock,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'from-blue-50 to-indigo-50',
      textColor: 'text-blue-700',
      loading: loading.results
    },
    {
      title: 'Failed',
      value: loading.results ? null : statusCounts.failed,
      icon: XCircle,
      color: 'from-red-500 to-rose-500',
      bgColor: 'from-red-50 to-rose-50',
      textColor: 'text-red-700',
      loading: loading.results
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="relative overflow-hidden"
        >
          <div className={`bg-gradient-to-br ${card.bgColor} rounded-2xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-all duration-300`}>
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-10">
              <div className={`w-24 h-24 bg-gradient-to-br ${card.color} rounded-full`}></div>
            </div>
            
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {card.title}
                  </p>
                  {card.loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-pulse h-8 bg-gray-200/60 rounded-lg w-16"></div>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-transparent"></div>
                    </div>
                  ) : (
                    <motion.p
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className={`text-3xl font-bold ${card.textColor}`}
                    >
                      {card.value?.toLocaleString() || '0'}
                    </motion.p>
                  )}
                </div>
                
                <div className={`p-3 bg-gradient-to-br ${card.color} rounded-xl shadow-lg`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;
