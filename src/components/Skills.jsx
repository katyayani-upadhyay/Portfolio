import { motion } from 'framer-motion';
import { skills } from '../data/portfolioData';
import SectionTitle from './SectionTitle';

const skillCategoryVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { staggerChildren: 0.1, duration: 0.5 }
  },
};

const skillItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const SkillCard = ({ name, icon }) => (
  <motion.div
    variants={skillItemVariants}
    className="flex flex-col items-center p-4 bg-secondary-bg rounded-lg shadow-md hover:shadow-accent-1/10 transition-shadow duration-300"
    whileHover={{ y: -5 }}
  >
    <div className="text-accent-1 text-3xl mb-2">{icon}</div>
    <span className="text-text-primary text-sm font-mono">{name}</span>
  </motion.div>
);

const Skills = () => {
  return (
    <section id="skills" className="py-20 bg-primary-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle id="skills-title">Skills & Tech Stack</SectionTitle>
        
        <div className="space-y-12">

          {/* Programming Languages */}
          <motion.div variants={skillCategoryVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            <h3 className="text-2xl font-semibold text-accent-2 mb-6 font-mono text-center sm:text-left">
              Programming Languages
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {skills?.programming?.map((skill, index) => (
                <SkillCard key={index} name={skill.name} icon={skill.icon} />
              ))}
            </div>
          </motion.div>

          {/* Libraries & Frameworks */}
          <motion.div variants={skillCategoryVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            <h3 className="text-2xl font-semibold text-accent-2 mb-6 font-mono text-center sm:text-left">
              Libraries & Frameworks
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {skills?.librariesAndFrameworks?.map((skill, index) => (
                <SkillCard key={index} name={skill.name} icon={skill.icon} />
              ))}
            </div>
          </motion.div>

          {/* Tools & Deployment */}
          <motion.div variants={skillCategoryVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            <h3 className="text-2xl font-semibold text-accent-2 mb-6 font-mono text-center sm:text-left">
              Tools & Deployment
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {skills?.toolsAndDeployment?.map((skill, index) => (
                <SkillCard key={index} name={skill.name} icon={skill.icon} />
              ))}
            </div>
          </motion.div>

          {/* Machine Learning Skills */}
          <motion.div variants={skillCategoryVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            <h3 className="text-2xl font-semibold text-accent-2 mb-6 font-mono text-center sm:text-left">
              Machine Learning
            </h3>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              {skills?.machineLearning?.map((item, index) => (
                <motion.span
                  key={index}
                  variants={skillItemVariants}
                  className="bg-secondary-bg text-text-secondary py-2 px-4 rounded-full text-sm font-mono shadow-sm"
                >
                  {item}
                </motion.span>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Skills;