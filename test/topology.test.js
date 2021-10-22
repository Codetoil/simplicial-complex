import {
  compareCells,
  dimension,
  countVertices,
  cloneCells,
  normalize,
  unique,
  skeleton,
  findCell,
  incidence,
  dual,
  boundary,
  explode,
  connectedComponents,
} from "../src/topology.js";

function arr_equals(a, b) {
  console.log(a, "---", b);
  expect(a.length).toBe(b.length);
  for (var i = 0; i < a.length; ++i) {
    expect(compareCells(a[i], b[i])).toBe(0);
  }
}

test("dimension", () => {
  expect(dimension([[0], [], [1, 2, 3], [4, 5]])).toBe(2);
});

test("countVertices", () => {
  expect(
    countVertices([
      [1, 2, 3],
      [5, 6],
      [1000, 1],
    ])
  ).toBe(1001);

  expect(countVertices([])).toBe(0);
});

test("cloneCells", () => {
  var a = [
    [1, 2, 3],
    [2, 5],
  ];
  var b = cloneCells(a);

  b[0][0] = 10;

  expect(a[0][0]).toBe(1);
});

test("compareCells", () => {
  expect(compareCells([], [1])).toBeTruthy();
  expect(compareCells([1, 3, 5], [1, 3, 5, 7])).toBeTruthy();

  expect(compareCells([2], [3])).toBeTruthy();
  expect(compareCells([0], [0])).toBeFalsy();

  expect(compareCells([4, 3], [7, 0])).toBeTruthy();
  expect(compareCells([10, 11], [11, 10])).toBeFalsy();

  expect(compareCells([2, 0, 5], [3, 0, 4])).toBeTruthy();
  expect(compareCells([0, 1, 2], [2, 0, 1])).toBeFalsy();
  expect(compareCells([0, 1, 2], [1, 2, 0])).toBeFalsy();
  expect(compareCells([0, 1, 2], [1, 0, 2])).toBeFalsy();

  expect(compareCells([2, 4, 5, 6], [6, 7, 8, 9])).toBeTruthy();
  expect(compareCells([1, 2, 3, 6], [1, 2, 3, 7])).toBeTruthy();
  expect(compareCells([0, 1, 2, 3], [3, 1, 2, 0])).toBeFalsy();
});

test("normalize", () => {
  var r = [[6, 2, 3], [1, 2, 4], [0, 5, 1], [1], [5, 0, 1]],
    s = cloneCells(r);
  normalize(s);

  for (var i = 1; i < r.length; ++i) {
    var x = r[i],
      j = Math.floor(Math.random() * i);
    r[i] = r[j];
    r[j] = x;
  }
  normalize(r);

  arr_equals(s, r);
});

test("skeleton", () => {
  var r = [[1, 2, 3]];
  arr_equals(unique(normalize(skeleton(r, 1))), [
    [1, 2],
    [1, 3],
    [2, 3],
  ]);

  var h = [
    [1, 2, 3],
    [2, 3, 4],
  ];
  arr_equals(unique(normalize(skeleton(h, 1))), [
    [1, 2],
    [1, 3],
    [2, 3],
    [2, 4],
    [3, 4],
  ]);

  var k = [[1, 2, 3, 4, 5, 6, 7, 8]];
  arr_equals(normalize(skeleton(k, 0)), [
    [1],
    [2],
    [3],
    [4],
    [5],
    [6],
    [7],
    [8],
  ]);

  var s = [[0, 1, 2, 3]];
  arr_equals(skeleton(s, 2), [
    [0, 1, 2],
    [0, 1, 3],
    [0, 2, 3],
    [1, 2, 3],
  ]);
});

test("findCell", () => {
  var tris = [[1, 2, 3], [4, 5, 6], [6, 7, 8], [0], [1, 2, 5]];

  normalize(tris);

  expect(findCell(tris, [6, 4, 6])).toBe(-1);
  expect(findCell(tris, [])).toBe(-1);
  expect(findCell(tris, [10000, 1000, 1000, 10000])).toBe(-1);
  expect(findCell(tris, [-1000])).toBe(-1);

  //Test central item
  var idx = findCell(tris, [6, 4, 5]);
  expect(idx > 0).toBeTruthy();
  expect(tris[idx][0]).toBe(4);
  expect(tris[idx][1]).toBe(5);
  expect(tris[idx][2]).toBe(6);

  //Test lower extreme
  expect(findCell(tris, [0], true)).toBe(0);

  //Test upper extreme
  expect(findCell(tris, [6, 7, 8])).toBe(tris.length - 1);
});

test("buildIndex", function () {
  var from_cells = normalize([
    [0, 1],
    [0, 2],
    [1, 2],
    [1, 3],
    [2, 3],
  ]);
  var to_cells = normalize([
    [0, 1, 2],
    [0, 1, 3],
    [0, 2, 3],
    [1, 2, 3],
  ]);

  var index = incidence(from_cells, to_cells);
  expect(index.length).toBe(from_cells.length);

  console.log(from_cells, to_cells);

  for (var i = 0; i < from_cells.length; ++i) {
    var idx = index[i];
    console.log(from_cells[i], idx);
  }
});

test("dual", () => {
  var cells = normalize([
    [1, 2, 3],
    [0],
    [5, 6, 7],
    [8, 3],
    [4, 6],
    [2, 5],
    [2, 7],
    [2, 0],
  ]);

  //Compute vertex stars
  console.log("Cells = ", cells);
  var stars = dual(cells);
  console.log("Dual (sparse) = ", stars);

  var tstars = dual(cells, 9);
  console.log("Dual (dense) = ", tstars);
  arr_equals(stars, tstars);
});

test("boundary", () => {
  var tris = normalize([
    [0, 1, 2],
    [0, 1, 3],
    [0, 2, 3],
    [1, 2, 3],
  ]);

  var tetra = [[0, 1, 2, 3]];
  arr_equals(normalize(boundary(tetra, 2)), tris);
});

test("explode", () => {
  var e = normalize(explode([[0, 1, 2]]));
  console.log(e);

  arr_equals(e, normalize([[0], [1], [2], [0, 1], [1, 2], [2, 0], [0, 1, 2]]));
});

test("connectedComponents", () => {
  var graph = normalize([[0, 1], [1, 2], [2, 3], [5, 6], [4], [4, 7, 8]]);

  console.log(connectedComponents(graph));
  console.log(connectedComponents(graph, 9));
});
