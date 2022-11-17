import React from 'react';

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import MuiInput from '@mui/material/Input';
import VolumeUp from '@mui/icons-material/VolumeUp';

const Input = styled(MuiInput)`
  width: 70%;
  background-color: #3C3C3C;
  color: white;
  border-radius: 10px;
  padding: 0px 10px;
`;

const StyledTypography = styled(Typography)`
  color: white;
`;

const StyledSlider = styled(Slider)`
  width: 85%;
  color: white;
`;

const GUISlider = ({value, setValue, min, max, step, name}) => {
  return (
    <div className='guislider'>
      <StyledTypography id="input-slider">
        {name}
      </StyledTypography>
      <StyledSlider
        value={value}
        onChange={(e) => setValue(e.target.value)}
        min={min}
        max={max}
        step={step}
        aria-labelledby="input-slider"
      />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        inputProps={{
          step: step,
          min: min,
          max: max,
          type: 'number',
          'aria-labelledby': 'input-slider',
        }}
      />
    </div>
  )
}

export default GUISlider;