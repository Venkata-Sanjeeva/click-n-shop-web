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

    useEffect(() => {
        const userObj = JSON.parse(sessionStorage.getItem("user"));

        if(userObj && userObj.uniqueId) {
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
            }
    }, []);

    const handlePlaceOrder = (item) => {
        const userObj = JSON.parse(sessionStorage.getItem("user"));

        axios.get("http://localhost:8080/orders")
        .then(res => {
            const userFound = (res.data || []).find(user => user.id === userObj.id);
            if(userFound) {
                axios.get("http://localhost:8080/orders/" + userObj.id)
                .then(res => {
                    const orderProductIds = res.data.orderItems;

                    const productFound = orderProductIds.find(orderProduct => orderProduct.productId === item.id);
                    
                    if(!productFound) {
                        axios.patch("http://localhost:8080/orders/" + userObj.id, {orderItems: [...orderProductIds, {productId: item.id, quantity: 1}]})
                        .then(res => {
                            console.log(res.status);
                            setShowPopUp(true);
                            setPopUpMsg("Order Placed Successfully.");
                        })
                        .catch(err => console.error(err));

                        const updatedProducts = selectedProducts.filter(selectedProduct => selectedProduct.id !== item.id);
                        
                        // here we are updating cart items
                        axios.patch("http://localhost:8080/cart/" + userObj.id, {cartItems: updatedProducts.map(product => ({productId: product.id, quantity: 1}))});

                        setSelectedProducts(updatedProducts);
                    } else {
                        setShowPopUp(true);
                        setPopUpMsg("Product Already Added To Order");
                    }
                })
            } else {
                axios.post("http://localhost:8080/orders", {id: userObj.id, orderItems: [{productId: item.id, quantity: 1}]})
                .then(res => {
                    console.log(res.status);
                    setShowPopUp(true);
                    setPopUpMsg("Order Placed Successfully");
                })
                .catch(err => console.error(err));
            }
        }).catch(err => console.error(err));
    }


    const handleCancelOrder = (item) => {
        const userObj = JSON.parse(sessionStorage.getItem("user"));

        const removedCartProductsWithDetails = selectedProducts.filter(userWishListProduct => userWishListProduct.id !== item.id);

        const removedCartProducts = removedCartProductsWithDetails.map(product => ({productId: product.id}));

        axios.patch("http://localhost:8080/cart/" + userObj.id, {cartItems: removedCartProducts})
        .then(res => console.log(res.status))
        .catch(err => console.error(err));

        setSelectedProducts(removedCartProductsWithDetails);
    }

    return(<>
        <Navbar/>
        <h1>Cart Page</h1>
        {isLoading ? <Loader/> : 
        <section className={styles.cartSection}>

            {selectedProducts.length === 0 ? <h2>No Items Added To Cart.</h2> : selectedProducts.map((item, index) => {
                return(
                    <div key={item.id + index} className={styles.item} id={item.unique_id}>
                        <div className={styles.imageContainer}>
                            <img src={item.image} alt={item.unique_id}/>
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
                                    <button className={styles.placeOrderBtn} onClick={() => handlePlaceOrder(item)}>Place Order</button>
                                </div>
                                <div className={styles.cancelOrderDiv}>
                                    <button className={styles.placeOrderBtn} onClick={() => handleCancelOrder(item)}>Cancel Order</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        {showPopUp && <PopUp msg={popUpMsg} okFun={() => {
            if(popUpMsg.includes("Successfully")) {
                navigate("/orders");
            } else {
                setShowPopUp(false);
                setPopUpMsg("");
            }
        }} closeFun={() => {
            setShowPopUp(false);
            setPopUpMsg("");
        }}/>}

    </section>}
    </>);
}
