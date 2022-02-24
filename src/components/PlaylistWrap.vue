
<template>

  <div class="w-full z-10">
    <div class="nav h-10 flex justify-between items-center px-4">
      <div>
        <p class="text-sm uppercase text-white	">   {{ files.length }} {{ files.length === 1 ? 'File' : 'Files' }}  In Playlist</p>
      </div>
    </div>
    <div class="">

      <template v-for="(file,index) in props.files" :key="index">
        <div class="px-4 mb-1">
          <div class="p-4 flex items-center justify-between rounded text-white" :class="props.currentFileID === file.id ?'bg-gray-600':''">
            <div class="flex items-center">
              <button class="mr-2 rounded-xl w-8 h-8 bg-black text-center flex justify-center items-center" @click.prevent="pause" v-if="props.currentFileID === file.id && props.currentFileIsPlaying">
                <PauseIcon class=""/>
              </button>
              <button class="mr-2 rounded-xl w-8 h-8 bg-black text-center flex justify-center items-center" @click.prevent="playSelectedFile(file)" v-else>
                <PlayIcon class=""/>
              </button>

              <p class="font-bold">{{ file.tags.title || file.fileData.name }}</p>
            </div>
          </div>
        </div>

      </template>
    </div>

  </div>

</template>
<script setup>
import PlayIcon from "vue-material-design-icons/Play";
import PauseIcon from "vue-material-design-icons/Pause";

import {defineProps, defineEmits} from "vue";
const props = defineProps({
  files:{
    type:Array
  },
  currentFileID: {
    type: Number
  },
  currentFileIsPlaying:{
    type: Boolean
  }
})

const emit= defineEmits(['change', 'delete','playFile','play','pause'])
const playSelectedFile = (file) => {
  if (file.id === props.currentFileID){
    emit('play')
  }else{
    emit('playFile', file)
  }

}

const pause = () => {
  emit('pause')
}

</script>



