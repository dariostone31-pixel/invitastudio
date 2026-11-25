export type MusicCategoryId = "boda" | "xv" | "hombre" | "instrumental";

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  /** Etiqueta combinada lista para UI ("Título – Artista") */
  label: string;
  value: string;
  category: MusicCategoryId;
}

export interface MusicCategoryGroup {
  id: MusicCategoryId;
  label: string;
  shortLabel: string;
  tracks: MusicTrack[];
}

export const MUSIC_CATEGORIES: MusicCategoryGroup[] = [
  {
    id: "boda",
    label: "Bodas",
    shortLabel: "Bodas",
    tracks: [
      {
        id: "boda-perfect",
        title: "Perfect",
        artist: "Ed Sheeran",
        label: "Perfect – Ed Sheeran",
        value: "/audio/boda-perfect.mp3",
        category: "boda",
      },
      {
        id: "boda-a-thousand-years",
        title: "A Thousand Years",
        artist: "Christina Perri",
        label: "A Thousand Years – Christina Perri",
        value: "/audio/boda-a-thousand-years.mp3",
        category: "boda",
      },
      {
        id: "boda-para-siempre",
        title: "Para Siempre",
        artist: "Benjamín Amadeo",
        label: "Para Siempre – Benjamín Amadeo",
        value: "/audio/boda-para-siempre.mp3",
        category: "boda",
      },
    ],
  },
  {
    id: "xv",
    label: "XV Años",
    shortLabel: "XV Años",
    tracks: [
      {
        id: "xv-enchanted",
        title: "Enchanted",
        artist: "Taylor Swift",
        label: "Enchanted – Taylor Swift",
        value: "/audio/xv-enchanted.mp3",
        category: "xv",
      },
      {
        id: "xv-no-crezcas-mas",
        title: "No Crezcas Más",
        artist: "Tercer Cielo",
        label: "No Crezcas Más – Tercer Cielo",
        value: "/audio/xv-no-crezcas-mas.mp3",
        category: "xv",
      },
      {
        id: "xv-a-sky-full-of-stars",
        title: "A Sky Full of Stars",
        artist: "Coldplay",
        label: "A Sky Full of Stars – Coldplay",
        value: "/audio/xv-a-sky-full-of-stars.mp3",
        category: "xv",
      },
      {
        id: "xv-quinceanera",
        title: "Quinceañera",
        artist: "Thalía",
        label: "Quinceañera – Thalía",
        value: "/audio/xv-quinceanera.mp3",
        category: "xv",
      },
    ],
  },
  {
    id: "hombre",
    label: "Hombres & +18",
    shortLabel: "Hombres & +18",
    tracks: [
      {
        id: "hombre-viva-la-vida",
        title: "Viva La Vida",
        artist: "Coldplay",
        label: "Viva La Vida – Coldplay",
        value: "/audio/hombre-viva-la-vida.mp3",
        category: "hombre",
      },
      {
        id: "hombre-blinding-lights",
        title: "Blinding Lights",
        artist: "The Weeknd",
        label: "Blinding Lights – The Weeknd",
        value: "/audio/hombre-blinding-lights.mp3",
        category: "hombre",
      },
      {
        id: "hombre-de-musica-ligera",
        title: "De Música Ligera",
        artist: "Soda Stereo",
        label: "De Música Ligera – Soda Stereo",
        value: "/audio/hombre-de-musica-ligera.mp3",
        category: "hombre",
      },
      {
        id: "hombre-i-gotta-feeling",
        title: "I Gotta Feeling",
        artist: "Black Eyed Peas",
        label: "I Gotta Feeling – Black Eyed Peas",
        value: "/audio/hombre-i-gotta-feeling.mp3",
        category: "hombre",
      },
    ],
  },
  {
    id: "instrumental",
    label: "Instrumentales (Infantil & Clásicos)",
    shortLabel: "Instrumentales",
    tracks: [
      {
        id: "romantic-piano",
        title: "Piano Romántico",
        artist: "Instrumental",
        label: "Piano Romántico – Instrumental",
        value: "/audio/romantic-piano.wav",
        category: "instrumental",
      },
      {
        id: "lounge-warm",
        title: "Lounge Cálido",
        artist: "Instrumental",
        label: "Lounge Cálido – Instrumental",
        value: "/audio/lounge-warm.wav",
        category: "instrumental",
      },
      {
        id: "playful-celesta",
        title: "Celesta Alegre",
        artist: "Instrumental",
        label: "Celesta Alegre – Instrumental",
        value: "/audio/playful-celesta.wav",
        category: "instrumental",
      },
    ],
  },
];

export const ALL_MUSIC_TRACKS: MusicTrack[] = MUSIC_CATEGORIES.flatMap(
  (group) => group.tracks
);

export const CURATED_AUDIO_URLS: Set<string> = new Set([
  ...ALL_MUSIC_TRACKS.map((track) => track.value),
  "none",
]);

export function getMusicTrackByUrl(url?: string): MusicTrack | undefined {
  if (!url) return undefined;
  return ALL_MUSIC_TRACKS.find((track) => track.value === url);
}

export function getDefaultMusicCategoryForSkin(
  skinCategory: string
): MusicCategoryId {
  if (skinCategory === "boda") return "boda";
  if (skinCategory === "xv") return "xv";
  if (skinCategory === "hombre") return "hombre";
  return "instrumental";
}
