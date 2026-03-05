import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { decryptMessage } from "./utils/webcrypto"; // ✅ Web Crypto API

const backendUrl = process.env.REACT_APP_API_URL;

function ViewNote() {
  const { id } = useParams();

  const [noteMeta, setNoteMeta] = useState(null);
  const [passphrase, setPassphrase] = useState("");
  const [decryptedMessage, setDecryptedMessage] = useState("");
  const [isRevealed, setIsRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/notes/${id}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch note");
        const data = await res.json();
        setNoteMeta(data);
      } catch {
        setError("Note not found or expired.");
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id]);

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(noteMeta.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert("Failed to copy link.");
    }
  };

  const handleReveal = async () => {
    setError("");
    try {
      if (!noteMeta.revealAllowed) {
        setError("This note cannot be revealed yet.");
        return;
      }

      // ✅ Decrypt using Web Crypto API (AES-256-GCM)
      // GCM automatically throws if passphrase is wrong — no empty string check needed
      const plaintext = await decryptMessage(
        noteMeta.cipherText,
        noteMeta.iv,
        noteMeta.salt,
        passphrase
      );

      setDecryptedMessage(plaintext);
      setIsRevealed(true);

      await fetch(`${backendUrl}/api/notes/${id}/reveal`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      setError("Incorrect passphrase.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error && !noteMeta) return <p>{error}</p>;

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

            {error && <div className="auth-error">{error}</div>}

            <input
              type="password"
              placeholder="Enter passphrase"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleReveal()}
            />
            <button onClick={handleReveal}>Reveal Message</button>
          </>
        ) : (
          <div className="note-message">{decryptedMessage}</div>
        )}

        {noteMeta.shareUrl && (
          <div className="share-url-box" style={{ marginTop: "1rem" }}>
            <input type="text" value={noteMeta.shareUrl} readOnly />
            <button onClick={handleCopyShareLink} className="btn-copy">
              {copied ? "✅ Copied!" : "Copy Share Link"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewNote;