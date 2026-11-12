const serializeNoteForReveal = (note, now) => {
  if (now < note.revealDate) {
    return {
      sender: note.sender,
      receiver: note.receiver,
      revealAllowed: false,
      revealDate: note.revealDate,
    };
  }
  if (note.revealedAt) {
    return null;
  }
  return {
    sender: note.sender,
    receiver: note.receiver,
    cipherText: note.cipherText,
    iv: note.iv,
    salt: note.salt,
    revealAllowed: true,
    revealDate: note.revealDate,
  };
};

module.exports = serializeNoteForReveal;
