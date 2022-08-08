import Vue from 'vue'
import Router from 'vue-router'
import Map from '@/page/map'
import List from '@/page/list'
import DetailData from '@/page/detailData'
import DataList from '@/page/dataList'


Vue.use(Router)

export default new Router({
	routes: [{
			path: '/',
			name: 'list',
			component: List
		},
		{
			path: '/map',
			name: 'map',
			component: Map
		},{
			path: '/detailData',
			name: 'detailData',
			component: DetailData
		},{
			path: '/dataList',
			name: 'dataList',
			component: DataList
		}

	]
})