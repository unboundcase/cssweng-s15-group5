import React from "react";
import { useEffect, useRef, useState } from "react";

export const TextInput = ({
    label,
    value,
    setValue,
    handleChange,
    disabled = false,
    error = "",
    placeholder = "", // added placeholder prop
}) => {
    return (
        <div className="flex flex-col">
            <div className="flex items-center gap-16">
                <p className="label-base w-72">{label}</p>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        handleChange?.(e);
                        setValue?.(e.target.value);
                    }}
                    disabled={disabled}
                    placeholder={placeholder} // pass placeholder
                    className={`body-base text-input w-full ${
                            error ? "text-input-error" : ""
                        } ${disabled ? "cursor-not-allowed bg-gray-200" : ""}`}
                />
            </div>
            {error && (
                <div className="text-red-500 text-sm self-end">
                    {error}
                </div>
            )}
        </div>
    );
};

export const DateInput = ({
    label,
    value,
    setValue,
    handleChange,
    disabled = false,
    error = "",
    placeholder = "", // added placeholder prop
}) => {
    return (
        <div className="flex flex-col">
            <div className="flex items-center gap-16">
                <p className="label-base w-72">{label}</p>
                <input
                    type="date"
                    value={value}
                    onChange={(e) => {
                        handleChange?.(e);
                        setValue?.(e.target.value);
                    }}
                    disabled={disabled}
                    placeholder={placeholder} // pass placeholder
                    className={`body-base text-input w-full ${
                            error ? "text-input-error" : ""
                        } ${disabled ? "cursor-not-allowed bg-gray-200" : ""}`}
                />
            </div>
            {error && (
                    <div className="text-red-500 text-sm self-end">
                        {error}
                    </div>
                )}
        </div>
    );
};

export const TextArea = ({
    label,
    sublabel,
    description,
    value,
    setValue,
    handleChange,
    showTime = true,
    disabled = false,
    error = "",
    placeholder = "", // added placeholder prop
}) => {
    const [savedTime, setSavedTime] = useState(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (value === "") return; // don't show message for initial empty state

        const now = new Date();
        const timeString = now.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
        });
        setSavedTime(`Saved at ${timeString}`);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => setSavedTime(null), 3000);

        return () => clearTimeout(timeoutRef.current);
    }, [value]);

    return (
        <div className="flex flex-col w-full">
            <section className="flex w-full flex-col gap-5">
                <h4 className="header-sm">{label}</h4>
                {sublabel ? (
                    <div>
                        <p className="label-base">{sublabel}</p>
                        {description ? (
                            <p className="body-base text-muted-foreground italic">{description}</p>
                        ) : null}
                    </div>
                ) : null}
                <textarea
                    value={value}
                    onChange={handleChange || ((e) => setValue?.(e.target.value))}
                    placeholder={placeholder} // pass placeholder
                    className={`body-base text-area h-32 w-full ${
                            error ? "text-area-error" : ""
                        } ${disabled ? "cursor-not-allowed bg-gray-100 text-black" : ""}`}
                    disabled={disabled}
                ></textarea>
                {showTime && savedTime && (
                    <p className="text-color-muted mt-1 self-end text-sm">
                        {savedTime}
                    </p>
                )}
            </section>
            {error && (
                        <div className="text-red-500 text-sm self-end">
                            {error}
                        </div>
                    )}
        </div>
    );
};
