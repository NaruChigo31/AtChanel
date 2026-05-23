"use client"

// import styles from "./app/[boardTag]/boards.module.css";


export default function ThreadForm({ boardTag, apiUrl }){

    async function postThread(event) {
        event.preventDefault()
    
        console.log(event.currentTarget)
    
        const formData = new FormData(event.currentTarget)
        
        console.log([...formData.entries()])
    
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

    let hid = false
    
    return (
      <form hidden={hid}  onSubmit={postThread}>
            <input placeholder="subject" type="text" name="title"/>
            <input placeholder="Anonymous" type="text" name="userName"/>
            <input type="file" name="file" />
            <textarea type="text" name="text" ></textarea>
            {/* <input type="file" /> */}
            <button type="submit">Post</button>
      </form>
    )
}