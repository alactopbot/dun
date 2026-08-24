import { asset, type MuseumAnimal } from "../../lib/exhibits/schema";
import { AnimalStageClient } from "./AnimalStage.client";

export function AnimalStage({ animal }: { animal: MuseumAnimal }) {
  return <AnimalStageClient
    name={animal.name.zh} alt={animal.stageAlt.zh} presentation={animal.presentation}
    modelUrl={asset(animal, "model").url}
    backgroundLandscape={asset(animal, "background", "landscape").url}
    backgroundPortrait={asset(animal, "background", "portrait").url}
    posterLandscape={asset(animal, "poster", "landscape").url}
    posterPortrait={asset(animal, "poster", "portrait").url}
  />;
}
