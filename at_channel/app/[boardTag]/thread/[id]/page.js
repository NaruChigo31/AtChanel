import styles from "../../boards.module.css";
import "@/app/globals.css";

import { redirect } from 'next/navigation'
import ReplyForm from "@/components/ReplyForm"
import Threads from "@/components/threads"
import PostMedia from "@/components/postMedia";
import PostComp from "@/components/postComp";


import Link from 'next/link'
import Image from "next/image"


const apiUrl = 'http://localhost:8000'

async function getThreadData(id) {
  const res = await fetch(`${apiUrl}/thread/${id}`, { method: "GET", cache: "no-store" });
  const data = await res.json();

  // console.log(data.thread)
  console.log(data.replies)
  return data;
}

async function getBoardList() {
  const res = await fetch(`${apiUrl}/board`, { method: "GET", cache: "force-cache" });
  const data = await res.json();

  return data.boards;
}

async function getBoard(boardTag) {
  const res = await fetch(`${apiUrl}/board/${boardTag}`, { method: "GET", cache: "force-cache" });
  const data = await res.json();
  
  if(data.error){
    redirect('/errorPage')
  }
  return data.board;
}

async function getGif() {
  const res = await fetch(`${apiUrl}/getMenuGif`, { method: "GET", cache: "no-store" });
  const data = await res.json();
  return `${apiUrl}/${data}`;
}



export default async function ThreadPage({ params }) {
    const { boardTag,id } = params

    
    const [boardList, board, threadData, gif] = await Promise.all([
      getBoardList(),
      getBoard(boardTag),
      getThreadData(id),
      getGif(),
    ]);

    // console.log(threadData)
    // console.log(getThreadData(id)["thread"])
  
    return(
      <main>
        <header>
          <h2>@Channel</h2>
          <p className={styles.tagInHeader}>[ {boardList.map((board, idx) =>{
              return(
                <Link className={styles.tagInHeader} key={idx} href={board.tag}>{board.tag}/ </Link>
              )
          })} ]</p>
        </header>
        <div className={styles.boardMain}>

          <img className={styles.boardGif} src={`${gif}`} alt="Some anime girl gif"/>

          <div className={styles.boardInfo}>
              <h1>/{board.tag}/ - {board.topic}</h1>
              <p>{board.description}</p>
          </div>

          <ReplyForm boardTag={boardTag} threadId={id} apiUrl={apiUrl}/>

          <div className={styles.threadsUp}>
              <Link href={`${boardTag}/catalog`}>[Catalog]</Link>
              <Link href={`${boardTag}/archive`}>[Archive]</Link>
          </div>
          { threadData && 
          <div>
            <PostComp postObj={threadData.thread} isOp={true} boardTag={boardTag} apiUrl={apiUrl}/>
            { threadData.replies &&
            <div>
              {threadData.replies.map((reply, idx)=>{
                return(
                  <PostComp index={idx} postObj={reply["reply"]} boardTag={boardTag} apiUrl={apiUrl}/>
                )
              })}
            </div>
            }
          </div>
          }
          <div className={styles.threadsBottom}></div>
        </div>
      </main>
    )
}