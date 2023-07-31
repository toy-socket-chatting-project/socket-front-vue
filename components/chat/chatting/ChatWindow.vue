<template>
  <v-container>
    <v-layout column>
      <v-flex style="display: flex; align-items: center">
        <v-btn style="margin-right: 10px" depressed @click="clearRecvList"
          >대화내용 삭제</v-btn
        >
        <v-switch v-model="isLatestScroll" label="자동스크롤" />
      </v-flex>
    </v-layout>
    <div ref="divRecvList" class="div-recv-list">
      <div
        v-for="(item, idx) in chatRoom.recvList"
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
  </v-container>
</template>

<script>
export default {
  name: 'ChatWindow',
  props: {
    simpSessionId: {
      type: String,
      required: false,
      default: '',
    },
    chatRoom: {
      type: Object,
      required: false,
      default: () =>
        window.console.log('[ChatWindow]chatRoom props is not present.'),
    },
  },
  data() {
    return {
      isLatestScroll: false,
    };
  },
  mounted() {
    this.isLatestScroll = true;
  },
  watch: {
    'chatRoom.recvList'() {
      this.$nextTick(() => this.divRecvListAutoScroll());
    },
    isLatestScroll() {
      this.divRecvListAutoScroll();
    },
  },
  methods: {
    divRecvListAutoScroll() {
      this.isLatestScroll &&
        (this.$refs.divRecvList.scrollTop =
          this.$refs.divRecvList.scrollHeight);
    },
    clearRecvList() {
      this.$emit('clearRecvList');
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
