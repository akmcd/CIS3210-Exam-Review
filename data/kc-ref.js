/* Knowledge Check practice: one interactive item for each Kurose & Ross online Knowledge Check
   question in the sections this exam review covers (3.4 pipelining onward, and 3.5 TCP).

   Reference used: the transcription in github.com/daf2a/Computer_Networking_Problemset (README, Dec 2023),
   which copies the official checks at gaia.cs.umass.edu/kurose_ross/knowledgechecks/.
   - Stems are reworded for this site; the original wording is NOT reproduced here (reuse needs the authors' permission).
   - The setup, numbers and correct answers follow the original question.
   - Every answer was checked against the 9th edition; disagreements are explained in `note`.
   - `fid` says how much of the original was available:
       full   = original choices (true/false, matching pairs, or choices listed in the stem) and answer available
       setup  = original setup and answer available; the original had no choice list here, so the choices were written for this site
       answer = only the original correct answer(s) available; the other choices were written for this site
   - `num` is the question's position in the transcription's list for that section.
   Figures in the original are replaced by text descriptions of the same scenario.
   Types: single (answer index), multi (answer array), match (pairs [[left, right]], optional extra). */
(function () {
  const REPO = 'https://github.com/daf2a/Computer_Networking_Problemset';

  const SECTIONS = [
    { key: '3.4', chapter: 3, online: '3.4', title: 'Principles of Reliable Data Transfer (pipelining, GBN, SR)', anchor: 'principles-of-reliable-data-transfer', official: [3, 4], reading: true },
    { key: '3.5', chapter: 3, online: '3.5', title: 'Connection-Oriented Transport: TCP', anchor: 'connection-oriented-transport-tcp', official: [3, 5], reading: true }
  ];

  /* Knowledge Check sections in the transcription that are outside this review's coverage. */
  const EXCLUDED = [
    ['1.1–3.3', 'Everything up to UDP (on the midterm site)', null],
    ['3.6', 'Principles of Congestion Control', 5],
    ['3.7', 'TCP Congestion Control', 6],
    ['3.8', 'Evolution of Transport-Layer Functionality', 2]
  ];

  /* Questions in covered sections that were left out, and why. */
  const RDT2 = 'rdt2.0–rdt2.2 material, covered before the midterm (it is on the midterm site).';
  const SKIPPED = [1, 2, 3, 4, 5].map(n => ({ sec: '3.4', num: n, why: RDT2 }));

  const TF = ['True', 'False'];

  const Q = [
    /* ===================== 3.4 Reliable Data Transfer (from Q6 on) ===================== */
    { id: 'kr-3.4-6', sec: '3.4', num: 6, type: 'single', kind: 'concept', fid: 'answer', concept: 'Cumulative acknowledgment',
      q: 'What does a **cumulative** acknowledgment ACK(n) mean?',
      options: ['All packets with sequence numbers up to and including n have been received', 'Only packet n has been received',
        'Packets up to n − 1 have been received and n is the next one expected', 'n packets have been received in total'],
      answer: 0,
      explain: ['Correct: that\'s Go-Back-N\'s cumulative ACK (9th ed. §3.4.3).', 'No: that\'s an individual ACK, as in Selective Repeat.',
        'No: that\'s TCP\'s convention (next byte expected), covered in §3.5; for the rdt protocols, ACK(n) includes n.', 'No: ACKs carry sequence numbers, not counts.'] },
    { id: 'kr-3.4-7', sec: '3.4', num: 7, type: 'single', kind: 'calc', fid: 'setup', concept: 'Stop-and-wait utilization',
      ctx: 'Packets are **10,000 bits**, the link rate is **10 Mbps**, and the round-trip propagation delay is **10 ms**.',
      q: 'At best, what fraction of the time is a **stop-and-wait** sender busy sending?',
      options: ['0.091', '0.100', '0.010', '0.909'],
      answer: 0,
      explain: ['Correct: L/R = 1 ms, so U = (L/R) / (RTT + L/R) = 1 / 11 ≈ 0.091 (9th ed. §3.4.2).',
        'No: 1/10 drops the L/R term from the denominator. This is the transcription\'s key; see the note.',
        'No: a factor-of-10 slip.', 'No: that\'s the idle fraction, 10/11.'],
      note: 'The transcription\'s key is 0.1, which uses (L/R) / RTT. The 9th edition\'s formula, (L/R) / (RTT + L/R), gives 1/11 ≈ 0.09.' },
    { id: 'kr-3.4-8', sec: '3.4', num: 8, type: 'single', kind: 'calc', fid: 'setup', concept: 'Pipelined utilization',
      ctx: 'Same channel: 10,000-bit packets, 10 Mbps, 10 ms round-trip propagation delay.',
      q: 'If the sender can pipeline as many packets as it likes, what utilization can it reach?',
      options: ['1.0', '0.091', '0.5', '10'],
      answer: 0,
      explain: ['Correct: with enough packets in flight, the sender never sits idle.', 'No: that\'s stop-and-wait.', 'No: there is no reason to stop at half.', 'No: utilization is a fraction and can\'t exceed 1.'] },
    { id: 'kr-3.4-9', sec: '3.4', num: 9, type: 'single', kind: 'calc', fid: 'setup', concept: 'Packets in flight before the first ACK',
      ctx: 'Same channel: 10,000-bit packets (L/R = 1 ms), 10 ms round-trip propagation delay.',
      q: 'How many packets can the sender transmit **before** the first acknowledgment arrives?',
      options: ['11', '10', '1', '100'],
      answer: 0,
      explain: ['Correct: the first ACK arrives at RTT + L/R = 11 ms, and the sender finishes one packet per millisecond.',
        'No: RTT ÷ (L/R) ignores the time to transmit the first packet. This is the transcription\'s key; see the note.',
        'No: that\'s stop-and-wait.', 'No: a factor-of-10 slip.'],
      note: 'The transcription\'s key is 10 (RTT ÷ L/R). Using the 9th edition\'s timing, where the first ACK arrives at RTT + L/R, the answer is 11.' },
    { id: 'kr-3.4-10', sec: '3.4', num: 10, type: 'multi', kind: 'concept', fid: 'answer', concept: 'Pipelining',
      q: 'Which statements about **pipelining** are true?',
      options: ['Some packets may be "in flight": sent by the sender but not yet received', 'The sender can have several packets for which it hasn\'t received an ACK',
        'Every pipelined receiver must buffer out-of-order packets', 'Pipelining removes the need for sequence numbers'],
      answer: [0, 1],
      explain: ['Yes: that is what keeps the link busy.', 'Yes: up to the window size N.', 'No: a Go-Back-N receiver discards them.', 'No: it needs a larger sequence-number range.'] },
    { id: 'kr-3.4-11', sec: '3.4', num: 11, type: 'multi', kind: 'concept', fid: 'answer', concept: 'Why GBN discards out-of-order packets',
      q: 'What are reasons for a GBN receiver to **discard** packets that arrive correctly but out of order?',
      options: ['The sender will resend that packet anyway', 'It keeps the receiver simpler', 'Out-of-order packets are probably corrupted', 'Out-of-order packets can\'t be checksummed'],
      answer: [0, 1],
      explain: ['Yes: GBN resends everything from the lost packet on.', 'Yes: the receiver tracks only the next expected number and keeps no buffer.', 'No: they passed the checksum.', 'No: every packet carries its own checksum.'] },
    { id: 'kr-3.4-12', sec: '3.4', num: 12, type: 'multi', kind: 'concept', fid: 'answer', concept: 'Why not discard out-of-order packets',
      q: 'What is a reason **not** to discard packets that arrive correctly but out of order?',
      options: ['Its retransmission could be corrupted or lost, so throwing away a good copy is wasteful', 'The receiver could deliver it to the application right away', 'The sender will then never time out'],
      answer: [0],
      explain: ['Yes: this is the argument for buffering, as Selective Repeat does.', 'No: data must still be delivered in order, so it has to wait.', 'No: under GBN the sender still times out on the missing packet.'] },
    { id: 'kr-3.4-13', sec: '3.4', num: 13, type: 'multi', kind: 'scenario', fid: 'answer', concept: 'Selective Repeat receiver buffering',
      ctx: 'In a Selective Repeat receiver window, the packet at rcv_base hasn\'t arrived. Several later packets inside the window have arrived intact, been **ACKed and buffered**, but not delivered.',
      q: 'Why haven\'t the buffered packets been delivered yet?',
      options: ['A packet with a lower sequence number is still missing, so in-order delivery isn\'t possible yet', 'They were corrupted', 'They haven\'t been acknowledged yet', 'The receiver window is full'],
      answer: [0],
      explain: ['Yes: they wait until rcv_base arrives, then go up together.', 'No: they arrived intact.', 'No: SR ACKs each packet as it arrives.', 'No: the window still has room; it\'s the gap at rcv_base that blocks delivery.'] },
    { id: 'kr-3.4-14', sec: '3.4', num: 14, type: 'single', kind: 'concept', fid: 'answer', concept: 'SR re-ACKs packets below rcv_base',
      q: 'In Selective Repeat, why must the receiver ACK packets with sequence numbers **below** rcv_base?',
      options: ['The sender may not have received the earlier ACK; without a new one, its window can never move forward',
        'So that the receiver\'s own window can move forward past those packets', 'Because Selective Repeat acknowledges cumulatively, like Go-Back-N', 'To tell the sender to slow down because the receiver is falling behind'],
      answer: 0,
      explain: ['Correct: a lost ACK makes the sender resend; re-ACKing lets it advance (9th ed. §3.4.4).', 'No: the receiver\'s window already moved past them.', 'No: SR ACKs packets individually.', 'No: that\'s congestion or flow control, not SR.'] },

    /* ===================== 3.5 Connection-Oriented Transport: TCP ===================== */
    { id: 'kr-3.5-1', sec: '3.5', num: 1, type: 'single', kind: 'concept', fid: 'full', concept: 'TCP is a byte stream', fixed: true,
      q: 'True or false: TCP sends each chunk the application writes into the socket as its own segment, and the receiving TCP hands each segment\'s payload up separately, so the application\'s message boundaries are preserved.',
      options: TF,
      answer: 1,
      explain: ['No: TCP treats the data as a stream of bytes and cuts segments of up to MSS as it sees fit.', 'Correct: TCP doesn\'t preserve message boundaries. Two writes can arrive in one read, or one write in several (9th ed. §3.5.2).'] },
    { id: 'kr-3.5-2', sec: '3.5', num: 2, type: 'single', kind: 'code', fid: 'answer', concept: 'ACK number in the telnet example',
      code: "A -> B   Seq=42, ACK=79, data='C'\nB -> A   Seq=79, ACK=43, data='C'\nA -> B   Seq=43, ACK=80",
      q: 'In this telnet exchange (the textbook\'s Figure 3.31), why does each side ACK a number exactly one larger than the sequence number it received?',
      options: ['Each segment carried one byte of data, so the next byte expected is the next number in the stream',
        'TCP always adds 1 to acknowledge a segment, whatever its size', 'The ACK number counts segments received, and one segment arrived',
        'Adding 1 tells the sender that no bytes were lost'],
      answer: 0,
      explain: ['Correct: ACK = next byte expected = sequence number + bytes received = 42 + 1.',
        'No: a 100-byte segment starting at 42 would be ACKed with 142.', 'No: TCP numbers bytes, not segments.', 'No: the ACK says which byte is expected next; that\'s all.'] },
    { id: 'kr-3.5-3', sec: '3.5', num: 3, type: 'single', kind: 'concept', fid: 'full', concept: 'EWMA memory', fixed: true,
      ctx: 'EstimatedRTTₙ = (1 − α)·EstimatedRTTₙ₋₁ + α·SampleRTTₙ',
      q: 'True or false: EstimatedRTTₙ does not depend on the earlier sample SampleRTTₙ₋₁.',
      options: TF,
      answer: 1,
      explain: ['No: EstimatedRTTₙ₋₁ was itself computed from SampleRTTₙ₋₁.', 'Correct: every earlier sample still has some weight: SampleRTTₙ₋₁ contributes α(1 − α).'] },
    { id: 'kr-3.5-4', sec: '3.5', num: 4, type: 'single', kind: 'scenario', fid: 'answer', concept: 'Timer on a cumulative ACK',
      ctx: 'The textbook\'s Figure 3.36: Host A sends Seq=92 (8 bytes) and Seq=100 (20 bytes). The ACK for the first (ACK 100) is lost, but ACK 120 arrives before the timeout.',
      q: 'What timer-related action does A take when ACK 120 arrives?',
      options: ['It cancels the running timer: no data is outstanding any more', 'It restarts the timer for Seq=100', 'It doubles the timeout interval', 'It retransmits Seq=92 and restarts the timer'],
      answer: 0,
      explain: ['Correct: ACK 120 covers both segments, so nothing is unACKed and the timer stops. (A new timer starts when the next segment, Seq=120, is sent.)',
        'No: Seq=100 is already ACKed by the cumulative ACK 120.', 'No: doubling happens on a timeout, not on an ACK.', 'No: ACK 120 shows bytes 92–99 arrived.'] },
    { id: 'kr-3.5-5', sec: '3.5', num: 5, type: 'single', kind: 'concept', fid: 'full', concept: 'Flow control guarantee', fixed: true,
      q: 'True or false: with TCP flow control, where the receiver advertises its free buffer space and the sender always keeps its unACKed data within it, the sender can\'t send more than the receiver has room to buffer.',
      options: TF,
      answer: 0,
      explain: ['Correct: LastByteSent − LastByteAcked ≤ rwnd guarantees the buffer can\'t overflow.', 'No: that inequality is exactly the guarantee.'] },
    { id: 'kr-3.5-6', sec: '3.5', num: 6, type: 'multi', kind: 'concept', fid: 'answer', concept: 'Triple duplicate ACK without loss',
      ctx: 'The channel can lose messages but never corrupts them. The sender can\'t see into the channel.',
      q: 'Which statements about getting three duplicate ACKs for a segment are true?',
      options: ['If the channel can reorder messages, three duplicate ACKs can happen even though nothing was lost',
        'If the channel cannot reorder messages, a triple duplicate ACK means a segment was definitely lost',
        'If the channel cannot reorder messages, even one duplicate ACK means a segment was definitely lost',
        'Three duplicate ACKs always mean a segment was lost, whatever the channel does',
        'If the channel can reorder messages, TCP turns fast retransmit off'],
      answer: [0, 1, 2],
      explain: ['Yes: a segment that was only overtaken leaves a temporary gap that produces duplicates.',
        'Yes: without reordering, a gap can only come from loss.',
        'Yes: the transcription\'s key adds this. With no reordering and no corruption, any gap means loss.',
        'No: reordering can fake it.', 'No: TCP uses three duplicates precisely so mild reordering rarely fools it.'] },
    { id: 'kr-3.5-7', sec: '3.5', num: 7, type: 'match', kind: 'concept', fid: 'full', concept: 'Connection management messages',
      ctx: 'Textbook §3.5.6. The slides cover opening a connection and name the RST, SYN and FIN bits, but don\'t go through closing one.',
      q: 'Match each connection-management function to the message that does it.',
      pairs: [['Client to server: request to open a connection', 'SYN'],
        ['Server to client: ACKs the SYN and agrees to open the connection', 'SYNACK'],
        ['Starts closing the connection from this side', 'FIN'],
        ['Replies to a close request, ACKing it and agreeing to close', 'FINACK'],
        ['General error during setup or teardown: shut the referenced connection down', 'RESET']],
      explain: ['Step 1 of the three-way handshake.', 'Step 2.', 'The FIN bit.', 'ACKs the FIN (and closes its own side).', 'The RST bit.'] },
    { id: 'kr-3.5-8', sec: '3.5', num: 8, type: 'match', kind: 'concept', fid: 'full', concept: 'TCP header fields',
      q: 'Match each description to the TCP header field.',
      pairs: [['Port number of the sending socket', 'Source port number'],
        ['Application data the sender wrote into the socket', 'Data (payload)'],
        ['Stream index of the first byte of this segment\'s payload', 'Sequence number'],
        ['Stream index of the next in-order byte the receiver expects', 'ACK number'],
        ['If set, the segment cumulatively ACKs every byte before the ACK value', 'ACK bit'],
        ['Number of free bytes in the receiver\'s buffer', 'Receive window'],
        ['Internet checksum over the segment and selected IP header fields', 'Checksum'],
        ['Number of bytes in the TCP header', 'Header length']],
      explain: ['16 bits.', 'Variable length.', '32 bits; counts bytes.', '32 bits; next byte expected.', 'The A flag.', 'rwnd, 16 bits.', '16 bits.', '4 bits, counted in 32-bit words.'] },
    { id: 'kr-3.5-9', sec: '3.5', num: 9, type: 'match', kind: 'scenario', fid: 'full', concept: 'ACK values with a lost segment',
      ctx: 'A sender sends five segments of 100 bytes with Seq = 100, 200, 300, 400, 500. The one with Seq = 300 is lost. The receiver buffers correctly received out-of-order data.',
      q: 'Match each moment to the ACK value.',
      pairs: [['After segment 100 arrives', '200'], ['After segment 200 arrives', '300'], ['After segment 500 arrives', '300, a duplicate ACK'],
        ['After the retransmitted segment 300 arrives', '600'], ['An ACK value the receiver never sends in this example', '400']],
      extra: ['500'],
      explain: ['Next byte expected: 200.', 'Next byte expected: 300.', 'Still waiting for byte 300.', 'Gap filled; 400–599 already buffered.', 'The receiver jumps straight from 300 to 600.'] }
  ];

  window.KC_REF = { REPO: REPO, SECTIONS: SECTIONS, EXCLUDED: EXCLUDED, SKIPPED: SKIPPED, QUESTIONS: Q };
})();
