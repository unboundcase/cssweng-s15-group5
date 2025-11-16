import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../Components/SideBar";
import WorkerEntry from "../Components/WorkerEntry";
import RegisterWorker from "../Components/RegisterWorker";
import Loading from "./loading";

import {
  fetchHeadViewBySpu,
  fetchHeadViewBySupervisor,
  fetchSession
} from "../fetch-connections/account-connection";

import { fetchAllSpus } from "../fetch-connections/spu-connection";

function HomeLeader() {
  const navigate = useNavigate();

  const [allData, setAllData] = useState([]);
  const [currentData, setCurrentData] = useState([]);
  const [currentSPU, setCurrentSPU] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [projectLocation, setProjectLocation] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  const [loadingStage, setLoadingStage] = useState(0);
  const [loadingComplete, setLoadingComplete] = useState(false);

  const isMobile = windowWidth <= 700; // Changed from 650 to 700
  const isVerySmall = windowWidth <= 400;
  const hideSpuColumn = windowWidth <= 800;
  const hideTypeColumn = windowWidth <= 400;
  const isSmallLayout = windowWidth <= 900;
  const moveAddAccountToNewRow = windowWidth <= 400;
  const shortenTitle = windowWidth <= 500;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingStage(0); // Start: red
        const sessionData = await fetchSession();
        setUser(sessionData.user);
        if (!sessionData.user || !["head", "supervisor"].includes(sessionData.user.role)) {
          navigate("/unauthorized");
          return;
        }

        setLoadingStage(1); // Mid: blue

        let employees = [];

        if (sessionData.user.role === "head") {
          const data = currentSPU
            ? await fetchHeadViewBySpu(currentSPU)
            : { employees: [] };
          employees = data.employees || [];
        } else if (sessionData.user.role === "supervisor") {
          const data = await fetchHeadViewBySupervisor(sessionData.user._id);
          employees = data || [];
        }

        const filtered = employees.filter(e => e.is_active === true);
        setAllData(filtered);

        const spus = await fetchAllSpus();
        const activeSpus = spus.filter(spu => spu.is_active === true);
        setProjectLocation(activeSpus);

        setLoadingStage(2); // Final: green

        setLoadingComplete(true);
      } catch (err) {
        console.error("Error during data load", err);
        navigate("/unauthorized");
      }
    };

    loadData();
  }, [currentSPU, isRegisterOpen]);

useEffect(() => {
  let filtered = [...allData];

  if (currentSPU !== "") {
    filtered = filtered.filter((w) => w.spu_id === currentSPU);
  }

  if (searchQuery.trim() !== "") {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter((w) => {
      const name = `${w.name}`.toLowerCase();
      const idStr = w.sdw_id?.toString() || "";
      return name.includes(query) || idStr.includes(query);
    });
  }

  // Role priority mapping
  const roleOrder = {
    head: 3,
    supervisor: 2,
    sdw: 1
  };

  // Always sort by role priority first, then name
  filtered.sort((a, b) => {
    const roleA = roleOrder[a.role?.toLowerCase()] ?? 99;
    const roleB = roleOrder[b.role?.toLowerCase()] ?? 99;

    if (roleA !== roleB) {
      return roleA - roleB;
    }
    return (a.name || "").localeCompare(b.name || "");
  });

  // Optional: apply manual reverse if user toggles
  if (sortOrder === "desc") {
    filtered.reverse();
  }

  setCurrentData(filtered);
}, [allData, currentSPU, sortBy, sortOrder, searchQuery]);


