const audioCtx = new AudioContext();

async function loadAudio(fileName: string) {
    const response = await fetch(`sounds/${fileName}`);

    return await audioCtx.decodeAudioData(await response.arrayBuffer());
}

export async function playAudio(fileName: string) {
    const buffer = await loadAudio(fileName);
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start();
}