import React, { useState, useEffect } from 'react';
import { subscribeToEmailDispatches, EmailPayload } from '../services/emailService';
import { Mail, X, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface EmailNotificationViewerProps {
  onAutoFillCode?: (code: string) => void;
}

export const EmailNotificationViewer: React.FC<EmailNotificationViewerProps> = ({
  onAutoFillCode,
}) => {
  const [activeEmail, setActiveEmail] = useState<EmailPayload | null>(null);
  const [showFullModal, setShowFullModal] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = subscribeToEmailDispatches((email) => {
      setActiveEmail(email);
      // Auto-hide toast after 10s if not clicked
      const timer = setTimeout(() => {
        // Keep in background
      }, 10000);
      return () => clearTimeout(timer);
    });

    return () => unsubscribe();
  }, []);

  if (!activeEmail) return null;

  return (
    <>
      {/* Real-time Email Dispatch Toast Banner */}
      <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white border border-slate-200/90 rounded-2xl shadow-xl p-4 animate-in slide-in-from-bottom-5 duration-300 text-slate-900">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-blue-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Email Dispatched Successfully</span>
              </div>
              <h5 className="text-xs font-bold text-slate-900 truncate mt-0.5">
                {activeEmail.subject}
              </h5>
              <div className="text-[11px] text-slate-500 truncate">
                To: <span className="text-slate-700 font-mono">{activeEmail.to}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveEmail(null)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeEmail.verificationCode && (
          <div className="mt-3 p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">
                {activeEmail.type === 'signup_verification' ? 'Confirmation Code:' : 'Verification Code:'}
              </span>
              <span className="font-mono font-bold text-blue-600 text-sm tracking-wider">
                {activeEmail.verificationCode}
              </span>
            </div>
            {onAutoFillCode && (
              <button
                onClick={() => {
                  onAutoFillCode(activeEmail.verificationCode!);
                  setActiveEmail(null);
                }}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-[10px] transition-colors cursor-pointer"
              >
                Auto-Fill Code
              </button>
            )}
          </div>
        )}

        <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-mono text-[10px]">
            {new Date(activeEmail.sentAt).toLocaleTimeString()}
          </span>
          <button
            onClick={() => setShowFullModal(true)}
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Preview Email HTML</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Full Email HTML Preview Modal */}
      {showFullModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white border border-slate-200/90 rounded-2xl shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto text-slate-900">
            <button
              onClick={() => setShowFullModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Email Inbox Preview</h3>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 font-mono">
              <div className="text-slate-500"><strong>From:</strong> AdsToto Security &lt;noreply@adstoto.com&gt;</div>
              <div className="text-slate-500"><strong>To:</strong> {activeEmail.to}</div>
              <div className="text-slate-700"><strong>Subject:</strong> {activeEmail.subject}</div>
            </div>

            {/* Rendered HTML */}
            <div 
              className="rounded-xl overflow-hidden border border-slate-200 bg-white"
              dangerouslySetInnerHTML={{ __html: activeEmail.htmlContent }}
            />

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowFullModal(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
