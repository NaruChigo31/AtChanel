
import styles from "./boards.module.css";
import "../globals.css";

import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from "next/image";

const apiUrl = 'http://localhost:8000'

// prerendering functions with caching
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

async function getThreads(boardTag) {
  const res = await fetch(`${apiUrl}/board/${boardTag}/thread`, { method: "GET", cache: "no-store" });
  const data = await res.json();

  return data.threads;
}

async function getGif() {
  const res = await fetch(`${apiUrl}/getMenuGif`, { method: "GET", cache: "no-store" });
  const data = await res.json();
  return `${apiUrl}/${data}`;
}



// TODO, add stupid /100 days being not leap and /400 are leap 
// regional time change (UTC)

// date from request is given in ISO 8601
// I want to rewrite in more readable form with day name given
// pivot is gonna be 01/01/2024 as Monday
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


export default async function BoardPage({ params }) {
  const { boardTag } = params;
  
  const [boardList, board, threads, gif] = await Promise.all([
    getBoardList(),
    getBoard(boardTag),
    getThreads(boardTag),
    getGif(),
  ]);
  
  // console.log(threads[0]["replies"])

  return (
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

        
          <div className={styles.threadsUp}>
            <Link href={`${boardTag}/catalog`}>[Catalog]</Link>
            <Link href={`${boardTag}/archive`}>[Archive]</Link>
          </div>
          { threads && 
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
                      <time className={styles.postDate} datetime={threadInfo["createdAt"]} >{dateRefmat(threadInfo["createdAt"])}</time>
                      
                      <span>[reply]</span>

                    </div>

                    <div className={styles.postMain}>
                      <img className={styles.threadImage} src={`${apiUrl}/uploads/${threadInfo["fileSavedName"]}`} alt={threadInfo["fileSavedName"]}/>
                      <span>{threadInfo["text"]}</span>
                    </div>

                  </div>
                  { replies &&
                  <div className={styles.replies}>
                    {replies.map((reply, idx)=>{

                      return (
                        <div className={styles.reply}>
                          <div className={styles.postInfo}>
                            <span className={styles.userName}>{reply["userName"] ? reply["userName"] : "Anonymous"} </span>
                            <time className={styles.postDate} datetime={reply["createdAt"]} >{dateRefmat(reply["createdAt"])}</time>
                      
                            <span>[reply]</span>

                          </div>
                          <div className={styles.postMain}>
                            { reply["fileSavedName"] &&
                            <img className={styles.replyImage} src={`${apiUrl}/uploads/${reply["fileSavedName"]}`} alt={reply["fileSavedName"]}/>
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
          }
          <div className={styles.threadsBottom}></div>
        </div>
    </main>
  )
}