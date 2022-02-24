<template>

  <div class="flex h-screen relative flex-col lg:flex-row relative">
    <div class="h-screen w-screen bg-gray-600 bg-opacity-90 flex items-center justify-center absolute z-[99999]"
         v-if="files.length ==0">
      <div class="w-6/12 p-8 text-center">
        <p class="text-2xl font-bold text-white">Select some MP3s from your PC</p>
        <button
            class="rounded-xl flex justify-center items-center py-2  px-4 border border-white mt-5 text-white mx-auto"
            @click="openFileSelector">
          <MusicNotePlusIcon class="mr-2"/>
          <span class="font-bold">Select Mp3</span>
        </button>
      </div>
    </div>
    <div :style="{background:`url('${AlbumArt}')  top center no-repeat`, backgroundSize:'cover', position:'absolute'}"
         class="backImage"></div>
    <input type="file" multiple class="hidden" ref="fileSelector" accept=".mp3,audio/*" @change="onFileChange">
    <PlayerWrap :currentFile="currentFile" @playEnded="playEnded" @playNext="playNextFile"
                @playPrevious="playPreviousFile" @pause="pause" @play="play" @repeat="repeat"/>
    <div class="playlistWrap" :class="showPlaylist?'show':'hide'">
      <PlaylistWrap :files="files" @playFile="loadAndPlayFile" :currentFileID="currentFile.id"
                    :currentFileIsPlaying="currentFile.isPlaying" @play="play" @pause="pause"/>
    </div>
    <div class="floating-btn">
      <div class="flex flex-col justify-center items-center p-1 cursor-pointer" @click="openFileSelector">
        <PlusIcon class="text-white"/>
        <p class="text-xs text-white">Add Mp3</p>
      </div>
    </div>
    <div class="floating-btn-bottom">
      <div class="flex flex-col justify-center items-center p-1 cursor-pointer" @click="showPlaylist = !showPlaylist">

        <PlaylistMusicIcon class="text-white"/>
        <p class="text-xs text-white">Playlist</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import PlayerWrap from "@/components/PlayerWrap";
import PlaylistWrap from "@/components/PlaylistWrap";
import PlusIcon from "vue-material-design-icons/Plus";
import PlaylistMusicIcon from "vue-material-design-icons/PlaylistMusic";
import MusicNotePlusIcon from "vue-material-design-icons/MusicNotePlus";
import MP3Tag from "mp3tag.js"
import {computed, reactive, ref} from "vue";

let currentFile = reactive({
  id: null,
  tags: {
    artist: "Artist",
    title: "Song Title",
  },
  fileData: {},
  isPlaying: false
});
let files = reactive([]);
let repeatMode = ref('off');
const fileSelector = ref("");
let showPlaylist = ref(false);
const openFileSelector = () => {
  fileSelector.value.click();
}
let AlbumArt = computed(() => {
  if (currentFile.tags.v2) {
    try {
      let data = currentFile.tags.v2.APIC[0].data;
      let format = currentFile.tags.v2.APIC[0].format;
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
const onFileChange = async (event) => {
  let uploadedFiles = event.target.files;
  let filesLength = files.length;
  for (let i = 0; i < uploadedFiles.length; i++) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target.result
      const mp3tag = new MP3Tag(buffer)
      mp3tag.read()
      let file = {
        id: filesLength, tags: mp3tag.tags, fileData: uploadedFiles[i], isPlaying: false,
      }
      if(filesLength===0){
        loadAndPlayFile(file)
      }
      files.push(file);
      filesLength++;
    }
    reader.readAsArrayBuffer(uploadedFiles[i]);
  }
};
const loadAndPlayFile = (file) => {
  currentFile.id = file.id;
  currentFile.tags = file.tags;
  currentFile.fileData = file.fileData;
  currentFile.isPlaying = true;
  files.forEach(file => {
    file.isPlaying = false;
  })
};

const play = () => {
  currentFile.isPlaying = true;
}
const pause = () => {
  currentFile.isPlaying = false;
}

const repeat = (mode) => {
  repeatMode.value = mode;
}

const playEnded = () => {
  let currentFileIndex = files.findIndex(element => element.id === currentFile.id);
  if (repeatMode.value === 'one') {
    loadAndPlayFile(files[currentFileIndex]);
  }

  if (repeatMode.value === 'all') {
    if (currentFileIndex < (files.length - 1)) {
      loadAndPlayFile(files[currentFileIndex + 1])
    } else {
      loadAndPlayFile(files[0])
    }
  }

  if (repeatMode.value ==="off"){
    if (currentFileIndex < (files.length - 1)) {
      loadAndPlayFile(files[currentFileIndex + 1])
    }
  }

};
const playNextFile = () => {

  let currentFileIndex = files.findIndex(element => element.id === currentFile.id);

  if (currentFileIndex < (files.length - 1)) {
    loadAndPlayFile(files[currentFileIndex + 1])
  }
};
const playPreviousFile = () => {
  let currentFileIndex = files.findIndex(element => element.id === currentFile.id);
  if (currentFileIndex !== 0) {
    loadAndPlayFile(files[currentFileIndex - 1])
  }
}
</script>

