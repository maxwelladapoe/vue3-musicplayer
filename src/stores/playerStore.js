import {defineStore, acceptHMRUpdate} from "pinia";

export const usePlayerStore = defineStore({
    id: 'player',
    state: () => ({
        files: []
    }),
    getters: {
        files: (state) => {
            return state.files;
        }
    },
    actions:{
        addFile(file){
            console.log(file)
            this.files.push(file)
        },

        removeFile(fileIndex) {
         console.log(fileIndex)
        },
    }
})

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(usePlayerStore, import.meta.hot))
}