import React from 'react';
import store from 'store';
import Slider from 'rc-slider';
import { map } from '../idioms';

import 'rc-slider/assets/index.css';
import './YearSlider.css';

const marks = {
  1995: '1995',
  2000: '2000',
  2005: '2005',
  2010: '2010',
  2015: '2015',
  2017: '2017',
};

function yearChange(params) {
  store.set('year', params);
  map.update();
}

export default class YearSlider extends React.PureComponent {
  render() {
    const style = { padding: '0.4em 2em 0' };

    return (
      <div style={style}>
        <Slider
          min={1995}
          max={2017}
          included={false}
          marks={marks}
          step={null}
          onChange={yearChange}
          defaultValue={2010}
          handleStyle={{ border: 'white', backgroundColor: 'silver' }} />
      </div>
    );
  }
}
