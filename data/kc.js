/* Original practice questions for the Textbook checks page, written for this site.
   They follow the textbook's section structure but are NOT the official Kurose & Ross knowledge checks.
   Types:
     single: answer is an option index        multi: answer is an array of indices
     match:  pairs [[left, right], ...]; optional extra (unused right-hand choices)
   Every question explains every option (explain[] aligned with options, or with pairs for match). */
(function () {
  const SECTIONS = [
    { key: '3.4', chapter: 3, title: 'Principles of Reliable Data Transfer (pipelining, GBN, SR)', what: 'rdt3.0 timing, utilization, GBN and SR windows.', topic: 'gbn', official: [3, 4] },
    { key: '3.5', chapter: 3, title: 'Connection-Oriented Transport: TCP', what: 'Segment fields, sequence and ACK numbers, RTT estimation, retransmission, flow control.', topic: 'tcprdt', official: [3, 5] }
  ];

  const Q = [
    /* ---------- 3.4 ---------- */
    { id: 'kc-3.4-1', sec: '3.4', type: 'match', kind: 'concept',
      q: 'Match each protocol to how it recovers from a single lost packet in a window.',
      pairs: [['rdt3.0', 'Timeout, then resend the one outstanding packet'], ['Go-Back-N', 'Timeout, then resend that packet and every later unACKed one'],
        ['Selective Repeat', 'That packet\'s own timer expires; resend only it'], ['TCP', 'Three duplicate ACKs or a timeout; resend only the oldest unACKed segment']],
      explain: ['Stop-and-wait has only one packet out.', 'One timer, go back N.', 'A logical timer per packet.', 'Fast retransmit or the single timer, one segment either way.'] },
    { id: 'kc-3.4-2', sec: '3.4', type: 'single', kind: 'calc',
      ctx: 'L = 1,000 bytes, R = 100 Mbps, RTT = 9.92 ms.',
      q: 'What is the stop-and-wait utilization?',
      options: ['0.008', '0.08', '0.0008', '0.8'],
      answer: 0,
      explain: ['Correct: L/R = 8,000 / 10⁸ s = 0.08 ms; U = 0.08 / (9.92 + 0.08) = 0.008.', 'No: a factor-of-10 slip.', 'No: a factor-of-10 slip the other way.', 'No: that would need a window of 100.'] },
    { id: 'kc-3.4-3', sec: '3.4', type: 'multi', kind: 'concept',
      q: 'With 4-bit sequence numbers, which window sizes are safe?',
      options: ['GBN with N = 15', 'SR with N = 8', 'GBN with N = 8', 'SR with N = 9', 'GBN with N = 16'],
      answer: [0, 1, 2],
      explain: ['Yes: GBN allows up to 2⁴ − 1 = 15.', 'Yes: SR allows up to 16 / 2 = 8.', 'Yes: well under 15.', 'No: SR\'s limit is 8.', 'No: 16 > 15; an old packet 0 could pass for a new one.'] },
    { id: 'kc-3.4-4', sec: '3.4', type: 'single', kind: 'scenario',
      ctx: 'GBN, N = 3. Packets 0–2 were delivered and ACKed. The sender now sends 3, 4, 5. Packet 3 is lost; 4 and 5 arrive.',
      q: 'What does the receiver send in reply to packets 4 and 5?',
      options: ['ACK2, twice', 'ACK4 and ACK5', 'ACK3, twice', 'ACK5 only'],
      answer: 0,
      explain: ['Correct: it expects 3, so it discards 4 and 5 and re-ACKs the last in-order packet, 2, each time.', 'No: that\'s SR\'s individual ACKs.', 'No: packet 3 never arrived.', 'No: GBN ACKs only in-order data.'] },
    { id: 'kc-3.4-5', sec: '3.4', type: 'single', kind: 'scenario',
      ctx: 'SR, N = 3, 3-bit sequence numbers. The receiver has rcv_base = 7 and buffered packet 0.',
      q: 'Packet 7 arrives. What happens?',
      options: ['Deliver 7 and 0; rcv_base becomes 1', 'Deliver 7 only; rcv_base becomes 0', 'Ignore it: 7 is outside the window', 'Deliver 0 first, then 7'],
      answer: 0,
      explain: ['Correct: numbers wrap modulo 8, so the window [7, 0, 1] makes 0 the packet right after 7. Both are delivered in order and rcv_base becomes 1.', 'No: 0 is consecutive with 7 and already buffered.', 'No: 7 is rcv_base.', 'No: delivery is always in order.'] },
    { id: 'kc-3.4-6', sec: '3.4', type: 'multi', kind: 'concept',
      q: 'Which rdt3.0 statements are true?',
      options: ['A corrupted ACK in a "wait for ACK" state causes no immediate action', 'The timer restarts on every retransmission', 'An extra ACK arriving in a "wait for call" state is ignored', 'The receiver needs its own timer', 'A duplicate ACK triggers an immediate retransmission'],
      answer: [0, 1, 2],
      explain: ['Yes: Λ; the timer handles it.', 'Yes: start_timer after every send.', 'Yes: nothing is outstanding to confirm.', 'No: only the sender times anything.', 'No: rdt3.0 waits for the timeout. (TCP\'s fast retransmit is a different protocol.)'] },

    /* ---------- 3.5 ---------- */
    { id: 'kc-3.5-1', sec: '3.5', type: 'match', kind: 'concept',
      q: 'Match each TCP mechanism to the problem it solves.',
      pairs: [['Receive window (rwnd)', 'The receiving application reads slowly'], ['Fast retransmit', 'Waiting a long timeout after an obvious loss'],
        ['Random initial sequence number', 'Old segments being mistaken for a new connection\'s data'], ['DevRTT in the timeout', 'RTTs that vary a lot'], ['Delayed ACK', 'Sending an ACK for every single segment']],
      explain: ['Flow control.', 'Three duplicate ACKs trigger an early resend.', 'A new connection starts somewhere unpredictable in the number space.', 'The safety margin grows with variation.', 'Wait up to 500 ms so one ACK can cover two segments.'] },
    { id: 'kc-3.5-2', sec: '3.5', type: 'single', kind: 'calc',
      ctx: 'EstimatedRTT = 50 ms, DevRTT = 10 ms. SampleRTT = 90 ms arrives. α = 0.125, β = 0.25.',
      q: 'What is the new TimeoutInterval? (Update EstimatedRTT first, then DevRTT.)',
      options: ['120 ms', '95 ms', '90 ms', '55 ms'],
      answer: 0,
      explain: ['Correct: EstimatedRTT = 0.875·50 + 0.125·90 = 55. DevRTT = 0.75·10 + 0.25·|90 − 55| = 7.5 + 8.75 = 16.25. Timeout = 55 + 4·16.25 = 120 ms.', 'No: that\'s 55 + 4·10, using the old DevRTT.', 'No: that\'s just the sample.', 'No: that\'s the new EstimatedRTT with no safety margin.'] },
    { id: 'kc-3.5-3', sec: '3.5', type: 'single', kind: 'scenario',
      ctx: 'Host A has sent bytes 0–999 in two segments (Seq = 0 and Seq = 500). B received only the second.',
      q: 'What ACK does B send?',
      options: ['ACK = 0 (a duplicate for the next expected byte)', 'ACK = 1,000', 'ACK = 500', 'ACK = 999'],
      answer: 0,
      explain: ['Correct: byte 0 is still missing, so 0 is the next byte expected.', 'No: that would claim bytes 0–499 arrived.', 'No: TCP ACKs are cumulative, not per segment.', 'No: ACKs name the next byte expected, not the last received.'] },
    { id: 'kc-3.5-4', sec: '3.5', type: 'multi', kind: 'concept',
      q: 'Which are TCP **sender** events in the simplified sender?',
      options: ['Data received from the application', 'Timer timeout', 'ACK received', 'Receive buffer full', 'Duplicate segment received'],
      answer: [0, 1, 2],
      explain: ['Yes.', 'Yes.', 'Yes.', 'No: that\'s the receiver\'s buffer, reported through rwnd.', 'No: that\'s a receiver event.'] },
    { id: 'kc-3.5-5', sec: '3.5', type: 'single', kind: 'calc',
      ctx: 'RcvBuffer = 64 KB = 65,536 bytes. The receiver has 40,000 bytes waiting for the application.',
      q: 'What rwnd does it advertise?',
      options: ['25,536 bytes', '40,000 bytes', '65,536 bytes', '0 bytes'],
      answer: 0,
      explain: ['Correct: 65,536 − 40,000 = 25,536.', 'No: that\'s the buffered data, not the free space.', 'No: that\'s the whole buffer.', 'No: the buffer isn\'t full.'] },
    { id: 'kc-3.5-6', sec: '3.5', type: 'single', kind: 'concept',
      q: 'What does TCP do when the advertised window is 0 and the receiver has nothing to send?',
      options: ['The sender sends 1-byte probe segments until an ACK shows space', 'The sender waits silently forever', 'The receiver closes the connection', 'The sender sends a full MSS anyway'],
      answer: 0,
      explain: ['Correct: the probes give the receiver a reason to reply with its updated window.', 'No: that would deadlock; probes prevent it.', 'No: a full buffer is normal, not an error.', 'No: that would overflow the buffer.'] },
    { id: 'kc-3.5-7', sec: '3.5', type: 'match', kind: 'scenario',
      q: 'Match each receiver situation to its ACK action.',
      pairs: [['In-order segment, nothing pending', 'Delayed ACK, up to 500 ms'], ['In-order segment, one ACK pending', 'One cumulative ACK, immediately'],
        ['Out-of-order segment (gap)', 'Duplicate ACK for the next expected byte, immediately'], ['Segment fills the low end of a gap', 'Immediate ACK']],
      explain: ['Maybe another segment comes soon.', 'Covers both segments.', 'Feeds fast retransmit.', 'Tells the sender quickly that the gap is closed.'] },
    { id: 'kc-3.5-8', sec: '3.5', type: 'single', kind: 'concept',
      q: 'TCP\'s error recovery is often called a hybrid. Of what?',
      options: ['GBN (cumulative ACKs) and SR (resend one segment, buffer out of order)', 'UDP and IP', 'rdt2.0 and rdt2.1', 'Flow control and congestion control'],
      answer: 0,
      explain: ['Correct.', 'No: those are other protocols.', 'No: those are stop-and-wait steps.', 'No: those control sending rate, not error recovery.'] }
  ];

  window.KC = { SECTIONS: SECTIONS, QUESTIONS: Q };
})();
