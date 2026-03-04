

// import React, { useState } from "react";
// import DatePicker from "react-datepicker";
// import { formatISO } from "date-fns";
// import { useNavigate } from "react-router-dom";
// import CryptoJS from "crypto-js";
// import "react-datepicker/dist/react-datepicker.css";

// function CreateNote() {
//   const [sender, setSender] = useState("");
//   const [receiver, setReceiver] = useState("");
//   const [message, setMessage] = useState("");
//   const [passphrase, setPassphrase] = useState("");
//   const [revealDate, setRevealDate] = useState(new Date());
//   const [loading, setLoading] = useState(false);

//   const navigate = useNavigate();
//   const backendUrl = process.env.REACT_APP_API_URL;

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       /* ---------- KEY DERIVATION (CLIENT ONLY) ---------- */
//       const salt = CryptoJS.lib.WordArray.random(16);
//       const key = CryptoJS.PBKDF2(passphrase, salt, {
//         keySize: 256 / 32,
//         iterations: 100000,
//       });

//       const iv = CryptoJS.lib.WordArray.random(16);

//       /* ---------- ENCRYPT MESSAGE ---------- */
//       const cipherText = CryptoJS.AES.encrypt(message, key, {
//         iv,
//       }).toString();

//       const response = await fetch(`${backendUrl}/api/notes`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           sender,
//           receiver,
//           cipherText,
//           iv: iv.toString(),
//           salt: salt.toString(),
//           revealDate: formatISO(revealDate),
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to create note");
//       }

//       const data = await response.json();

//       /*
//         IMPORTANT:
//         - We DO NOT store the passphrase
//         - We DO NOT put it in URL
//         - User must share it separately
//       */
//       alert(
//         "Note created.\n\nIMPORTANT:\nSave your passphrase securely.\nIt cannot be recovered."
//       );

//       navigate(`/notes/${data.id}`);
//     } catch (err) {
//       console.error(err);
//       alert("Something went wrong. Try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="create-note-container">
//       <h2>Create Secret Message</h2>

//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           placeholder="From"
//           value={sender}
//           onChange={(e) => setSender(e.target.value)}
//           required
//         />

//         <input
//           type="text"
//           placeholder="To"
//           value={receiver}
//           onChange={(e) => setReceiver(e.target.value)}
//           required
//         />

//         <textarea
//           placeholder="Your secret message"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           required
//         />

//         <input
//           type="password"
//           placeholder="Secret passphrase (never stored)"
//           value={passphrase}
//           onChange={(e) => setPassphrase(e.target.value)}
//           required
//         />

//         <DatePicker
//           selected={revealDate}
//           onChange={(date) => setRevealDate(date)}
//           showTimeInput
//           dateFormat="MMMM d, yyyy h:mm aa"
//           minDate={new Date()}
//           required
//         />
        

//         <button type="submit" disabled={loading}>
//           {loading ? "Encrypting..." : "Create Secret"}
//         </button>
//       </form>
//     </div>
//   );
// }

// export default CreateNote;


// import React, { useState } from "react";
// import DatePicker from "react-datepicker";
// import { formatISO } from "date-fns";
// import { useNavigate } from "react-router-dom";
// import CryptoJS from "crypto-js";
// import "react-datepicker/dist/react-datepicker.css";

// function CreateNote() {
//   const [sender, setSender] = useState("");
//   const [receiver, setReceiver] = useState("");
//   const [message, setMessage] = useState("");
//   const [passphrase, setPassphrase] = useState("");
//   const [revealDate, setRevealDate] = useState(new Date());
//   const [loading, setLoading] = useState(false);

//   const navigate = useNavigate();
//   const backendUrl = process.env.REACT_APP_API_URL;

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       /* ---------- KEY DERIVATION (CLIENT ONLY) ---------- */
//       const salt = CryptoJS.lib.WordArray.random(16);
//       const key = CryptoJS.PBKDF2(passphrase, salt, {
//         keySize: 256 / 32,
//         iterations: 100000,
//       });

//       const iv = CryptoJS.lib.WordArray.random(16);

//       /* ---------- ENCRYPT MESSAGE ---------- */
//       const cipherText = CryptoJS.AES.encrypt(message, key, { iv }).toString();

//       const response = await fetch(`${backendUrl}/api/notes`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include", // ✅ send auth cookie
//         body: JSON.stringify({
//           sender,
//           receiver,
//           cipherText,
//           iv: iv.toString(),
//           salt: salt.toString(),
//           revealDate: formatISO(revealDate),
//         }),
//       });

