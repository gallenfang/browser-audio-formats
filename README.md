# browser-audio-formats

A small reference and command-line probe for deciding which audio files a browser can decode directly and which should be transcoded first.

## Why this exists

When an application accepts uploads, files such as `.amr`, `.wma`, and `.ra` can be dropped into a browser preview and fail silently. The extension looks plausible, but the browser may not have a decoder for it. This list makes that boundary explicit before an upload flow tries to inspect the file.

## Format list

| Format | Description | Browser can decode directly |
| --- | --- | --- |
| mp2 | MPEG audio layer II | No — transcode first |
| mogg | Multitrack Ogg | No — transcode first |
| amr | Adaptive Multi-Rate speech audio | No — transcode first |
| awb | AMR-WB speech audio | No — transcode first |
| wma | Windows Media Audio | No — transcode first |
| ac3 | Dolby Digital audio | No — transcode first |
| eac3 | Enhanced AC-3 audio | No — transcode first |
| aifc | Compressed AIFF | No — transcode first |
| caf | Core Audio Format | No — transcode first |
| au | Sun/NeXT audio | No — transcode first |
| snd | Sounder audio | No — transcode first |
| gsm | GSM audio | No — transcode first |
| bwf | Broadcast Wave Format with broadcast metadata | No — transcode first |
| ra | RealAudio | No — transcode first |
| ram | RealAudio metadata file | No — transcode first |
| voc | Creative Voice file | No — transcode first |
| dss | Digital Speech Standard | No — transcode first |
| ds2 | DSS Pro | No — transcode first |
| dvf | Sony Digital Voice File | No — transcode first |
| msv | Sony Memory Stick Voice | No — transcode first |
| mkv | Matroska video container | No — transcode first |
| avi | AVI video container | No — transcode first |
| flv | Flash video container | No — transcode first |
| m2ts | MPEG-2 transport stream | No — transcode first |
| mts | MTS video container | No — transcode first |
| ts | MPEG transport stream (same extension as TypeScript) | No — transcode first |
| 3g2 | 3GPP2 video container | No — transcode first |
| mpg | MPEG video | No — transcode first |
| mpeg | MPEG video | No — transcode first |
| mpegts | MPEG transport stream | No — transcode first |
| mp3 | MPEG audio layer III | Yes, commonly |
| wav | WAV/PCM audio | Yes, commonly |
| m4a (AAC) | MPEG-4 audio with AAC | Yes, commonly |
| mp4 | MPEG-4 container with a supported audio track | Yes, commonly |
| ogg | Ogg audio | Yes, commonly |
| webm | WebM container with a supported audio track | Yes, commonly |

## Usage

### Node

The script uses only Node's built-in modules. Pass one or more files or directories:

```sh
node probe.js recordings/ interview.amr meeting.wav
```

Each file gets a conclusion and reason. The command exits `0` when every file is in the commonly decodable list, and `1` when a file needs transcoding, has an unknown extension, or cannot be inspected.

### Sample output

```text
$ node probe.js recordings/ interview.amr meeting.wav
recordings/call.wav: commonly browser-decodable (.wav)
interview.amr: transcode first (.amr is in the browser-unrecognized list)
meeting.wav: commonly browser-decodable (.wav)
```

### Browser

For a quick client-side check, ask the audio element what it thinks of a MIME type, then attempt an actual decode when you have an ArrayBuffer:

```js
const audio = document.createElement("audio");
const hint = audio.canPlayType(file.type); // "", "maybe", or "probably"

const context = new AudioContext();
const bytes = await file.arrayBuffer();
try {
  await context.decodeAudioData(bytes.slice(0));
  console.log("decoded", file.name, hint);
} catch {
  console.log("needs transcoding", file.name, hint);
}
```

## Caveats

`canPlayType()` returning `"maybe"` does not mean the file will play. `decodeAudioData()` is the useful test for a particular file, although it is still subject to the codecs available in that browser and operating system. Browser and operating-system decoder support varies, so treat this list as a conservative upload-flow hint rather than a promise about every installation.

`.ts` is also the TypeScript source extension, so directory scans skip it unless you pass the file explicitly.

## Background

The list comes from the client-side format detection logic of a real, live audio transcription uploader. [ScribVoice](https://scribvoice.com) also supports additional verified audio and video formats through its upload flow.

## Related format notes

The formats above that most often need transcoding, and the pages that explain what
each one means for upload:

- [wav to text](https://scribvoice.com/wav-to-text)
- [m4a to text](https://scribvoice.com/m4a-to-text)
- [voice memo to text](https://scribvoice.com/voice-memo-to-text)

## License

MIT
