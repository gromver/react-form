export default class MutationState {
  /**
   * @type {Object<string, *>}
   */
  mutations;

  constructor(mutations) {
    this.mutations = mutations;
  }
}
