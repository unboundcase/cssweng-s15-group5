import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../Components/SideBar";
import WorkerEntry from "../Components/WorkerEntry";
import ClientEntry from "../Components/ClientEntry";
import { motion, AnimatePresence } from "framer-motion";

import SimpleModal from "../Components/SimpleModal";

import { fetchSession } from "../fetch-connections/account-connection";
import { fetchAllSDWs } from "../fetch-connections/account-connection";
import { fetchAllCases } from "../fetch-connections/case-connection";
import { fetchAllSpus } from "../fetch-connections/spu-connection";
import { deleteSpu } from "../fetch-connections/spu-connection";

import RegisterSpu from "../Components/RegisterSpu";
import Loading from "./loading";

export default function SpuPage() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [sdws, setSdws] = useState([]);
    const [cases, setCases] = useState([]);
    const [spus, setSpus] = useState([]);

    const [collapsedSpus, setCollapsedSpus] = useState({});
    const [addOpen, setAddOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

    const [loadingStage, setLoadingStage] = useState(0);
    const [loadingComplete, setLoadingComplete] = useState(false);

    const [deleteModalData, setDeleteModalData] = useState({
        isOpen: false,
        title: "",
        bodyText: "",
        imageCenter: null,
        confirm: false,
        onConfirm: null,
    });

    const isMobile = windowWidth <= 700; // Changed from 650 to 700 to match home-leader
    const isVerySmall = windowWidth <= 400;
    const hideSpuColumn = windowWidth <= 800;
    const hideTypeColumn = windowWidth <= 400;
    const hideCHColumn = windowWidth <= 800;
    const hideSDWColumn = windowWidth <= 380;

    useEffect(() => {
        document.title = "SPU Page";
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const loadData = async () => {
        try {
            setLoadingStage(0); // red

            const sessionData = await fetchSession();
            const currentUser = sessionData?.user;
            setUser(currentUser);

            if (!currentUser || currentUser.role !== "head") {
                navigate("/unauthorized");
                return;
            }

            setLoadingStage(1); // blue

            const [allSpus, allSdws, allCases] = await Promise.all([
                fetchAllSpus(),
                fetchAllSDWs(),
                fetchAllCases(),
            ]);

            const activeSpus = (allSpus || []).filter(spu => spu.is_active);
            setSpus(activeSpus);

            const activeSdws = (allSdws || []).filter(sdw => sdw.is_active);
            setSdws(activeSdws);

            const activeCases = (allCases || []).filter(c => c.is_active);
            setCases(activeCases);

            const initialCollapseState = {};
            activeSpus.forEach(spu => {
                initialCollapseState[spu._id] = true;
            });
            setCollapsedSpus(initialCollapseState);

            setLoadingStage(2); // green
            setLoadingComplete(true); // smooth transition
        } catch (err) {
            console.error("Error loading SPU data page:", err);
            navigate("/unauthorized");
        }
    };

    useEffect(() => {
        loadData();
    }, [navigate]); // Add navigate as dependency

    const toggleSpuCollapse = (spuId) => {
        setCollapsedSpus(prev => ({
            ...prev,
            [spuId]: !prev[spuId]
        }));
    };

    const handleDeleteSpu = (spu) => {
        const spuWorkers = sdws.filter((w) => w.spu_id === spu.spu_name);
        const spuCases = cases.filter((c) => String(c.spuObjectId) === String(spu._id));

        if (spuWorkers.length > 0 || spuCases.length > 0) {
            setDeleteModalData({
                isOpen: true,
                title: "Cannot Delete SPU",
                bodyText: "This SPU has assigned workers or cases. Please reassign or remove them before deleting.",
                imageCenter: <div className="warning-icon mx-auto" />,
                confirm: false,
                onConfirm: () => { },
            });
            return;
        }

        setDeleteModalData({
            isOpen: true,
            title: `Delete "${spu.spu_name}"?`,
            bodyText: "Are you sure you want to delete this SPU? This action cannot be undone.",
            imageCenter: <div className="warning-icon mx-auto" />,
            confirm: true,
            onConfirm: async () => {
                const res = await deleteSpu(spu._id);
                if (res?.ok) {
                    await loadData();
                    setDeleteModalData({
                        isOpen: true,
                        title: "SPU Deleted",
                        bodyText: `The SPU "${spu.spu_name}" was successfully deleted.`,
                        imageCenter: <div className="success-icon mx-auto" />,
                        confirm: false,
                        onConfirm: () => { },
                    });
                } else {
                    setDeleteModalData({
                        isOpen: true,
                        title: "Error",
                        bodyText: res?.message || res?.error || "Failed to delete the SPU.",
                        imageCenter: <div className="warning-icon mx-auto" />,
                        confirm: false,
                        onConfirm: () => { },
                    });
                }
            }
        });
    };

    const loadingColor = loadingStage === 0 ? "red" : loadingStage === 1 ? "blue" : "green";
    if (!loadingComplete) return <Loading color={loadingColor} />;

    return (
        <>
            <SimpleModal
                isOpen={deleteModalData.isOpen}
                onClose={() => setDeleteModalData((prev) => ({ ...prev, isOpen: false }))}
                title={deleteModalData.title}
                bodyText={deleteModalData.bodyText}
                imageCenter={deleteModalData.imageCenter}
                confirm={deleteModalData.confirm}
                onConfirm={() => {
                    deleteModalData.onConfirm?.();
                    setDeleteModalData((prev) => ({ ...prev, isOpen: false }));
                }}
                onCancel={() => setDeleteModalData((prev) => ({ ...prev, isOpen: false }))}
            />

            <RegisterSpu
                isOpen={addOpen}
                onClose={() => setAddOpen(false)}
                onRegister={async () => {
                    setAddOpen(false);
                    await loadData();
                }}
                existingSpus={spus}
            />

            <div className="fixed top-0 left-0 right-0 z-60 w-full max-w-[1280px] mx-auto flex justify-between items-center py-5 px-8 bg-white">
                <div className="flex items-center gap-4">
                    {isMobile && (
                        <button
                            className="side-icon-setup menu-button"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                        </button>
                    )}

                    <a href="/" className="main-logo main-logo-text-nav">
                        <div className="main-logo-setup folder-logo"></div>
                        <div className="flex flex-col">
                            {isVerySmall ? (
                                <>
                                    <p className="main-logo-text-nav-sub mb-[-1rem]">Unbound Manila</p>
                                    <p className="main-logo-text-nav">CMS</p>
                                </>
                            ) : (
                                <>
                                    <p className="main-logo-text-nav-sub mb-[-1rem]">Unbound Manila Foundation Inc.</p>
                                    <p className="main-logo-text-nav">Case Management System</p>
                                </>
                            )}
                        </div>
                    </a>
                </div>
            </div>

            <main className="min-h-[calc(100vh-4rem)] w-full flex mt-[9rem]">
                <SideBar
                    user={user}
                    isMenuOpen={isMenuOpen}
                    setIsMenuOpen={setIsMenuOpen}
                    isMobile={isMobile}
                />

                <div className={`flex flex-col w-full gap-10 max-[700px]:gap-8 ${isMobile ? 'ml-0' : 'ml-[15rem]'} px-8 pb-20`}>
                    <div className="flex justify-between items-center">
                        <h1 className="header-main">SPU Overview</h1>
                        <button
                            className="btn-blue font-bold-label"
                            onClick={() => setAddOpen(true)}
                            disabled={addOpen}
                        >
                            + Add SPU
                        </button>
                    </div>

                    {
                        spus.map((spu) => {
                            const isCollapsed = collapsedSpus[spu._id] ?? true;
                            const spuWorkers = sdws.filter((worker) => worker.spu_id === spu.spu_name);
                            const spuCases = cases.filter((c) => String(c.spuObjectId) === String(spu._id));

                            return (
                                <div
                                    key={spu._id}
                                    className="border border-gray-300 rounded-lg shadow-sm p-6 mb-10"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <h2 className="header-sub">{spu.spu_name}</h2>
                                            <p className="font-label">
                                                {spuWorkers.length} worker(s), {spuCases.length} case(s)
                                            </p>
                                            {spu.createdAt && (
                                                <p className="font-label text-sm text-gray-600 mt-1">
                                                    Created: {new Date(spu.createdAt).toLocaleDateString('en-PH', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            )}
                                        </div>
                                        <motion.button
                                            onClick={() => toggleSpuCollapse(spu._id)}
                                            className="icon-button-setup chevron-button"
                                            animate={{ rotate: collapsedSpus[spu._id] ? 0 : 180 }}
                                            transition={{ duration: 0.1 }}
                                        />
                                    </div>

                                    <AnimatePresence initial={false}>
                                        {!collapsedSpus[spu._id] && (
                                            <motion.div
                                                key={spu._id}
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mb-6">
                                                    <h3 className="font-bold-label mb-2">Workers:</h3>
                                                    {spuWorkers.length === 0 ? (
                                                        <p className="font-label">No workers assigned.</p>
                                                    ) : (
                                                        <>
                                                            <div className={`${hideTypeColumn ? 'grid grid-cols-[1fr]' : hideSpuColumn ? 'grid grid-cols-[2fr_1fr]' : 'grid grid-cols-[2fr_1fr_2fr]'} items-center border-b border-gray-400 pb-2 mb-2`}>
                                                                <p className="font-bold-label ml-[20%]">Worker</p>
                                                                {!hideTypeColumn && <p className="font-bold-label text-center">Type</p>}
                                                                {!hideSpuColumn && !hideTypeColumn && <p className="font-bold-label text-center">SPU</p>}
                                                            </div>
                                                            {spuWorkers.map((worker) => (
                                                                <WorkerEntry
                                                                    key={worker._id}
                                                                    id={worker._id}
                                                                    name={`${worker.first_name} ${worker.last_name}`}
                                                                    role={worker.role}
                                                                    spu_id={worker.spu_id}
                                                                    hideSpuColumn={hideSpuColumn}
                                                                    hideTypeColumn={hideTypeColumn}
                                                                />
                                                            ))}
                                                        </>
                                                    )}
                                                </div>

                                                <div>
                                                    <h3 className="font-bold-label mb-2">Cases:</h3>
                                                    {spuCases.length === 0 ? (
                                                        <p className="font-label">No cases recorded.</p>
                                                    ) : (
                                                        <>
                                                            <div className={`${hideSDWColumn ? 'grid grid-cols-[1fr]' : hideCHColumn ? 'grid grid-cols-[2fr_2fr]' : 'grid grid-cols-[2fr_1fr_2fr]'} items-center border-b border-gray-400 pb-2 mb-2`}>
                                                                <p className="font-bold-label ml-[20%]">Name</p>
                                                                {!hideCHColumn && !hideSDWColumn && <p className="font-bold-label text-center">CH Number</p>}
                                                                {!hideSDWColumn && <p className="font-bold-label text-center">SDW Assigned</p>}
                                                            </div>
                                                            {spuCases.map((client) => (
                                                                <ClientEntry
                                                                    key={client.id}
                                                                    id={client.id}
                                                                    sm_number={client.sm_number}
                                                                    spu={client.spu}
                                                                    name={client.name}
                                                                    assigned_sdw_name={client.assigned_sdw_name}
                                                                    pendingTermination={client.pendingTermination ?? false}
                                                                    hideCHColumn={hideCHColumn}
                                                                    hideSDWColumn={hideSDWColumn}
                                                                />
                                                            ))}
                                                        </>
                                                    )}
                                                </div>

                                                <div className="flex justify-end mt-6">
                                                    <button
                                                        className="btn-outline font-bold-label"
                                                        onClick={() => handleDeleteSpu(spu)}
                                                    >
                                                        Delete SPU
                                                    </button>
                                                </div>

                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                </div>
                            );
                        })
                    }
                </div>
            </main>
        </>
    );
}
