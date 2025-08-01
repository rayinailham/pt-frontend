/**
 * Comprehensive Industry Data
 * Includes descriptions, top companies, and requirements for each industry
 * Based on INDUSTRY.md documentation
 */

// Industry requirements from INDUSTRY.md
export const industryRequirements = {
  teknologi: {
    riasec: { investigative: 0.5, realistic: 0.3, conventional: 0.2 },
    via: { loveOfLearning: 0.3, curiosity: 0.3, perseverance: 0.2, creativity: 0.2 },
    ocean: { openness: 0.6, conscientiousness: 0.4 }
  },
  kesehatan: {
    riasec: { investigative: 0.5, social: 0.5 },
    via: { kindness: 0.4, judgment: 0.3, zest: 0.2, loveOfLearning: 0.1 },
    ocean: { conscientiousness: 0.6, agreeableness: 0.4 }
  },
  keuangan: {
    riasec: { conventional: 0.6, enterprising: 0.4 },
    via: { prudence: 0.4, judgment: 0.3, fairness: 0.2, leadership: 0.1 },
    ocean: { conscientiousness: 0.7, neuroticism: -0.3 }
  },
  pendidikan: {
    riasec: { social: 0.6, artistic: 0.4 },
    via: { loveOfLearning: 0.3, socialIntelligence: 0.3, leadership: 0.2, creativity: 0.2 },
    ocean: { extraversion: 0.5, agreeableness: 0.5 }
  },
  rekayasa: {
    riasec: { realistic: 0.6, investigative: 0.4 },
    via: { perseverance: 0.3, teamwork: 0.3, prudence: 0.2, creativity: 0.2 },
    ocean: { conscientiousness: 0.8, neuroticism: -0.2 }
  },
  pemasaran: {
    riasec: { enterprising: 0.5, artistic: 0.5 },
    via: { creativity: 0.4, socialIntelligence: 0.3, zest: 0.2, perspective: 0.1 },
    ocean: { extraversion: 0.6, openness: 0.4 }
  },
  hukum: {
    riasec: { investigative: 0.5, enterprising: 0.5 },
    via: { judgment: 0.4, fairness: 0.3, perseverance: 0.3 },
    ocean: { conscientiousness: 0.7, neuroticism: -0.3 }
  },
  kreatif: {
    riasec: { artistic: 0.7, realistic: 0.3 },
    via: { creativity: 0.5, appreciationOfBeauty: 0.3, bravery: 0.1, zest: 0.1 },
    ocean: { openness: 0.8, conscientiousness: -0.2 }
  },
  media: {
    riasec: { artistic: 0.4, social: 0.3, enterprising: 0.3 },
    via: { creativity: 0.4, socialIntelligence: 0.3, curiosity: 0.3 },
    ocean: { extraversion: 0.5, openness: 0.5 }
  },
  penjualan: {
    riasec: { enterprising: 0.7, social: 0.3 },
    via: { zest: 0.3, socialIntelligence: 0.3, perseverance: 0.2, hope: 0.2 },
    ocean: { extraversion: 0.7, conscientiousness: 0.3 }
  },
  sains: {
    riasec: { investigative: 1.0 },
    via: { curiosity: 0.4, loveOfLearning: 0.3, perseverance: 0.2, hope: 0.1 },
    ocean: { openness: 0.6, conscientiousness: 0.4 }
  },
  manufaktur: {
    riasec: { realistic: 0.7, conventional: 0.3 },
    via: { teamwork: 0.4, perseverance: 0.3, prudence: 0.3 },
    ocean: { conscientiousness: 1.0 }
  },
  agrikultur: {
    riasec: { realistic: 1.0 },
    via: { perseverance: 0.5, love: 0.3, gratitude: 0.2 },
    ocean: { conscientiousness: 0.7, neuroticism: -0.3 }
  },
  pemerintahan: {
    riasec: { conventional: 0.5, social: 0.5 },
    via: { fairness: 0.4, teamwork: 0.3, prudence: 0.2, leadership: 0.1 },
    ocean: { conscientiousness: 0.6, agreeableness: 0.4 }
  },
  konsultasi: {
    riasec: { enterprising: 0.5, investigative: 0.5 },
    via: { judgment: 0.3, perspective: 0.3, socialIntelligence: 0.2, leadership: 0.2 },
    ocean: { extraversion: 0.4, conscientiousness: 0.3, openness: 0.3 }
  },
  pariwisata: {
    riasec: { social: 0.5, enterprising: 0.3, realistic: 0.2 },
    via: { socialIntelligence: 0.4, kindness: 0.3, zest: 0.2, teamwork: 0.1 },
    ocean: { extraversion: 0.6, agreeableness: 0.4 }
  },
  logistik: {
    riasec: { conventional: 0.5, realistic: 0.5 },
    via: { prudence: 0.5, teamwork: 0.3, perseverance: 0.2 },
    ocean: { conscientiousness: 1.0 }
  },
  energi: {
    riasec: { realistic: 0.6, investigative: 0.4 },
    via: { prudence: 0.4, teamwork: 0.3, judgment: 0.3 },
    ocean: { conscientiousness: 0.8, neuroticism: -0.2 }
  },
  sosial: {
    riasec: { social: 0.7, enterprising: 0.3 },
    via: { kindness: 0.4, fairness: 0.3, hope: 0.2, leadership: 0.1 },
    ocean: { agreeableness: 0.6, extraversion: 0.4 }
  },
  olahraga: {
    riasec: { realistic: 0.4, social: 0.3, enterprising: 0.3 },
    via: { zest: 0.4, perseverance: 0.3, teamwork: 0.2, leadership: 0.1 },
    ocean: { extraversion: 0.6, conscientiousness: 0.4 }
  },
  properti: {
    riasec: { enterprising: 1.0 },
    via: { socialIntelligence: 0.4, zest: 0.3, perseverance: 0.3 },
    ocean: { extraversion: 0.7, conscientiousness: 0.3 }
  },
  kuliner: {
    riasec: { artistic: 0.4, realistic: 0.3, enterprising: 0.3 },
    via: { creativity: 0.4, zest: 0.3, kindness: 0.2, teamwork: 0.1 },
    ocean: { extraversion: 0.5, agreeableness: 0.5 }
  },
  perdagangan: {
    riasec: { enterprising: 0.4, conventional: 0.3, social: 0.3 },
    via: { socialIntelligence: 0.4, zest: 0.3, prudence: 0.2, fairness: 0.1 },
    ocean: { extraversion: 0.6, conscientiousness: 0.4 }
  },
  telekomunikasi: {
    riasec: { realistic: 0.4, investigative: 0.3, enterprising: 0.3 },
    via: { teamwork: 0.4, perseverance: 0.3, curiosity: 0.2, judgment: 0.1 },
    ocean: { conscientiousness: 0.5, openness: 0.5 }
  }
};

