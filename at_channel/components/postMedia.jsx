"use client"
import { useState } from 'react';
import styles from "./styles/postMedia.module.css";

export default function PostMedia({ fileUrl, fileName, isSpoiled, isOp }){

  const [magnified, setMagnified] = useState(false)

    function postTypeStyling(){
      return isOp ? styles.threadMedia : styles.replyMedia
    }

    if (!isSpoiled){
      return (
        <div className={styles.imageContainer} >
          <img className={postTypeStyling()}
          src={fileUrl} 
          alt={fileName}
          />
          <button onClick={()=>{
            setMagnified(true)
          }} >Magn</button>

          {/* modal wrapper */}
          <div
            className={ !magnified ? styles.hid : styles.modalWrap} 
            onClick={()=>{
              setMagnified(false)
            }} 
            >
            <div
              className={styles.magnMedia}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={fileUrl}
                alt={fileName}
              />
            </div>
          </div>

        </div>
      )
    } else{

      const [ spoiler, setSpoiler ] = useState(false)

      return (
        <div className={styles.imageContainer} >

          <a href={fileUrl}>{fileName}</a>
          <div>
            <img className={postTypeStyling()}
            onClick={()=>{
              setSpoiler(!spoiler)
            }} 
            src={spoiler ? fileUrl : "images/spoiler.png"} 
            alt={fileName}
            />
            <button onClick={()=>{
              setMagnified(true)
            }} >Magn</button>
          </div>


          {/* modal wrapper */}
          <div
            className={ !magnified ? styles.hid : styles.modalWrap} 
            onClick={()=>{
              setMagnified(false)
            }} 
            >
            <div
              className={styles.magnMedia}
              onClick={(e) => e.stopPropagation()}
            >
              <img
              onClick={()=>{
                setSpoiler(!spoiler)
              }} 
              src={spoiler ? fileUrl : "images/spoiler.png"} 
              alt={fileName}
              />
            </div>
          </div>

        </div>
      )
    }

}