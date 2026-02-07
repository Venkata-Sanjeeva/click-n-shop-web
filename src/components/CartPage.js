import axios from 'axios';
import { useEffect, useState } from 'react';
import styles from '../styles/CartPage.module.css';
import Navbar from './NavBar';
import Loader from './Loader';
import PopUp from './PopUp';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

export default function CartPage() {

    const [selectedProducts, setSelectedProducts] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const [showPopUp, setShowPopUp] = useState(false);

    const [popUpMsg, setPopUpMsg] = useState("");

    const userObj = JSON.parse(sessionStorage.getItem("user"));

    useEffect(() => {

        if (userObj && userObj.uniqueId) {
            axios.get(`${API_URL}/cart/fetch/user/` + userObj.uniqueId)
                .then(res => {

                    const cartProductIds = res.data.cartItems;

                    axios.get("https://supersimplebackend.dev/products")
                        .then(res => {
                            const availableProducts = res.data;

                            const array = cartProductIds.map(cartProduct => {
                                const product = availableProducts.find(apiProduct => apiProduct.id === cartProduct.productId);
                                return product;
                            })

                            setSelectedProducts(array);
                            setIsLoading(false);
                        })
                        .catch(err => console.error(err));
                })
                .catch(err => console.error(err));
        } else {
            setPopUpMsg("Please login to add a product into cart.");
            setShowPopUp(true);
            return;
        }
    }, [userObj]);

    const handleAddItemToOrders = (item) => {
        let userOrders = JSON.parse(sessionStorage.getItem("userOrders")) || [];

        const existingItem = userOrders.find(prod => prod.id === item.id);

        if (existingItem) {
            // Item exists: Map through and increment quantity
            userOrders = userOrders.map(order =>
                order.id === item.id
                    ? { ...order, quantity: order.quantity + 1 }
                    : order
            );
        } else {
            // Item is new: Add it to the array
            userOrders = [...userOrders, { ...item, quantity: 1 }];
        }

        const updatedSelectedProducts = selectedProducts.filter(userProd => userProd.id !== item.id);
        setSelectedProducts([...updatedSelectedProducts]);


        axios.delete(`${API_URL}/cart/delete/${userObj.uniqueId}/${item.id}`)
            .then(res => console.log(res.status))
            .catch(err => console.error(err));

        setTimeout(() => {
            // Trigger a custom event that the Navbar is listening for
            window.dispatchEvent(new Event("cartUpdated"));
        }, 100);

        const updatedUserOrders = [...userOrders];

        sessionStorage.setItem("userOrders", JSON.stringify(updatedUserOrders));

        setShowPopUp(true);
        setPopUpMsg("Product Added to Orders Successfully");
    }


    const handleRemoveFromCart = (item) => {
        const userObj = JSON.parse(sessionStorage.getItem("user"));

        const removedCartProductsWithDetails = selectedProducts.filter(userWishListProduct => userWishListProduct.id !== item.id);

        axios.delete(`${API_URL}/cart/delete/${userObj.uniqueId}/${item.id}`)
            .then(res => {
                console.log(res.status);

                // Trigger a custom event that the Navbar is listening for
                window.dispatchEvent(new Event("cartUpdated"));
            })
            .catch(err => console.error(err));

        setSelectedProducts(removedCartProductsWithDetails);
    }

    return (<>
        <Navbar />
        <h1>Cart Page</h1>
        {isLoading ? <Loader /> :
            <section className={styles.cartSection}>

                {selectedProducts.length === 0 ? <h2>No Items Added To Cart.</h2> : selectedProducts.map((item, index) => {
                    return (
                        <div key={item.id + index} className={styles.item} id={item.unique_id}>
                            <div className={styles.imageContainer}>
                                <img src={item.image} alt={item.unique_id} />
                            </div>
                            <div className={styles.details}>
                                <h3 className={styles.title}>{item.name}</h3>
                                <div className={styles.ratingsDiv}>
                                    <img src={`/images/ratings/rating-${item.rating.stars * 10}.png`} alt='rating' className={styles.ratingImg} />
                                    <span className={styles.ratingsCount}>
                                        {item.rating.count}
                                    </span>
                                    Price: <span className={styles.price}>$&nbsp;{item.priceCents / 100}</span>
                                </div>

                                <div className={styles.productButtons}>
                                    <div className={styles.placeOrderDiv}>
                                        <button className={styles.placeOrderBtn} onClick={() => handleAddItemToOrders(item)}>Place Order</button>
                                    </div>
                                    <div className={styles.cancelOrderDiv}>
                                        <button className={styles.placeOrderBtn} onClick={() => handleRemoveFromCart(item)}>Remove</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
                {showPopUp && <PopUp msg={popUpMsg} okFun={() => {
                    if (popUpMsg.includes("Successfully")) {
                        navigate("/orders");
                    } else {
                        setShowPopUp(false);
                        setPopUpMsg("");
                    }
                }} closeFun={() => {
                    setShowPopUp(false);
                    setPopUpMsg("");
                }} />}

            </section>}
    </>);
}
