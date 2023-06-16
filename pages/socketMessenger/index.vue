<template>
  <v-form>
    <v-btn depressed color="primary" @click="connect">연결</v-btn>
    <v-btn depressed color="error" @click="disconnect">연결해제</v-btn>
    <v-btn
      depressed
      @click="
        () => {
          recvList = [];
        }
      "
      >대화내용 삭제</v-btn
    >
    <v-switch
      v-model="isLatestScroll"
      label="자동스크롤"
      @change="isLatestScroll"
    ></v-switch>
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
      <div ref="divRecvList" class="div-recv-list">
        <div
          v-for="(item, idx) in recvList"
          :key="idx"
          :style="`display: flex; ${
            simpSessionId === item.simpSessionId
              ? 'flex-direction: row-reverse'
              : ''
          }`"
        >
          <v-card min-width="200px" max-width="600px" outlined>
            <v-card-title
              :style="`color: ${item.nicknameColor}; padding: 5px 5px 10px 5px`"
              >{{ item.nickname }}</v-card-title
            >
            <v-card-subtitle style="padding: 5px">{{
              item.responseTime
            }}</v-card-subtitle>
            <v-card-text
              style="
                word-wrap: break-word;
                white-space: pre-wrap;
                padding: 0 10px 10px 10px;
              "
              >{{ item.contents }}
            </v-card-text>
          </v-card>
        </div>
      </div>
      <v-row>
        <v-col cols="12" md="4">
          <v-textarea
            label="내용 입력"
            v-model="message"
            @keyup.enter="shortcutCheck"
          ></v-textarea>
        </v-col>
      </v-row>
      <input type="file" id="inputImage" @change="handleFileChange" multiple />
      <div v-for="(item, idx) in sendImgSrcList" :key="idx">
        <img :src="item" style="max-width: 128px" />
      </div>
    </v-container>
  </v-form>
</template>

<script>
import SockJS from 'sockjs-client';
import Stomp from 'webstomp-client';

const BACKEND_DOMAIN = '//backend.socket.com:8080';

export default {
  name: 'socketMessenger',
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

      // 수신 메시지 데이터
      recvList: [],

      // UX 관련
      isLatestScroll: false,
    };
  },
  watch: {
    recvList() {
      this.$nextTick(() => this.divRecvListAutoScroll());
    },
    message() {
      this.inputContents();
    },
    isLatestScroll() {
      this.divRecvListAutoScroll();
    },
  },
  mounted() {
    this.isLatestScroll = true;

    this.connect();
  },
  methods: {
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
        alert('이미지는 최대 5개까지 첨부 가능합니다.');
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
        alert('이미지는 최대 5개까지 첨부 가능합니다.');
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
    divRecvListAutoScroll() {
      this.isLatestScroll &&
        (this.$refs.divRecvList.scrollTop =
          this.$refs.divRecvList.scrollHeight);
    },
    addRecvToList(res) {
      const recv = JSON.parse(res.body) ?? {};
      const lastRecv = this.recvList[this.recvList.length - 1] ?? {};
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
      const lastRecv = this.recvList.pop();
      this.recvList.push({
        ...lastRecv,
        contents: `${lastRecv.contents}\n${_recv.contents}`,
      });
    },
    pushContents(recv) {
      const _recv = { ...recv };
      delete _recv.recvImgSrcList;
      this.recvList.push({ ..._recv });
    },
    pushImgSrcList(recv) {
      const _recv = { ...recv };
      const recvImgSrcList = _recv?.recvImgSrcList ?? [];
      delete _recv.recvImgSrcList;
      delete _recv.contents;
      recvImgSrcList.forEach(recvImgSrc =>
        this.recvList.push({ ..._recv, recvImgSrc }),
      );
    },

    connect() {
      if (this.stompClient?.connected) {
        alert('이미 소켓이 연결되어있습니다.');
        return;
      }
      const socket = new SockJS(`${BACKEND_DOMAIN}/socket/messenger`);
      this.stompClient = Stomp.over(socket);
      this.stompClient.connect(
        {},
        () => {
          alert('소켓에 연결되었습니다.');
          const paredTransportUrl =
            this.stompClient.ws._transport.url.split('/');
          this.simpSessionId = paredTransportUrl[paredTransportUrl.length - 2];
          this.stompClient.subscribe(this.toSocketUri('send'), res =>
            this.addRecvToList(res),
          );
        },
        e => this.connectionFailHandler(e),
      );
    },
    connectionFailHandler(e = {}) {
      console.log('connectio failed. data: ' + JSON.stringify(e, null, 2));
      if (e.code === 1002) {
        alert(
          '소켓 연결에 실패했습니다. 백엔드 서버가 구동 중인지 확인하시기 바랍니다.',
        );
      } else if (e.code === 1006) {
        alert(
          '소켓 연결이 종료되었습니다. 백엔드 서버가 구동 중인지 확인하시기 바랍니다.',
        );
      } else {
        alert(
          '알 수 없는 이유로 소켓 연결에 실패했습니다. 자세한 정보는 콘솔로그를 확인하시기 바랍니다.',
        );
      }
    },
    send() {
      if (!this.stompClient?.connected) {
        alert('연결된 소켓이 없습니다. 소켓 연결 후 대화해주시기 바랍니다.');
        return;
      }
      if (this.isBlank(this.nickname)) {
        alert('닉네임 입력 후 대화해주시기 바랍니다.');
        return;
      }
      if (this.isBlank(this.message)) {
        this.message = '';
        alert('내용 입력 후 대화해주시기 바랍니다.');
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
      if (!this.stompClient?.connected) {
        return;
      }
      if (this.isBlank(this.nickname)) {
        return;
      }
      console.log('log!');
      // TODO: debounce
    },
    disconnect() {
      if (!this.stompClient?.connected) {
        alert('소켓이 연결되지 않았습니다.');
        return;
      }
      this.stompClient.disconnect();
      alert('소켓 연결이 종료되었습니다.');
    },
    isBlank(str) {
      return !str || typeof str !== 'string' || str.trim() === '';
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
