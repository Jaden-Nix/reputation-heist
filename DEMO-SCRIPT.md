# 🎬 REPUTATION HEIST - Demo Script

## The Problem We Solve

**Reputation systems are farmable.** Two friends can create fake accounts, dare each other to "say hi," and mint infinite XP. Every social betting protocol dies the same death: Sybil attacks and collusion.

**Reputation Heist makes that mathematically impossible.**

---

## What We Built

### 1. Identity Isolation (The Ethos Gate)
- **Problem**: Burner wallets are free
- **Solution**: Require verified Twitter/Farcaster via Ethos attestations
- It's cheap to spin up 100 wallets. It's expensive to maintain 100 active social accounts.

### 2. Negative-Sum Economics (8:1 Slash Ratio)
- **Problem**: If win = +50 XP and lose = -50 XP, friends can farm forever
- **Solution**: Win = +50 XP, Fail = **-400 XP**
- One flake wipes a month of fake wins. Farming becomes economic suicide.

### 3. Forensic AI Judge
- **Problem**: AI can be gamed with lazy proofs
- **Solution**: The Heist Master runs collusion detection BEFORE judging:
  - Flags addresses that interact >2x per week
  - Rejects trivial dares ("post a dot" = 0 XP)
  - Outputs `integrityScore` that affects verdict skepticism

### 4. Chaos Tax (5% Burn)
- **Problem**: XP inflation over time
- **Solution**: 5% of all XP gains are burned, keeping the system deflationary

---

## Demo Flow (5 min)

### Scene 1: The Problem (30s)
> "Every reputation system fails the same way: two accounts, fake dares, infinite XP. We fixed that."

### Scene 2: Connect & Show Real Score (1 min)
- Connect wallet
- Show TrustProfile pulling **real Ethos score** from API
- Point to Verified badge (or "Unverified" for demo)

> "This isn't hardcoded. We fetch your actual Ethos credibility in real-time."

### Scene 3: The Economics (1 min)
- Open Create Heist form
- Show the staking UI

> "Win: +50 XP. Fail: -400 XP. That's an 8:1 ratio. Want to farm with your friend? One mistake, and you're back to zero."

### Scene 4: The Forensic Judge (2 min)
- Submit proof on a heist
- Show the AI response with `integrityScore`, `collusionSuspected`

> "Our AI doesn't just look at proof. It checks if you're circle-jerking with the same address repeatedly. If collusion is detected, XP reward drops to near-zero."

### Scene 5: Close (30s)
> "Reputation Heist: Where your word is your collateral, and farming is financial suicide. Built on Ethos. Built different."

---

## Key Technical Pitch Points

When judges ask "how do you prevent gaming?":

1. **Identity Isolation**: Ethos attestations required (Twitter/Farcaster)
2. **Asymmetric Risk**: 8:1 slash-to-win ratio makes farming unprofitable
3. **Forensic AI**: Real-time collusion detection fed into AI judgment
4. **Chaos Tax**: 5% burn prevents XP inflation

> "Most hackathon projects ignore Sybil attacks. We built three layers of defense into the protocol."

---

## Pre-Recording Checklist
- [ ] `npm run dev` running
- [ ] Wallet connected with Base Sepolia ETH
- [ ] Have a Twitter link ready as "proof"

