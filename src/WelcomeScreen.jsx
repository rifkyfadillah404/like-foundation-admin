import { motion } from 'framer-motion';
import './WelcomeScreen.css';

export default function WelcomeScreen({ onEnter }) {
  return (
    <div 
      className="welcome-container"
      style={{ backgroundImage: 'url(/1.jpg)' }}
    >
      <div className="welcome-overlay"></div>
      
      <div className="welcome-content">
        {/* Logo */}
        <motion.div 
          className="welcome-logo-container"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 100,
            damping: 15,
            duration: 0.8
          }}
        >
          <motion.img 
            src="/3.png" 
            alt="LIKE Foundation" 
            className="welcome-logo"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
        </motion.div>

        {/* Title */}
        <motion.h1 
          className="welcome-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Selamat Datang
        </motion.h1>
        
        {/* Description */}
        <motion.p 
          className="welcome-description"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          LIKE Foundation - Lingkar Insan Kebaikan
          <br />
          Bersama membangun kebaikan untuk sesama
        </motion.p>

        {/* Button */}
        <motion.button
          onClick={onEnter}
          className="welcome-button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0,0,0,0.4)' }}
          whileTap={{ scale: 0.95 }}
        >
          Masuk
        </motion.button>
      </div>
    </div>
  );
}
