"use client"
import { useState, useEffect } from 'react';
import styles from "./threadForm.module.css";


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


export default function ThreadForm({ boardTag, apiUrl }){

    const [hid, setHid] = useState(true)
    const [formWarning, setFormWarning] = useState(
      {
        "title":"",
        "text":"",
        "file":"",
      }
    )

    function validateForm(formData){
      let titleWarn = ""
      let textWarn = ""
      let fileWarn = ""

      if (!formData.get("title")){
        titleWarn = "You are required to have a title"
      } else {
        if(true){
          // extra validation to be added
        }
      } 

      if (!formData.get("text")){
        textWarn = "You are required to have some text"
      } else {
        if(true){
          // extra validation to be added
        }
      } 

      if (!formData.get("file")["name"]){
        fileWarn = "You are required to upload file as OP"
      } else {

        if(formData.get("file")["size"] > 3*(10**6)){
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
        title: titleWarn,
        text: textWarn,
        file: fileWarn
      }))
      console.log(formWarning)
    }

    async function postThread(event) {
      event.preventDefault()
  
      console.log(event.currentTarget)
  
      const formData = new FormData(event.currentTarget)
      
      console.log([...formData.entries()])
      
      // validation
      validateForm(formData)
      
  
      const res = await fetch(`${apiUrl}/board/${boardTag}/thread`, 
        { method: "POST",
          headers: {
            // to change!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            "apikey": "d8705a3a-7575-4acc-9297-fb2f1d7d3b8b"
          },
          body: formData
        });
      let data = await res.json()
      
      console.log(data)
        
    }

    function closeOpenForm(){
      setHid(!hid)
      console.log(hid ? "opened" : "closed")
    }
    
    return (
      <div className={styles.initialDiv}>
        <button onClick={closeOpenForm}>[{!hid ? "Close form":"Create Post"}]</button>
        <form className={hid ? styles.hidden : styles.form} onSubmit={postThread}>
          
          <input placeholder="subject" type="text" name="title"/>
          <span className={styles.warn}>{formWarning["title"]}</span>
          
          <input placeholder="Anonymous" type="text" name="userName"/>
          <input type="file" name="file" />
          {/* Spoiler won't apear in formData if not checked */}
          <input type='checkbox' name="isSpoiler" label='spLabel'/>
          <label id="spLabel">spoiler?</label>
          <span className={styles.warn}>{formWarning["file"]}</span>

          <textarea type="text" name="text" ></textarea>
          <span className={styles.warn}>{formWarning["text"]}</span>
          
          <button type="submit">Post</button>
        </form>
      </div>
    )
}