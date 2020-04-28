<template>
  <div :class="`alert alert-${type} alert-dismissible fade ${show ? 'show' : ''}`" role="alert">
    <div v-html="html">

    </div>
    <button type="button" class="close" data-dismiss="alert" @click="$emit('close')" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
</template>

<script>
  export default {
    name: "Alert.vue",
    props: ["show", "type", "html"],

  }
</script>

<style scoped>
.alert {
  position: fixed;
  width: 98vw;
  left: 1vw;
  bottom: 1vw;
  z-index: 103;
  margin: 0;
}
</style>
