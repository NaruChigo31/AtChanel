"use client"
import { useState, useEffect } from 'react';
import styles from "./styles/replyForm.module.css";

import { useRouter } from "next/navigation"


const allowedTypes = [
  // Images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
  "image/heic",
  "image/heif",

  // GIF
  "image/gif",

  // Videos
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime", // .mov
  "video/x-msvideo", // .avi
  "video/mpeg",
  "video/3gpp",
  "video/x-matroska" // .mkv
];

// hiding function should be added externaly

export default function ReplyForm({ boardTag, threadId, directReplyIds, apiUrl, hidden, onClose }){
    
  
    const [formText, setFormText] = useState("")
    const [formWarning, setFormWarning] = useState(
    {
      "text":"",
      "file":""
    }
    )

    const router = useRouter()

    function validateForm(formData){
      let textWarn = ""
      let fileWarn = ""

      if (!formData.get("text")){
        textWarn = "You are required to have some text"
      } else {
        if(true){
          // extra validation to be added
        }
      } 

      if (formData.get("file")["name"]) {

        if(formData.get("file")["size"] > 3*1024*1024){
          fileWarn += "File size can't go above 3 mb\n"
        }
        if(!allowedTypes.includes(formData.get("file")["type"])){
          fileWarn += "This is unsuported file type\n"
        } 
        if(true){
          
          // extra validation to be added
        }

      }
        

      // setting validation messages
      setFormWarning( prevState => ({
        ...prevState,
        text: textWarn,
        file: fileWarn
      }))
      console.log(formWarning)

      return !(textWarn || fileWarn);
    }


    async function postReply(event) {
      event.preventDefault()
      
      const formData = new FormData(event.currentTarget)
      
      console.log([...formData.entries()])
      
      // validation
      formData.append("postAnswerIDs", JSON.stringify(directReplyIds))
      const valid = validateForm(formData);
      console.log([...formData.entries()],directReplyIds)
      // if (!valid) return;
      
    
      const res = await fetch(`${apiUrl}/board/${boardTag}/thread/${threadId}/reply`, 
        { method: "POST",
          body: formData,
          credentials: "include" 
        });
      let data = await res.json()
      
      console.log(data)

      router.push(`/${boardTag}/thread/${postObj["id"]}`)
        
    }

    
    return (
      <div className={ hidden ? styles.hidden : styles.replyFormDiv}>
        <div id="DragDiv">
            <button onClick={onClose}>[Close form]</button>
            <p>Drag here</p>
            <p>Reply to {threadId}</p>
        </div>
        <form className={styles.form} onSubmit={postReply}>

          <input placeholder="Anonymous" type="text" name="userName"/>
          <input type="file" name="file" />
          {/* Spoiler won't apear in formData if not checked */}
          <input id="spoiler" type="checkbox" name="isSpoiler" />
          <label htmlFor="spoiler">Spoiler?</label>
          <span className={styles.warn}>{formWarning["file"]}</span>

          <textarea type="text" name="text" onChange={(e)=>{setFormText(e.target.value)}} >{formText}</textarea>
          <span className={styles.warn}>{formWarning["text"]}</span>
          <p>ds{directReplyIds}</p>
          <button type="submit">Post</button>
        </form>
      </div>
    )
}