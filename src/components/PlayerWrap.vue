<template>
  <audio :src="currentAudioSrc" ref="htmlAudioPlayer"/>
  <div class="h-100 flex-1 flex items-center justify-center relative">
    <div class="w-4/5 ">
      <div class="flex  flex-col w-100 container">
        <div class="flex">
          <div class="album-art">
            <div :style="{background:`url('${AlbumArt}') red center center no-repeat`, backgroundSize:'cover'}"
                 class="album-art"></div>
          </div>
          <div class="song-details flex-1  flex flex-col justify-start  ml-8  py-4">
            <div class="flex justify-between items-center mb-6">
              <div class="flex">
                <button class="mr-4" @click="$emit('playPrevious')">
                  <SkipPreviousIcon :size="32"/>
                </button>
                <button id="play"
                        class="rounded-xl border border-black w-12 h-12 flex items-center justify-center"
                        @click="togglePlay">
                  <PlayIcon :size="32" v-if="!currentFile.isPlaying"/>
                  <PauseIcon :size="32" v-if="currentFile.isPlaying"/>
                </button>
                <button class="ml-4" @click="$emit('playNext')">
                  <SkipNextIcon :size="32"/>
                </button>
              </div>
              <div class="flex">
                <button @click="repeatModeChange">
                  <RepeatVariantIcon v-if="repeatMode ==='all'"/>
                  <RepeatOnceIcon v-if="repeatMode ==='one'"/>
                  <RepeatOffIcon v-if="repeatMode ==='off'"/>
                </button>
                <div class="bg-gray-500 rounded-full text-white text-xs px-3 flex justify-center items-center ml-2">
                  <p>{{repeatMode}}</p>
                </div>
              </div>
            </div>
            <div id="description" class="flex items-center">
              <div class="flex-1">
                <p class="text-5xl font-bold ">{{ currentFile.tags.title }}</p>
                <p class="font-thin ">
                  <span>{{ currentFile.tags.artist || currentFile.fileData.name }}</span>
                </p>
                <div v-if="currentFile.tags.v1">
                  <p>
                    <span v-if="currentFile.tags.v1.album">{{ currentFile.tags.v1.album }}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-12 flex justify-between items-center ">
          <div><p class="text-xs mr-2">{{ fancyTimeFormat(playTimeData.currentSeconds) }}</p></div>
          <div class="progress w-100 h-1 bg-gray-400 flex-1 relative">
            <div class="circle-controller w-3 h-3 bg-gray-900 rounded-xl absolute -top-1 border border-black "
                 :style="{left: playTimeData.progressPercentage}"></div>
            <div :style="{width: playTimeData.progressPercentage}" class="bg-gray-600 h-1 progress-bar"></div>
          </div>
          <div><p class="text-xs ml-2">{{ fancyTimeFormat(playTimeData.duration) }}</p></div>
        </div>
      </div>
    </div>
    <div id="wave-wrap" class="wave-wrap">
      <canvas id="canvas" ref="playerCanvas" class="playerCanvas"></canvas>
    </div>
  </div>
</template>
<script setup>
import PlayIcon from "vue-material-design-icons/Play.vue";
import PauseIcon from "vue-material-design-icons/Pause.vue";
import SkipNextIcon from "vue-material-design-icons/SkipNext";
import SkipPreviousIcon from "vue-material-design-icons/SkipPrevious";
import RepeatVariantIcon from "vue-material-design-icons/RepeatVariant";
import RepeatOffIcon from "vue-material-design-icons/RepeatOff";
import RepeatOnceIcon from "vue-material-design-icons/RepeatOnce";
import {reactive, ref, defineProps, defineEmits, computed, watch, onMounted} from "vue";

