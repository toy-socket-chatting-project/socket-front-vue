const isBlank = value => !value || !/^\s*\S+.*/.test(value);

export default {
  isBlank,
};