// console.log("CURRENT SPU:", currentData);


  useEffect(() => {
    if (!user) return;

    const spuFromData = currentData.length > 0 ? currentData[0].spu_id : null;
    const displaySpu = user.spu_name || spuFromData;

    const title =
      user.role === "supervisor"
        ? (displaySpu || "Coordinating Unit")
        : "Coordinating Unit";

    document.title = title;
  }, [user, currentData]);

  // Determine color for Loading component
  const loadingColor = loadingStage === 0 ? "red" : loadingStage === 1 ? "blue" : "green";

  if (!loadingComplete) {
    return <Loading color={loadingColor} />;
  }
  return (
    <>
      <RegisterWorker
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegister={(newWorker) => {
          // console.log("New worker added:", newWorker);
        }}
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
        <div className={`flex flex-col w-full gap-8 ${isMobile ? 'ml-0' : 'ml-[15rem]'} px-8`}>

          <h1 className="header-main">
            {user?.role === "head"
              ? "Coordinating Unit"
              : (() => {
                  const spuFromData = currentData.length > 0 ? currentData[0].spu_id : null;
                  const displaySpu = user?.spu_name || spuFromData;
                  
                  return shortenTitle
                    ? (displaySpu || "Coordinating Unit")
                    : `Coordinating Unit${displaySpu ? ` - ${displaySpu}` : ""}`;
                })()}
          </h1>

          <div className={`flex ${isSmallLayout ? 'flex-col' : 'justify-between'} gap-10`}>
            <div className={`flex gap-5 ${isSmallLayout ? 'justify-between items-center w-full' : 'justify-between items-center w-full'}`}>
              <div className="flex gap-5 w-full">
                {user?.role == "head" && (
                  <select
                    className="text-input font-label max-w-[30rem]"
                    value={currentSPU}
                    onChange={(e) => setCurrentSPU(e.target.value)}
                  >
                    <option value="">Select SPU</option>
                    {projectLocation.map((spu) => (
                      <option key={spu._id} value={spu.spu_name}>
                        {spu.spu_name}
                      </option>
                    ))}
                  </select>
                )}

                {!isSmallLayout && (
                  <>
                    <select
                      className="text-input font-label max-w-[23rem]"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="">Find By</option>
                      <option value="name">Name</option>
                      <option value="head">Head</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="sdw">Social Development Worker</option>
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

              {user?.role == "head" && !moveAddAccountToNewRow && (
                <button
                  className="btn-outline font-bold-label flex gap-4 whitespace-nowrap"
                  onClick={() => setIsRegisterOpen(true)}
                  disabled={isRegisterOpen}
                >
                  <p>+</p>
                  <p>Add Account</p>
                </button>
              )}
            </div>

            {isSmallLayout && (
              <div className="flex gap-5 w-full">
                <select
                  className="text-input font-label max-w-[23rem]"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="">Find By</option>
                  <option value="name">Name</option>
                  <option value="head">Head</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="sdw">Social Development Worker</option>
                </select>

                <button
                  className="btn-outline font-bold-label"
                  onClick={() =>
                    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
                  }
                >
                  <div className="icon-static-setup order-button"></div>
                </button>
              </div>
            )}
          </div>

          {user?.role == "head" && moveAddAccountToNewRow && (
            <div className="flex justify-center w-full">
              <button
                className="btn-outline font-bold-label flex gap-4 whitespace-nowrap"
                onClick={() => setIsRegisterOpen(true)}
                disabled={isRegisterOpen}
              >
                <p>+</p>
                <p>Add Account</p>
              </button>
            </div>
          )}

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
            <div className={`${hideTypeColumn ? 'grid grid-cols-[1fr]' : hideSpuColumn ? 'grid grid-cols-[2fr_1fr]' : 'grid grid-cols-[2fr_1fr_2fr]'} items-center border-b border-gray-400 pb-2 mb-2`}>
              <p className="font-bold-label ml-[20%]">Worker</p>
              {!hideTypeColumn && <p className="font-bold-label text-center">Type</p>}
              {!hideSpuColumn && !hideTypeColumn && <p className="font-bold-label text-center">SPU</p>}
            </div>

            {user?.role === "head" && currentSPU === "" ? (
              <p className="font-bold-label mx-auto">
                No Sub-Project Unit Selected
              </p>
            ) : currentData.length === 0 ? (
              <p className="font-bold-label mx-auto">No Workers Found</p>
            ) : (
              currentData.map((worker) => (
                <WorkerEntry
                  key={worker.id}
                  id={worker.id}
                  name={worker.name}
                  role={worker.role}
                  spu_id={worker.spu_id}
                  hideSpuColumn={hideSpuColumn}
                  hideTypeColumn={hideTypeColumn}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default HomeLeader;
