import React from 'react';
import store from 'store';
import Slider from 'rc-slider';
import { map } from '../idioms';

import 'rc-slider/assets/index.css';

const marks = {
  1990: '1990',
  1995: '1995',
  2000: '2000',
  2005: '2005',
  2010: '2010',
  2015: '2015',
  2017: '2017',
};

function yearChange(params) {
  console.log(params);
  store.set('years', params);
  map.update();
}

export default class YearSlider extends React.PureComponent {
  render() {
    const style = { padding: '0.6em 2em 0' };

    return (
      <div style={style}>
        <Slider.Range
          min={1990}
          max={2017}
          marks={marks}
          step={null}
          onChange={yearChange}
          defaultValue={[2005, 2015]} />
      </div>
    );
  }
}
