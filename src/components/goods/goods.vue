<template>
	<div class="main">
		<!-- 逐级导航区域 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }"
				>首页</el-breadcrumb-item
			>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>商品列表</el-breadcrumb-item>
		</el-breadcrumb>

		<!-- 卡片视图区域 -->
		<el-card>
			<!-- 搜索与添加区域 -->
			<el-row :gutter="20">
				<el-col :span="8">
					<el-input
						placeholder="请输入内容"
						v-model="queryInfo.query"
						clearable
						@clear="getGoodsList"
					>
						<el-button
							slot="append"
							icon="el-icon-search"
							@click="getGoodsList"
						></el-button>
					</el-input>
				</el-col>
				<el-col :span="4">
					<el-button type="primary" @click="addFormOpen"
						>添加商品</el-button
					>
				</el-col>
			</el-row>

			<!-- 商品列表区域 -->
			<el-table :data="goodsList" border stripe class="center-align">
				<el-table-column type="index"></el-table-column>
				<el-table-column
					label="商品ID"
					prop="goods_id"
				></el-table-column>
				<el-table-column
					label="商品名称"
					prop="goods_name"
					width="360px"
				></el-table-column>
				<el-table-column
					label="价格"
					prop="goods_price"
				></el-table-column>
				<el-table-column
					label="数量"
					prop="goods_number"
				></el-table-column>
				<el-table-column
					label="重量"
					prop="goods_weight"
				></el-table-column>
				<el-table-column label="商品状态">
					<template slot-scope="sp">
						<el-tag
							:type="sp.row.goods_state | goodsStatus()"
							effect="dark"
						>
							{{ sp.row.goods_state | goodsStatusName() }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="添加时间" width="160px">
					<template slot-scope="sp">
						{{ sp.row.add_time | time('yyyy-MM-dd hh:mm:ss') }}
					</template>
				</el-table-column>
				<el-table-column label="更新时间" width="160px">
					<template slot-scope="sp">
						{{ sp.row.upd_time | time('yyyy-MM-dd hh:mm:ss') }}
					</template>
				</el-table-column>

				<el-table-column label="操作" width="120px">
					<template slot-scope="scope">
						<!-- 修改按钮 -->
						<el-button
							type="primary"
							icon="el-icon-edit"
							size="mini"
							@click="editFormOpen(scope.row)"
						></el-button>
						<!-- 删除按钮 -->
						<el-button
							type="danger"
							icon="el-icon-delete"
							size="mini"
							@click="removeUserById(scope.row.goods_id)"
						></el-button>
					</template>
				</el-table-column>
			</el-table>

			<!-- 分页区域 -->
			<el-pagination
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
				:current-page="queryInfo.pagenum"
				:page-sizes="[1, 2, 5, 10,16]"
				:page-size="queryInfo.pagesize"
				layout="total, sizes, prev, pager, next, jumper"
				:total="total"
			>
			</el-pagination>
		</el-card>

		<!-- 添加商品的对话框 -->
		<el-dialog
			title="添加商品"
			:visible.sync="addDialogVisible"
			width="50%"
			@close="addGoodsClose"
		>
			<!-- 内容主体区域 -->
			<el-form
				:model="addForm"
				:rules="addFormRules"
				ref="addFormRef"
				label-width="80px"
			>
				<el-form-item label="商品名称" prop="goods_name">
					<el-input
						v-model="addForm.goods_name"
					></el-input>
				</el-form-item>
				<el-form-item label="商品分类" prop="goods_cat">
					<el-cascader
						:options="parentCates"
						clearable
						v-model="selectNodes"
						:props="props"
						@change="handleChange"
						ref="cascaderChecked"
					></el-cascader>
				</el-form-item>
				<el-form-item label="商品价格" prop="goods_price">
					<el-input
						v-model="addForm.goods_price"
						:clearable="true"
					></el-input>
				</el-form-item>
				<el-form-item label="商品数量" prop="goods_number">
					<el-input
						v-model="addForm.goods_number"
						:clearable="true"
					></el-input>
				</el-form-item>
				<el-form-item label="商品重量" prop="goods_weight">
					<el-input
						v-model="addForm.goods_weight"
						:clearable="true"
					></el-input>
				</el-form-item>
				<el-form-item label="商品介绍" prop="goods_introduce">
					<el-input
						v-model="addForm.goods_introduce"
						:clearable="true"
					></el-input>
				</el-form-item>
				<el-form-item label="商品图片" prop="pics">
					<el-input
						v-model="addForm.pics"
						:clearable="true"
					></el-input>
				</el-form-item>
				<el-form-item label="商品参数" prop="attrs">
					<el-input
						v-model="addForm.attrs"
						:clearable="true"
					></el-input>
				</el-form-item>
			</el-form>
			<!-- 底部区域 -->
			<span slot="footer" class="dialog-footer">
				<el-button @click="addDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addGoods">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
import dateFormat from '../../assets/my'
import cityOptions from '../../assets/city_data2017_element'
export default {
	data() {
		return {
			// 分类列表
			parentCates: [],
			selectNodes:[],
			props: {
				label: 'cat_name',
				value: 'cat_id',
				children: 'children',
			},
			goodsList: [
				//用户角色列表
			],
			queryInfo: {
				//记录查询内容，每页条数，当前页码，用于请求数据
				query: '',
				pagesize: 10,
				pagenum: 1,
			},
			total: 1,
			addDialogVisible: false,
			editDis: false,
			addFormRules: {
				goods_name: [
					{
						required: true,
						message: '此项不能为空',
						trigger: 'blur',
					},
				],
				goods_cat: [
					{
						required: true,
						message: '此项不能为空',
						trigger: 'blur',
					},
				],
				goods_price: [
					{
						required: true,
						message: '此项不能为空',
						trigger: 'blur',
					},
				],
				goods_number: [
					{
						required: true,
						message: '此项不能为空',
						trigger: 'blur',
					},
				],
				goods_weight: [
					{
						required: true,
						message: '此项不能为空',
						trigger: 'blur',
					},
				],
			}, //添加表单的验证规则
			addForm: {
				//添加框的表单数据
				goods_name: '',
				goods_cat: '1,2,3',
				goods_price: '',
				goods_number: '',
				goods_weight: '',
				goods_introduce: '',
				pics: '',
				attrs: '',
			},
		}
	},
	methods: {
		handleChange(e) {
			this.addForm.goods_cat = e.join(',')
		},
		getGoodsList() {
			this.$axios({
				method: 'get',
				url: 'goods',
				params: this.queryInfo,
			}).then((res) => {
				this.goodsList = res.data.goods
				this.total = res.data.total
			})
		},
		handleSizeChange(e) {
			//每页显示条数发生变化时请求数据
			this.queryInfo.pagesize = e
			this.getGoodsList()
		},
		handleCurrentChange(e) {
			//页码发生变化时请求数据
			this.queryInfo.pagenum = e
			this.getGoodsList()
		},
		removeUserById(curId) {
			//删除
			this.$confirm('此操作将永久删除该商品, 是否继续?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
			})
				.then(() => {
					this.$axios({
						method: 'delete',
						url: `goods/${curId}`,
					}).then((res) => {
						//确定进入分支
						console.log(res)
						this.$message({
							type: 'success',
							message: '删除成功!',
						})
						this.getGoodsList()
					})
				})
				.catch(() => {
					this.$message({
						//取消进入分支
						type: 'info',
						message: '已取消删除',
					})
				})
		},
		// editFormOpen(curRow) {
		// 	//打开修改框
		// 	this.editDis = curRow.goods_id
		// 	this.getRightsList()
		// 	this.addDialogVisible = true
		// 	for (var k in this.addForm) {
		// 		this.addForm[k] = curRow[k]
		// 	}
		// 	// this.addForm = curRow
		// 	console.log(this.addForm)
		// },
		editFormOpen(curRow) {
			//打开修改框
			this.editDis = curRow.goods_id
			this.getRightsList()
			this.$axios({
				method:'get',
				url:'goods/'+this.editDis
			}).then(res=>{
				for (var k in this.addForm) {
					if(k=='pics'||k=='attrs'){
						this.addForm[k] = res.data[k].join(',')
						continue
					}
					this.addForm[k] = res.data[k]
				}
				this.selectNodes = res.data.goods_cat.split(',')
				this.selectNodes = this.selectNodes.map(item=>{
					return parseInt(item)
				})
				this.addDialogVisible = true
			})
		},
		addFormOpen() {
			//打开添加框
			this.$router.push('/home/add')
			return
			this.getRightsList()
			this.addDialogVisible = true
		},
		addGoodsClose() {
			this.$refs.addFormRef.resetFields()
			this.editDis = false
			console.log(this.$refs.cascaderChecked);
			this.selectNodes = []
		},
		addGoods() {
			// 确定添加
			this.$router.push('/home/add')
			return
			if (
				!this.addForm.goods_cat ||
				this.addForm.goods_cat.split(',').length != 3
			) {
				this.$message.error('请选择分类')
				return
			}
			// 修改分支
			if (this.editDis) {
				this.$axios({
					method: 'put',
					url: 'goods/' + this.editDis,
					data: this.addForm,
				}).then((res) => {
					console.log(res)
					if (res.meta.status == 200 || res.meta.status == 201) {
						this.$message.success('修改成功')
						this.getGoodsList()
						this.addDialogVisible = false
					} else {
						this.$message.error(res.meta.msg)
					}
				})
				return
			}
			this.$axios({
				method: 'post',
				url: 'goods',
				data: this.addForm,
			}).then((res) => {
				console.log(res)
				if (res.meta.status == 200 || res.meta.status == 201) {
					this.$message.success(res.meta.msg)
					this.getGoodsList()
					this.addDialogVisible = false
				} else {
					this.$message.error(res.meta.msg)
				}
			})
		},
		getRightsList() {
			this.$axios({
				method: 'get',
				url: 'categories',
				params: { type: 3 },
			}).then((res) => {
				this.parentCates = res.data
			})
		},
	},
	mounted() {
		this.getGoodsList()
	},
	filters: {
		time(val, args) {
			return dateFormat.dateFormat(val, args)
		},
		goodsStatus(val) {
			return val == 0 ? 'danger' : val == 1 ? '' : 'success'
		},
		goodsStatusName(val) {
			return val == 0 ? '未通过' : val == 1 ? '审核中' : '已审核'
		},
	},
}
</script>

<style scoped>
	.main{
	overflow-y: scroll;
	overflow-x: hidden;
	height: 100%;
}
</style>
