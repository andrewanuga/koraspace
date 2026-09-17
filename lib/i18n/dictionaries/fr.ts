import { TranslationDictionary } from "../types";

export const fr: TranslationDictionary = {
  onboarding: {
  "topBarTitle": "Configuration de l'Espace",
  "secureBadge": "Intégration Sécurisée",
  "exit": "Quitter",
  "stepIndicator": "Étape",
  "personalizingBadge": "Personnalisation de KoraSpace",
  "stepTitles": [
    "Votre rôle",
    "Vos objectifs",
    "Vos canaux",
    "Votre contenu",
    "Votre audience",
    "Votre flux de travail",
    "Style d'analyse",
    "Typographie",
    "Apparence"
  ],
  "step1": {
    "eyebrow": "01",
    "titleStart": "Construisons votre",
    "titleHighlight": "KoraSpace sur mesure.",
    "description": "Dites-nous comment vous utilisez les réseaux sociaux afin que nous configurions votre espace de travail.",
    "roles": {
      "businessTitle": "Entreprise / Marque",
      "businessBlurb": "Je gère une entreprise et souhaite que les réseaux génèrent des prospects qualifiés.",
      "businessDetail": "Croissance de l'entreprise, leads, ventes et notoriété.",
      "creatorTitle": "Studio Créateur",
      "creatorBlurb": "Je développe une audience, publie du contenu et accrois mon influence.",
      "creatorDetail": "Croissance d'audience, contenu signature et recyclage de formats.",
      "marketerTitle": "Opérateur Marketing",
      "marketerBlurb": "Je gère le marketing, les pipelines de leads et les campagnes multicanales.",
      "marketerDetail": "Campagnes, tri des leads CRM, analytique et automatisation."
    }
  },
  "step2": {
    "eyebrow": "02",
    "titleStart": "Que doit vous aider",
    "titleHighlight": "à accomplir KoraSpace ?",
    "description": "Sélectionnez tout ce qui compte. Nous utiliserons ces objectifs pour adapter votre tableau de bord et agent.",
    "goals": {
      "growth": {
        "title": "Développer mon audience",
        "description": "Toucher plus de monde et augmenter la visibilité."
      },
      "leads": {
        "title": "Générer des leads",
        "description": "Transformer l'attention sociale en prospects qualifiés."
      },
      "sales": {
        "title": "Augmenter les ventes",
        "description": "Lier le contenu et les campagnes aux revenus."
      },
      "content": {
        "title": "Créer du meilleur contenu",
        "description": "Produire des publications de qualité adaptées à votre voix."
      },
      "brand": {
        "title": "Bâtir l'autorité de marque",
        "description": "Établir une présence claire et cohérente."
      },
      "management": {
        "title": "Gagner du temps sur le planning",
        "description": "Simplifier la programmation et la gestion des médias."
      },
      "repurpose": {
        "title": "Recycler sur plusieurs plateformes",
        "description": "Transformer un contenu en plusieurs formats."
      },
      "analytics": {
        "title": "Suivre l'ensemble de l'entonnoir",
        "description": "Comprendre l'engagement, le ROAS et les conversions."
      }
    },
    "selectedCount": "objectifs sélectionnés",
    "selectAtLeastOne": "Sélectionnez au moins un objectif"
  },
  "step3": {
    "eyebrow": "03",
    "titleStart": "Où votre audience",
    "titleHighlight": "vous trouve-t-elle ?",
    "description": "Sélectionnez les réseaux que vous utilisez activement. Vous pourrez connecter vos comptes plus tard.",
    "platformsLabel": "Vos plateformes et réseaux connectés",
    "usernameLabel": "Votre nom d'utilisateur d'espace",
    "usernameHint": "Votre identifiant unique KoraSpace. Caractères alphanumériques et tirets bas uniquement.",
    "usernamePlaceholder": "votreidentifiant",
    "selectedCount": "plateformes sélectionnées"
  },
  "step4": {
    "eyebrow": "04",
    "titleStart": "Dites-nous ce que",
    "titleHighlight": "vous créez.",
    "description": "Cela donne du contexte au moteur d'IA avant qu'il ne formule des recommandations.",
    "nicheLabel": "Votre niche ou secteur d'activité",
    "nichePlaceholder": "ex. IA, SaaS, mode, fitness, immobilier, fintech...",
    "formatsLabel": "Quels formats utilisez-vous ?",
    "formats": {
      "short_video": {
        "title": "Vidéo courte",
        "description": "Reels, TikToks, Shorts"
      },
      "text": {
        "title": "Texte & réflexions",
        "description": "Posts X, réflexions LinkedIn"
      },
      "carousel": {
        "title": "Carrousels & diapos",
        "description": "Guides visuels multi-pages"
      },
      "image": {
        "title": "Images uniques & visuels",
        "description": "Photos de produits, citations, visuels"
      },
      "long_form": {
        "title": "Contenu long format",
        "description": "Articles, newsletters, YouTube"
      },
      "mixed": {
        "title": "Un mélange de tout",
        "description": "Format multiplateforme diversifié"
      }
    },
    "cadenceLabel": "À quelle fréquence souhaitez-vous publier ?",
    "cadences": {
      "1": {
        "title": "1-2 posts / semaine",
        "description": "Faible fréquence, haute concentration et régularité"
      },
      "3": {
        "title": "3-5 posts / semaine",
        "description": "Croissance active et dynamique d'audience"
      },
      "7": {
        "title": "Quotidien (7 posts / semaine)",
        "description": "Présence multicanale soutenue"
      },
      "14": {
        "title": "Plusieurs fois par jour",
        "description": "Gros volume de publication sur tous les canaux"
      }
    }
  },
  "step5": {
    "eyebrow": "05",
    "titleStart": "Un peu plus",
    "titleHighlight": "de contexte.",
    "creatorDesc": "Aidez-nous à comprendre votre audience pour des suggestions pertinentes.",
    "clientDesc": "Parlez-nous de l'entreprise que vous souhaitez développer.",
    "marketerDesc": "Donnez-nous le contexte requis pour une intelligence marketing optimale.",
    "audienceSizeLabel": "Taille actuelle de votre audience",
    "targetAudienceLabel": "Qui cherchez-vous à toucher ?",
    "targetAudiencePlaceholderCreator": "ex. fondateurs de startups IA",
    "businessTypeLabel": "Quel type d'activité ?",
    "targetAudiencePlaceholderClient": "ex. propriétaires de commerces à Paris",
    "industryLabel": "Dans quel secteur travaillez-vous ?",
    "industryPlaceholder": "ex. SaaS, fintech, e-commerce...",
    "primarilyMarketLabel": "Que commercialisez-vous principalement ?"
  },
  "step6": {
    "eyebrow": "06",
    "titleStart": "Quel niveau d'aide",
    "titleHighlight": "attendez-vous de KoraSpace ?",
    "description": "Vous gardez le contrôle. Cela indique le degré de proactivité de votre espace.",
    "levels": {
      "suggestions": {
        "title": "Suggestions & Idées",
        "description": "Donnez-moi des idées. Je rédigerai le reste."
      },
      "drafts": {
        "title": "Brouillons IA en 8 étapes",
        "description": "Transformez les idées en brouillons prêts à publier."
      },
      "create_schedule": {
        "title": "Création & Auto-planification",
        "description": "Générez des brouillons et placez-les sur le calendrier."
      },
      "automate": {
        "title": "Opérateur Autonome",
        "description": "Laissez KoraSpace qualifier les leads et optimiser les campagnes."
      }
    },
    "summaryConfigured": "Votre espace sera configuré selon vos réponses."
  },
  "step7": {
    "eyebrow": "07",
    "titleStart": "Choisissez votre style",
    "titleHighlight": "d'analyse graphique.",
    "description": "Sélectionnez le type de visualisation par défaut pour vos métriques et performances.",
    "bestForPrefix": "Idéal pour :",
    "styles": {
      "auto": {
        "title": "Intelligent / Auto",
        "subtitle": "Adaptatif au contexte",
        "bestFor": "Sélection automatique selon les métriques"
      },
      "area": {
        "title": "Graphique d'Aire",
        "subtitle": "Volume & engagement",
        "bestFor": "Trafic, portée et volume cumulé"
      },
      "bar": {
        "title": "Graphique en Barres",
        "subtitle": "Comparatif par canaux",
        "bestFor": "Comparaison des campagnes et plateformes"
      },
      "line": {
        "title": "Courbe Linéaire",
        "subtitle": "Croissance & tendances",
        "bestFor": "Trajectoire, vitesse et progression continue"
      },
      "donut": {
        "title": "Graphique Circulaire",
        "subtitle": "Répartition des canaux",
        "bestFor": "Part d'audience et de leads par canal"
      },
      "funnel": {
        "title": "Graphique Entonnoir",
        "subtitle": "Tunnel de conversion",
        "bestFor": "Pipeline Lead → Qualifié → Revenus"
      },
      "radar": {
        "title": "Graphique Radar",
        "subtitle": "Santé multiaxiale",
        "bestFor": "Aperçu global multidimensionnel"
      }
    }
  },
  "step8": {
    "eyebrow": "08",
    "titleStart": "Choisissez votre",
    "titleHighlight": "typographie & police.",
    "description": "Sélectionnez la police principale qui donnera le ton à votre interface et vos publications.",
    "fonts": {
      "inter": {
        "label": "Inter",
        "category": "Moderne et Neutre",
        "preview": "Portez ce vieux whisky au juge blond qui fume · 1 234 567"
      },
      "geist": {
        "label": "Geist",
        "category": "Précision Technique",
        "preview": "Agents autonomes analysant la télémétrie de conversion · 98.4%"
      },
      "dm-sans": {
        "label": "DM Sans",
        "category": "Géométrique Contemporain",
        "preview": "Vitesse de croissance de l'audience sur les comptes vérifiés · +24.8%"
      },
      "manrope": {
        "label": "Manrope",
        "category": "Géométrique Raffiné",
        "preview": "Opérations marketing haute performance et programmation autonome"
      },
      "plus-jakarta": {
        "label": "Plus Jakarta Sans",
        "category": "Exécutif Premium",
        "preview": "Signaux de revenus et intelligence prédictive · 45 280 €"
      },
      "space-grotesk": {
        "label": "Space Grotesk",
        "category": "Avant-gardiste",
        "preview": "Exécution de pipelines IA en temps réel et routage multicanal"
      },
      "ibm-plex": {
        "label": "IBM Plex Sans",
        "category": "Éditorial Structuré",
        "preview": "Réseau de distribution mondial avec authentification Zero-Trust"
      }
    }
  },
  "step9": {
    "eyebrow": "09",
    "titleStart": "Apparence &",
    "titleHighlight": "densité du tableau de bord.",
    "description": "Ajustez le thème et la densité de l'interface avant d'entrer dans votre espace de travail.",
    "themeModeLabel": "Mode d'Affichage",
    "themes": {
      "dark": {
        "label": "Mode Sombre",
        "description": "Obsidienne profonde"
      },
      "light": {
        "label": "Mode Clair",
        "description": "Lumière éclatante"
      },
      "system": {
        "label": "Synchronisé au Système",
        "description": "Suit les réglages de l'OS"
      }
    },
    "densityLabel": "Densité du Tableau de Bord",
    "densities": {
      "minimal": {
        "label": "Minimal",
        "badge": "Épuré",
        "description": "Espacement généreux avec synthèses claires"
      },
      "balanced": {
        "label": "Équilibré",
        "badge": "Défaut",
        "description": "Équilibre idéal entre cartes et données riches"
      },
      "detailed": {
        "label": "Détaillé",
        "badge": "Expert",
        "description": "Tableaux de télémétrie denses et grilles multi-métriques"
      }
    },
    "readyTitle": "Votre Espace de Travail Est Prêt",
    "readyDesc": "Tous vos paramètres seront enregistrés sur votre profil Supabase."
  },
  "navigation": {
    "back": "Retour",
    "continue": "Continuer",
    "enterWorkspace": "Accéder à mon espace",
    "settingUp": "Configuration en cours...",
    "getStartedBadge": "Commençons votre configuration",
    "changeAnytimeReassurance": "Vous pouvez modifier ces paramètres à tout moment dans les préférences"
  }
},
  dashboardShowcase: {
  eyebrow: "Aperçu Interactif du Tableau de Bord",
  title: "Voir KoraSpace en action :",
  subtitle: "Basculez entre le mode Créateur et le mode Marketeur pour découvrir KoraSpace.",
  creatorMode: "Studio Créateur",
  marketerMode: "Opérateur Marketing",
  composerTitle: "Pipeline de Création IA",
  composerDesc: "8 étapes de correspondance vocale, score et réflexions.",
  calendarTitle: "Calendrier Visuel",
  calendarDesc: "Planification par glisser-déposer sur 6 plateformes.",
  crmTitle: "CRM Social & Leads",
  crmDesc: "Détectez les signaux d'achat dans les DMs et commentaires.",
  pipelineScore: "KoraScore 88/100",
  engagementRate: "3.8% Taux d'engagement",
  revenueAttributed: "12 450 € de revenus générés",
  previewMode: "Mode",
  aiStudio: "Studio IA",
  visualCalendar: "Calendrier Visuel",
  viralTrends: "Tendances Virales",
  repurpose: "Recycler",
  audience: "Audience",
  brandKit: "Kit de Marque",
  realTimeSync: "Sync. en temps réel",
  totalReach: "Portée Totale",
  engagement: "Engagement",
  scheduled: "Programmé",
  allSynced: "Tout synchronisé",
  aiContentScore: "Score de Contenu IA",
  optimalVoice: "Voix optimale",
  activeAiGeneration: "Génération IA Active • Voix de marque",
  hookPreview: "Accroche : 3 stratégies IA que les créateurs utilisent en 2026 pour croître. Voici la méthode en 4 étapes pour 10x votre distribution...",
  eightStepReflection: "Réflexion en 8 étapes terminée",
  scheduleToPlatforms: "Planifier sur 5 Plateformes",
  unifiedIntelligenceCloud: "Cloud d'Intelligence Unifié",
  fasterContentSpeed: "10× Plus de Vitesse",
  fasterContentDesc: "De l'idée au brouillon sur 6 réseaux en quelques secondes",
  managedPipelineRevenue: "8.4M€+ de Revenus",
  managedPipelineDesc: "Ventes et conversions sociales attribuées",
  higherLeadIntent: "4.2× Plus d'Intention",
  higherLeadDesc: "Classification automatisée des leads en DM",
  connectedNetworks: "6+ Réseaux Connectés",
  connectedNetworksDesc: "Instagram, TikTok, LinkedIn, YouTube, X, Threads",
  agentOperator: "Agent Opérateur",
  campaigns: "Campagnes",
  crmLeads: "CRM & Leads",
  automations: "Automatisations",
  attribution: "Attribution",
  strategy: "Stratégie"
},
  authLayout: {
  commandCenter: "Votre centre de commande marketing & créateur",
  titleStart: "Transformez votre audience",
  titleHighlight: "en élan.",
  description: "Gérez des campagnes multicanales, rédigez avec votre voix de marque et suivez les revenus.",
  feature1: "Flux de travail multicanaux",
  feature2: "Intelligence par IA",
  feature3: "Attribution en temps réel",
  secureCloud: "Espace Cloud Sécurisé",
  workspaceCommand: "Centre de Commande",
  overview: "Aperçu",
  create: "Créer",
  campaignsNav: "Campagnes",
  analytics: "Analytique",
  crmNav: "CRM & Leads",
  brandKitNav: "Kit de Marque",
  settings: "Paramètres",
  revenue: "Revenus",
  roas: "ROAS",
  leads: "Leads",
  growth: "Croissance"
},
  authPages: {
  loginTitle: "Bon retour",
  loginSubtitle: "Connectez-vous pour accéder à KoraSpace.",
  signupTitle: "Créer un compte",
  signupSubtitle: "Commencez votre croissance autonome aujourd'hui.",
  emailLabel: "Adresse e-mail",
  passwordLabel: "Mot de passe",
  nameLabel: "Nom complet",
  loginButton: "Se connecter",
  signupButton: "Créer le compte",
  googleButton: "Continuer avec Google",
  noAccount: "Pas encore de compte ?",
  haveAccount: "Vous avez déjà un compte ?",
  forgotPassword: "Mot de passe oublié ?",
  marketingSuite: "Suite Marketing & Créateur"
},
  nav: {
    product: "Produit",
    audience: "Pour qui",
    integrations: "Intégrations",
    resources: "Ressources",
    pricing: "Tarifs",
    signIn: "Connexion",
    getStarted: "Commencer",
    platform: "Plateforme",
    company: "Entreprise",
    languageAndCurrency: "Langue et Devise",
  },
  megaMenus: {
    productEyebrow: "PRODUIT",
    productLede: "Tout fonctionne ensemble pour développer votre marque et vos revenus.",
    productCta: "Explorer toute la plateforme KoraSpace",
    audienceEyebrow: "CONÇU POUR VOUS",
    audienceLede: "Construit autour de votre façon réelle de travailler.",
    audienceCta: "Découvrez comment KoraSpace s'adapte à vos besoins",
    integrationsEyebrow: "INTÉGRATIONS",
    integrationsLede: "Connectez les outils et réseaux sociaux que vous utilisez déjà.",
    integrationsMore: "Plus d'intégrations",
    integrationsCta: "Explorer les intégrations",
    categories: {
      createTitle: "Créer",
      createItems: ["Contenu IA", "Voix de Marque", "Recyclage de Contenu"],
      manageTitle: "Gérer",
      manageItems: ["Publication", "Calendrier", "Comptes Sociaux"],
      understandTitle: "Comprendre",
      understandItems: ["Analytique", "Tendances", "Concurrents"],
      growTitle: "Développer",
      growItems: ["Stratégie", "Campagnes", "Expérimentations"],
      convertTitle: "Convertir",
      convertItems: ["Détection de Leads", "CRM", "Revenus"],
      automateTitle: "Automatiser",
      automateItems: ["Bots IA", "Boîte de Réception", "Workflows"],
    },
    audiences: [
      {
        label: "Startups et fondateurs",
        desc: "Développez votre audience sans devoir embaucher une équipe marketing dédiée.",
      },
      {
        label: "Créateurs de contenu",
        desc: "Créez, planifiez et développez votre marque personnelle.",
      },
      {
        label: "Entreprises et marques",
        desc: "Transformez votre présence sociale en un moteur de croissance prévisible.",
      },
      {
        label: "Agences marketing",
        desc: "Gérez plusieurs marques et clients au même endroit en toute sécurité.",
      },
      {
        label: "Équipes marketing",
        desc: "Planifiez, collaborez et exécutez vos campagnes en équipe.",
      },
      {
        label: "E-commerce et boutiques",
        desc: "Transformez les commentaires et messages directs en clients payants.",
      },
    ],
    resourceGroups: [
      {
        title: "Apprendre",
        items: [
          { label: "Blog" },
          { label: "Guides Marketing" },
          { label: "Académie KoraSpace" },
        ],
      },
      {
        title: "Assistance",
        items: [
          { label: "Centre d'aide" },
          { label: "Documentation" },
          { label: "FAQ", href: "#faq" },
        ],
      },
      {
        title: "Développeurs",
        items: [
          { label: "Portail Développeur" },
          { label: "API" },
          { label: "Intégrations", href: "#integrations" },
        ],
      },
    ],
  },
  hero: {
    badge: "Agent Marketing Autonome par IA pour Marques Modernes",
    title1: "Transformez la voix de votre marque en",
    titleHighlight: "publications signatures et leads CRM",
    title2: "en pilote automatique.",
    subtitle:
      "Ne perdez plus 15+ heures par semaine face au syndrome de la page blanche. KoraSpace déploie deux moteurs d'IA : un Studio Créateur pour du contenu authentique et un Opérateur Marketing pour la conversion automatisée de vos leads CRM.",
    startTrial: "Essai gratuit de 14 jours",
    compareModes: "Comparer les deux modes",
    noCardRequired: "Aucune carte bancaire requise",
    instantSetup: "Configuration en 2 minutes",
    statCreators: "+5 000 créateurs et spécialistes du marketing",
    statPosts: "+1,2M publications générées",
    statRoas: "4,2x ROAS moyen sur les leads",
    supportedPlatforms: "Conçu pour croître sur Instagram, TikTok, X, LinkedIn et Threads.",
  },
  heroLoop: {
    badge: "LA BOUCLE DE CROISSANCE KORASPACE",
    stages: [
      {
        label: "Votre Marque",
        kicker: "Cerveau de Marque",
        body: "KoraSpace apprend votre ton, vos produits, votre positionnement et vos directives.",
        action: "Voir le profil de marque",
      },
      {
        label: "IA",
        kicker: "Intelligence",
        body: "De multiples moteurs d'IA transforment vos données en décisions marketing à fort taux de conversion.",
        action: "Découvrir les moteurs",
      },
      {
        label: "Contenu",
        kicker: "Créer",
        body: "Générez du contenu adapté à votre style, votre audience et chaque réseau social.",
        action: "Ouvrir le compositeur",
      },
      {
        label: "Audience",
        kicker: "Portée",
        body: "Votre contenu est diffusé au moment exact où votre audience est la plus active.",
        action: "Voir le planning",
      },
      {
        label: "Résultats",
        kicker: "Apprendre",
        body: "Votre audience s'engage 34% plus avec du contenu éducatif et pratique porté par le fondateur.",
        action: "Opportunité détectée",
      },
      {
        label: "Action Suivante",
        kicker: "Intelligence Kora",
        body: "Transformez votre publication la plus virale en une campagne structurée en 3 volets.",
        action: "Générer la campagne",
      },
    ],
    canvas: {
      understandKicker: "Marque assimilée",
      understandBody: "Votre audience réagit particulièrement bien aux récits d'expérience du fondateur.",
      createKicker: "3 opportunités identifiées",
      createPrompt: "Rédiger l'histoire du fondateur",
      createItems: ["Histoire du fondateur", "Analyse du produit", "Résolution du problème client"],
      createAction: "Générer le contenu",
      createPerformance: "Basé sur les performances récentes de votre compte",
      publishKicker: "Campagne prête",
      publishBody: "Planifiée sur Instagram, LinkedIn et TikTok aux heures de pointe d'activité.",
      learnKicker: "Engagement",
      learnBody: "Ce format surpasse nettement la moyenne habituelle de vos canaux.",
      learnSignalKicker: "Signal d'audience détecté",
      learnSignalBody: "Les publications éducatives surpassent les publications promotionnelles de 42%",
      nextMoveKicker: "Prochaine étape recommandée",
      nextMoveBody: "Déclinez votre meilleur post en une campagne en 3 étapes.",
      nextMoveAction: "Générer",
      stageLabels: ["Comprendre", "Créer", "Publier", "Apprendre", "Action Suivante"],
    },
  },
  
  problemSolver: {
    eyebrow: "L'Ancienne Méthode vs L'Approche KoraSpace",
    heading:
      "Ne perdez plus 15+ heures par semaine à lutter contre le manque d'inspiration, copier des textes d'une appli à l'autre et perdre des prospects dans des DMs désordonnés.",
    paragraph:
      "Les outils classiques se contentent de programmer des posts. KoraSpace est un espace autonome à double moteur : un Studio Créateur pour du contenu à haute valeur et un Opérateur Marketing pour convertir les interactions en chiffre d'affaires.",
    pillar1Title: "Cerveau de Marque par IA",
    pillar1Desc:
      "Apprend votre voix unique, vos accroches les plus performantes et vos consignes strictes pour éviter tout texte générique.",
    pillar2Title: "Synchronisation 6 Réseaux",
    pillar2Desc:
      "Planifiez et organisez par glisser-déposer sur Instagram, TikTok, LinkedIn, YouTube, X et Threads dans un seul calendrier.",
    pillar3Title: "CRM Social et Revenus Réels",
    pillar3Desc:
      "Détecte les questions d'achat (« Combien ça coûte ? »), qualifie les leads et attribue des revenus concrets.",
    ctaButton: "Commencer Gratuitement",
    secondaryButton: "Comparer les Deux Modes",
  },
  dualModes: {
    eyebrow: "Deux Modes d'Utilisation Dédiés",
    titleLead: "Conçu pour les",
    titleCreators: "Créateurs",
    titleAnd: "et les",
    titleMarketers: "Équipes Marketing",
    subtitle:
      "Basculez facilement entre le Mode Créateur et le Mode Marketing selon que vous rédigiez du contenu signature ou pilotiez une campagne de conversion complète.",
    creatorStudioTitle: "Studio Voix de Marque et Audience",
    creatorStudioDesc:
      "Pour les créateurs indépendants, leaders d'opinion et influenceurs souhaitant publier avec impact sur 6+ réseaux sans s'épuiser.",
    marketerStudioTitle: "Opérateur Marketing et CRM Social",
    marketerStudioDesc:
      "Pour les équipes marketing, agences et entreprises cherchant à automatiser la qualification de leads et l'attribution des revenus.",
    launchCreator: "Lancer le Studio Créateur",
    launchMarketer: "Lancer l'Opérateur Marketing",
  },
  growthLoop: {
    eyebrow: "La Boucle de Croissance Autonome",
    title: "Un marketing sur les réseaux sociaux qui s'auto-optimise en continu.",
    subtitle:
      "Buffer et Hootsuite vous obligent à tout faire manuellement. KoraSpace réunit compréhension, création, diffusion et attribution des revenus dans un flux continu entièrement automatisé.",
    stage1Title: "Comprendre et Rechercher",
    stage1Desc:
      "Analyse vos directives de marque, vos succès viraux passés et les tendances en direct de votre secteur.",
    stage2Title: "Stratégie et Rédaction",
    stage2Desc:
      "Déroule un pipeline d'IA en 8 étapes avec ajustement du ton, notation du brouillon et double vérification web.",
    stage3Title: "Publication et Tri des Leads",
    stage3Desc:
      "Programme sur 6+ réseaux et surveille les commentaires et DMs pour isoler les intentions d'achat qualifiées.",
    stage4Title: "Mesure et Optimisation",
    stage4Desc:
      "Attribue les clics sociaux aux revenus réels et réinjecte automatiquement ces enseignements dans vos prochaines stratégies.",
    feedsNext: "Alimente l'étape suivante",
  },
  featureRows: {
    composer: {
      badge: "Pipeline de Rédaction IA",
      title: "Transformez la voix de votre marque en publications prêtes à l'emploi",
      description:
        "Exécute un pipeline d'IA en 8 étapes : analyse du secteur -> lecture des posts passés -> détection des tendances -> rédaction du texte et de l'accroche -> attribution des hashtags -> double réflexion web.",
    },
    calendar: {
      badge: "Calendrier Visuel 2.0",
      title: "Planifiez et déplacez votre stratégie de croissance en toute simplicité",
      description:
        "Plateforme visuelle pour planifier, organiser et glisser-déposer vos posts sur Instagram, TikTok, LinkedIn, YouTube, X et Threads sans aucun effort.",
    },
    crm: {
      badge: "Boîte de Réception Sociale et CRM",
      title: "Classez automatiquement vos prospects et messages prioritaires",
      description:
        "Boîte de réception unifiée qui détecte les signaux d'achat (« Quel est le tarif ? »), étiquette les prospects et enregistre les opportunités directement dans le CRM.",
    },
    agency: {
      badge: "Espaces Agences et Multi-Comptes",
      title: "Validation multi-sièges et portails clients dédiés",
      description:
        "Gérez plusieurs espaces clients avec une sécurité stricte au niveau des lignes (RLS). Vos collaborateurs gèrent les comptes et révisent les brouillons pendant que vous gardez le contrôle.",
    },
  },
  features: {
    composerTitle: "Pipeline de Rédaction IA",
    composerTagline: "Moteur de Réflexion Multi-Étapes",
    composerDesc:
      "Exécute un workflow d'IA en 8 étapes : vérification des directives de marque -> analyse des posts viraux -> détection des tendances -> rédaction -> hashtags -> validation web.",
    calendarTitle: "Calendrier Visuel par Glisser-Déposer",
    calendarTagline: "Planification Multi-Réseaux",
    calendarDesc:
      "Un tableau de bord unifié et rapide pour programmer, réorganiser et gérer vos publications sur Instagram, TikTok, LinkedIn, YouTube, X et Threads en toute fluidité.",
    repurposerTitle: "Recycleur de Contenu Intelligent",
    repurposerTagline: "1 Contenu vers 6 Formats",
    repurposerDesc:
      "Transformez une vidéo YouTube, un podcast audio ou un article en carrousels LinkedIn, threads X, reels Instagram et newsletters en un seul clic.",
    inboxTitle: "CRM Social et Qualification de Prospects",
    inboxTagline: "Détection des Intentions d'Achat",
    inboxDesc:
      "Boîte unifiée qui classe les commentaires et DMs en Prospects, Support ou Demandes générales, créant automatiquement des opportunités dans le CRM.",
    agencyTitle: "Espaces Agences et Portails Clients",
    agencyTagline: "Collaboration Multi-Utilisateurs",
    agencyDesc:
      "Conçu pour les agences marketing et équipes de croissance. Gérez plusieurs marques avec permissions RLS strictes, liens de validation sans login et rapports en marque blanche.",
    attributionTitle: "Attribution des Revenus et ROAS",
    attributionTagline: "Analytique sur l'Ensemble du Tunnel",
    attributionDesc:
      "Suivez le parcours complet depuis les impressions sur les réseaux jusqu'aux visites web, leads qualifiés et ventes conclues avec des données tangibles.",
  },
  featureShowcase: [
    {
      id: "ai-composer",
      title: "Pipeline de Rédaction IA",
      tagline: "Moteur de Réflexion Multi-Étapes",
      description:
        "Exécute un workflow d'IA en 8 étapes : vérification des directives de marque -> analyse des posts viraux -> détection des tendances -> rédaction -> hashtags -> validation web.",
      tone: "pink",
    },
    {
      id: "visual-calendar",
      title: "Calendrier Visuel par Glisser-Déposer",
      tagline: "Planification Multi-Réseaux",
      description:
        "Un tableau de bord unifié et rapide pour programmer, réorganiser et gérer vos publications sur Instagram, TikTok, LinkedIn, YouTube, X et Threads en toute fluidité.",
      tone: "pink",
    },
    {
      id: "repurposer",
      title: "Recycleur de Contenu Intelligent",
      tagline: "1 Contenu vers 6 Formats",
      description:
        "Transformez une vidéo YouTube, un podcast audio ou un article en carrousels LinkedIn, threads X, reels Instagram et newsletters en un seul clic.",
      tone: "pink",
    },
    {
      id: "inbox-crm",
      title: "CRM Social et Qualification de Prospects",
      tagline: "Détection des Intentions d'Achat",
      description:
        "Boîte unifiée qui classe les commentaires et DMs en Prospects, Support ou Demandes générales, créant automatiquement des opportunités dans le CRM.",
      tone: "blue",
    },
    {
      id: "agency-workspaces",
      title: "Espaces Agences et Portails Clients",
      tagline: "Collaboration Multi-Utilisateurs",
      description:
        "Conçu pour les agences marketing et équipes de croissance. Gérez plusieurs marques avec permissions RLS strictes, liens de validation sans login et rapports en marque blanche.",
      tone: "blue",
    },
    {
      id: "growth-marketing",
      title: "Attribution des Revenus et ROAS",
      tagline: "Analytique sur l'Ensemble du Tunnel",
      description:
        "Suivez le parcours complet depuis les impressions sur les réseaux jusqu'aux visites web, leads qualifiés et ventes conclues avec des données tangibles.",
      tone: "blue",
    },
  ],
  brandBrain: {
    eyebrow: "Architecture Multi-Agents par IA",
    title: "Propulsé par le Cerveau de Marque Kora et un Essaim de 8 Agents",
    subtitle:
      "Plutôt que de simples prompts ponctuels et génériques, KoraSpace orchestre un essaim d'agents spécialisés connectés à votre base de connaissances persistante.",
    brainTitle: "Cerveau de Marque KoraSpace",
    brainDesc:
      "Renseignez l'URL de votre site, vos briefs produits, votre charte éditoriale et vos meilleurs posts passés. Le Cerveau de Marque crée une mémoire pérenne pour que chaque publication reflète votre identité.",
    brainCheck1: "Apprend votre ton distinctif, votre vocabulaire et vos emojis",
    brainCheck2: "Applique vos garde-fous stricts (« Ne jamais citer les concurrents »)",
    brainCheck3: "Utilise vos contenus historiques les plus performants comme référence",
    swarmTitle: "Essaim Autonome de 8 Agents Spécialisés",
    swarmAgents: [
      { name: "Agent de Recherche", role: "Scanne les tendances et données web de votre niche" },
      { name: "Gardien de la Voix", role: "Garantit le respect du ton et des directives de marque" },
      { name: "Agent Créatif", role: "Rédige légendes, carrousels et scripts de vidéo" },
      { name: "Agent Stratégie", role: "Élabore des plans de croissance à 30/60/90 jours" },
      { name: "Agent Analytique", role: "Mesure les performances du tunnel et le ROAS" },
      { name: "Agent Veille Concurrentielle", role: "Surveille les formats et accroches des rivaux" },
      { name: "Agent Qualification Leads", role: "Gère les DMs et identifie les prospects chauds" },
      { name: "Agent Optimisation", role: "Calcule les scores prédictifs et tests A/B" },
    ],
  },
  agentTools: {
    eyebrow: "Boîte à Outils Autonome",
    title: "Boostez votre impact sur les réseaux avec des outils d'IA dédiés",
    subtitle:
      "Tout ce dont vous avez besoin pour automatiser vos flux marketing à fort impact, de l'idée initiale à l'attribution du chiffre d'affaires.",
    list: [
      {
        title: "Pipeline de Rédaction IA en 8 Étapes",
        desc: "Vérifie le contexte, les posts passés et tendances, rédige le contenu, attribue les hashtags et valide avant diffusion.",
        badge: "Moteur de Création",
        tone: "pink",
      },
      {
        title: "Prédicteur de Score d'Engagement",
        desc: "L'IA évalue la force de l'accroche et la probabilité d'interaction (1-100) avant la publication.",
        badge: "Optimisation",
        tone: "pink",
      },
      {
        title: "CRM Social et Mode Fantôme™",
        desc: "Veille automatisée des DMs avec délais d'apparence humaine pour détecter les intentions d'achat et créer des leads.",
        badge: "Automatisation",
        tone: "blue",
      },
      {
        title: "Analyseur de Vidéos Concurrentes",
        desc: "Décortique les vidéos courtes virales de votre secteur pour révéler leurs accroches, leur rythme et leurs appels à l'action.",
        badge: "Intelligence",
        tone: "blue",
      },
      {
        title: "Générateur de Hashtags et Mots-Clés",
        desc: "Génère des grappes de hashtags optimisées pour maximiser la visibilité algorithmique.",
        badge: "Portée",
        tone: "pink",
      },
      {
        title: "Recycleur Multi-Plateformes",
        desc: "Transforme 1 vidéo, fichier audio ou article en carrousels LinkedIn, threads X et reels en quelques secondes.",
        badge: "Recyclage",
        tone: "pink",
      },
    ],
  },
  integrationsSection: {
    eyebrow: "Écosystème Multi-Plateformes",
    titleLead: "Publiez et échangez sur",
    titleHighlight: "tous vos canaux favoris",
    subtitle: "Intégrations officielles via l'API OAuth 2.0 pour une planification instantanée et une messagerie bidirectionnelle.",
  },
  revenueAttribution: {
    eyebrow: "Suivi des Revenus et de la Conversion",
    titleLead: "Des impressions sur les réseaux aux",
    titleHighlight: "revenus concrets dans votre portefeuille",
    subtitle:
      "Arrêtez de deviner le retour sur investissement de vos publications. Suivez le parcours complet depuis les vues jusqu'aux ventes finales conclues.",
    funnelTitle: "Tunnel Social vers Chiffre d'Affaires",
    funnelSubtitle: "Attribution en temps réel propulsée par le suivi UTM",
    liveSync: "Synchronisation Directe",
    impressionsLabel: "50 000 Impressions Sociales",
    impressionsVal: "Haut du Tunnel",
    visitsLabel: "1 420 Visites de Profil",
    visitsVal: "2,84% Conversion",
    clicksLabel: "310 Clics vers le Site Web",
    clicksVal: "Vérifié par UTM",
    leadsLabel: "48 Prospects Qualifiés",
    leadsVal: "Pipeline CRM Social",
    closedCustomers: "14 Ventes Conclues",
    revenueVal: "12 450 € Chiffre d'Affaires",
    attributionModel: "Modèle d'Attribution : Multi-Touch",
    roas: "ROAS : 4,2x",
    koraScoreLabel: "Score de Santé du Compte",
    koraScoreTip: "Régularité de publication dans le top 5%. Planifiez 2 vidéos courtes supplémentaires pour atteindre le pic de visibilité.",
    radarTitle: "Radar d'Opportunités de Vente",
    radarHeading: "4 Opportunités Clés Détectées dans votre Niche",
    radarDesc: "3 questions à forte intention d'achat dans les DMs Instagram + 1 format viral émergent chez vos concurrents.",
  },
  collaboration: {
    eyebrow: "Espaces de Travail Équipes et Agences",
    title: "Collaborez en toute fluidité avec des accès multi-sièges",
    subtitle:
      "Conçu pour les agences marketing, équipes de marque et responsables de la croissance qui pilotent plusieurs clients sous un même toit.",
    list: [
      {
        title: "Portails Espaces Clients Dédiés",
        desc: "Environnements de marque isolés avec sécurité stricte par ligne. Offrez à vos clients un aperçu clair de leur calendrier et rapports.",
      },
      {
        title: "Liens de Validation de Brouillons en 1 Clic",
        desc: "Envoyez des liens de révision directs à vos clients sans les contraindre à créer un compte ni à se connecter.",
      },
      {
        title: "Gestion des Rôles et Permissions d'Équipe",
        desc: "Attribuez des rôles (Admin, Éditeur, Réviseur, Client) avec des droits précis sur la publication, la facturation et les accès.",
      },
      {
        title: "Journal d'Audit et Historique des Activités",
        desc: "Suivez chaque modification, validation, mise à jour de consigne et publication avec horodatage complet et nom de l'auteur.",
      },
    ],
  },
  stories: {
    eyebrow: "Témoignages Clients",
    title: "Adopté par les créateurs, fondateurs et équipes de croissance",
    subtitle: "Découvrez comment des entreprises du monde entier démultiplient leur impact et leurs ventes avec KoraSpace.",
    list: [
      {
        name: "Sophie Bertrand",
        role: "Fondatrice Tech et Créatrice, Paris",
        avatar: "SB",
        text: "J'ai remplacé Buffer et un freelance par KoraSpace. L'agent d'IA gère le tri des commentaires et planifie le contenu hebdomadaire pendant que je signe des contrats.",
        highlight: "15 h économisées / semaine",
        tone: "pink",
      },
      {
        name: "Julien Mercier",
        role: "Directeur d'Agence Digitale, Lyon",
        avatar: "JM",
        text: "Gérer 8 comptes clients nécessitait trois managers juniors. Aujourd'hui, je gère tout seul avec KoraSpace. Les liens de validation client simplifient tout.",
        highlight: "Gère 8 marques en solo",
        tone: "blue",
      },
      {
        name: "Camille Faure",
        role: "Fondatrice E-Commerce, Bordeaux",
        avatar: "CF",
        text: "Le CRM Social a détecté les questions d'achat dans nos commentaires Instagram et a généré 4 800 € de ventes directes en 2 semaines seulement.",
        highlight: "4 800 € de ventes directes",
        tone: "blue",
      },
      {
        name: "Thomas Vaneau",
        role: "Coach en Marque Personnelle, Bruxelles",
        avatar: "TV",
        text: "L'option Tendance-vers-Brouillon est comme avoir un rédacteur qui ne dort jamais. Elle capte les actualités et prépare trois brouillons avant mon réveil.",
        highlight: "Toujours à la pointe des tendances",
        tone: "pink",
      },
      {
        name: "Léa Delorme",
        role: "Directrice de Marque de Mode, Genève",
        avatar: "LD",
        text: "J'avais peur que l'IA ne saisisse pas mon ton. Le Cerveau de Marque a si bien appris de nos meilleurs posts que nos abonnés n'ont vu aucune différence.",
        highlight: "Voix de marque 100% fidèle",
        tone: "pink",
      },
      {
        name: "Alexandre Roux",
        role: "Responsable Marketing B2B SaaS, Montréal",
        avatar: "AR",
        text: "Une tarification limpide et une prise en main immédiate ont convaincu notre équipe dès le premier jour. L'attribution multi-canaux est remarquable.",
        highlight: "Attribution ROI ultra-claire",
        tone: "blue",
      },
    ],
  },
  pricing: {
    eyebrow: "Tarification Transparente",
    titleLead: "Des forfaits simples.",
    titleHighlight: "Une valeur prévisible.",
    subtitle:
      "Facturé dans votre devise locale. Changez de formule ou résiliez à tout moment. Chaque forfait payant inclut 14 jours d'essai gratuit.",
    monthlyBilling: "Facturation Mensuelle",
    annualBilling: "Facturation Annuelle",
    discountBadge: "20% DE RÉDUCTION",
    perMonth: "/mois",
    billedAnnually: "/mois (facturation annuelle)",
                                    enterpriseTitle: "Espaces Grands Comptes et Haut Volume sur Mesure",
    enterpriseDesc:
      "Besoin de modèles personnalisés, d'IPs dédiées, de garanties SLA ou de plus de 20 accès d'équipe ?",
    enterpriseButton: "Contacter l'Équipe Commerciale",
    plans: [
      {
            planKey: "free",
            name: "Gratuit",
            desc: "Pour les individus qui débutent.",
            posts: "3 publications à vie",
            features: [
                  "3 intégrations",
                  "50k jetons IA à vie",
                  "0 collaborateurs",
                  "Pages d'Analyses et d'Aperçu",
                  "Support Client"
            ],
            cta: "Commencer Gratuitement"
      },
      {
            planKey: "pro",
            name: "Pro",
            desc: "Pour les créateurs en croissance.",
            posts: "5 publications / semaine",
            features: [
                  "7 intégrations",
                  "1.6M jetons IA / mois",
                  "3 collaborateurs",
                  "5 bots max",
                  "Toutes les pages (Pas de page Marketer)"
            ],
            cta: "Obtenir Pro",
            highlight: true,
            badge: "Populaire"
      },
      {
            planKey: "advanced",
            name: "Avancé",
            desc: "Pour les utilisateurs avancés.",
            posts: "15 publications à vie",
            features: [
                  "10 intégrations",
                  "3.5M jetons IA / mois",
                  "Gestionnaire de Hashtags",
                  "7 collaborateurs",
                  "15 bots gérés",
                  "Page Marketer incluse"
            ],
            cta: "Obtenir Avancé"
      },
      {
            planKey: "team",
            name: "Équipes",
            desc: "Pour les grandes agences.",
            posts: "Publications illimitées",
            features: [
                  "Intégrations illimitées",
                  "7.2M jetons IA / mois",
                  "Collaborateurs illimités",
                  "Bots illimités",
                  "Toutes les fonctionnalités incluses"
            ],
            cta: "Contacter les Ventes"
      }
],
  },
  faq: {
    eyebrow: "Foire Aux Questions",
    title: "Des questions ? Nous avons les réponses.",
    subtitle:
      "Tout ce que vous devez savoir sur KoraSpace, nos deux modes opératoires, la sécurité et les tarifs.",
    q1: "Quelle est la différence entre le Mode Créateur et le Mode Marketing ?",
    a1: "Le Mode Créateur s'adresse aux créateurs, fondateurs et influenceurs désireux d'apprendre la voix de leur marque, de composer par IA, de recycler du contenu et de planifier sur 6+ réseaux ; tandis que le Mode Marketing est conçu pour les équipes et agences cherchant à piloter des campagnes, convertir les commentaires/DMs en opportunités CRM et mesurer le chiffre d'affaires généré.",
    q2: "Comment le Cerveau de Marque garantit-il que les textes sonnent comme moi ?",
    a2: "Il vous suffit de renseigner l'URL de votre site, votre charte de marque ou vos meilleurs posts historiques. Le Cerveau de Marque construit un profil de mémoire pérenne intégrant votre vocabulaire et vos règles de ton pour que chaque publication générée paraisse 100% authentique.",
    q3: "Quelles sont les plateformes de réseaux sociaux compatibles ?",
    a3: "KoraSpace se connecte directement via les API officielles autorisées OAuth 2.0 à Instagram, TikTok, LinkedIn, YouTube, X (Twitter), Facebook, Threads, WhatsApp, Telegram et d'autres.",
    q4: "Comment fonctionne la qualification des prospects avec le Mode Fantôme™ ?",
    a4: "Le Mode Fantôme™ surveille vos commentaires et messages directs en temps réel. Grâce au traitement du langage naturel et à des délais d'attente d'allure humaine, il détecte les demandes d'achat (« Quel est le prix ? ») et enregistre automatiquement les prospects qualifiés dans votre CRM.",
    q5: "Puis-je utiliser KoraSpace pour gérer plusieurs clients dans une agence ?",
    a5: "Oui, absolument ! Le forfait Agences comprend des portails dédiés et étanches pour chaque client, des droits d'accès granulaires, des liens de révision sans création de compte requise pour vos clients et des rapports personnalisables.",
    q6: "Quels sont les moyens de paiement acceptés ?",
    a6: "Nous acceptons toutes les cartes de crédit/débit majeures (Visa, Mastercard, American Express), Apple Pay, Google Pay ainsi que les moyens de paiement régionaux les plus courants.",
  },
  cta: {
    eyebrow: "14 Jours d'Essai Gratuit - Sans Carte Bancaire",
    titleLead: "Votre équipe marketing autonome par IA",
    titleHighlight: "démarre aujourd'hui.",
    subtitle:
      "Rejoignez des milliers de créateurs, fondateurs et experts marketing qui automatisent leur production de contenu, leur planning, leur CRM et leur croissance de chiffre d'affaires.",
    startTrial: "Commencer Gratuitement",
    signIn: "Accéder à l'Espace de Travail",
    feature1: "Configuration ultra-rapide en 2 minutes",
    feature2: "Compatible avec 6+ réseaux sociaux",
  },
  footer: {
    brandDesc:
      "Système d'exploitation marketing autonome par IA conçu pour les créateurs modernes, les startups et les agences.",
    productHeading: "Produit",
    platformHeading: "Plateforme",
    legalHeading: "Mentions Légales",
    supportHeading: "Support",
    directContact: "Contact Direct",
    rightsReserved: "KoraSpace par Techla. Tous droits réservés.",
    builtLocation: "Moteur Marketing IA Mondial",
    links: {
      product: [
        { label: "Pipeline de Rédaction IA", href: "#engines" },
        { label: "Calendrier Visuel 2.0", href: "#engines" },
        { label: "Cerveau de Marque", href: "#brain" },
        { label: "Boucle de Croissance Autonome", href: "#how" },
        { label: "Formules & Tarifs", href: "#pricing" },
      ],
      platform: [
        { label: "Intégration Instagram", href: "#integrations" },
        { label: "Planificateur TikTok", href: "#integrations" },
        { label: "Diffuseur LinkedIn & X", href: "#integrations" },
        { label: "Recycleur YouTube", href: "#integrations" },
        { label: "CRM WhatsApp & Telegram", href: "#integrations" },
      ],
      legal: [
        { label: "Politique de Confidentialité", href: "/privacy" },
        { label: "Conditions Générales d'Utilisation", href: "/terms" },
        { label: "Protection des Données", href: "/privacy" },
        { label: "Gestion des Cookies", href: "/privacy" },
      ],
      support: [
        { label: "Documentation", href: "#" },
        { label: "Centre d'Aide", href: "#" },
        { label: "Communauté", href: "#" },
        { label: "État du Service", href: "#" },
      ],
    },
  },
  common: {
    exploreFeature: "Découvrir la Fonctionnalité",
    launchStudio: "Lancer l'Espace",
    viewPricing: "Consulter les Tarifs",
    loading: "Chargement...",
    secureBadge: "Accès Sécurisé",
  },
};
