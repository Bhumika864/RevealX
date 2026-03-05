


import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { decryptMessage } from "./utils/webcrypto"; // ✅ Web Crypto API

const backendUrl = process.env.REACT_APP_API_URL;

function RevealNote() {
  const { token } = useParams();

  const [noteMeta, setNoteMeta] = useState(null);
  const [passphrase, setPassphrase] = useState("");
  const [decryptedMessage, setDecryptedMessage] = useState("");
  const [isRevealed, setIsRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState("");
  const [alreadyRevealed, setAlreadyRevealed] = useState(false);

  /* ---------- FETCH NOTE BY SHARE TOKEN ---------- */
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/notes/shared/${token}`);

        if (res.status === 410) {
          setAlreadyRevealed(true);
          setLoading(false);
          return;
        }

        if (!res.ok) throw new Error("Not found");

        const data = await res.json();
        setNoteMeta(data);
      } catch {
        setError("Secret not found or has expired.");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [token]);

  /* ---------- LIVE COUNTDOWN ---------- */
  useEffect(() => {
    if (!noteMeta || noteMeta.revealAllowed) return;

    const tick = () => {
      const diff = new Date(noteMeta.revealDate) - new Date();
      if (diff <= 0) {
        setTimeLeft("Refreshing...");
        window.location.reload();
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(
        `${d > 0 ? d + "d " : ""}${h > 0 ? h + "h " : ""}${m}m ${s}s`
      );
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [noteMeta]);

  /* ---------- DECRYPT ---------- */
  const handleReveal = async () => {
    setError("");
    try {
      if (!noteMeta.revealAllowed) {
        setError("This secret cannot be revealed yet.");
        return;
      }

      // ✅ Decrypt using Web Crypto API (AES-256-GCM)
      // If passphrase is wrong, GCM auth tag fails and throws automatically
      const plaintext = await decryptMessage(
        noteMeta.cipherText,
        noteMeta.iv,
        noteMeta.salt,
        passphrase
      );

      // Decryption succeeded — show message
      setDecryptedMessage(plaintext);
      setIsRevealed(true);

      // Mark as revealed in backend (fire and forget)
      fetch(`${backendUrl}/api/notes/shared/${token}/reveal`, {
        method: "POST",
      }).catch(() => {});

    } catch {
      // GCM throws if passphrase is wrong or data is tampered
      setError("Incorrect passphrase. Try again.");
    }
  };

  /* ---------- UI ---------- */
  if (loading) {
    return <div className="reveal-loading">Loading your secret... 🔒</div>;
  }

  if (alreadyRevealed) {
    return (
      <div className="reveal-container">
        <div className="reveal-card error-card">
          <div className="reveal-icon">🔓</div>
          <h2>Already Revealed</h2>
          <p>This secret has already been opened and cannot be accessed again.</p>
        </div>
      </div>
    );
  }

  if (error && !noteMeta) {
    return (
      <div className="reveal-container">
        <div className="reveal-card error-card">
          <div className="reveal-icon">❌</div>
          <h2>Not Found</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reveal-container">
      <div className="reveal-card">
        <div className="reveal-header">
          <div className="reveal-icon">{isRevealed ? "🔓" : "🔒"}</div>
          <h2>{isRevealed ? "Secret Revealed!" : "You Have a Secret"}</h2>
        </div>

        <div className="reveal-meta">
          <p><span>From</span><strong>{noteMeta.sender}</strong></p>
          <p><span>To</span><strong>{noteMeta.receiver}</strong></p>
        </div>

        {/* Not yet time — show countdown */}
        {!noteMeta.revealAllowed && !isRevealed && (
          <div className="reveal-locked">
            <p className="reveal-locked-label">This secret unlocks in:</p>
            <div className="countdown-timer">{timeLeft}</div>
            <p className="reveal-date-label">
              {new Date(noteMeta.revealDate).toLocaleString()}
            </p>
            <p className="reveal-hint">
              Come back when the timer hits zero, then enter the passphrase to reveal it.
            </p>
          </div>
        )}

        {/* Ready to reveal — show passphrase input */}
        {noteMeta.revealAllowed && !isRevealed && (
          <div className="reveal-form">
            <p className="reveal-ready-label">🎉 The secret is ready to be revealed!</p>
            {error && <div className="auth-error">{error}</div>}
            <input
              type="password"
              placeholder="Enter passphrase to decrypt"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleReveal()}
            />
            <button className="btn-reveal" onClick={handleReveal}>
              Reveal Secret 🔓
            </button>
          </div>
        )}

        {/* Decrypted message */}
        {isRevealed && (
          <div className="decrypted-message">
            <p className="decrypted-label">Secret Message:</p>
            <div className="decrypted-content">{decryptedMessage}</div>
            <p className="burn-notice">
              🔥 This secret has been marked as revealed and cannot be opened again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RevealNote;