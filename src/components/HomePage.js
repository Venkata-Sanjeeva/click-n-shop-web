import { useEffect, useState } from 'react'

import axios from 'axios';
import styles from "../styles/HomePage.module.css";
import Navbar from './NavBar';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import HeartIcon from "../images/heart.png";
import HeartIconFilled from "../images/love.png";
import Loader from './Loader';
import PopUp from './PopUp';
// uuidv4(); // ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'

const API_URL = process.env.REACT_APP_API_URL;
sessionStorage.removeItem("product");

export default function HomePage() {

    const [API, setAPI] = useState(null);

    const [cartProducts, setCartProducts] = useState([]);

    const [wishListProducts, setWishListProducts] = useState([]);

    const [showPopUp, setShowPopUp] = useState(false);

    const [popUpMsg, setPopUpMsg] = useState("");

    const navigate = useNavigate();

    function fetchCartAndWishListDetails(userObj = {}) {
        // I need to fetch the cart items of particular user only not the all users cart items.
        userObj?.uniqueId && axios.get(`${API_URL}/cart/fetch/user/` + (userObj ? userObj.uniqueId : ""))
            .then(res => {
                const userRelatedCartArr = res.data.cartItems || [];

                if (userRelatedCartArr.length > 0) {
                    setCartProducts([...userRelatedCartArr]);
                } else {
                    setCartProducts([]);
                }
            })
            .catch(err => console.log(err));

        axios.get(`${API_URL}/wishList/fetch/user/` + (userObj ? userObj.uniqueId : ""))
            .then(res => {
                const userRelatedWishListProducts = res.data.wishListProducts || [];

                if (userRelatedWishListProducts.length > 0) {
                    setWishListProducts([...userRelatedWishListProducts]);
                } else {
                    setWishListProducts([]);
                }
            })
            .catch(err => console.log(err));
    }

    useEffect(() => {
        axios.get("https://supersimplebackend.dev/products")
            .then((res) => {
                let apiData = res.data;
                apiData = apiData.map((productObj) => {
                    const product = { ...productObj, unique_id: uuidv4() };
                    return product;
                });
                setAPI(apiData);
            })
            .catch(err => {
                setShowPopUp(true);
                setPopUpMsg("Something went wrong!!!\n" + err);
                return;
            });

        const userObj = JSON.parse(sessionStorage.getItem("user"));

        if (userObj) {
            fetchCartAndWishListDetails(userObj);
        }

    }, []);

    const handleAddToCart = (product) => {
        const userObj = JSON.parse(sessionStorage.getItem("user"));

        if (userObj === null) {  // sessionStorage will result an array at first index 
            setPopUpMsg("Please login to add a product into cart.");
            setShowPopUp(true);
            return;
        }
        // increase the count currently present in the cart

        const availableCartProducts = [...cartProducts];

        const productFound = availableCartProducts.find((item) => item.productId === product.id);

        if (productFound) {
            setShowPopUp(true);
            setPopUpMsg("This product is already added to your cart.");
            return;
        }

        const productCard = document.getElementById(`cartMsg-${product.id}`);

        productCard.classList.add(styles.addedToCart);
        productCard.innerText = "Added To Cart.";

        setTimeout(() => {
            productCard.classList.remove(styles.addedToCart);
            productCard.innerText = "";
        }, 1500);

        productCard.innerText = "Added to cart";

        axios.post(`${API_URL}/cart/save`, { userUniqueId: userObj.uniqueId, cartItem: { productId: product.id, quantity: 1, price: product.priceCents / 100 } });

        setCartProducts([...availableCartProducts, { productId: product.id, quantity: 1 }]);

    };

    const handleWishListIcon = (productCard) => {

        const userObj = JSON.parse(sessionStorage.getItem("user"));

        if (!userObj) {  // sessionStorage will result an array at first index 
            setPopUpMsg("Please login to add this product into your wishlist.");
            setShowPopUp(true);
            return;
        }

        const productWishListIcon = document.getElementById(`wishList-${productCard.id}`);

        productWishListIcon.getAttribute("src") === HeartIcon ? productWishListIcon.setAttribute("src", HeartIconFilled) : productWishListIcon.setAttribute("src", HeartIcon);


        let availableWishListProducts = [...wishListProducts];

        if (availableWishListProducts.find((item) => item.productId === productCard.id)) {

            // delete that product which is found in the available wishListProducts array
            axios.delete(`${API_URL}/wishList/delete/` + userObj.uniqueId + "/" + productCard.id);

        } else {
            const reqData = {
                userUniqueId: userObj.uniqueId,
                wishListProduct: {
                    productId: productCard.id,
                    price: productCard.priceCents / 100
                }
            };

            axios.post(`${API_URL}/wishList/save`, reqData)
                .then(res => console.log(res.data))
                .catch(err => console.log(err));

            setWishListProducts([...availableWishListProducts, { productId: productCard.id }]);
        }

    }

    return (<>
        <Navbar />
        <section className={styles.container}>
            {!API ? <Loader /> : API.map((item) => (
                <div key={item.unique_id} className={styles.item} id={item.unique_id}>
                    <div className={styles.imageContainer}>
                        <img src={item.image} alt={item.unique_id} onClick={() => navigate(`/product/${item.id}`)} />
                    </div>

                    <div className={styles.details}>
                        <h3 className={styles.title} onClick={() => navigate(`/product/${item.id}`)}>{item.name}</h3>
                        <div className={styles.ratingsDiv}>
                            <img src={`/images/ratings/rating-${item.rating.stars * 10}.png`} alt='rating' className={styles.ratingImg} />
                            <span className={styles.ratingsCount}>
                                {item.rating.count}
                            </span>
                            <span className={styles.price}>$&nbsp;{item.priceCents / 100}</span>
                            <img id={`wishList-${item.id}`} src={wishListProducts.find((itemObj) => itemObj.productId === item.id) ? HeartIconFilled : HeartIcon} alt='heart' className={styles.heartIcon} onClick={() => handleWishListIcon(item)} />
                        </div>
                        <div className={styles.cartSuccessMsg}>
                            <span className={styles.cartMsg} id={`cartMsg-${item.id}`}></span>
                        </div>
                    </div>

                    <button className={styles.button} onClick={() => handleAddToCart(item)}>Add to Cart</button>

                </div>
            ))}
            {showPopUp && <PopUp msg={popUpMsg} okFun={() => {
                if (popUpMsg.includes("cart") && !(popUpMsg.includes("login"))) {
                    navigate("/cart");
                } else {
                    navigate("/login");
                }
            }} closeFun={() => setShowPopUp(false)} />}
        </section>
    </>);
}
