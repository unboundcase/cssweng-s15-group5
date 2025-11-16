import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { TextInput, TextArea } from "../../Components/TextField";

import FinancialAssessmentForm from "./financial-assessment";
import CounselingForm from "./counseling";
import CorrespondenceForm from "./correspondence";
import HomeVisitationForm from "./home-visitation";

import { fetchCaseData } from "../../fetch-connections/case-connection";
import Loading from "../loading";

import { fetchSession } from "../../fetch-connections/account-connection";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function InterventionForm() {
    const interventions = [
        {
            name: "Home Visitation",
            route: "home-visitation-form",
        },
        {
            name: "Counseling",
            route: "counseling-form",
        },
        {
            name: "Financial Assistance",
            route: "financial-assessment-form",
        },
        {
            name: "Correspondence",
            route: "correspondence-form",
        },
    ];

    useEffect(() => {
        document.title = "Create Intervention";

    }, []);


    /********** USE STATES **********/

    const query = useQuery();
    const caseID = query.get('caseID') || "";
    const defaultSelection = "";
    const [intervention_selected, setInterventionSelected] = useState(defaultSelection);
    const [loadingStage, setLoadingStage] = useState(0); // 0 = red, 1 = blue, 2 = green
    const [loadingComplete, setLoadingComplete] = useState(false);

    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    const [windowWidth, setWindowWidth] = useState(
        typeof window !== "undefined" ? window.innerWidth : 1024
    );

    useEffect(() => {
        const onResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);


    useEffect(() => {
        const loadSessionAndCase = async () => {
            try {
                setLoadingStage(0); // red
                const session = await fetchSession();
                const currentUser = session?.user;

                if (!currentUser || currentUser.role !== "sdw") {
                    navigate("/unauthorized");
                    return;
                }

                setUser(currentUser);
                setLoadingStage(1); // blue

                const caseInfo = await fetchCaseData(caseID);
                setCaseData(caseInfo);

                setLoadingStage(2); // green
                setLoadingComplete(true);
            } catch (err) {
                console.error("Error loading intervention form:", err);
                navigate("/unauthorized");
            }
        };

        loadSessionAndCase();
    }, [caseID, navigate]);

    const handleSelectIntervention = (interventionName) => {
        const selected = interventions.find(
            (intervention) => intervention.name === interventionName
        );

        if (!selected) return;
    };

    /********** USE STATES **********/

    const loadingColor = loadingStage === 0 ? "red" : loadingStage === 1 ? "blue" : "green";
    if (!loadingComplete) return <Loading color={loadingColor} />;

    if (caseData && caseData.is_active === false) {
        return (
            <div className="text-red-600 font-bold-label">
                Case has been terminated.
            </div>
        );
    }

    return (
<main
  className={`flex w-full flex-col items-center justify-center gap-16 rounded-lg ${
    windowWidth <= 800 ? "p-2" : "p-16"
  }`}
>
<section
  className={
    windowWidth <= 800
      ? "flex w-full flex-col items-start gap-4"
      : "flex w-full justify-between items-center"
  }
>
  <h3 className="header-md self-start">Intervention/Helping Plan</h3>

  <select
    name="services"
    id="services"
    value={intervention_selected}
    onChange={(e) => {
      setInterventionSelected(e.target.value);
      // handleSelectIntervention(e.target.value);
    }}
    className={`label-base text-input max-w-96 ${
      windowWidth <= 800 ? "ml-auto" : ""
    }`}
  >
    <option value="" className="body-base">
      Select Intervention
    </option>
    {interventions.map((intervention, index) => (
      <option
        key={index}
        value={intervention.name}
        className="body-base"
      >
        {intervention.name}
      </option>
    ))}
  </select>
</section>


            <section className="flex w-full justify-center">
                {intervention_selected === "Home Visitation" && (
                    <HomeVisitationForm />
                )}
                {intervention_selected === "Counseling" && <CounselingForm />}
                {intervention_selected === "Financial Assistance" && (
                    <FinancialAssessmentForm />
                )}
                {intervention_selected === "Correspondence" && (
                    <CorrespondenceForm />
                )}
            </section>

            {intervention_selected == defaultSelection && (
                <section className="w-full flex flex-row justify-center">
                    <p className="text-3xl italic">Select intervention to create</p>
                </section>
            )}
        </main>
    );
}

export default InterventionForm;
