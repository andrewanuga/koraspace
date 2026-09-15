const fs = require("fs");
const path = require("path");

const dictsDir = path.join(process.cwd(), "lib", "i18n", "dictionaries");
const files = fs.readdirSync(dictsDir).filter(f => f.endsWith('.ts'));

const translations = {
  "en-US": {
    plans: [
      {
        planKey: "free", name: "Free", desc: "For individuals getting started.",
        posts: "3 lifetime schedules",
        features: ["3 integrations", "50k lifetime AI tokens", "0 collaborators", "Analytics & Overview pages", "Customer Support"],
        cta: "Start Free"
      },
      {
        planKey: "pro", name: "Pro", desc: "For growing creators.",
        posts: "5 schedules / week",
        features: ["7 integrations", "1.6M AI tokens / month", "3 collaborators", "5 max bots", "All pages (No Marketer page)"],
        cta: "Get Pro", highlight: true, badge: "Popular"
      },
      {
        planKey: "advanced", name: "Advanced", desc: "For power users.",
        posts: "15 lifetime schedules",
        features: ["10 integrations", "3.5M AI tokens / month", "Hashtag Manager", "7 collaborators", "15 managed bots", "Marketer page included"],
        cta: "Get Advanced"
      },
      {
        planKey: "team", name: "Teams", desc: "For large agencies.",
        posts: "Unlimited schedules",
        features: ["Unlimited integrations", "7.2M AI tokens / month", "Unlimited collaborators", "Unlimited bots", "All features included"],
        cta: "Contact Sales"
      }
    ]
  },
  "en-NG": {
    plans: [
      {
        planKey: "free", name: "Free", desc: "For individuals getting started.",
        posts: "3 lifetime schedules",
        features: ["3 integrations", "50k lifetime AI tokens", "0 collaborators", "Analytics & Overview pages", "Customer Support"],
        cta: "Start Free"
      },
      {
        planKey: "pro", name: "Pro", desc: "For growing creators.",
        posts: "5 schedules / week",
        features: ["7 integrations", "1.6M AI tokens / month", "3 collaborators", "5 max bots", "All pages (No Marketer page)"],
        cta: "Get Pro", highlight: true, badge: "Popular"
      },
      {
        planKey: "advanced", name: "Advanced", desc: "For power users.",
        posts: "15 lifetime schedules",
        features: ["10 integrations", "3.5M AI tokens / month", "Hashtag Manager", "7 collaborators", "15 managed bots", "Marketer page included"],
        cta: "Get Advanced"
      },
      {
        planKey: "team", name: "Teams", desc: "For large agencies.",
        posts: "Unlimited schedules",
        features: ["Unlimited integrations", "7.2M AI tokens / month", "Unlimited collaborators", "Unlimited bots", "All features included"],
        cta: "Contact Sales"
      }
    ]
  },
  "es": {
    plans: [
      {
        planKey: "free", name: "Gratis", desc: "Para individuos que empiezan.",
        posts: "3 programaciones de por vida",
        features: ["3 integraciones", "50k tokens IA de por vida", "0 colaboradores", "Páginas de Análisis y Visión general", "Soporte al Cliente"],
        cta: "Empezar Gratis"
      },
      {
        planKey: "pro", name: "Pro", desc: "Para creadores en crecimiento.",
        posts: "5 programaciones / semana",
        features: ["7 integraciones", "1.6M tokens IA / mes", "3 colaboradores", "5 bots máximo", "Todas las páginas (Sin página de Marketer)"],
        cta: "Obtener Pro", highlight: true, badge: "Popular"
      },
      {
        planKey: "advanced", name: "Avanzado", desc: "Para usuarios avanzados.",
        posts: "15 programaciones de por vida",
        features: ["10 integraciones", "3.5M tokens IA / mes", "Gestor de Hashtags", "7 colaboradores", "15 bots gestionados", "Página de Marketer incluida"],
        cta: "Obtener Avanzado"
      },
      {
        planKey: "team", name: "Equipos", desc: "Para agencias grandes.",
        posts: "Programaciones ilimitadas",
        features: ["Integraciones ilimitadas", "7.2M tokens IA / mes", "Colaboradores ilimitados", "Bots ilimitados", "Todas las funciones incluidas"],
        cta: "Contactar Ventas"
      }
    ]
  },
  "fr": {
    plans: [
      {
        planKey: "free", name: "Gratuit", desc: "Pour les individus qui débutent.",
        posts: "3 publications à vie",
        features: ["3 intégrations", "50k jetons IA à vie", "0 collaborateurs", "Pages d'Analyses et d'Aperçu", "Support Client"],
        cta: "Commencer Gratuitement"
      },
      {
        planKey: "pro", name: "Pro", desc: "Pour les créateurs en croissance.",
        posts: "5 publications / semaine",
        features: ["7 intégrations", "1.6M jetons IA / mois", "3 collaborateurs", "5 bots max", "Toutes les pages (Pas de page Marketer)"],
        cta: "Obtenir Pro", highlight: true, badge: "Populaire"
      },
      {
        planKey: "advanced", name: "Avancé", desc: "Pour les utilisateurs avancés.",
        posts: "15 publications à vie",
        features: ["10 intégrations", "3.5M jetons IA / mois", "Gestionnaire de Hashtags", "7 collaborateurs", "15 bots gérés", "Page Marketer incluse"],
        cta: "Obtenir Avancé"
      },
      {
        planKey: "team", name: "Équipes", desc: "Pour les grandes agences.",
        posts: "Publications illimitées",
        features: ["Intégrations illimitées", "7.2M jetons IA / mois", "Collaborateurs illimités", "Bots illimités", "Toutes les fonctionnalités incluses"],
        cta: "Contacter les Ventes"
      }
    ]
  },
  "nl": {
    plans: [
      {
        planKey: "free", name: "Gratis", desc: "Voor individuen die net beginnen.",
        posts: "3 planningen levenslang",
        features: ["3 integraties", "50k AI tokens levenslang", "0 medewerkers", "Analyse & Overzicht pagina's", "Klantenservice"],
        cta: "Gratis Starten"
      },
      {
        planKey: "pro", name: "Pro", desc: "Voor groeiende creators.",
        posts: "5 planningen / week",
        features: ["7 integraties", "1.6M AI tokens / maand", "3 medewerkers", "Maximaal 5 bots", "Alle pagina's (Geen Marketer pagina)"],
        cta: "Krijg Pro", highlight: true, badge: "Populair"
      },
      {
        planKey: "advanced", name: "Geavanceerd", desc: "Voor power users.",
        posts: "15 planningen levenslang",
        features: ["10 integraties", "3.5M AI tokens / maand", "Hashtag Manager", "7 medewerkers", "15 beheerde bots", "Marketer pagina inbegrepen"],
        cta: "Krijg Geavanceerd"
      },
      {
        planKey: "team", name: "Teams", desc: "Voor grote bureaus.",
        posts: "Onbeperkte planningen",
        features: ["Onbeperkte integraties", "7.2M AI tokens / maand", "Onbeperkte medewerkers", "Onbeperkte bots", "Alle functies inbegrepen"],
        cta: "Neem Contact Op"
      }
    ]
  },
  "ar": {
    plans: [
      {
        planKey: "free", name: "مجاني", desc: "للأفراد الذين يبدأون للتو.",
        posts: "3 جدولات مدى الحياة",
        features: ["3 عمليات تكامل", "50 ألف رمز ذكاء اصطناعي مدى الحياة", "0 متعاونين", "صفحات التحليلات والنظرة العامة", "دعم العملاء"],
        cta: "ابدأ مجاناً"
      },
      {
        planKey: "pro", name: "برو", desc: "للمبدعين المتناميين.",
        posts: "5 جدولات / أسبوع",
        features: ["7 عمليات تكامل", "1.6 مليون رمز / شهر", "3 متعاونين", "5 روبوتات كحد أقصى", "جميع الصفحات (بدون صفحة المسوق)"],
        cta: "احصل على برو", highlight: true, badge: "شائع"
      },
      {
        planKey: "advanced", name: "متقدم", desc: "للمستخدمين المتقدمين.",
        posts: "15 جدولة مدى الحياة",
        features: ["10 عمليات تكامل", "3.5 مليون رمز / شهر", "مدير الهاشتاجات", "7 متعاونين", "15 روبوت مُدار", "صفحة المسوق متضمنة"],
        cta: "احصل على متقدم"
      },
      {
        planKey: "team", name: "الفرق", desc: "للوكالات الكبيرة.",
        posts: "جدولات غير محدودة",
        features: ["عمليات تكامل غير محدودة", "7.2 مليون رمز / شهر", "متعاونين غير محدودين", "روبوتات غير محدودة", "جميع الميزات متضمنة"],
        cta: "اتصل بالمبيعات"
      }
    ]
  },
  "zh": {
    plans: [
      {
        planKey: "free", name: "免费", desc: "适合刚刚起步的个人。",
        posts: "终身3次定时发布",
        features: ["3个集成", "终身5万AI代币", "0个协作者", "数据分析与概览页面", "客户支持"],
        cta: "免费开始"
      },
      {
        planKey: "pro", name: "专业版", desc: "适合不断成长的创作者。",
        posts: "每周5次定时发布",
        features: ["7个集成", "每月160万AI代币", "3个协作者", "最多5个机器人", "所有页面 (无营销人员页面)"],
        cta: "获取专业版", highlight: true, badge: "热门"
      },
      {
        planKey: "advanced", name: "高级版", desc: "适合高级用户。",
        posts: "终身15次定时发布",
        features: ["10个集成", "每月350万AI代币", "话题标签管理器", "7个协作者", "15个托管机器人", "包含营销人员页面"],
        cta: "获取高级版"
      },
      {
        planKey: "team", name: "团队版", desc: "适合大型机构。",
        posts: "无限制定时发布",
        features: ["无限制集成", "每月720万AI代币", "无限制协作者", "无限制机器人", "包含所有功能"],
        cta: "联系销售"
      }
    ]
  }
};

for (const file of files) {
  const filePath = path.join(dictsDir, file);
  let content = fs.readFileSync(filePath, "utf-8");
  
  const locale = file.replace('.ts', '');
  const data = translations[locale];
  
  if (data) {
    // Remove the old standalone descriptions
    content = content.replace(/starterName:.*?,\n/g, "");
    content = content.replace(/starterDesc:.*?,\n/g, "");
    content = content.replace(/creatorProName:.*?,\n/g, "");
    content = content.replace(/creatorProDesc:.*?,\n/g, "");
    content = content.replace(/marketerProName:.*?,\n/g, "");
    content = content.replace(/marketerProDesc:.*?,\n/g, "");
    content = content.replace(/agencyName:.*?,\n/g, "");
    content = content.replace(/agencyDesc:.*?,\n/g, "");

    // Replace the plans array entirely
    const plansString = JSON.stringify(data.plans, null, 6).replace(/"([^"]+)":/g, "$1:");
    content = content.replace(/plans:\s*\[[\s\S]*?\]\s*(,?)(\s*})/g, `plans: ${plansString}$1$2`);
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
}
