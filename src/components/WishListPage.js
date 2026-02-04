import { useEffect, useState } from 'react'
import Navbar from './NavBar';
import axios from 'axios';
import styles from "../styles/WishListPage.module.css";
import Loader from './Loader';
import PopUp from './PopUp';
import { useNavigate } from 'react-router-dom';
import productsData from "../supersimple-dev-products.json";

const API_URL = process.env.REACT_APP_API_URL;

export default function WishListPage() {

    const [isLoading, setIsLoading] = useState(true);

    const [userWishListProducts, setUserWishListProducts] = useState([]);

    const [userCartProducts, setUserCartProducts] = useState([]);

    const navigate = useNavigate();

    const [popUpMsg, setPopUpMsg] = useState("");
    const [showPopUp, setShowPopUp] = useState(false);

    useEffect(() => {
        const userObj = JSON.parse(sessionStorage.getItem("user"));

        if (userObj && userObj.uniqueId) {
            axios.get(`${API_URL}/wishList/fetch/user/${userObj.uniqueId}`)
                .then(res => {
                    const userWishList = res.data.wishListProducts;

                    // axios.get("https://supersimplebackend.dev/products")
                    //     .then(response => {
                    //         const apiProducts = response.data;
                    //         const userWishListProductsArr = userWishList.map(wishListProduct => {
                    //             const product = apiProducts.find(apiProduct => apiProduct.id === wishListProduct.productId);
                    //             return product;
                    //         })

                    //         setUserWishListProducts([...userWishListProductsArr]);
                    //         setIsLoading(false);
                    //     })
                    //     .catch(err => console.log(err));
                    const apiProducts = productsData;
                    const userWishListProductsArr = userWishList.map(wishListProduct => {
                        const product = apiProducts.find(apiProduct => apiProduct.id === wishListProduct.productId);
                        return product;
                    })

                    setUserWishListProducts([...userWishListProductsArr]);
                    setIsLoading(false);
                })
                .catch(err => console.log(err));


            axios.get(`${API_URL}/cart/fetch/user/${userObj.uniqueId}`)
                .then(res => {
                    const userCart = res.data.cartItems;
                    setUserCartProducts([...userCart]);
                })
                .catch(err => console.log(err));

        }


    }, []);

    const handleAddToCart = (product) => {
        const userObj = JSON.parse(sessionStorage.getItem("user"));

        sessionStorage.setItem("product", JSON.stringify({ ...product }));

        const availableCartProducts = [...userCartProducts];

        axios.post(`${API_URL}/cart/save`, { userUniqueId: userObj.uniqueId, cartItem: { productId: product.id, quantity: 1, price: product.priceCents / 100 } });

        setUserCartProducts([...availableCartProducts, { productId: product.id }]);

        handleRemoveFromWishList(product);

        setShowPopUp(true);
        setPopUpMsg("Product added to cart.");
    };

    const handleRemoveFromWishList = (product) => {
        const userObj = JSON.parse(sessionStorage.getItem("user"));

        const removedWishListProductsWithDetails = userWishListProducts.filter(userWishListProduct => userWishListProduct.id !== product.id);

        axios.delete(`${API_URL}/wishList/delete/` + userObj.uniqueId + "/" + product.id);

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
