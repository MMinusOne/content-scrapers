export interface SearchResult {
  _id: string;
  name: string;
  englishName: string;
  nativeName: string;
  thumbnail: string;
  lastChapterInfo: {
    sub: {
      chapterString: string;
      pictureUrlsProcessed: number;
    };
    raw: {
      chapterString: number;
      pictureUrlsProcessed: number;
    };
  };
  lastChapterDate: {
    sub: {
      year: number;
      month: number;
      date: number;
      minute: number;
      hour: number;
    };
    raw: {
      hour: number;
      minute: number;
      year: number;
      month: number;
      date: number;
    };
  };
  chapterCount: string;
  volumes: null;
  type: null;
  season: {
    quarter: string;
    year: number;
  };
  score: string;
  airedStart: {
    year: number;
    month: number;
    date: number;
  };
  availableChapters: {
    sub: number;
    raw: number;
  };
  lastUpdateEnd: string;
  slugTime: null;
  countryOfOrigin: string;
  characterCount: string;
}

export interface CharacterInfo {
  name: {
    full: string;
    native: string;
  };
  anilistId: number;
  image: {
    large: string;
    medium: string;
  };
  relatedRoles: {
    role: string;
    playId: string;
    format: string;
  }[];
  views: number;
  userScoreCount: number;
  userScoreAverValue: number;
  likesCount: number;
  dislikesCount: number;
  commentCount: number;
  reviewCount: number;
}

export interface RequestResponse<T = any> {
  data: T;
  status: number;
}

export interface SearchOptions {
  limit: number;
  page: number;
  translationType: "sub" | "dub";
  countryOrigin: "ALL";
}

export interface MangaInfo {
  _id: string;
  name: string;
  englishName: string;
  nativeName: string;

  thumbnail: string;
  thumbnails: string[];

  description: string;

  status: string;
  countryOfOrigin: string;

  chapterCount: string;
  volumes: string | null;

  season: {
    quarter: string;
    year: number;
  };

  score: number;
  averageScore: number;

  airedStart: DateParts;
  airedEnd: DateParts;

  lastChapterInfo: ChapterInfo;
  lastChapterDate: ChapterDate;

  availableChapters: {
    sub: number;
    raw: number;
  };

  availableChaptersDetail: {
    sub: string[];
    raw: string[];
  };

  authors: string[];
  genres: string[];
  tags: string[];

  altNames: string[];

  magazine: string;

  broadcastInterval: string;

  relatedShows: RelatedShow[];
  relatedMangas: RelatedManga[];

  characters: CharacterInfo[];

  banner: string;

  lastUpdateEnd: string;
}

export interface DateParts {
  year: number;
  month: number;
  date: number;
}

export interface ChapterInfo {
  sub: ChapterDetail;
  raw: ChapterDetail;
}

export interface ChapterDetail {
  chapterString: string;
  pictureUrlsProcessed: number;
}

export interface ChapterDate {
  sub: DateTimeParts;
  raw: DateTimeParts;
}

export interface DateTimeParts extends DateParts {
  hour: number;
  minute: number;
}

export interface RelatedShow {
  relation: string;
  showId: string;
}

export interface RelatedManga {
  relation: string;
  mangaId: string;
}

export interface MangaPanel {
  num: string;
  url: string;
}

export interface ChapterMangaPanel {
  chapter: number;
  panels: MangaPanel[];
}

export abstract class Scraper {
  abstract baseUrl: string;
  abstract search(
    query: string,
    options: SearchOptions,
  ): Promise<SearchResult[]>;
  abstract getCharactersInfo(id: string): Promise<CharacterInfo[] | null>;
  abstract getInfo(id: string): Promise<MangaInfo | null>;
}
