import { 
  FaGithub, 
  FaLinkedin, 
  FaEnvelope, 
  FaPhone,
  FaPython,
  FaDatabase 
} from 'react-icons/fa';

import { 
  SiScikitlearn,
  SiTensorflow,
  SiPytorch,
  SiNumpy,
  SiPandas,
  SiFlask,
  SiStreamlit,
  SiJupyter,
  SiGooglecolab,
  SiMysql,
  SiGit
} from 'react-icons/si';
import { FaJava } from 'react-icons/fa';


/* ================= PERSONAL INFO ================= */

export const personalInfo = {
  name: "Katyayani Upadhyay",
  title: "Applied AI/ML Engineer | Data Science Engineer",
  email: "katyayani1612@gmail.com",
  phone: "+91-9305234316",
  linkedin: "https://www.linkedin.com/in/katyayani-upadhyay",
  github: "https://www.github.com/katyayani-upadhyay",
  resumeLink: "/Resume.pdf",
  bio: "Applied AI-ML Engineer with hands-on experience in building, evaluating, and deploying machine learning models for audio and NLP tasks across large-scale datasets. Skilled in end-to-end ML pipelines from data preprocessing to inference and deployment.",
  shortBio: "Applied AI/ML Engineer | Data Science Engineer"
};


/* ================= EDUCATION ================= */

export const education = [
  {
    institution: "A.P.J. Abdul Kalam Technical University",
    degree: "B.Tech in Computer Science (Artificial Intelligence & Machine Learning)",
    duration: "2022 – 2026",
    score: "CGPA: 8.9",
  },
];


/* ================= WORK EXPERIENCE ================= */

export const workExperience = [
  {
    role: "AI/ML Intern",
    organization: "NIELIT, Lucknow",
    duration: "Aug 2025 – Jan 2026",
    points: [
      "Built and validated ML models on 50,000+ records with preprocessing, feature engineering and EDA.",
      "Trained supervised classification models using Scikit-learn with cross-validation and hyperparameter tuning.",
      "Engineered 13–40 MFCC audio features and integrated into scalable ML pipelines.",
      "Collaborated with 15+ member ML team to optimize model evaluation and workflows."
    ],
  },
];


/* ================= PROJECTS ================= */

export const projects = [
  {
    title: "Speech Emotion Recognition",
    tech: [
      "Python",
      "Librosa",
      "Scikit-learn",
      "MFCC",
      "Flask",
      "Matplotlib"
    ],
    description:
      "Architected an end-to-end audio ML pipeline handling 6 emotion classes across 10k+ samples. Extracted 13–40 MFCC features and trained supervised classifiers. Benchmarked using accuracy, precision, recall, confusion matrix and deployed via Flask API serving 100+ predictions.",
    date: "2025",
    githubLink: "https://github.com/katyayani-upadhyay/Speech-Emotion-Recognition",
    category: "Audio Machine Learning",
    icon: <FaPython size={24} className="text-accent-1" />,
  },
  {
    title: "Fake News Detection using Machine Learning",
    tech: [
      "Python",
      "TF-IDF",
      "Logistic Regression",
      "Scikit-learn",
      "NLTK"
    ],
    description:
      "Built an NLP text classification system using TF-IDF and Logistic Regression achieving 94.5% accuracy. Processed and engineered features from 20k+ documents.",
    date: "2025",
    githubLink: "https://github.com/katyayani-upadhyay/Fake-News-Detection",
    category: "Natural Language Processing",
    icon: <SiScikitlearn size={24} className="text-accent-1" />,
  },
  {
    title: "Real Estate Price Prediction",
    tech: [
      "Python",
      "Regression",
      "EDA",
      "Feature Engineering",
      "Pandas",
      "Scikit-learn"
    ],
    description:
      "Developed regression models on 1,000+ structured housing records. Applied EDA, feature engineering and evaluated performance on 20% held-out validation data using regression metrics.",
    date: "2025",
    githubLink: "https://github.com/katyayani-upadhyay/Real-Estate-Price-Prediction",
    category: "Regression Modeling",
    icon: <FaDatabase size={24} className="text-accent-1" />,
  },
];


/* ================= SKILLS ================= */

export const skills = {
  machineLearning: [
    "Supervised Learning",
    "Classification",
    "Regression",
    "Feature Engineering",
    "Model Evaluation",
    "Cross-Validation",
    "Hyperparameter Tuning"
  ],

  programming: [
    { name: "Python", icon: <FaPython /> },
    { name: "SQL", icon: <FaDatabase /> },
    { name: "Java", icon: <FaJava /> }
  ],

  librariesAndFrameworks: [
    { name: "Scikit-learn", icon: <SiScikitlearn /> },
    { name: "TensorFlow", icon: <SiTensorflow /> },
    { name: "Keras", icon: <SiTensorflow /> },
    { name: "PyTorch", icon: <SiPytorch /> },
    { name: "NumPy", icon: <SiNumpy /> },
    { name: "Pandas", icon: <SiPandas /> },
    { name: "Librosa", icon: <FaPython /> },
  ],

  nlpAndAudio: [
    "TF-IDF",
    "Text Classification",
    "MFCC",
    "Spectrograms"
  ],

  toolsAndDeployment: [
    { name: "Flask", icon: <SiFlask /> },
    { name: "Streamlit", icon: <SiStreamlit /> },
    { name: "Git", icon: <SiGit /> },
    { name: "Jupyter Notebook", icon: <SiJupyter /> },
    { name: "Google Colab", icon: <SiGooglecolab /> }
  ],

  softSkills: [
    "Leadership",
    "Team Collaboration",
    "Analytical Thinking",
    "Problem Solving",
    "Communication"
  ],

  spokenLanguages: [
    "English (Advanced)",
    "Hindi (Native)",
    "Spanish (Intermediate)"
  ],

  interests: [
    "Literary Exploration",
    "Creative Illustration"
  ]
};


/* ================= LEADERSHIP ================= */

export const leadership = [
  {
    role: "Chairperson",
    organization: "IEEE, AIMT",
    duration: "Jan 2024 – Apr 2025",
    points: [
      "Led 50+ volunteers and organized 20+ technical events.",
      "Increased student engagement by 60% through strategic event planning."
    ],
  },
];


/* ================= SOCIAL LINKS ================= */

export const socialLinks = {
  linkedin: { 
    url: personalInfo.linkedin, 
    icon: <FaLinkedin size={24} /> 
  },
  github: { 
    url: personalInfo.github, 
    icon: <FaGithub size={24} /> 
  },
  email: { 
    url: `mailto:${personalInfo.email}`, 
    icon: <FaEnvelope size={24} /> 
  },
  phone: {
    url: `tel:${personalInfo.phone}`,
    icon: <FaPhone size={24} />
  }
};