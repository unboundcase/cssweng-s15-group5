import { useState, useEffect } from "react";
import SideItem from "../Components/SideItem";
import ClientEntry from "../Components/ClientEntry";
import WorkerEntry from "../Components/WorkerEntry";
import SideBar from "../Components/SideBar";
import DeleteSelectedModal from "../Components/DeleteSelectedModal";
import SimpleModal from "../Components/SimpleModal";
import { fetchAllCases } from "../fetch-connections/case-connection";
import { deleteClients } from "../fetch-connections/case-connection";
import { fetchHeadView, fetchSession, fetchSupervisorView } from "../fetch-connections/account-connection";
import { fetchAllSpus } from "../fetch-connections/spu-connection";
import { useNavigate } from "react-router-dom";
import Loading from "./loading";

import DeleteConfirmModal from "../Components/DeleteConfirmModal";
import NoSelectionModal from "../Components/NoSelectionModal";


function Archive() {
  const navigate = useNavigate();

  const [allCases, setAllCases] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [archiveEmp, setArchiveEmp] = useState([]);
  const [currentData, setCurrentData] = useState([]);
  const [user, setUser] = useState(null);
  const [projectLocation, setProjectLocation] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  const [deleteMode, setDeleteMode] = useState(false);

  const [allSelected, setAllSelected] = useState(false);

  const [showDeleteCheckbox, setShowDeleteCheckbox] = useState(false);
  const [selectedClients, setSelectedClients] = useState([]);

  const [showModal, setShowModal] = useState(false);
  
  const [modalType, setModalType] = useState(null); // 'confirm' | 'none'

  // Simple success/error modal states
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultModalTitle, setResultModalTitle] = useState("");
  const [resultModalMessage, setResultModalMessage] = useState("");
  const [resultModalIcon, setResultModalIcon] = useState(null);


  const [timeFilter, setTimeFilter] = useState(false);

  // for date and time filter
  const today = new Date().toISOString().split("T")[0];
  const [filteredCases, setFilteredCases] = useState(allCases);
  const [timeRange, setTimeRange] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentSPU, setCurrentSPU] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("cases");

  const [loadingStage, setLoadingStage] = useState(0);
  const [loadingComplete, setLoadingComplete] = useState(false);

  const isMobile = windowWidth <= 700;
  const isVerySmall = windowWidth <= 400;
  const isSmallLayout = windowWidth <= 700;
  const shortenTitle = windowWidth <= 500;
  const moveNewCaseToNewRow = windowWidth <= 400;
  const hideCHColumn = windowWidth <= 800;
  const hideSDWColumn = windowWidth <= 380;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.title = `Archive`;
  }, []);

    useEffect(() => {
        // Fetch all SPUs (including inactive) 
        const loadSpus = async () => {
            const spus = await fetchAllSpus();
            const activeSpus = Array.isArray(spus) ? spus.filter(spu => spu.is_active) : [];
            setProjectLocation(activeSpus);
        };
        loadSpus();
    }, []);

    useEffect(() => {
        const loadSessionAndCases = async () => {
            try {
                setLoadingStage(0); // red
                const sessionData = await fetchSession();
                const currentUser = sessionData.user;
                setUser(currentUser);

                if (!currentUser || !["head", "supervisor"].includes(currentUser.role)) {
                    navigate("/unauthorized");
                    return;
                }

                setLoadingStage(1); // blue

                const cases = await fetchAllCases();
                setAllCases(cases);

                setLoadingStage(2); // green
                setLoadingComplete(true);
            } catch (err) {
                console.error("Error loading archive page:", err);
                navigate("/unauthorized");
            }
            
        };
        loadSessionAndCases();
      }, []);
  // ===== Single initial fetch (session, SPUs, cases, employees) =====
  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoadingStage(0);
        const sessionData = await fetchSession();
        const currentUser = sessionData?.user;

        if (!currentUser) return navigate("/unauthorized");
        if (!["head", "supervisor"].includes(currentUser.role)) return navigate("/");

        setUser(currentUser);
        setLoadingStage(1);

        const [spus, cases, empResp] = await Promise.all([
          fetchAllSpus(),
          fetchAllCases(),
          currentUser.role === "head" ? fetchHeadView() : fetchSupervisorView(),
        ]);

        setProjectLocation((spus || []).filter((s) => s.is_active));

        const normalizedCases = (cases || []).map((c) => ({
          ...c,
          spu_id: c.spu_id ?? c.spuObjectId ?? null,
        }));
        setAllCases(normalizedCases);

        const employees = empResp?.employees || [];
        setAllEmployees(employees);

        setLoadingStage(2);
        setLoadingComplete(true);
      } catch (err) {
        console.error("Error loading archive page:", err);
        if (err.status === 401 || err.status === 403) navigate("/unauthorized");
      }
    };

    loadAll();
  }, []); // ← runs once

  // ===== CASES: client-side filtering/sorting only =====
  useEffect(() => {
    let filtered = [...allCases].filter((client) => !client.is_active);

    if (user?.role === "supervisor") {
      const userSpuId = user?.spu_id || user?.spu?._id || null;
      if (userSpuId) filtered = filtered.filter((c) => c.spu_id === userSpuId);
    }

    if (currentSPU) filtered = filtered.filter((c) => c.spu_id === currentSPU);

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((c) => {
        const name = (c.name || "").toLowerCase();
        const ch = c.sm_number?.toString() || "";
        return name.includes(q) || ch.includes(q);
      });
    }

    let startHour = 0;
    let endHour = 23;

    // date filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include entire end day

      filtered = filtered.filter((c) => {
        const created = new Date(c.createdAt);
        return created >= start && created <= end;
      });
    }

  // time filter
  if (timeRange) {
    let startHour = 0;
    let endHour = 23;

    switch (timeRange) {
      case "morning":
        startHour = 6; endHour = 11; break;
      case "afternoon":
        startHour = 12; endHour = 17; break;
      case "evening":
        startHour = 18; endHour = 23; break;
      case "night":
        startHour = 0; endHour = 5; break;
      default:
        break;
    }

    filtered = filtered.filter((c) => {
      const hour = new Date(c.createdAt).getHours();
      if (startHour <= endHour) {
        return hour >= startHour && hour <= endHour;
      } else {
        // Night range (00–05)
        return hour >= startHour || hour <= endHour;
      }
    });
  }

    if (sortBy === "name") {
      filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "sm_number") {
      filtered.sort((a, b) => (a.sm_number || 0) - (b.sm_number || 0));
    }

    if (sortOrder === "desc") filtered.reverse();


    setCurrentData(filtered);
  }, [allCases, currentSPU, sortBy, sortOrder, searchQuery, user, startDate, endDate, timeRange,]);

  // ===== EMPLOYEES: client-side filtering/sorting only =====
