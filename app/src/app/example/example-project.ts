import { LobbyResponse } from '@shared/api';

import { getPixelArray, Layer } from '../lobby/canvas/canvas.component';

/**
 * A hand-authored example project, so a first-time visitor can see what a finished
 * one looks like before signing up. Every contributor below is invented.
 *
 * The artwork is stored as a 64x64 character grid: `.` is an untouched pixel, any
 * other character is the contribution that claimed it (`1`-`9` then `a`-`g`, in the
 * order the contributions landed). Nobody may paint over an existing pixel, which is
 * the same rule the real canvas enforces -- so a later contribution simply has gaps
 * where an earlier one got there first. Edit the grid to change the picture.
 */
const ORDER = '123456789abcdefg';
const NEWLINE = /\r?\n/;

export const EXAMPLE_SIZE = 64;

const ART = `
.........................................................7......
.....................................................7...7...7..
..........................a..........................77..7..77..
.....88888...............aaa............................777.....
...88.....88............a.a.a.....................77..777.777..7
..8.........8..........a..a..a............9........7.77.....77.7
.8...........8........aaaaaaaaa..............999.....7.......7..
..8888888888888........a..a..a..............9...9...77.......77.
........................a.a.a..............9.....7777.........77
.........................aaa................9...9...77.......77.
..........................a..................999.9...7.......7..
...........................a...................999.7.77.....77.7
............................aa.a..............9...77..777.777..7
.........8888.................a................999......777.....
........8....8...............a.a..........4..........77..7..77..
.......8......8.................a........4.4.........7...7...7..
......8888888888.......66666666.a.......4...4.444444.....7......
......................66.......66a.a...4.....4.4..4.............
.....................66...66....66a...4.......44..4..........aa.
....................66...........6.a.4.........4..4.aa...aa....a
....................6........66...6.4..........44.4...a.a.......
....................6...66........6.4..........44.4....a........
....................6.............64...........4444......aa...aa
........2...........6.......66....4............aa.4.aa.....a.a..
.......2.2..........6..........6646..............a.4........a...
.......2.2.........26..66.......4.6...............a.4...........
......2.2.2.......2.2......66..44333333333333333333334..........
......22.22.......2226........4443444444444444444444344.........
.....22...22.....22.266.........63..................3...........
.....2.....2....22...266.......663.55555........55553...........
....2.......2...2.....266666666..3.5.5.5........5.5.3....b......
....2.......2..2......2..6666..6.3.555555555555.55553..bb.bb....
...2.........22.......26.6666.6..3.5.5.55.....5.5.5.3.b.....b...
...2.........22........2666666...3.555555.....5.55553.b.....bbbb
..2..........22.........26666....3......5.....5.....3b......bb..
..2.........2..2........26666....3......5....551....3.b.....b...
.2.............2........26666....3......5.....1....13.b.1...b.1.
.21.............2........2666....3......5.....111111111111bbb1bb
21..............21.......6266...13......51.1115.....3....b111111
11..............12...1...6166..1.33313311113333333333....b....b.
..11111....1..1111111111111111111111111.........................
......11111111...............................eee..eee..eee..eee.
.....f.f..............f.f.....................e....e....e....e..
....f.f.f....f.f..d..f.f.f......g...........g.eeeeeeeeeeeeeeeee.
.....fff....f.f.f.dd..fff.......gg.........gg.e....e....e....e..
......f......fff..ddd..f........ggg.......ggg.eeeeeeeeeeeeeeeee.
.....f.f......f...dd.df.f.......gggg.....gggg.e....e....e....e..
......f......f.f..dd..dd........ggggggggggggg.e....e....e....e..
..............f...dd.dddd.......ggg..ggg..gggg..................
.............cccccccd....d......ggg..ggg..ggggg.f.f........f.f..
........ccccc.....ddccccc.d.....ggggggggggggg.gf.f.f......f.f.f.
......ccc.........ddddddcccd.....gggg...gggg..g.fff........fff..
....ccc....ddddddddcccccc.ccc.....ggggggggg...g..f....f.f...f...
....c.......ddddddddd.......c.....ggggggggg....gf.f..f.f.f.f.f..
...c.........ddddddd.........c....ggggggggg...g..f....fff...f...
...c.........................c....ggggggggg...g........f........
...c.........................c...ggggggggggg..g.......f.f.......
....cccccc.............cccccc..fgfgggggggggggg.......ggf.ggg....
....ccc...................ccc.f.f.f.................ggggggggg...
......cccccccccc........ccc....fff...................ggggggg....
........ccccc.......ccccc.......f.....................ggggg.....
.............ccccccc...........f.f.....................ggg......
................................f.......................g.......
................................................................`;

