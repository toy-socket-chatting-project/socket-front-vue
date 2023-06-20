<template>
  <v-container>
    <v-layout column>
      <v-flex>
        <v-btn-toggle>
          <v-btn depressed color="primary" @click="connect">연결</v-btn>
          <v-btn depressed color="error" @click="disconnect">연결해제</v-btn>
        </v-btn-toggle>
      </v-flex>
      <v-flex style="display: flex; align-items: center">
        <v-btn style="margin-right: 10px" depressed @click="clearRecvList"
          >대화내용 삭제</v-btn
        >
        <v-switch
          v-model="isLatestScroll"
          label="자동스크롤"
          @change="isLatestScroll"
        />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'ControlBox',
  props: {
    autoScroll: {
      type: Function,
      required: false,
      default: () => window.console.log('autoScroll props not defined.'),
    },
    connect: {
      type: Function,
      required: false,
      default: () => window.console.log('connect props not defined.'),
    },
    disconnect: {
      type: Function,
      required: false,
      default: () => window.console.log('disconnect props not defined.'),
    },
  },
  data() {
    return {
      isLatestScroll: false,
    };
  },
  watch: {
    isLatestScroll() {
      this.isLatestScroll && this.autoScroll();
    },
  },
  methods: {
    clearRecvList() {
      this.$emit('@clearRecvList');
    },
  },
};
</script>
