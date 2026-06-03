export const ARCHETYPE_CARD_MAP = {
  // MODERN
  "MOD-Amulet Titan": "Amulet of Vigor",
  "MOD-Azorius Blink": "Phelia, Exuberant Shepherd",
  "MOD-Azorius Control": "Teferi, Hero of Dominaria",
  "MOD-Azorius Scepter": "Isochron Scepter",
  "MOD-Belcher": "Goblin Charbelcher",
  "MOD-Boros Belcher": "Goblin Charbelcher",
  "MOD-Boros Burn": "Boros Charm",
  "MOD-Boros Energy": "Guide of Souls",
  "MOD-Boros LD": "Price of Freedom",
  "MOD-Dimir Midrange": "Psychic Frog",
  "MOD-Dimir Oculus": "Abhorrent Oculus",
  "MOD-Domain Zoo": "Leyline Binding",
  "MOD-Eldrazi Ramp": "Sowing Mycospawn",
  "MOD-Eldrazi Tron": "Thought-Knot Seer",
  "MOD-Esper Blink": "Phelia, Exuberant Shepherd",
  "MOD-Esper Control": "Psychic Frog",
  "MOD-Goryo's Vengeance": "Goryo's Vengeance",
  "MOD-Grixis Phoenix": "Arclight Phoenix",
  "MOD-Grixis Reanimator": "Archon of Cruelty",
  "MOD-Gruul Basking Broodscale Combo": "Basking Broodscale",
  "MOD-Hammer Time": "Colossus Hammer",
  "MOD-Izzet Affinity": "Kappa Cannoneer",
  "MOD-Izzet Prowess": "Slickshot Show-Off",
  "MOD-Jeskai Blink": "Phelia, Exuberant Shepherd",
  "MOD-Jeskai Energy": "Wrath of the Skies",
  "MOD-Living End": "Living End",
  "MOD-Merfolk": "Lord of Atlantis",
  "MOD-Mono Black Midrange": "Necropotence",
  "MOD-Mono Blue Belcher": "Goblin Charbelcher",
  "MOD-Mono White Control": "Solitude",
  "MOD-Neobrand": "Neoform",
  "MOD-Rakdos Midrange": "Kroxa, Titan of Death's Hunger",
  "MOD-Ruby Storm": "Ral, Monsoon Mage",
  "MOD-Samwise Combo": "Samwise Gamgee",
  "MOD-Sultai Midrange": "Psychic Frog",
  "MOD-Temur Prowess": "Coram, the Undertaker",
  "MOD-Zoo Reanimator": "Leyline Binding",
  // STANDARD
  "STD-4c Control": "Jeskai Revelation",
  "STD-5c Elementals": "Sunderflock",
  "STD-Azorius Tempo": "Aang, Swift Savior",
  "STD-Bant Tortuga": "Smuggler's Surprise",
  "STD-Boros Burn": "Boros Charm",
  "STD-Boros Dragons": "Sarkhan, Dragon Ascendant",
  "STD-Dimir Excruciator": "Doomsday Excruciator",
  "STD-Izzet Prowess": "Stormchaser's Talent",
  "STD-Izzet Spellementals": "Eddymurk Crab",
  "STD-Jeskai Control": "Jeskai Revelation",
  "STD-Mardu Discard": "Marauding Mako",
  "STD-Mono Green Landfall": "Sazh's Chocobo",
  "STD-Mono Red Aggro": "Nova Hellkite",
  "STD-MonoRedU": "Scalding Viper",
  "STD-Naya Yuna": "Yuna, Hope of Spira",
  "STD-Orzhov Ketramose": "Ketramose, the New Dawn",
  "STD-Selesnya Landfall": "Dyadrine, Synthesis Amalgam",
  "STD-Selesnya Ouroboroid": "Ouroboroid",
};

export async function getScryfallImage(cardName) {
  if (!cardName) return null;
  const cacheKey = `scryfall_img::${cardName}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;
  try {
    const res = await fetch(
      `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}&format=json`,
      {
        headers: {
          "User-Agent": "RCQ-Reporter/1.0",
          "Accept": "application/json",
        },
      },
    );
    if (!res.ok) {
      console.warn(`[Scryfall] ${res.status} para "${cardName}"`);
      return null;
    }
    const data = await res.json();
    console.log(`[Scryfall] "${cardName}"`, data.image_uris); // ← LOG
    const imgUrl =
      data.image_uris?.art_crop ??
      data.card_faces?.[0]?.image_uris?.art_crop ??
      null;
    console.log(`[Scryfall] imgUrl:`, imgUrl); // ← LOG
    if (imgUrl) localStorage.setItem(cacheKey, imgUrl);
    return imgUrl;
  } catch (e) {
    console.error(`[Scryfall] Error fetching "${cardName}":`, e);
    return null;
  }
}
