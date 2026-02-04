import { useEffect, useState } from 'react';
import styles from "../styles/ProfilePage.module.css";
import axios from "axios";
import { useNavigate, useParams } from 'react-router-dom';
import ValidateFields from '../utils/ValidateFields';
import PopUp from './PopUp';
import NavBar from './NavBar';
import Loader from './Loader';

export default function ProfilePage() {

    const {userId} = useParams();

    const [countriesList, setCountriesList] = useState(null);
    const [statesList, setStatesList] = useState(null);
    const [citiesList, setCitiesList] = useState(null);

    const [userDetails, setUserDetails] = useState(null);

    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();

    const getStates = (country) => {
        
        axios.post(`https://countriesnow.space/api/v0.1/countries/states`, {country})
            .then(res => setStatesList(res.data.data.states))
            .catch(err => console.log(err));
    }

    const getCities = (state, country) => {
        axios.post(`https://countriesnow.space/api/v0.1/countries/state/cities`, {state, country})
            .then(res => setCitiesList(res.data.data))
            .catch(err => console.log(err));
    }

    const [showPopup, setShowPopup] = useState(false);
    const [popupMsg, setPopupMsg] = useState("");
    const [errorObj, setErrorObj] = useState({});

    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const [zipcode, setZipcode] = useState("");
    const [state, setState] = useState("");
    const [gender, setGender] = useState("");
    const [dob, setDob] = useState("");

    useEffect(() => {
        axios.get("https://countriesnow.space/api/v0.1/countries")
        .then(res => setCountriesList(res.data.data))
        .catch(err => console.log(err));

        axios.get("http://localhost:8080/users/" + userId)
        .then(res => {
            const user = res.data;
            setUserDetails({...user});
            setFullName(user.fullName);
            setPhone(user.phone);
            setEmail(user.email);
            setAddress(user.address);
            setCity(user.city);
            setCountry(user.country);
            setZipcode(user.zipcode);
            setState(user.state);
            setGender(user.gender);
            setDob(user.dob);

            if(user.state?.length > 0 && user.country?.length > 0) {
                getStates(user.country);
                getCities(user.state, user.country);
            }
        })
        .catch(err => console.log(err));

        setIsLoading(false);

    }, [userId]);

    const verifyFields = () => {
        const errors = ValidateFields({
            fullName,
            phone,
            address,
            city,
            country,
            zipcode,
            state,
            gender,
            dob
        });

        setErrorObj({...errors});
        return Object.keys(errors).length > 0;
    }

    const handleStates = (event) => {
        errorObj.state = "";
        setState(event.target.value);
        getCities(event.target.value.trim(), country);
    }

    const handleSubmit = () => {

        if(verifyFields()) {
            return;
        };

        const userObj = {
            fullName: fullName?.trim(),
            phone: phone?.trim(),
            address: address?.trim(),
            city: city?.trim(),
            country: country?.trim(),
            zipcode: zipcode?.trim(),
            state: state?.trim(),
            gender: gender?.trim(),
            dob: dob?.trim()
        };

        axios.patch("http://localhost:8080/users/" + userId, userObj)
        .then(res => console.log(res.data))
        .catch(err => console.log(err));

        setShowPopup(true);
        setPopupMsg("Personal Details Updated Successfully.");
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        navigate("/home");
    };


    return (<>
        <NavBar />
        {isLoading ? <Loader/> : <section className={styles.signupSection}>
            {!userDetails ? <Loader/> : <div className={styles.container}>
                <h1 className={styles.title}>{userDetails.username}'s Profile Page</h1>
                <div className={styles.registerForm}>
                    {/* First Row, First Column */}
                    <div className={`${styles.formGroup} ${styles.fullName}`}>
                        <label className={styles.label}>Enter Full Name: </label>
                        <input type="text"
                               value={fullName}
                               placeholder="Enter your name..."
                               onChange={(event) => {
                                    errorObj.fullName = "";
                                    setFullName(event.target.value);
                               }}
                               className={styles.input} />
                        {errorObj.fullName && <span className={styles.nameErrorTag}>{errorObj.fullName}</span>}
                    </div>

                    {/* First Row, Second Column */}
                    <div className={`${styles.formGroup} ${styles.dobTag}`}>
                        <label className={styles.label}>Select Date Of Birth: </label>
                        <input type="date"
                               value={dob}
                               placeholder="dd/mm/yyyy" // Added placeholder for date input
                               onChange={(event) => {
                                    errorObj.dob = "";
                                    setDob(event.target.value);
                               }}
                               className={styles.input} />
                        {errorObj.dob && <span className={styles.dobErrorTag}>{errorObj.dob}</span>}
                    </div>

                    {/* First Row, Third Column (Implicit due to grid setup)
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
                        {errorObj.username && <span className={styles.userNameErrorTag}>{errorObj.username}</span>}
                    </div> */}

                    {/* Second Row, First Column */}
                    <div className={`${styles.formGroup} ${styles.gender}`}>
                        <label className={styles.label}>Select Gender: </label>
                        <select
                            value={gender}
                            onChange={(event) => {
                                    errorObj.gender = "";
                                    setGender(event.target.value);
                            }}
                            className={styles.input}>
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                        {errorObj.gender && <span className={styles.genderErrorTag}>{errorObj.gender}</span>}
                    </div>

                    {/* Third Row, First Column */}
                    <div className={`${styles.formGroup} ${styles.email}`}>
                        <label className={styles.label}>Enter Email: </label>
                        <input type="email"
                               value={email}
                               placeholder="Enter your email..."
                               readOnly
                               className={styles.input} />
                        {errorObj.email && <span className={styles.emailErrorTag}>{errorObj.email}</span>}
                    </div>

                    {/* Third Row, Second Column */}
                    <div className={`${styles.formGroup} ${styles.phone}`}>
                        <label className={styles.label}>Enter Phone Number: </label>
                        <input type="tel"
                                value={phone}
                               placeholder="Enter your phone..."
                               onChange={(event) => {
                                    errorObj.phone = "";
                                    setPhone(event.target.value);
                               }}
                               className={styles.input} />
                        {errorObj.phone && <span className={styles.phoneErrorTag}>{errorObj.phone}</span>}
                    </div>

                    {/* Third Row, Third Column (for now, will be address below it) */}
                    {/* Note: The screenshot implies a different arrangement. I'll place them as a single column for now, and you can adjust the CSS `grid-row-start` or `grid-column-start` if you want more complex placements.
                       Based on the image, the rest of the fields flow below the first three rows */}
                    <div className={`${styles.formGroup} ${styles.address}`}>
                        <label className={styles.label}>Enter Address: </label>
                        <input type="text"
                                value={address}
                               placeholder="Enter your address..."
                               onChange={(event) => {
                                    errorObj.address = "";
                                    setAddress(event.target.value);
                               }}
                               className={styles.input} />
                        {errorObj.address && <span className={styles.addressErrorTag}>{errorObj.address}</span>}
                    </div>
                        
                    {/* Fourth Row, First Column */}
                    <div className={`${styles.formGroup} ${styles.country}`}>
                        <label className={styles.label}>Select Country: </label>
                        <select onChange={(event) => {
                                errorObj.country = "";
                                setCountry(event.target.value);
                                getStates(event.target.value.trim());
                            }}
                                value={country}
                                className={styles.input}>
                            <option value="">Select Country</option>
                            {countriesList && countriesList.map((country, index) => {
                                return <option key={index} value={country.country}>{country.country}</option>
                            })}
                        </select>
                        {errorObj.country && <span className={styles.countryErrorTag}>{errorObj.country}</span>}
                    </div>

                    {/* Fourth Row, Second Column */}
                    <div className={`${styles.formGroup} ${styles.state}`}>
                        <label className={styles.label}>Select State: </label>
                        <select onChange={handleStates}
                                value={state}
                                className={styles.input}>
                            <option value="">Select State</option>
                            {statesList && statesList.map((state, index) => {
                                // The API returns an object with a 'name' property for states
                                return <option key={index} value={state.name}>{state.name}</option>
                            })}
                        </select>
                        {errorObj.state && <span className={styles.countryErrorTag}>{errorObj.state}</span>} {/* Reusing countryErrorTag for state as well */}
                    </div>

                    {/* Fourth Row, Third Column */}
                    <div className={`${styles.formGroup} ${styles.city}`}>
                        <label className={styles.label}>Select City: </label>
                        <select className={styles.input}
                                value={city}
                                onChange={(event) => {
                                    errorObj.city = "";
                                    setCity(event.target.value);
                                }}>
                            <option value={""}>Select City</option>
                            {citiesList && citiesList.map((city, index) => {
                                return <option key={index} value={city}>{city}</option>
                            })}
                        </select>
                        {errorObj.city && <span className={styles.cityErrorTag}>{errorObj.city}</span>}
                    </div>

                    {/* Fifth Row, First Column (and the rest of the fields will flow) */}
                    <div className={`${styles.formGroup} ${styles.zipCode}`}>
                        <label className={styles.label}>Enter Zipcode: </label>
                        <input type="text"
                                value={zipcode}
                               placeholder="Enter your zipcode..."
                               onChange={(event) => {
                                    errorObj.zipcode = "";
                                    setZipcode(event.target.value);
                               }}
                               className={styles.input} />
                        {errorObj.zipcode && <span className={styles.zipErrorTag}>{errorObj.zipcode}</span>}
                    </div>

                    <div className={styles.buttonContainer}>
                        <button className={styles.registerButton} onClick={handleSubmit}>
                            Save Details
                        </button>
                    </div>
                </div>

                {/* Pop-up Message */}
                {showPopup && (<PopUp msg={popupMsg} okFun={handleClosePopup} closeFun={() => setShowPopup(false)}/>)}
            </div>}
        </section>}
    </>);
}