useEffect(() => {
  if (viewMode !== "employees") return;

  setDeleteMode(false);
  setShowDeleteCheckbox(false)
  setSelectedClients([]);
  let filtered = allEmployees.filter((w) => w.is_active === false);

  // Filter by SPU id
  if (currentSPU) {
    filtered = filtered.filter((w) => w.spu_id === currentSPU);
  }

  // Filter by search
  if (searchQuery.trim() !== "") {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((w) => {
      const name = (w.name || "").toLowerCase();
      const idStr = w.id?.toString() || "";
      return name.includes(q) || idStr.includes(q);
    });
  }

  // ✅ Filter by role if "Find By" has a role type selected
  if (["head", "supervisor", "sdw"].includes(sortBy)) {
    filtered = filtered.filter(
      (w) => (w.role || "").toLowerCase() === sortBy
    );
  }

  // Fixed role priority order
  const roleOrder = { head: 1, supervisor: 2, sdw: 3 };

  filtered.sort((a, b) => {
    const roleA = roleOrder[a.role?.toLowerCase()] ?? 99;
    const roleB = roleOrder[b.role?.toLowerCase()] ?? 99;

    if (roleA !== roleB) return roleA - roleB; // lower number first
    return (a.name || "").localeCompare(b.name || "");
  });

  // Reverse if needed
  if (sortOrder === "desc") filtered.reverse();

  setArchiveEmp(filtered);
}, [allEmployees, viewMode, currentSPU, sortBy, sortOrder, searchQuery]);

