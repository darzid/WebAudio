let tracks = [
  {
    name: "Kick",
    devices: [
      {
        name: "MembraneSynth",
        parameters: {
          detune: 0,
          portamento: 0,
          
          attack: 0.1,
          decay: 0.5,
          sustain: 0,
          release: 0.2,
          
          volume: -2,
        }
      },
      {
        name: "Compressor",
        parameters: {
          threshold: 50,
          ratio: 20,
          attack: 0.1,
          release: 0.2,
          knee: 30,
          output: 2
        }
      }
    ],
    clips: [
      {
        name: "Kick",
        position: "1:1:1",
        duration: "0:0:1" 
      },
      {
        name: "Kick",
        position: "1:2:1",
        duration: "0:0:1" 
      },
      {
        name: "Kick",
        position: "1:3:1",
        duration: "0:0:1"
      },
      {
        name: "Kick",
        position: "1:4:1",
        duration: "0:0:1"
      },
      {
        name: "Kick",
        position: "2:1:1",
        duration: "0:0:1"
      },
      {
        name: "Kick",
        position: "2:2:1",
        duration: "0:0:1"
      },
      {
        name: "Kick",
        position: "2:3:1",
        duration: "0:0:1"
      },
      {
        name: "Kick",
        position: "2:4:1",
        duration: "0:0:1"
      },
    ]
  },
  {
    name: "Bassline",
    devices: [
      {
        name: "MonoSynth",
        parameters: {
          detune: 0,
          portamento: 0,
          
          attack: 0.1,
          decay: 0.5,
          sustain: 0,
          release: 0.2,
          
          volume: -2,
        }
      },
      {
        name: "Distortion",
        parameters: {
          amount: 20,
          oversample: 2,
        }
      }
    ],
    clips: [
      {
        name: "Bassline01",
        position: "1:1:2",
        duration: "0:0:1" 
      },
      {
        name: "Bassline02",
        position: "1:1:3",
        duration: "0:0:1" 
      },
      {
        name: "Bassline03",
        position: "1:1:4",
        duration: "0:0:1" 
      },
      {
        name: "Bassline01",
        position: "1:2:2",
        duration: "0:0:1"
      },
      {
        name: "Bassline02",
        position: "1:2:3",
        duration: "0:0:1"
      },
      {
        name: "Bassline03",
        position: "1:2:4",
        duration: "0:0:1"
      },
      {
        name: "Bassline01",
        position: "1:3:2",
        duration: "0:0:1"
      },
      {
        name: "Bassline02",
        position: "1:3:3",
        duration: "0:0:1"
      },
      {
        name: "Bassline03",
        position: "1:3:4",
        duration: "0:0:1"
      },
      {
        name: "Bassline01",
        position: "1:4:2",
        duration: "0:0:1" 
      },
      {
        name: "Bassline02",
        position: "1:4:3",
        duration: "0:0:1" 
      },
      {
        name: "Bassline03",
        position: "1:4:4",
        duration: "0:0:1" 
      },
      {
        name: "Bassline01",
        position: "2:1:2",
        duration: "0:0:1"
      },
      {
        name: "Bassline02",
        position: "2:1:3",
        duration: "0:0:1"
      },
      {
        name: "Bassline03",
        position: "2:1:4",
        duration: "0:0:1"
      },
      {
        name: "Bassline01",
        position: "2:2:2",
        duration: "0:0:1"
      },
      {
        name: "Bassline02",
        position: "2:2:3",
        duration: "0:0:1"
      },
      {
        name: "Bassline03",
        position: "2:2:4",
        duration: "0:0:1"
      },
      {
        name: "Bassline01",
        position: "2:3:2",
        duration: "0:0:1"
      },
      {
        name: "Bassline02",
        position: "2:3:3",
        duration: "0:0:1"
      },
      {
        name: "Bassline03",
        position: "2:3:4",
        duration: "0:0:1"
      },
      {
        name: "Bassline01",
        position: "2:4:2",
        duration: "0:0:1"
      },
      {
        name: "Bassline02",
        position: "2:4:3",
        duration: "0:0:1"
      },
      {
        name: "Bassline03",
        position: "2:4:4",
        duration: "0:0:1"
      }
    ]
  },
  {
    name: "OpenHat",
    devices: [
      {
        name: "MetalSynth",
        parameters: {
          detune: 20,
          harmonics: 2,
        }
      }
    ],
    clips: [
      {
        name: "OH",
        position: "1:1:3",
        duration: "0:0:1" 
      },
      {
        name: "OH",
        position: "1:2:3",
        duration: "0:0:1" 
      },
      {
        name: "OH",
        position: "1:3:3",
        duration: "0:0:1"
      },
      {
        name: "OH",
        position: "1:4:3",
        duration: "0:0:1"
      },
      {
        name: "OH",
        position: "2:1:3",
        duration: "0:0:1"
      },
      {
        name: "OH",
        position: "2:2:3",
        duration: "0:0:1"
      },
      {
        name: "OH",
        position: "2:3:3",
        duration: "0:0:1"
      },
      {
        name: "OH",
        position: "2:4:3",
        duration: "0:0:1"
      },
    ]
  },
  {
    name: "Track4",
    clips: [
      {
        name: "Lead01",
        position: "1:2:1.5",
        duration: "0:1:0"
      }
    ]
  },
  {
    name: "Track5",
    clips: []
  },
  {
    name: "Track6",
    clips: []
  },
  {
    name: "Track7",
    clips: []
  },
  {
    name: "Track8",
    clips: []
  },
  {
    name: "Track9",
    clips: []
  },
  {
    name: "Track10",
    clips: []
  },
  {
    name: "Track11",
    clips: []
  },
  {
    name: "Track12",
    clips: []
  },
  {
    name: "Track13",
    clips: []
  },
  {
    name: "Track14",
    clips: []
  },
  {
    name: "Track15",
    clips: []
  },
  {
    name: "Track16",
    clips: []
  },
  {
    name: "Track17",
    clips: []
  },
  {
    name: "Track18",
    clips: []
  },
  {
    name: "Track19",
    clips: []
  },
  {
    name: "Track20",
    clips: []
  },
];
