"use client"
import { useState, useEffect } from 'react';
import styles from "./styles/threads.module.css";

import { redirect, RedirectType } from 'next/navigation'

import PostMedia from "./postMedia"
import PostComp from './postComp';

export default function Thread({ threads, apiUrl, boardTag }){

    return (
        <div className={styles.threads}>
          {threads.map((thread, idx) =>{
            let threadInfo = thread["thread"] 
            let replies = thread["replies"]
          


            return(
              // if index is 0 or even, then left one
              <div className={[(idx%2 !=0) ? styles.right: styles.left, styles.thread].join(' ')} key={idx}>
                <PostComp postObj={threadInfo} isOp={true} boardTag={boardTag} apiUrl={apiUrl}/>
                {/* <div className={styles.Op}>
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
                    
                    <p>{threadInfo["text"]}</p>
                  </div>
                </div> */}
                { replies &&
                <div className={styles.replies}>
                  {replies.map((reply, idx)=>{
                    
                    return (
                      <PostComp key={idx} postObj={reply} isOp={false} boardTag={boardTag} apiUrl={apiUrl}/>
                      // <div key={idx} className={styles.reply}>
                      //   <div className={styles.postInfo}>
                      //     <span className={styles.userName}>{reply["userName"] ? reply["userName"] : "Anonymous"} </span>
                      //     <time className={styles.postDate} datetime={reply["createdAt"]} >{dateRefmat(reply["createdAt"])}</time>
                    
                      //     <button>[reply]</button>
                      //   </div>
                      //   <div className={styles.postMain}>
                      //     { reply["fileSavedName"] &&
                      //     <PostMedia fileUrl={`${apiUrl}/uploads/${reply["fileSavedName"]}`} fileName={reply["fileSavedName"]} isSpoiled={reply["fileSavedName"]}/>
                      //     }
                      //     <span>{reply["text"]}</span>
                      //   </div>
                      // </div>
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