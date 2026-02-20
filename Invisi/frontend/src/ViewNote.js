import React, { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import CryptoJS from "crypto-js";
import html2canvas from "html2canvas";
// import Header from "./Header";

const backendUrl = process.env.REACT_APP_API_URL;

function ViewNote() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [note, setNote] = useState(null);
  const [encryptionKey, setEncryptionKey] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copyButtonText, setCopyButtonText] = useState("Copy Link");
  const [countdown, setCountdown] = useState("");

  const baseURL = window.location.origin;

  /* ---------------- KEY HANDLING ---------------- */
  useEffect(() => {
    const keyFromUrl = searchParams.get("key");

    if (keyFromUrl) {
      setEncryptionKey(keyFromUrl);
      localStorage.setItem(`note-key-${id}`, keyFromUrl);
    } else {
      const storedKey = localStorage.getItem(`note-key-${id}`);
      if (storedKey) {
        setEncryptionKey(storedKey);
        setSearchParams({ key: storedKey });
      } else {
        setError("Missing encryption key.");
        setIsLoading(false);
      }
    }
  }, [id, searchParams, setSearchParams]);

  /* ---------------- FETCH NOTE ---------------- */
  const fetchNote = useCallback(async () => {
    try {
      setIsLoading(true);

      const res = await fetch(`${backendUrl}/api/notes/${id}`);
      if (!res.ok) throw new Error("Failed to fetch note");

      const data = await res.json();
      const revealDate = new Date(data.revealDate);

      if (data.timeToDecrypt) {
        const decrypted = CryptoJS.AES.decrypt(
          data.message,
          encryptionKey,
          { iv: CryptoJS.enc.Hex.parse(data.iv) }
        ).toString(CryptoJS.enc.Utf8);

        setNote({
          sender: data.sender,
          receiver: data.receiver,
          message: decrypted,
          revealDate,
        });
        setIsRevealed(true);
      } else {
        setNote({
          sender: data.sender,
          receiver: data.receiver,
          message: "This message is still locked 🔒",
          revealDate,
        });
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }, [id, encryptionKey]);

  useEffect(() => {
    if (encryptionKey) fetchNote();
  }, [encryptionKey, fetchNote]);

  /* ---------------- COUNTDOWN ---------------- */
  useEffect(() => {
    if (!note || isRevealed) return;

    const timer = setInterval(() => {
      const diff = note.revealDate.getTime() - Date.now();

      if (diff <= 0) {
        clearInterval(timer);
        fetchNote();
        return;
      }

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff / 60000) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setCountdown(
        `${h.toString().padStart(2, "0")}:${m
          .toString()
          .padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [note, isRevealed, fetchNote]);

  /* ---------------- ACTIONS ---------------- */
  const copyToClipboard = () => {
    const link = `${baseURL}/notes/${id}?key=${searchParams.get("key")}`;
    navigator.clipboard.writeText(link);
    setCopyButtonText("Copied!");
    setTimeout(() => setCopyButtonText("Copy Link"), 2000);
  };

  const handleSaveAsImage = () => {
    const el = document.querySelector(".note-card");
    if (!el) return;

    html2canvas(el, { scale: 2 }).then((canvas) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `note-${id}.png`;
      link.click();
    });
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="view-note-container">
      {/* <Header /> */}

      <div className="note-content">
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <div className="note-card">
            <h2>
              {isRevealed ? "Secret Revealed 🔓" : "RevealX Locked 🔒"}
            </h2>

            <p><strong>From:</strong> {note.sender}</p>
            <p><strong>To:</strong> {note.receiver}</p>

            {!isRevealed && <h3>⏳ {countdown}</h3>}

            <div className="note-message">
              {note.message}
            </div>

            {/* ✅ ALWAYS SHOW COPY LINK */}
            <div className="share-section">
              <button onClick={copyToClipboard}>
                {copyButtonText}
              </button>

              {/* ✅ SHOW SAVE AS IMAGE ONLY AFTER REVEAL */}
              {isRevealed && (
                <button onClick={handleSaveAsImage}>
                  Save as Image
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewNote;