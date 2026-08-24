let tracks = [
  {
    name: "Kick",
    devices: [
      {
        name: "MembraneSynth",
        parameterGroups: {
          general: {
            detune: 0,
            portamento: 0,
            volume: -2,
          },
          envelope: {
            attack: 0.1,
            decay: 0.5,
            sustain: 0,
            release: 0.2,
          },
        },
      },
      {
        name: "Compressor",
        parameterGroups: {
          general: {
            threshold: 50,
            knee: 30,
            ratio: 20,
            output: 2
          },
          envelope: {
            attack: 0.1,
            release: 0.2,
            
          }
        }
      }
    ],
    clips: [
      {
        name: "Kick",
        start: "1:1:1",
        duration: "0:0:1",
        end: "1:2:1",
        notes: [
          {
            start: "0:0:0",
            duration: "0:0:1",
            note: "G1",
            velocity: 1
          }
        ]
      },
      {
        name: "Kick",
        start: "1:2:1",
        duration: "0:0:1",
        end: "1:3:1",
        notes: [
          {
            start: "0:0:0",
            duration: "0:0:1",
            note: "C1",
            velocity: 1
          }
        ]
      },
      {
        name: "Kick",
        start: "1:3:1",
        duration: "0:0:1",
        end: "1:4:1",
        notes: [
          {
            start: "0:0:0",
            duration: "0:0:1",
            note: "C1",
            velocity: 1
          }
        ]
      },
      {
        name: "Kick",
        start: "1:4:1",
        duration: "0:0:1",
        end: "2:1:1",
        notes: [
          {
            start: "0:0:0",
            duration: "0:0:1",
            note: "C1",
            velocity: 1
          }
        ]
      },
      {
        name: "Kick",
        start: "2:1:1",
        duration: "0:0:1",
        notes: [
          {
            start: "0:0:0",
            duration: "0:0:1",
            note: "C1",
            velocity: 1
          }
        ]
      },
      {
        name: "Kick",
        start: "2:2:1",
        duration: "0:0:1",
        notes: [
          {
            start: "0:0:0",
            duration: "0:0:1",
            note: "C1",
            velocity: 1
          }
        ]
      },
      {
        name: "Kick",
        start: "2:3:1",
        duration: "0:0:1",
        notes: [
          {
            start: "0:0:0",
            duration: "0:0:1",
            note: "C1",
            velocity: 1
          }
        ]
      },
      {
        name: "Kick",
        start: "2:4:1",
        duration: "0:0:1",
        notes: [
          {
            start: "0:0:0",
            duration: "0:0:1",
            note: "C1",
            velocity: 1
          }
        ]
      },
    ]
  },
  {
    name: "Bassline",
    devices: [
      {
        name: "MonoSynth",
        parameterGroups: {
          general: {
            detune: 0,
            portamento: 0,
            volume: -2,
          },
          envelope: {
            attack: 0.1,
            decay: 0.5,
            sustain: 0,
            release: 0.2,
          }
        }
      },
      {
        name: "Distortion",
        parameterGroups: {
          general: {
            amount: 20,
            oversample: 2,
          }
        }
      }
    ],
    clips: [
      {
        name: "Bassline01",
        start: "1:1:1",
        duration: "0:1:0",
        notes: [
          {
            start: "0:0:1",
            duration: "0:0:1",
            note: "G1",
            velocity: 0.8
          },
          {
            start: "0:0:2",
            duration: "0:0:1",
            note: "G#1",
            velocity: 1
          },
          {
            start: "0:0:3",
            duration: "0:0:1",
            note: "G1",
            velocity: 0.8
          }
        ]
      },
      {
        name: "Bassline01",
        start: "1:2:2",
        duration: "0:0:1"
      },
      {
        name: "Bassline02",
        start: "1:2:3",
        duration: "0:0:1"
      },
      {
        name: "Bassline03",
        start: "1:2:4",
        duration: "0:0:1"
      },
      {
        name: "Bassline01",
        start: "1:3:2",
        duration: "0:0:1"
      },
      {
        name: "Bassline02",
        start: "1:3:3",
        duration: "0:0:1"
      },
      {
        name: "Bassline03",
        start: "1:3:4",
        duration: "0:0:1"
      },
      {
        name: "Bassline01",
        start: "1:4:2",
        duration: "0:0:1" 
      },
      {
        name: "Bassline02",
        start: "1:4:3",
        duration: "0:0:1" 
      },
      {
        name: "Bassline03",
        start: "1:4:4",
        duration: "0:0:1" 
      },
      {
        name: "Bassline01",
        start: "2:1:2",
        duration: "0:0:1"
      },
      {
        name: "Bassline02",
        start: "2:1:3",
        duration: "0:0:1"
      },
      {
        name: "Bassline03",
        start: "2:1:4",
        duration: "0:0:1"
      },
      {
        name: "Bassline01",
        start: "2:2:2",
        duration: "0:0:1"
      },
      {
        name: "Bassline02",
        start: "2:2:3",
        duration: "0:0:1"
      },
      {
        name: "Bassline03",
        start: "2:2:4",
        duration: "0:0:1"
      },
      {
        name: "Bassline01",
        start: "2:3:2",
        duration: "0:0:1"
      },
      {
        name: "Bassline02",
        start: "2:3:3",
        duration: "0:0:1"
      },
      {
        name: "Bassline03",
        start: "2:3:4",
        duration: "0:0:1"
      },
      {
        name: "Bassline01",
        start: "2:4:2",
        duration: "0:0:1"
      },
      {
        name: "Bassline02",
        start: "2:4:3",
        duration: "0:0:1"
      },
      {
        name: "Bassline03",
        start: "2:4:4",
        duration: "0:0:1"
      }
    ]
  },
  {
    name: "OpenHat",
    devices: [
      {
        name: "MetalSynth",
        parameterGroups: {
          general: {
            detune: 20,
            harmonics: 2,
            volume: 0
          }
        }
      }
    ],
    clips: [
      {
        name: "OH",
        start: "1:1:3",
        duration: "0:0:1" 
      },
      {
        name: "OH",
        start: "1:2:3",
        duration: "0:0:1" 
      },
      {
        name: "OH",
        start: "1:3:3",
        duration: "0:0:1"
      },
      {
        name: "OH",
        start: "1:4:3",
        duration: "0:0:1"
      },
      {
        name: "OH",
        start: "2:1:3",
        duration: "0:0:1"
      },
      {
        name: "OH",
        start: "2:2:3",
        duration: "0:0:1"
      },
      {
        name: "OH",
        start: "2:3:3",
        duration: "0:0:1"
      },
      {
        name: "OH",
        start: "2:4:3",
        duration: "0:0:1"
      },
    ]
  },
  {
    name: "Track4",
    clips: [
      {
        name: "Lead01",
        start: "1:2:1.5",
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
  {
    name: "Track21",
    clips: []
  },
];
