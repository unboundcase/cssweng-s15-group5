import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../fetch-connections/account-connection";
//
export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const navigate = useNavigate();

    const isSmallScreen = windowWidth <= 720;
    const isVerySmallScreen = windowWidth <= 600;
    const isExtraSmallScreen = windowWidth <= 450;

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const original = document.body.style.backgroundColor;
        document.body.style.backgroundColor = "var(--color-primary)";
        return () => {
            document.body.style.backgroundColor = original;
        };
    }, []);

    useEffect(() => {
        document.title = "Login";
    }, []);

    const handleLogin = async () => {
        const payload = {
            username: username,
            password: password,
            rememberMe: rememberMe
        };

        const res = await loginUser(payload);

        if (res.ok && !res.data.errorMsg) {
            if (res.data.is_active) {
                // console.log('Login success:', res.data);
                setErrorMessage('');
                window.location.href = '/';
            } else {
                setErrorMessage('Worker account is no longer active.');
            }
        } else {
            setErrorMessage(res.data.errorMsg || 'Username and password do not match.');
        }
    };

    return (
        <>
            <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white
                            ${isSmallScreen ? 'w-[calc(100%-2rem)] max-w-[95vw] h-auto p-4' : 'max-w-[75rem] w-full h-auto p-10'} rounded-lg drop-shadow-card flex
                            flex-col justify-around items-center gap-5 overflow-y-auto`}>

                <div className="main-logo main-logo-text-nav flex items-center">
                    <div className={`main-logo-setup folder-logo ${isExtraSmallScreen ? '!w-[6rem] !h-[8rem]' : '!w-[8rem] !h-[12rem]'}`}></div>
                    <div className="flex flex-col">
                        <p className={`main-logo-text-nav-sub mb-[-1rem] break-words ${isExtraSmallScreen ? '!text-[1.5rem]' : '!text-[2rem]'}`}>Unbound Manila Foundation Inc.</p>
                        <p className={`main-logo-text-nav break-words ${isExtraSmallScreen ? '!text-[2rem]' : '!text-[3rem]'}`}>Case Management System</p>
                    </div>
                </div>

                <form className="flex flex-col justify-between items-center gap-12 max-w-[40rem] w-full"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleLogin();
                    }}>
                    <input
                        type="text"
                        className="text-input font-label w-full"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        data-cy='login-username'
                    />

                    <input
                        type="password"
                        className="text-input font-label w-full"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        data-cy='login-password'
                    />

                    <div className="flex justify-between w-full">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="remember"
                                className="w-5 h-5"
                                checked={rememberMe}
                                onChange={() => setRememberMe(!rememberMe)}
                                data-cy='login-remember'
                            />

                            <label htmlFor="remember" className="font-label">Remember me</label>
                        </div>

                    </div>

                    <div className="mt-[-10] flex flex-col justify-center items-center">
                        {errorMessage && (
                            <p className="font-label !text-red-500 text-center">
                                {errorMessage}
                            </p>
                        )}

                        <button
                            type="submit"
                            // onClick={handleLogin}
                            className="btn-primary font-bold-label drop-shadow-base !text-[2.5rem] !py-5 !px-30 m-4"
                            data-cy='login-button'
                        >
                            Login
                        </button>
                    </div>

                </form>
            </div>
        </>
    );
}
