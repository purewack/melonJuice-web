# MelonJuice

https://melonjuice.ml

A simple DAW for recording and exporting musical ideas!
UI: React
Audio: webAudioAPI 

## Concept and idea
This project is intended as a coding excercise for myself to sharpen up my React skills and knowledge

This project is ideal because it promotes the use of:
General:
- 👀 A good visual layout
- 🔀 Crossplatform user interaction and design
- 📚 Using different libraries
- 🌳 Git best practices like branching
- 🧪 Unit testing
- 🧠 Logical project structure for future handoff

React Specific:
- 🙅‍♂️🙅‍♀️  Immutable data model
- ↪ ↩ Use of reducers for Undo and Redo history
- 📝 Use of Memoization for optimized rendering of petentially 100s of elements
- 🏋️‍♀️🏋️‍♂️ Lifting up state- 
- 🎣 Use of custom React hooks
- 🔊 Audio Operations separte from React UI


Glossary, App logic, and Editor expectations:

```
App                        
    |➡ ControlField
    |➡ ToolField
    |➡ AudioField
        |➡ AudioTrack(s)
            |➡ AudioRegion(s)  
                    ^
        |-----------|
    |➡ Player(s)
AudioEngine
```

**AudioRegion**:
>A container of audio source with a 
start time and a duration as well 
as some extra params like fade times.

**AudioTrack**:
>A container for AudioRegions which the AudioEngine can process when playing or recording.

**AudioField**:
>A collection of AudioTracks, this represents a song as a whole.

**ToolField**:
> A space for track tools like solo and mute buttons as well as track labels. This section should follow and be on-screen all the time.

**ControlField**:
>Controls like undo and redo or new and load buttons reside here.

**AudioEngine**:
>Holds a pool of recordings used by **AudioRegion**s and allows recording and playback of audio. 

- You can drag (pink) regions within a (cyan) track and place it anywhere (even to different tracks).
- If the region you're dragging overlaps existing ones slightly, the one underneath will get cropped.
- If you cover an existing region, it gets deleted.
- If you put a small region in a big one, the big one will split into two and be either side the smaller one.
- You can drag the left and right handles to adjust the start and end of the region
the region has a sound file associated with it (dotted green) and the sound file is immutable.
- The region should allow you to adjust its start and end to the original recorded start and end even if the region was split
Before, allowing non destructive editing.
