import { useEffect, useState } from 'react'
import styles from '../styles/LoginPage.module.css';
import openEye from "../images/openedEye.png";
import closeEye from "../images/closedEye.png";
import { Link, useNavigate } from 'react-router-dom';
import ValidateFields from '../utils/ValidateFields';
import PopUp from './PopUp';
import axios from 'axios';
import Navbar from './NavBar';
import Loader from './Loader';

const API_URL = process.env.REACT_APP_API_URL;

export default function ForgotPassword() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");


    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);

    const [errorObj, setErrorObj] = useState({});

    const [showPopUp, setShowPopUp] = useState(false);
    const [showPopUpMsg, setShowPopUpMsg] = useState("");

    const [registeredUsers, setRegisteredUsers] = useState([]);

    useEffect(() => {
        // const userUniqueId = JSON.parse(sessionStorage.getItem("user"))?.uniqueId;
        // axios.get(`${API_URL}/user/fetch/${userUniqueId}`)
        axios.get(`${API_URL}/user/fetch/all`)
        .then(res => setRegisteredUsers(res.data.allUsersList))
        .catch(err => console.log(err));
    }, []);

    const navigate = useNavigate();

    const checkPasswordMatch = (value) => {
        errorObj.confirmPassword = "";
        setConfirmPassword(value);
        
        if(password !== value) {
            setErrorObj({...errorObj, confirmPassword: "Passwords do not match"});
        } else {
            setErrorObj({...errorObj, confirmPassword: ""});
        }
    };

    const handlePasswordReset = () => {
        const errorObjRes = ValidateFields({username, password, confirmPassword});
        setErrorObj({...errorObjRes});

        if(Object.keys(errorObjRes).length > 0) {
            return;
        }

        // TODO: call API to reset password

        const userUniqueId = registeredUsers.find(user => user.username === username || user.email === username)?.uniqueId || null;
        
        // const property = username.includes("@") ? "email" : "username";

        // const userObj = {[property]: username, password};

        if(userUniqueId) {
            axios.patch(`${API_URL}/user/resetPassword`, {password: password, userUniqueId: userUniqueId})
            .then(res => {
                if(res.status === 200) {
                    setShowPopUp(true);
                    setShowPopUpMsg("Password reset completed successfully...\nPlease try to login again.");
                }
            })
            .catch(err => console.log(err));
        } else {
            setShowPopUp(true);
            setShowPopUpMsg("Password reset failed!");
            
        }
    };

    const handleClosePopup = () => {
        setShowPopUp(false);
        navigate("/login");
    }

    return(<>
        <Navbar/>
        <section className={styles.forgotPasswodSection}>
        {registeredUsers.length === 0 ? <Loader/> : <div className={styles.container}>
            <h1 className={styles.heading}>Reset Your Password</h1>
            
            <div className={styles.inputGroup}>
                <label className={styles.label}>Enter User Name / Email ID:</label>
                <input 
                    type="text" 
                    placeholder="Enter Email/Username..." 
                    onChange={(e) => {
                        errorObj.username && setErrorObj({...errorObj, username: ""});
                        setUsername(e.target.value);
                    }}
                    className={styles.input} 
                />
                <div className={styles.errorDiv}>
                    {errorObj.username && <span className={styles.usernameError}>{errorObj.username}</span>}
                </div>
            </div>

            <div className={`${styles.inputGroup} ${styles.password}`}>
                <label className={styles.label}>Enter New Password: </label>
                <div className={styles.passwordFieldDiv}>
                    <input 
                        type={showPassword1 ? "text" : "password"} 
                        placeholder="Enter Password..."
                        onChange={(e) => {
                            errorObj.password && setErrorObj({...errorObj, password: ""});
                            setPassword(e.target.value);
                        }} 
                        className={styles.input}
                    />
                    <span className={styles.imageSpan} onClick={() => setShowPassword1(!showPassword1)}><img src={showPassword1 ? openEye : closeEye} alt='eye'/></span>
                </div>
                
                <div className={styles.errorDiv}>
                    {errorObj.password && <span className={styles.passwordError}>{errorObj.password}</span>}
                </div>
                
            </div>

            <div className={`${styles.inputGroup} ${styles.confirmPassword}`}>
                <label className={styles.label}>Confirm Password: </label>
                    <div className={styles.passwordFieldDiv}>
                        <input 
                            type={showPassword2 ? "text" : "password"} 
                            placeholder="Confirm your Password..."
                            onChange={(e) => {
                                checkPasswordMatch(e.target.value);
                                errorObj.password && setErrorObj({...errorObj, confirmPassword: ""});
                                setConfirmPassword(e.target.value);
                            }} 
                            className={styles.input}
                        />
                        <span className={styles.imageSpan} onClick={() => setShowPassword2(!showPassword2)}><img src={showPassword2 ? openEye : closeEye} alt='eye'/></span>
                    </div>
                <div className={styles.errorDiv}>
                    {errorObj.confirmPassword && <span className={styles.passwordError}>{errorObj.confirmPassword}</span>}
                </div>
            </div>

            <button className={styles.button} onClick={handlePasswordReset}>Reset Password</button>
            <br />
            <span className={styles.helperText}>
                Go to Home Page. &nbsp;
                <Link to="/home" className={styles.links}>
                    Click Here
                </Link>
            </span>
            {showPopUp && <PopUp msg={showPopUpMsg} okFun={handleClosePopup} closeFun={() => setShowPopUp(false)}/>}
        </div>}
    </section>
    </>);
}
