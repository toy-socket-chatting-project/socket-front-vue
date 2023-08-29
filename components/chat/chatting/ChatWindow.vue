<template>
  <v-container>
    <v-layout column>
      <v-flex style="display: flex; align-items: center">
        <v-btn style="margin-right: 10px" depressed @click="joinChatting"
          >대화 참여</v-btn
        >
        <v-btn style="margin-right: 10px" depressed @click="clearRecvList"
          >대화내용 삭제</v-btn
        >
        <v-switch v-model="isLatestScroll" label="자동스크롤" />
      </v-flex>
    </v-layout>
    <div ref="divRecvList" class="div-recv-list">
      <div
        v-for="(item, idx) in selectedRoom.recvList"
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
      <v-col cols="12" sm="4">
        <v-text-field v-model="nickname" label="닉네임" required></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="4">
        <v-textarea
          label="내용 입력"
          v-model="message"
          @keyup.enter="shortcutCheck"
          :disabled="!isJoined"
        ></v-textarea>
      </v-col>
    </v-row>
    <input type="file" id="inputImage" @change="handleFileChange" multiple />
    <div v-for="(item, idx) in sendImgSrcList" :key="idx">
      <img :src="item" style="max-width: 128px" />
    </div>
  </v-container>
</template>

<script>
class Room {
  constructor(roomId = '', recvList = []) {
    this.roomId = roomId;
    this.recvList = recvList;
  }
}

export default {
  name: 'ChatWindow',
  computed: {
    isConnected() {
      return !!this.$store.state.chat?.stompClient?.connected;
    },
    simpSessionId() {
      const paredTransportUrl =
        this.$store.state.chat?.stompClient?.ws._transport.url.split('/');
      return paredTransportUrl[paredTransportUrl.length - 2];
    },
  },
  data() {
    return {
      isLatestScroll: false,
      nickname: '',
      message: '',

      // 방데이터
      selectedRoom: new Room(),
      isJoined: false,

      sendImgSrcList: [],
    };
  },
  mounted() {
    this.isLatestScroll = true;
  },
  watch: {
    'selectedRoom.recvList'() {
      this.$nextTick(() => this.divRecvListAutoScroll());
    },
    isLatestScroll() {
      this.divRecvListAutoScroll();
    },
    message() {
      this.inputContents();
    },
  },
  methods: {
    divRecvListAutoScroll() {
      this.isLatestScroll &&
        (this.$refs.divRecvList.scrollTop =
          this.$refs.divRecvList.scrollHeight);
    },
    joinChatting() {
      if (!this.isConnected) {
        this.$emit(
          'displaySnackbar',
          '연결된 소켓이 없습니다. 소켓 연결 후 대화해주시기 바랍니다.',
        );
        return;
      }
      this.$store.state.chat?.stompClient.subscribe(
        this.toSocketUri('send'),
        res => this.addRecvToList(res),
      );
      this.isJoined = true;
      this.$emit('displaySnackbar', '대화에 참여되었습니다.');
    },
    shortcutCheck(e) {
      if (!e.shiftKey && e.key === 'Enter') {
        this.send();
      }
    },
    send() {
      if (!this.isConnected) {
        this.displaySnackbar(
          '연결된 소켓이 없습니다. 소켓 연결 후 대화해주시기 바랍니다.',
        );
        return;
      }
      if (this.$stringUtils.isBlank(this.nickname)) {
        this.displaySnackbar('닉네임 입력 후 대화해주시기 바랍니다.');
        return;
      }
      if (this.$stringUtils.isBlank(this.message)) {
        this.message = ''; // 엔터 포함 공백문자열 초기화
        this.displaySnackbar('내용 입력 후 대화해주시기 바랍니다.');
        return;
      }
      this.message = this.message.trim();
      this.$store.state.chat?.stompClient.send(
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
    toSocketUri(uri) {
      return '/socket/messenger/' + uri;
    },
    displaySnackbar(message) {
      if (this.$stringUtils.isBlank(message)) {
        window.alert(
          '[ChatWindow.displaySnackbar]메시지가 설정되지 않았습니다.',
        );
        return;
      }
      this.$emit('displaySnackbar', message);
    },

    /**
     * 이하 이미지 관련 메소드 -> TODO: 이미지 업로드는 컴포넌트를 분리하자.
     */
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
