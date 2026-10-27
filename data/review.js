/* The prof's in-class quiz questions since the midterm, each turned into a quiz question.
   Question stems and recalled choices are the prof's; explanations are written for this site.
   Loaded after data/bank.js; appended to QUIZ_BANK under topic 'review'.
   Extra fields: date/lecture/num (grouping on the In-class page), worked (paragraphs shown there),
   choiceSource / addedChoices (which choices were recalled and which were written for practice),
   answerFigure (a diagram shown with the answer). */
(function () {
  /* rdt3.0 sender FSM, drawn for this site. The highlighted loop is where an extra ACK0 lands. */
  const A = 'var(--accent)', G = 'var(--ink-2)';
  const st = (x, y, l1, l2, hot) =>
    '<ellipse cx="' + x + '" cy="' + y + '" rx="98" ry="38" fill="' + (hot ? 'var(--accent-soft)' : 'var(--paper-2)') + '" stroke="' + (hot ? A : G) + '" stroke-width="' + (hot ? 3 : 1.5) + '"/>' +
    '<text x="' + x + '" y="' + (y - 3) + '" text-anchor="middle" style="font-size:13.5px;font-weight:700">' + l1 + '</text>' +
    '<text x="' + x + '" y="' + (y + 15) + '" text-anchor="middle" style="font-size:13.5px;font-weight:700">' + l2 + '</text>';
  const lab = (x, y, t, anchor, hot) => '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || 'middle') + '" style="font-size:12.5px;' + (hot ? 'font-weight:700;fill:' + A : 'fill:var(--ink-2)') + '">' + t + '</text>';
  const ar = (d, hot) => '<path d="' + d + '" fill="none" stroke="' + (hot ? A : G) + '" stroke-width="' + (hot ? 3 : 1.6) + '" marker-end="url(#' + (hot ? 'fsmA' : 'fsmG') + ')"/>';
  const RDT3_SENDER =
    '<svg viewBox="0 0 860 460" role="img" aria-label="rdt3.0 sender state machine. Four states in a cycle: Wait for call 0 from above, Wait for ACK0, Wait for call 1 from above, Wait for ACK1. In Wait for call 1 from above, any arriving packet causes no action and the sender stays in that state.">' +
    '<defs><marker id="fsmG" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ink-2)"/></marker>' +
    '<marker id="fsmA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--accent)"/></marker></defs>' +
    /* main cycle */
    ar('M330 90 H486') + lab(410, 80, 'rdt_send(data)') + lab(410, 110, 'send pkt0, start_timer') +
    ar('M590 130 V316', true) + lab(602, 214, 'ACK0, not corrupt', 'start', true) + lab(602, 232, 'stop_timer', 'start', true) +
    ar('M490 360 H334') + lab(410, 350, 'rdt_send(data)') + lab(410, 380, 'send pkt1, start_timer') +
    ar('M230 320 V134') + lab(218, 214, 'ACK1, not corrupt', 'end') + lab(218, 232, 'stop_timer', 'end') +
    /* self-loops */
    ar('M206 54 C 186 6, 274 6, 254 52') + lab(272, 28, 'rdt_rcv(rcvpkt): Λ', 'start') +
    ar('M566 54 C 546 6, 634 6, 614 52') + lab(640, 22, 'corrupt, or ACK1: Λ', 'start') + lab(640, 40, 'timeout: resend pkt0, start_timer', 'start') +
    ar('M566 396 C 546 446, 634 446, 614 398', true) + lab(640, 420, 'rdt_rcv(rcvpkt): Λ', 'start', true) + lab(640, 438, '← the extra ACK0 lands here', 'start', true) +
    ar('M206 396 C 186 446, 274 446, 254 398') + lab(272, 420, 'corrupt, or ACK0: Λ', 'start') + lab(272, 438, 'timeout: resend pkt1, start_timer', 'start') +
    st(230, 90, 'Wait for call 0', 'from above') + st(590, 90, 'Wait for', 'ACK0') +
    st(590, 360, 'Wait for call 1', 'from above', true) + st(230, 360, 'Wait for', 'ACK1') +
    '</svg>';

  const R = [
    /* ---------------- Quiz 11: rdt3.0, pipelining, Go-Back-N ---------------- */
    { id: 'r-p-1', date: 'Quiz 11', lecture: 'rdt3.0, pipelining and Go-Back-N', num: 'Q1', kind: 'scenario', choiceSource: 'recalled', addedChoices: [1, 2, 3],
      ctx: 'An rdt3.0 sender accepts ACK0 and enters **Wait for call 1 from above**. Before new application data arrives, another ACK0 arrives.',
      q: 'Which response preserves the identity of the next new message?',
      options: ['Ignore the extra ACK and remain ready to send the new data with sequence number 1.',
        'Treat the extra ACK0 as a confirmation of the next message and move to Wait for call 0 from above.',
        'Retransmit packet 0, because a second ACK0 means the receiver wants it again.',
        'Send the next new data with sequence number 0, so it matches the most recent ACK.'],
      answer: 0,
      explain: ['Correct: in Wait for call 1 from above, any arriving packet takes the Λ self-loop. Nothing is outstanding, so there is nothing for this ACK to confirm, and the next new message keeps label 1.',
        'No: the next message hasn\'t been sent yet, so it can\'t be confirmed. Changing state would make the next new message go out labelled 0, which the receiver (now expecting 1) would treat as a duplicate and throw away.',
        'No: packet 0 was already confirmed by the first ACK0. In rdt3.0 a repeated ACK isn\'t a NAK in this state, and the sender has nothing outstanding to resend.',
        'No: the receiver has already delivered packet 0 and is waiting for 1. New data labelled 0 looks like an old copy, so it would be discarded and lost.'],
      answerFigure: RDT3_SENDER,
      answerFigureCaption: 'The rdt3.0 sender. In **Wait for call 1 from above**, any arriving packet takes the Λ self-loop: no action, no state change. Only `rdt_send(data)` leaves the state, and it sends pkt1.',
      why: 'An extra ACK0 (from a premature timeout or a delayed ACK) refers to a packet that is already confirmed. The sender ignores it and stays put, so the next new message still goes out as packet 1, which is exactly what the receiver expects.',
      worked: ['After the first ACK0, packet 0 is confirmed and the sender is in **Wait for call 1 from above**. Nothing is in flight and no timer is running.',
        'A second ACK0 is a leftover: for example, a premature timeout caused packet 0 to be resent, and the receiver re-ACKed the duplicate. It confirms nothing new.',
        'In that state the FSM\'s only response to an arriving packet is Λ: do nothing and stay. The next call from above is sent as **packet 1**.',
        'That preserves the next message\'s identity. If the sender reacted by flipping to 0, its next new message would carry the old label, and the receiver (waiting for 1) would discard it as a duplicate.'] },

    { id: 'r-p-2', date: 'Quiz 11', lecture: 'rdt3.0, pipelining and Go-Back-N', num: 'Q2', kind: 'scenario', choiceSource: 'recalled',
      ctx: 'An rdt3.0 sender retransmits packet 1 after a timeout. Before feedback from that copy returns, the original transmission\'s delayed ACK1 arrives correctly. It belongs to the current exchange.',
      q: 'Which actions are correct?',
      options: ['Stop the active timer and become ready for data with sequence number 0.',
        'Accept the ACK as confirmation of packet 1.',
        'Advance twice if the retransmission\'s ACK later arrives while the sender is still ready for new data.',
        'Reject the ACK solely because it was generated before the latest transmission.'],
      answer: [0, 1],
      explain: ['Yes: an intact ACK1 in Wait for ACK1 takes the stop_timer transition to Wait for call 0 from above.',
        'Yes: an ACK carries a sequence number, not a copy number. Either copy of packet 1 got through, and both copies carry the same data.',
        'No: the second ACK1 arrives in Wait for call 0 from above, where any arriving packet takes the Λ self-loop. Advancing again would skip a sequence number.',
        'No: the sender can\'t tell which copy an ACK came from, and doesn\'t need to: both copies are packet 1 with the same data.'],
      why: 'ACK1 confirms packet 1, whichever copy produced it. The sender stops the timer and waits for new data with sequence number 0. When the retransmission\'s ACK1 shows up later, it is a duplicate and is ignored.',
      worked: ['The sender is in **Wait for ACK1**. The original packet 1 arrived, but its ACK was slow, so the timer fired and packet 1 was resent.',
        'The delayed ACK1 now arrives intact. It names sequence number 1, which is what the sender is waiting for, so the transition fires: **stop_timer**, move to **Wait for call 0 from above**.',
        'It doesn\'t matter that this ACK came from the first copy. Both copies hold the same data with the same number, so "packet 1 arrived" is true either way.',
        'Later, the ACK for the retransmitted copy arrives. The sender is in a "wait for call" state, where arriving packets cause no action, so it doesn\'t advance a second time.'] },

    { id: 'r-p-3', date: 'Quiz 11', lecture: 'rdt3.0, pipelining and Go-Back-N', num: 'Q3', kind: 'concept', choiceSource: 'recalled',
      ctx: 'A sender changes from stop-and-wait to sending three packets before the first ACK returns. Link rate, packet length, propagation delay and receiver processing remain unchanged.',
      q: 'Which statements describe the benefit correctly?',
      options: ['Every window increase triples throughput, even after the sender is transmitting continuously.',
        'Several packets can be transmitted at once without reducing any packet\'s propagation delay.',
        'The sender can use some of the former waiting interval to transmit additional packets.',
        'Each packet occupies the sender\'s link for one third of its previous transmission time.'],
      answer: [1, 2],
      explain: ['No: once the pipe is full (the sender never idles), utilization is already 1 and a bigger window can\'t raise throughput.',
        'Yes: several packets are in flight together. Each one still takes the same propagation delay to cross the link; nothing about the path got faster.',
        'Yes: stop-and-wait idles for most of RTT + L/R. With a window of 3, the sender transmits packets 2 and 3 during time it used to spend waiting.',
        'No: transmission time is L/R, and L and R haven\'t changed. Each packet still takes exactly as long to push onto the link.'],
      why: 'Pipelining doesn\'t make any packet faster. It fills idle time: U = 3(L/R) / (RTT + L/R), three times the stop-and-wait utilization, as long as that stays below 1.',
      worked: ['Stop-and-wait: send one packet (L/R), then sit idle until the ACK returns at RTT + L/R. U = (L/R) / (RTT + L/R).',
        'With three packets allowed before the first ACK, the sender sends packets 2 and 3 back to back during what used to be waiting time. U = 3(L/R) / (RTT + L/R).',
        'Nothing per packet changes: each still takes L/R to transmit and the same propagation delay to arrive. The gain is only in how much of the cycle is spent sending.',
        'The gain also has a ceiling. Once N(L/R) ≥ RTT + L/R the sender is always busy, and a bigger window adds nothing.'] },

    { id: 'r-p-4', date: 'Quiz 11', lecture: 'rdt3.0, pipelining and Go-Back-N', num: 'Q4', kind: 'scenario', choiceSource: 'recalled', addedChoices: [2, 3],
      ctx: 'A proposed pipeline uses only sequence numbers 0 and 1 and sends three new messages before any ACK returns, labelled 0, 1, 0.',
      q: 'What ambiguity is already present without any bit corruption?',
      options: ['Two distinct outstanding messages share label 0, so that label alone cannot identify which one is being confirmed.',
        'The ambiguity concerns only payload equality, and disappears whenever the first and third messages differ.',
        'The receiver can\'t check the third message for bit errors, because its checksum would match the first message\'s.',
        'There is no ambiguity until a packet is lost, because the labels still alternate correctly.'],
      answer: 0,
      explain: ['Correct: messages 1 and 3 are both outstanding with label 0. An ACK0 (or an arriving packet 0) could refer to either one.',
        'No: identity comes from the sequence number, not the data. Different payloads don\'t help, because the receiver can\'t know what the "right" payload is; the app may also send identical data twice.',
        'No: every packet carries its own checksum computed over its own bits, so each is checked independently.',
        'No: the ambiguity exists as soon as two outstanding packets share a label. Loss or delay just makes it bite.'],
      why: 'Each unacknowledged packet needs a unique sequence number. With only {0, 1} and three packets in flight, two of them share label 0, so an ACK0 can\'t say which one it confirms. That is why pipelining needs a larger sequence-number range.',
      worked: ['After sending 0, 1, 0, three messages are unacknowledged, and two of them (the first and the third) carry label 0.',
        'When an ACK0 comes back, the sender can\'t tell whether it confirms the first message or the third. The receiver has the mirror problem: an arriving 0 could be the third message or a retransmitted first one.',
        'No corruption is needed for this. It follows from reusing a label while its first owner is still outstanding.',
        'The fix in the slides: pipelining needs a larger sequence-number range, so every packet in the window has its own number.'] },

    { id: 'r-p-5', date: 'Quiz 11', lecture: 'rdt3.0, pipelining and Go-Back-N', num: 'Q5', kind: 'scenario', choiceSource: 'recalled',
      ctx: 'A GBN sender transmits packets 0 through 3. ACK0, ACK1 and ACK2 are lost, but a valid ACK3 arrives before the timeout. No other data is outstanding.',
      q: 'Which sender action is correct?',
      options: ['Set send_base to 4 and stop the timer, without retransmitting 0 through 2.',
        'Set send_base to 4, but retransmit 0 through 2 once to verify the cumulative ACK.',
        'Set send_base to 0 and retransmit 0 through 2, because their ACKs were lost.',
        'Set send_base to 3 and keep packet 3 until a later ACK arrives.'],
      answer: 0,
      explain: ['Correct: GBN ACKs are cumulative. ACK3 means 0, 1, 2 and 3 all arrived in order. The window slides to 4, and with nothing outstanding, the timer stops.',
        'No: the cumulative ACK already proves 0–2 arrived. Resending them wastes bandwidth and the receiver would just discard them.',
        'No: a lost ACK doesn\'t mean lost data. ACK3 tells the sender that 0–2 got through.',
        'No: ACK3 confirms packet 3 itself, so send_base moves past it to 4.'],
      why: 'A cumulative ACK(n) confirms every packet up to and including n. ACK3 covers packets 0–3, so the earlier lost ACKs don\'t matter: send_base becomes 4, and since nothing else is outstanding, the timer stops.',
      worked: ['GBN\'s receiver only ACKs in-order data, and its ACK(n) means "everything through n arrived". A receiver can\'t send ACK3 unless it already has 0, 1 and 2.',
        'So when ACK3 arrives, the sender slides the window: **send_base = 3 + 1 = 4**.',
        'The timer runs for the oldest unacknowledged packet. Nothing is unacknowledged now, so the timer stops. (If packets were still outstanding, it would restart.)',
        'The lost ACK0–ACK2 cost nothing: the cumulative ACK3 covers them, so nothing is retransmitted.'] }
  ];

  window.REVIEW_BANK = R.map(r => Object.assign({ topic: 'review', src: r.date + ' (' + r.lecture + '), ' + r.num }, r));
  window.QUIZ_BANK = (window.QUIZ_BANK || []).concat(window.REVIEW_BANK);
})();
