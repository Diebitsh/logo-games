export function play(url: string) {
    return new Promise(function (resolve, reject) {
        var audio = new Audio();
        audio.preload = "auto";
        audio.autoplay = true;
        audio.onerror = resolve;
        audio.onended = resolve;

        audio.src = url;
    });
}