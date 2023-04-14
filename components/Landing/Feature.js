import React from 'react';
import { motion, useAnimation } from 'framer-motion';
import { AiOutlineBuild, AiOutlineUsergroupAdd, AiOutlineEdit, AiOutlineDashboard } from 'react-icons/ai';
import { useInView } from 'react-intersection-observer';

const Feature = ({ icon, title, content, color }) => {
  const IconComponent = {
    build: AiOutlineBuild,
    usergroup: AiOutlineUsergroupAdd,
    edit: AiOutlineEdit,
    dashboard: AiOutlineDashboard,
  }[icon];

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
    className="flex flex-col space-y-4 w-80 mx-auto"
    initial="hidden"
    animate={controls}
    transition={{ duration: 1 }}
    variants={fadeInDown}
  >
    <div className="flex justify-start items-start space-x-4">
    <div>
      <IconComponent color={color} size={30} />
      </div>
      <div className="flex flex-col space-y-2">
        <h3 className="font-bold text-lg text-gray-800">{title}</h3>
        <p className="text-gray-600">{content}</p>
      </div>
    </div>
  </motion.div>
  );
};

export default Feature;
