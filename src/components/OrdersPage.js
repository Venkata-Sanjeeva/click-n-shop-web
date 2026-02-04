import { useEffect, useState } from 'react';
import styles from "../styles/OrdersPage.module.css";
import axios from 'axios';
import Navbar from './NavBar';
import Loader from './Loader';
import { v4 as uuidv4 } from 'uuid';
import PopUp from './PopUp';
import { useNavigate } from 'react-router-dom';
import productsData from "../supersimple-dev-products.json";

export default function OrdersPage() {

    const [userOrders, setUserOrders] = useState([]);

    const [isLoading, setIsLoading] = useState(true);

    const [showPopUp, setShowPopUp] = useState(false);

    const [popUpMessage, setPopUpMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {

        const userObj = JSON.parse(sessionStorage.getItem("user"));

        axios.get('http://localhost:8080/orders')
            .then(res => {

                const foundUser = (res.data || []).find(user => user.id === userObj.id);

                if (foundUser) {
                    axios.get(`http://localhost:8080/orders/${foundUser.id}`)
                        .then(res => {
                            const userOrdersIds = res.data.orderItems;

                            // axios.get("https://supersimplebackend.dev/products")
                            //     .then(res => {

                            //         const apiProducts = res.data;

                            //         const userOrdersArr = (apiProducts || []).filter(product => userOrdersIds.find(item => item.productId === product.id));

                            //         const updatedUserOrdersArr = userOrdersArr.map(product => ({ ...product, quantity: userOrdersIds.find(item => item.productId === product.id).quantity }));

                            //         setUserOrders([...updatedUserOrdersArr]);

                            //         setIsLoading(false);
                            //     })
                            //     .catch(err => console.log(err));
                            const apiProducts = productsData;

                            const userOrdersArr = (apiProducts || []).filter(product => userOrdersIds.find(item => item.productId === product.id));

                            const updatedUserOrdersArr = userOrdersArr.map(product => ({ ...product, quantity: userOrdersIds.find(item => item.productId === product.id).quantity }));

                            setUserOrders([...updatedUserOrdersArr]);

                            setIsLoading(false);
                        })
                        .catch(err => console.log(err));
                } else {
                    setIsLoading(false);
                }
            })
            .catch(err => console.log(err));

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

        const user = JSON.parse(sessionStorage.getItem("user"));

        const userOrderedProducts = userOrders.map(product => ({ productId: product.id, quantity: product.quantity }));

        const updatedUserOrders = userOrderedProducts.map(item => {
            if (item.productId === product.id) {
                if (operation === "+" && item.quantity < 10) {
                    return { ...item, quantity: item.quantity + 1 };
                } else if (operation === "-" && item.quantity > 1) {
                    return { ...item, quantity: item.quantity - 1 };
                }
            }
            return item;
        });

        axios.patch("http://localhost:8080/orders/" + user.id, { orderItems: [...updatedUserOrders] })
            .then(res => console.log(res.status))
            .catch(err => console.log(err));

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

        setUserOrders([...updatedUserOrdersArr]);
    }

    const handleRemoveProduct = (product) => {

        const ordersArr = userOrders.filter(item => item.id !== product.id);

        const user = JSON.parse(sessionStorage.getItem("user"));

        const filteredOrders = ordersArr.map(item => ({ productId: item.id }));

        axios.patch("http://localhost:8080/orders/" + user.id, { orderItems: [...filteredOrders] })
            .then(res => console.log(res.status))
            .catch(err => console.log(err));


        setUserOrders(ordersArr);
    }

    const handleConfirmOrder = (userOrdersArr) => {

        const sesionUser = JSON.parse(sessionStorage.getItem("user"));

        const date = new Date();
        const today = date.getDate();
        const month = date.getMonth() + 1; // Months are zero-based, so add 1
        const year = date.getFullYear();


        const dueDate = new Date(date);
        dueDate.setDate(date.getDate() + 7);

        const day7 = dueDate.getDate();
        const month0 = dueDate.getMonth() + 1; // Months are zero-based, so add 1
        const year0 = dueDate.getFullYear();


        const filteredUserOrders = userOrdersArr.map(product => ({ productId: product.id, quantity: product.quantity }));

        const orderObj = {
            "orderId": uuidv4(),
            "productsList": filteredUserOrders,
            "orderDate": `${today}/${month}/${year}`,
            "dueDate": `${day7}/${month0}/${year0}`,
            "totalPrice": calculateTotalPrice(userOrdersArr)
        };

        axios.get("http://localhost:8080/userOrders/")
            .then(res => {
                const apiOrderedUsers = res.data;

                const foundUser = apiOrderedUsers.find(user => user.id === sesionUser.id);

                if (foundUser) {
                    axios.get("http://localhost:8080/userOrders/" + sesionUser.id)
                        .then(res => {
                            const apiUserOrders = res.data.ordersList;

                            apiUserOrders.push(orderObj);

                            const userObj = { "id": sesionUser.id, "ordersList": [...apiUserOrders] };

                            axios.patch("http://localhost:8080/userOrders/" + sesionUser.id, userObj)
                                .then(res => {
                                    console.log(res.status);

                                    // this patch request is for updating order details in the orders 
                                    axios.patch("http://localhost:8080/orders/" + sesionUser.id, { orderItems: [] })
                                        .then(res => console.log(res.status))
                                        .catch(err => console.log(err));

                                    setUserOrders([]);
                                    setPopUpMessage("Order Confirmed");
                                    setShowPopUp(true);

                                })
                                .catch(err => console.log(err));

                        })

                } else {
                    axios.post("http://localhost:8080/userOrders/", { "id": sesionUser.id, "ordersList": [orderObj] })
                        .then(res => {
                            console.log(res.status);
                            axios.patch("http://localhost:8080/orders/" + sesionUser.id, { orderItems: [] })
                                .then(res => console.log(res.status))
                                .catch(err => console.log(err));

                            setUserOrders([]);

                            setPopUpMessage("Order Confirmed");
                            setShowPopUp(true);

                        })
                        .catch(err => console.log(err));
                }
            })
            .catch(err => console.log(err));

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

