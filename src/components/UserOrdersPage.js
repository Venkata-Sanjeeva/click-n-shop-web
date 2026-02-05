import { useEffect, useState } from 'react'
import Navbar from './NavBar';
import styles from '../styles/UserOrdersPage.module.css';
import axios from 'axios';
import Loader from './Loader';

export default function UserOrdersPage() {

    const [currentUserOrders, setCurrentUserOrders] = useState([]);

    const [pastUserOrders, setPastUserOrders] = useState([]);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const userObj = JSON.parse(sessionStorage.getItem("user"));

        axios.get("http://localhost:8080/userOrders/")
        .then(res => {
            const apiOrderedUsers = res.data;

            const foundUser = apiOrderedUsers.find(user => user.id === userObj.id);
            

            if(foundUser) {
                axios.get("http://localhost:8080/userOrders/" + userObj.id)
                .then(res => {
                    const apiUserOrders = res.data.ordersList;

                    const currentOrders = apiUserOrders.filter(order => (Number.parseInt(order.dueDate.substring(0, 2)) >= Number.parseInt(new Date().getDate())));
                    
                    const pastOrders = apiUserOrders.filter(order => (Number.parseInt(order.dueDate.substring(0, 2)) < Number.parseInt(new Date().getDate())));

                    axios.get("https://supersimplebackend.dev/products")
                    .then(res => {

                        const apiProducts = res.data;

                        const currentOrdersWithProducts = currentOrders.map(order => {
                            
                            const orderProducts = order.productsList.map((product) => {
                                const foundProduct = apiProducts.find((item) => item.id === product.productId);
                                return foundProduct ? { ...foundProduct, quantity: product.quantity } : null; // Return null if not found
                            }).filter(Boolean); // Optionally filter out null values

                            return({orderId: order.orderId, orderDate: order.orderDate, dueDate: order.dueDate, productsList: orderProducts});
                        });

                        const pastOrdersWithProducts = pastOrders.map((order) => {
                            
                            const orderProducts = order.productsList.map((product) => {
                                const foundProduct = apiProducts.find((item) => item.id === product.productId);
                                return foundProduct ? { ...foundProduct, quantity: product.quantity } : null; // Return null if not found
                            }).filter(Boolean); // Optionally filter out null values

                            return({orderId: order.orderId, orderDate: order.orderDate, dueDate: order.dueDate, productsList: orderProducts});
                        })

                        setIsLoading(false);

                        setCurrentUserOrders(currentOrdersWithProducts);
                        setPastUserOrders(pastOrdersWithProducts);

                    })
                    .catch(err => console.log(err));
                })
                .catch(err => console.log(err));

            } else {
                setCurrentUserOrders([]);
                setIsLoading(false);
            }
        })
        .catch(err => console.log(err));

    }, []);


    return (<>
        <Navbar />
        <h1>Orders Delivery Details</h1>
        <>
            {
                isLoading ? <Loader /> : currentUserOrders.length === 0 ? <h2>No products found.</h2> : <section className={styles.ordersDeliveryDetails}>

                    <div className={styles.currentOrdersDiv}>
                        {
                            currentUserOrders.map(order => {

                                return (
                                    <div className={styles.ordersContainer} key={order.orderId}>
                                        <div className={styles.datesContainer}>
                                            <h4 style={{ fontSize: "1.2rem" }}>
                                                Ordered Date: &nbsp;
                                                <span style={{ fontSize: "0.9rem", fontWeight: "normal" }}>
                                                    {order.orderDate}
                                                </span>
                                            </h4>

                                            <h4 style={{ fontSize: "1.2rem" }}>
                                                Delivery Date: &nbsp;
                                                <span style={{ fontSize: "0.9rem", fontWeight: "normal" }}>
                                                    {order.dueDate}
                                                </span>
                                            </h4>
                                        </div>
                                        {
                                            order.productsList.map(product => {
                                                return (
                                                    <div className={styles.productCard} key={product.id}>
                                                        <div className={styles.imgContainer}>
                                                            <img src={product.image} alt="product" />
                                                        </div>

                                                        <div className={styles.productDetailsContainer}>
                                                            <div className={styles.productDetailsDiv}>
                                                                <h3>{product.name}</h3>
                                                                <p>Quantity: {product.quantity}</p>
                                                                <p>Price: ${product.priceCents / 100}</p>
                                                            </div>

                                                            <div className={styles.deliveryStatusDiv}>
                                                                <p>
                                                                    Status: &nbsp;
                                                                    <span>
                                                                        {Number.parseInt(order.orderDate.substring(0, 2)) === Number.parseInt(new Date().getDate()) ? "Order Recieved" : Number.parseInt(order.dueDate.substring(0, 2)) === Number.parseInt(new Date().getDate()) ? "Delivered" : "In Transit"}
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                )
                            })}
                    </div>

                    {pastUserOrders.length > 0 && <div className={styles.pastOrdersDiv}>
                        <h2>Order History</h2>
                        {console.log(pastUserOrders)}
                        {
                            pastUserOrders.map(order => {

                                return (
                                    <div className={styles.ordersContainer} key={order.orderId}>
                                        <div className={styles.datesContainer}>
                                            <h4 style={{ fontSize: "1.2rem" }}>
                                                Ordered Date: &nbsp;
                                                <span style={{ fontSize: "0.9rem", fontWeight: "normal" }}>
                                                    {order.orderDate}
                                                </span>
                                            </h4>

                                            <h4 style={{ fontSize: "1.2rem" }}>
                                                Delivery Date: &nbsp;
                                                <span style={{ fontSize: "0.9rem", fontWeight: "normal" }}>
                                                    {order.dueDate}
                                                </span>
                                            </h4>
                                        </div>
                                        {
                                            order.productsList.map(product => {
                                                return (
                                                    <div className={styles.productCard} key={product.id}>
                                                        <div className={styles.imgContainer}>
                                                            <img src={product.image} alt="product" />
                                                        </div>

                                                        <div className={styles.productDetailsContainer}>
                                                            <div className={styles.productDetailsDiv}>
                                                                <h3>{product.name}</h3>
                                                                <p>Quantity: {product.quantity}</p>
                                                                <p>Price: ${product.priceCents / 100}</p>
                                                            </div>

                                                            <div className={styles.deliveryStatusDiv}>
                                                                <p>
                                                                    Status: &nbsp;
                                                                    <span>
                                                                        Delivered
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                )
                            })}
                    </div>
                    }
                </section>
            }
        </>
    </>);
}
