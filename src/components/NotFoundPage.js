import React from 'react'
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
    return(<>
        <h1>404 Page Not Found</h1>
        <p>Sorry, the page you are looking for does not exist.</p>
        <Link to={"/"}>Go To Home</Link>
    </>);
}
