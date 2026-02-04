import { useEffect, useState } from "react";
import styles from "../styles/ProductDetailsPage.module.css";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./NavBar";
import Loader from "./Loader";
import axios from "axios";
import PopUp from "./PopUp";
import productsData from "../supersimple-dev-products.json";

const API_URL = process.env.REACT_APP_API_URL;

export default function Product() {

    const { id } = useParams();
    const [product, setProduct] = useState(null);

    const [cartProducts, setCartProducts] = useState([]);

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

        axios.post(`${API_URL}/cart/save`, { userUniqueId: userObj.uniqueId, cartItem: { productId: product.id, quantity: 1, price: product.priceCents / 100 } });
        
        setShowPopUp(true);
        setPopUpMsg("Product added to cart.");

        setCartProducts([...availableCartProducts, { productId: product.id }]);

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
