import styles from "./boards.module.css";
import "@/app/globals.css";

import { redirect } from 'next/navigation'
import ThreadForm from "@/components/threadForm"
import Threads from "@/components/threads"

import Link from 'next/link'
import Image from "next/image"


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



export default async function BoardPage({ params }) {
  const { boardTag } = params;

  const [boardList, board, threads, gif] = await Promise.all([
    getBoardList(),
    getBoard(boardTag),
    getThreads(boardTag),
    getGif(),
  ]);

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

        <ThreadForm boardTag={boardTag} apiUrl={apiUrl}/>

        
        <div className={styles.threadsUp}>
            <Link href={`${boardTag}/catalog`}>[Catalog]</Link>
            <Link href={`${boardTag}/archive`}>[Archive]</Link>
        </div>
        { threads && 
        <Threads threads={threads} apiUrl={apiUrl} boardTag={boardTag}/>
        }
        <div className={styles.threadsBottom}></div>
      </div>
    </main>
  )
}