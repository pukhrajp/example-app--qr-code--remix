const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Helper function to create SVG cursor data URI
function createSVGCursor(svg) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Seed cursors data - 30 diverse cursors across 7 categories
const cursors = [
  // PROFESSIONAL Category (5 cursors)
  {
    name: "Classic Arrow",
    description: "Traditional black arrow cursor",
    category: "PROFESSIONAL",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M2 2 L2 28 L12 20 L17 30 L20 28 L15 18 L26 18 Z" fill="black" stroke="white" stroke-width="1"/></svg>`),
    hotspotX: 2,
    hotspotY: 2,
    width: 32,
    height: 32,
  },
  {
    name: "Business Pointer",
    description: "Professional gray hand pointer",
    category: "PROFESSIONAL",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M10 8 L10 18 L8 18 L8 10 L6 10 L6 20 L8 20 L8 22 L6 22 L6 24 L20 24 L20 14 L18 14 L18 8 Z" fill="#333" stroke="white" stroke-width="1"/></svg>`),
    hotspotX: 10,
    hotspotY: 2,
    width: 32,
    height: 32,
  },
  {
    name: "Minimal Dark",
    description: "Sleek minimal dark cursor",
    category: "PROFESSIONAL",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="3" fill="#1a1a1a"/><path d="M16 2 L16 14 M16 18 L16 30 M2 16 L14 16 M18 16 L30 16" stroke="#1a1a1a" stroke-width="2"/></svg>`),
    hotspotX: 16,
    hotspotY: 16,
    width: 32,
    height: 32,
  },
  {
    name: "Corporate Pin",
    description: "Professional location pin",
    category: "PROFESSIONAL",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M16 2 C10 2 6 6 6 12 C6 18 16 30 16 30 C16 30 26 18 26 12 C26 6 22 2 16 2 Z M16 16 C14 16 12 14 12 12 C12 10 14 8 16 8 C18 8 20 10 20 12 C20 14 18 16 16 16 Z" fill="#2c5282" stroke="white" stroke-width="1"/></svg>`),
    hotspotX: 16,
    hotspotY: 30,
    width: 32,
    height: 32,
  },
  {
    name: "Executive Hand",
    description: "Professional hand cursor",
    category: "PROFESSIONAL",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M14 8 L14 16 L12 16 L12 10 L10 10 L10 18 L12 18 L12 20 L10 20 L10 22 L22 22 L22 14 L20 14 L20 8 Z" fill="#1a365d" stroke="white" stroke-width="1"/></svg>`),
    hotspotX: 16,
    hotspotY: 2,
    width: 32,
    height: 32,
  },

  // FUN & PLAYFUL Category (8 cursors)
  {
    name: "Rainbow Star",
    description: "Colorful rainbow star",
    category: "FUN",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><defs><linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#ff0080"/><stop offset="50%" style="stop-color:#7928ca"/><stop offset="100%" style="stop-color:#ff0080"/></linearGradient></defs><path d="M16 2 L20 12 L30 14 L22 20 L24 30 L16 24 L8 30 L10 20 L2 14 L12 12 Z" fill="url(#rainbow)" stroke="white" stroke-width="1.5"/></svg>`),
    hotspotX: 16,
    hotspotY: 2,
    width: 32,
    height: 32,
  },
  {
    name: "Smiley Face",
    description: "Happy smiley cursor",
    category: "FUN",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#FFD700" stroke="#333" stroke-width="1"/><circle cx="11" cy="13" r="2" fill="#333"/><circle cx="21" cy="13" r="2" fill="#333"/><path d="M10 20 Q16 26 22 20" stroke="#333" stroke-width="2" fill="none"/></svg>`),
    hotspotX: 16,
    hotspotY: 16,
    width: 32,
    height: 32,
  },
  {
    name: "Colorful Arrow",
    description: "Vibrant multicolor arrow",
    category: "FUN",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M2 2 L2 28 L12 20 L17 30 L20 28 L15 18 L26 18 Z" fill="#FF1493" stroke="#FFD700" stroke-width="2"/></svg>`),
    hotspotX: 2,
    hotspotY: 2,
    width: 32,
    height: 32,
  },
  {
    name: "Sparkle Purple",
    description: "Magical purple sparkle",
    category: "FUN",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M16 2 L18 14 L30 16 L18 18 L16 30 L14 18 L2 16 L14 14 Z" fill="#9333ea" stroke="#fbbf24" stroke-width="1"/><circle cx="16" cy="16" r="3" fill="#fbbf24"/></svg>`),
    hotspotX: 16,
    hotspotY: 16,
    width: 32,
    height: 32,
  },
  {
    name: "Bubble Wand",
    description: "Fun bubble wand cursor",
    category: "FUN",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="24" cy="8" r="6" fill="#60a5fa" stroke="#3b82f6" stroke-width="1" opacity="0.7"/><circle cx="22" cy="6" r="2" fill="white" opacity="0.9"/><line x1="18" y1="12" x2="4" y2="26" stroke="#64748b" stroke-width="3"/></svg>`),
    hotspotX: 4,
    hotspotY: 26,
    width: 32,
    height: 32,
  },
  {
    name: "Ice Cream Cone",
    description: "Yummy ice cream cursor",
    category: "FUN",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="10" r="8" fill="#fbbf24"/><circle cx="16" cy="10" r="6" fill="#fcd34d"/><path d="M10 10 L16 28 L22 10 Z" fill="#d97706" stroke="#92400e" stroke-width="1"/></svg>`),
    hotspotX: 16,
    hotspotY: 28,
    width: 32,
    height: 32,
  },
  {
    name: "Music Note",
    description: "Musical note cursor",
    category: "FUN",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><ellipse cx="10" cy="24" rx="5" ry="4" fill="#8b5cf6"/><ellipse cx="20" cy="20" rx="5" ry="4" fill="#8b5cf6"/><path d="M15 24 L15 8 L25 6 L25 20" stroke="#8b5cf6" stroke-width="3" fill="none"/></svg>`),
    hotspotX: 10,
    hotspotY: 28,
    width: 32,
    height: 32,
  },
  {
    name: "Paint Brush",
    description: "Artistic paint brush",
    category: "FUN",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect x="20" y="2" width="6" height="16" fill="#64748b" stroke="#475569" stroke-width="1"/><path d="M20 18 L23 30 L26 18 Z" fill="#ec4899"/><circle cx="23" cy="28" r="2" fill="#be185d"/></svg>`),
    hotspotX: 23,
    hotspotY: 30,
    width: 32,
    height: 32,
  },

  // SEASONAL Category (5 cursors)
  {
    name: "Christmas Tree",
    description: "Festive Christmas tree",
    category: "SEASONAL",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M16 2 L10 12 L12 12 L8 18 L10 18 L6 26 L26 26 L22 18 L24 18 L20 12 L22 12 Z" fill="#059669" stroke="#047857" stroke-width="1"/><circle cx="16" cy="8" r="1.5" fill="#ef4444"/><circle cx="13" cy="15" r="1.5" fill="#eab308"/><circle cx="19" cy="16" r="1.5" fill="#3b82f6"/><rect x="14" y="26" width="4" height="4" fill="#92400e"/></svg>`),
    hotspotX: 16,
    hotspotY: 2,
    width: 32,
    height: 32,
  },
  {
    name: "Snowflake",
    description: "Winter snowflake",
    category: "SEASONAL",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M16 4 L16 28 M6 16 L26 16 M9 9 L23 23 M23 9 L9 23" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round"/><circle cx="16" cy="16" r="4" fill="#7dd3fc" stroke="#0284c7" stroke-width="1"/></svg>`),
    hotspotX: 16,
    hotspotY: 16,
    width: 32,
    height: 32,
  },
  {
    name: "Halloween Pumpkin",
    description: "Spooky jack-o-lantern",
    category: "SEASONAL",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><ellipse cx="16" cy="18" rx="12" ry="10" fill="#f97316" stroke="#c2410c" stroke-width="1"/><path d="M16 8 L14 12 L18 12 Z" fill="#15803d"/><path d="M11 15 L12 16 L11 17 Z" fill="#1f2937"/><path d="M21 15 L20 16 L21 17 Z" fill="#1f2937"/><path d="M11 22 Q16 26 21 22" stroke="#1f2937" stroke-width="2" fill="none"/></svg>`),
    hotspotX: 16,
    hotspotY: 8,
    width: 32,
    height: 32,
  },
  {
    name: "Valentine Heart",
    description: "Romantic red heart",
    category: "SEASONAL",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M16 28 C16 28 4 20 4 12 C4 8 6 6 9 6 C12 6 14 8 16 10 C18 8 20 6 23 6 C26 6 28 8 28 12 C28 20 16 28 16 28 Z" fill="#dc2626" stroke="#991b1b" stroke-width="1"/></svg>`),
    hotspotX: 16,
    hotspotY: 10,
    width: 32,
    height: 32,
  },
  {
    name: "Easter Egg",
    description: "Colorful Easter egg",
    category: "SEASONAL",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><ellipse cx="16" cy="18" rx="10" ry="13" fill="#a78bfa" stroke="#7c3aed" stroke-width="1"/><path d="M6 18 L26 18" stroke="#fbbf24" stroke-width="2"/><path d="M6 13 L26 13" stroke="#ec4899" stroke-width="2"/><path d="M6 23 L26 23" stroke="#10b981" stroke-width="2"/></svg>`),
    hotspotX: 16,
    hotspotY: 5,
    width: 32,
    height: 32,
  },

  // GAMING Category (5 cursors)
  {
    name: "Sword Blade",
    description: "Epic sword cursor",
    category: "GAMING",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M28 2 L18 12 L14 10 L10 14 L18 22 L22 18 L20 14 L30 4 Z" fill="#64748b" stroke="#1e293b" stroke-width="1"/><rect x="14" y="18" width="4" height="6" fill="#b45309" stroke="#78350f" stroke-width="1"/><rect x="12" y="24" width="8" height="3" fill="#fbbf24" stroke="#f59e0b" stroke-width="1"/></svg>`),
    hotspotX: 28,
    hotspotY: 2,
    width: 32,
    height: 32,
  },
  {
    name: "Crosshair Target",
    description: "Precision targeting cursor",
    category: "GAMING",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="none" stroke="#dc2626" stroke-width="2"/><circle cx="16" cy="16" r="6" fill="none" stroke="#dc2626" stroke-width="2"/><circle cx="16" cy="16" r="2" fill="#dc2626"/><path d="M16 2 L16 10 M16 22 L16 30 M2 16 L10 16 M22 16 L30 16" stroke="#dc2626" stroke-width="2"/></svg>`),
    hotspotX: 16,
    hotspotY: 16,
    width: 32,
    height: 32,
  },
  {
    name: "Game Controller",
    description: "Classic game controller",
    category: "GAMING",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect x="4" y="10" width="24" height="12" rx="6" fill="#374151" stroke="#1f2937" stroke-width="1"/><circle cx="11" cy="16" r="3" fill="#6b7280"/><circle cx="21" cy="16" r="2" fill="#ef4444"/><circle cx="24" cy="13" r="2" fill="#3b82f6"/></svg>`),
    hotspotX: 16,
    hotspotY: 16,
    width: 32,
    height: 32,
  },
  {
    name: "Pixel Hand",
    description: "Retro pixel art hand",
    category: "GAMING",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect x="8" y="4" width="4" height="12" fill="#fbbf24"/><rect x="12" y="4" width="4" height="16" fill="#fbbf24"/><rect x="16" y="4" width="4" height="16" fill="#fbbf24"/><rect x="20" y="8" width="4" height="12" fill="#fbbf24"/><rect x="4" y="16" width="20" height="8" fill="#fbbf24"/><rect x="8" y="4" width="4" height="12" fill="none" stroke="#000" stroke-width="0.5"/></svg>`),
    hotspotX: 12,
    hotspotY: 4,
    width: 32,
    height: 32,
  },
  {
    name: "Magic Wand",
    description: "Magical game wand",
    category: "GAMING",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><line x1="4" y1="28" x2="22" y2="10" stroke="#6366f1" stroke-width="3"/><path d="M24 8 L26 2 L28 8 L34 10 L28 12 L26 18 L24 12 L18 10 Z" fill="#fbbf24" stroke="#f59e0b" stroke-width="1" transform="translate(-6,-4) scale(0.8)"/></svg>`),
    hotspotX: 4,
    hotspotY: 28,
    width: 32,
    height: 32,
  },

  // FASHION & BEAUTY Category (4 cursors)
  {
    name: "High Heel",
    description: "Fashionable high heel shoe",
    category: "FASHION",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M8 8 L12 16 L4 18 L2 28 L6 28 L10 20 L26 20 L24 16 L14 14 Z" fill="#ec4899" stroke="#be185d" stroke-width="1"/></svg>`),
    hotspotX: 8,
    hotspotY: 8,
    width: 32,
    height: 32,
  },
  {
    name: "Lipstick",
    description: "Glamorous lipstick",
    category: "FASHION",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect x="12" y="18" width="8" height="10" rx="1" fill="#fbbf24" stroke="#f59e0b" stroke-width="1"/><rect x="13" y="8" width="6" height="10" fill="#dc2626" stroke="#991b1b" stroke-width="1"/><path d="M13 8 L16 2 L19 8 Z" fill="#dc2626" stroke="#991b1b" stroke-width="1"/></svg>`),
    hotspotX: 16,
    hotspotY: 2,
    width: 32,
    height: 32,
  },
  {
    name: "Shopping Bag",
    description: "Chic shopping bag",
    category: "FASHION",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect x="6" y="10" width="20" height="18" rx="1" fill="#a855f7" stroke="#7e22ce" stroke-width="1"/><path d="M11 10 C11 6 13 4 16 4 C19 4 21 6 21 10" stroke="#7e22ce" stroke-width="2" fill="none"/></svg>`),
    hotspotX: 16,
    hotspotY: 4,
    width: 32,
    height: 32,
  },
  {
    name: "Diamond Ring",
    description: "Sparkling diamond ring",
    category: "FASHION",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><ellipse cx="16" cy="22" rx="8" ry="3" fill="#fbbf24" stroke="#f59e0b" stroke-width="1"/><path d="M13 8 L16 2 L19 8 L22 14 L10 14 Z" fill="#7dd3fc" stroke="#0284c7" stroke-width="1"/><path d="M13 14 L16 8 L19 14" stroke="#0284c7" stroke-width="0.5"/></svg>`),
    hotspotX: 16,
    hotspotY: 2,
    width: 32,
    height: 32,
  },

  // MINIMAL Category (3 cursors)
  {
    name: "Dot Circle",
    description: "Simple dot and circle",
    category: "MINIMAL",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="none" stroke="#000" stroke-width="1.5"/><circle cx="16" cy="16" r="2" fill="#000"/></svg>`),
    hotspotX: 16,
    hotspotY: 16,
    width: 32,
    height: 32,
  },
  {
    name: "Plus Sign",
    description: "Clean plus sign",
    category: "MINIMAL",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M16 6 L16 26 M6 16 L26 16" stroke="#000" stroke-width="2" stroke-linecap="round"/></svg>`),
    hotspotX: 16,
    hotspotY: 16,
    width: 32,
    height: 32,
  },
  {
    name: "Thin Arrow",
    description: "Minimalist thin arrow",
    category: "MINIMAL",
    type: "gallery",
    imageUrl: createSVGCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M4 4 L4 24 L12 18 L16 28 L18 27 L14 17 L24 17 Z" fill="none" stroke="#000" stroke-width="1.5"/></svg>`),
    hotspotX: 4,
    hotspotY: 4,
    width: 32,
    height: 32,
  },
];

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing cursor data
  console.log("🗑️  Clearing existing cursor data...");
  await prisma.cursor.deleteMany();
  await prisma.cursorSettings.deleteMany();

  // Insert cursors
  console.log("📝 Creating cursors...");
  for (const cursor of cursors) {
    await prisma.cursor.create({
      data: cursor,
    });
  }

  console.log(`✅ Created ${cursors.length} cursors`);

  // Summary by category
  const summary = await prisma.cursor.groupBy({
    by: ["category"],
    _count: true,
  });

  console.log("\n📊 Cursors by category:");
  summary.forEach((s) => {
    console.log(`   ${s.category}: ${s._count} cursors`);
  });

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

