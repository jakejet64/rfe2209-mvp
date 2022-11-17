import React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

import GUISlider from './components/guislider.jsx';

const predefinedColors = ['green', 'red', 'orange', 'cyan', 'magenta', 'lavender', 'teal'];
let local_seed = 91651088027;

const StyledButton = styled(Button)`
  width: 85%;
  color: white;
  border-color: white;
  border-radius: 10px;
`;

const Partikulz = (props) => {

  const [seed, setSeed] = React.useState(91651088027); // randomization token
  const [atoms, setAtoms] = React.useState([]); // the actual atoms on the board
  const [colors, setColors] = React.useState(4); // # of different colors on the board
  const [countPerColor, setCountPerColor] = React.useState(500); // # of each color of atom on the board
  const [radius, setRadius] = React.useState(2);
  const [viscosity, setViscosity] = React.useState(.7);
  const [rules, setRules] = React.useState({});
  const [wallRepel, setWallRepel] = React.useState(40);
  const [gravity, setGravity] = React.useState(0);
  const [timer, setTimer] = React.useState();
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1);
  const [playing, setPlaying] = React.useState(true);

  // run on initial load
  React.useEffect(() => {
    updateCanvasDimensions();
    setRules(randomRules());
    setAtoms(randomAtoms(countPerColor));
    requestAnimationFrame(update);
  }, []);

  React.useEffect(() => {
    update();
    playing && setTimeout(applyRules, playbackSpeed);
  }, [atoms]);

  React.useEffect(() => reset(), [colors, countPerColor])


  // Generates a random ruleset
  function randomRules() {
    let ret = {};
    for(let from = 0; from < colors; from++) {
      let fromColor = predefinedColors[from];
      ret[fromColor] = {radius: 100};
      for(let to = 0; to < colors; to++) {
        let toColor = predefinedColors[to];
        ret[fromColor][toColor] = mulberry32() * 2 - 1;
      }
    }
    return ret;
  }
  // Resizes canvas to match size of window
  function updateCanvasDimensions() {
    document.getElementById('canvas').width = window.innerWidth * 0.85;
    document.getElementById('canvas').height = window.innerHeight;
  }
  // Random number generator
  function mulberry32() {
    let t = local_seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296.;
  }
  // Initiate Random locations for Atoms ( used when atoms created )
  function randomX() {
    return mulberry32() * (document.getElementById('canvas').width - 100) + 50;
  }
  function randomY() {
    return mulberry32() * (document.getElementById('canvas').height - 100) + 50;
  }
  // Generates the inital random Atoms
  function randomAtoms(numPerColor) {
    //console.log('we get here');
    let ret = [];
    for(let i = 0; i < colors; i++) {
      for(let j = 0; j < numPerColor; j++) {
        ret.push([randomX(), randomY(), 0, 0, predefinedColors[i]]);
      }
    }
    //console.log(ret.length);
    return ret;
  }
  // re-renders the canvas
  function update() {
    updateCanvasDimensions();
    const canvas = document.getElementById('canvas');
    const temp = canvas.getContext('2d');
    temp.fillStyle = '#000000';
    temp.fillRect(0, 0, canvas.width, canvas.height);

    //applyRules();

    atoms.forEach((atom) => {
      temp.beginPath();
      temp.arc(atom[0], atom[1], radius, 0, Math.PI * 2);
      temp.closePath();
      temp.fillStyle = atom[4];
      temp.fill();
    });

    //requestAnimationFrame(update);
  }
  // steps the atoms forward a frame
  function applyRules() {
    let newAtoms = [];
    const canvas = document.getElementById('canvas');
    // update with new velocities
    atoms.forEach(a => {
      let newAtom = [];
      let fx = 0;
      let fy = 0;
      const r2 = Math.pow(rules[a[4]].radius, 2);
      atoms.forEach(b => {
        const g = rules[a[4]][b[4]];
        const dx = a[0] - b[0];
        const dy = a[1] - b[1];
        if(dx !== 0 || dy !== 0) {
          const d = dx * dx + dy * dy;
          if(d < r2) {
            const F = g / Math.sqrt(d);
            fx += F * dx;
            fy += F * dy;
          }
        }
      });
      if(wallRepel > 0) {
        const d = wallRepel;
        const strength = 0.1;
        if (a[0] <                d) fx += (d -                a[0]) * strength;
        if (a[0] > canvas.width - d) fx += (canvas.width - d - a[0]) * strength;
        if (a[1] <                 d) fy += (d                 - a[1]) * strength;
        if (a[1] > canvas.height - d) fy += (canvas.height - d - a[1]) * strength;
      }
      fy += gravity;
      const vmix = (1. - viscosity);
      newAtom.push(a[0]);
      newAtom.push(a[1]);
      newAtom.push(a[2] * vmix + fx);
      newAtom.push(a[3] * vmix + fy);
      newAtom.push(a[4]);
      newAtoms.push(newAtom);
    });

    // update all the positions
    newAtoms.forEach(a => {
      a[0] += a[2];
      a[1] += a[3];

      // When Atoms touch or bypass canvas borders
      if (a[0] < 0) {
        a[0] = -a[0];
        a[2] *= -1;
      }
      if (a[0] >= canvas.width) {
        a[0] = 2 * canvas.width - a[0];
        a[2] *= -1;
      }
      if (a[1] < 0) {
        a[1] = -a[1];
        a[3] *= -1;
      }
      if (a[1] >= canvas.height) {
        a[1] = 2 * canvas.height - a[1];
        a[3] *= -1;
      }
    });
    setAtoms(newAtoms);
  }


  function reset() {
    setSeed(local_seed);
    setRules(randomRules());
    setAtoms(randomAtoms(countPerColor));
  }

  return (
    <div className='partikulz'>
      <div className='controls'>
        <StyledButton onClick={reset} variant="outlined">New Seed</StyledButton>
        <GUISlider name={'ms/update'} value={playbackSpeed} setValue={setPlaybackSpeed} min={1} max={1000} step={1} />
        <GUISlider name={'colors'} value={colors} setValue={setColors} min={1} max={7} step={1} />
        <GUISlider name={'partikulz/color'} value={countPerColor} setValue={setCountPerColor} min={5} max={1000} step={5} />
        <GUISlider name={'viscosity'} value={viscosity} setValue={setViscosity} min={.1} max={1} step={.05} />
        <GUISlider name={'gravity'} value={gravity} setValue={setGravity} min={0} max={5} step={.5} />
        <GUISlider name={'wall repel'} value={wallRepel} setValue={setWallRepel} min={0} max={100} step={1} />
        {/* Per color */}
          {/* color -> color */}
          {/* radius */}
      </div>
      <canvas id="canvas"></canvas>
    </div>
  )
}

export default Partikulz;