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
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-700'
    },
    {
      id: 2,
      title: 'Strategi Pengembangan Karir',
      subtitle: 'Tips Profesional',
      description: 'Temukan strategi efektif untuk mengembangkan karir berdasarkan hasil assessment talenta dan kekuatan karakter Anda.',
      readTime: '7 min read',
      icon: BarChart3,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-700'
    },
    {
      id: 3,
      title: 'Memaksimalkan Kekuatan VIA',
      subtitle: 'Character Strengths',
      description: 'Pelajari cara mengidentifikasi dan mengoptimalkan 24 kekuatan karakter VIA untuk meningkatkan performa dan kepuasan hidup.',
      readTime: '6 min read',
      icon: Activity,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-700'
    },
    {
      id: 4,
      title: 'Tips Sukses Assessment',
      subtitle: 'Best Practices',
      description: 'Panduan lengkap untuk mendapatkan hasil assessment yang akurat dan bermakna untuk pengembangan diri Anda.',
      readTime: '4 min read',
      icon: CheckCircle,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-700'
    },
    {
      id: 5,
      title: 'Perencanaan Keuangan Karir',
      subtitle: 'Financial Planning',
      description: 'Strategi mengelola keuangan dan investasi untuk mendukung perjalanan karir dan pengembangan talenta jangka panjang.',
      readTime: '8 min read',
      icon: Coins,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-700'
    },
    {
      id: 6,
      title: 'Work-Life Balance',
      subtitle: 'Lifestyle Tips',
      description: 'Temukan keseimbangan ideal antara pengembangan karir dan kehidupan personal untuk mencapai kesuksesan holistik.',
      readTime: '6 min read',
      icon: Clock,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-700'
    }
  ];

  if (loading.initial) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white hover:bg-slate-50 rounded-md p-6 cursor-pointer transition-all duration-200 border border-slate-200/60 hover:border-slate-300 hover:shadow-md shadow-sm group"
          >
            {/* Icon & Header */}
            <div className="flex items-center mb-4">
              <div className={`w-12 h-12 ${article.iconBg} rounded-md flex items-center justify-center`}>
                <article.icon className={`h-6 w-6 ${article.iconColor}`} />
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-slate-800 transition-colors">
                  {article.title}
                </h4>
                <p className="text-xs text-slate-600">{article.subtitle}</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-700 mb-4 leading-relaxed">
              {article.description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">{article.readTime}</span>
              <div className="flex items-center text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                <span>Baca Selengkapnya</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View All Button */}
      <div className="mt-8 text-center">
        <button className="inline-flex items-center px-6 py-3 border border-slate-200 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-all duration-200 shadow-sm hover:border-slate-300">
          Lihat Semua Artikel
          <BookOpen className="ml-2 h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default ArticlesSection;
