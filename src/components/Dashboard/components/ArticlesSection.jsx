import { User, BarChart3, Activity, CheckCircle, Coins, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const ArticlesSection = ({ loading }) => {
  const articles = [
    {
      id: 1,
      title: 'Mengenal Kepribadian Anda',
      subtitle: 'Panduan Dasar',
      description: 'Pelajari bagaimana memahami tipe kepribadian Anda melalui assessment Big Five dan RIASEC untuk pengembangan karir yang optimal.',
      readTime: '5 min read',
      icon: User,
      gradient: 'from-indigo-500 to-indigo-600',
      bgGradient: 'from-white to-white',
      hoverGradient: 'from-gray-50 to-gray-50'
    },
    {
      id: 2,
      title: 'Strategi Pengembangan Karir',
      subtitle: 'Tips Profesional',
      description: 'Temukan strategi efektif untuk mengembangkan karir berdasarkan hasil assessment talenta dan kekuatan karakter Anda.',
      readTime: '7 min read',
      icon: BarChart3,
      gradient: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-white to-white',
      hoverGradient: 'from-gray-50 to-gray-50'
    },
    {
      id: 3,
      title: 'Memaksimalkan Kekuatan VIA',
      subtitle: 'Character Strengths',
      description: 'Pelajari cara mengidentifikasi dan mengoptimalkan 24 kekuatan karakter VIA untuk meningkatkan performa dan kepuasan hidup.',
      readTime: '6 min read',
      icon: Activity,
      gradient: 'from-slate-500 to-slate-600',
      bgGradient: 'from-white to-white',
      hoverGradient: 'from-gray-50 to-gray-50'
    },
    {
      id: 4,
      title: 'Tips Sukses Assessment',
      subtitle: 'Best Practices',
      description: 'Panduan lengkap untuk mendapatkan hasil assessment yang akurat dan bermakna untuk pengembangan diri Anda.',
      readTime: '4 min read',
      icon: CheckCircle,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-white to-white',
      hoverGradient: 'from-gray-50 to-gray-50'
    },
    {
      id: 5,
      title: 'Perencanaan Keuangan Karir',
      subtitle: 'Financial Planning',
      description: 'Strategi mengelola keuangan dan investasi untuk mendukung perjalanan karir dan pengembangan talenta jangka panjang.',
      readTime: '8 min read',
      icon: Coins,
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-white to-white',
      hoverGradient: 'from-gray-50 to-gray-50'
    },
    {
      id: 6,
      title: 'Work-Life Balance',
      subtitle: 'Lifestyle Tips',
      description: 'Temukan keseimbangan ideal antara pengembangan karir dan kehidupan personal untuk mencapai kesuksesan holistik.',
      readTime: '6 min read',
      icon: Clock,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-white to-white',
      hoverGradient: 'from-gray-50 to-gray-50'
    }
  ];

  if (loading.initial) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="mt-8"
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/50 shadow-sm">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100/50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl mr-3 shadow-sm">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            Artikel & Tips Pengembangan Talenta
          </h3>
        </div>

        {/* Articles Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`bg-gradient-to-br ${article.bgGradient} hover:${article.hoverGradient} rounded-2xl p-6 cursor-pointer transition-all duration-200 border border-gray-200/60 hover:border-gray-300/80 hover:shadow-md shadow-sm group`}
              >
                {/* Icon & Header */}
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${article.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                    <article.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-semibold text-gray-900 group-hover:text-gray-800 transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-xs text-gray-600">{article.subtitle}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  {article.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">{article.readTime}</span>
                  <div className="flex items-center text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* View All Button */}
          <div className="mt-8 text-center">
            <button className="inline-flex items-center px-6 py-3 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white/80 hover:bg-gray-50/80 transition-all duration-200 shadow-sm hover:shadow-sm hover:border-gray-300">
              Lihat Semua Artikel
              <BookOpen className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ArticlesSection;
