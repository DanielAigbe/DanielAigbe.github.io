// Contact form (React). Sends the message straight to Daniel's inbox through Web3Forms (web3forms.com).
// The access key below is meant to be public: it only lets this form send to his email, nothing else.
// If the service can't be reached, the visitor is offered the email link instead, so no message is lost.
import { useState } from 'react';
import './ContactForm.css';

const ACCESS_KEY = '013e127f-a9f8-4969-a9b9-997a23a1e8e7';
const NEEDS = ['Product design', 'Frontend build', 'Brand identity', 'Not sure yet'];

export default function ContactForm({ email }) {
  const [need, setNeed] = useState(NEEDS[0]);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [lastMail, setLastMail] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    if (f.get('botcheck')) return; // spam bots fill the hidden field; people never see it

    const name = f.get('name');
    const subject = `Project enquiry (${need}) from ${name}`;
    const message = f.get('message');
    setLastMail(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${message}\n\n${name}\n${f.get('email')}`)}`);
    setStatus('sending');

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject,
          from_name: 'UI_RONIN portfolio',
          name,
          email: f.get('email'),
          need,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Send failed');
      setStatus('sent');
      form.reset();
      setNeed(NEEDS[0]);
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="cf cf-done" role="status">
        <span className="cf-label">Message sent</span>
        <p className="cf-done-title">Thanks, I've got your message<span className="red">.</span></p>
        <p className="cf-note">I'll reply to the email you gave within a day or two.</p>
        <button type="button" className="link cf-again" onClick={() => setStatus('idle')}>Send another message</button>
      </div>
    );
  }

  return (
    <form className="cf" onSubmit={onSubmit}>
      <label className="cf-label">
        Name
        <input id="c-name" name="name" type="text" placeholder="Your name" autoComplete="name" required />
      </label>
      <label className="cf-label">
        Email
        <input id="c-email" name="email" type="email" placeholder="you@company.com" autoComplete="email" required />
      </label>
      <div>
        <span className="cf-label" id="c-need">What do you need?</span>
        <div className="cf-chips" role="group" aria-labelledby="c-need">
          {NEEDS.map((n) => (
            <button key={n} type="button" className={n === need ? 'cf-chip on' : 'cf-chip'} aria-pressed={n === need} onClick={() => setNeed(n)}>
              {n}
            </button>
          ))}
        </div>
      </div>
      <label className="cf-label">
        Message
        <textarea id="c-msg" name="message" placeholder="A few lines about the project, timeline and budget range" required />
      </label>
      {/* Hidden spam trap */}
      <input type="checkbox" name="botcheck" className="cf-trap" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button className="btn cf-send" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
      {status === 'error' && (
        <p className="cf-note cf-error" role="alert">
          The message couldn't be sent just now. <a className="link" href={lastMail}>Send it by email instead</a>, or write to {email}.
        </p>
      )}
    </form>
  );
}
