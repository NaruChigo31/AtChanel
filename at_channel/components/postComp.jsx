"use client"
import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation"
import styles from "./styles/threads.module.css";

import { redirect, RedirectType } from 'next/navigation'

import PostMedia from "./postMedia"

export default function PostComp({ postObj, isOp, boardTag, apiUrl }){

  const router = useRouter()

  function dateRefmat(date){    
    const daysList = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    const pivot = {
      "year": 2024,
      "month": 1,
      "day": 1,
    }

    let newDate = {
      "year": parseInt(date.slice(0,4)),
      "month": parseInt(date.slice(5,7)),
      "day": parseInt(date.slice(8, 10)),
      "time": date.split("T")[1].slice(0, 8)
    }

    let yearDiff = newDate["year"]-pivot["year"]
    let yearExtra = yearDiff*365 + parseInt(yearDiff/4)
    if (yearDiff > 0){
        yearExtra+=1
    }

    let monthList=[31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    if ((newDate["year"]/4 == parseInt(newDate["year"]/4))){
      monthList[1] = 29
    }
    let monthExtra = 0

    let i=0
    while (i < newDate["month"]-1 ){
      monthExtra += monthList[i]
      i++
    }

    let daysFrom = yearExtra+monthExtra+newDate["day"]-1
    const DAY = daysList[daysFrom%7]

    return `${date.slice(5,7)}/${date.slice(8, 10)}/${newDate["year"]}(${DAY})${newDate["time"]}`
  }

  return (
    <div className={ isOp ? styles.Op : styles.reply}>
      <div className={styles.postInfo}>
        <span className={styles.userName}>{postObj["userName"] ? postObj["userName"] : "Anonymous"} </span>
        {isOp &&
        <span className={styles.subject}>{postObj["title"]} </span>
        }
        <time className={styles.postDate} dateTime={postObj["createdAt"]} >{dateRefmat(postObj["createdAt"])} </time>
        {postObj["fileSavedName"] &&
          <a href={`${apiUrl}/uploads/${postObj["fileSavedName"]}`}>{postObj["fileSavedName"]}</a>
        }

      </div>
      <button>[reply]</button>
      { isOp &&
        <button onClick={()=>{
            router.push(`/${boardTag}/thread/${postObj["id"]}`)
        }} >[view all replies]</button>
      }
      <div className={styles.postMain}>
        { postObj["fileSavedName"] &&
          <PostMedia 
          fileUrl={`${apiUrl}/uploads/${postObj["fileSavedName"]}`} 
          fileName={postObj["fileSavedName"]} 
          isSpoiled={postObj["isSpoiler"]}
          isOp={isOp}/>
        }
        
        <p>{postObj["text"]}</p>

      </div>
    </div>
  )
}