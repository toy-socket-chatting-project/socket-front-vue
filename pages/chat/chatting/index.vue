<template>
  <v-form>
    <socket-controller
      @connectSuccessProcessing="connectSuccessProcessing"
      @connectFailProcessing="connectFailProcessing"
      @disconnectSuccessProcessing="disconnectFailProcessing"
      @disconnectFailProcessing="disconnectFailProcessing"
    />
    <v-container>
      <v-row>
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="nickname"
            label="닉네임"
            required
          ></v-text-field>
        </v-col>
      </v-row>
      <chat-window
        :simp-session-id="simpSessionId"
        :chat-room="selectedRoom"
        @clearRecvList="clearRecvList"
      />
      <v-row>
        <v-col cols="12" md="4">
          <v-textarea
            label="내용 입력"
            v-model="message"
            @keyup.enter="shortcutCheck"
            :disabled="!isConnected"
          ></v-textarea>
        </v-col>
      </v-row>
      <input type="file" id="inputImage" @change="handleFileChange" multiple />
      <div v-for="(item, idx) in sendImgSrcList" :key="idx">
        <img :src="item" style="max-width: 128px" />
      </div>
    </v-container>
    <v-snackbar v-model="snackbar" :timeout="1500">
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

class Room {
  constructor(roomId = '', recvList = []) {
    this.roomId = roomId;
    this.recvList = recvList;
  }
}

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

      // 클라이언트 데이터
      simpSessionId: '',
      nickname: '',
      message: '',
      sendImgSrcList: [],
      fileName: '파일을 선택하세요.',
      file: '',

      // 방데이터
      selectedRoom: new Room(),

      // UX 관련
      snackbar: false,
      snackbarMessage: '',
    };
  },
  watch: {
    message() {
      this.inputContents();
    },
  },
  computed: {
    isConnected() {
      return !!this.stompClient?.connected;
    },
  },
  mounted() {
    // this.connect();
  },
  methods: {
    connectSuccessProcessing(result = {}) {
      this.stompClient = result.stompClient;
      const paredTransportUrl = this.stompClient.ws._transport.url.split('/');
      this.simpSessionId = paredTransportUrl[paredTransportUrl.length - 2];
      this.stompClient.subscribe(this.toSocketUri('send'), res =>
        this.addRecvToList(res),
      );
      if (result.detailMsg) {
        this.snackbarMessage = result.detailMsg;
        this.snackbar = true;
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
        this.snackbarMessage = result.detailMsg;
        this.snackbar = true;
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
        this.snackbarMessage = result.detailMsg;
        this.snackbar = true;
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
        this.snackbarMessage = result.detailMsg;
        this.snackbar = true;
        return;
      }
      window.alert(
        '알 수 없는 오류가 발생했습니다. \nresult: ' +
          JSON.stringify(result, null, 2),
      );
    },
    // 파일 전송
    submit() {
      const data = new FormData();
      data.append('file', this.file);
      fetch('/echo/json', {
        method: 'POST',
        body: data,
      });
    },
    handleFileChange(e) {
      if (!e?.target?.files) {
        return;
      }
      const files = [...e.target.files];
      const fileLength = this.sendImgSrcList.length + files.length;
      if (fileLength >= 5) {
        window.alert('이미지는 최대 5개까지 첨부 가능합니다.');
        return;
      }
      files.forEach(file => this.addFile(file));
    },
    dropFile(e) {
      if (!e?.dataTransfer?.files) {
        return;
      }
      e.preventDefault();
      const files = [...e.dataTransfer.files];
      const fileLength = this.sendImgSrcList.length + files.length;
      if (fileLength >= 5) {
        window.alert('이미지는 최대 5개까지 첨부 가능합니다.');
        return;
      }
      files.forEach(file => this.addFile(file));
    },
    addFile(file) {
      const ctx = this;
      const FR = new FileReader();
      FR.onload = () => ctx.sendImgSrcList.push(FR.result);
      FR.readAsDataURL(file);
    },
    deleteImg(idx) {
      this.sendImgSrcList.splice(idx, 1);
    },
    toSocketUri(uri) {
      return '/socket/messenger/' + uri;
    },

    /**
     * UX 관련 메소드
     */
    shortcutCheck(e) {
      if (!e.shiftKey && e.key === 'Enter') {
        this.send();
      }
    },
    clearRecvList() {
      this.selectedRoom.recvList = [];
    },
    addRecvToList(res) {
      const recv = JSON.parse(res.body) ?? {};
      const lastRecv =
        this.selectedRoom.recvList[this.selectedRoom.recvList.length - 1] ?? {};
      if (
        lastRecv.contents &&
        lastRecv.simpSessionId === recv.simpSessionId &&
        lastRecv.nickname === recv.nickname
      ) {
        this.mergeContents(recv);
      } else {
        this.pushContents(recv);
      }
    },
    mergeContents(recv) {
      const _recv = { ...recv };
      const lastRecv = this.selectedRoom.recvList.pop();
      this.selectedRoom.recvList.push({
        ...lastRecv,
        contents: `${lastRecv.contents}\n${_recv.contents}`,
      });
    },
    pushContents(recv) {
      const _recv = { ...recv };
      delete _recv.recvImgSrcList;
      this.selectedRoom.recvList.push({ ..._recv });
    },
    pushImgSrcList(recv) {
      const _recv = { ...recv };
      const recvImgSrcList = _recv?.recvImgSrcList ?? [];
      delete _recv.recvImgSrcList;
      delete _recv.contents;
      recvImgSrcList.forEach(recvImgSrc =>
        this.selectedRoom.recvList.push({ ..._recv, recvImgSrc }),
      );
    },

    send() {
      if (!this.isConnected) {
        this.snackbarMessage =
          '연결된 소켓이 없습니다. 소켓 연결 후 대화해주시기 바랍니다.';
        this.snackbar = true;
        return;
      }
      if (this.$stringUtils.isBlank(this.nickname)) {
        this.snackbarMessage = '닉네임 입력 후 대화해주시기 바랍니다.';
        this.snackbar = true;
        return;
      }
      if (this.$stringUtils.isBlank(this.message)) {
        this.snackbarMessage = '내용 입력 후 대화해주시기 바랍니다.';
        this.snackbar = true;
        return;
      }
      this.message = this.message.trim();
      this.stompClient.send(
        this.toSocketUri('receive'),
        JSON.stringify({
          nickname: this.nickname,
          contents: this.message,
          sendImgSrcList: this.sendImgSrcList,
        }),
        {},
      );
      this.message = '';
      this.sendImgSrcList.length = 0;
    },
    inputContents() {
      if (!this.isConnected) {
        return;
      }
      if (this.$stringUtils.isBlank(this.nickname)) {
        return;
      }
      console.log('log!');
      // TODO: debounce
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
