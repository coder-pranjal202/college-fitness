import { useState } from "react";
import { Share2, Check, Link as LinkIcon, Mail, MessageCircle } from "lucide-react";

export default function ShareButton({ title, url }) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const shareUrl = url || window.location.href;
  const shareText = `Check out "${title || "Campus Arena Event"}" on Campus Arena!`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => { setCopied(false); setShowMenu(false); }, 2000);
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`, "_blank");
    setShowMenu(false);
  };

  const handleEmail = () => {
    window.open(`mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}`, "_blank");
    setShowMenu(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: title || "Campus Arena", text: shareText, url: shareUrl });
        setShowMenu(false);
      } catch { /* user cancelled */ }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition"
        title="Share"
      >
        <Share2 size={18} className="text-gray-300" />
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 mt-2 z-20 bg-gray-900 border border-white/20 rounded-xl shadow-2xl p-2 min-w-[180px]">
            {navigator.share ? (
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 text-gray-200 text-sm transition"
              >
                <Share2 size={16} /> Share
              </button>
            ) : (
              <>
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 text-gray-200 text-sm transition"
                >
                  {copied ? <Check size={16} className="text-green-400" /> : <LinkIcon size={16} />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 text-gray-200 text-sm transition"
                >
                  <MessageCircle size={16} className="text-green-400" /> WhatsApp
                </button>
                <button
                  onClick={handleEmail}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 text-gray-200 text-sm transition"
                >
                  <Mail size={16} /> Email
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}