import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { TextInput, TextArea, DateInput } from "../../Components/TextField";
import Signature from "../../Components/Signature"
import FamilyCard from "../../Components/FamilyCard";
import SimpleModal from "../../Components/SimpleModal";
import { AnimatePresence, motion } from "framer-motion";
import Loading from "../loading";
import { fetchSession } from "../../fetch-connections/account-connection";
import { fetchEmployeeById } from "../../fetch-connections/account-connection";

// API Import
import {
    fetchCaseData,
    fetchFormData,
    createHomeVis,
    editHomeVis,
    deleteHomeVis,
} from "../../fetch-connections/homeVisitation-connection";
import { generateHomeVisitForm } from "../../generate-documents/generate-documents";


function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function HomeVisitationForm() {
    // ===== START :: Setting Data ===== //

    const query = useQuery();
    const action = query.get('action') || "";
    const caseID = query.get('caseID') || "";
    const formID = query.get('formID') || "";

    const [loading, setLoading] = useState(true);
    const [rawCaseData, setRawCaseData] = useState(null);
    const [rawFatherData, setRawFatherData] = useState(null);
    const [rawMotherData, setRawMotherData] = useState(null);
    const [rawOtherFamilyData, setRawOtherFamilyData] = useState(null);
    const [rawFormData, setRawFormData] = useState(null);

    const [newformID, setnewformID] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [noFormFound, setNoFormFound] = useState(false);
    const [noCaseFound, setNoCaseFound] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [loadingStage, setLoadingStage] = useState(0);
    const [loadingComplete, setLoadingComplete] = useState(false);
    const [user, setUser] = useState(null);

    const [authorized, setAuthorized] = useState(false);

    const [data, setData] = useState({
        form_num: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        grade_year_course: "",
        years_in_program: "",
        date: "",
        community: "",
        sponsor_name: "",
        family_type: "",
        father_first_name: "",
        father_middle_name: "",
        father_last_name: "",
        father_work: "",
        father_income: "",
        mother_first_name: "",
        mother_middle_name: "",
        mother_last_name: "",
        mother_work: "",
        mother_income: "",
        sm_progress: "",
        family_progress: "",
        recommendations: "",
        agreement: "",
    });

    const [familyMembers, setFamilyMembers] = useState([]);

    // ⬇️ windowWidth for responsive behavior (≤800px stacks to 1 column)
    const [windowWidth, setWindowWidth] = useState(
        typeof window !== "undefined" ? window.innerWidth : 1024
    );
    useEffect(() => {
        const onResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // < START :: Auto-Filled Data > //

    const viewForm = action !== 'create' ? true : false;

    const navigate = useNavigate();

    useEffect(() => {
        setLoadingStage(0);
        const loadSession = async () => {
            const sessionData = await fetchSession();
            const currentUser = sessionData?.user;
            setUser(currentUser);

            if (!currentUser) {
                console.error("No user session found");
                navigate("/unauthorized");
                return;
            }
        };
        loadSession();
    }, []);

    if (!viewForm) {
        useEffect(() => {
            const loadData = async () => {
                setLoadingStage(1);

                const returnData = await fetchCaseData(caseID);
                if (!returnData) {
                    setNoCaseFound(true)
                    return
                }
                const caseData = returnData.case
                const fatherData = returnData.father
                const motherData = returnData.mother
                const otherFamilyData = returnData.otherFamily

                setRawCaseData(caseData);
                setRawFatherData(fatherData);
                setRawMotherData(motherData);
                setRawOtherFamilyData(otherFamilyData);

                setData((prev) => ({
                    ...prev,
                    first_name: caseData.first_name || "",
                    middle_name: caseData.middle_name || "",
                    last_name: caseData.last_name || "",

                    father_first_name: fatherData?.first_name || "",
                    father_middle_name: fatherData?.middle_name || "",
                    father_last_name: fatherData?.last_name || "",
                    father_work: fatherData?.occupation || "",
                    father_income: fatherData?.income ?? "",

                    mother_first_name: motherData?.first_name || "",
                    mother_middle_name: motherData?.middle_name || "",
                    mother_last_name: motherData?.last_name || "",
                    mother_work: motherData?.occupation || "",
                    mother_income: motherData?.income ?? "",

                    form_num: returnData?.form_number + 1 || 1
                }));

                if (returnData.transformedFamily)
                    setFamilyMembers(returnData.transformedFamily);
                else
                    setFamilyMembers(otherFamilyData);
            };
            loadData();
        }, []);
    }

    useEffect(() => {
        setFirstName(data.first_name || "");
        setMiddleName(data.middle_name || "");
        setLastName(data.last_name || "");

        setFatherFirstName(data.father_first_name || "");
        setFatherMiddleName(data.father_middle_name || "");
        setFatherLastName(data.father_last_name || "");
        setFatherWork(data.father_work || "");
        setFatherIncome(data.father_income ?? "");

        setMotherFirstName(data.mother_first_name || "");
        setMotherMiddleName(data.mother_middle_name || "");
        setMotherLastName(data.mother_last_name || "");
        setMotherWork(data.mother_work || "");
        setMotherIncome(data.mother_income ?? "");

        setFormNum(data.form_num)

        setLoadingStage(2);
        setLoadingComplete(true);
    }, [data]);

    // < END :: Auto-Filled Data > //

    // < START :: View Form > //

    if (viewForm) {
        useEffect(() => {
            const loadFormData = async () => {
                const returnFormData = await fetchFormData(
                    caseID,
                    formID,
                );
                if (!returnFormData) {
                    setNoFormFound(true)
                    return
                }
                const caseData = returnFormData.case
                const formData = returnFormData.form;
                const otherFamilyData = formData.familyMembers

                const fatherData = formData.father;
                const motherData = formData.mother;

                setRawFormData(formData);
                setData((prev) => ({
                    ...prev,
                    first_name: caseData.first_name || "",
                    middle_name: caseData.middle_name || "",
                    last_name: caseData.last_name || "",

                    grade_year_course: formData.grade_year_course || "",
                    years_in_program: formData.years_in_program || "",
                    date: formData.date || "",
                    community: formData.community || "",
                    sponsor_name: formData.sponsor_name || "",
                    family_type: formData.family_type || "",
                    sm_progress: formData.sm_progress || "",
                    family_progress: formData.family_progress || "",
                    observation_findings: formData.observation_findings || [],
                    interventions: formData.interventions || [],
                    recommendations: formData.recommendations || "",
                    agreement: formData.agreement || "",

                    father_first_name: fatherData?.first_name || "",
                    father_middle_name: fatherData?.middle_name || "",
                    father_last_name: fatherData?.last_name || "",
                    father_work: fatherData?.occupation || "",
                    father_income: fatherData?.income ?? "",

                    mother_first_name: motherData?.first_name || "",
                    mother_middle_name: motherData?.middle_name || "",
                    mother_last_name: motherData?.last_name || "",
                    mother_work: motherData?.occupation || "",
                    mother_income: motherData?.income ?? "",

                    form_num: returnFormData.form_number
                }));

                if (returnFormData.transformedFamily)
                    setFamilyMembers(returnFormData.transformedFamily);
                else
                    setFamilyMembers(otherFamilyData);
                setLoadingStage(2);
                setLoadingComplete(true);
            };
            loadFormData();
        }, []);

        useEffect(() => {
            setGradeYearCourse(data.grade_year_course || "");
            setYearsInProgram(data.years_in_program || "");
            setDate(data.date || "");
            setCommunity(data.community || "");
            setSponsorName(data.sponsor_name || "");
            setFamilyType(data.family_type || "");
            setSMProgress(data.sm_progress || "");
            setFamilyProgress(data.family_progress || "");
            setObservationFindings(data.observation_findings || "");
            setInterventions(data.interventions || "");
            setRecommendation(data.recommendations || "");
            setAgreement(data.agreement || "");
        }, [data]);
    }

    // < END :: View Form > //

    useEffect(() => {
        if (data?.date) {
            const date = new Date(data.date);
            if (!isNaN(date)) {
                setDate(formatter.format(date));
            }
        }
    }, [data]);

    const formatter = new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    // ===== END :: Setting Data ===== //

    // ===== START :: Backend Connection ===== //

    const [errors, setErrors] = useState({});

    const formatListWithAnd = (items) => {
        if (items.length === 1) return items[0];
        if (items.length === 2) return `${items[0]} and ${items[1]}`;
        return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
    };

    const validateForm = () => {
        const fieldErrors = {};

        if (!grade_year_course || grade_year_course.trim() === "") fieldErrors.grade_year_course = "Grade/Year Course is required.";
        if (!years_in_program || years_in_program.trim() === "") fieldErrors.years_in_program = "Year/s in the Program is required.";
        if (isNaN(Number(years_in_program))) fieldErrors.years_in_program = "Year/s in the Program must be a number.";
        if (!date || date.trim() === "") fieldErrors.date = "Date is required.";
        if (!community || community.trim() === "") fieldErrors.community = "Community is required.";
        if (!sponsor_name || sponsor_name.trim() === "") fieldErrors.sponsor_name = "Sponsor Name is required.";
        if (!family_type || family_type.trim() === "") fieldErrors.family_type = "Family Type is required.";
        if (!sm_progress || sm_progress.trim() === "") fieldErrors.sm_progress = "SM Progress is required.";
        if (!family_progress || family_progress.trim() === "") fieldErrors.family_progress = "Family Progress is required.";
        if (!observation_findings || observation_findings.trim() === "") fieldErrors.observation_findings = "Observation/Findings is required.";
        if (!interventions || interventions.trim() === "") fieldErrors.interventions = "Interventions Made is required.";
        if (!recommendations || recommendations.trim() === "") fieldErrors.recommendations = "Recommendations is required.";
        if (!agreement || agreement.trim() === "") fieldErrors.agreement = "Agreement is required.";

        if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);

            const fieldNames = Object.values(fieldErrors);
            setModalTitle("Missing / Invalid Fields");
            setModalBody(
                <>
                    <p className="font-medium text-gray-700 mb-2">
                        Please correct the following errors before submitting:
                    </p>
                    <p className="body-sm text-gray-700 mb-2">
                        (Write N/A if necessary)
                    </p>
                    <br />
                    <div className="flex justify-center">
                        <ul className="list-disc list-inside mt-2 text-left">
                            {fieldNames.map((msg, index) => (
                                <li key={index}>{msg}</li>
                            ))}
                        </ul>
                    </div>
                </>
            );
            setModalImageCenter(<div className="warning-icon mx-auto" />);
            setModalConfirm(false);
            setShowModal(true);
            return false;
        }

        setErrors({});
        return true;
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();

        const isValid = validateForm();

        if (!isValid) {
            setModalOnConfirm(() => () => { });
            setModalOnCancel(() => () => { });
            setModalConfirm(false);
            setIsProcessing(false);
            return false
        };

        setModalTitle("Confirm Creation");
        setModalBody("Are you sure you want to save this Home Visitation Form? This cannot be edited or deleted after creation.");
        setModalImageCenter(<div className="warning-icon mx-auto" />);
        setModalConfirm(true);
        setModalOnConfirm(() => async () => {
            setShowModal(false);
            setIsProcessing(true);

            try {
                if (!isValid) return;
                const created = await handleCreate();

                if (created) {
                    setShowSuccessModal(true);
                } else {
                    setModalTitle("Submission Failed");
                    setModalBody("Something went wrong while creating the intervention form.");
                    setModalImageCenter(<div className="warning-icon mx-auto" />);
                    setModalConfirm(false);
                    setShowModal(true);
                }
            } catch (err) {
                console.error("Submission failed:", err);
                setModalTitle("Unexpected Error");
                setModalBody("An unexpected error occurred while submitting the form.");
                setModalImageCenter(<div className="warning-icon mx-auto" />);
                setModalConfirm(false);
                setShowModal(true);
            } finally {
                setIsProcessing(false);
            }
        });
        setModalOnCancel(() => () => {
            setShowModal(false);
        });
        setShowModal(true);
    };

    const handleCreate = async () => {
        const payload = {
            form_num,
            first_name,
            middle_name,
            last_name,

            grade_year_course,
            years_in_program,

            date,
            community,
            sponsor_name,

            family_type,
            father_first_name,
            father_middle_name,
            father_last_name,
            father_work,
            father_income,
            rawFatherData,

            mother_first_name,
            mother_middle_name,
            mother_last_name,
            mother_work,
            mother_income,
            rawMotherData,

            rawOtherFamilyData,

            sm_progress,
            family_progress,
            recommendations,
            agreement,

            familyMembers,
            observation_findings,
            interventions,
        };

        const response = await createHomeVis(payload, caseID);
        if (response?.form?._id) {
            setnewformID(response.form._id);
            return true;
        } else {
            return false;
        }
    };

    const handleUpdate = async () => {
        const updatedPayload = {
            form_num,
            first_name,
            middle_name,
            last_name,

            grade_year_course,
            years_in_program,

            date,
            community,
            sponsor_name,

            family_type,
            father_first_name,
            father_middle_name,
            father_last_name,
            father_work,
            father_income,
            rawFatherData,

            mother_first_name,
            mother_middle_name,
            mother_last_name,
            mother_work,
            mother_income,
            rawMotherData,

            rawOtherFamilyData,

            sm_progress,
            family_progress,
            recommendations,
            agreement,

            familyMembers,
            observation_findings,
            interventions,
        };

        const response = await editHomeVis(updatedPayload, caseID, formID);
    };

    const handleDelete = async () => {
        const response = await deleteHomeVis(formID);
    };

    // ===== END :: Backend Connection ===== //

    // ===== START :: Modals ===== //

    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalBody, setModalBody] = useState("");
    const [modalImageCenter, setModalImageCenter] = useState(null);
    const [modalConfirm, setModalConfirm] = useState(false);
    const [modalOnConfirm, setModalOnConfirm] = useState(() => () => { });
    const [modalOnCancel, setModalOnCancel] = useState(undefined);

    // ===== END :: Modals ===== //

    // ===== START :: Local Functions ===== //

    const [savedTime, setSavedTime] = useState(null);
    const timeoutRef = useRef(null);
    const [sectionEdited, setSectionEdited] = useState("");

    const [showErrorOverlay, setShowErrorOverlay] = useState(false);

    useEffect(() => {
        if (errors && Object.keys(errors).length > 0) {
            setShowErrorOverlay(true);
        }
    }, [errors]);

    const handleChange = (section) => (e) => {
        setSectionEdited(section);

        const now = new Date();
        const timeString = now.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
        });
        setSavedTime(`Saved at ${timeString}`);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            setSavedTime(null);
        }, 3000);
    };

    const handleAddObservation = () => {
        const newObservation = "";
        setObservationFindings((prev) => [...prev, newObservation]);
    };

    const updateObservations = (index, value) => {
        setObservationFindings((prev) =>
            prev.map((item, i) => (i === index ? value : item)),
        );
    };

    const deleteObservation = (indexToDelete) => {
        setObservationFindings((prev) =>
            prev.filter((_, i) => i !== indexToDelete),
        );
    };

    const handleAddIntervention = () => {
        const newIntervention = "";
        setInterventions((prev) => [...prev, newIntervention]);
    };

    const updateInterventions = (index, value) => {
        setInterventions((prev) =>
            prev.map((item, i) => (i === index ? value : item)),
        );
    };

    const deleteIntervention = (indexToDelete) => {
        setInterventions((prev) => prev.filter((_, i) => i !== indexToDelete));
    };

    // ===== END :: Local Functions ===== //

    function currency_Formatter(value) {
        if (typeof value !== "number") return "";
        return value.toLocaleString("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    // ===== START :: Use States ===== //

    const [observation_findings, setObservationFindings] = useState(data?.observation_findings || "");
    const [interventions, setInterventions] = useState(data?.interventions || "");

    const [last_name, setLastName] = useState(data?.last_name || "");
    const [middle_name, setMiddleName] = useState(data?.middle_name || "");
    const [first_name, setFirstName] = useState(data?.first_name || "");
    const [form_num, setFormNum] = useState(data?.form_num || "");
    const [grade_year_course, setGradeYearCourse] = useState(
        data?.grade_year_course || "",
    );
    const [years_in_program, setYearsInProgram] = useState(
        data?.years_in_program || "",
    );
    const [date, setDate] = useState(data?.date || "");
    const [community, setCommunity] = useState(data?.community || "");
    const [sponsor_name, setSponsorName] = useState(data?.sponsor_name || "");
    const [family_type, setFamilyType] = useState(data?.family_type || "");
    const [father_first_name, setFatherFirstName] = useState(
        data?.father_first_name || "",
    );
    const [father_middle_name, setFatherMiddleName] = useState(
        data?.father_middle_name || "",
    );
    const [father_last_name, setFatherLastName] = useState(
        data?.father_last_name || "",
    );
    const [father_work, setFatherWork] = useState(data?.father_work || "");
    const [father_income, setFatherIncome] = useState(
        data?.father_income ?? "",
    );
    const [mother_first_name, setMotherFirstName] = useState(
        data?.mother_first_name || "",
    );
    const [mother_middle_name, setMotherMiddleName] = useState(
        data?.mother_middle_name || "",
    );
    const [mother_last_name, setMotherLastName] = useState(
        data?.mother_last_name || "",
    );
    const [mother_work, setMotherWork] = useState(data?.mother_work || "");
    const [mother_income, setMotherIncome] = useState(
        data?.mother_income ?? "",
    );
    const [sm_progress, setSMProgress] = useState(data?.sm_progress || "");
    const [family_progress, setFamilyProgress] = useState(
        data?.family_progress || "",
    );
    const [recommendations, setRecommendation] = useState(
        data?.recommendations || "",
    );
    const [agreement, setAgreement] = useState(data?.agreement || "");

    const [selectedFamily, setSelectedFamily] = useState(null);
    const [editingFamilyValue, setEditingFamilyValue] = useState({});
    const [showConfirm, setShowConfirm] = useState(false);

    // ===== END :: Use States ===== //

    useEffect(() => {
        if (viewForm && form_num) {
            document.title = `Home Visitation Form #${form_num}`;
        } else if (!viewForm) {
            document.title = `Create Home Visitation Form`;
        }

    }, [form_num]);

    useEffect(() => {
        const authorizeAccess = async () => {
            if (!user || !data) return;

            const returnData = await fetchCaseData(caseID);

            const assignedSDWId = returnData.case.assigned_sdw;

            if (user?.role === "head") {
                setAuthorized(true);
                return;
            }

            if (user?.role === "sdw") {
                if (assignedSDWId === user._id) {
                    setAuthorized(true);
                } else {
                    navigate("/unauthorized");
                }
                return;
            }

            if (user?.role === "supervisor") {
                try {
                    const res = await fetchEmployeeById(assignedSDWId);
                    if (res.ok && res.data.manager === user._id) {
                        setAuthorized(true);
                        return
                    } else {
                        navigate("/unauthorized");
                    }
                } catch (err) {
                    console.error("Supervisor access check failed:", err);
                    navigate("/unauthorized");
                }
                return;
            }

            navigate("/unauthorized");
        };

        authorizeAccess();
    }, [data, user]);


    if (!data) return <div>No data found.</div>;

    if (noFormFound) {
        return (
            <main className="flex justify-center w-full p-16">
                <div className="flex w/full flex-col items-center justify-center gap-16 rounded-lg border border-[var(--border-color)] p-16">
                    <div className="flex w-full justify-between">
                        <button
                            onClick={() => navigate(`/case/${caseID}`)}
                            className="flex items-center gap-5 label-base arrow-group">
                            <div className="arrow-left-button"></div>
                            Go Back
                        </button>
                    </div>
                    <h3 className="header-md">
                        Home Visitation Report
                    </h3>
                    <p className="text-3xl red"> No form found. </p>
                </div>
            </main>
        )
    }

    if (noCaseFound) {
        return (
            <main className="flex justify-center w-full p-16">
                <div className="flex w-full flex-col items-center justify-center gap-16 rounded-lg border border-[var(--border-color)] p-16">
                    <div className="flex w-full justify-between">
                        <button
                            onClick={() => navigate(`/case/${caseID}`)}
                            className="flex items-center gap-5 label-base arrow-group">
                            <div className="arrow-left-button"></div>
                            Go Back
                        </button>
                    </div>
                    <h3 className="header-md">
                        Home Visitation Report
                    </h3>
                    <p className="text-3xl red"> No case found. </p>
                </div>
            </main>
        )
    }

    const loadingColor = loadingStage === 0 ? "red" : loadingStage === 1 ? "blue" : "green";
    if (!loadingComplete || !authorized) return <Loading color={loadingColor} />;

    return (
        <>
            {showModal && (
                <SimpleModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={modalTitle}
                    bodyText={modalBody}
                    imageCenter={modalImageCenter}
                    confirm={modalConfirm}
                    onConfirm={modalOnConfirm}
                    onCancel={modalOnCancel}
                />
            )}
            <main className="flex w-full flex-col items-center justify-center gap-16 rounded-lg border border-[var(--border-color)] p-16">
                <div className="flex w-full justify-between">
                    <button
                        onClick={() => navigate(`/case/${caseID}`)}
                        className="flex items-center gap-5 label-base arrow-group">
                        <div className="arrow-left-button"></div>
                        Go Back
                    </button>
                    <h4 className="header-sm self-end">Form #: {form_num}</h4>
                </div>
                <h3 className="header-md">Home Visitation Report</h3>

                {/* Sponsored Member */}
                <section className="flex w-full flex-col gap-16">
                    <div className="flex w-full flex-col gap-8 rounded-[0.8rem] border border-[var(--border-color)] p-8">
                        <div className="flex border-b border-[var(--border-color)]">
                            <h4 className="header-sm">Sponsored Member</h4>
                        </div>

                        <div className={windowWidth <= 800 ? "flex flex-col items-stretch gap-8" : "inline-flex items-center justify-center gap-16"}>
                            {/* Left column */}
                            <div
                                className="flex flex-col gap-8"
                                style={{
                                    width: "100%",
                                    maxWidth: windowWidth <= 800 ? "100%" : "40rem",
                                }}
                            >
                                <TextInput placeholder="Last Name" label="Last Name" value={last_name} disabled />
                                <TextInput placeholder="First Name" label="First Name" value={first_name} disabled />
                                <TextInput placeholder="Middle Name" label="Middle Name" value={middle_name} disabled />
                            </div>

                            {/* Right column */}
                            <div
                                className="flex flex-col gap-8"
                                style={{
                                    width: "100%",
                                    maxWidth: windowWidth <= 800 ? "100%" : "40rem",
                                }}
                            >
                                <TextInput
                                    label="Grade/Year Course"
                                    placeholder="Grade/Year Course"
                                    value={grade_year_course}
                                    setValue={setGradeYearCourse}
                                    handleChange={handleChange("Sponsored Member")}
                                    error={errors["grade_year_course"]}
                                    disabled={viewForm}
                                />
                                <TextInput
                                    label="Year/s in the Program"
                                    placeholder="Year/s in the Program"
                                    value={years_in_program}
                                    setValue={setYearsInProgram}
                                    handleChange={handleChange("Sponsored Member")}
                                    error={errors["years_in_program"]}
                                    disabled={viewForm}
                                />
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-20">
                                        <p className="label-base w-64">Family Type</p>
                                        <select
                                            name="family_type"
                                            id="family_type"
                                            value={family_type}
                                            onChange={(e) => {
                                                handleChange("Sponsored Member")(e);
                                                setFamilyType(e.target.value);
                                            }}
                                            disabled={viewForm}
                                            className={`label-base text-input ${errors["family_type"] ? "text-input-error" : ""}`}
                                            error={errors["family_type"]}
                                        >
                                            <option value="" className="body-base">Select</option>
                                            <option value="Nuclear" className="body-base">Nuclear</option>
                                            <option value="Extended" className="body-base">Extended</option>
                                            <option value="Blended" className="body-base">Blended</option>
                                        </select>
                                    </div>
                                    {errors["family_type"] && (
                                        <div className="text-red-500 text-sm self-end">Missing input</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {savedTime && sectionEdited === "Sponsored Member" && (
                            <p className="mt-2 self-end text-sm">{savedTime}</p>
                        )}
                    </div>
                </section>

                {/* General Info */}
                <section className="flex w-full flex-col gap-16">
                    <div className="flex w-full flex-col gap-8 rounded-[0.8rem] border border-[var(--border-color)] p-8">
                        <div className="flex border-b border-[var(--border-color)]">
                            <h4 className="header-sm">General Information</h4>
                        </div>

                        <div className={windowWidth <= 800 ? "flex flex-col items-stretch gap-8" : "inline-flex items-start justify-center gap-16"}>
                            {/* Left column */}
                            <div
                                className="flex flex-col gap-8"
                                style={{
                                    width: "100%",
                                    maxWidth: windowWidth <= 800 ? "100%" : "40rem",
                                }}
                            >
                                <DateInput
                                    label="Date"
                                    placeholder="Date"
                                    value={date}
                                    setValue={setDate}
                                    handleChange={handleChange("General Information")}
                                    error={errors["date"]}
                                    disabled={viewForm}
                                />
                                <TextInput
                                    label="Community"
                                    placeholder="Community"
                                    value={community}
                                    setValue={setCommunity}
                                    handleChange={handleChange("General Information")}
                                    error={errors["community"]}
                                    disabled={viewForm}
                                />
                            </div>

                            {/* Right column */}
                            <div
                                className="flex flex-col gap-8"
                                style={{
                                    width: "100%",
                                    maxWidth: windowWidth <= 800 ? "100%" : "40rem",
                                }}
                            >
                                <TextInput
                                    label="Sponsor Name"
                                    placeholder="Sponsor Name"
                                    value={sponsor_name}
                                    setValue={setSponsorName}
                                    handleChange={handleChange("General Information")}
                                    error={errors["sponsor_name"]}
                                    disabled={viewForm}
                                />
                            </div>
                        </div>

                        {savedTime && sectionEdited === "General Information" && (
                            <p className="mt-2 self-end text-sm">{savedTime}</p>
                        )}
                    </div>
                </section>

                {/* Father and Mother */}
                <section className={windowWidth <= 800 ? "flex w-full flex-col gap-16" : "flex w-full gap-16"}>
                    {/* Father */}
                    <div
                        className="flex w-full flex-col gap-8 rounded-[0.8rem] border border-[var(--border-color)] p-8"
                        style={{
                            width: "100%",
                            maxWidth: windowWidth <= 800 ? "100%" : "40rem",
                            margin: "0 auto",
                        }}
                    >
                        <div className="flex border-b border-[var(--border-color)]">
                            <h4 className="header-sm">Father</h4>
                        </div>
                        <div className={windowWidth <= 800 ? "flex flex-col gap-8" : "inline-flex items-center justify-center gap-16"}>
                            <div
                                className="flex flex-col gap-8"
                                style={{ width: "100%", maxWidth: windowWidth <= 800 ? "100%" : "40rem" }}
                            >
                                <TextInput label="Last Name" placeholder="Last Name" value={father_last_name} disabled />
                                <TextInput label="First Name" placeholder="First Name" value={father_first_name} disabled />
                                <TextInput label="Middle Name" placeholder="Middle Name" value={father_middle_name} disabled />
                                <TextInput label="Work" placeholder="Work" value={father_work} disabled />
                                <TextInput label="Income" placeholder="Income" value={currency_Formatter(father_income)} disabled />
                            </div>
                        </div>
                    </div>

                    {/* Mother */}
                    <div
                        className="flex w-full flex-col gap-8 rounded-[0.8rem] border border-[var(--border-color)] p-8"
                        style={{
                            width: "100%",
                            maxWidth: windowWidth <= 800 ? "100%" : "40rem",
                            margin: "0 auto",
                        }}
                    >
                        <div className="flex border-b border-[var(--border-color)]">
                            <h4 className="header-sm">Mother</h4>
                        </div>
                        <div className={windowWidth <= 800 ? "flex flex-col gap-8" : "inline-flex items-center justify-center gap-16"}>
                            <div
                                className="flex flex-col gap-8"
                                style={{ width: "100%", maxWidth: windowWidth <= 800 ? "100%" : "40rem" }}
                            >
                                <TextInput label="Last Name" placeholder="Last Name" value={mother_last_name} disabled />
                                <TextInput label="First Name" placeholder="First Name" value={mother_first_name} disabled />
                                <TextInput label="Middle Name" placeholder="Middle Name" value={mother_middle_name} disabled />
                                <TextInput label="Work" placeholder="Work" value={mother_work} disabled />
                                <TextInput label="Income" placeholder="Income" value={currency_Formatter(mother_income)} disabled />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Family Members */}
                <section className="flex w-full flex-col gap-16">
                    <h3 className="header-md">
                        Members and/or Other Members of the Family
                    </h3>

                    {familyMembers.length === 0 ? (
                        <div className="w-full text-center font-bold-label p-6 border rounded-lg">
                            No other family members registered.
                        </div>
                    ) : (
                        <div className="flex w-full justify-between gap-16">
                            <div className="outline-gray flex w-full gap-8 overflow-x-auto rounded-lg p-6">
                                <div className="flex gap-8" style={{ minWidth: "max-content" }}>
                                    {familyMembers.map((member, index) => (
                                        <FamilyCard
                                            key={index}
                                            index={index}
                                            member={member}
                                            selectedFamily={selectedFamily}
                                            editingFamilyValue={editingFamilyValue}
                                            familyMembers={familyMembers}
                                            setShowModal={setShowModal}
                                            setModalTitle={setModalTitle}
                                            setModalBody={setModalBody}
                                            setModalImageCenter={setModalImageCenter}
                                            setModalConfirm={setModalConfirm}
                                            setModalOnConfirm={setModalOnConfirm}
                                            editable={false}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* Progress in Goals */}
                <section className="flex w-full flex-col gap-8">
                    <h3 className="header-md">
                        Progress in the Family based on their Family Goals
                    </h3>

                    <div
                        className={
                            windowWidth <= 800
                                ? "flex w-full flex-col gap-8"
                                : "flex w-full gap-16"
                        }
                    >
                        {/* SM */}
                        <div
                            className={windowWidth <= 800 ? "w-full" : "w-full flex-1"}
                            style={{ maxWidth: windowWidth <= 800 ? "100%" : "unset" }}
                        >
                            <TextArea
                                label="SM"
                                placeholder="SM"
                                value={sm_progress}
                                setValue={setSMProgress}
                                error={errors["sm_progress"]}
                                disabled={viewForm}
                            />
                        </div>

                        {/* Family */}
                        <div
                            className={windowWidth <= 800 ? "w-full" : "w-full flex-1"}
                            style={{ maxWidth: windowWidth <= 800 ? "100%" : "unset" }}
                        >
                            <TextArea
                                label="Family"
                                placeholder="Family"
                                value={family_progress}
                                setValue={setFamilyProgress}
                                error={errors["family_progress"]}
                                disabled={viewForm}
                            />
                        </div>
                    </div>
                </section>


                {/* Observation/Findings */}
                <section className="flex w-full flex-col gap-8">
                    <TextArea
                        label="Worker's Observation/Findings"
                        placeholder="Worker's Observation/Findings"
                        value={observation_findings}
                        setValue={setObservationFindings}
                        error={errors["observation_findings"]}
                        disabled={viewForm}
                    />
                    {savedTime && sectionEdited === "Observations" && (
                        <p className="mt-2 self-end text-sm">{savedTime}</p>
                    )}
                </section>

                {/* Interventions Made */}
                <section className="flex w-full flex-col gap-8">
                    <TextArea
                        label="Interventions Made"
                        placeholder="Interventions Made"
                        value={interventions}
                        setValue={setInterventions}
                        error={errors["interventions"]}
                        disabled={viewForm}
                    />
                    {savedTime && sectionEdited === "Interventions" && (
                        <p className="mt-2 self-end text-sm">{savedTime}</p>
                    )}
                </section>

                {/* Recommendations and Agreement */}
                <section className="flex w-full flex-col gap-8">
                    <div
                        className={
                            windowWidth <= 800
                                ? "flex w-full flex-col gap-8"
                                : "flex w-full gap-16"
                        }
                    >
                        <div
                            className={windowWidth <= 800 ? "w-full" : "w-full flex-1"}
                            style={{ maxWidth: windowWidth <= 800 ? "100%" : "unset" }}
                        >
                            <TextArea
                                label="Recommendations"
                                placeholder="Recommendations"
                                value={recommendations}
                                setValue={setRecommendation}
                                error={errors["recommendations"]}
                                disabled={viewForm}
                            />
                        </div>

                        <div
                            className={windowWidth <= 800 ? "w-full" : "w-full flex-1"}
                            style={{ maxWidth: windowWidth <= 800 ? "100%" : "unset" }}
                        >
                            <TextArea
                                label="Agreement (if any)"
                                placeholder="Agreement (if any)"
                                value={agreement}
                                setValue={setAgreement}
                                error={errors["agreement"]}
                                disabled={viewForm}
                            />
                        </div>
                    </div>
                </section>


                {/* Buttons */}
                <div className="flex w-full justify-center gap-20">
                    {viewForm ? (
                        <>
                            <button
                                type="button"
                                className="btn-blue font-bold-label w-min"
                                onClick={() =>
                                    generateHomeVisitForm(formID)
                                }
                            >
                                Download Form
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className={`btn-outline font-bold-label ${isProcessing ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : ''
                                    }`}
                                onClick={() => {
                                    if (!isProcessing) {
                                        navigate(`/case/${caseID}`);
                                    }
                                }}
                                disabled={isProcessing}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`btn-primary font-bold-label w-min ${isProcessing ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : ''
                                    }`}
                                onClick={async (e) => {
                                    e.preventDefault();
                                    setIsProcessing(true);
                                    const success = await handleSubmit(e);
                                    if (success) {
                                        setShowSuccessModal(true);
                                    }
                                    setIsProcessing(false);
                                }}
                                disabled={isProcessing}
                            >
                                {isProcessing ? "Creating..." : "Create Intervention"}
                            </button>
                        </>
                    )}

                    {/* Saved Intervention */}
                    <AnimatePresence>
                        {showSuccessModal && (
                            <motion.div
                                key="success-modal"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                            >
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.95, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-col bg-white p-16 rounded-lg shadow-xl w-full max-w-3xl mx-4 gap-8"
                                >
                                    <h2 className="header-sm font-semibold mb-4">Home Intervention #{form_num} Saved</h2>
                                    <div className="flex justify-end gap-4">
                                        {/* Go Back to Case */}
                                        <button
                                            onClick={() => {
                                                setShowSuccessModal(false);
                                                navigate(`/case/${caseID}`);
                                            }}
                                            className="btn-outline font-bold-label"
                                        >
                                            Go Back to Case
                                        </button>

                                        {/* View Form */}
                                        <button
                                            onClick={() => {
                                                setShowSuccessModal(false);
                                                navigate(`/home-visitation-form/?action=view&caseID=${caseID}&formID=${newformID}`);
                                            }}
                                            className="btn-primary font-bold-label"
                                        >
                                            View Form
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </>
    );
}

export default HomeVisitationForm;
