import React from 'react'

import styles from '../styles/Popup.module.css';

export default function PopUp({msg, okFun, closeFun}) {

    return (
        <div className={styles.popup}>
            <div className={styles.popupContent}>
                <span>
                    {msg.split("\n").map((word, index) => <span key={index}>{word} <br/></span>)}
                </span>
                <br/>
                <button className={styles.closeButton} onClick={closeFun}>X</button>
                <button className={styles.okButton} onClick={okFun}>Ok</button>
            </div>
        </div>
    );
}
