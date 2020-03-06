<template>
    <div>
        <div class="mb-1">
            <span :key="index" v-for="(tag, index) of tags" class="badge badge-primary mx-1">{{tag}}</span>
        </div>
        <textarea type="text" @keydown="input" v-model="tag" rows="1" class="form-control" id="tags" placeholder="Enter um Tag hinzuzufügen">
        </textarea>
    </div>
</template>

<script>
    export default {
        name: "Tags",
        data: function(){
            return {
                tag: ''
            }
        },
        props: ['tags'],
        methods: {
            input(event){
                if(event.key === 'Enter'){
                    //CHECK IF TAG ALREADY INCLUDED
                    if(!this.tags.includes(this.tag)){
                        this.tags.push(this.tag);
                    }
                    this.tag = '';
                    event.preventDefault();
                }
            }
        }
    }
</script>

<style scoped>

</style>