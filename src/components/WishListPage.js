import { useEffect, useState } from 'react'
import Navbar from './NavBar';
import axios from 'axios';
import styles from "../styles/WishListPage.module.css";
import Loader from './Loader';
import PopUp from './PopUp';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

export default function WishListPage() {

    const [isLoading, setIsLoading] = useState(true);

    const [userWishListProducts, setUserWishListProducts] = useState([]);

    const navigate = useNavigate();

    const [popUpMsg, setPopUpMsg] = useState("");
    const [showPopUp, setShowPopUp] = useState(false);

    useEffect(() => {
        const userObj = JSON.parse(sessionStorage.getItem("user"));

        if (userObj && userObj.uniqueId) {
            axios.get(`${API_URL}/wishList/fetch/user/${userObj.uniqueId}`)
                .then(res => {
                    const userWishList = res.data.wishListProducts;

                    axios.get("https://supersimplebackend.dev/products")
                        .then(response => {
                            const apiProducts = response.data;
                            const userWishListProductsArr = userWishList.map(wishListProduct => {
                                const product = apiProducts.find(apiProduct => apiProduct.id === wishListProduct.productId);
                                return product;
                            })

                            setUserWishListProducts([...userWishListProductsArr]);
                            setIsLoading(false);
                        })
                        .catch(err => console.log(err));
                })
                .catch(err => console.log(err));


            axios.get(`${API_URL}/cart/fetch/user/${userObj.uniqueId}`)
                .then(res => {
                    console.log(res.status);
                })
                .catch(err => console.log(err));

        }


    }, []);

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

                // Remove from wishlist only after successful cart addition
                handleRemoveFromWishList(product);

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

    const handleRemoveFromWishList = (product) => {
        const userObj = JSON.parse(sessionStorage.getItem("user"));

        const removedWishListProductsWithDetails = userWishListProducts.filter(userWishListProduct => userWishListProduct.id !== product.id);

        axios.delete(`${API_URL}/wishList/delete/` + userObj.uniqueId + "/" + product.id)
            .then(res => {
                console.log(res.status);
                // Trigger a custom event that the Navbar is listening for
                window.dispatchEvent(new Event("cartUpdated"));
            })
            .catch(err => console.log(err));

        setUserWishListProducts([...removedWishListProductsWithDetails]);
    }


    return (<>
        <Navbar />
        <h1>Wish List Page</h1>
        {isLoading ? <Loader /> : <section className={styles.wishListSection}>
            {
                userWishListProducts.length === 0 ? <h2>No products in wish list.</h2> :
                    userWishListProducts.map((product, index) =>
                        <div key={index} className={styles.productCard}>
                            <div className={styles.productImage}>
                                <img src={product.image} alt={product.title} />
                            </div>
                            <div className={styles.productInfo}>
                                <h3 className={styles.productTitle}>{product.name}</h3>
                                <div className={styles.productDetails}>
                                    <p>${product.priceCents / 100}</p>
                                    <p className={styles.priceDetails}>
                                        <span className={styles.stars}>
                                            <img src={`/images/ratings/rating-${product.rating.stars * 10}.png`} alt='rating' />
                                        </span>
                                        {product.rating.stars}
                                    </p>
                                    <p>{product.rating.count}</p>
                                </div>
                            </div>
                            <div className={styles.productButtons}>
                                <button type='button' onClick={() => handleAddToCart(product)}>Add to Cart</button>
                                <button type='button' onClick={() => handleRemoveFromWishList(product)}>Remove</button>
                            </div>
                        </div>
                    )
            }
            {showPopUp && <PopUp msg={popUpMsg} okFun={() => navigate("/cart")} closeFun={() => setShowPopUp(false)} />}
        </section>}

    </>);
}