const CONTRIBUTORS = [
  { name: 'Mira', drew: 'the ground' },
  { name: 'Timo', drew: 'mountains' },
  { name: 'Tobias', drew: 'a house' },
  { name: 'Ana', drew: 'the roof' },
  { name: 'Jonas', drew: 'a door and windows' },
  { name: 'Lea', drew: 'a tree' },
  { name: 'Nora', drew: 'the sun' },
  { name: 'Felix', drew: 'clouds' },
  { name: 'Ida', drew: 'chimney smoke' },
  { name: 'Ravi', drew: 'birds and a kite' },
  { name: 'Samir', drew: 'bushes' },
  { name: 'Emil', drew: 'a pond' },
  { name: 'Alba', drew: 'a sailboat' },
  { name: 'Yuki', drew: 'a fence' },
  { name: 'Selma', drew: 'flowers' },
  { name: 'Ela', drew: 'the cat, and a heart' },
] as const;

/** Pixels per contribution, index 0 first. */
const pixelsByIteration = ((): { x: number; y: number }[][] => {
  const result: { x: number; y: number }[][] = ORDER.split('').map(() => []);
  const rows = ART.trim().split(NEWLINE);
  rows.forEach((row, y) => {
    row.split('').forEach((char, x) => {
      const index = ORDER.indexOf(char);
      if (index >= 0) {
        result[index].push({ x, y });
      }
    });
  });
  return result;
})();

export const exampleContributions = CONTRIBUTORS.map((contributor, index) => ({
  ...contributor,
  pixelCount: pixelsByIteration[index].length,
}));

export const exampleProject: LobbyResponse = {
  id: 'example',
  name: 'The house on the hill',
  isCreator: false,
  settings: {
    width: EXAMPLE_SIZE,
    height: EXAMPLE_SIZE,
    maxPixels: 200,
    timeLimit: 15,
  },
  pixelIterations: CONTRIBUTORS.map((contributor, index) => ({
    id: `example-${index + 1}`,
    name: contributor.name,
    confirmed: true,
    pixels: pixelsByIteration[index],
  })),
};

function layerOf(color: string, iterations: number[]): Layer {
  const pixels = getPixelArray(EXAMPLE_SIZE, EXAMPLE_SIZE);
  iterations.forEach(index => {
    pixelsByIteration[index]?.forEach(pixel => {
      pixels[pixel.x][pixel.y] = true;
    });
  });
  return { color, pixels };
}

const settled = '#000000';
const fresh = '#ff0052';

/**
 * Layers for the canvas after `count` contributions, drawn the way the history view
 * draws them: the contribution that landed last in accent, everything before it in ink.
 * `count` of 0 is an untouched sheet.
 */
export function exampleLayers(count: number, highlightLast = true): Layer[] {
  const done = Math.max(0, Math.min(CONTRIBUTORS.length, Math.round(count)));
  if (!highlightLast) {
    return [layerOf(settled, range(0, done))];
  }
  return [layerOf(fresh, done > 0 ? [done - 1] : []), layerOf(settled, range(0, done - 1))];
}

function range(from: number, to: number): number[] {
  return Array.from({ length: Math.max(0, to - from) }, (_, i) => from + i);
}

export const EXAMPLE_CONTRIBUTION_COUNT = CONTRIBUTORS.length;
