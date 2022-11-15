import React from 'react';

const predefinedColors = ['green', 'red', 'orange', 'cyan', 'magenta', 'lavender', 'teal'];
let local_seed = 91651088027;

const Partikulz = (props) => {

  const [seed, setSeed] = React.useState(91651088027); // randomization token
  const [atoms, setAtoms] = React.useState([]); // the actual atoms on the board
  const [colors, setColors] = React.useState(4); // # of different colors on the board
  const [countPerColor, setCountPerColor] = React.useState(500); // # of each color of atom on the board
  const [backgroundColor, setBackgroundColor] = React.useState('#000000');
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
  }, []);

  React.useEffect(() => {
    update();
    playing && setTimeout(applyRules, playbackSpeed);
  }, [atoms]);


  // Generates a random ruleset
  function randomRules() {
    let ret = {};
    for(let from = 0; from < colors; from++) {
      let fromColor = predefinedColors[from];
      ret[fromColor] = {radius: 80};
      for(let to = 0; to < colors; to++) {
        let toColor = predefinedColors[to];
        ret[fromColor][toColor] = mulberry32() * 2 - 1;
      }
    }
    return ret;
  }
  // Resizes canvas to match size of window
  function updateCanvasDimensions() {
    document.getElementById('canvas').width = window.innerWidth * 0.8;
    document.getElementById('canvas').height = window.innerHeight * 0.8;
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
    let ret = [];
    for(let i = 0; i < colors; i++) {
      for(let j = 0; j < numPerColor; j++) {
        ret.push([randomX(), randomY(), 0, 0, predefinedColors[i]]);
      }
    }
    return ret;
  }
  // re-renders the canvas
  function update() {
    updateCanvasDimensions();
    const canvas = document.getElementById('canvas');
    const temp = canvas.getContext('2d');
    temp.fillStyle = backgroundColor;
    temp.fillRect(0, 0, canvas.width, canvas.height);
    atoms.forEach((atom) => {
      temp.beginPath();
      temp.arc(atom[0], atom[1], radius, 0, Math.PI * 2);
      temp.closePath();
      temp.fillStyle = atom[4];
      temp.fill();
    });
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

  return (
    <canvas id="canvas" onClick = {() => {
      setSeed(local_seed);
      setRules(randomRules());
      setAtoms(randomAtoms(countPerColor));
    }}></canvas>
  )
}

export default Partikulz;