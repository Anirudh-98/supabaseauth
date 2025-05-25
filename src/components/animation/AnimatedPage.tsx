import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedPageProps {
  children: ReactNode;
  className?: string; // Optional className for custom styling of the motion.div
}

const AnimatedPage: React.FC<AnimatedPageProps> = ({ children, className }) => {
  return (
    // AnimatePresence is useful if you're animating routes/components that can enter and exit
    // For simple page load animation, it might not be strictly necessary unless
    // the component is unmounted as part of a route change that also involves animations.
    // Including it here for completeness as it's often used with page transitions.
    <AnimatePresence mode="wait"> 
      <motion.div
        key={React.Children.count(children)} // Using key helps AnimatePresence detect changes
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }} // y: -20 for exit to animate upwards
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className={className} // Apply optional className
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimatedPage;
