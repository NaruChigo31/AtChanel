"use client"
import { useState, useEffect } from 'react';
import styles from "./threads.module.css";

export default function PostMedia({ fileUrl, fileName, isSpoiled }){
  
    if (!isSpoiled){
      return (
        <img className={styles.threadImage}
        src={fileUrl} 
        alt={fileName}
        />
      )
    } else{

      const [ spoiler, setSpoiler ] = useState(false)

      return (
        <img className={styles.threadImage}
        onClick={()=>{
          setSpoiler(!spoiler)
        }} 
        src={spoiler ? fileUrl : "images/spoiler.png"} 
        alt={fileName}
        />
      )
    }

}