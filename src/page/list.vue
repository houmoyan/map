<template>
	<div class="wrap">
		<div class="search">
			<el-date-picker v-model="dateVal" type="date" placeholder="作业日期" value-format="yyyy-MM-dd">
			</el-date-picker>
			<el-input v-model="imeiVal" placeholder="设备号" clearable></el-input>
			<el-button type="primary" @click="handleSearch">搜 索</el-button>
		</div>
		<el-table :data="tableData" tooltip-effect="dark" border style="width: 100%">
			<el-table-column label="序号" align="center" width="50" show-overflow-tooltip>
				<template slot-scope="scope">
					<span>{{scope.$index+addIndex}}</span>
				</template>
			</el-table-column>
			<el-table-column label="日期" align="center" prop="indexDate">
			</el-table-column>
			<el-table-column label="设备号" align="center" prop="imei">
			</el-table-column>
			<el-table-column prop="runTimeDay" align="center" label="运行时长（小时）">
			</el-table-column>
			<el-table-column prop="mileageDay" align="center" label="运行里程（千米）">
			</el-table-column>
			<el-table-column prop="originalPoints" align="center" label="轨迹点数">
			</el-table-column>
			<el-table-column prop="rectifyArea" align="center" label="运行面积（亩）">
			</el-table-column>
			<el-table-column align="center" prop="jobPlace" label="作业地区">
			</el-table-column>
			<el-table-column label="操作" align="center" width="140">
				<template slot-scope="scope">
					<el-button @click="handleDetail(scope.row.imei)" type="text" size="medium">轨迹查看</el-button>
				</template>
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
				imeiVal: ''
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
						url: this.api.api_map + '/queryJobDataList',
						method: 'post',
						params: {
							imei: this.imeiVal,
							jobDate: this.dateVal,
							currentPage: this.currentPage,
							pageSize: this.pageSize,
						}
					})
					.then((responese) => {
						if(responese.data.code == 0) {
							this.tableData = responese.data.data.list;
							this.recordTotal = responese.data.data.total;
							this.pageSize = responese.data.data.pageSize;
							this.currentPage = responese.data.data.pageNum;

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
			handleDetail(imei) {
				this.$router.push({
					path: "/map",
					query: {
						imei: imei
					}
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