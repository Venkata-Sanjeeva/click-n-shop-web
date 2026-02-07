import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/LoginPage.module.css";
import openEye from "../images/openedEye.png";
import closeEye from "../images/closedEye.png";
import axios from "axios";
import ValidateFields from "../utils/ValidateFields";
import PopUp from "./PopUp";
import Navbar from "./NavBar";
import Loader from "./Loader";

const API_URL = process.env.REACT_APP_API_URL;

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [errorObj, setErrorObj] = useState({});

    const [registeredUsers, setRegisteredUsers] = useState([]);

    const [showPopUp, setShowPopUp] = useState(false);
    const [showPopUpMsg, setShowPopUpMsg] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        axios.get(`${API_URL}/user/fetch/all`)
            .then(res => setRegisteredUsers(res.data?.allUsersList))
            .catch(err => console.log(err))
            .finally(() => setLoading(false));
    }, []);

    const handleLogin = () => {

        const errorObjRes = ValidateFields({ username, password });

        setErrorObj({ ...errorObjRes });

        if (Object.keys(errorObjRes).length !== 0) {
            return;
        }

        console.log(registeredUsers);

        const user = registeredUsers.find(user => user.username === username || user.email === username);
        // get the user from database using username and password.
        if (user) {
            if (user.password === password) {
                setShowPopUp(true);
                sessionStorage.setItem("user", JSON.stringify({ uniqueId: user.uniqueId, username: user.username }));
                setShowPopUpMsg("Account Verified Successfully!");
            } else {
                setShowPopUp(true);
                setShowPopUpMsg("Invalid User Credentials!!!");
            }
        } else {
            setShowPopUp(true);
            setShowPopUpMsg("User Not Found!");
        }
    }

    const handleClosePopup = () => {
        setShowPopUp(false);
        showPopUpMsg.includes("Verified") ? navigate("/") : navigate("/login");
    }

    // <Loader/>

    return (
        loading ? <Loader /> : <>
            <Navbar />
            <section className={styles.loginSection}>
                {<div className={styles.container}>
                    <h1 className={styles.heading}>Login Page</h1>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Enter User Name / Email ID:</label>
                        <input
                            type="text"
                            placeholder="Enter Email/Username..."
                            value={username}
                            onChange={(e) => {
                                errorObj.username && setErrorObj({ ...errorObj, username: "" });
                                setUsername(e.target.value);
                            }}
                            className={styles.input}
                        />
                        <div className={styles.errorDiv}>
                            {errorObj.username && <span className={styles.usernameError}>{errorObj.username}</span>}
                        </div>
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Enter Password:</label>
                        <div className={styles.passwordFieldDiv}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter Password..."
                                value={password}
                                onChange={(e) => {
                                    errorObj.password && setErrorObj({ ...errorObj, password: "" });
                                    setPassword(e.target.value);
                                }}
                                className={styles.input}
                            />
                            <span className={styles.imageSpan} onClick={() => setShowPassword(!showPassword)}><img src={showPassword ? openEye : closeEye} alt='eye' /></span>
                        </div>
                        <div className={styles.forgotPassDiv}>
                            <Link to={"/resetPassword"} className={styles.links}>Forgot Password?</Link>
                        </div>
                        <div className={styles.errorDiv}>
                            {errorObj.password && <span className={styles.passwordError}>{errorObj.password}</span>}
                        </div>
                    </div>

                    <button className={styles.button} onClick={handleLogin}>Login</button>
                    <br />

                    <span className={styles.helperText}>
                        Not Registered Yet? &nbsp;
                        <Link to="/register" className={styles.links}>
                            Click Here
                        </Link>
                    </span>

                    {showPopUp && <PopUp msg={showPopUpMsg} okFun={handleClosePopup} closeFun={() => {
                        setShowPopUp(false);
                        setUsername("");
                        setPassword("");
                        showPopUpMsg.includes("Verified") && navigate("/home");
                    }} />}
                </div>}

            </section>
        </>);
}
