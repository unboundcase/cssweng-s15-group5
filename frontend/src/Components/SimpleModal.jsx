import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// NOTE: imageCenter is an html tag
export default function SimpleModal({ isOpen, onClose, title, imageCenter,
  bodyText, confirm = false, onConfirm, onCancel }) {
  
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isSmallScreen = windowWidth <= 800;
  const modalClasses = isSmallScreen 
    ? "relative bg-white rounded-lg drop-shadow-card w-[calc(100%-4rem)] max-w-[90vw] min-h-[30rem] z-10 overflow-hidden flex flex-col mx-8"
    : "relative bg-white rounded-lg drop-shadow-card max-w-[80rem] w-full min-h-[30rem] z-10 overflow-hidden flex flex-col";
  
  return (
    <AnimatePresence>
      {isOpen && (<motion.div
        className="fixed inset-0 flex items-center justify-center z-99"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}>

        <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

        <div className={modalClasses}>
          <div className='w-full p-5 drop-shadow-base' style={{ backgroundColor: "var(--accent-white)" }}>
            <h2 className="header-sub">{title}</h2>
          </div>

          <div className='flex flex-col justify-between flex-1 p-10 text-center'>

            {imageCenter && imageCenter}

            <p className="font-label my-15">{bodyText}</p>

            <div className="flex justify-center gap-10 mt-10">
              {confirm ? (
                <>
                  <button className="btn-outline font-bold-label drop-shadow-base"
                    onClick={() => {
                      onCancel?.();
                      onClose();
                    }}>
                    Cancel
                  </button>
                  <button
                    className="btn-primary font-bold-label drop-shadow-base"
                    onClick={() => {
                      onConfirm?.();
                    }}>
                    Confirm
                  </button>
                </>
              ) : (
                <button
                  className="btn-outline font-bold-label"
                      onClick={() => {
                    onConfirm?.();
                    onClose();
                  }}>
                  OK
                </button>
              )}
            </div>
          </div>
        </div>

      </motion.div>)}

    </AnimatePresence>
  );
}
