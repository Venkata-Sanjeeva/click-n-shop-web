import { useEffect, useState } from "react";
import styles from "../styles/ProductDetailsPage.module.css";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./NavBar";
import Loader from "./Loader";
import axios from "axios";
import PopUp from "./PopUp";

const API_URL = process.env.REACT_APP_API_URL;

export default function Product() {

    const { id } = useParams();
    const [product, setProduct] = useState(null);

    const navigate = useNavigate();

    const [showPopUp, setShowPopUp] = useState(false);
    const [popUpMsg, setPopUpMsg] = useState("");

    useEffect(() => {
        axios.get("https://supersimplebackend.dev/products")
            .then(res => {
                const apiProducts = res.data;
                const item = apiProducts.find((item) => item.id === id);
                setProduct({ ...item });
            })
    }, [id]);

    const handleAddToCart = (product) => {
        const userObj = JSON.parse(sessionStorage.getItem("user"));

        // Guard clause: ensure user exists
        if (!userObj) {
            setShowPopUp(true);
            setPopUpMsg("Please login to add items to the cart.");
            return;
        }

        const reqBody = {
            userUniqueId: userObj.uniqueId,
            cartItem: {
                productId: product.id,
                quantity: 1,
                price: product.priceCents / 100
            }
        };

        axios.post(`${API_URL}/cart/save`, reqBody)
            .then(res => {
                // EXECUTION ONLY ON SUCCESS (200 OK)
                console.log("Product saved to DB:", res.status);

                // Notify user
                setShowPopUp(true);
                setPopUpMsg("Product added to cart.");

                // Sync session storage if needed
                sessionStorage.setItem("product", JSON.stringify({ ...product }));

                // Trigger a custom event that the Navbar is listening for
                window.dispatchEvent(new Event("cartUpdated"));
            })
            .catch(err => {
                // EXECUTION ON FAILURE (400, 500, etc.)
                console.error("Cart save failed:", err);

                setShowPopUp(true);
                // Check if backend sent a specific error message
                const errorMsg = err.response?.data || err.message;
                setPopUpMsg("Could not add to cart: " + errorMsg);

                // Logic stops here; handleRemoveFromWishList is never called
            });
    };


    return (<>
        <Navbar />
        {!product ? <Loader /> : <div className={styles.container}>
            <div className={styles.productDetails}>
                <div className={styles.imageDiv}>
                    <img
                        src={"/" + product.image}
                        alt={product.title}
                        className={styles.productImage}
                    />
                </div>

                <div className={styles.details}>
                    <h1 className={styles.title}>{product.name}</h1>
                    {/* <p className={styles.productName}>{product.name}</p> */}
                    {/* <p className={styles.description}>{product.description}</p> */}
                    <p className={styles.price}>Price: $ {product.priceCents / 100}</p>
                    <div className={styles.rating}>
                        <span>
                            Rating: {product.rating.stars}  &nbsp;
                            <img src={`/images/ratings/rating-${product.rating?.stars * 10}.png`} alt="rating" className={styles.ratingImg} />
                        </span>
                        <span>({product.rating?.count} reviews)</span>
                    </div>
                    <button className={styles.addToCartButton} type="button" onClick={() => handleAddToCart(product)}>Add to Cart</button>
                </div>
            </div>
        </div>}
        {showPopUp && <PopUp msg={popUpMsg} okFun={() => {
            if (popUpMsg.includes("cart") && !(popUpMsg.includes("login"))) {
                navigate("/cart");
            } else {
                navigate("/login");
            }
        }} closeFun={() => setShowPopUp(false)} />}
    </>);
}
