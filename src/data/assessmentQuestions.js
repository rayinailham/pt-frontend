// VIA Character Strengths Questions
export const viaQuestions = {
  title: "VIA Character Strengths Self-Assessment",
  description: "This assessment contains 96 questions designed to help you reflect on your character strengths. For each statement, consider how much it sounds like you.",
  scale: [
    { value: 1, label: "Sangat tidak sesuai dengan saya" },
    { value: 2, label: "Tidak sesuai dengan saya" },
    { value: 3, label: "Agak tidak sesuai dengan saya" },
    { value: 4, label: "Netral" },
    { value: 5, label: "Agak sesuai dengan saya" },
    { value: 6, label: "Sesuai dengan saya" },
    { value: 7, label: "Sangat sesuai dengan saya" }
  ],
  categories: {
    creativity: {
      name: "Kreativitas",
      questions: [
        "Saya sering menemukan pendekatan baru dalam menyelesaikan tugas.",
        "Menghasilkan ide-ide orisinal adalah salah satu kekuatan utama saya.",
        "Saya mampu berpikir secara kreatif dan berbeda dari yang lain.",
        "Saya menikmati menciptakan solusi inovatif saat menghadapi masalah."
      ]
    },
    curiosity: {
      name: "Rasa Ingin Tahu",
      questions: [
        "Saya memiliki dorongan kuat untuk memahami alasan di balik berbagai hal.",
        "Saya sering merasa tertarik untuk mempelajari hal-hal baru.",
        "Saya mudah kehilangan minat terhadap hal-hal yang sudah saya kenal.",
        "Saya gemar menjelajahi tempat baru dan mempelajari hal-hal di dalamnya."
      ]
    },
    judgment: {
      name: "Daya Nilai / Berpikir Kritis",
      questions: [
        "Saya mempertimbangkan berbagai sudut pandang sebelum mengambil keputusan.",
        "Orang lain sering meminta pendapat saya karena saya dianggap objektif dan jernih.",
        "Saya mengumpulkan informasi secara menyeluruh sebelum membentuk opini.",
        "Saya terbiasa menilai sesuatu secara rasional dan menyeluruh."
      ]
    },
    loveOfLearning: {
      name: "Kecintaan Belajar",
      questions: [
        "Saya merasa antusias ketika memperoleh pengetahuan baru.",
        "Saya menikmati proses memahami topik yang kompleks.",
        "Saya memiliki komitmen untuk terus belajar sepanjang hidup.",
        "Saya secara aktif mencari informasi melalui buku atau artikel."
      ]
    },
    perspective: {
      name: "Perspektif",
      questions: [
        "Orang lain menganggap saya sebagai pribadi yang bijaksana.",
        "Saya mampu memahami gambaran besar dalam situasi yang kompleks.",
        "Saya bisa melihat suatu hal dari berbagai sisi, yang membantu saya memberi nasihat yang berguna.",
        "Saya sering dapat memahami situasi secara menyeluruh, bahkan saat orang lain merasa bingung."
      ]
    },
    bravery: {
      name: "Keberanian",
      questions: [
        "Saya mampu bertindak meskipun merasa takut.",
        "Saya tidak ragu membela prinsip yang saya yakini, walaupun menghadapi penolakan.",
        "Saya tidak menghindari tantangan atau risiko yang sulit.",
        "Saya merasa lebih kuat setiap kali berhasil menghadapi ketakutan."
      ]
    },
    perseverance: {
      name: "Kegigihan",
      questions: [
        "Saya terus mengejar tujuan hingga tuntas.",
        "Saya bekerja keras dan menyelesaikan apa yang telah saya mulai.",
        "Kegagalan tidak melemahkan semangat saya, tetapi justru memotivasi saya.",
        "Saya memiliki disiplin tinggi dalam menyelesaikan tugas."
      ]
    },
    honesty: {
      name: "Kejujuran",
      questions: [
        "Saya menjalani hidup secara jujur dan otentik.",
        "Saya lebih mengutamakan kejujuran daripada popularitas.",
        "Saya menampilkan diri saya yang sebenarnya tanpa berpura-pura.",
        "Orang-orang terdekat tahu bahwa saya berbicara dengan jujur dan apa adanya."
      ]
    },
    zest: {
      name: "Semangat",
      questions: [
        "Saya memulai hari dengan semangat dan antusiasme.",
        "Saya melakukan berbagai hal dengan energi penuh.",
        "Saya merasa hidup dan penuh gairah.",
        "Saya berusaha menjalani hidup secara maksimal."
      ]
    },
    love: {
      name: "Cinta",
      questions: [
        "Saya memiliki hubungan yang erat dan penuh makna dengan orang-orang terdekat.",
        "Saya memiliki kemampuan untuk memberi dan menerima kasih sayang.",
        "Saya menghargai koneksi yang mendalam dengan orang lain.",
        "Saya mampu membangun hubungan yang penuh cinta dan keintiman."
      ]
    },
    kindness: {
      name: "Kebaikan Hati",
      questions: [
        "Saya bersikap baik dan peduli terhadap orang lain.",
        "Saya berusaha membantu mereka yang membutuhkan.",
        "Saya memperlakukan setiap orang dengan hormat dan martabat.",
        "Saya dengan sukarela memberikan waktu dan sumber daya saya."
      ]
    },
    socialIntelligence: {
      name: "Kecerdasan Sosial",
      questions: [
        "Saya memahami perasaan dan motivasi orang lain.",
        "Saya mampu menyesuaikan diri dalam berbagai situasi sosial.",
        "Saya mengerti apa yang mendorong perilaku orang lain.",
        "Saya peka terhadap emosi orang lain."
      ]
    },
    teamwork: {
      name: "Kerja Sama Tim",
      questions: [
        "Saya bekerja dengan baik dalam tim.",
        "Saya mampu berkolaborasi untuk mencapai tujuan bersama.",
        "Saya setia dan mendukung kelompok saya.",
        "Saya selalu menjalankan peran saya dalam pekerjaan tim."
      ]
    },
    fairness: {
      name: "Keadilan",
      questions: [
        "Saya memperlakukan setiap orang secara adil tanpa memandang latar belakangnya.",
        "Saya yakin bahwa setiap orang layak mendapatkan kesempatan yang sama.",
        "Saya membuat keputusan secara objektif dan tidak memihak.",
        "Saya menentang perlakuan tidak adil dan diskriminasi."
      ]
    },
    leadership: {
      name: "Kepemimpinan",
      questions: [
        "Saya dapat mengorganisasi kegiatan kelompok dengan efektif.",
        "Saya lebih suka memimpin daripada mengikuti.",
        "Saya mampu menyatukan orang-orang untuk bekerja sama.",
        "Saya siap mengambil kendali ketika situasi membutuhkan kepemimpinan."
      ]
    },
    forgiveness: {
      name: "Pemaafan",
      questions: [
        "Saya memaafkan orang yang telah menyakiti saya.",
        "Saya memberikan kesempatan kedua kepada orang lain.",
        "Saya tidak menyimpan dendam meskipun pernah disakiti.",
        "Saya percaya bahwa setiap orang dapat berubah menjadi lebih baik."
      ]
    },
    humility: {
      name: "Kerendahan Hati",
      questions: [
        "Saya tidak membanggakan pencapaian saya.",
        "Saya membiarkan hasil kerja saya berbicara sendiri.",
        "Saya bersikap rendah hati meskipun meraih kesuksesan.",
        "Saya tidak menganggap diri saya lebih unggul dari orang lain."
      ]
    },
    prudence: {
      name: "Kehati-hatian",
      questions: [
        "Saya berhati-hati dalam bertindak.",
        "Saya mempertimbangkan dengan matang sebelum berbicara.",
        "Saya menghindari risiko yang tidak perlu.",
        "Saya membuat keputusan berdasarkan pertimbangan yang matang."
      ]
    },
    selfRegulation: {
      name: "Regulasi Diri",
      questions: [
        "Saya memiliki kemampuan untuk mengendalikan diri.",
        "Saya dapat menahan diri dari godaan.",
        "Saya disiplin dalam kebiasaan sehari-hari.",
        "Saya mampu mengelola emosi saya dengan baik."
      ]
    },
    appreciationOfBeauty: {
      name: "Apresiasi Keindahan",
      questions: [
        "Saya mampu menghargai keindahan dalam berbagai bentuk.",
        "Saya tersentuh oleh pengalaman yang indah.",
        "Saya secara aktif mencari momen yang mengandung keindahan.",
        "Saya memiliki apresiasi yang mendalam terhadap seni, musik, atau alam."
      ]
    },
    gratitude: {
      name: "Rasa Syukur",
      questions: [
        "Saya bersyukur atas hal-hal yang saya miliki dalam hidup.",
        "Saya secara rutin mengucapkan terima kasih kepada orang-orang yang penting bagi saya.",
        "Saya meluangkan waktu untuk mengapresiasi kebaikan dalam hidup saya.",
        "Saya menyadari dan menghargai berkat yang saya terima."
      ]
    },
    hope: {
      name: "Harapan",
      questions: [
        "Saya memiliki pandangan positif tentang masa depan.",
        "Saya yakin bahwa hal-hal baik akan terjadi dalam hidup saya.",
        "Saya memiliki sikap optimis terhadap kehidupan.",
        "Saya mempercayai potensi positif dalam orang-orang dan situasi."
      ]
    },
    humor: {
      name: "Humor",
      questions: [
        "Saya senang tertawa dan membuat orang lain tertawa.",
        "Saya mampu menemukan sisi lucu dalam situasi yang sulit.",
        "Saya menikmati lelucon ringan bersama teman-teman.",
        "Saya menggunakan humor untuk membangkitkan semangat orang lain."
      ]
    },
    spirituality: {
      name: "Spiritualitas",
      questions: [
        "Saya memiliki rasa tujuan hidup yang kuat.",
        "Saya percaya bahwa hidup memiliki makna yang lebih dalam dari sekadar materi.",
        "Saya memiliki keyakinan tentang arah dan makna hidup.",
        "Keyakinan spiritual saya memiliki arti penting dalam hidup saya."
      ]
    }
  }
};

