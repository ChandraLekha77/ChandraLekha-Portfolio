export const motionConfig = {
  timing: {
    micro: 0.2,       // 200ms
    component: 0.45,  // 450ms
    section: 0.8,     // 800ms
    cinematic: 1.2    // 1200ms
  },
  
  ease: {
    editorial: [0.16, 1, 0.3, 1],      // Swift out, gentle settling
    expressive: [0.25, 0.1, 0.25, 1],   // Smooth mechanical
    snappy: [0.4, 0, 0.2, 1],          // Interactive feedback
    linear: [0, 0, 1, 1]
  }
};

export const maskRevealVariants = {
  hidden: {
    clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
    y: 20,
    opacity: 0
  },
  visible: (custom = 0) => ({
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    y: 0,
    opacity: 1,
    transition: {
      duration: motionConfig.timing.section,
      ease: motionConfig.ease.editorial,
      delay: custom * 0.1
    }
  })
};

export const horizontalRuleVariants = {
  hidden: { scaleX: 0, transformOrigin: "left center" },
  visible: {
    scaleX: 1,
    transition: {
      duration: motionConfig.timing.component,
      ease: motionConfig.ease.editorial
    }
  }
};

export const kineticCharVariants = {
  hidden: { y: "105%", opacity: 0 },
  visible: (i) => ({
    y: "0%",
    opacity: 1,
    transition: {
      duration: motionConfig.timing.cinematic,
      ease: motionConfig.ease.editorial,
      delay: i * 0.03
    }
  })
};
