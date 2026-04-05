import type {
  CharacterInfo,
  MangaInfo,
  Scraper,
  SearchOptions,
  SearchResult,
} from "../../types";
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

    const request = await RequestManager.get(url.toString(), {
      headers: {
        Referer: "https://allmanga.to/",
      },
    });

    return request.data.data.mangas.edges;
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

  async getInfo(id: string): Promise<MangaInfo> {
    const pageUrl = this.basePageUrl.concat("manga/", id);
    const { data: pageHtml } = await RequestManager.getAsText(pageUrl);
    const $ = cheerio.load(pageHtml);

    const nuxtScript = $("script")
      .map((i, el) => $(el).html())
      .get()
      .find((s) => s && s.includes("window.__NUXT__"));

    const jsonStr = nuxtScript!.match(/window\.__NUXT__=(.*);?$/)?.[1];

    const nuxtData = eval(jsonStr!);

    const mangaData = nuxtData.fetch["manga:0"].manga;

    return mangaData;
  }
}
