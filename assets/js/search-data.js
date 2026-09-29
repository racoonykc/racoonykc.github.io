// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-blog",
          title: "blog",
          description: "Research notes by Kaicheng Yang.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "nav-publications",
          title: "publications",
          description: "Papers and preprints on model quantization, diffusion models, and efficient machine learning.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-news",
          title: "news",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/news/";
          },
        },{id: "nav-projects",
          title: "projects",
          description: "Selected projects by Kaicheng Yang.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "post-justquant-革命性简单-强大的模型量化方法",
        
          title: "JustQuant：革命性简单、强大的模型量化方法",
        
        description: "仅用纯低比特矩阵算子达到强大的模型质量与部署潜力。",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/justquant-zh/";
          
        },
      },{id: "post-justquant-you-don-39-t-need-smoothing-svd-or-rotation-for-4-bit-activation-quantization",
        
          title: "JustQuant: You Don&#39;t Need Smoothing, SVD, or Rotation for 4-Bit Activation Quantization",
        
        description: "Notes on plain low-bit operators and progressive distillation.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/justquant/";
          
        },
      },{id: "news-bimacosr-accepted-to-icml-2025",
          title: 'BiMaCoSR accepted to ICML 2025.',
          description: "",
          section: "News",},{id: "news-nsfc-undergraduate-research-project-support",
          title: 'NSFC undergraduate research project support.',
          description: "",
          section: "News",},{id: "news-three-preprints-released-on-arxiv",
          title: 'Three preprints released on arXiv.',
          description: "",
          section: "News",},{id: "news-national-challenge-cup-grand-prize",
          title: 'National Challenge Cup Grand Prize.',
          description: "",
          section: "News",},{id: "news-pt-2-llm-accepted-to-iclr-2026",
          title: 'PT^2-LLM accepted to ICLR 2026.',
          description: "",
          section: "News",},{id: "news-three-preprints-released-on-arxiv",
          title: 'Three preprints released on arXiv.',
          description: "",
          section: "News",},{id: "news-robuq-info-gain-and-q-dit4sr-accepted-to-icml-2026",
          title: 'RobuQ, Info-Gain, and Q-DiT4SR accepted to ICML 2026.',
          description: "",
          section: "News",},{id: "news-joined-spherelab-at-the-chinese-university-of-hong-kong-as-an-incoming-phd-student-working-with-prof-weiyang-liu",
          title: 'Joined SphereLab at The Chinese University of Hong Kong as an incoming PhD...',
          description: "",
          section: "News",},{id: "news-we-released-justquant",
          title: 'We released JustQuant. ↗',
          description: "",
          section: "News",},{id: "projects-justquant",
          title: 'JustQuant',
          description: "Plain low-bit operators. Intelligence preserved through progressive distillation.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/justquant/";
            },},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%6B%61%69%63%68%65%6E%67%79%36%32@%67%6D%61%69%6C.%63%6F%6D", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/racoonykc", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
