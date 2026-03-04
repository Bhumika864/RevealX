

// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import CryptoJS from "crypto-js";

// const backendUrl = process.env.REACT_APP_API_URL;

// function ViewNote() {
//   const { id } = useParams();

//   const [noteMeta, setNoteMeta] = useState(null);
//   const [passphrase, setPassphrase] = useState("");
//   const [decryptedMessage, setDecryptedMessage] = useState("");
//   const [isRevealed, setIsRevealed] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   /* ---------- FETCH NOTE METADATA ---------- */
//   useEffect(() => {
//     const fetchNote = async () => {
//       try {
//         const res = await fetch(`${backendUrl}/api/notes/${id}`);
//         if (!res.ok) throw new Error("Failed to fetch note");

//         const data = await res.json();

//         /*
//           Backend should return:
//           - sender
//           - receiver
//           - cipherText
//           - iv
//           - salt
//           - revealAllowed (boolean)
//           - revealDate
//         */

//         setNoteMeta(data);
//       } catch (err) {
//         setError("Note not found or expired.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchNote();
//   }, [id]);
//   const handleShare = async () => {
//     const shareUrl = window.location.href;

//     try {
//       await navigator.clipboard.writeText(shareUrl);
//       alert("Link copied! Share the passphrase separately.");
//     } catch {
//       alert("Failed to copy link.");
//     }
//   };

//   /* ---------- DECRYPT ---------- */
//   const handleReveal = async () => {
//     try {
//       if (!noteMeta.revealAllowed) {
//         setError("This note cannot be revealed yet.");
//         return;
//       }

//       const key = CryptoJS.PBKDF2(
//         passphrase,
//         CryptoJS.enc.Hex.parse(noteMeta.salt),
//         {
//           keySize: 256 / 32,
//           iterations: 100000,
//         }
//       );

//       const decrypted = CryptoJS.AES.decrypt(
//         noteMeta.cipherText,
//         key,
//         { iv: CryptoJS.enc.Hex.parse(noteMeta.iv) }
//       ).toString(CryptoJS.enc.Utf8);

//       if (!decrypted) {
//         throw new Error("Wrong passphrase");
//       }

//       // setDecryptedMessage(decrypted);
//       // setIsRevealed(true);
//       setDecryptedMessage(decrypted);
//       setIsRevealed(true);

//       await fetch(`${backendUrl}/api/notes/${id}/reveal`, {
//         method: "POST",
//       });
//     } catch (err) {
//       setError("Incorrect passphrase.");
//     }
//   };

//   /* ---------- UI ---------- */
//   if (loading) return <p>Loading...</p>;
//   if (error) return <p>{error}</p>;

//   return (
//     <div className="view-note-container">
//       <div className="note-card">
//         <h2>{isRevealed ? "Secret Revealed 🔓" : "Secret Locked 🔒"}</h2>

//         <p><strong>From:</strong> {noteMeta.sender}</p>
//         <p><strong>To:</strong> {noteMeta.receiver}</p>
       
//         {!isRevealed ? (
//           <>
//             <p>
//               <strong>Reveal Time:</strong>{" "}
//               {new Date(noteMeta.revealDate).toLocaleString()}
//             </p>

//             <input
//               type="password"
//               placeholder="Enter passphrase"
//               value={passphrase}
//               onChange={(e) => setPassphrase(e.target.value)}
//               required
//             />

//             <button onClick={handleReveal}>
//               Reveal Message
//             </button>
//           </>
//         ) : (
//           <div className="note-message">
//             {decryptedMessage}
//           </div>
//         )} 
//         <div>
//          <button onClick={handleShare}>
//           Copy Share Link
//         </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ViewNote;


import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CryptoJS from "crypto-js";

const backendUrl = process.env.REACT_APP_API_URL;

function ViewNote() {
  const { id } = useParams();

  const [noteMeta, setNoteMeta] = useState(null);
  const [passphrase, setPassphrase] = useState("");
  const [decryptedMessage, setDecryptedMessage] = useState("");
  const [isRevealed, setIsRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------- FETCH NOTE METADATA ---------- */
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/notes/${id}`, {
          credentials: "include", // ✅ send auth cookie
        });

        if (!res.ok) throw new Error("Failed to fetch note");

        const data = await res.json();
        setNoteMeta(data);
      } catch (err) {
        setError("Note not found or expired.");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied! Share the passphrase separately.");
    } catch {
      alert("Failed to copy link.");
    }
  };

  /* ---------- DECRYPT ---------- */
  const handleReveal = async () => {
    try {
      if (!noteMeta.revealAllowed) {
        setError("This note cannot be revealed yet.");
        return;
      }

      const key = CryptoJS.PBKDF2(
        passphrase,
        CryptoJS.enc.Hex.parse(noteMeta.salt),
        { keySize: 256 / 32, iterations: 100000 }
      );

      const decrypted = CryptoJS.AES.decrypt(noteMeta.cipherText, key, {
        iv: CryptoJS.enc.Hex.parse(noteMeta.iv),
      }).toString(CryptoJS.enc.Utf8);

      if (!decrypted) throw new Error("Wrong passphrase");

      setDecryptedMessage(decrypted);
      setIsRevealed(true);

      // ✅ send auth cookie with reveal confirmation
      await fetch(`${backendUrl}/api/notes/${id}/reveal`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      setError("Incorrect passphrase.");
    }
  };

  /* ---------- UI ---------- */
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="view-note-container">
      <div className="note-card">
        <h2>{isRevealed ? "Secret Revealed 🔓" : "Secret Locked 🔒"}</h2>

        <p><strong>From:</strong> {noteMeta.sender}</p>
        <p><strong>To:</strong> {noteMeta.receiver}</p>

        {!isRevealed ? (
          <>
            <p>
              <strong>Reveal Time:</strong>{" "}
              {new Date(noteMeta.revealDate).toLocaleString()}
            </p>

            <input
              type="password"
              placeholder="Enter passphrase"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              required
            />

            <button onClick={handleReveal}>Reveal Message</button>
          </>
        ) : (
          <div className="note-message">{decryptedMessage}</div>
        )}

        <div>
          <button onClick={handleShare}>Copy Share Link</button>
        </div>
      </div>
    </div>
  );
}

export default ViewNote;