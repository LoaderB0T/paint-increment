const _0 = [
  [1, 1, 1],
  [1, 0, 1],
  [1, 0, 1],
  [1, 0, 1],
  [1, 1, 1]
];

const _1 = [
  [0, 1, 0],
  [1, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [1, 1, 1]
];

const _2 = [
  [1, 1, 1],
  [0, 0, 1],
  [1, 1, 1],
  [1, 0, 0],
  [1, 1, 1]
];

const _3 = [
  [1, 1, 1],
  [0, 0, 1],
  [1, 1, 1],
  [0, 0, 1],
  [1, 1, 1]
];

const _4 = [
  [1, 0, 1],
  [1, 0, 1],
  [1, 1, 1],
  [0, 0, 1],
  [0, 0, 1]
];

const _5 = [
  [1, 1, 1],
  [1, 0, 0],
  [1, 1, 1],
  [0, 0, 1],
  [1, 1, 1]
];

const _6 = [
  [1, 1, 1],
  [1, 0, 0],
  [1, 1, 1],
  [1, 0, 1],
  [1, 1, 1]
];

const _7 = [
  [1, 1, 1],
  [0, 0, 1],
  [0, 1, 0],
  [1, 0, 0],
  [1, 0, 0]
];

const _8 = [
  [1, 1, 1],
  [1, 0, 1],
  [1, 1, 1],
  [1, 0, 1],
  [1, 1, 1]
];

const _9 = [
  [1, 1, 1],
  [1, 0, 1],
  [1, 1, 1],
  [0, 0, 1],
  [1, 1, 1]
];

export const getPixelText = (number: number): number[][] => {
  switch (number) {
    case 0:
      return _0;
    case 1:
      return _1;
    case 2:
      return _2;
    case 3:
      return _3;
    case 4:
      return _4;
    case 5:
      return _5;
    case 6:
      return _6;
    case 7:
      return _7;
    case 8:
      return _8;
    case 9:
      return _9;
    default:
      return _0;
  }
};
