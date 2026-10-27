# CIS*3210 Exam Review

A static study site for CIS*3210 Computer Networks (Fall 2026, Sajid Marhon), covering everything since the midterm: rdt3.0, pipelining, Go-Back-N, Selective Repeat, and TCP (connections, segment structure, sequence and ACK numbers, RTT estimation, retransmission, flow control). No build step, no dependencies.

Live at **https://akmcd.github.io/CIS3210-Exam-Review/**. The midterm site (Week 0 through Reliable Data Transfer) is at https://akmcd.github.io/CIS3210/cis3210-study/.

- **Read** (`read.html`): nine sections from the slides and Kurose & Ross (3.4 from rdt3.0 on, 3.5.1–3.5.5), a cheat sheet, and seven step-through demos (rdt3.0, utilization, Go-Back-N vs Selective Repeat, SR window vs sequence numbers, TCP retransmission scenarios, RTT estimation, flow control).
- **In-class questions** (`review.html`): the prof's in-class quiz questions since the midterm, each with a worked answer hidden until you open it, and a done checklist.
- **Textbook checks** (`knowledge.html`): Knowledge Check practice for 3.4 (pipelining onward) and 3.5, plus extra practice.
- **Flashcards** (`flashcards.html`): 25 cards with the essential definitions, formulas and protocol rules.
- **Quizzes** (`quiz.html`): multiple choice by topic, including "select all that apply", with an explanation after every answer.
- **Practice exam** (`exam.html`): 50 questions with a 60- or 75-minute timer, or none. Exam A is 50 questions not used anywhere else; Exam B draws 50 from the quiz bank; Exam C includes every in-class question.

Progress is saved in your browser's local storage. Nothing is sent anywhere.

## Set the exam date

In `assets/common.js`, change `const EXAM_DATE = null;` to, for example, `const EXAM_DATE = new Date('2026-12-10T00:00:00-05:00');`. The home page then shows a countdown.

## Editing content

- In-class questions: `data/review.js` (fields: `date`, `lecture`, `num`, `ctx`, `q`, `options`, `answer`, `explain`, `why`, `worked`; optional `choiceSource: 'recalled'`, `addedChoices` for choices written for practice, `answerFigure` for a diagram shown with the answer)
- Quiz questions: `data/bank.js`
- Practice Exam A: `data/exam.js`
- Flashcards: `data/flashcards.js`
- Knowledge Check practice: `data/kc-ref.js`; extra practice: `data/kc.js`

`answer` is the index of the correct option, or an array of indices for "select all that apply". Options are shuffled when shown. Wrap code words in backticks and use `**bold**` for emphasis.

Topic keys: `rdt3`, `pipeline`, `gbn`, `sr`, `tcpconn`, `tcpseq`, `tcprtt`, `tcprdt`, `flow`, `review`.

After editing, bump the `?v=...` tag in the HTML files so browsers fetch the new files.

## Knowledge Check source

The Knowledge Check items follow the questions transcribed in [daf2a/Computer_Networking_Problemset](https://github.com/daf2a/Computer_Networking_Problemset), which copies the official checks at gaia.cs.umass.edu/kurose_ross/knowledgechecks. The questions belong to the authors (Kurose and Ross) and their publisher; this site rewords them and checks every answer against the 9th edition.
