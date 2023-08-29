import SockJS from 'sockjs-client';
import Stomp from 'webstomp-client';
import _ from 'lodash';

export default {
  state() {
    return {
      stompClient: null,
    };
  },
  getters: {
    getStompClient(state) {
      return state.stompClient;
    },
  },
  mutations: {
    setStompClient(state, payload) {
      state.stompClient = payload;
    },
  },
  actions: {
    /**
     * 소켓연결
     * Sockjs 로 소켓연결한다.
     * @param {Object} context Vuex store context
     * @param {String} url 소켓 서버 full url
     * @throws {Error} {...Error, detailMsg: String}
     */
    connect({ state, commit }, url) {
      if (state?.stompClient?.connected) {
        const e = new Error('이미 소켓에 연결되어있습니다.');
        throw e;
      }
      const socket = new SockJS(url);
      const stompClient = Stomp.over(socket);
      stompClient.connect(
        {},
        () => {
          commit('setStompClient', stompClient);
        },
        e => {
          e.detailMsg =
            '알 수 없는 이유로 소켓 연결에 실패했습니다. 자세한 정보는 콘솔로그를 확인하시기 바랍니다.';
          state?.stompClient?.connected &&
            (e.detailMsg = '이미 소켓이 연결되어있습니다.');
          e.code === 1002 &&
            (e.detailMsg =
              '소켓 연결에 실패했습니다. 백엔드 서버가 구동 중인지 확인하시기 바랍니다.');
          e.code === 1006 &&
            (e.detailMsg =
              '소켓 연결이 종료되었습니다. 백엔드 서버가 구동 중인지 확인하시기 바랍니다.');
          throw e;
        },
      );
    },
    /**
     * 소켓연결해제
     * Sockjs 의 소켓연결을 해제한다.
     * @param {Object} context Vuex store context
     * @throws {Error} {...Error, detailMsg: String}
     */
    disconnect({ state, commit }) {
      if (!state.stompClient?.connected) {
        const e = new Error('소켓이 연결되지 않았습니다.');
        throw e;
      }
      const stompClient = _.cloneDeep(state.stompClient);
      // SockJs 에서 disconnect 이후 setTimeout 0 초로 내부값을 바꾸는 동작이 있음.
      // 이로 인해 state에 disconnect 진행중인 객체가 설정된 이후 값이 한번 더 바뀌며
      // Do not mutate vuex store state outside mutation handlers 오류가 발생함.
      // 이를 해결하기 위해 setTimeout 0 설정하여 값이 변경된 후 mutations 동작하도록 설정함.
      stompClient.disconnect(() =>
        setTimeout(() => commit('setStompClient', stompClient), 0),
      );
    },
  },
};
