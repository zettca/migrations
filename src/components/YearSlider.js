import React from 'react';
import Slider from 'rc-slider';

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
}

export default class YearSlider extends React.PureComponent {
  render() {
    const style = { padding: '0.4em 4em 1em' };

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
