import chat from './chat';
export default {
  modules: { chat },
  state() {
    return {
      testState: '',
    };
  },
  mutations: {
    setTestState(state, payload) {
      state.testState = payload.testState;
    },
  },
  actions: {
    testStateAction(context, payload) {
      context.commit('setTestState', payload);
    },
  },
};
