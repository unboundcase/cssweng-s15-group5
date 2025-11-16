import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { TextInput, DateInput, TextArea } from "../Components/TextField";
import Signature from "../Components/Signature";
import SimpleModal from "../Components/SimpleModal";
import { AnimatePresence, motion } from "framer-motion";
import { fetchSession, fetchEmployeeById } from "../fetch-connections/account-connection";
import Loading from "./loading";

import { fetchCaseData as fetchCaseOriginal } from '../fetch-connections/case-connection';

// API Import
import {
    fetchProgressReport,
    fetchCaseData,
    addProgressReport,
    editProgressReport,
    deleteProgressReport,
}
    from '../fetch-connections/progress-report-connection';
import { generateProgressReport } from "../generate-documents/generate-documents";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function ProgressReport() {
    /********** TEST DATA **********/

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
    const [customError, setCustomError] = useState("");
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
        sponsor_name: "",
        sponsorship_date: "",
        subproject: "",
        date_accomplished: "",
        period_covered: "",
        sm_update: "",
        family_update: "",
        services_to_family: "",
        participation: "",
        is_active: true
    });

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
                // console.error("No user session found");
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
                const caseData = returnData
                // console.log("CASE DATA", caseData);

                setRawCaseData(caseData);
                setData((prev) => ({
                    ...prev,
                    first_name: caseData.first_name || "",
                    middle_name: caseData.middle_name || "",
                    last_name: caseData.last_name || "",
                    ch_number: caseData.ch_number || "",
                    dob: caseData.dob || "",
                    subproject: caseData.subproject || "",
                    form_num: caseData.reportNumber || "",
                    is_active: caseData.is_active ?? true
                }));

                setLoading(false);
            };
            loadData();
            setLoadingStage(2);
            setLoadingComplete(true);
        }, []);

        // console.log("report data", data);

        useEffect(() => {
            setFirstName(data.first_name || "");
            setMiddleName(data.middle_name || "");
            setLastName(data.last_name || "");
            setCHNumber(data.ch_number || "");
            setDOB(data.dob || "");
            setAge("");
            setSubproject(data.subproject || "");
            setFormNum(data.form_num || "");
        }, [data]);
    }

    // < END :: Auto-Filled Data > //

    // < START :: View Form > //

    if (viewForm) {
        useEffect(() => {
            const loadData = async () => {
                setLoadingStage(1);

                const returnData = await fetchProgressReport(caseID, formID);

                if (!returnData) {
                    setNoFormFound(true)
                    return
                }

                // console.log("RETURN DATA", returnData);

                const formData = returnData.progressReport
                const caseData = returnData.case
                const report_number = returnData.reportNumber

                // console.log(formData)
                // console.log(returnData);

                setRawFormData(formData);

                setData((prev) => ({
                    ...prev,
                    first_name: caseData.first_name || "",
                    middle_name: caseData.middle_name || "",
                    last_name: caseData.last_name || "",
                    ch_number: caseData.sm_number || "",
                    dob: caseData.dob || "",
                    subproject: caseData.subproject.spu_name || "",

                    form_num: report_number || "",
                    sponsor_name: formData.sponsor_name || "",
                    sponsorship_date: formData.sponsorship_date || "",
                    date_accomplished: formData.date_accomplished || "",
                    period_covered: formData.period_covered || "",
                    sm_update: formData.sm_update || "",
                    family_update: formData.family_update || "",
                    services_to_family: formData.services_to_family || "",
                    participation: formData.participation || "",

                    is_active: caseData.is_active ?? true
                }));

                setRelationToSponsor(formData.relation_to_sponsor)
            };
            loadData();
            setLoadingStage(2);
            setLoadingComplete(true);
        }, []);

        useEffect(() => {
            setFirstName(data.first_name || "");
            setMiddleName(data.middle_name || "");
            setLastName(data.last_name || "");
            setCHNumber(data.ch_number || "");
            setDOB(data.dob || "");
            setAge("");
            setSubproject(data.subproject || "");

            setFormNum(data.form_num || "");
            setSponsorName(data.sponsor_name || "");
            setSponsorshipDate(data.sponsorship_date || "");
            setDateAccomplished(data.date_accomplished || "");
            setPeriodCovered(data.period_covered || "");
            setSMUpdate(data.sm_update || "");
            setFamilyUpdate(data.family_update || "");
            setServicesToFamily(data.services_to_family || "");
            setParticipation(data.participation || "");
        }, [data]);
    }

    // < END :: View Form > //

    useEffect(() => {
        if (data?.dob) {
            const date = new Date(data.dob);
            if (!isNaN(date)) {
                setDOB(formatter.format(date));
                setAge(calculateAge(date));
            }
        }
    }, [data]);

    useEffect(() => {
        if (data?.date_accomplished) {
            const date = new Date(data.date_accomplished);
            if (!isNaN(date)) {
                setDateAccomplished(formatter.format(date));
            }
        }
    }, [data]);

    useEffect(() => {
        if (data?.sponsorship_date) {
            const date = new Date(data.sponsorship_date);
            if (!isNaN(date)) {
                setSponsorshipDate(formatter.format(date));
            }
        }
    }, [data]);

    const formatter = new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    const questions = [
        { id: "know_sponsor_name", text: "Knows his/her sponsor's name?" },
        { id: "cooperative", text: "Cooperative with the program?" },
        { id: "personalized_letter", text: "Writes personalized letters in a timely manner?" },
    ];

    const options = ["Yes", "Sometimes", "No"];

    // ===== END :: Setting Data ===== //

    // ===== START :: Backend Connection ===== //

    // < START :: Create Form > //

    const [errors, setErrors] = useState({});

    const formatListWithAnd = (list) => {
        if (list.length === 1) return list[0];
        if (list.length === 2) return `${list[0]} and ${list[1]}`;
        return `${list.slice(0, -1).join(', ')}, and ${list[list.length - 1]}`;
    };

    // const validateForm = () => {
    //     const newErrors = {};

    //     const requiredFields = {
    //         sponsor_name,
    //         sponsorship_date,
    //         date_accomplished,
    //         period_covered,
    //         sm_update,
    //         family_update,
    //         services_to_family,
    //         participation,
    //         relation_to_sponsor
    //     };

    //     Object.entries(requiredFields).forEach(([field, value]) => {
    //         if (
    //             value === undefined ||               
    //             value === null ||                    
    //             value === "" ||                    
    //             (typeof value === "string" && !value.trim())
    //         ) {
    //             newErrors[field] = "Missing input";
    //         }
    //     });

    //     if (relation_to_sponsor.know_sponsor_name === undefined ||
    //         relation_to_sponsor.cooperative === undefined ||
    //         relation_to_sponsor.personalized_letter === undefined
    //     ) {
    //         newErrors["relation_to_sponsor"] = "Missing input";
    //     }

    //     if (sponsorship_date > date_accomplished || new Date(date_accomplished) > new Date()) {
    //         newErrors["sponsorship_date"] = "Please check dates.";
    //         newErrors["date_accomplished"] = "Please check dates.";
    //         setCustomError("Invalid date: Sponsorship date must not be later than accomplishment date, and accomplishment date must not be in the future.");
    //         setShowErrorOverlay(true);
    //     }

    //     setErrors(newErrors);
    //     return Object.keys(newErrors).length === 0; 
    // };


    /*const validateForm = () => {
        const missing = [];

        if (!sponsor_name || !sponsor_name.trim()) missing.push("Name of Sponsor");
        if (!sponsorship_date) missing.push("Sponsorship Begin Date");
        if (!date_accomplished) missing.push("Date Accomplished");
        if (!period_covered || !period_covered.trim()) missing.push("Period Covered");
        if (!sm_update || !sm_update.trim()) missing.push("Sponsored Member Update");
        if (!family_update || !family_update.trim()) missing.push("Family Update");
        if (!services_to_family || !services_to_family.trim()) missing.push("Services to Family");
        if (!participation || !participation.trim()) missing.push("Participation in the Community");

        if (
            !relation_to_sponsor.know_sponsor_name ||
            !relation_to_sponsor.cooperative ||
            !relation_to_sponsor.personalized_letter
        ) {
            missing.push("Sponsor Relationship Section");
        }

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const sponsorDate = new Date(sponsorship_date);
        const accomplishedDate = new Date(date_accomplished);
        sponsorDate.setHours(0, 0, 0, 0);
        accomplishedDate.setHours(0, 0, 0, 0);

        if (sponsorDate > accomplishedDate) {
            missing.push("Sponsorship Date must not be later than Accomplishment Date");
        }


        if (sponsorship_date > now) {
            missing.push("Sponsorship Date must not be in the future");
        }
        if (accomplishedDate > now) {
            missing.push("Accomplishment Date must not be in the future");
        }


        if (missing.length > 0) {
            setModalTitle("Missing / Invalid Fields");
            setModalBody(
                `The following fields are missing or invalid: ${formatListWithAnd(missing)}`
            );
            setModalImageCenter(<div className="warning-icon mx-auto" />);
            setModalConfirm(false);
            setShowModal(true);
            return false;
        }

        return true;
    };*/

    const validateForm = () => {
        const fieldErrors = {};

        if (!sponsor_name || !sponsor_name.trim()) { fieldErrors.sponsor_name = "Name of Sponsor is required."; }
        if (!sponsorship_date) { fieldErrors.sponsorship_date = "Sponsorship Begin Date is required."; }
        if (!date_accomplished) { fieldErrors.date_accomplished = "Date Accomplished is required."; }
        if (!period_covered || !period_covered.trim()) { fieldErrors.period_covered = "Period Covered is required."; }
        if (!sm_update || !sm_update.trim()) { fieldErrors.sm_update = "Sponsored Member Update is required."; }
        if (!family_update || !family_update.trim()) { fieldErrors.family_update = "Family Update is required."; }
        if (!services_to_family || !services_to_family.trim()) { fieldErrors.services_to_family = "Services to Family is required."; }
        if (!participation || !participation.trim()) { fieldErrors.participation = "Participation in the Community is required."; }

        if (
            !relation_to_sponsor.know_sponsor_name ||
            !relation_to_sponsor.cooperative ||
            !relation_to_sponsor.personalized_letter
        ) {
            fieldErrors.relation_to_sponsor = "Sponsor Relationship is required";
        }

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const sponsorDate = new Date(sponsorship_date);
        const accomplishedDate = new Date(date_accomplished);
        sponsorDate.setHours(0, 0, 0, 0);
        accomplishedDate.setHours(0, 0, 0, 0);

        if (sponsorDate > accomplishedDate) {
            fieldErrors.date_comparison = "Sponsorship Date must not be later than Accomplishment Date.";
        }

        if (sponsorship_date > now) {
            fieldErrors.sponsorship_date = "Sponsorship Date must not be in the future.";
        }

        if (accomplishedDate > now) {
            fieldErrors.accomplished_date = "Accomplishment Date must not be in the future.";
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
        setModalBody("Are you sure you want to save this Progress Report? This cannot be edited or deleted after creation.");
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

        return false;
    };


    const handleCreate = async () => {
        const payload = {
            sponsor_name,
            sponsorship_date,
            date_accomplished,
            period_covered,
            sm_update,
            family_update,
            services_to_family,
            participation,
            relation_to_sponsor
        };
        // // console.log("Payload: ", payload);

        const response = await addProgressReport(payload, caseID);
        if (response?.progressReport?._id) {
            setnewformID(response.progressReport._id);
            return true;
        } else {
            return false;
        }
    };

    // < END :: Create Form > //

    // < START :: Edit Form > //

    const handleUpdate = async () => {
        const updatedPayload = {
            sponsor_name,
            sponsorship_date,
            date_accomplished,
            period_covered,
            sm_update,
            family_update,
            services_to_family,
            participation,
            relation_to_sponsor
        };

        // console.log("Payload: ", updatedPayload);
        const response = await editProgressReport(formID, updatedPayload);
    };

    // < END :: Edit Form > //

    // < START :: Delete Form > //

    const handleDelete = async () => {
        const response = await deleteProgressReport(formID);
    };

    // < END :: Delete Form > //

    // ===== END :: Backend Connection ===== //

    // ===== START :: Use States ===== //

    const [last_name, setLastName] = useState(data?.last_name || "");
    const [middle_name, setMiddleName] = useState(data?.middle_name || "");
    const [first_name, setFirstName] = useState(data?.first_name || "");
    const [ch_number, setCHNumber] = useState(data?.ch_number || "");
    const [form_num, setFormNum] = useState(data?.form_num || "");
    const [dob, setDOB] = useState("");
    const [age, setAge] = useState("");
    const [sponsor_name, setSponsorName] = useState(data?.sponsor_name || "");
    const [sponsorship_date, setSponsorshipDate] = useState(
        data?.sponsorship_date || "",
    );
    const [subproject, setSubproject] = useState(data?.subproject || "");
    const [date_accomplished, setDateAccomplished] = useState(
        data?.date_accomplished || "",
    );
    const [period_covered, setPeriodCovered] = useState(
        data?.period_covered || "",
    );
    const [sm_update, setSMUpdate] = useState(data?.sm_update || "");
    const [family_update, setFamilyUpdate] = useState(
        data?.family_update || "",
    );
    const [services_to_family, setServicesToFamily] = useState(
        data?.services_to_family || "",
    );
    const [participation, setParticipation] = useState(
        data?.participation || "",
    );
    const [relation_to_sponsor, setRelationToSponsor] = useState({});
    const [showConfirm, setShowConfirm] = useState(false);


    // ===== END :: Use States ===== //

    // ===== START :: Functions ===== //

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

    useEffect(() => {
        if (viewForm && form_num) {
            document.title = `Progress Report #${form_num}`;
        } else if (!viewForm) {
            document.title = `Create Progress Report`;
        }
    }, [viewForm, form_num]);


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

    const handleCheckboxChange = (questionID, value) => {
        setRelationToSponsor((prev) => ({
            ...prev,
            [questionID]: value,
        }));
    };

    function calculateAge(dateValue) {
        const birthday = new Date(dateValue);
        const today = new Date();

        let age = today.getFullYear() - birthday.getFullYear();

        const birthdayDone =
            today.getMonth() > birthday.getMonth() ||
            (today.getMonth() === birthday.getMonth() &&
                today.getDate() >= birthday.getDate());

        if (!birthdayDone) {
            age--;
        }

        return age;
    }

    // ===== END :: Functions ===== //

    useEffect(() => {
        if (!user) return;

        if (!viewForm && user.role !== "sdw") {
            navigate("/unauthorized");
        }
    }, [user, viewForm]);


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
                    // console.error("Supervisor access check failed:", err);
                    navigate("/unauthorized");
                }
                return;
            }

            navigate("/unauthorized");
        };

        authorizeAccess();
    }, [data, user]);

    if (data && !data.is_active && !viewForm) {
        return (
            <div className="text-red-600 font-bold-label">
                Case has been terminated.
            </div>
        );
    }

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
                    <h3 className="header-md">Individual Progress Report</h3>
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
                    <h3 className="header-md">Individual Progress Report</h3>
                    <p className="text-3xl red"> No case found. </p>
                </div>
            </main>
        )
    }

    const loadingColor = loadingStage === 0 ? "red" : loadingStage === 1 ? "blue" : "green";
    if (!loadingComplete || !authorized) return <Loading color={loadingColor} />;

    return (
        <>
            <AnimatePresence>
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
            </AnimatePresence>

            <main className="flex justify-center w-full p-16">
                <div className="flex w-full flex-col items-center justify-center gap-16 rounded-lg border border-[var(--border-color)] p-16">
                    <div className="flex w-full justify-between">
                        <button
                            onClick={() => navigate(`/case/${caseID}`)}
                            className="flex items-center gap-5 label-base arrow-group">
                            <div className="arrow-left-button"></div>
                            Go Back
                        </button>
                        <h4 className="header-sm self-end">Form #: {form_num}</h4>
                    </div>
                    <h3 className="header-md">Individual Progress Report</h3>

                    {/* Sponsored Member and General Info */}
                    <section className="flex w-full flex-col gap-16">
                        <div className="flex w-full flex-col gap-8 rounded-[0.8rem] border border-[var(--border-color)] p-8">
                            <div className="flex border-b border-[var(--border-color)]">
                                <h4 className="header-sm">Sponsored Member</h4>
                            </div>

                            <div
                                className={
                                    windowWidth <= 800
                                        ? "flex flex-col gap-8" // stack vertically
                                        : "flex flex-row w-full gap-16"
                                }
                            >
                                {/* LEFT COLUMN */}
                                <div className="flex flex-col gap-8 flex-1">
                                    <TextInput
                                        label="Last Name"
                                        value={last_name}
                                        disabled={true}
                                        placeholder="Last Name"
                                    ></TextInput>
                                    <TextInput
                                        label="First Name"
                                        value={first_name}
                                        disabled={true}
                                        placeholder="First Name"
                                    ></TextInput>
                                    <TextInput
                                        label="Middle Name"
                                        value={middle_name}
                                        disabled={true}
                                        placeholder="Middle Name"
                                    ></TextInput>
                                </div>

                                {/* RIGHT COLUMN */}
                                <div className="flex flex-col gap-8 flex-1">
                                    <TextInput
                                        label="CH ID #"
                                        value={ch_number}
                                        disabled={true}
                                        placeholder="CH ID #"
                                    ></TextInput>
                                    <DateInput
                                        label="Date of Birth"
                                        value={dob}
                                        disabled={true}
                                        placeholder="Date of Birth"
                                    ></DateInput>
                                    <TextInput
                                        label="Age"
                                        value={age}
                                        disabled={true}
                                        placeholder="Age"
                                    ></TextInput>
                                </div>
                            </div>
                        </div>

                        <div className="flex w-full flex-col gap-8 rounded-[0.8rem] border border-[var(--border-color)] p-8">
                            <div className="flex border-b border-[var(--border-color)]">
                                <h4 className="header-sm">General Information</h4>
                            </div>
                            <div
                                className={
                                    windowWidth <= 1000
                                        ? "flex flex-col items-stretch gap-8"
                                        : "flex flex-row w-full gap-16"
                                }
                            >
                                {/* LEFT COLUMN */}
                                <div className="flex flex-col gap-8 flex-1">
                                    <TextInput
                                        label="Sub-Project"
                                        value={subproject}
                                        disabled={true}
                                        placeholder="Sub-Project"
                                    />
                                    <DateInput
                                        label="Date Accomplished"
                                        value={date_accomplished}
                                        setValue={setDateAccomplished}
                                        handleChange={handleChange("General Information")}
                                        error={errors["date_accomplished"]}
                                        disabled={viewForm}
                                        placeholder="Date Accomplished"
                                    />
                                    <TextInput
                                        label="Period Covered"
                                        value={period_covered}
                                        setValue={setPeriodCovered}
                                        handleChange={handleChange("General Information")}
                                        error={errors["period_covered"]}
                                        disabled={viewForm}
                                        placeholder="Period Covered"
                                    />
                                </div>
                                {/* RIGHT COLUMN */}
                                <div className="flex flex-col gap-8 flex-1">
                                    <TextInput
                                        label="Name of Sponsor"
                                        value={sponsor_name}
                                        setValue={setSponsorName}
                                        handleChange={handleChange("General Information")}
                                        error={errors["sponsor_name"]}
                                        disabled={viewForm}
                                        placeholder="Name of Sponsor"
                                    />
                                    <DateInput
                                        label="Sponsorship Begin Date"
                                        value={sponsorship_date}
                                        setValue={setSponsorshipDate}
                                        handleChange={handleChange("General Information")}
                                        error={errors["sponsorship_date"]}
                                        disabled={viewForm}
                                        placeholder="Sponsorship Begin Date"
                                    />
                                </div>
                            </div>

                            {savedTime && sectionEdited === "General Information" && (
                                <p className="text-sm self-end mt-2">{savedTime}</p>
                            )}
                        </div>
                    </section>

                    {/* Update/Developmert */}
                    <section className="flex w-full flex-col gap-16">
  {/* Header */}
  <div className="flex w-full flex-col gap-3">
    <h3 className="header-md">Update/Development</h3>
    <h4 className="text-3xl italic">
      e.g. Education, Health, Socio-Economic, Behavioral, Social, etc.
    </h4>
  </div>

  {windowWidth <= 800 ? (
    // Mobile: stack each field vertically
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <label className="label-base">Sponsored Member (Observation)</label>
        <TextArea
          value={sm_update}
          setValue={setSMUpdate}
          error={errors["sm_update"]}
          disabled={viewForm}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="label-base">Family</label>
        <TextArea
          value={family_update}
          setValue={setFamilyUpdate}
          error={errors["family_update"]}
          disabled={viewForm}
        />
      </div>
    </div>
  ) : (
    // Desktop: 2x2 grid (labels row, inputs row) keeps alignment even if a label wraps
    <div className="grid grid-cols-2 gap-x-16 gap-y-3">
      {/* Row 1: labels */}
      <label className="header-sm">Sponsored Member (Observation)</label>
      <label className="header-sm">Family</label>

      {/* Row 2: inputs */}
      <div>
        <TextArea
          value={sm_update}
          setValue={setSMUpdate}
          error={errors["sm_update"]}
          disabled={viewForm}
        />
      </div>
      <div>
        <TextArea
          value={family_update}
          setValue={setFamilyUpdate}
          error={errors["family_update"]}
          disabled={viewForm}
        />
      </div>
    </div>
  )}
</section>


                    {/* Services to Family */}
                    <section className="flex w-full">
                        <TextArea
                            label="Services Rendered to the Family"
                            value={services_to_family}
                            setValue={setServicesToFamily}
                            error={errors["services_to_family"]}
                            disabled={viewForm}
                        ></TextArea>
                    </section>

                    {/* Participation */}
                    <section className="flex w-full">
                        <TextArea
                            label="Participation in the Community"
                            sublabel="Include care for the environment"
                            value={participation}
                            setValue={setParticipation}
                            error={errors["participation"]}
                            disabled={viewForm}
                        ></TextArea>
                    </section>

                    {/* Relationship to Sponsor and Unbound */}
                    <section className="flex w-full flex-col gap-8">
                        <h4 className="header-sm">
                            Relationship to Sponsor & Unbound
                        </h4>
                        <div className={`flex gap-y-16 flex-wrap ${errors["relation_to_sponsor"] ? "px-8 py-12 gap-x-28 border rounded-xl border-red-500" : "gap-x-40"}`}>
                            {questions.map((q) => (
                                <div key={q.id} className="flex flex-col">
                                    <div className="flex flex-col justify-end gap-8">
                                        <p className="body-base">{q.text}</p>
                                        <div className="flex gap-12">
                                            {options.map((option) => (
                                                <label
                                                    key={`${q.id}_${option}`}
                                                    className="flex items-center gap-4 body-base"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        name={q.id}
                                                        value={option}
                                                        checked={relation_to_sponsor[q.id] === option}
                                                        onChange={(e) => {
                                                            handleCheckboxChange(q.id, option);
                                                            handleChange("Relation to Sponsor and Unbound")(e);
                                                        }}
                                                        disabled={viewForm}
                                                    />
                                                    {option}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {errors["relation_to_sponsor"] && (
                            <div className="text-red-500 text-sm self-end">
                                {errors["relation_to_sponsor"]}
                            </div>
                        )}
                        {savedTime && sectionEdited === "Relation to Sponsor and Unbound" && (
                            <p className="text-sm self-end mt-2">{savedTime}</p>
                        )}
                    </section>

                    {/* Signature */}
                    {/*<div className="flex w-full justify-between px-16 pt-24">
                    <Signature label="Prepared by:" signer="SDW/SEDO/SPC"></Signature>
                    <Signature label="Reviewed and Noted by:" signer="SPC/SDDH"></Signature>
                </div>*/}

                    {/* Buttons */}
                    <div className="flex w-full justify-center gap-20">
                        {viewForm ? (
                            <>
                                <button
                                    className="btn-blue font-bold-label w-min"
                                    onClick={() => {
                                        generateProgressReport(formID)
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
                                    {isProcessing ? "Creating..." : "Create Report"}
                                </button>
                            </>
                        )}

                        {/* Confirm Delete Form */}
                        {showConfirm && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                                <div className="flex flex-col bg-white p-16 rounded-lg shadow-xl w-full max-w-3xl mx-4 gap-8">
                                    <h2 className="header-md font-semibold mb-4">Delete Report</h2>
                                    <p className="label-base mb-6">Are you sure you want to delete this report?</p>
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
                                    key="success-modal"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                                >
                                    <div className="flex flex-col bg-white p-16 rounded-lg shadow-xl w-full max-w-3xl mx-4 gap-8">
                                        <h2 className="header-sm font-semibold mb-4">Progress Report #{form_num} Saved</h2>
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
                                                    navigate(`/progress-report/?action=view&caseID=${caseID}&formID=${newformID}`);
                                                }}
                                                className="btn-primary font-bold-label"
                                            >
                                                View Form
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Missing / Invalid Input */}
                        {/*showErrorOverlay && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                                <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full mx-4 p-8 flex flex-col items-center gap-12
                                        animate-fadeIn scale-100 transform transition duration-1000">
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
                                        {customError || "Please fill out all required fields before submitting the form."}
                                    </p>
                                    {customError === "" && (
                                        <p className="body-base text-[var(--text-color)] text-center max-w-xl">
                                            Write N/A if necessary.
                                        </p>
                                    )}

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
                </div>
            </main>
        </>
    );
}

export default ProgressReport;
