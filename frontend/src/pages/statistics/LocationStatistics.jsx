import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "./components/StatCard";
import SectionCard from "./components/SectionCard";
import DoughnutChart from "./components/DoughnutChart";
import KeyDemographicCard from "./components/KeyDemographicCard";
import { Info } from "lucide-react";
import {
  ActiveCasesIcon, CasesClosedIcon, NewCasesAddedIcon, NewInterventionsIcon,
  AvgCaseDurationIcon, AvgInterventionsReportsIcon
} from "./components/CustomIcons";
import { useStatisticsData } from "./useStatisticsData";
import SimpleModal from "../../Components/SimpleModal";
import LineChart from "./components/LineChart";
import BarChart from "./components/BarChart";
import { fetchSession } from "../../fetch-connections/account-connection"
import { fetchAllSpus } from "../../fetch-connections/spu-connection";


export default function LocationStatistics() {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);

  const [currentSPU, setCurrentSPU] = useState(""); // selected SPU
  const [projectLocations, setProjectLocation] = useState([]); // SPU list
  const [timePeriod, setTimePeriod] = useState(0); // selected time period
  const [currentUser, setCurrentUser] = useState(null); // added

  // --- Loading system like spu-page ---
  const [loadingStage, setLoadingStage] = useState(0);
  const [loadingComplete, setLoadingComplete] = useState(false);

  // --- Responsive breakpoints like spu-page ---
  const isMobile = windowWidth <= 700;
  const isVerySmall = windowWidth <= 550;
  const isTablet = windowWidth <= 1024;
  const hideSelectLabels = windowWidth <= 360;

  useEffect(() => {
    document.title = "Organization Statistics";
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingStage(0); // red

        // --- Session check ---
        const sessionData = await fetchSession();
        const currentUser = sessionData?.user;
        setCurrentUser(currentUser); // added

        // console.log(currentUser)

        if (!currentUser || (currentUser.role !== "head" && currentUser.role !== "supervisor")) {
          navigate("/unauthorized");
          return;
        }

        // Auto-set SPU for supervisors
        if (currentUser.role === "supervisor") {
          setCurrentSPU(currentUser.spu_id || "");
        }

        setLoadingStage(1); // blue

        const spus = await fetchAllSpus();
        const activeSpus = spus.filter(spu => spu.is_active === true);
        setProjectLocation(activeSpus);

        setLoadingStage(2); // green
        setLoadingComplete(true);
      } catch (err) {
        console.error("Error during data load", err);
        navigate("/unauthorized");
      }
    };

    loadData();
  }, [navigate]);

  // Call useStatisticsData after initial loading is complete
  const { data, loading: statisticsLoading, error, loadingStatus, totalLoadingSteps } = useStatisticsData({ 
    timePeriod: timePeriod, 
    spuId: currentSPU, 
    projectLocations,
    enabled: loadingComplete // Only start when basic loading is done
  });

  // Combined loading state - true if either initial loading or statistics loading
  const loading = !loadingComplete || statisticsLoading;

  // Header bar (copied from spu-page)
  // const isMobile = windowWidth <= 700; // Remove this duplicate
  // const isVerySmall = windowWidth <= 400; // Remove this duplicate

  // Loading and error modal
  const [modalData, setModalData] = useState({
    isOpen: false,
    title: "",
    bodyText: "",
    imageCenter: null,
    confirm: false,
    onConfirm: null,
  });

  useEffect(() => {
    if (error) {
      setModalData({
        isOpen: true,
        title: "Failed to load data",
        bodyText: error,
        imageCenter: <div className="warning-icon mx-auto" />,
        confirm: false,
        onConfirm: () => { },
      });
    }
  }, [error]);

  // Stat icons
  const statCardIcons = [ActiveCasesIcon, CasesClosedIcon, NewCasesAddedIcon, NewInterventionsIcon, AvgCaseDurationIcon, AvgInterventionsReportsIcon];
  const spuStatisticsCards = data?.spuStatisticsCards?.map((card, index) => ({
    ...card,
    iconComponent: statCardIcons[index]
  })) || [];


  // --- Loading spinner like spu-page ---
  const loadingColor = loadingStage === 0 ? "red" : loadingStage === 1 ? "blue" : "green";

  

  // Always render the navbar/header
  return (
    <>
      <SimpleModal
        isOpen={modalData.isOpen}
        onClose={() => setModalData((prev) => ({ ...prev, isOpen: false }))}
        title={modalData.title}
        bodyText={modalData.bodyText}
        imageCenter={modalData.imageCenter}
        confirm={modalData.confirm}
        onConfirm={() => {
          modalData.onConfirm?.();
          setModalData((prev) => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setModalData((prev) => ({ ...prev, isOpen: false }))}
      />

      <div className="w-full fixed top-0 left-0 right-0 z-60 max-w-[1280px] mx-auto 
                flex justify-between items-center py-5 px-8 bg-white">
        {/* Left side */}
        <a href="/" className="main-logo main-logo-text-nav flex items-center gap-4">
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

        {/* Right side - Responsive selects */}
        <div className={`flex items-center ${isMobile ? 'flex-col gap-2' : 'space-x-4'}`}>
          {currentUser?.role === 'head' && ( // only show for head
            <div className="flex items-center space-x-2">
              {!hideSelectLabels && <label className="font-label text-sm">SPU:</label>}
              <select
                id="select-spu"
                name="select-spu"
                className={`text-input font-label ${isTablet ? '!w-[15rem]' : '!w-[20rem]'} ${isMobile ? '!w-[12rem]' : ''}`}
                value={currentSPU}
                onChange={e => setCurrentSPU(e.target.value)}
              >
                <option value="">All SPUs</option>
                {projectLocations.map(spu => (
                  <option key={spu._id} value={spu._id}>
                    {spu.spu_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center space-x-2">
            {!hideSelectLabels && <label className="font-label text-sm">Period:</label>}
            <select
              id="time-period"
              name="time-period"
              className={`text-input font-label ${isTablet ? '!w-[15rem]' : '!w-[20rem]'} ${isMobile ? '!w-[12rem]' : ''}`}
              value={timePeriod}
              onChange={e => setTimePeriod(Number(e.target.value))}
            >
              <option value={0}>Overall</option>
              <option value={90}>Last 90 days</option>
              <option value={30}>Last 30 days</option>
              <option value={7}>Last 7 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Render loading below navbar/header */}
      {!loadingComplete ? (
        <main className="min-h-[calc(100vh-4rem)] w-full flex mt-[9rem]">
          <InlineLoading color={loadingColor} text="Loading..." />
        </main>
      ) : statisticsLoading ? (
        <main className="min-h-[calc(100vh-4rem)] w-full flex mt-[9rem]">
          <div className="flex w-full items-center justify-center">
            <InlineLoading
              color="blue"
              text={`Loading Statistics... (${loadingStatus}/${totalLoadingSteps})`}
              progress={loadingStatus}
              total={totalLoadingSteps}
            />
          </div>
        </main>
      ) : (
        <main className={`min-h-[calc(100vh-4rem)] w-full flex ${windowWidth <= 480 ? 'mt-[12rem]' : 'mt-[9rem]'}`}>
          <div className={`flex flex-col w-full max-w-[1280px] mx-auto gap-10 px-8 pb-20 ${isMobile ? 'gap-6 px-4' : ''}`}>
            <div>
              <h2 className={`header-sm mb-4`}>SPU Statistics</h2>
              <div className={`grid gap-6 ${
                isMobile ? 'grid-cols-2' : 
                isTablet ? 'grid-cols-2' : 
                'grid-cols-3'
              }`}>
                {spuStatisticsCards.map((card, index) => (
                  <StatCard
                    key={index}
                    title={card.title}
                    value={card.value}
                    subtext={card.subtext}
                    iconComponent={card.iconComponent}
                    windowWidth={windowWidth} // Pass windowWidth prop
                  />
                ))}
              </div>
            </div>

            {data?.interventionsByTypeData && <SectionCard
              title={data.interventionsByTypeData.title}
              // headerAction={
              //   <button className="text-gray-400 hover:" aria-label="More info">
              //     <Info size={18} />
              //   </button>
              // }
            >
              <div>
                <div className="space-y-4 pt-2">
                  {(() => {
                    // Find the longest type name
                    const typeNames = data.interventionsByTypeData.types.map(type => type.name);
                    const longestTypeName = typeNames.reduce((a, b) => a.length > b.length ? a : b, "");
                    const labelWidth = `${longestTypeName.length + 2}ch`;
                    return data.interventionsByTypeData.types.map((type, index) => {
                      const maxValue = Math.max(...data.interventionsByTypeData.types.map((t) => t.value));
                      const percentage = maxValue > 0 ? (type.value / maxValue) * 100 : 0;
                      return (
                        <div key={index} className={windowWidth <= 500 ? "flex flex-col space-y-2" : "flex items-center space-x-4"}>
                          {windowWidth <= 500 && (
                            <span className="font-label font-semibold text-gray-800">
                              {type.name}: {type.value}
                            </span>
                          )}
                          <div className={windowWidth <= 500 ? "flex items-center space-x-4" : "contents"}>
                            {windowWidth > 500 && (
                              <span
                                className="font-label shrink-0"
                                style={{ minWidth: labelWidth, maxWidth: labelWidth, display: "inline-block" }}
                              >
                                {type.name}
                              </span>
                            )}
                            <div className="flex-grow bg-gray-200 rounded-full h-2">
                              <div className={`h-2 rounded-full ${type.color}`} style={{ width: `${percentage}%` }} />
                            </div>
                            {windowWidth > 500 && (
                              <span className="font-label font-semibold text-gray-800 w-8 text-right shrink-0">{type.value}</span>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </SectionCard>}

            {!currentSPU && data?.caseDistributionData && <SectionCard>
              <div>
                <h2 className="header-sm mb-4">{data.caseDistributionData.title}</h2>
                <p className="font-label mb-4">{data.caseDistributionData.subtitle}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="relative h-64 w-64 mx-auto">
                    <DoughnutChart data={data.caseDistributionData.chartData} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="header-sm bold">{data.caseDistributionData.totalCases}</span>
                      <span className="font-label">Total Cases</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    {data.caseDistributionData.legendData.map((item) => (
                      <div key={item.label} className="flex items-center">
                        <span className={`h-3 w-3 rounded-full mr-3 ${item.color}`}></span>
                        <div className="flex flex-col">
                          <span className="font-label ">{item.label}</span>
                          <span className="font-label font-semibold text-gray-800">
                            {item.value.toLocaleString()} ({item.percentage}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>}

            {data?.genderDistributionData && <SectionCard title="Gender Distribution">
              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="relative h-[18rem] w-[18rem] mx-auto">
                    <DoughnutChart data={data.genderDistributionData.chartData} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="header-sm">{data.genderDistributionData.totalCases}</span>
                      <span className="font-label">Total Members</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {data.genderDistributionData.legendData.map((item) => (
                      <div key={item.label} className="flex items-center">
                        <span className={`h-2.5 w-2.5 rounded-full mr-2.5 ${item.color}`}></span>
                        <span className="font-label">{item.label}</span>
                        <span className="ml-auto font-bold-label">
                          {item.value} ({item.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>}

            {data?.keyDemographicsData && <SectionCard
              title="Key Demographics"
              // headerAction={
              //   <button className="text-gray-400 hover:" aria-label="More info">
              //     <Info size={18} />
              //   </button>
              // }
            >
              <div>
                <div className="flex flex-col gap-4 pt-2">
                  {data.keyDemographicsData.map((item, index) => (
                    <KeyDemographicCard
                      key={index}
                      title={<span className="font-label">{item.title}</span>}
                      subtitle={<span className="font-label">{item.subtitle}</span>}
                      value={<span className="font-label font-semibold text-gray-800">{item.value}</span>}
                    />
                  ))}
                </div>
              </div>
            </SectionCard>}

            <SectionCard
              title="Worker Metrics"
              // headerAction={
              //   <button className="text-gray-400 hover:" aria-label="More info">
              //     <Info size={18} />
              //   </button>
              // }
            >
              {(() => {
                const dist = data?.workerDistributionData ?? { totalEmployees: 0, newEmployees: 0, chartData: [] };
                const isOverall = Number(timePeriod) === 0; // overall / "All time"

                return (
                  <>
                    <div className="flex justify-center py-8 w-[100%]">
                      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                        {/* Worker to Case Ratio */}
                        <div className="relative rounded-2xl bg-white p-6 shadow-[0_2px_6px_rgba(0,0,0,0.5),0_5px_2px_#78A18199] ring-1 ring-gray-200">
                          <p className="font-bold-label">Worker to Case Ratio</p>
                          <p className="main-logo-text-nav text-center">
                            {data?.ratioData?.workerToCase
                              ? `${data.ratioData.workerToCase.workerRatio} : ${data.ratioData.workerToCase.caseRatio}`
                              : "—"}
                          </p>
                          <p className="font-label text-center">
                            Each worker handles{" "}
                            {data?.ratioData?.workerToCase?.caseRatio ?? 0}{" "}
                            {data?.ratioData?.workerToCase?.caseRatio === 1 ? "case" : "cases"}
                          </p>
                        </div>

                        {/* Worker to Supervisor Ratio */}
                        <div className="relative rounded-2xl bg-white p-6 shadow-[0_2px_6px_rgba(0,0,0,0.5),0_5px_2px_#78A18199] ring-1 ring-gray-200">
                          <p className="font-bold-label">Worker to Supervisor Ratio</p>
                          <p className="main-logo-text-nav text-center">
                            {data?.ratioData?.workerToSupervisor
                              ? `${data.ratioData.workerToSupervisor.workerRatio} : ${data.ratioData.workerToSupervisor.supervisorRatio}`
                              : "—"}
                          </p>
                          <p className="font-label text-center">
                            {data?.ratioData?.workerToSupervisor?.supervisorRatio ?? 0}{" "}
                            {data?.ratioData?.workerToSupervisor?.supervisorRatio === 1 ? "worker" : "workers"} per supervisor
                          </p>
                        </div>

                        {/* Overall total workers OR new workers (this period) */}
                        <div className="relative md:col-span-2 rounded-2xl bg-white p-6 shadow-[0_2px_6px_rgba(0,0,0,0.5),0_5px_2px_#78A18199] ring-1 ring-gray-200">
                          <div className="flex items-center justify-around">
                            <p className="font-bold-label">
                              {isOverall ? "Total Workers" : "New Workers Added"}
                            </p>
                            <div className="text-right">
                              <p className="main-logo-text-nav text-center">
                                {isOverall ? (dist.totalEmployees ?? 0) : (dist.newEmployees ?? 0)}
                              </p>
                              <p className="font-label text-center">
                                {isOverall ? "Across current scope" : "This period"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Worker Distribution by Roles */}
                    <div className="rounded-2xl bg-white p-6 shadow-[0_2px_6px_rgba(0,0,0,0.5),0_5px_2px_#78A18199] ring-1 ring-gray-200">
                      <div className="mb-5 flex items-center justify-between">
                        <p className="font-bold-label">Worker Distribution by Roles</p>
                      </div>

                      {(() => {
                        const rows = dist.chartData ?? [];
                        if (!rows.length) {
                          return <p className="font-label text-gray-500">No workers found for the current filters.</p>;
                        }

                        const longest = rows.reduce((a, b) => (a.label.length > b.label.length ? a : b), rows[0])?.label ?? "";
                        const labelWidth = `${longest.length + 2}ch`;

                        return (
                          <div className="space-y-4 pt-2">
                            {rows.map((role, idx) => {
                              const total = dist.totalEmployees || 0;
                              const pct = total > 0 ? (role.value / total) * 100 : 0;
                              const barClass = role.color || "bg-gray-400";
                              return (
                                <div key={idx} className={windowWidth <= 700 ? "flex flex-col space-y-2" : "flex items-center space-x-4"}>
                                  {windowWidth <= 700 && (
                                    <span className="font-label font-semibold text-gray-800">
                                      {role.label}: {role.value}
                                    </span>
                                  )}
                                  <div className={windowWidth <= 700 ? "flex items-center space-x-4" : "contents"}>
                                    {windowWidth > 700 && (
                                      <span
                                        className="font-label truncate"
                                        style={{ minWidth: labelWidth, maxWidth: labelWidth, display: "inline-block" }}
                                        title={role.label}
                                      >
                                        {role.label}
                                      </span>
                                    )}

                                    <div className="flex-grow bg-gray-200 rounded-full h-2">
                                      <div className={`h-2 rounded-full ${barClass}`} style={{ width: `${pct}%` }} />
                                    </div>

                                    {windowWidth > 700 && (
                                      <span className="font-bold-label w-10 text-right">{role.value}</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </>
                );
              })()}
            </SectionCard>

            {data?.caseOverTime && <SectionCard
              title="Cases Over Time"
              // headerAction={
              //   <button className="text-gray-400 hover:text-gray-600" aria-label="More info">
              //     <Info size={18} />
              //   </button>
              // }
            >
              {/* Remove "Past 7 Days" label if showing full range */}
              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                <LineChart
                  data={data.caseOverTime.map(d => ({
                    date: d.date,
                    value: Number(d.count ?? d.value ?? 0),
                  }))}
                  color="#06B6D4"
                  height={60}
                />

              </div>
            </SectionCard>}

            {data?.workerOverTime && <SectionCard
              title="Workers Over Time"
              // headerAction={
              //   <button className="text-gray-400 hover:text-gray-600" aria-label="More info">
              //     <Info size={18} />
              //   </button>
              // }
            >
              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                <LineChart
                  data={data.caseOverTime.map(d => ({
                    date: d.date,
                    value: Number(d.count ?? d.value ?? 0),
                  }))}
                  color="#e24800"
                  height={60}
                />

              </div>
            </SectionCard>}

          </div>
        </main>
      )}
    </>
  );
}

// Inline loading spinner (reuse code, allow custom text/progress)
function InlineLoading({ color = "red", text = "Loading...", progress, total }) {
    const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowTimeoutWarning(true), 10000);
        return () => clearTimeout(timer);
    }, []);

    const colorMap = {
        green: "var(--color-green)",
        blue: "var(--color-blue)",
        red: "var(--color-primary)",
    };

    const ringColor = colorMap[color] || "var(--color-primary)";

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-white gap-10">
            <div className="flex items-center gap-10">
                <p style={{ color: "var(--color-black)" }} className="header-main">
                    {text}
                </p>
                <div
                    className="loader-conic"
                    style={{
                        background: `conic-gradient(${ringColor} 0deg 270deg, transparent 270deg 360deg)`
                    }}
                ></div>
            </div>

        </div>
    );
}//