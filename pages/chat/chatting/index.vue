<template>
  <v-form>
    <socket-controller
      @connectSuccessProcessing="connectSuccessProcessing"
      @connectFailProcessing="connectFailProcessing"
      @disconnectSuccessProcessing="disconnectSuccessProcessing"
      @disconnectFailProcessing="disconnectFailProcessing"
    />
    <v-container>
      <chat-window
        :stomp-client="stompClient"
        @displaySnackbar="displaySnackbar"
      />
    </v-container>
    <v-snackbar v-model="snackbar" :timeout="snackbarTimeout">
      {{ snackbarMessage }}
      <template v-slot:action="{ attrs }">
        <v-btn color="blue" text v-bind="attrs" @click="snackbar = false">
          닫기
        </v-btn>
      </template>
    </v-snackbar>
  </v-form>
</template>

<script>
import SocketController from '@/components/chat/chatting/SocketController';
import ChatWindow from '~/components/chat/chatting/ChatWindow.vue';

export default {
  name: 'SocketChatting',
  components: {
    SocketController,
    ChatWindow,
  },
  data() {
    return {
      // 소켓 데이터
      stompClient: null,

      // UX 관련
      snackbar: false,
      snackbarMessage: '',
      snackbarTimeout: 1500,
    };
  },
  mounted() {
    // this.connect();
  },
  methods: {
    displaySnackbar(message, timeout = 1500) {
      this.snackbarMessage = message;
      this.snackbarTimeout = timeout;
      this.snackbar = true;
    },
    connectSuccessProcessing(result = {}) {
      this.stompClient = result.stompClient;
      if (result.detailMsg) {
        this.displaySnackbar(result.detailMsg);
        return;
      }
      window.alert(
        '알 수 없는 오류가 발생했습니다. \nresult: ' +
          JSON.stringify(result, null, 2),
      );
    },
    connectFailProcessing(result = {}) {
      this.stompClient = result.stompClient;
      if (result.detailMsg) {
        this.displaySnackbar(result.detailMsg);
        return;
      }
      window.alert(
        '알 수 없는 오류가 발생했습니다. \nresult: ' +
          JSON.stringify(result, null, 2),
      );
    },
    disconnectSuccessProcessing(result = {}) {
      this.stompClient = result.stompClient;
      if (result.detailMsg) {
        this.displaySnackbar(result.detailMsg);
        return;
      }
      window.alert(
        '알 수 없는 오류가 발생했습니다. \nresult: ' +
          JSON.stringify(result, null, 2),
      );
    },
    disconnectFailProcessing(result = {}) {
      this.stompClient = result.stompClient;
      if (result.detailMsg) {
        this.displaySnackbar(result.detailMsg);
        return;
      }
      window.alert(
        '알 수 없는 오류가 발생했습니다. \nresult: ' +
          JSON.stringify(result, null, 2),
      );
    },
  },
};
</script>
<style lang="scss" scoped>
::v-deep {
  .div-recv-list {
    height: 50vh;
    scroll-behavior: auto;
    overflow-y: auto;
    background: gray;
  }
}
</style>