// RIASEC Holland Codes Questions
export const riasecQuestions = {
  title: "RIASEC Holland Codes Self-Assessment",
  description: "This assessment contains 60 statements designed to help you explore your interests across different types of work activities. For each statement, consider how much it sounds like you.",
  scale: [
    { value: 1, label: "Sangat tidak setuju" },
    { value: 2, label: "Tidak setuju" },
    { value: 3, label: "Agak tidak setuju" },
    { value: 4, label: "Netral" },
    { value: 5, label: "Agak setuju" },
    { value: 6, label: "Setuju" },
    { value: 7, label: "Sangat setuju" }
  ],
  categories: {
    realistic: {
      name: "Realistis (Para Pelaku)",
      questions: [
        "Saya menikmati bekerja secara fisik dengan tangan, alat, atau mesin.",
        "Saya merasa puas ketika membangun, memperbaiki, atau merakit sesuatu.",
        "Saya lebih suka pekerjaan luar ruangan daripada pekerjaan di kantor.",
        "Saya adalah orang yang praktis dan menyukai hasil kerja yang konkret.",
        "Saya memiliki keterampilan mekanis dan memahami cara kerja berbagai alat.",
        "Saya menyukai aktivitas seperti berkebun, membangun, atau memperbaiki kendaraan.",
        "Saya lebih menyukai tantangan nyata dibandingkan masalah teoritis.",
        "Saya merasa lebih nyaman bekerja dengan benda dibanding dengan orang atau konsep.",
        "Saya senang dengan aktivitas petualangan dan tantangan fisik.",
        "Saya belajar paling baik melalui praktik langsung."
      ]
    },
    investigative: {
      name: "Investigatif (Para Pemikir)",
      questions: [
        "Saya memiliki rasa ingin tahu tinggi terhadap dunia fisik dan alam.",
        "Saya menikmati menyelesaikan persoalan kompleks yang membutuhkan analisis mendalam.",
        "Saya menyukai kegiatan meneliti, menganalisis data, dan memahami teori.",
        "Saya unggul dalam matematika dan ilmu pengetahuan.",
        "Saya menikmati membaca jurnal ilmiah, menyelesaikan teka-teki, atau melakukan eksperimen.",
        "Saya cenderung berpikir secara logis dan analitis.",
        "Saya senang bekerja mandiri untuk mengejar ide-ide saya sendiri.",
        "Saya menghargai ketepatan dan akurasi dalam setiap pekerjaan.",
        "Saya lebih tertarik bekerja dengan konsep dan ide daripada dengan orang atau objek.",
        "Saya terdorong oleh keinginan untuk memahami penyebab dari suatu fenomena."
      ]
    },
    artistic: {
      name: "Artistik (Para Pencipta)",
      questions: [
        "Saya memiliki imajinasi kuat dan suka mengekspresikan diri secara kreatif.",
        "Saya merasa nyaman bekerja dalam lingkungan yang fleksibel dan tidak terstruktur.",
        "Saya menikmati aktivitas menulis, melukis, bermusik, atau bermain drama.",
        "Saya sangat menghargai keindahan dan pengalaman estetis.",
        "Saya memilih proyek yang memungkinkan kebebasan berekspresi.",
        "Saya memiliki intuisi tinggi dan suka mengeksplorasi ide-ide baru.",
        "Saya senang mengerjakan proyek kreatif secara mandiri.",
        "Saya nyaman menghadapi ketidakjelasan atau masalah terbuka.",
        "Saya lebih tertarik pada kreativitas dan ide daripada pada pengelolaan data atau orang.",
        "Saya terlibat aktif dalam kegiatan seni dan budaya."
      ]
    },
    social: {
      name: "Sosial (Para Penolong)",
      questions: [
        "Saya merasa puas membantu orang lain dan memberi dampak positif dalam hidup mereka.",
        "Saya pandai memahami dan berinteraksi dengan berbagai tipe orang.",
        "Saya menikmati bekerja dalam kelompok dan berkolaborasi.",
        "Saya menyukai kegiatan mengajar, membimbing, atau memberi konseling.",
        "Saya berempati dan mampu mengenali emosi orang lain dengan mudah.",
        "Saya lebih suka bekerja dengan manusia dibandingkan dengan data atau benda.",
        "Saya efektif dalam menyelesaikan konflik dan menengahi perbedaan.",
        "Saya aktif dalam kegiatan pelayanan sosial dan sukarelawan.",
        "Saya menyukai lingkungan kerja yang kolaboratif dan saling mendukung.",
        "Saya termotivasi oleh kesempatan untuk membantu orang berkembang."
      ]
    },
    enterprising: {
      name: "Wirausaha (Para Pembujuk)",
      questions: [
        "Saya menikmati memimpin dan memengaruhi orang lain untuk mencapai tujuan.",
        "Saya nyaman mengambil risiko demi mencapai hasil.",
        "Saya suka meyakinkan dan memotivasi orang.",
        "Saya termotivasi oleh lingkungan yang kompetitif.",
        "Saya ahli dalam menjual ide, produk, atau layanan.",
        "Saya suka mengambil keputusan penting dan memimpin prosesnya.",
        "Saya ambisius dan terdorong untuk mencapai kesuksesan.",
        "Saya aktif membangun jaringan dan hubungan profesional.",
        "Saya lebih nyaman bekerja dengan orang dan informasi bisnis daripada dengan benda.",
        "Saya penuh semangat saat mengejar peluang baru."
      ]
    },
    conventional: {
      name: "Konvensional (Para Organisator)",
      questions: [
        "Saya menikmati mengelola data, angka, dan informasi secara terperinci.",
        "Saya menyukai aturan dan prosedur kerja yang jelas.",
        "Saya mampu mengorganisasi informasi secara sistematis dan efisien.",
        "Saya merasa nyaman dalam lingkungan kerja yang terstruktur dan dapat diprediksi.",
        "Saya berorientasi pada akurasi dan memperhatikan detail.",
        "Saya lebih senang bekerja dengan data atau benda dibandingkan dengan orang.",
        "Saya tertarik pada tugas-tugas yang membutuhkan ketelitian tinggi.",
        "Saya menghargai sistem dan proses kerja yang sudah ditetapkan.",
        "Saya menyukai pekerjaan yang bersifat rutin dan teratur.",
        "Saya pandai dalam pencatatan dan pengelolaan tugas administratif."
      ]
    }
  }
};

