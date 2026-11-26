export type MusicCategoryId = "boda" | "xv" | "hombre" | "infantil" | "bautismo";

export interface MusicTrackOption {
  id: string;
  label: string;
  title: string;
  artist: string;
  value: string;
  category: MusicCategoryId;
}

export interface MusicCategoryGroup {
  id: MusicCategoryId;
  label: string;
  shortLabel: string;
  tracks: MusicTrackOption[];
}

export const MUSIC_CATEGORIES: MusicCategoryGroup[] = [
  {
    id: "boda",
    label: "Boda & Románticas",
    shortLabel: "Boda",
    tracks: [
      {
        id: "boda-perfect",
        label: "Perfect — Ed Sheeran",
        title: "Perfect",
        artist: "Ed Sheeran",
        value: "/audio/boda-perfect.mp3",
        category: "boda",
      },
      {
        id: "boda-thousand-years",
        label: "A Thousand Years — Christina Perri",
        title: "A Thousand Years",
        artist: "Christina Perri",
        value: "/audio/boda-a-thousand-years.mp3",
        category: "boda",
      },
      {
        id: "boda-para-siempre",
        label: "Para Siempre — Benjamín Amadeo",
        title: "Para Siempre",
        artist: "Benjamín Amadeo",
        value: "/audio/boda-para-siempre.mp3",
        category: "boda",
      },
    ],
  },
  {
    id: "xv",
    label: "XV Años & Mágicas",
    shortLabel: "XV Años",
    tracks: [
      {
        id: "xv-enchanted",
        label: "Enchanted — Taylor Swift",
        title: "Enchanted",
        artist: "Taylor Swift",
        value: "/audio/xv-enchanted.mp3",
        category: "xv",
      },
      {
        id: "xv-sky-stars",
        label: "A Sky Full of Stars — Coldplay",
        title: "A Sky Full of Stars",
        artist: "Coldplay",
        value: "/audio/xv-a-sky-full-of-stars.mp3",
        category: "xv",
      },
      {
        id: "xv-quinceanera",
        label: "Quinceañera — Thalía",
        title: "Quinceañera",
        artist: "Thalía",
        value: "/audio/xv-quinceanera.mp3",
        category: "xv",
      },
      {
        id: "xv-no-crezcas",
        label: "No Crezcas Más — Tercer Cielo",
        title: "No Crezcas Más",
        artist: "Tercer Cielo",
        value: "/audio/xv-no-crezcas-mas.mp3",
        category: "xv",
      },
    ],
  },
  {
    id: "hombre",
    label: "Cumples, Club & Fiesta",
    shortLabel: "Fiesta / Club",
    tracks: [
      {
        id: "hombre-blinding-lights",
        label: "Blinding Lights — The Weeknd",
        title: "Blinding Lights",
        artist: "The Weeknd",
        value: "/audio/hombre-blinding-lights.mp3",
        category: "hombre",
      },
      {
        id: "hombre-viva-la-vida",
        label: "Viva La Vida — Coldplay",
        title: "Viva La Vida",
        artist: "Coldplay",
        value: "/audio/hombre-viva-la-vida.mp3",
        category: "hombre",
      },
      {
        id: "hombre-musica-ligera",
        label: "De Música Ligera — Soda Stereo",
        title: "De Música Ligera",
        artist: "Soda Stereo",
        value: "/audio/hombre-de-musica-ligera.mp3",
        category: "hombre",
      },
      {
        id: "hombre-gotta-feeling",
        label: "I Gotta Feeling — Black Eyed Peas",
        title: "I Gotta Feeling",
        artist: "Black Eyed Peas",
        value: "/audio/hombre-i-gotta-feeling.mp3",
        category: "hombre",
      },
    ],
  },
  {
    id: "infantil",
    label: "Infantiles & Princesas",
    shortLabel: "Infantil",
    tracks: [
      {
        id: "infantil-mi-princesa",
        label: "Mi Princesa (Infantil)",
        title: "Mi Princesa (Infantil)",
        artist: "Música Temática Infantil",
        value: "/audio/infantil-mi-princesa.mp3",
        category: "infantil",
      },
      {
        id: "infantil-fiesta-alegre",
        label: "Fiesta Infantil Alegre",
        title: "Fiesta Infantil Alegre",
        artist: "Música Temática Infantil",
        value: "/audio/infantil-fiesta-alegre.mp3",
        category: "infantil",
      },
    ],
  },
  {
    id: "bautismo",
    label: "Bautismos & Comuniones",
    shortLabel: "Bautismo / Comunión",
    tracks: [
      {
        id: "bautismo-el-bautismo",
        label: "El Bautismo (Emotiva)",
        title: "El Bautismo (Emotiva)",
        artist: "Música Temática Ceremonial",
        value: "/audio/bautismo-el-bautismo.mp3",
        category: "bautismo",
      },
      {
        id: "comunion-dulce-luz",
        label: "Mi Primera Comunión",
        title: "Mi Primera Comunión",
        artist: "Música Temática Ceremonial",
        value: "/audio/comunion-dulce-luz.mp3",
        category: "bautismo",
      },
    ],
  },
];

export const ALL_MUSIC_TRACKS: MusicTrackOption[] = MUSIC_CATEGORIES.flatMap(
  (group) => group.tracks
);

export const CURATED_AUDIO_URLS = new Set<string>([
  "none",
  ...ALL_MUSIC_TRACKS.map((t) => t.value),
]);

export function getMusicTrackByUrl(url?: string | null): MusicTrackOption | undefined {
  if (!url) return undefined;
  return ALL_MUSIC_TRACKS.find((t) => t.value === url);
}

export function getDefaultMusicCategoryForSkin(skinCategory?: string): MusicCategoryId | "all" {
  if (skinCategory === "boda") return "boda";
  if (skinCategory === "xv") return "xv";
  if (skinCategory === "hombre") return "hombre";
  if (skinCategory === "nino" || skinCategory === "nina") return "infantil";
  if (skinCategory === "bautismo" || skinCategory === "comunion") return "bautismo";
  return "all";
}
