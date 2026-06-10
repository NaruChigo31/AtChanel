"use client"
import { useState, useEffect } from 'react';
import styles from "./styles/threads.module.css";

import { redirect, RedirectType } from 'next/navigation'


import PostComp from './postComp';
import ReplyForm from "./replyForm"

export default function Thread({ threads, apiUrl, boardTag }){
  
  const [replyToID, setReplyToID] = useState(null)
  const [replyIDs, setReplyIDs] = useState([])
  const [modalHid, setModalHid] = useState(true)
  // https://react.dev/learn/updating-arrays-in-state

  
  function hui(threadID, directID) {
    console.log(`Reply to thread ${threadID}`)
    console.log(replyIDs, directID)
    console.log(modalHid)
    if (replyToID === threadID){
      if(!replyIDs.includes(directID)){
        setReplyIDs([...replyIDs, directID])
      }
    } else{
      setReplyToID(threadID)
      setReplyIDs([])
    }

    setModalHid(false)
  }

  return (
      <div className={styles.threads}>
        <ReplyForm 
        boardTag={boardTag} 
        threadId={replyToID} 
        directReplyIds={replyIDs} 
        apiUrl={apiUrl}
        hidden={modalHid} 
        onClose={() => {
          setModalHid(true)
        }}/>
        
        {threads.map((thread, idx) =>{
          let threadInfo = thread["thread"] 
          let replies = thread["replies"]
        
          return(
            // if index is 0 or even, then left one
            <div className={[(idx%2 !=0) ? styles.right: styles.left, styles.thread].join(' ')} key={idx}>
              <PostComp postObj={threadInfo} isOp={true} boardTag={boardTag} apiUrl={apiUrl} replyFunc={()=>{hui(threadInfo["id"], threadInfo["id"])}}/>
              { replies &&
              <div className={styles.replies}>
                {replies.map((reply, idx)=>{
                  return (
                    <PostComp key={idx} postObj={reply} isOp={false} boardTag={boardTag} apiUrl={apiUrl} replyFunc={()=>{hui(threadInfo["id"], reply["id"])}}/>
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