// Reset date filters when delete mode is turned off
useEffect(() => {
  if (!deleteMode) {
    // When delete mode is turned OFF
    setStartDate("");
    setEndDate("");
    setSelectedClients([]);
    setAllSelected(false);
  }
}, [deleteMode]);

  // toggle function for selecting clients in delete mode
  const handleSelectChange = (id, isChecked) => {
    setSelectedClients(prev => {
      if (isChecked) {
        // add to selected (avoid duplicates)
        return prev.includes(id) ? prev : [...prev, id];
      } else {
        // remove from selected
        return prev.filter(clientId => clientId !== id);
      }
    });
    
    // Update allSelected state based on current selection
    if (!isChecked) {
      setAllSelected(false);
    }
  };
  
  // Open delete flow: show confirm modal if any selected, otherwise show "no selection" modal
  const openDeleteFlow = () => {
    if (selectedClients.length > 0) {
      setModalType("confirm");
      setShowModal(true);
    } else {
      setModalType("none");
      setShowModal(true);
    }
  };

  // handle time filter apply
  const handleTimeApply = () => {
    let startHour = 0;
    let endHour = 23;

    switch (timeRange) {
      case "morning":
        startHour = 6; endHour = 11; break;
      case "afternoon":
        startHour = 12; endHour = 17; break;
      case "evening":
        startHour = 18; endHour = 23; break;
      case "night":
        startHour = 0; endHour = 5; break;
      default:
        break;
    }

    const filtered = currentData.filter((c) => {
      if (!c.createdAt) return false; // skip if no timestamp
      const hour = new Date(c.createdAt).getHours();
      if (startHour <= endHour) {
        return hour >= startHour && hour <= endHour;
      } else {
        // For night (00–05)
        return hour >= startHour || hour <= endHour;
      }
    });

    setFilteredCases(filtered);
  };