// Industry descriptions and information
export const industryInfo = {
  teknologi: {
    name: 'Teknologi',
    description: 'Industri yang berfokus pada pengembangan, implementasi, dan pemeliharaan sistem teknologi informasi, software, hardware, dan solusi digital.',
    howItWorks: 'Melibatkan riset, pengembangan produk, coding, testing, deployment, dan maintenance sistem teknologi. Tim bekerja dalam metodologi agile dengan siklus pengembangan yang cepat.',
    topCompanies: ['Gojek', 'Tokopedia', 'Traveloka', 'Bukalapak', 'OVO', 'Grab Indonesia', 'Shopee', 'Blibli', 'Microsoft Indonesia', 'Google Indonesia']
  },
  kesehatan: {
    name: 'Kesehatan',
    description: 'Industri yang menyediakan layanan medis, perawatan kesehatan, penelitian medis, dan produk farmasi untuk meningkatkan kualitas hidup masyarakat.',
    howItWorks: 'Meliputi diagnosis, pengobatan, pencegahan penyakit, riset medis, dan produksi obat-obatan. Bekerja dengan standar ketat dan regulasi kesehatan yang ketat.',
    topCompanies: ['Siloam Hospitals', 'Mayapada Healthcare', 'Mitra Keluarga', 'Kimia Farma', 'Kalbe Farma', 'Bio Farma', 'Prodia', 'Hermina Hospital', 'RS Pondok Indah', 'Halodoc']
  },
  keuangan: {
    name: 'Keuangan',
    description: 'Industri yang mengelola uang, investasi, asuransi, dan layanan finansial untuk individu, perusahaan, dan pemerintah.',
    howItWorks: 'Melibatkan analisis risiko, manajemen portofolio, underwriting, trading, dan advisory. Bekerja dengan regulasi ketat dan standar compliance yang tinggi.',
    topCompanies: ['Bank Mandiri', 'BCA', 'BRI', 'BNI', 'CIMB Niaga', 'Astra Financial', 'Mandiri Sekuritas', 'BCA Sekuritas', 'Allianz Indonesia', 'AXA Mandiri']
  },
  pendidikan: {
    name: 'Pendidikan',
    description: 'Industri yang berfokus pada pengajaran, pelatihan, dan pengembangan sumber daya manusia melalui berbagai jenjang dan metode pembelajaran.',
    howItWorks: 'Meliputi kurikulum development, pengajaran, assessment, dan mentoring. Menggunakan berbagai metodologi pembelajaran dari tradisional hingga digital.',
    topCompanies: ['Universitas Indonesia', 'ITB', 'UGM', 'Ruangguru', 'Zenius', 'Kompas Gramedia', 'Erlangga', 'Sampoerna University', 'BINUS', 'Prasetiya Mulya']
  },
  rekayasa: {
    name: 'Rekayasa',
    description: 'Industri yang merancang, membangun, dan memelihara infrastruktur, sistem, dan produk teknik untuk berbagai kebutuhan masyarakat.',
    howItWorks: 'Melibatkan desain engineering, analisis struktural, project management, dan quality control. Bekerja dengan standar teknik dan keselamatan yang ketat.',
    topCompanies: ['Waskita Karya', 'Wijaya Karya', 'Adhi Karya', 'PP (Pembangunan Perumahan)', 'Hutama Karya', 'Rekayasa Industri', 'Petrosea', 'Thiess Indonesia', 'Freeport Indonesia', 'Schlumberger']
  },
  pemasaran: {
    name: 'Pemasaran',
    description: 'Industri yang berfokus pada promosi, branding, advertising, dan strategi komunikasi untuk meningkatkan awareness dan penjualan produk/jasa.',
    howItWorks: 'Meliputi market research, campaign development, content creation, media planning, dan performance analysis. Menggunakan data analytics dan creative thinking.',
    topCompanies: ['Dentsu Indonesia', 'Ogilvy Indonesia', 'JWT Indonesia', 'BBDO Indonesia', 'Hakuhodo Indonesia', 'Mirum Indonesia', 'Isobar Indonesia', 'DDB Indonesia', 'Leo Burnett', 'McCann Indonesia']
  },
  hukum: {
    name: 'Hukum',
    description: 'Industri yang menyediakan layanan legal, konsultasi hukum, dan representasi dalam berbagai aspek hukum bisnis dan personal.',
    howItWorks: 'Melibatkan legal research, case analysis, drafting dokumen, litigation, dan advisory. Bekerja dengan peraturan dan prosedur hukum yang kompleks.',
    topCompanies: ['Hadiputranto, Hadinoto & Partners', 'Makarim & Taira S.', 'Assegaf Hamzah & Partners', 'ABNR Counsellors at Law', 'Soemadipradja & Taher', 'Ali Budiardjo, Nugroho, Reksodiputro', 'Hiswara Bunjamin & Tandjung', 'Lubis Ganie Surowidjojo', 'SSEK Legal Consultants', 'Soewito Suhardiman Eddymurthy Kardono']
  },
  kreatif: {
    name: 'Kreatif',
    description: 'Industri yang menghasilkan konten kreatif, desain, seni, dan entertainment untuk berbagai media dan platform.',
    howItWorks: 'Meliputi ideation, design thinking, content production, dan creative execution. Bekerja dengan deadline ketat dan standar estetika yang tinggi.',
    topCompanies: ['MD Pictures', 'Falcon Pictures', 'Starvision Plus', 'Rapi Films', 'Visinema Pictures', 'Tzu Media', 'Ideosource Entertainment', 'Screenplay Productions', 'Soraya Intercine Films', 'Multivision Plus']
  },
  media: {
    name: 'Media',
    description: 'Industri yang memproduksi, mendistribusikan, dan menyiarkan konten informasi, hiburan, dan edukasi melalui berbagai platform media.',
    howItWorks: 'Meliputi news gathering, content production, editing, broadcasting, dan digital distribution. Bekerja dengan deadline ketat dan standar jurnalistik.',
    topCompanies: ['Kompas Gramedia', 'Media Group', 'MNC Group', 'Trans Media', 'Mahaka Media', 'Viva Media Asia', 'Tempo Inti Media', 'Jawa Pos Group', 'Femina Group', 'KapanLagi Network']
  },
  penjualan: {
    name: 'Penjualan',
    description: 'Industri yang berfokus pada aktivitas menjual produk atau jasa kepada konsumen, baik B2B maupun B2C.',
    howItWorks: 'Meliputi prospecting, lead generation, presentation, negotiation, dan closing deals. Menggunakan CRM systems dan sales methodologies.',
    topCompanies: ['Unilever Indonesia', 'Nestle Indonesia', 'Procter & Gamble', 'L\'Oreal Indonesia', 'Samsung Indonesia', 'LG Electronics', 'Astra International', 'Indomobil Group', 'Auto2000', 'Suzuki Indonesia']
  },
  sains: {
    name: 'Sains',
    description: 'Industri yang berfokus pada penelitian ilmiah, pengembangan teknologi, dan inovasi dalam berbagai bidang sains.',
    howItWorks: 'Meliputi research design, experimentation, data analysis, dan publication. Bekerja dengan metode ilmiah dan peer review process.',
    topCompanies: ['LIPI', 'BPPT', 'ITB Research', 'UI Research', 'BATAN', 'LAPAN', 'Eijkman Institute', 'Biofarma Research', 'Kalbe Research', 'Dexa Medica Research']
  },
  manufaktur: {
    name: 'Manufaktur',
    description: 'Industri yang memproduksi barang secara massal menggunakan mesin, peralatan, dan tenaga kerja dalam proses produksi yang terstruktur.',
    howItWorks: 'Meliputi production planning, quality control, supply chain management, dan continuous improvement. Menggunakan lean manufacturing dan automation.',
    topCompanies: ['Astra International', 'Indofood', 'Unilever Indonesia', 'Toyota Motor Manufacturing', 'Honda Prospect Motor', 'Yamaha Indonesia', 'Panasonic Indonesia', 'Sharp Electronics', 'Tzu Chi Indonesia', 'Mayora Indah']
  },
  agrikultur: {
    name: 'Agrikultur',
    description: 'Industri yang bergerak dalam budidaya tanaman, peternakan, dan pengolahan hasil pertanian untuk memenuhi kebutuhan pangan.',
    howItWorks: 'Meliputi land management, crop cultivation, livestock farming, dan food processing. Menggunakan teknologi modern dan sustainable practices.',
    topCompanies: ['Charoen Pokphand Indonesia', 'Japfa', 'Malindo Feedmill', 'Sinar Mas Agribusiness', 'SMART Tbk', 'Sampoerna Agro', 'London Sumatra', 'Astra Agro Lestari', 'BRI Agro', 'Medco Agro']
  },
  pemerintahan: {
    name: 'Pemerintahan',
    description: 'Sektor publik yang mengelola administrasi negara, kebijakan publik, dan pelayanan masyarakat di berbagai tingkat pemerintahan.',
    howItWorks: 'Meliputi policy making, public administration, regulatory compliance, dan public service delivery. Bekerja dengan prosedur birokrasi dan accountability.',
    topCompanies: ['Kementerian BUMN', 'Kemenkeu', 'Kemendagri', 'Kemenkes', 'Kemendikbud', 'BPS', 'BPKP', 'KPK', 'Ombudsman', 'DPR RI']
  },
  konsultasi: {
    name: 'Konsultasi',
    description: 'Industri yang menyediakan layanan advisory dan solusi strategis untuk membantu organisasi meningkatkan kinerja dan efisiensi.',
    howItWorks: 'Meliputi problem diagnosis, solution design, implementation support, dan change management. Bekerja dengan metodologi consulting dan client engagement.',
    topCompanies: ['McKinsey & Company', 'Boston Consulting Group', 'Bain & Company', 'Deloitte Consulting', 'PwC Consulting', 'EY Advisory', 'KPMG Advisory', 'Accenture', 'IBM Consulting', 'Frost & Sullivan']
  },
  pariwisata: {
    name: 'Pariwisata',
    description: 'Industri yang menyediakan layanan perjalanan, akomodasi, dan pengalaman wisata untuk domestic dan international travelers.',
    howItWorks: 'Meliputi tour planning, hospitality management, customer service, dan destination marketing. Fokus pada customer experience dan service excellence.',
    topCompanies: ['Traveloka', 'Tiket.com', 'Pegipegi', 'Garuda Indonesia', 'Lion Air Group', 'Hotel Indonesia Group', 'Archipelago International', 'Accor Hotels', 'Marriott Indonesia', 'Panorama Tours']
  },
  logistik: {
    name: 'Logistik',
    description: 'Industri yang mengelola rantai pasok, transportasi, dan distribusi barang dari produsen hingga konsumen akhir.',
    howItWorks: 'Meliputi supply chain planning, warehouse management, transportation, dan inventory control. Menggunakan teknologi tracking dan optimization.',
    topCompanies: ['JNE', 'J&T Express', 'SiCepat', 'Pos Indonesia', 'TIKI', 'Ninja Express', 'AnterAja', 'ID Express', 'RPX', 'Wahana Express']
  },
  energi: {
    name: 'Energi',
    description: 'Industri yang bergerak dalam eksplorasi, produksi, dan distribusi sumber energi seperti minyak, gas, dan energi terbarukan.',
    howItWorks: 'Meliputi exploration, drilling, refining, dan power generation. Bekerja dengan teknologi tinggi dan standar keselamatan yang ketat.',
    topCompanies: ['Pertamina', 'PLN', 'Medco Energi', 'Adaro Energy', 'Bukit Asam', 'Indika Energy', 'Perusahaan Gas Negara', 'Chevron Indonesia', 'Total E&P Indonesia', 'ExxonMobil Indonesia']
  },
  sosial: {
    name: 'Sosial',
    description: 'Sektor yang berfokus pada pelayanan sosial, pemberdayaan masyarakat, dan program-program kesejahteraan sosial.',
    howItWorks: 'Meliputi community development, social work, fundraising, dan program implementation. Bekerja dengan stakeholder dan beneficiaries.',
    topCompanies: ['Dompet Dhuafa', 'Rumah Zakat', 'PKPU Human Initiative', 'ACT (Aksi Cepat Tanggap)', 'Yayasan Dharma Bermakna', 'Save the Children Indonesia', 'UNICEF Indonesia', 'World Vision Indonesia', 'Habitat for Humanity', 'Plan International']
  },
  olahraga: {
    name: 'Olahraga',
    description: 'Industri yang bergerak dalam bidang olahraga, fitness, dan rekreasi untuk kesehatan dan entertainment.',
    howItWorks: 'Meliputi coaching, event management, facility management, dan sports marketing. Fokus pada performance dan customer engagement.',
    topCompanies: ['PSSI', 'Badminton Indonesia', 'Celebrity Fitness', 'Fitness First', 'Gold\'s Gym', 'Gelora Bung Karno', 'Mahaka Sports', 'Sporty Indonesia', 'Decathlon Indonesia', 'Adidas Indonesia']
  },
  properti: {
    name: 'Properti',
    description: 'Industri yang bergerak dalam pengembangan, penjualan, dan pengelolaan properti residensial dan komersial.',
    howItWorks: 'Meliputi land acquisition, development, sales & marketing, dan property management. Bekerja dengan regulasi dan market analysis.',
    topCompanies: ['Ciputra Group', 'Sinar Mas Land', 'Lippo Group', 'Agung Sedayu Group', 'Summarecon', 'Alam Sutera', 'BSD City', 'Modernland', 'Intiland', 'Pakuwon Group']
  },
  kuliner: {
    name: 'Kuliner',
    description: 'Industri yang bergerak dalam produksi, pengolahan, dan penyajian makanan dan minuman untuk konsumen.',
    howItWorks: 'Meliputi menu development, food preparation, service delivery, dan quality control. Fokus pada taste, presentation, dan customer satisfaction.',
    topCompanies: ['Indofood', 'Mayora', 'Garuda Food', 'Tzu Chi', 'KFC Indonesia', 'McDonald\'s Indonesia', 'Pizza Hut', 'Starbucks Indonesia', 'Breadtalk', 'J.CO Donuts']
  },
  perdagangan: {
    name: 'Perdagangan',
    description: 'Industri yang bergerak dalam jual beli barang dan jasa, baik secara retail maupun wholesale, online dan offline.',
    howItWorks: 'Meliputi procurement, inventory management, sales, dan customer service. Menggunakan omnichannel approach dan data analytics.',
    topCompanies: ['Matahari Department Store', 'Ramayana', 'Hypermart', 'Carrefour', 'Indomaret', 'Alfamart', 'Tokopedia', 'Shopee', 'Blibli', 'Lazada']
  },
  telekomunikasi: {
    name: 'Telekomunikasi',
    description: 'Industri yang menyediakan layanan komunikasi dan konektivitas melalui jaringan telekomunikasi dan internet.',
    howItWorks: 'Meliputi network infrastructure, service delivery, customer support, dan technology innovation. Bekerja dengan teknologi tinggi dan regulasi.',
    topCompanies: ['Telkom Indonesia', 'Indosat Ooredoo', 'XL Axiata', 'Smartfren', 'Tri Indonesia', 'Tower Bersama', 'Mitratel', 'Dayamitra Telekomunikasi', 'Solusi Tunas Pratama', 'Ericsson Indonesia']
  }
};

