/**
 * Picture Twin scene, drawn as blocky rects on a 4-unit grid.
 * Every flag on = the hidden target. The result screen turns flags off for
 * details the kid left out, so "Pip's drawing" shows what the AI had to guess.
 */
export interface SceneParts {
  hamster: boolean;
  hat: boolean;
  pancake: boolean;
  flipping: boolean;
  cafeteria: boolean;
  board: boolean;
  boardText: boolean;
  pixel: boolean;
}

export const FULL_SCENE: SceneParts = {
  hamster: true,
  hat: true,
  pancake: true,
  flipping: true,
  cafeteria: true,
  board: true,
  boardText: true,
  pixel: true,
};
