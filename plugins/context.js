/**
 * Nuxt.js Context 영역에 유틸성 모듈 Inject
 */
import EventBus from './eventBus';
import StringUtils from '~/utils/stringUtils';

export default (context, inject) => {
  // vue 전역으로 데이터를 전송하기 위해 이벤트 버스 등록
  inject('bus', EventBus);

  inject('stringUtils', StringUtils);
};
