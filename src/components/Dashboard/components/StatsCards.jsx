import { CheckCircle, Coins, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

const StatsCards = ({ data, loading, statusCounts }) => {
  const cards = [
    {
      title: 'Token Balance',
      value: loading.tokenBalance ? null : (data.tokenBalance?.token_balance || 0),
      icon: Coins,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-700',
      textColor: 'text-slate-900',
      loading: loading.tokenBalance
    },
    {
      title: 'Completed',
      value: loading.results ? null : statusCounts.completed,
      icon: CheckCircle,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-700',
      textColor: 'text-emerald-700',
      loading: loading.results
    },
    {
      title: 'Processing',
      value: loading.results ? null : statusCounts.processing,
      icon: Loader,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-700',
      textColor: 'text-blue-700',
      loading: loading.results
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="relative overflow-hidden"
        >
          <div className="bg-white rounded-md p-4 md:p-6 border border-slate-300 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs md:text-sm font-medium text-slate-600 mb-2 md:mb-3">
                  {card.title}
                </p>
                {card.loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse h-8 bg-slate-200/60 rounded w-16"></div>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-300 border-t-transparent"></div>
                  </div>
                ) : (
                  <motion.p
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className={`text-2xl md:text-3xl font-bold ${card.textColor}`}
                  >
                    {card.value?.toLocaleString() || '0'}
                  </motion.p>
                )}
              </div>

              <div className={`p-2 md:p-3 ${card.iconBg} rounded-md`}>
                <card.icon className={`h-5 w-5 md:h-6 md:w-6 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;
