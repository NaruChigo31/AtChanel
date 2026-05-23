// "use client"

import Image from "next/image";
import Link from 'next/link'
import styles from "./index.module.css";
import "../app/globals.css";
import { useState, useEffect } from 'react';



const apiUrl = 'http://localhost:8000'
// const apiUrl = process.env.API_URL

// export const getServerSideProps = (async ()=>{
//   const res = await fetch(`${apiUrl}/getMenuGif`);
//   const data = await res.json();
// })

export default function Home() {

  const [boards, setBoards] = useState()
  const [gif, setGif] = useState()

  function getGifs(){
    fetch(`${apiUrl}/getMenuGif`,{
      method: "GET"
    })
    .then(res => res.json())
    .then(
      async (data) => {
        setGif(`${apiUrl}/${await data}`)
      }
    )
  }

  function getBoards(){
    fetch(`${apiUrl}/board`,{
      method: "GET"
    })
    .then((res)=>(res.json()))
    .then(
      async (data) =>{
        if(!data.error){
          setBoards(await data.boards)
          // console.log(typeof(data.boards))
          console.log(data.boards)
        } else{
          console.error(data.error)
          // throw Error("No data")
        }
      }
    )
  }


  useEffect(() =>{getGifs()},[])
  useEffect(() =>{getBoards()},[])

  return (
    <main>
      <header>
          <h2 className={styles.logo}>@Channel</h2>
      </header>
      <div className={styles.main}>
        { gif &&
          <img className={styles.mainGif} src={`${gif}`} alt="Some anime girl gif"/>
        }

        <h1>Wellcome user :3</h1>
        <div className={styles.infoNavigation}>

          <div className={styles.info}>

            <div className={styles.infoNavTitle}>
              <h4>About</h4>
            </div>

            <div className={styles.infoContent}>
              <h3>What is <span>@channel</span>?</h3>
              <h4>It’s image-board where you can share your ideas as anonim and comment others</h4>
              <h4>You can share any info if it’s suitable for the board and doesn’t break laws</h4>
            </div>

            <div className={styles.infoNavTitle}>
              <h4>News of @channel</h4>
            </div>

          </div>

          <div className={styles.navigation}>
            {/* <img className={styles.logoImage} src="logo.png" alt="logo"/> */}

            <div className={styles.infoNavTitle}>
              <h4>Boards</h4>
            </div>
            { boards &&
            <div className={styles.navContent}>
                {boards.map((board, idx) =>{
                  return (
                    <Link key={idx} href={board.tag}>/{board.tag}/ - {board.topic}</Link>
                  )
                })}
                {/* to be removed  */}
              {/* <Link href="/b">/b/ - random</Link>
              <Link href="/v">/v/ - Video Games</Link>
              <Link href="/e">/e/ - Ecchi</Link>
              <Link href="/pash">/pash/ - pashtet lore</Link> */}
            </div>
            } 
            <div className={styles.infoNavTitle}>
              <h4>Extra info</h4>
            </div>
            <div className={styles.navContent}>
              <Link href="/rules">rules</Link>
              <Link href="/faq">faq</Link>
              <Link href="/admin">admin</Link>
            </div>


          </div>
        </div>
      </div>
      <footer>
          <h2>@channel by freeCum comp.</h2>
      </footer>
    </main>
  );
}
