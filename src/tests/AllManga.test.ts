import { test, expect } from "bun:test";
import { AllManga } from "../../scrapers/AllManga";

const allManga = new AllManga();

const searchResults = await allManga.search("Solo Leveling");

console.log(searchResults);

if (searchResults[0]) {
  const characterResults = await allManga.getCharactersInfo(
    searchResults[0]?._id,
  );

  console.log(characterResults);
}