let currentAudioSrc = ref("");
let isLoaded = ref(false)
let playTimeData = reactive({
  duration: 0,
  progressPercentage: "0%",
  currentSeconds: 0,
});
const htmlAudioPlayer = ref("");
const playerCanvas = ref("");
let audioContext = null;
let audioSrc = null;
let analyzer = null;
let audioPlayer = null;
let canvas = null;
let repeatMode = ref('off')
const props = defineProps({
  currentFile: {
    type: Object,
    default() {
      return {
        id: null,
        tags: {
          artist: "Artist",
          title: "Hellooo i am the title",
        },
        fileData: {},
        isPlaying: ref(false)
      }
    },
  },
});
const emit = defineEmits(['change', 'delete', 'playEnded', 'playPrevious', 'playNext', 'pause', 'play', 'repeat'])
const fancyTimeFormat = (duration) => {
  // Hours, minutes and seconds
  let hrs = ~~(duration / 3600);
  let mins = ~~((duration % 3600) / 60);
  let secs = ~~duration % 60;
  // Output like "1:01" or "4:03:59" or "123:03:59"
  let ret = "";
  if (hrs > 0) {
    ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
  }
  ret += "" + mins + ":" + (secs < 10 ? "0" : "");
  ret += "" + secs;
  return ret;
};
const togglePlay = () => {
  if (props.currentFile.isPlaying) {
    audioPlayer.pause();
  } else {
    audioPlayer.play();
  }
};
const updateTimer = () => {
  playTimeData.currentSeconds = parseInt(audioPlayer.currentTime);
  playTimeData.progressPercentage = (((playTimeData.currentSeconds / parseInt(audioPlayer.duration)) * 100) || 0) + '%';
};
const load = () => {
  if (audioPlayer.readyState >= 2) {
    isLoaded.value = true;
    playTimeData.duration = parseInt(audioPlayer.duration);
  } else {
    throw new Error("Failed to load sound file.");
  }
};
const repeatModeChange = () => {
  if (repeatMode.value === 'off') {
    repeatMode.value = 'one'
  } else if (repeatMode.value === 'one') {
    repeatMode.value = 'all';
  } else if (repeatMode.value === 'all') {
    repeatMode.value = 'off';
  }

  emit('repeat', repeatMode.value);
};
let AlbumArt = computed(() => {

  let loadedFile = props.currentFile;

  if (loadedFile.tags.v2) {
    try {
      let data = loadedFile.tags.v2.APIC[0].data;
      let format = loadedFile.tags.v2.APIC[0].format;
      let base64String = "";
      for (let i = 0; i < data.length; i++) {
        base64String += String.fromCharCode(data[i]);
      }
      return `data:${format};base64,${window.btoa(base64String)}`
    } catch (e) {
      return './no_albumart.png'
    }


  } else {
    return './no_albumart.png'
  }
});
onMounted(() => {
  audioPlayer = htmlAudioPlayer.value;
  canvas = playerCanvas.value;
  audioPlayer.addEventListener('timeupdate', updateTimer);
  audioPlayer.addEventListener("loadeddata", load);
  audioPlayer.addEventListener("pause", () => {
    emit('pause');
  });
  audioPlayer.addEventListener("play", () => {
    emit('play');
  });
  audioPlayer.addEventListener("ended", () => {
    audioPlayer.currentTime = 0;
    emit('playEnded')
  })
});
watch(
    () => props.currentFile.fileData,
    (newVal) => {
      audioPlayer.src = URL.createObjectURL(newVal);
      audioPlayer.play();
      if (audioContext == null) {
        audioContext = new AudioContext()
        audioSrc = audioContext.createMediaElementSource(audioPlayer);
        analyzer = audioContext.createAnalyser();
        audioSrc.connect(analyzer);
        audioSrc.connect(audioContext.destination);
      }
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      let canvasCtx = canvas.getContext("2d");
      analyzer.fftSize = 256;
      // Print the analyze frequencies
      let bufferLength = analyzer.frequencyBinCount;
      const frequencyData = new Uint8Array(bufferLength);
      analyzer.getByteFrequencyData(frequencyData);
      let WIDTH = canvas.width;
      let HEIGHT = canvas.height;
      let barWidth = (WIDTH / bufferLength) * 1.25;
      let barHeight;
      let x = 0;
      let renderFrame = () => {
        requestAnimationFrame(renderFrame);
        x = 0;
        analyzer.getByteFrequencyData(frequencyData);
        canvasCtx.fillStyle = "#000";
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
        for (let i = 0; i < bufferLength; i++) {
          barHeight = frequencyData[i];
          let r = 255;
          let g = 255;
          let b = 255;
          canvasCtx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
          canvasCtx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
          x += barWidth;
        }
      }
      audioPlayer.play();
      renderFrame();
    }
);
watch(
    () => props.currentFile.isPlaying,
    (newValue) => {
      if (newValue == false) {
        //audio is not playing
        audioPlayer.pause()
      } else {
        audioPlayer.play()
      }
    }
);

</script>