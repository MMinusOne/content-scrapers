import type {
  CharacterInfo,
  MangaInfo,
  MangaPanel,
  Scraper,
  SearchOptions,
  SearchResult,
} from "../types";
import * as cheerio from "cheerio";
import { RequestManager } from "../lib/RequestManager";

export class AllManga implements Scraper {
  baseUrl: string = "https://api.allanime.day/api";
  basePageUrl: string = "https://allmanga.to/";

  constructor() {}

  async search(
    query: string,
    options: SearchOptions = {
      countryOrigin: "ALL",
      limit: 100,
      page: 1,
      translationType: "sub",
    },
  ): Promise<SearchResult[]> {
    const extensions = {
      persistedQuery: {
        version: 1,
        sha256Hash:
          "2d48e19fb67ddcac42fbb885204b6abb0a84f406f15ef83f36de4a66f49f651a",
      },
    };

    const url = new URL(this.baseUrl);

    url.searchParams.append(
      "variables",
      JSON.stringify({
        ...options,
        search: {
          query,
          isManga: true,
        },
      }),
    );
    url.searchParams.append("extensions", JSON.stringify(extensions));

    try {
      const request = await RequestManager.get(url.toString(), {
        headers: {
          Referer: "https://allmanga.to/",
        },
      });

      if (!request?.data?.data?.mangas?.edges) {
        throw new Error("Invalid API response structure");
      }

      return request.data.data.mangas.edges;
    } catch (error) {
      console.error("Search failed: ", error);
      return [];
    }
  }

  async getCharactersInfo(id: string): Promise<CharacterInfo[]> {
    const variables = {
      search: {
        playId: id,
        format: "manga",
      },
      page: 1,
    };

    const extensions = {
      persistedQuery: {
        version: 1,
        sha256Hash:
          "e58d9bb1ec4e2828b77dce3560176e49fbe578834ea16e0b5024442870b26560",
      },
    };

    const url = new URL(this.baseUrl);

    url.searchParams.append("variables", JSON.stringify(variables));
    url.searchParams.append("extensions", JSON.stringify(extensions));

    const request = await RequestManager.get(url.toString(), {
      headers: {
        Referer: "https://allmanga.to/",
      },
    });

    return request.data.data.characters.edges;
  }

  async getInfo(id: string): Promise<MangaInfo | null> {
    try {
      const pageUrl = this.basePageUrl.concat("manga/", id);
      const { data: pageHtml } = await RequestManager.getAsText(pageUrl);
      const $ = cheerio.load(pageHtml);

      const nuxtScript = $("script")
        .map((i, el) => $(el).html())
        .get()
        .find((s) => s && s.includes("window.__NUXT__"));

      if (!nuxtScript) throw new Error("NUXT script not found");

      const jsonMatch = nuxtScript.match(/window\.__NUXT__=(.*);?$/);
      if (!jsonMatch) throw new Error("Failed to extract NUXT JSON");

      const nuxtData = eval(jsonMatch[1]!);

      const mangaData = nuxtData?.fetch?.["manga:0"]?.manga;
      if (!mangaData) throw new Error("Manga data missing");

      return mangaData;
    } catch (error) {
      console.error(`getInfo failed for id=${id}:`, error);
      return null;
    }
  }

  async fetchChapterPanels(id: string, chapter: number): Promise<MangaPanel[]> {
    const extensions = {
      persistedQuery: {
        version: 1,
        sha256Hash:
          "a062f1b131dae3d17c1950fad14640d066b988ac10347ed49cfbe70f5e7f661b",
      },
    };

    const variables = {
      mangaId: id,
      translationType: "sub",
      chapterString: chapter.toString(),
      limit: 10_0000,
      offset: 0,
    };

    const url = new URL(this.baseUrl);

    url.searchParams.append("variables", JSON.stringify(variables));
    url.searchParams.append("extensions", JSON.stringify(extensions));

    try {
      const request = await RequestManager.get(url.toString(), {
        headers: { Referer: "https://allmanga.to/" },
      });

      const edges = request?.data?.data?.chapterPages?.edges;
      if (!edges || edges.length === 0) {
        throw new Error(`No panels found for chapter ${chapter}`);
      }

      return edges[0].pictureUrls.map((p: any) => ({
        name: p.num,
        url: edges[0].pictureUrlHead.concat(p.url),
      }));
    } catch (error: any) {
      console.error(`Failed chapter ${chapter}:`, error.message);
      return [];
    }
  }

  async fetchPanels(
    id: string,
  ): Promise<{ chapter: number; panels: MangaPanel[] }[]> {
    const mangaInfo = await this.getInfo(id);
    if (!mangaInfo) return [];

    const results = [];

    for (let i = 0; i < Number(mangaInfo.chapterCount); i++) {
      try {
        const panels = await this.fetchChapterPanels(id, i);
        console.log(`Chapter: ${i}`);
        results.push({ chapter: i, panels });
      } catch (err: any) {
        console.error(`Skipping chapter ${i}:`, err.message);
      }
    }

    return results;
  }
}
