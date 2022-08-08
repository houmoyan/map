<template>
	<div class="wrap">
		<!--<div class="search">
			<el-date-picker v-model="dateVal" type="date" placeholder="作业日期" value-format="yyyy-MM-dd">
			</el-date-picker>
			<el-input v-model="imeiVal" placeholder="设备号" clearable></el-input>
			<el-button type="primary" @click="handleSearch">搜 索</el-button>
		</div>-->
		<el-table :data="dataList" tooltip-effect="dark" border style="width: 100%">
			<el-table-column label="包序号" align="center"  prop="serialno">
			</el-table-column>
			<el-table-column label="设备序列号" align="center" prop="imei" width="180">
			</el-table-column>
			<el-table-column label="农机厂家" align="center" prop="factory_code">
			</el-table-column>
			<el-table-column prop="satellite" align="center" label="可用卫星数量">
			</el-table-column>
			<el-table-column prop="work_status" align="center" label="机器状态">
				<template slot-scope="scope">
				<span v-if="scope.row.work_status == 1">打火工作</span>
						<span v-else-if="scope.row.work_status == 2">熄火静止</span>
						<span v-else-if="scope.row.work_status == 1">熄火移动</span>
						<span v-else>打火静止</span>
				</template>
						
			</el-table-column>
			<el-table-column prop="send_time" align="center" label="采集时间" width="180">
			</el-table-column>
			<el-table-column prop="location_status" align="center" label="定位状态">
				<template slot-scope="scope">
					{{scope.row.location_status ==1?'有效定位':'无效定位'}}
				</template>
			</el-table-column>
			<el-table-column label="经度" align="center" prop="lng">
			</el-table-column>
			<el-table-column label="纬度" align="center" prop="lat">
			</el-table-column>
			<el-table-column label="E/W" align="center" prop="lng_flag">
			</el-table-column>
			<el-table-column label="S/N" align="center" prop="lat_flag" >
			</el-table-column>
			<el-table-column label="速度(km/h)" align="center" prop="speed">
			</el-table-column>
			<el-table-column label="外部电压" align="center" prop="voltage">
			</el-table-column>
			<el-table-column label="海拔" align="center" prop="altitude">
			</el-table-column>
			<el-table-column label="方向" align="center" prop="azimuth">
			</el-table-column>
		</el-table>
		<div class="clearfix pagination">
			<div class="fr">
				<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="[10, 20, 30, 40]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="recordTotal">
				</el-pagination>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'list',
		data() {
			return {
				dateVal: '',
				addIndex: 1,
				tableData: [],
				currentPage: 1, //当前页
				recordTotal: 0, //总条数
				pageSize: 10, //每页条数
				imeiVal: '',
				dataList:[]
			}
		},

		mounted() {
			this.getData()
		},
		methods: {
			handleSearch() {
				this.getData()
			},
			//列表数据
			getData() {
				this.$http({
						url: this.api.api_map + '/queryAllTraceData',
						method: 'post',
						params: {
							imei: this.$route.query.imei,
							dateTime: this.$route.query.jobDate,
							currentPage:this.currentPage,
							pageSize:this.pageSize
						}
					})
					.then((responese) => {
						if(responese.data.code == 0) {
							this.dataList = responese.data.data.dataList;
							this.recordTotal = responese.data.data.totalSize;
							
						} else {
							this.$message({
								message: responese.data.errMsg,
								type: 'error',
								customClass: 'customClass'
							});
						}
					})
					.catch((error) => {
						console.log(error);
					});

			},
			
			// 每页显示数量变动
			handleSizeChange(val) {
				this.pageSize = val;
				this.currentPage = 1;
				this.addIndex = 1;
				this.getData();
			},
			// 页码变更
			handleCurrentChange(val) {
				this.currentPage = val;
				this.addIndex = (this.currentPage - 1) * this.pageSize + 1;
				this.getData();
			},
		}
	}
</script>

<style scoped>

</style>