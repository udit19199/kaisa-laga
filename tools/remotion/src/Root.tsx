import { Composition } from "remotion";
import { ChaiSteam } from "./compositions/ChaiSteam";
import { CuisineOrbit } from "./compositions/CuisineOrbit";
import { CuisineTile } from "./compositions/CuisineTile";
import { JaipurArch } from "./compositions/JaipurArch";
import { VoiceWave } from "./compositions/VoiceWave";
import { HERO_SIZE, TILE_SIZE } from "./theme";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="VoiceWave"
        component={VoiceWave}
        durationInFrames={90}
        fps={30}
        width={TILE_SIZE}
        height={TILE_SIZE}
      />
      <Composition
        id="ChaiSteam"
        component={ChaiSteam}
        durationInFrames={120}
        fps={30}
        width={TILE_SIZE}
        height={TILE_SIZE}
      />
      <Composition
        id="JaipurArch"
        component={JaipurArch}
        durationInFrames={150}
        fps={30}
        width={HERO_SIZE}
        height={500}
      />
      <Composition
        id="CuisineOrbit"
        component={CuisineOrbit}
        durationInFrames={120}
        fps={30}
        width={TILE_SIZE}
        height={TILE_SIZE}
      />
      <Composition
        id="CuisineKorean"
        component={CuisineTile}
        durationInFrames={90}
        fps={30}
        width={TILE_SIZE}
        height={TILE_SIZE}
        defaultProps={{ variant: "korean" as const }}
      />
      <Composition
        id="CuisineJapanese"
        component={CuisineTile}
        durationInFrames={90}
        fps={30}
        width={TILE_SIZE}
        height={TILE_SIZE}
        defaultProps={{ variant: "japanese" as const }}
      />
      <Composition
        id="CuisineModernIndian"
        component={CuisineTile}
        durationInFrames={90}
        fps={30}
        width={TILE_SIZE}
        height={TILE_SIZE}
        defaultProps={{ variant: "modern-indian" as const }}
      />
      <Composition
        id="CuisineLevantine"
        component={CuisineTile}
        durationInFrames={90}
        fps={30}
        width={TILE_SIZE}
        height={TILE_SIZE}
        defaultProps={{ variant: "levantine" as const }}
      />
      <Composition
        id="CuisineSoutheastAsian"
        component={CuisineTile}
        durationInFrames={90}
        fps={30}
        width={TILE_SIZE}
        height={TILE_SIZE}
        defaultProps={{ variant: "southeast-asian" as const }}
      />
      <Composition
        id="CuisineBakery"
        component={CuisineTile}
        durationInFrames={90}
        fps={30}
        width={TILE_SIZE}
        height={TILE_SIZE}
        defaultProps={{ variant: "bakery" as const }}
      />
    </>
  );
};
