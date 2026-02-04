import { useEffect, useState } from 'react';
import styles from "../styles/RegisterPage.module.css";
import openEye from "../images/openedEye.png";
import closeEye from "../images/closedEye.png";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import ValidateFields from '../utils/ValidateFields';
import PopUp from './PopUp';
import NavBar from './NavBar';
import Loader from './Loader';

const API_URL = process.env.REACT_APP_API_URL;

export default function RegisterPage() {

    const [registeredUsers, setRegisteredUsers] = useState([]);

    useEffect(() => {

        axios.get(API_URL + "/user/fetch/all")
        .then(res => setRegisteredUsers(res.data))
        .catch(err => console.log(err));

    }, []);

    const navigate = useNavigate();

    const [showPopup, setShowPopup] = useState(false);
    const [popupMsg, setPopupMsg] = useState("");
    const [errorObj, setErrorObj] = useState({});
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [email, setEmail] = useState("");

    const verifyFields = () => {
        const errors = ValidateFields({
            username,
            password,
            confirmPassword,
            email
        });

        setErrorObj({...errors});

        return Object.keys(errors).length > 0;
    };

    const checkPasswordMatch = (value) => {
        errorObj.confirmPassword = "";
        setConfirmPassword(value);
        
        if(password !== value) {
            setErrorObj({...errorObj, confirmPassword: "Passwords do not match"});
        } else {
            setErrorObj({...errorObj, confirmPassword: ""});
        }
    };

    const handleSubmit = () => {

        if(verifyFields()) {
            return;
        }

        const userObj = {
            username: username.trim(),
            password: password.trim(),
            email: email.trim()
        };
        
        let isUserAlreadyRegistered = false;

        // put in try-catch block to write user already exists in popup

        registeredUsers.length > 0 && registeredUsers.forEach(user => {
            if(user.email === email || user.username === username) {
                isUserAlreadyRegistered = true;
                return;
            }
        })

        if(isUserAlreadyRegistered) {
            setShowPopup(true);
            // setPopupMsg(`An account with this email already exists. Please &nbsp;<Link to={"/login"}>LogIn</Link>&nbsp; or choose a different email.`);
            setPopupMsg(`An account with this email already exists.\nPlease Login or choose a different email.`);
            setPassword("");
            setUsername("");
            setConfirmPassword("");
        } else {
            axios.post(`${API_URL}/user/register`, userObj)
            .then(res => {
                const userObj = res.data;
                console.log(userObj);
            });

            setShowPopup(true);
            setPopupMsg("Account Created Successfully.\nPlease Login.");
        }
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        navigate("/login");
    }


    return (<>
        <NavBar />
        <section className={styles.signupSection}>
            {registeredUsers.length === 0 ? <Loader/> : <div className={styles.container}>
                <h1 className={styles.title}>Sign Up Page</h1>
                {/* First Row, First Column (Implicit due to grid setup) */}
                <div className={`${styles.formGroup} ${styles.userName}`}>
                    <label className={styles.label}>Enter Username: </label>
                    <input type="text"
                            value={username}
                            placeholder="Enter your username..."
                            onChange={(event) => {
                                errorObj.username = "";
                                setUsername(event.target.value)
                            }}
                            className={styles.input} />
                    <div className={styles.errorDiv}>
                        {errorObj.username && <span className={styles.userNameErrorTag}>{errorObj.username}</span>}
                    </div>
                </div>

                
                {/* Third Row, First Column */}
                <div className={`${styles.formGroup} ${styles.email}`}>
                    <label className={styles.label}>Enter Email: </label>
                    <input type="email"
                            value={email}
                            placeholder="Enter your email..."
                            onChange={(event) => {
                                errorObj.email = "";
                                setEmail(event.target.value);
                            }}
                            className={styles.input} />
                    <div className={styles.errorDiv}>
                        {errorObj.email && <span className={styles.emailErrorTag}>{errorObj.email}</span>}
                    </div>
                </div>

                {/* Second Row, Second Column */}
                <div className={`${styles.formGroup} ${styles.password}`}>
                    <label className={styles.label}>Enter Password: </label>
                    <div className={styles.passwordFieldDiv}>
                        <input type={showPassword1 ? "text": "password"}
                            value={password}
                            placeholder="Enter your password..."
                            onChange={(event) => {
                                errorObj.password = "";
                                setPassword(event.target.value);
                            }}
                            className={styles.input} />

                        <span className={styles.imageSpan} onClick={() => setShowPassword1(!showPassword1)}><img src={showPassword1 ? openEye : closeEye} alt='eye'/></span>
                    </div>
                    <div className={styles.errorDiv}>
                        {errorObj.password && <span className={styles.passwordErrorTag}>{errorObj.password}</span>}
                    </div>
                    
                </div>

                {/* Second Row, Third Column */}
                <div className={`${styles.formGroup} ${styles.confirmPassword}`}>
                    <label className={styles.label}>Confirm Password: </label>
                    <div className={styles.passwordFieldDiv}>
                        <input type={showPassword2 ? "text": "password"}
                            value={confirmPassword}
                            placeholder="Confirm your password..."
                            onChange={(event) => checkPasswordMatch(event.target.value)}
                            className={styles.input} />
                        
                        <span className={styles.imageSpan} onClick={() => setShowPassword2(!showPassword2)}><img src={showPassword2 ? openEye : closeEye} alt='eye'/></span>

                    </div>
                    <div className={styles.errorDiv}>
                        {errorObj.confirmPassword && <span className={styles.passwordErrorTag}>{errorObj.confirmPassword}.</span>}
                    </div>
                </div>

                <span className={styles.helperText}>
                    <span>
                            Already have an account ?
                    </span> &nbsp;

                    <Link to="/login" className={styles.links}>
                        Login
                    </Link>
                </span>

                <button className={styles.button} onClick={handleSubmit}>
                    Register
                </button>

                {/* Pop-up Message */}
                {showPopup && (<PopUp msg={popupMsg} okFun={handleClosePopup} closeFun={() => setShowPopup(false)}/>)}
            </div>}
        </section>
    </>);
}