'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface MessageItem {
  id: number;
  senderEmail: string;
  senderName: string;
  senderCompany: string;
  subject: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (!saved) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      const email = parsed.email || '';
      if (!email) {
        setLoading(false);
        return;
      }

      fetch(`/api/messages?email=${encodeURIComponent(email)}`, {
        cache: 'no-store',
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.messages)) {
            setMessages(data.messages);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));

      // Mark all as read when visiting /messages
      fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).catch(() => {});
    } catch {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white">
              Recruiter Messages &amp; NVites
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Direct invitations sent by recruiters. Contact numbers and emails
              are masked for security.
            </p>
          </div>
          <Link
            href="/candidate/dashboard"
            className="px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center text-xs text-slate-400">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center">
            <h3 className="text-sm font-extrabold text-white">
              No messages yet
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              When recruiters message you from Resdex, their messages will
              appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3"
              >
                <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      {msg.senderName}{' '}
                      <span className="text-slate-400 font-semibold">
                        ({msg.senderCompany})
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      From: {msg.senderEmail}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {msg.body}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}