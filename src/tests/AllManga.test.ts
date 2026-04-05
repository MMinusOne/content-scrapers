import { test, expect } from "bun:test";
import { AllManga } from "../scrapers/AllManga";

const allManga = new AllManga();

const searchResults = await allManga.search("Solo Leveling");

// console.log(searchResults);

if (searchResults[0]) {
  const id = searchResults[0]?._id;
  const characterResults = await allManga.getCharactersInfo(id);

  // console.log(characterResults);

  const mangaInfo = await allManga.getInfo(id);

  console.log(mangaInfo);
}
