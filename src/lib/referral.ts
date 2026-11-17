// Shareable referral code generation — pure, no DB/network calls.
// Short, URL-safe, human-typeable. Uniqueness is enforced by the DB
// column's UNIQUE constraint; callers should retry on a rare collision
// if they want to be strict, but at this volume a single generation is
// fine in practice.
export function generateReferralCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I ambiguity
  let out = "";
  for (let i = 0; i < 7; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}