// Big Five Inventory Questions
export const bigFiveQuestions = {
  title: "Big Five Inventory (BFI-44) Self-Assessment",
  description: "This assessment contains 44 statements. Read each statement and decide how well it describes you. The phrase to keep in mind is: 'I see myself as someone who...'",
  scale: [
    { value: 1, label: "Sangat tidak setuju" },
    { value: 2, label: "Tidak setuju" },
    { value: 3, label: "Agak tidak setuju" },
    { value: 4, label: "Netral" },
    { value: 5, label: "Agak setuju" },
    { value: 6, label: "Setuju" },
    { value: 7, label: "Sangat setuju" }
  ],
  categories: {
    openness: {
      name: "Keterbukaan terhadap Pengalaman",
      questions: [
        "Saya seseorang yang orisinal dan mampu menghasilkan ide baru.",
        "Saya memiliki rasa ingin tahu terhadap berbagai hal.",
        "Saya cerdas dan suka berpikir mendalam.",
        "Saya memiliki imajinasi yang aktif.",
        "Saya bersifat kreatif dan mampu menciptakan hal-hal baru.",
        "Saya menikmati pengalaman estetis dan artistik.",
        "Saya suka merenung dan mengeksplorasi ide.",
        "Saya memahami seni, musik, atau sastra secara mendalam."
      ],
      reverseQuestions: [
        "Saya lebih menyukai rutinitas dalam pekerjaan.",
        "Saya memiliki ketertarikan yang rendah terhadap kegiatan artistik."
      ]
    },
    conscientiousness: {
      name: "Sifat Berhati-hati",
      questions: [
        "Saya teliti dan menyelesaikan pekerjaan dengan menyeluruh.",
        "Saya dapat diandalkan dalam menyelesaikan tugas.",
        "Saya gigih hingga menyelesaikan pekerjaan.",
        "Saya bekerja secara efisien.",
        "Saya membuat rencana dan melaksanakannya secara konsisten."
      ],
      reverseQuestions: [
        "Saya terkadang bersikap ceroboh.",
        "Saya kurang teratur dalam menjalani aktivitas.",
        "Saya cenderung malas dalam menjalankan tugas.",
        "Saya mudah teralihkan dari fokus pekerjaan."
      ]
    },
    extraversion: {
      name: "Ekstraversi",
      questions: [
        "Saya suka berbicara dan mudah bergaul.",
        "Saya ramah terhadap orang lain.",
        "Saya memiliki semangat tinggi dalam berinteraksi.",
        "Saya berkepribadian tegas dan berani menyuarakan pendapat.",
        "Saya penuh energi dalam menjalani aktivitas sehari-hari."
      ],
      reverseQuestions: [
        "Saya cenderung pendiam.",
        "Saya lebih suka menyendiri.",
        "Saya terkadang merasa malu atau ragu dalam situasi sosial."
      ]
    },
    agreeableness: {
      name: "Sifat Mudah Bersepakat",
      questions: [
        "Saya bersedia membantu orang lain tanpa pamrih.",
        "Saya mudah memaafkan kesalahan orang lain.",
        "Saya cenderung percaya pada orang lain.",
        "Saya penuh pertimbangan dan ramah terhadap siapa pun.",
        "Saya senang bekerja sama dan membangun harmoni."
      ],
      reverseQuestions: [
        "Saya sering mengkritik atau mencari kesalahan orang lain.",
        "Saya mudah memulai konflik atau perdebatan.",
        "Saya bisa menjadi dingin dan menjaga jarak secara emosional.",
        "Saya terkadang bersikap kasar terhadap orang lain."
      ]
    },
    neuroticism: {
      name: "Neurotisisme",
      questions: [
        "Saya mudah merasa tegang atau tertekan.",
        "Saya sering merasa khawatir.",
        "Saya mudah merasa sedih atau murung.",
        "Saya cepat merasa gugup."
      ],
      reverseQuestions: [
        "Saya mampu menangani tekanan dengan baik.",
        "Saya tenang dalam situasi yang menegangkan.",
        "Saya stabil secara emosional dan tidak mudah tersulut.",
        "Saya jarang merasa tertekan atau putus asa."
      ]
    }
  }
};
