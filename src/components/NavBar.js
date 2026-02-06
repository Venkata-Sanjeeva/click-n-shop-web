import { useEffect, useState } from "react";
import styles from "../styles/Navbar.module.css";
import { Link, useNavigate } from "react-router-dom";
import search from "../images/loupe.png";
import PopUp from "../components/PopUp";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const Navbar = () => {

    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false); // State to track menu visibility

    const [user, setUser] = useState({});

    const [searchInput, setSearchInput] = useState("");

    const [searchItems, setSearchItems] = useState([]);

    const [apiProducts, setApiProducts] = useState([]);

    const [showPopUp, setShowPopUp] = useState(false);

    const [popUpMessage, setPopUpMessage] = useState("");

    const [cartCount, setCartCount] = useState(0);

    const [wishlistCount, setWishlistCount] = useState(0);

    const updateCounts = () => {
        const userObj = JSON.parse(sessionStorage.getItem("user"));

        if (userObj) {
            axios.get(`${API_URL}/cart/fetch/user/` + userObj.uniqueId)
                .then(res => setCartCount(res.data.cartItems.length || 0))
                .catch(err => console.log(err));

            axios.get(`${API_URL}/wishList/fetch/user/` + userObj.uniqueId)
                .then(res => setWishlistCount(res.data.wishListProducts.length || 0))
                .catch(err => console.log(err));
        }
    }

    useEffect(() => {
        const userObj = JSON.parse(sessionStorage.getItem("user"));
        setUser(userObj);

        axios.get("https://supersimplebackend.dev/products")
            .then(res => {
                const products = res.data;

                const modifiedProductsArr = products.map((product) => ({ id: product.id, name: product.name }));

                setApiProducts(modifiedProductsArr);
            })
            .catch(err => console.log(err));

        if(userObj) {
            updateCounts();
        }

        const url = window.location.href;

        if (url.includes("/cart")) {
            handleBorder("cart", "cartLinkId");
        }

        window.addEventListener("cartUpdated", updateCounts);
        return () => window.removeEventListener("cartUpdated", updateCounts);

    }, []);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchInput(value);

        if (value.length > 0) {
            const filteredItems = apiProducts.filter((product) => {
                return product?.name.toLowerCase().includes(value.toLowerCase());
            });
            setSearchItems(filteredItems);
        } else {
            setSearchItems([]);
        }

    }

    // Toggles the menu visibility
    const toggleMenu = () => {
        setIsOpen((prev) => !prev);
    };

    const handlePopup = () => {
        setShowPopUp(false);
        sessionStorage.removeItem("user");
        if (window.location.href.includes("/")) {
            window.location.reload();
        } else {
            navigate("/");
        }
    }

    const handleLogout = () => {
        setShowPopUp(true);
        setPopUpMessage("Are you sure you want to log out ?");
    }

    const handleBorder = (name) => {
        const tag = document.querySelector("#" + name);
        tag?.classList.toggle(styles.borderSpan);
    }

    return (
        <nav className={styles.navbar}>
            <div className={styles.logo}>
                <Link to={"/"} className={styles.logoLink}>ClickNShop</Link>
            </div>

            <div className={styles.searchBarDiv}>
                <div className={styles.searchField}>
                    <input type="text"
                        placeholder="Search for products..."
                        value={searchInput}
                        onChange={handleSearch}
                        className={styles.searchBar} />

                    {searchItems.length > 0 &&
                        <div className={styles.searchItemsDiv}>
                            {searchItems.map((productObj, index) => (
                                <div key={index} className={styles.searchItem} onClick={() => {
                                    navigate("/product/" + productObj.id);
                                    setSearchInput("");
                                    setSearchItems([]);
                                }}>
                                    <span>{productObj.name}</span>
                                </div>))
                            }
                        </div>}
                </div>
                <button className={styles.searchBtn}>
                    <img src={search} alt="search" className={styles.searchIcon} />
                </button>
            </div>

            {/* Navigation Links */}
            <ul className={`${styles.navLinks} ${isOpen ? styles.show : ""}`}>
                {/* <li id="cartLink" onClick={() => handleBorder("cart", "cartLinkId")}> */}
                {user ?
                    <>
                        <li>
                            <Link to={"/cart"} className={`${styles.link}`}>
                                Cart &nbsp; <span className={styles.cartCountSpan}>{cartCount}</span>
                            </Link>
                            <span id="cartLinkId"></span>
                        </li>

                        <li>
                            <Link to={"/wishlist"} className={styles.link}>
                                Wishlist &nbsp; <span className={styles.wishListCountSpan}>{wishlistCount}</span>
                            </Link>
                        </li>

                        <li>
                            <Link to={"/orders"} className={styles.link}>Order Details</Link> 
                        </li>

                        <li>
                            <Link to={"/ordersDeliveryDetails"} className={styles.link}>My Orders</Link>
                        </li>

                        <li>
                            <Link to={"/profile/" + user.id} className={styles.link}>{user.username}'s Profile</Link>
                        </li>

                        <li>
                            <span className={styles.link} onClick={handleLogout}>LogOut</span>
                        </li>
                    </>
                    : 
                        <>
                            <Link to={"/register"} className={styles.link}>SignUp</Link>
                            <Link to={"/login"} className={styles.link}>Login</Link>
                        </>
                }

            </ul>

            {/* Hamburger Menu */}
            <div className={styles.hamburger} onClick={toggleMenu}>
                <span className={styles.bar}></span>
                <span className={styles.bar}></span>
                <span className={styles.bar}></span>
            </div>

            {showPopUp && <PopUp msg={popUpMessage} okFun={handlePopup} closeFun={() => {
                setShowPopUp(false);
                popUpMessage.includes("successfully") && window.location.reload();
            }} />}

        </nav>
    );
};

export default Navbar;
