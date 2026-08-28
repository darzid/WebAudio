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
        start: "0:0:0",
        duration: "0:1:0",
        end: "1:0:0",
        notes: [
          {
            start: "0:0:0",
            duration: "0:0:1",
            note: "G1",
            velocity: 1
          },
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
        start: "0:0:0",
        duration: "0:1:0",
        end: "1:0:0",
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
        start: "0:0:2",
        duration: "0:0:1",
        end: "0:0:3"
      },
      {
        name: "OH",
        start: "0:1:2",
        duration: "0:0:1",
        end: "0:1:3"
      },
      {
        name: "OH",
        start: "0:2:2",
        duration: "0:0:1",
        end: "0:2:3"
      },
    ]
  },
  {
    name: "Track4",
    clips: [
      {
        name: "Lead01",
        start: "0:0:1.5",
        duration: "0:1:0",
        end: "0:1:1.5"
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
