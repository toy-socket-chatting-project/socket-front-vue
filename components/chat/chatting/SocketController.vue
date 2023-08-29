<template>
  <v-container :disabled="isDisable">
    <v-layout column>
      <v-flex>
        <v-btn-toggle>
          <v-btn depressed color="primary" @click="connect">연결</v-btn>
          <v-btn depressed color="error" @click="disconnect">연결해제</v-btn>
        </v-btn-toggle>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'SocketController',
  props: {
    backendUrl: {
      type: String,
      required: false,
      default: '//backend.socket.com:8080/socket/messenger',
    },
  },
  data() {
    return {
      isDisable: this.$stringUtils.isBlank(this.backendDomain),
    };
  },
  methods: {
    connect() {
      this.$store
        .dispatch('chat/connect', this.backendUrl)
        .then(() => this.$emit('connectSuccessProcessing'))
        .catch(e => {
          console.log('connectio failed. data: ' + JSON.stringify(e, null, 2));
          this.$emit('connectFailProcessing', e);
        });
    },
    disconnect() {
      this.$store
        .dispatch('chat/disconnect')
        .then(() => this.$emit('disconnectSuccessProcessing'))
        .catch(e => {
          console.log(
            'disconnectio failed. data: ' + JSON.stringify(e, null, 2),
          );
          this.$emit('disconnectFailProcessing', e);
        });
    },
  },
};
</script>
