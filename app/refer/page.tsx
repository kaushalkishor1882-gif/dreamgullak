"use client";

export default function ReferPage() {
  const appLink = "https://www.dreamgullak.in";
  const shareText = `Hey! 👋 Check out Dream Gullak, the smart and easy way to save up for your goals. Whether it’s a new gadget, a trip, or a dream purchase, Dream Gullak helps you save securely and stay on track. Start building your saving habit today! Visit now: ${appLink}`;
  const imageURL = `${appLink}/dreamgullak-share.png`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Dream Gullak",
          text: shareText,
          url: appLink,
        });
      } catch (err) {
        console.error("Sharing failed:", err);
      }
    } else {
      alert("Sharing not supported on this device.");
    }
  };

  const shareOnWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appLink)}`;
    window.open(url, "_blank");
  };

  const shareOnInstagram = () => {
    alert("Instagram doesn’t support web sharing directly. Please use your mobile app’s share feature.");
  };

  const shareViaEmail = () => {
    const subject = "Check out Dream Gullak!";
    const body = `${shareText}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(appLink);
    alert("Link copied to clipboard!");
  };

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Refer Friends</h1>
      <p className="mb-6">Share Dream Gullak with your friends!</p>

      <img
        src={imageURL}
        alt="Dream Gullak Logo"
        className="mx-auto mb-6 w-32 h-32 rounded-full shadow-md"
      />

      <div className="space-y-3">
        <button
          onClick={handleNativeShare}
          className="bg-green-500 text-white px-4 py-2 rounded-lg w-full"
        >
          Share via Apps (Mobile)
        </button>

        <button
          onClick={shareOnWhatsApp}
          className="bg-[#25D366] text-white px-4 py-2 rounded-lg w-full"
        >
          Share on WhatsApp
        </button>

        <button
          onClick={shareOnFacebook}
          className="bg-[#1877F2] text-white px-4 py-2 rounded-lg w-full"
        >
          Share on Facebook
        </button>

        <button
          onClick={shareOnInstagram}
          className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white px-4 py-2 rounded-lg w-full"
        >
          Share on Instagram
        </button>

        <button
          onClick={shareViaEmail}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full"
        >
          Share via Email
        </button>

        <button
          onClick={copyLink}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg w-full"
        >
          Copy App Link
        </button>
      </div>
    </div>
  );
}
