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
import SockJS from 'sockjs-client';
import Stomp from 'webstomp-client';

export default {
  name: 'SocketController',
  props: {
    backendDomain: {
      type: String,
      required: false,
      default: process.env.API_DEV,
    },
  },
  data() {
    return {
      isDisable: this.$stringUtils.isBlank(this.backendDomain),
      // 소켓 데이터
      stompClient: null,
      isLatestScroll: false,
    };
  },
  methods: {
    connect() {
      if (this.stompClient?.connected) {
        this.connectionFailHandler();
        return;
      }
      const socket = new SockJS(`${this.backendDomain}/socket/messenger`);
      this.stompClient = Stomp.over(socket);
      this.stompClient.connect(
        {},
        () => {
          const detailMsg = '소켓에 연결되었습니다.';
          const result = { stompClient: this.stompClient, detailMsg };
          this.$emit('connectSuccessProcessing', result);
        },
        e => this.connectionFailHandler(e),
      );
    },
    connectionFailHandler(e = {}) {
      console.log('connectio failed. data: ' + JSON.stringify(e, null, 2));
      let detailMsg =
        '알 수 없는 이유로 소켓 연결에 실패했습니다. 자세한 정보는 콘솔로그를 확인하시기 바랍니다.';
      this.stompClient?.connected &&
        (detailMsg = '이미 소켓이 연결되어있습니다.');
      e.code === 1002 &&
        (detailMsg =
          '소켓 연결에 실패했습니다. 백엔드 서버가 구동 중인지 확인하시기 바랍니다.');
      e.code === 1006 &&
        (detailMsg =
          '소켓 연결이 종료되었습니다. 백엔드 서버가 구동 중인지 확인하시기 바랍니다.');
      const result = { stompClient: this.stompClient, e, detailMsg };
      this.$emit('connectFailProcessing', result);
    },
    disconnect() {
      if (!this.stompClient?.connected) {
        const detailMsg = '소켓이 연결되지 않았습니다.';
        const result = { stompClient: this.stompClient, detailMsg };
        this.$emit('disconnectFailProcessing', result);
        return;
      }
      const detailMsg = '소켓 연결이 종료되었습니다.';
      const result = { stompClient: this.stompClient, detailMsg };
      this.stompClient.disconnect();
      this.$emit('disconnectSuccessProcessing', result);
    },
  },
};
</script>
