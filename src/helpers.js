import * as d3 from 'd3';

export function tryNumber(value) {
  return Number(value) || value;
}

export const numColors = 9;

export const colors = {
  map: d3.schemeRdYlBu[numColors],
  selection: d3.schemeGreens[numColors]
};

export function filterNaN(obj) {
  const res = {};

  for (const key in obj) {
    const num = Number(obj[key]);

    if (!isNaN(num) && num !== 0) {
      res[key] = Number(obj[key]);
    }
  }

  return res;
}

export function createSVG(id, dims = { width: 400, height: 400 }, margins) {
  const svg = d3.select(id).append('svg')
    .attr('width', dims.width)
    .attr('height', dims.height);

  if (margins !== undefined) {
    const group = svg.append('g')
      .attr('class', 'main')
      .attr('transform', `translate(${margins.left || 0},${margins.top || 0})`);
    return group;
  }

  return svg;
}

export function getMigrationDiff(migrationData) {
  function previousYear(dataYears, year) {
    const i = dataYears.indexOf(year);
    return (i > 0) ? dataYears[i - 1] : dataYears[0];
  }

  const migrationDiff = {};
  const dataYears = Object.keys(migrationData);

  for (const year in migrationData) {
    if (year === dataYears[0]) continue;

    migrationDiff[year] = {};
    for (const c in migrationData[year]) {
      migrationDiff[year][c] = {};

      for (const c2 in migrationData[year][c]) {
        const thisValue = migrationData[year][c];
        const prevValue = migrationData[previousYear(dataYears, year)][c] || {};
        migrationDiff[year][c][c2] = thisValue[c2] - (prevValue[c2] || 0);
      }
    }
  }

  return migrationDiff;
}