/**
 * Generate explanation for why an industry is suitable for a user
 * @param {string} industryKey - Industry key (e.g., 'teknologi')
 * @param {Object} userAssessment - User's assessment scores
 * @param {number} industryScore - Calculated industry score
 * @returns {string} - Personalized explanation
 */
export const generateIndustryExplanation = (industryKey, userAssessment, industryScore) => {
  const requirements = industryRequirements[industryKey];
  const info = industryInfo[industryKey];
  
  if (!requirements || !info || !userAssessment) {
    return `Industri ${info?.name || industryKey} cocok dengan profil Anda berdasarkan analisis komprehensif kepribadian dan minat karir.`;
  }

  const explanations = [];
  
  // Analyze RIASEC matches
  if (requirements.riasec && userAssessment.riasec) {
    const riasecMatches = [];
    Object.entries(requirements.riasec).forEach(([trait, weight]) => {
      const userScore = userAssessment.riasec[trait] || 0;
      if (userScore >= 60 && weight >= 0.3) { // High user score and significant industry requirement
        riasecMatches.push(`${trait} (${userScore.toFixed(0)}%)`);
      }
    });
    if (riasecMatches.length > 0) {
      explanations.push(`Minat karir Anda yang kuat di bidang ${riasecMatches.join(', ')}`);
    }
  }

  // Analyze VIA matches
  if (requirements.via && userAssessment.viaIs) {
    const viaMatches = [];
    Object.entries(requirements.via).forEach(([trait, weight]) => {
      const userScore = userAssessment.viaIs[trait] || 0;
      if (userScore >= 60 && weight >= 0.2) { // High user score and significant industry requirement
        viaMatches.push(trait);
      }
    });
    if (viaMatches.length > 0) {
      explanations.push(`kekuatan karakter dalam ${viaMatches.slice(0, 2).join(' dan ')}`);
    }
  }

  // Analyze OCEAN matches
  if (requirements.ocean && userAssessment.ocean) {
    const oceanMatches = [];
    Object.entries(requirements.ocean).forEach(([trait, weight]) => {
      const userScore = userAssessment.ocean[trait] || 0;
      const effectiveScore = weight < 0 ? (100 - userScore) : userScore; // Handle inverted traits
      if (effectiveScore >= 60 && Math.abs(weight) >= 0.3) {
        oceanMatches.push(trait);
      }
    });
    if (oceanMatches.length > 0) {
      explanations.push(`kepribadian yang ${oceanMatches.slice(0, 2).join(' dan ')}`);
    }
  }

  let explanation = `Industri ${info.name} sangat cocok dengan Anda karena `;
  if (explanations.length > 0) {
    explanation += explanations.join(', ') + '. ';
  } else {
    explanation += `profil kepribadian dan minat karir Anda selaras dengan kebutuhan industri ini. `;
  }
  
  explanation += `Dengan skor kesesuaian ${industryScore.toFixed(0)}%, Anda memiliki potensi besar untuk berkembang di bidang ini.`;
  
  return explanation;
};

/**
 * Get industry information including description and top companies
 * @param {string} industryKey - Industry key
 * @returns {Object} - Industry information
 */
export const getIndustryInfo = (industryKey) => {
  return industryInfo[industryKey] || {
    name: industryKey,
    description: 'Informasi industri tidak tersedia.',
    howItWorks: 'Informasi cara kerja tidak tersedia.',
    topCompanies: []
  };
};
