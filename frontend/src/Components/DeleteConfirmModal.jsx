import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  selectedClientIds = [],
  allCases = [],
  windowWidth = 1024,
}) {
  const selectedClientsData = allCases.filter((c) => selectedClientIds.includes(c.id));
  const previewList = selectedClientsData.slice(0, 8);

  const hideCHColumn = windowWidth <= 800;
  const hideSDWColumn = windowWidth <= 380;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-99 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

          <div className="relative bg-white rounded-lg drop-shadow-card max-w-[60rem] w-full min-h-[18rem] z-10 overflow-hidden flex flex-col mx-4">
            <div className="w-full p-4 sm:p-5 drop-shadow-base" style={{ backgroundColor: "var(--accent-white)" }}>
              <h2 className="header-sub text-lg sm:text-xl">Confirm Deletion</h2>
            </div>

            <div className="flex flex-col justify-between flex-1 p-4 sm:p-6 lg:p-10">
              <p className="font-label mb-4 text-sm sm:text-base">
                You are about to delete the following {selectedClientIds.length} case(s). This action cannot be undone.
              </p>

              <div className="max-h-44 overflow-y-auto border rounded p-3 mb-6">
                {previewList.map((c) => (
                  <div key={c.id} className="py-2 border-b last:border-b-0 flex flex-col">
                    <p className="font-bold-label text-sm sm:text-base">{c.name}</p>
                    {!hideCHColumn && (
                      <p className="font-label text-xs sm:text-sm text-gray-600">CH Number: {c.sm_number}</p>
                    )}
                    {hideCHColumn && (
                      <p className="font-label text-xs sm:text-sm text-gray-600">CH: {c.sm_number}</p>
                    )}
                    {hideSDWColumn && c.assigned_sdw_name && (
                      <p className="font-label text-xs sm:text-sm text-gray-600">SDW: {c.assigned_sdw_name}</p>
                    )}
                  </div>
                ))}
                {selectedClientsData.length > previewList.length && (
                  <p className="font-label mt-2 text-xs sm:text-sm">...and {selectedClientsData.length - previewList.length} more</p>
                )}
                {selectedClientsData.length === 0 && (
                  <p className="font-label text-gray-600 text-xs sm:text-sm">No client data available.</p>
                )}
              </div>

              <div className="flex justify-center gap-4 sm:gap-6 flex-col sm:flex-row">
                <button
                  className="btn-outline font-bold-label px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base"
                  onClick={() => {
                    onClose?.();
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary font-bold-label px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base"
                  onClick={() => {
                    onConfirm?.();
                  }}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}