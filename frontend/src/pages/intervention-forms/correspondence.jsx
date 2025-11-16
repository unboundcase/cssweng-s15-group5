import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { TextInput, TextArea, DateInput } from "../../Components/TextField";
import SimpleModal from "../../Components/SimpleModal";
import { motion, AnimatePresence } from 'framer-motion';

import { fetchSession, fetchEmployeeById } from "../../fetch-connections/account-connection";
import Loading from "../loading";

import { fetchCaseData as fetchCaseOriginal } from '../../fetch-connections/case-connection';

import Signature from "../../Components/Signature";

// API Import
import {
    fetchCorrespFormData,
    createCorrespForm,
    addCorrespInterventionPlan,
    editCorrespForm,
    fetchAutoFillCorrespData,
    deleteCorrespInterventionForm
}
    from '../../fetch-connections/correspFormConnection';
import { generateCorrespondenceForm } from "../../generate-documents/generate-documents";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function CorrespondenceForm() {

    // ===== START :: Setting Data ===== //

    const query = useQuery();
    const action = query.get('action') || "";
    const caseID = query.get('caseID') || "";
    const formID = query.get('formID') || "";

    const [loading, setLoading] = useState(true);
    const [rawCaseData, setRawCaseData] = useState(null);
    const [rawFormData, setRawFormData] = useState(null);

    const [newformID, setnewformID] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [noFormFound, setNoFormFound] = useState(false);
    const [noCaseFound, setNoCaseFound] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalBody, setModalBody] = useState("");
    const [modalImageCenter, setModalImageCenter] = useState(null);
    const [modalConfirm, setModalConfirm] = useState(false);
    const [modalOnConfirm, setModalOnConfirm] = useState(() => () => { });
    const [modalOnCancel, setModalOnCancel] = useState(undefined);

    const [loadingStage, setLoadingStage] = useState(0);
    const [loadingComplete, setLoadingComplete] = useState(false);
    const [user, setUser] = useState(null);
    const [authorized, setAuthorized] = useState(false);

    const [data, setData] = useState({
        form_num: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        ch_number: "",
        date: "",
        dob: "",
        address: "",
        name_of_sponsor: "",
        subproject: "",
        date_of_sponsorship: "",
        identified_problem: "",
        assesment: "",
        objective: "",
        recommendation: "",
    });

    const [intervention_plans, setInterventionPlan] = useState([]);

    // < START :: Auto-Filled Data > //

    const viewForm = action !== 'create' ? true : false;

    const [windowWidth, setWindowWidth] = useState(
        typeof window !== "undefined" ? window.innerWidth : 1024
    );
    useEffect(() => {
        const onResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);


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

                const returnData = await fetchAutoFillCorrespData(caseID);
                if (!returnData) {
                    setNoCaseFound(true)
                    return
                }

                const caseData = returnData.returningData;
                // console.log("Case Data: ", caseData)
                setRawCaseData(caseData);

                setData((prev) => ({
                    ...prev,
                    form_num: caseData.intervention_number || "",
                    first_name: caseData.first_name || "",
                    middle_name: caseData.middle_name || "",
                    last_name: caseData.last_name || "",
                    ch_number: caseData.sm_number || "",
                    dob: caseData.dob || "",
                    address: caseData.present_address || "",
                    subproject: caseData.spu || "",
                }));

                setLoading(false);
            };
            loadData();
            setLoadingStage(2);
            setLoadingComplete(true);
        }, []);
    }

    useEffect(() => {
        setFormNum(data.form_num || "");
        setFirstName(data.first_name || "");
        setMiddleName(data.middle_name || "");
        setLastName(data.last_name || "");
        setCHNumber(data.ch_number || "");
        setDOB(data.dob || "");
        setAddress(data.address || "");
        setSubproject(data.subproject || "");
    }, [data]);

    // < END :: Auto-Filled Data > //

    // < START :: View Form > //

    if (viewForm) {
        useEffect(() => {
            const loadFormData = async () => {
                setLoading(true);

                const returnFormData = await fetchCorrespFormData(
                    caseID, formID
                );
                if (!returnFormData) {
                    setNoFormFound(true)
                    return
                }

                const formData = returnFormData.form;
                const caseData = returnFormData.sponsored_member

                // console.log("form Data", formData);
                // console.log("FORM ID: ", formID);

                setRawFormData(formData);

                setData((prev) => ({
                    ...prev,
                    first_name: caseData.first_name || "",
                    middle_name: caseData.middle_name || "",
                    last_name: caseData.last_name || "",
                    ch_number: caseData.sm_number || "",
                    dob: caseData.dob || "",
                    address: caseData.present_address || "",
                    subproject: caseData.spu || "",

                    form_num: formData.intervention_number || "",
                    date: formData.createdAt || "",
                    name_of_sponsor: formData.name_of_sponsor || "",
                    date_of_sponsorship: formData.date_of_sponsorship || "",
                    identified_problem: formData.identified_problem || "",
                    assesment: formData.assesment || "",
                    objective: formData.objective || "",
                    recommendation: formData.recommendation || "",
                }));

                setInterventionPlan(formData.intervention_plans)

                setLoading(false);
            };
            loadFormData();
            setLoadingStage(2);
            setLoadingComplete(true);
        }, []);
    }

    useEffect(() => {
        setFormNum(data.form_num || "");
        setSponsorName(data.name_of_sponsor || "");
        setSponsorshipDate(data.date_of_sponsorship || "");
        setIdentifiedProblem(data.identified_problem || "");
        setAssessment(data.assesment || "");
        setObjective(data.objective || "");
        setRecommendation(data.recommendation || "");
    }, [data]);

    // < END :: View Form > //

    useEffect(() => {
        if (data?.date_of_sponsorship) {
            const date = new Date(data.date_of_sponsorship);
            if (!isNaN(date)) {
                setSponsorshipDate(formatter.format(date));
            }
        }
    }, [data]);

    useEffect(() => {
        if (data?.dob) {
            const date = new Date(data.dob);
            if (!isNaN(date)) {
                setDOB(formatter.format(date));
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

    // < START :: Create Form > //

    const [errors, setErrors] = useState({});

    function formatListWithAnd(arr) {
        if (arr.length === 0) return "";
        if (arr.length === 1) return arr[0];
        if (arr.length === 2) return `${arr[0]} and ${arr[1]}`;
        const last = arr[arr.length - 1];
        return `${arr.slice(0, -1).join(", ")}, and ${last}`;
    }

    // const validateForm = () => {
    //     const newErrors = {};

    //     const requiredFields = {
    //         name_of_sponsor,
    //         date_of_sponsorship,
    //         identified_problem,
    //         assesment,
    //         objective,
    //         recommendation,
    //         intervention_plans
    //     };

    //     Object.entries(requiredFields).forEach(([field, value]) => {

    //         if (
    //             value === undefined ||               
    //             value === null ||                    
    //             value === "" ||                    
    //             (typeof value === "string" && !value.trim())
    //         ) {
    //         newErrors[field] = "Missing input";
    //         }
    //     });

    //     if (!Array.isArray(intervention_plans) || intervention_plans.length === 0) {
    //         newErrors.intervention_plans = "At least one intervention is required";
    //     } else {
    //         intervention_plans.forEach((plan, index) => {
    //         if (!plan.action || !plan.action.trim()) {
    //             newErrors[`intervention_plans_${index}_action`] = `Missing input`;
    //         }
    //         if (!plan.time_frame || !plan.time_frame.trim()) {
    //             newErrors[`intervention_plans_${index}_time_frame`] = `Missing input`;
    //         }
    //         if (!plan.results || !plan.results.trim()) {
    //             newErrors[`intervention_plans_${index}_results`] = `Missing input`;
    //         }
    //         if (!plan.person_responsible || !plan.person_responsible.trim()) {
    //             newErrors[`intervention_plans_${index}_person_responsible`] = `Missing input`;
    //         }
    //         });
    //     }

    //     setErrors(newErrors);

    //     return Object.keys(newErrors).length === 0; 
    // };

    /*const validateForm = () => {
        const missing = [];

        if (!name_of_sponsor || name_of_sponsor.trim() === "") missing.push("Name of Sponsor");
        if (!date_of_sponsorship || date_of_sponsorship.trim() === "") missing.push("Date of Sponsorship");
        if (!identified_problem || identified_problem.trim() === "") missing.push("Identified Problem");
        if (!assesment || assesment.trim() === "") missing.push("Assessment");
        if (!objective || objective.trim() === "") missing.push("Objective");
        if (!recommendation || recommendation.trim() === "") missing.push("Recommendation");

        if (!Array.isArray(intervention_plans) || intervention_plans.length === 0) {
            missing.push("At least one Intervention Plan");
        } else {
            intervention_plans.forEach((plan, index) => {
                if (!plan.action || !plan.action.trim()) missing.push(`Action (row ${index + 1})`);
                if (!plan.time_frame || !plan.time_frame.trim()) missing.push(`Time Frame (row ${index + 1})`);
                if (!plan.results || !plan.results.trim()) missing.push(`Results (row ${index + 1})`);
                if (!plan.person_responsible || !plan.person_responsible.trim()) missing.push(`Person Responsible (row ${index + 1})`);
            });
        }

        if (missing.length > 0) {
            setModalTitle("Missing / Invalid Fields");
            setModalBody(`The following fields are missing or invalid: ${formatListWithAnd(missing)}`);
            setModalImageCenter(<div className="warning-icon mx-auto" />);
            setModalConfirm(false);
            setShowModal(true);
            return false;
        }

        return true;
    };*/

    const validateForm = () => {
        const fieldErrors = {};

        if (!name_of_sponsor || name_of_sponsor.trim() === "") { fieldErrors.name_of_sponsor = "Name of Sponsor is required."; }
        if (!date_of_sponsorship || date_of_sponsorship.trim() === "") { fieldErrors.date_of_sponsorship = "Date of Sponsorship is required."; }
        if (!identified_problem || identified_problem.trim() === "") { fieldErrors.identified_problem = "Identified Problem is required."; }
        if (!assesment || assesment.trim() === "") { fieldErrors.assesment = "Assessment is required."; }
        if (!objective || objective.trim() === "") { fieldErrors.objective = "Objective is required."; }
        if (!recommendation || recommendation.trim() === "") { fieldErrors.recommendation = "Recommendation is required."; }

        if (!Array.isArray(intervention_plans) || intervention_plans.length === 0) {
            fieldErrors.intervention_plans = "At least one Intervention Plan is required.";
        } else {
            intervention_plans.forEach((plan, index) => {
                if (!plan.action || !plan.action.trim()) { fieldErrors[`intervention_plans_${index}_action`] = `Action is required in row ${index + 1}.`; }
                if (!plan.time_frame || !plan.time_frame.trim()) { fieldErrors[`intervention_plans_${index}_time_frame`] = `Time Frame is required in row ${index + 1}.`; }
                if (!plan.results || !plan.results.trim()) { fieldErrors[`intervention_plans_${index}_results`] = `Results are required in row ${index + 1}.`; }
                if (!plan.person_responsible || !plan.person_responsible.trim()) { fieldErrors[`intervention_plans_${index}_person_responsible`] = `Person Responsible is required in row ${index + 1}.`; }
            });
        }

        if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);

            const fieldNames = Object.values(fieldErrors);
            setModalTitle("Missing / Invalid Fields");
            // setModalBody(`The following fields are missing or invalid: ${formatListWithAnd(fieldNames)}`);
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
        setModalBody("Are you sure you want to save this Correspondence Form? This cannot be edited or deleted after creation.");
        setModalImageCenter(<div className="warning-icon mx-auto" />);
        setModalConfirm(true);
        setModalOnConfirm(() => async () => {
            setShowModal(false);
            setIsProcessing(true);

            const created = await handleCreate();
            if (created) {
                setShowSuccessModal(true);
            } else {
                setModalTitle("Error");
                setModalBody("An error occurred while saving. Please try again.");
                setModalImageCenter(<div className="warning-icon mx-auto" />);
                setModalConfirm(false);
                setShowModal(true);
            }

            setIsProcessing(false);
        });
        setModalOnCancel(() => () => {
            setShowModal(false);
        });
        setShowModal(true);
    };

    const handleCreate = async () => {
        const payload = {
            name_of_sponsor,
            date_of_sponsorship,
            identified_problem,
            assesment,
            objective,
            recommendation,
            intervention_plans
        };
        // console.log("Payload: ", payload);

        const response = await createCorrespForm(caseID, payload);
        if (response?._id) {
            setnewformID(response._id);
            return true;
        } else {
            return false;
        }
    };

    // < END :: Create Form > //

    // < START :: Edit Form > //

    const handleUpdate = async () => {
        const updatedPayload = {
            name_of_sponsor,
            date_of_sponsorship,
            identified_problem,
            assesment,
            objective,
            recommendation,
            intervention_plans
        };

        // console.log("Payload: ", updatedPayload);
        const response = await editCorrespForm(formID, updatedPayload);
    };

    // < END :: Edit Form > //

    // < START :: Delete Form > //


    const handleDelete = async () => {

        const response = await deleteCorrespInterventionForm(formID);
    };


    // < END :: Delete Form > //

    // ===== END :: Backend Connection ===== //

    // ===== START :: Use States ===== // 

    const [last_name, setLastName] = useState(data?.last_name || "");
    const [middle_name, setMiddleName] = useState(data?.middle_name || "");
    const [first_name, setFirstName] = useState(data?.first_name || "");
    const [ch_number, setCHNumber] = useState(data?.ch_number || "");
    const [form_num, setFormNum] = useState(data?.form_num || "");
    const [dob, setDOB] = useState(data?.dob || "");
    const [address, setAddress] = useState(data?.address || "");
    const [name_of_sponsor, setSponsorName] = useState(data?.name_of_sponsor || "");
    const [subproject, setSubproject] = useState(data?.subproject || "");
    const [date_of_sponsorship, setSponsorshipDate] = useState(
        data?.date_of_sponsorship || "",
    );
    const [identified_problem, setIdentifiedProblem] = useState(
        data?.identified_problem || "",
    );
    const [assesment, setAssessment] = useState(data?.assesment || "");
    const [objective, setObjective] = useState(data?.objective || "");
    const [recommendation, setRecommendation] = useState(
        data?.recommendation || "",
    );
    const [showConfirm, setShowConfirm] = useState(false);


    // ===== END :: Use States ===== // 

    // ===== START :: Local Functions ===== //

    const navigate = useNavigate();

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
        const timeString = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        setSavedTime(`Saved at ${timeString}`);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            setSavedTime(null);
        }, 3000);
    };

    const handleAddIntervention = () => {
        const new_intervention = {
            action: "",
            time_frame: "",
            results: "",
            person_responsible: "",
        };

        setInterventionPlan((prev) => [...prev, new_intervention]);
    };

    const updateIntervention = (index, key, value) => {
        setInterventionPlan((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, [key]: value } : item,
            ),
        );
    };

    const deleteIntervention = (indexToDelete) => {
        setInterventionPlan((prev) => prev.filter((_, i) => i !== indexToDelete));
    };

    // ===== END :: Local Functions ===== //


    useEffect(() => {
        const authorizeAccess = async () => {
            if (!user || !data) return;

            const returnData = await fetchCaseOriginal(caseID);

            // console.log("RETURN DATA: ", returnData);

            const assignedSDWId = returnData.assigned_sdw._id;

            // console.log("RAW DATA: ", assignedSDWId);

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
                    // console.log("FETCHING EMPLOYEE", res.data.manager, user._id);
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

    if (!data) return <div className="font-label">No data found.</div>;

    if (noFormFound) {
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
                        SMs, Families, and SHGs Intervention Plan
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
                        SMs, Families, and SHGs Intervention Plan
                    </h3>
                    <p className="text-3xl red"> No case found. </p>
                </div>
            </main>
        )
    }

    useEffect(() => {
        if (viewForm && form_num) {
            document.title = `Correspondence Form #${form_num}`;
        } else if (!viewForm) {
            document.title = `Create Correspondence Form`;
        }
    }, [form_num]);

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
                <h3 className="header-md">
                    SMs, Families, and SHGs Intervention Plan
                </h3>

                {/* Sponsored Member and General Info */}
                <section className="flex w-full flex-col gap-16">
                    {/* SPONSORED MEMBER */}
                    <div className="flex w-full flex-col gap-8 rounded-[0.8rem] border border-[var(--border-color)] p-8">
                        <div className="flex border-b border-[var(--border-color)]">
                            <h4 className="header-sm">Sponsored Member</h4>
                        </div>

                        <div
                            className={
                                windowWidth <= 800
                                    ? "flex flex-col gap-8"
                                    : "inline-flex items-start justify-center gap-16"
                            }
                        >
                            {/* LEFT COLUMN */}
                            <div className="flex flex-col gap-8">
                                <TextInput label="Last Name" value={last_name} disabled placeholder="Last Name" />
                                <TextInput label="First Name" value={first_name} disabled placeholder="First Name" />
                                <TextInput label="Middle Name" value={middle_name} disabled placeholder="Middle Name" />

                                {/* Move these fields below when ≤800px */}
                                {windowWidth <= 800 && (
                                    <>
                                        <TextInput label="CH ID #" value={ch_number} disabled placeholder="CH ID #" />
                                        <DateInput label="Date of Birth" value={dob} disabled placeholder="Date of Birth" />
                                        <div className="flex flex-col gap-2">
                                            <p className="label-base">Address</p>
                                            <textarea
                                                value={address}
                                                disabled
                                                placeholder="Address"
                                                className="body-base text-area h-32 cursor-not-allowed bg-gray-200"
                                            ></textarea>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* RIGHT COLUMN visible only when >800px */}
                            {windowWidth > 800 && (
                                <div className="flex flex-col gap-8">
                                    <TextInput label="CH ID #" value={ch_number} disabled placeholder="CH ID #" />
                                    <DateInput label="Date of Birth" value={dob} disabled placeholder="Date of Birth" />
                                    <div className="flex gap-16">
                                        <p className="label-base w-72">Address</p>
                                        <textarea
                                            value={address}
                                            disabled
                                            placeholder="Address"
                                            className="body-base text-area h-32 cursor-not-allowed bg-gray-200"
                                        ></textarea>
                                    </div>
                                </div>
                            )}
                        </div>

                        {savedTime && sectionEdited === "Sponsored Member" && (
                            <p className="text-sm self-end mt-2">{savedTime}</p>
                        )}
                    </div>

                    {/* GENERAL INFORMATION */}
                    <div className="flex w-full flex-col gap-8 rounded-[0.8rem] border border-[var(--border-color)] p-8">
                        <div className="flex border-b border-[var(--border-color)]">
                            <h4 className="header-sm">General Information</h4>
                        </div>

                        <div
                            className={
                                windowWidth <= 800
                                    ? "flex flex-col gap-8"
                                    : "inline-flex items-start justify-center gap-16"
                            }
                        >
                            {/* LEFT COLUMN */}
                            <div className="flex flex-col gap-8">
                                <TextInput
                                    label="Name of Sponsor"
                                    value={name_of_sponsor}
                                    setValue={setSponsorName}
                                    handleChange={handleChange("General Information")}
                                    error={errors["name_of_sponsor"]}
                                    disabled={viewForm}
                                    placeholder="Name of Sponsor"
                                />
                                <TextInput
                                    label="Sub-Project"
                                    value={subproject}
                                    setValue={setSubproject}
                                    handleChange={handleChange("General Information")}
                                    disabled
                                    placeholder="Sub-Project"
                                />

                                {/* Move this down when ≤800px */}
                                {windowWidth <= 800 && (
                                    <DateInput
                                        label="Date of Sponsorship"
                                        value={date_of_sponsorship}
                                        setValue={setSponsorshipDate}
                                        handleChange={handleChange("General Information")}
                                        error={errors["date_of_sponsorship"]}
                                        disabled={viewForm}
                                        placeholder="Date of Sponsorship"
                                    />
                                )}
                            </div>

                            {/* RIGHT COLUMN visible only when >800px */}
                            {windowWidth > 800 && (
                                <div className="flex flex-col gap-8">
                                    <DateInput
                                        label="Date of Sponsorship"
                                        value={date_of_sponsorship}
                                        setValue={setSponsorshipDate}
                                        handleChange={handleChange("General Information")}
                                        error={errors["date_of_sponsorship"]}
                                        disabled={viewForm}
                                        placeholder="Date of Sponsorship"
                                    />
                                </div>
                            )}
                        </div>

                        {savedTime && sectionEdited === "General Information" && (
                            <p className="text-sm self-end mt-2">{savedTime}</p>
                        )}
                    </div>
                </section>


                {/* Identified Problem */}
                <section className="flex w-full items-end">
                    <TextArea
                        label="SM's Identified/Expressed Problem or Need"
                        value={identified_problem}
                        setValue={setIdentifiedProblem}
                        error={errors["identified_problem"]}
                        disabled={viewForm}
                        placeholder="SM's Identified/Expressed Problem or Need"
                    ></TextArea>
                </section>

                {/* Assessment and Objective */}
                <section
                    className={
                        windowWidth <= 800
                            ? "flex w-full flex-col gap-8"
                            : "flex w-full items-start justify-center gap-16"
                    }
                >
                    {/* SDW's Assessment */}
                    <div className="flex flex-col w-full max-w-full">
                        <label className="header-sm mb-2">SDW's Assessment</label>
                        <div className="flex w-full ml-auto">
                            <TextArea
                                value={assesment}
                                setValue={setAssessment}
                                error={errors["assesment"]}
                                disabled={viewForm}
                                placeholder="SDW's Assessment"
                            />
                        </div>
                    </div>

                    {/* Objective/s */}
                    {windowWidth > 800 ? (
                        <div className="flex flex-col w-full max-w-full">
                            <label className="header-sm mb-2">Objective/s</label>
                            <div className="flex w-full ml-auto">
                                <TextArea
                                    value={objective}
                                    setValue={setObjective}
                                    error={errors["objective"]}
                                    disabled={viewForm}
                                    placeholder="Objective/s"
                                />
                            </div>
                        </div>
                    ) : (
                        // Move below at <=800px
                        <div className="flex flex-col w-full max-w-full">
                            <label className="header-sm mb-2">Objective/s</label>
                            <div className="flex w-full ml-auto">
                                <TextArea
                                    value={objective}
                                    setValue={setObjective}
                                    error={errors["objective"]}
                                    disabled={viewForm}
                                    placeholder="Objective/s"
                                />
                            </div>
                        </div>
                    )}
                </section>

                {/* Intervention Plan */}
                {/* Intervention Plan */}
                <section className="flex w-full flex-col gap-16">
                    <h3 className="header-md">Intervention Plan</h3>

                    <div className="flex flex-col gap-2">
                        {/* MAIN HEADER (fixed 2x2 positions) */}
                        <div className="flex w-full flex-col gap-2 border-b border-[var(--border-color)] px-4 pb-4">
                            <div className="flex justify-between gap-6">
                                <p className="label-base flex-1">Actions</p>
                                <p className="label-base flex-1">Time Frame</p>
                            </div>
                            <div className="flex justify-between gap-6">
                                <p className="label-base flex-1">Results</p>
                                <p className="label-base flex-1">Person Responsible</p>
                            </div>
                        </div>

                        <div
                            className={`flex flex-col gap-6 ${errors["intervention_plans"] ? "py-12 border rounded-xl border-red-500" : ""
                                }`}
                        >
                            {intervention_plans.map((item, index) => (
                                <div
                                    key={index}
                                    className="w-full px-4 py-2 rounded-md border border-transparent hover:border-[var(--border-color)] transition"
                                >
                                    {/* ROW 1: Actions | Time Frame */}
                                    <div className="flex gap-6 mb-6">
                                        <div className="flex-1">
                                            <TextArea
                                                value={item.action}
                                                handleChange={(e) => {
                                                    updateIntervention(index, "action", e.target.value);
                                                    handleChange("Intervention Plan")(e);
                                                }}
                                                showTime={false}
                                                error={errors[`intervention_plans_${index}_action`]}
                                                disabled={viewForm}
                                                placeholder="Actions"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <TextArea
                                                value={item.time_frame}
                                                handleChange={(e) => {
                                                    updateIntervention(index, "time_frame", e.target.value);
                                                    handleChange("Intervention Plan")(e);
                                                }}
                                                showTime={false}
                                                error={errors[`intervention_plans_${index}_time_frame`]}
                                                disabled={viewForm}
                                                placeholder="Time Frame"
                                            />
                                        </div>
                                    </div>

                                    {/* ROW 2: Results | Person Responsible */}
                                    <div className="flex gap-6">
                                        <div className="flex-1">
                                            <TextArea
                                                value={item.results}
                                                handleChange={(e) => {
                                                    updateIntervention(index, "results", e.target.value);
                                                    handleChange("Intervention Plan")(e);
                                                }}
                                                showTime={false}
                                                error={errors[`intervention_plans_${index}_results`]}
                                                disabled={viewForm}
                                                placeholder="Results"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <TextArea
                                                value={item.person_responsible}
                                                handleChange={(e) => {
                                                    updateIntervention(index, "person_responsible", e.target.value);
                                                    handleChange("Intervention Plan")(e);
                                                }}
                                                showTime={false}
                                                error={errors[`intervention_plans_${index}_person_responsible`]}
                                                disabled={viewForm}
                                                placeholder="Person Responsible"
                                            />
                                        </div>
                                    </div>

                                    {!viewForm && (
                                        <div className="flex justify-end mt-4">
                                            <button
                                                onClick={() => deleteIntervention(index)}
                                                className="icon-button-setup trash-button px-10"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {errors["intervention_plans"] && (
                            <div className="text-red-500 text-sm self-end">{errors["intervention_plans"]}</div>
                        )}
                        {savedTime && sectionEdited === "Intervention Plan" && (
                            <p className="text-sm self-end mt-2">{savedTime}</p>
                        )}
                    </div>

                    {!viewForm && (
                        <button
                            name="add_intervention"
                            id="add_intervention"
                            onClick={handleAddIntervention}
                            className="btn-primary font-bold-label self-center"
                        >
                            Add Intervention
                        </button>
                    )}
                </section>


                {/* Recommendation */}
                <section className="flex w-full items-end">
                    <TextArea
                        label="Recommendation"
                        sublabel="(Indicate if SM's case needs a Case Conference)"
                        value={recommendation}
                        setValue={setRecommendation}
                        error={errors["recommendation"]}
                        disabled={viewForm}
                        placeholder="Recommendation"
                    ></TextArea>
                </section>

                {/* Signature */}
                {/*<div className="flex w-full flex-col gap-16 px-16 pt-24">
                <div className="flex w-full justify-between">
                    <Signature label="Prepared by:" signer="Social Development Worker"></Signature>
                    <Signature label="Attested by:" signer="SM/Parent/SHG Leader"></Signature>
                </div>
                
                <div className="flex w-full justify-between">
                    <Signature label="Approved by:" signer="SPU Coordinator"></Signature>
                </div>
            </div>*/}

                {/* Buttons */}
                <div className="flex w-full justify-center gap-20">
                    {viewForm ? (
                        <>
                            <button
                                className="btn-blue font-bold-label w-min"
                                onClick={() => {
                                    generateCorrespondenceForm(formID)
                                }}
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

                    {/* Confirm Delete Form */}
                    {showConfirm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                            <div className="flex flex-col bg-white p-16 rounded-lg shadow-xl w-full max-w-3xl mx-4 gap-8">
                                <h2 className="header-md font-semibold mb-4">Delete Form</h2>
                                <p className="label-base mb-6">Are you sure you want to delete this form?</p>
                                <div className="flex justify-end gap-4">

                                    {/* Cancel */}
                                    <button
                                        onClick={() =>
                                            setShowConfirm(false)
                                        }
                                        className="btn-outline font-bold-label"
                                    >
                                        Cancel
                                    </button>

                                    {/* Delete Form */}
                                    <button
                                        onClick={async () => {
                                            await handleDelete();
                                            setShowConfirm(false);
                                            navigate(`/case/${caseID}`);
                                        }}
                                        className="btn-primary font-bold-label"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Saved Intervention */}
                    <AnimatePresence>
                        {showSuccessModal && (
                            <motion.div
                                key="successModal"
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
                                    <h2 className="header-sm font-semibold mb-4">
                                        Correspondence Form #{form_num} Saved
                                    </h2>
                                    <div className="flex justify-end gap-4">
                                        <button
                                            onClick={() => {
                                                setShowSuccessModal(false);
                                                navigate(`/case/${caseID}`);
                                            }}
                                            className="btn-outline font-bold-label"
                                        >
                                            Go Back to Case
                                        </button>

                                        <button
                                            onClick={() => {
                                                setShowSuccessModal(false);
                                                navigate(
                                                    `/correspondence-form/?action=view&caseID=${caseID}&formID=${newformID}`
                                                );
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


                    {/* Missing / Invalid Input */}
                    {/*showErrorOverlay && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                            <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full mx-4 p-8 flex flex-col items-center gap-12
                                    animate-fadeIn scale-100 transform transition duration-300">
                                <div className="flex items-center gap-4 border-b-1 ]">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-[2.4rem] w-[2.4rem] text-red-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 9v2m0 4h.01M4.93 19h14.14a2 2 0 001.84-2.75L13.41 4.58a2 2 0 00-3.41 0L3.09 16.25A2 2 0 004.93 19z"
                                        />
                                    </svg>
                                    <h2 className="header-sm font-bold text-red-600 text-center">
                                        Missing / Invalid Input Detected
                                    </h2>
                                </div>
                                <p className="body-base text-[var(--text-color)] text-center max-w-xl">
                                    Please fill out all required fields before submitting the form.
                                </p>
                                <p className="body-base text-[var(--text-color)] text-center max-w-xl">
                                    Write N/A if necessary.
                                </p>

                                {/* OK Button }
                                <button
                                    onClick={() => setShowErrorOverlay(false)}
                                    className="bg-red-600 text-white text-2xl px-6 py-2 rounded-lg hover:bg-red-700 transition"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    )*/}
                </div>
            </main>
        </>
    );
}
export default CorrespondenceForm;

// newly transferred check