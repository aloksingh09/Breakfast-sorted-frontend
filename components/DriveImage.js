"use client";

export default function DriveImage({ driveLink, alt, className }) {
  // Google Drive URL to Direct Streamable Image URL Converter
  const getDirectLink = (url) => {
    if (!url) return "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=600"; // Fallback beautiful breakfast asset
    try {
      const match = url.match(/(?:\/d\/|id=)([\w-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/uc?export=view&id=${match[1]}`;
      }
    } catch (e) {
      console.error("Link parsing issues: ", e);
    }
    return url;
  };

  return (
    <img 
      src={getDirectLink(driveLink)} 
      alt={alt || "Breakfast Dish Rendering"} 
      className={className || "w-full h-48 object-cover rounded-2xl"}
      referrerPolicy="no-referrer"
    />
  );
}