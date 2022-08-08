import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

export default new Vuex.Store({
	state:{
		kName:'start'
	},
	getters:{
		getKname(state){
			return state.kName
		}
	}
})
