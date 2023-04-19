import React from 'react';
import { motion, useAnimation } from 'framer-motion';
import { AiOutlineBuild, AiOutlineUsergroupAdd, AiOutlineEdit, AiOutlineDashboard } from 'react-icons/ai';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';

const AboutMe = ({ }) => {

  const fadeInDown = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
  };

  const controls = useAnimation();
  const { ref, inView } = useInView({
    threshold: 0.1,
  });

  React.useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else {
      controls.start('hidden');
    }
  }, [controls, inView]);

  return (
    <motion.div
    ref={ref}
    className="flex flex-col space-y-4 w-full lg:w-[30rem] mx-auto"
    initial="hidden"
    animate={controls}
    transition={{ duration: 1 }}
    variants={fadeInDown}
  >
  <p>
  <h2 className="text-xl font-semibold  text-center" >
  AeshManager est propulsé par William</h2>
  <h2 className="text-xl font-semibold mb-6 text-center">
  Envoyez moi un  à <a href="mailto:contact@williamdev.fr">contact@williamdev.fr</a>
  </h2>
  </p>
  <p className=" text-sm font-semibold mb-6 text-center">
  Disponible pour l'ensemble de vos projets web et mobile. Je vous garantis un résultat efficace, rapide et optimisé.
  </p>
  </motion.div>
  );
};

export default AboutMe;
