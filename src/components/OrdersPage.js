import { useEffect, useState } from 'react';
import styles from "../styles/OrdersPage.module.css";
import axios from 'axios';
import Navbar from './NavBar';
import Loader from './Loader';
import { v4 as uuidv4 } from 'uuid';
import PopUp from './PopUp';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

export default function OrdersPage() {

    const [userOrders, setUserOrders] = useState([]);

    const [isLoading, setIsLoading] = useState(true);

    const [showPopUp, setShowPopUp] = useState(false);

    const [popUpMessage, setPopUpMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {

        const userObj = JSON.parse(sessionStorage.getItem("user"));

        if (userObj === null) {  // sessionStorage will result an array at first index 
            setPopUpMessage("Please login to add a product into cart.");
            setShowPopUp(true);
            return;
        }

        const userOrdersFromStorage = JSON.parse(sessionStorage.getItem("userOrders"));
        console.log(userOrdersFromStorage);

        if (userOrdersFromStorage !== null) {
            setUserOrders(userOrdersFromStorage);
        }
        setIsLoading(false);

    }, []);


    const calculateTotalDiscount = (userOrdersArr) => {

        const discountsOnEachProductsArr = userOrdersArr.map(product => product.rating.stars > 4.5 ? { discount: 25 } : { discount: 13 });

        const totalDiscount = discountsOnEachProductsArr.reduce((acc, product) => acc + product.discount, 0);

        return Math.floor(totalDiscount / userOrdersArr.length);

    };

    const calculateShippingCharges = (userOrdersArr) => {
        const totalPrice = userOrdersArr.reduce((acc, product) => (acc + product.priceCents / 100) * product.quantity, 0);

        return totalPrice > 100 ? 0 : 5;
    };


    const calculateTotalPrice = (userOrdersArr) => {
        const totalPrice = userOrdersArr.reduce((acc, product) => (acc + product.priceCents / 100) * product.quantity, 0);

        const discountPrice = totalPrice * (calculateTotalDiscount(userOrdersArr) / 100);

        const shippingPrice = calculateShippingCharges(userOrdersArr);

        return (totalPrice - discountPrice + shippingPrice).toFixed(2);
    };

    const calculateTotalSavedAmount = (ordersArr) => {
        const totalAmount = ordersArr.reduce((acc, product) => (acc + product.priceCents / 100) * product.quantity, 0);

        const totalPrice = calculateTotalPrice(ordersArr);

        return Math.abs(totalAmount - totalPrice).toFixed(2);
    };

    const handleQuantity = (product, operation) => {

        const updatedUserOrdersArr = userOrders.map(item => {
            if (item.id === product.id) {
                if (operation === "+" && item.quantity < 10) {
                    return { ...item, quantity: item.quantity + 1 };
                } else if (operation === "-" && item.quantity > 1) {
                    return { ...item, quantity: item.quantity - 1 };
                }
            }
            return item;
        });

        sessionStorage.setItem("userOrders", JSON.stringify(updatedUserOrdersArr));

        setUserOrders([...updatedUserOrdersArr]);
    }

    const handleRemoveProduct = (product) => {

        const ordersArr = userOrders.filter(item => item.id !== product.id);
        sessionStorage.setItem("userOrders", JSON.stringify(ordersArr));

        setUserOrders(ordersArr);
    }

    const handleConfirmOrder = (userOrdersArr) => {

        const sesionUser = JSON.parse(sessionStorage.getItem("user"));

        const filteredUserOrders = userOrdersArr.map(product => ({ productId: product.id, quantity: product.quantity, price: product.priceCents / 100 }));

        const orderObj = {
            "userUniqueId": sesionUser.uniqueId,
            "orderUniqueId": uuidv4(),
            "listOfProducts": filteredUserOrders
        };

        axios.post(`${API_URL}/orders/save`, orderObj)
            .then(res => {
                console.log(res.status);

                setUserOrders([]);

                setPopUpMessage("Order Confirmed");
                setShowPopUp(true);
                
            })
            .catch(err => console.log(err));
        sessionStorage.removeItem("userOrders");
    }


    return (<>
        <Navbar />
        <h1>Order Details</h1>
        {isLoading ? <Loader /> :
            <section className={styles.ordersPageSection}>
                {userOrders.length === 0 ? <h2>No Products added to Orders.</h2> :
                    <>
                        <div className={styles.productsContainer}>
                            <div className={styles.productsDiv}>
                                <h3>Order Summary</h3>
                                <>
                                    {userOrders.map((product, index) =>
                                        <div key={index} className={styles.productCard}>
                                            <div className={styles.imageContainer}>
                                                <img src={product.image} alt="product" />
                                            </div>

                                            <div className={styles.productDetails}>
                                                <p>{product.name}</p>
                                                <p>
                                                    Price:&nbsp;
                                                    <span style={{ color: "brown" }}>
                                                        ${(product.priceCents / 100).toFixed(2)}
                                                    </span>
                                                </p>
                                                <p>
                                                    Rating:&nbsp;
                                                    <span style={{ color: "brown" }}>
                                                        {product.rating.stars}
                                                    </span>
                                                </p>
                                                <p>
                                                    Quantity:&nbsp;
                                                    <span style={{ color: "brown" }}>{product.quantity}</span>
                                                </p>
                                            </div>

                                            <div className={styles.productButtons}>
                                                <div className={styles.quantityButtonsDiv}>
                                                    <button type='button' onClick={() => handleQuantity(product, "-")}>
                                                        -   {/* minus symbol */}
                                                    </button>
                                                    <p>{product.quantity}</p>
                                                    <button type='button' onClick={() => handleQuantity(product, "+")}>
                                                        +   {/* plus symbol */}
                                                    </button>
                                                </div>
                                                <button type='button' onClick={() => handleRemoveProduct(product)}>Remove</button>
                                            </div>
                                        </div>)
                                    }
                                </>
                            </div>

                            <div className={styles.confirmBookingDiv}>
                                <p className={styles.totalPriceTag}>
                                    Total Price: <span>$ {calculateTotalPrice(userOrders)}</span>
                                </p>
                                <button type='button' onClick={() => handleConfirmOrder(userOrders)}>Confirm Order</button>
                            </div>
                        </div>

                        <div className={styles.pricesContainer}>
                            <h3>Prices</h3>

                            <p>
                                Total Items:&nbsp;
                                <span>
                                    {userOrders.length}
                                </span>
                            </p>

                            <p>
                                Discount Applied: <span>{calculateTotalDiscount(userOrders)}%</span>
                            </p>

                            <p>
                                Shipping Charges: <span>${calculateShippingCharges(userOrders)}</span>
                            </p>

                            <p>
                                Total Saved Amount: <span>${calculateTotalSavedAmount(userOrders)}</span>
                            </p>
                        </div>
                    </>
                }
            </section>
        }
        {showPopUp && <PopUp msg={popUpMessage} okFun={() => navigate("/ordersDeliveryDetails")} closeFun={() => setShowPopUp(false)} />}
    </>);
}