useEffect(() => {
  // Only reset selections if we're not in delete mode
  // This prevents clearing selections during filtering/sorting operations
  if (!deleteMode) {
    setAllSelected(false);
    setSelectedClients([]);
  }
}, [currentData, deleteMode]);

  // handle date filter apply
  const handleDateApply = () => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filtered = currentData.filter((c) => {
      if (!c.createdAt) return false;
      const created = new Date(c.createdAt);
      return created >= start && created <= end;
    });

    setFilteredCases(filtered);
  };


  // confirm delete handler
  const handleDeleteConfirm = async (confirmedClients) => {
    try {
      if (!confirmedClients?.length) {
        // Show error modal
        setResultModalTitle("No Selection");
        setResultModalMessage("No clients selected for deletion.");
        setResultModalIcon(<div className="warning-icon mx-auto"></div>);
        setShowResultModal(true);
        return { success: false, message: "No clients selected for deletion." };
      }

      const result = await deleteClients(confirmedClients);
      console.log('Deleted clients:', result);

      // Update the UI by removing deleted clients
      setAllCases(prev => prev.filter(c => !confirmedClients.includes(c.id)));

      // Reset UI state
      setSelectedClients([]);
      setDeleteMode(false);
      setShowDeleteCheckbox(false);
      setShowModal(false);
      setModalType(null);

      // Show success modal
      setResultModalTitle("Success");
      setResultModalMessage(`Successfully deleted ${confirmedClients.length} case(s).`);
      setResultModalIcon(<div className="success-icon mx-auto"></div>);
      setShowResultModal(true);

      return { success: true };

    } catch (err) {
      console.error('Delete failed:', err);
      
      // Show error modal
      setResultModalTitle("Error");
      setResultModalMessage(err.message || "Failed to delete clients. Please try again.");
      setResultModalIcon(<div className="warning-icon mx-auto"></div>);
      setShowResultModal(true);
      
      return { 
        success: false, 
        message: err.message || "Failed to delete clients. Please try again." 
      };
    }
  };

  const handleSelectAll = () => {
    if (allSelected) {
    // Currently all selected → deselect everything
    setSelectedClients([]);
    } else {
      // Select everything
      const allIds = currentData.map(client => client.id);
      setSelectedClients(allIds);
    }
    setAllSelected(!allSelected);
  };
  
  
  const handleModalClose = () => {
    setShowModal(false);
    setModalType(null);
  };

  const loadingColor = loadingStage === 0 ? "red" : loadingStage === 1 ? "blue" : "green";
  if (!loadingComplete) return <Loading color={loadingColor} />;

  // for debugging filteredCases
  // console.log("Client data received:", filteredCases.length > 0 ? filteredCases : currentData);

  return (
    <>
      {/* Simple Success/Error Modal - managed like ProfileModal */}
      <SimpleModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        title={resultModalTitle}
        bodyText={resultModalMessage}
        imageCenter={resultModalIcon}
        confirm={false}
        onConfirm={() => setShowResultModal(false)}
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

        {!isMobile && (
          <div className="flex gap-5 items-center bg-purple-100 rounded-full px-8 py-4 w-full max-w-[40rem] font-label">
            <div className="nav-search"></div>
            <input
              type="text"
              placeholder="Search"
              className="focus:outline-none flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      <main className="min-h-[calc(100vh-4rem)] w-full flex mt-[9rem]">
        <SideBar 
          user={user} 
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          isMobile={isMobile}
        />

        <div className={`flex flex-col w-full gap-15 ${isMobile ? 'ml-0' : 'ml-[15rem]'} px-8`}>
          <div className={`flex w-full ${isSmallLayout ? 'flex-col' : 'justify-between'} gap-10`}>
            <div className={`flex gap-5 ${isSmallLayout ? 'justify-between items-center w-full' : 'justify-between items-center w-full'}`}>
              <div className="flex gap-5 w-full">
                {deleteMode ? (
                  viewMode === "cases" ? (
                    user?.role == "head" && (
                      <>
                      <button
                        className={`relative w-[200px] border border-gray-400 rounded-xl text-left pl-5 px-3 py-2 font-bold-label cursor-pointer appearance-none
                                  focus:outline-none transition-colors duration-150
                                  ${timeFilter ? "bg-[#E46455] !text-white" : "bg-white text-black hover:bg-[#f5f5f5]"}`}
                        onClick={() => {
                          if (timeFilter) {
                            setTimeFilter(false);
                          } else {
                            setTimeFilter(true);
                          }
                        }
                        }
                      >
                        Select by Date
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700 pointer-events-none font-bold-label"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={4}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {!isSmallLayout && (
                        <div className="flex gap-5 ml-auto">
                          <button
                            className="btn-delete-case font-bold-label"
                            onClick={() => {
                               if (!deleteMode) {
                                  // First click: enter delete mode
                                  setDeleteMode(true);
                                  setShowDeleteCheckbox(true);
                              } else {
                                  // Already in delete mode with selections: trigger delete flow
                                  openDeleteFlow();
                              }                       
                            }}
                            // disabled={deleteMode}
                          >
                            {deleteMode ? 'Delete Selected' : 'Delete'}
                          </button>
                          {deleteMode && (
                          <button
                            className="btn-cancel-delete font-bold-label"
                            onClick={() => {
                              setDeleteMode(false)
                              setShowDeleteCheckbox(false)
                              setTimeFilter(false);
                              setSelectedClients([]);
                            }}
                          >
                            Cancel
                          </button>
                          )}
                        </div>
                      )}
                      
                      </>
                    )
                  ) : null
                ) : (
                <>
                <select
                  className="text-input font-label max-w-[150px]"
                  value={viewMode}
                  id="view-toggle"
                  onChange={(e) => setViewMode(e.target.value)}
                >
                  <option value="cases">Cases</option>
                  <option value="employees">Employees</option>
                </select>

                                {/* {user?.role === "head" && <select
                                    className="text-input font-label max-w-[30rem]"
                                    value={currentSPU}
                                    id="spu"
                                    onChange={(e) => setCurrentSPU(e.target.value)}
                                >
                                    <option value="">All SPUs</option>
                                    {projectLocation.map((project) => (
                                        <option
                                            key={project._id || project.spu_name || project.projectCode}
                                            value={project.spu_name}
                                        >
                                            {project.spu_name} {project.spu_code ? `(${project.spu_code})` : project.projectCode ? `(${project.projectCode})` : ''}
                                        </option>
                                    ))}
                                </select>} */}
                {user?.role === "head" && (
                  <select
                    className="text-input font-label max-w-[30rem]"
                    value={currentSPU}
                    id="spu"
                    onChange={(e) => setCurrentSPU(e.target.value)}
                  >
                    <option value="">All SPUs</option>
                    {projectLocation.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.spu_name}
                      </option>
                    ))}
                  </select>
                )}

                {!isSmallLayout && (
                  <>
                    <select
                      className="text-input font-label max-w-[20rem]"
                      value={sortBy}
                      id="filter"
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      {viewMode === "cases" ? (
                        <>
                          <option value="">Sort By</option>
                          <option value="name">Name</option>
                          <option value="sm_number">CH Number</option>
                        </>
                      ) : (
                        <>
                          <option value="">Find By</option>
                          <option value="name">Name</option>
                          <option value="head">Head</option>
                          <option value="supervisor">Supervisor</option>
                          <option value="sdw">Social Development Worker</option>
                        </>
                      )}
                    </select>

                    <button
                      className="btn-outline font-bold-label"
                      onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
                    >
                      <div className="icon-static-setup order-button"></div>
                    </button>
                  </>
                )}

                {viewMode === "cases" && user?.role === "head" && !isSmallLayout && (
                  <div className="w-max-content flex gap-5 ml-auto">
                    <button
                      className="btn-delete-case font-bold-label"
                      onClick={() => {
                        if (!deleteMode) {
                              // First click: enter delete mode
                              setDeleteMode(true);
                              setShowDeleteCheckbox(true);
                          } else {
                              // Already in delete mode with selections: trigger delete flow
                              openDeleteFlow();
                          }
                          
                      }}
                    >
                      {deleteMode ? 'Delete Selected' : 'Delete'}
                    </button>
                    {deleteMode && (
                    <button
                      className="btn-cancel-delete font-bold-label"
                      onClick={() => {
                        setDeleteMode(false)
                        setShowDeleteCheckbox(false)
                        setSelectedClients([]);
                        setTimeFilter(false);
                      }}
                    >
                      Cancel
                    </button>
                    )}
                  </div>
                )}
                </>
                )}
              </div>

              {user?.role === "sdw" && !isSmallLayout && !moveNewCaseToNewRow && (
                <button
                  onClick={() => navigate("/create-case")}
                  className="btn-outline font-bold-label flex gap-4 whitespace-nowrap"
                >
                  <p>+</p>
                  <p>New Case</p>
                </button>
              )}
            </div>

            {isSmallLayout && (
              <div className="flex justify-between items-center w-full">
                {!deleteMode && (
                  <div className="flex gap-5">
                    <select
                      className="text-input font-label max-w-[20rem]"
                      value={sortBy}
                      id="filter"
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      {viewMode === "cases" ? (
                        <>
                          <option value="">Sort By</option>
                          <option value="name">Name</option>
                          <option value="sm_number">CH Number</option>
                        </>
                      ) : (
                        <>
                          <option value="">Find By</option>
                          <option value="name">Name</option>
                          <option value="head">Head</option>
                          <option value="supervisor">Supervisor</option>
                          <option value="sdw">Social Development Worker</option>
                        </>
                      )}
                    </select>

                    <button
                      className="btn-outline font-bold-label"
                      onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
                    >
                      <div className="icon-static-setup order-button"></div>
                    </button>
                  </div>
                )}

                <div className="flex gap-5">
                  {viewMode === "cases" && user?.role === "head" && (
                    <>
                      <button
                        className="btn-delete-case font-bold-label"
                        onClick={() => {
                          if (!deleteMode) {
                                // First click: enter delete mode
                                setDeleteMode(true);
                                setShowDeleteCheckbox(true);
                            } else {
                                // Already in delete mode with selections: trigger delete flow
                                openDeleteFlow();
                            }
                            
                        }}
                      >
                        {deleteMode ? 'Delete Selected' : 'Delete'}
                      </button>
                      {deleteMode && (
                      <button
                        className="btn-cancel-delete font-bold-label"
                        onClick={() => {
                          setDeleteMode(false)
                          setShowDeleteCheckbox(false)
                          setSelectedClients([]);
                          setTimeFilter(false);
                        }}
                      >
                        Cancel
                      </button>
                      )}
                    </>
                  )}

                  {user?.role === "sdw" && !moveNewCaseToNewRow && (
                    <button
                      onClick={() => navigate("/create-case")}
                      className="btn-outline font-bold-label flex gap-4 whitespace-nowrap"
                    >
                      <p>+</p>
                      <p>New Case</p>
                    </button>
                  )}
                </div>
              </div>
            )}

            {user?.role === "sdw" && moveNewCaseToNewRow && (
              <div className="flex justify-center w-full">
                <button
                  onClick={() => navigate("/create-case")}
                  className="btn-outline font-bold-label flex gap-4 whitespace-nowrap"
                >
                  <p>+</p>
                  <p>New Case</p>
                </button>
              </div>
            )}
          </div>

          {isMobile && (
            <div className="flex gap-5 items-center bg-purple-100 rounded-full px-8 py-4 w-full font-label">
              <div className="nav-search"></div>
              <input
                type="text"
                placeholder="Search"
                className="focus:outline-none flex-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          {timeFilter && (
            <div className="border border-gray-400 rounded-xl p-6 w-fit bg-white space-y-6">

              {/* date select */}
              <div className={`${windowWidth <= 750 ? 'flex flex-col gap-4' : 'flex items-center gap-4'}`}>
                {windowWidth <= 750 && (
                  <div className="flex justify-between items-center">
                    <label className="font-bold-label text-lg">Select Date:</label>
                    <button
                      onClick={handleSelectAll}
                      className="px-6 py-3 text-white rounded-lg text-xl font-semibold"
                      style={{ backgroundColor: "#3186B2" }}
                    >
                      {allSelected ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                )}
                
                {windowWidth > 750 && (
                  <label className="font-bold-label w-36 text-lg">Select Date:</label>
                )}
                
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`border rounded-lg text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${windowWidth <= 380 ? 'w-auto px-3 py-2' : 'w-65 px-7 py-4'}`}
                  />
                  <span className="text-2xl">to</span>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`border rounded-lg text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${windowWidth <= 380 ? 'w-auto px-3 py-2' : 'w-65 px-7 py-4'}`}
                  />
                </div>
                
                {windowWidth > 750 && (
                  <button
                    onClick={handleSelectAll}
                    className="px-6 py-3 text-white rounded-lg text-xl font-semibold ml-8 mr-6"
                    style={{ backgroundColor: "#3186B2" }}
                  >
                    {allSelected ? "Deselect All" : "Select All"}
                  </button>
                )}
              </div>
            </div>
          )}
          {viewMode === "cases" ? (
            deleteMode && (
              <div className="flex justify-between items-center w-full">
                {deleteMode && (
                <div className="max-w-[611px] w-full min-h-[38px] rounded-[9px] border border-[#0000004F] flex items-center gap-5 px-6 py-3">
                  <div className="info-icon w-[17px] h-[17px] bg-white opacity-100 flex-shrink-0"></div>
                  <p className="font-[700] text-[16px] leading-[140%] text-justify text-[#006599]">
                    Check the boxes <span className="font-[400]">of the cases you want to delete.</span>
                  </p>
                </div>
                )}
                {/* <div className="flex gap-5 ml-auto">
                  <button
                    className="btn-delete-case font-bold-label"
                    onClick={() => {
                      setDeleteMode(true)
                      setShowDeleteCheckbox(true)
                    }}
                    disabled={deleteMode}
                  >
                    {deleteMode ? 'Delete Selected' : 'Delete'}
                  </button>
                  {deleteMode && (
                  <button
                    className="btn-cancel-delete font-bold-label"
                    onClick={() => {
                      setDeleteMode(false)
                      setShowDeleteCheckbox(false)
                      setSelectedClients([]);
                    }}
                  >
                    Cancel
                  </button>
                  )}
                </div> */}
                {/* Delete flow modals */}
                <DeleteSelectedModal
                  isOpen={showModal && modalType === "confirm"}
                  onClose={handleModalClose}
                  onConfirm={handleDeleteConfirm}
                  selectedClientIds={selectedClients}
                  allCases={allCases}
                  setSelectedClients={setSelectedClients}
                  windowWidth={windowWidth}
                />

                <NoSelectionModal
                  isOpen={showModal && modalType === "none"}
                  onClose={handleModalClose}
                />
              </div>
            )
          ) : null}
          <div className="flex flex-col w/full gap-3">
            {viewMode === "cases" ? (
              <>
                <div className={`${hideSDWColumn ? 'grid grid-cols-[1fr]' : hideCHColumn ? 'grid grid-cols-[2fr_2fr]' : 'grid grid-cols-[2fr_1fr_2fr]'} items-center border-b border-gray-400 pb-2 mb-2`}>
                  <p className="font-bold-label ml-[20%]">Name</p>
                  {!hideCHColumn && !hideSDWColumn && <p className="font-bold-label text-center">CH Number</p>}
                  {!hideSDWColumn && <p className="font-bold-label text-center">SDW Assigned</p>}
                </div>

                {currentData.length === 0 ? (
                  <p className="font-bold-label mx-auto">No Clients Found</p>
                ) : (
                   currentData.map((client) => (
                    <ClientEntry
                      key={client.id}
                      id={client.id}
                      sm_number={client.sm_number}
                      spu={client.spu}
                      name={client.name}
                      assigned_sdw_name={client.assigned_sdw_name}
                      archive={true}
                      pendingTermination={client.pendingTermination}
                      showCheckbox={showDeleteCheckbox}
                      onSelectChange={handleSelectChange}
                      isSelected={selectedClients.includes(client.id)}
                      deleteMode={deleteMode}
                      hideCHColumn={hideCHColumn}
                      hideSDWColumn={hideSDWColumn}
                    />
                  ))
                )}
              </>
            ) : (
              <>
                <div className={`${hideSDWColumn ? 'grid grid-cols-[1fr]' : hideCHColumn ? 'grid grid-cols-[2fr_2fr]' : 'grid grid-cols-[2fr_1fr_2fr]'} items-center border-b border-gray-400 pb-2 mb-2`}>
                  <p className="font-bold-label ml-[20%]">Worker</p>
                  {!hideCHColumn && !hideSDWColumn && <p className="font-bold-label text-center">Type</p>}
                  {!hideSDWColumn && <p className="font-bold-label text-center">SPU</p>}
                </div>

                {archiveEmp.length === 0 ? (
                  <p className="font-bold-label mx-auto">No Employees Found</p>
                ) : (
                  archiveEmp.map((worker, index) => (
                    <WorkerEntry
                      key={`${worker.id}-${index}`}
                      id={worker.id}
                      name={worker.name}
                      role={worker.role}
                      spu={worker.spu}
                      spu_id={worker.spu_id}
                      archive={true}
                    />
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default Archive;

// comment
