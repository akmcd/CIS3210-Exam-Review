/* Flashcards: { topic, front, back }. Inline `code` and **bold** are rendered. Kept short: the essentials only. */
window.FLASHCARDS = [
  /* rdt3.0 */
  { topic: 'rdt3', front: 'What rdt3.0 adds', back: 'A **timer**: start it on every send (including retransmissions), stop it on the correct ACK, retransmit on timeout. Everything else is rdt2.2.' },
  { topic: 'rdt3', front: 'rdt3.0: when does the sender do nothing (Λ)?', back: 'A corrupted or wrong-numbered ACK in a "wait for ACK" state (the timer handles it). Any packet arriving in a "wait for call" state (nothing is outstanding).' },
  { topic: 'rdt3', front: 'Stop-and-wait utilization', back: '`U = (L/R) / (RTT + L/R)`. L = 8,000 bits, R = 1 Gbps, RTT = 30 ms → U ≈ 0.00027.' },

  /* Pipelining */
  { topic: 'pipeline', front: 'Pipelined utilization', back: '`U = N·(L/R) / (RTT + L/R)`, capped at 1. Fill the pipe: N ≥ (RTT + L/R) / (L/R).' },
  { topic: 'pipeline', front: 'What pipelining needs', back: 'A unique sequence number per unACKed packet (k bits → 0 to 2ᵏ − 1), sender buffers, and sometimes receiver buffers.' },

  /* GBN */
  { topic: 'gbn', front: 'Go-Back-N', back: '**Cumulative** ACK(n) = everything ≤ n. **One timer** for the oldest unACKed. Timeout → resend it and all later unACKed. Window N ≤ 2ᵏ − 1.' },
  { topic: 'gbn', front: 'GBN receiver', back: 'Tracks only rcv_base. In order: deliver and ACK. Out of order: discard and re-ACK the last in-order packet.' },
  { topic: 'gbn', front: 'GBN sender window', back: '[0, send_base − 1] ACKed · [send_base, nextseqnum − 1] in flight · [nextseqnum, send_base + N − 1] usable · beyond: not usable.' },

  /* SR */
  { topic: 'sr', front: 'Selective Repeat', back: '**Individual** ACKs, a **timer per packet**, resend **only** the lost packet. Receiver buffers out-of-order packets.' },
  { topic: 'sr', front: 'SR receiver rules', back: 'In [rcv_base, rcv_base + N − 1]: ACK, buffer, deliver a run from rcv_base. In [rcv_base − N, rcv_base − 1]: **re-ACK**. Otherwise: ignore.' },
  { topic: 'sr', front: 'SR window limit', back: 'N ≤ half the sequence space (2ᵏ⁻¹). Otherwise, if all ACKs are lost, an old retransmission lands in the receiver\'s new window and is accepted as new.' },

  /* TCP connection */
  { topic: 'tcpconn', front: 'TCP connection', back: 'Handshake first; state only at the two hosts; full-duplex; point-to-point. Three-way handshake: SYN, SYNACK, ACK (the third may carry data).' },
  { topic: 'tcpconn', front: 'MSS', back: 'Max application data per segment, header not included. 1,500 (MTU) − 20 (IP) − 20 (TCP) = 1,460 bytes.' },
  { topic: 'tcpconn', front: 'TCP header', back: '20 bytes without options. Ports 16 bits · seq and ACK 32 bits · header length in 32-bit words · receive window 16 bits · flags: A (ACK valid), RST/SYN/FIN (connections), C/E (congestion).' },

  /* Seq / ACK */
  { topic: 'tcpseq', front: 'TCP sequence vs ACK number', back: 'Seq = number of the segment\'s **first byte**. ACK = **next byte expected** (cumulative). Bytes 0–535 received → ACK 536.' },
  { topic: 'tcpseq', front: 'Telnet echo example', back: 'A → B: Seq=42, ACK=79, \'C\'. B → A: Seq=79, ACK=43, \'C\'. A → B: Seq=43, ACK=80.' },

  /* RTT */
  { topic: 'tcprtt', front: 'RTT estimation', back: '`Est = 0.875·Est + 0.125·Sample` · `Dev = 0.75·Dev + 0.25·|Sample − Est|` · `Timeout = Est + 4·Dev`. No samples from retransmitted segments.' },
  { topic: 'tcprtt', front: 'Timeout too short / too long', back: 'Too short: premature timeouts, needless retransmissions. Too long: slow reaction to real loss.' },

  /* TCP retransmission */
  { topic: 'tcprdt', front: 'TCP sender events', back: 'Data from app: send, start timer if none running. Timeout: resend the **oldest unACKed** segment only, restart timer. ACK > SendBase: update SendBase, restart timer if data still unACKed.' },
  { topic: 'tcprdt', front: 'TCP receiver ACKs', back: 'In order, nothing pending: delay up to 500 ms. In order, one pending: one cumulative ACK now. Gap: duplicate ACK now. Fills gap: ACK now.' },
  { topic: 'tcprdt', front: 'Fast retransmit', back: '**3 duplicate ACKs** (4 ACKs for the same byte) → resend that segment immediately, before the timeout.' },
  { topic: 'tcprdt', front: 'TCP: GBN or SR?', back: 'Both. Cumulative ACKs like GBN; resends one segment like SR.' },

  /* Flow control */
  { topic: 'flow', front: 'Flow control', back: 'Keeps the sender from overflowing the **receiver\'s** buffer. (Congestion control protects the **network**.)' },
  { topic: 'flow', front: 'rwnd', back: '`rwnd = RcvBuffer − (LastByteRcvd − LastByteRead)`. Sender keeps `LastByteSent − LastByteAcked ≤ rwnd`.' },
  { topic: 'flow', front: 'Zero window', back: 'rwnd = 0 and the receiver has nothing to send → the sender sends 1-byte probes until an ACK shows space.' }
];
