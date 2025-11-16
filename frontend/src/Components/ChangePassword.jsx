import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SimpleModal from './SimpleModal';
import { updateEmployeePasswordById } from '../fetch-connections/account-connection';

export default function ChangePassword({ isOpen, onClose, onChanged, userId }) {
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalBody, setModalBody] = useState("");
  const [modalImageCenter, setModalImageCenter] = useState(null);
  const [modalConfirm, setModalConfirm] = useState(false);
  const [modalOnConfirm, setModalOnConfirm] = useState(() => { });
  const [submitting, setSubmitting] = useState(false);

  // console.log("USERID", userId);

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        password: '',
        confirmPassword: '',
      });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const checkPasswordValid = () => {
    const missing = [];

    if (!formData.password || formData.password.length < 8) {
      missing.push("Password must be at least 8 characters");
    }

    if (formData.password !== formData.confirmPassword) {
      missing.push("Passwords do not match");
    }

    if (missing.length > 0) {
      setModalTitle("Invalid Fields");
      setModalBody(`Please fix the following:\n\n${missing.join("\n")}`);
      setModalImageCenter(<div className="warning-icon mx-auto"></div>);
      setModalConfirm(false);
      setShowModal(true);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    const isValid = checkPasswordValid();
    if (!isValid) return;

    setSubmitting(true);
    try {
      const res = await updateEmployeePasswordById(userId, { password: formData.password });

      if (res.ok) {
        setModalTitle("Success");
        setModalBody("Password changed successfully.");
        setModalImageCenter(<div className="success-icon mx-auto"></div>);
        setModalConfirm(false);
        setShowModal(true);

        setModalOnConfirm(() => () => {
          onChanged?.();
          onClose?.();
        });
      } else {
        setModalTitle("Error");
        setModalBody(res.data?.message || "Failed to change password.");
        setModalImageCenter(<div className="warning-icon mx-auto"></div>);
        setModalConfirm(false);
        setShowModal(true);
      }
    } finally {
      setSubmitting(false);
    }
  };


  const handleModalClose = () => {
    modalOnConfirm?.();
    setShowModal(false);
    setModalTitle("");
    setModalBody("");
    setModalImageCenter(null);
    setModalConfirm(false);
    setModalOnConfirm(() => { });
  };

  return (
    <>
      <SimpleModal
        isOpen={showModal}
        onClose={handleModalClose}
        title={modalTitle}
        bodyText={modalBody}
        imageCenter={modalImageCenter}
        confirm={modalConfirm}
        onConfirm={handleModalClose}
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-80 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

            <div className="relative bg-white rounded-lg drop-shadow-card max-w-[30rem] w-full max-h-[90vh] z-10 overflow-hidden flex flex-col">
              <div className="w-full p-4 drop-shadow-base bg-gray-100">
                <h2 className="header-sub text-lg font-bold">Change Password</h2>
              </div>

              <div className="flex flex-col gap-4 flex-1 p-6">
                <div className="flex flex-col gap-2 w-full">
                  <p className="font-bold-label">New Password</p>
                  <input
                    type="password"
                    name="password"
                    placeholder="New Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="text-input font-label"
                  />
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <p className="font-bold-label">Confirm Password</p>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="text-input font-label"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button className="btn-outline font-bold-label" onClick={onClose}>
                    Cancel
                  </button>
                  <button
                    className="btn-primary font-bold-label"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
