import React from 'react';
import ReactDOM from 'react-dom/client';
// import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import "react-router-dom";
import { createBrowserRouter, Link, RouterProvider } from 'react-router-dom';
import HomePage from './components/HomePage';
import OrdersPage from './components/OrdersPage';
import CartPage from './components/CartPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import NotFoundPage from './components/NotFoundPage';
import Product from './components/Product';
import ForgotPassword from './components/ForgotPassword';
import ProfilePage from './components/ProfilePage';
import WishListPage from './components/WishListPage';
import UserOrdersPage from './components/UserOrdersPage';

const root = ReactDOM.createRoot(document.getElementById('root'));
const routes = createBrowserRouter([
  // {path: "/", element: <Link to={"/home"}>Go To Home</Link>},
  // {path: "/app", element: <App />},
  {path: "/", element: <HomePage />},
  {path: "/product/:id", element: <Product />},
  {path: "/orders", element: <OrdersPage />},
  {path: "/wishlist", element: <WishListPage />},
  {path: "/cart", element: <CartPage />},
  {path: "/ordersDeliveryDetails", element: <UserOrdersPage />},
  {path: "/profile/:userId", element: <ProfilePage />},
  {path: "/login", element: <LoginPage />},
  {path: "/resetPassword", element: <ForgotPassword />},
  {path: "/register", element: <RegisterPage />},
  {path: "*", element: <NotFoundPage />}
]);
root.render(
  <React.StrictMode>
    <RouterProvider router={routes} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
