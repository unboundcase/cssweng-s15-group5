import { useState, useEffect } from "react";
import SideBar from "../Components/SideBar";
import ClientEntry from "../Components/ClientEntry";
import Loading from "./loading";

import {
  fetchSession,
  fetchSDWViewById,
  fetchSupervisorView,
  fetchHeadViewBySupervisor,
  fetchHeadViewBySpu,
  fetchHeadView,
} from "../fetch-connections/account-connection";

import { fetchAllSpus } from "../fetch-connections/spu-connection";

import { useNavigate } from "react-router-dom";

function HomeSDW() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [currentSPU, setCurrentSPU] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [projectLocation, setProjectLocation] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  const [loadingStage, setLoadingStage] = useState(0);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [pendingOnly, setPendingOnly] = useState(false);

  const isMobile = windowWidth <= 700;
  const isVerySmall = windowWidth <= 400;
  const isSmallLayout = windowWidth <= 700; // Changed from 900 to 700
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
    const loadAll = async () => {
      try {
        setLoadingStage(0); // Red

        const sessionData = await fetchSession();
        if (!sessionData.user || !["sdw", "supervisor", "head"].includes(sessionData.user.role)) {
          navigate("/unauthorized");
          return;
        }
        setUser(sessionData.user);

        setLoadingStage(1); // Blue

        const spus = await fetchAllSpus();
        setProjectLocation(spus.filter((spu) => spu.is_active));

        let empData = [];
        if (sessionData.user.role === "supervisor") {
          const data = await fetchHeadViewBySupervisor(sessionData.user._id);
          empData = data || [];
        }
        setEmployees(empData);

        let clientData = [];
        if (sessionData.user.role === "sdw") {
          const res = await fetchSDWViewById(sessionData.user._id);
          clientData = res || [];
        } else if (sessionData.user.role === "supervisor") {
          const res = await fetchSupervisorView();
          clientData = res.cases || [];
        } else if (sessionData.user.role === "head") {
          if (currentSPU) {
            const res = await fetchHeadViewBySpu(currentSPU);
            clientData = res.cases || [];
          }
        }
        setClients(clientData);

        setLoadingStage(2); // Green
        setLoadingComplete(true); // smooth transition
      } catch (err) {
        console.error("Error loading page:", err);
        navigate("/unauthorized");
      }
    };

    loadAll();
  }, [currentSPU]);

  useEffect(() => {
    if (!user) return;
    
    const spuFromData = clients.length > 0 ? clients[0].spu : null;
    const displaySpu = user.spu_name || spuFromData;
    
    const title =
      user.role === "head"
        ? "Sponsored Member Cases"
        : (displaySpu || "Sponsored Member Cases");
    document.title = title;
  }, [user, clients]);

  const getFilteredClients = () => {
    let filtered = [...clients].filter((c) => c.is_active);

    if (sortBy === "pend_term") {
      filtered = filtered.filter((c) => c.pendingTermination === true);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((c) => {
        const fullName = c.name?.toLowerCase() || "";
        const chNumberStr = c.sm_number?.toString() || "";
        return fullName.includes(query) || chNumberStr.includes(query);
      });
    }

    if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "sm_number") {
      filtered.sort((a, b) => a.sm_number - b.sm_number);
    } else if (sortBy === "pend_term") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sortOrder === "desc") {
      filtered.reverse();
    }

    if (user?.role === "supervisor") {
      const allowedIds = employees.map((e) => e.id);
      filtered = filtered.filter((c) => allowedIds.includes(c.assigned_sdw));
    }

    return filtered;
  };

  const finalClients = getFilteredClients();

  const loadingColor = loadingStage === 0 ? "red" : loadingStage === 1 ? "blue" : "green";
  if (!loadingComplete) return <Loading color={loadingColor} />;

  return (
    <>
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

        <div className={`flex flex-col w-full gap-8 ${isMobile ? 'ml-0' : 'ml-[15rem]'} px-8`}>
          <h1 className="header-main">
            {user?.role === "head"
              ? "Sponsored Member Cases"
              : (() => {
                  const spuFromData = clients.length > 0 ? clients[0].spu : null;
                  const displaySpu = user?.spu_name || spuFromData;
                  
                  return shortenTitle
                    ? (displaySpu || "Sponsored Member Cases")
                    : `Sponsored Member Cases${displaySpu ? ` - ${displaySpu}` : ""}`;
                })()}
          </h1>

          <div className={`flex ${isSmallLayout ? 'flex-col' : 'justify-between'} gap-10`}>
            <div className={`flex gap-5 ${isSmallLayout ? 'justify-between items-center w-full' : 'justify-between items-center w-full'}`}>
              <div className="flex gap-5 w-full">
                {user?.role === "head" && (
                  <select
                    className="text-input font-label max-w-[30rem]"
                    value={currentSPU}
                    onChange={(e) => setCurrentSPU(e.target.value)}
                  >
                    <option value="">Select SPU</option>
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
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="">Sort By</option>
                      <option value="name">Name</option>
                      <option value="sm_number">CH Number</option>
                      <option value="pend_term">Pending Termination</option>
                    </select>

                    <button
                      className="btn-outline font-bold-label"
                      onClick={() =>
                        setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
                      }
                    >
                      <div className="icon-static-setup order-button"></div>
                    </button>
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
              <div className="flex gap-5 w-full">
                <select
                  className="text-input font-label max-w-[20rem]"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="">Sort By</option>
                  <option value="name">Name</option>
                  <option value="sm_number">CH Number</option>
                  <option value="pend_term">Pending Termination</option>
                </select>

                <button
                  className="btn-outline font-bold-label"
                  onClick={() =>
                    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
                  }
                >
                  <div className="icon-static-setup order-button"></div>
                </button>

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

          <div className="flex flex-col w-full gap-3">
            <div className={`${hideSDWColumn ? 'grid grid-cols-[1fr]' : hideCHColumn ? 'grid grid-cols-[2fr_2fr]' : 'grid grid-cols-[2fr_1fr_2fr]'} items-center border-b border-gray-400 pb-2 mb-2`}>
              <p className="font-bold-label ml-[20%]">Name</p>
              {!hideCHColumn && !hideSDWColumn && <p className="font-bold-label text-center">CH Number</p>}
              {!hideSDWColumn && <p className="font-bold-label text-center">SDW Assigned</p>}
            </div>

            {user?.role === "head" && currentSPU === "" ? (
              <p className="font-bold-label mx-auto">
                No Sub-Project Unit Selected
              </p>
            ) : finalClients.length === 0 ? (
              <p className="font-bold-label mx-auto">No Clients Found</p>
            ) : (
              finalClients.map((client) => (
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
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default HomeSDW;
