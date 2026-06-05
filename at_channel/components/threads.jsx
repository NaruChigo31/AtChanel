"use client"
import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation"
import styles from "./threads.module.css";

import { redirect, RedirectType } from 'next/navigation'

import PostMedia from "./postMedia"


export default function Thread({ threads, apiUrl, boardTag }){

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
        <div className={styles.threads}>
          {threads.map((thread, idx) =>{
            let threadInfo = thread["thread"] 
            let replies = thread["replies"]
          


            return(
              // if index is 0 or even, then left one
              <div className={[(idx%2 !=0) ? styles.right: styles.left, styles.thread].join(' ')} key={idx}>
                <div className={styles.Op}>
                  <div className={styles.postInfo}>
                    <span className={styles.userName}>{threadInfo["userName"] ? threadInfo["userName"] : "Anonymous"} </span>
                    <span className={styles.subject}>{threadInfo["title"]} </span>
                    <time className={styles.postDate} dateTime={threadInfo["createdAt"]} >{dateRefmat(threadInfo["createdAt"])}</time>
                    
                    <button>[reply]</button>
                    <button onClick={()=>{
                      router.push(`/${boardTag}/thread/${threadInfo["id"]}`)
                    }} >[view all replies]</button>
                  </div>
                  <div className={styles.postMain}>
                    <PostMedia 
                    fileUrl={`${apiUrl}/uploads/${threadInfo["fileSavedName"]}`} 
                    fileName={threadInfo["fileSavedName"]} 
                    isSpoiled={threadInfo["isSpoiler"]}
                    isOp={true}/>
                    
                    <span>{threadInfo["text"]}</span>
                  </div>
                </div>
                { replies &&
                <div className={styles.replies}>
                  {replies.map((reply, idx)=>{
                    
                    return (
                      <div key={idx} className={styles.reply}>
                        <div className={styles.postInfo}>
                          <span className={styles.userName}>{reply["userName"] ? reply["userName"] : "Anonymous"} </span>
                          <time className={styles.postDate} datetime={reply["createdAt"]} >{dateRefmat(reply["createdAt"])}</time>
                    
                          <button>[reply]</button>
                        </div>
                        <div className={styles.postMain}>
                          { reply["fileSavedName"] &&
                          <PostMedia fileUrl={`${apiUrl}/uploads/${reply["fileSavedName"]}`} fileName={reply["fileSavedName"]} isSpoiled={reply["fileSavedName"]}/>
                          }
                          <span>{reply["text"]}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                }
              </div>
            )
          })}
        </div>
    )
}