//       if (!response.ok) {
//         const err = await response.json();
//         throw new Error(err.error || "Failed to create note");
//       }

//       const data = await response.json();

//       alert(
//         "Note created!\n\nIMPORTANT:\nSave your passphrase securely.\nIt cannot be recovered."
//       );

//       navigate(`/notes/${data.id}`);
//     } catch (err) {
//       console.error(err);
//       alert(err.message || "Something went wrong. Try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="create-note-container">
//       <h2>Create Secret Message</h2>

//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           placeholder="From"
//           value={sender}
//           onChange={(e) => setSender(e.target.value)}
//           required
//         />

//         <input
//           type="text"
//           placeholder="To"
//           value={receiver}
//           onChange={(e) => setReceiver(e.target.value)}
//           required
//         />

//         <textarea
//           placeholder="Your secret message"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           required
//         />

//         <input
//           type="password"
//           placeholder="Secret passphrase (never stored)"
//           value={passphrase}
//           onChange={(e) => setPassphrase(e.target.value)}
//           required
//         />

//         <DatePicker
//           selected={revealDate}
//           onChange={(date) => setRevealDate(date)}
//           showTimeInput
//           dateFormat="MMMM d, yyyy h:mm aa"
//           minDate={new Date()}
//           required
//         />

//         <button type="submit" disabled={loading}>
//           {loading ? "Encrypting..." : "Create Secret"}
//         </button>
//       </form>
//     </div>
//   );
// }

// export default CreateNote;











import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { formatISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import "react-datepicker/dist/react-datepicker.css";

function CreateNote() {
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [revealDate, setRevealDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const salt = CryptoJS.lib.WordArray.random(16);
      const key = CryptoJS.PBKDF2(passphrase, salt, {
        keySize: 256 / 32,
        iterations: 100000,
      });
      const iv = CryptoJS.lib.WordArray.random(16);
      const cipherText = CryptoJS.AES.encrypt(message, key, { iv }).toString();

      const response = await fetch(`${backendUrl}/api/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          sender,
          receiver,
          recipientEmail: recipientEmail || undefined,
          cipherText,
          iv: iv.toString(),
          salt: salt.toString(),
          revealDate: formatISO(revealDate),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to create note");
      }

      const data = await response.json();
      setShareUrl(data.shareUrl); // 🔗 show share link on success
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert("Failed to copy link.");
    }
  };

  // ✅ Success screen — show share link after creation
  if (shareUrl) {
    return (
      <div className="create-note-container">
        <div className="share-success">
          <div className="share-success-icon">🎉</div>
          <h2>Secret Created!</h2>
          <p>
            Share this link with <strong>{receiver}</strong>. They'll need
            your <strong>passphrase</strong> to decrypt it after reveal time.
          </p>

          <div className="share-url-box">
            <input type="text" value={shareUrl} readOnly />
            <button onClick={handleCopy} className="btn-copy">
              {copied ? "✅ Copied!" : "Copy Link"}
            </button>
          </div>

          {recipientEmail && (
            <p className="email-sent-notice">
              📧 An email was sent to <strong>{recipientEmail}</strong> with
              this link. They'll also get a reminder when the secret is ready
              to open.
            </p>
          )}

          <div className="share-actions">
            <button className="btn-secondary" onClick={() => navigate("/notes")}>
              View My Messages
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                setShareUrl("");
                setSender(""); setReceiver(""); setRecipientEmail("");
                setMessage(""); setPassphrase(""); setRevealDate(new Date());
              }}
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-note-container">
      <h2>Create Secret Message</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="From (your name)"
          value={sender}
          onChange={(e) => setSender(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="To (recipient's name)"
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
          required
        />

        {/* 📧 Optional recipient email */}
        <input
          type="email"
          placeholder="Recipient's email (optional — sends them the link automatically)"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
        />

        <textarea
          placeholder="Your secret message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Secret passphrase (never stored — share separately)"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          required
        />
        <DatePicker
          selected={revealDate}
          onChange={(date) => setRevealDate(date)}
          showTimeInput
          dateFormat="MMMM d, yyyy h:mm aa"
          minDate={new Date()}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Encrypting..." : "Create Secret"}
        </button>
      </form>
    </div>
  );
}

export default CreateNote;