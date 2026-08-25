import { stegosaurusExhibit } from "../../content/exhibits/stegosaurus/exhibit";
import { triceratopsExhibit } from "../../content/exhibits/triceratops/exhibit";
import { tyrannosaurusExhibit } from "../../content/exhibits/tyrannosaurus/exhibit";
import { validateAnimal, type MuseumAnimal } from "./schema";

export const museumCatalog = [triceratopsExhibit, stegosaurusExhibit, tyrannosaurusExhibit] as const satisfies readonly MuseumAnimal[];
for (const animal of museumCatalog) {
  const errors = validateAnimal(animal);
  if (errors.length) throw new Error(`${animal.slug} catalog validation failed: ${errors.join("; ")}`);
}
if (new Set(museumCatalog.map(({ slug }) => slug)).size !== museumCatalog.length) throw new Error("Museum slugs must be unique");
export type AnimalSlug = (typeof museumCatalog)[number]["slug"];
export const animalSlugs = museumCatalog.map(({ slug }) => slug);
export function findAnimal(slug: string): MuseumAnimal | undefined { return museumCatalog.find((animal) => animal.slug === slug); }
