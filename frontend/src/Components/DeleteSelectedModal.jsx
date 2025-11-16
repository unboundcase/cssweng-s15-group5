import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ClientEntry from "./ClientEntry"; // import your component
import SimpleModal from "./SimpleModal";

export default function DeleteSelectedModal({
  isOpen,
  onClose,
  onConfirm,
  selectedClientIds = [],
  allCases = [],
  setSelectedClients, // pass setter from parent to update selection
  windowWidth = 1024,
}) {
  const [modalSelectedClients, setModalSelectedClients] = useState([]);
  const [modalClients, setModalClients] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // SimpleModal states
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalBody, setModalBody] = useState("");
  const [modalImageCenter, setModalImageCenter] = useState(null);
  const [modalConfirm, setModalConfirm] = useState(false);
  const [modalOnConfirm, setModalOnConfirm] = useState(() => { });

  const hideCHColumn = windowWidth <= 800;
  const hideSDWColumn = windowWidth <= 380;

  useEffect(() => {
    if (isOpen) {
      setModalClients(allCases.filter((c) => selectedClientIds.includes(c.id)));
      setModalSelectedClients(selectedClientIds);
    }
  }, [isOpen, allCases, selectedClientIds]);

  const handleSelectChange = (id, checked) => {
    if (checked) {
      setModalSelectedClients((prev) => [...prev, id]);
    } else {
      setModalSelectedClients((prev) => prev.filter((c) => c !== id));
    }
  };

  const handleConfirm = async () => {
    if (isDeleting) return;

    if (modalSelectedClients.length === 0) {
      triggerModal("No Selection", "Please select at least one case to delete.");
      return;
    }

    // Show confirmation dialog first
    setModalTitle("Confirm Deletion");
    setModalBody(`Are you sure you want to delete ${modalSelectedClients.length} case(s)? This action cannot be undone and will permanently remove all data associated with these cases.`);
    setModalImageCenter(<div className="warning-icon mx-auto"></div>);
    setModalConfirm(true);
    setShowModal(true);
    setModalOnConfirm(() => async () => {
      try {
        setIsDeleting(true);
        setShowModal(false);
        
        // Call the deletion function passed from parent
        const result = await onConfirm(modalSelectedClients);
        
        if (result && result.success) {
          // Show success modal
          setModalTitle("Success");
          setModalBody(`Successfully deleted ${modalSelectedClients.length} case(s).`);
          setModalImageCenter(<div className="success-icon mx-auto"></div>);
          setModalConfirm(false);
          setShowModal(true);
          setModalOnConfirm(() => () => {
            setShowModal(false);
            onClose?.();
          });
        } else {
          // Show error modal
          const errorMessage = result?.message || "An error occurred while deleting the cases.";
          setModalTitle("Error");
          setModalBody(errorMessage);
          setModalImageCenter(<div className="warning-icon mx-auto"></div>);
          setModalConfirm(false);
          setShowModal(true);
          setModalOnConfirm(() => () => setShowModal(false));
        }
      } catch (error) {
        // Show error modal for exceptions
        setModalTitle("Error");
        setModalBody("Failed to delete cases. Please try again.");
        setModalImageCenter(<div className="warning-icon mx-auto"></div>);
        setModalConfirm(false);
        setShowModal(true);
        setModalOnConfirm(() => () => setShowModal(false));
      } finally {
        setIsDeleting(false);
      }
    });
  };

  const triggerModal = (title, body, icon = <div className="warning-icon mx-auto"></div>, onConfirm = null) => {
    setModalTitle(title);
    setModalBody(body);
    setModalImageCenter(icon);
    setModalConfirm(false);
    setShowModal(true);
    setModalOnConfirm(() => onConfirm || (() => setShowModal(false)));
  };

  const handleModalClose = () => {
    if (modalConfirm) {
      // Don't auto-confirm, just close the modal
      setShowModal(false);
    } else {
      setShowModal(false);
    }
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
        onConfirm={modalOnConfirm}
        onCancel={handleModalClose}
      />

      <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-80 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          ></div>

          <div 
            className="relative bg-white rounded-lg drop-shadow-card max-w-[60rem] w-full min-h-[18rem] z-10 overflow-hidden flex flex-col mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full p-4 sm:p-5 drop-shadow-base" style={{ backgroundColor: "var(--accent-white)" }}>
              <h2 className="header-sub text-lg sm:text-xl">Confirm Deletion</h2>
            </div>

            <div className="flex flex-col justify-between flex-1 p-4 sm:p-6">
              <p className="font-label mb-4 text-sm sm:text-base">
                You are about to delete the following {modalSelectedClients.length} case(s). This action cannot be undone.
              </p>

              <div className="max-h-64 sm:max-h-96 overflow-y-auto border rounded p-2 sm:p-3 mb-4 sm:mb-6 flex flex-col gap-1 sm:gap-2">
                {modalClients.length > 0 ? (
                  modalClients.map((client) => (
                    <ClientEntry
                      key={client.id}
                      id={client.id}
                      name={client.name}
                      sm_number={client.sm_number}
                      spu={client.spu}
                      assigned_sdw_name={client.assigned_sdw_name}
                      archive={true}
                      showCheckbox={true}
                      isSelected={modalSelectedClients.includes(client.id)}
                      onSelectChange={handleSelectChange}
                      deleteMode={true}
                      hideCHColumn={hideCHColumn}
                      hideSDWColumn={hideSDWColumn}
                    />
                  ))
                ) : (
                  <p className="font-label text-gray-600 text-center text-sm sm:text-base">
                    No clients selected.
                  </p>
                )}
              </div>

              <div className="flex justify-center gap-4 sm:gap-6 sm:flex-row">
                <button
                  className="btn-outline font-bold-label px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary font-bold-label px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base"
                  onClick={handleConfirm}
                  disabled={modalSelectedClients.length === 0 || isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Confirm Delete"}
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
