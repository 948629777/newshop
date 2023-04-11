<template>
	<div>
		<!-- 逐级导航区域 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }"
				>首页</el-breadcrumb-item
			>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>分类参数</el-breadcrumb-item>
		</el-breadcrumb>
		<el-card>
			<!-- 搜索与添加区域 -->
			<el-row>
				<el-alert
					effect="dark"
					title="注意：只允许为第三级分类设置参数"
					type="warning"
					center
					show-icon
					:closable="false"
				>
				</el-alert>
			</el-row>
			<el-row :gutter="20" style="text-align: left">
				<span>选择商品分类:</span>
				<el-cascader
					:options="parentCates"
					v-model="selectId"
					clearable
					:props="props"
					@change="handleChange"
				></el-cascader>
			</el-row>
			<el-tabs v-model="activeName" @tab-click="handleClick">
				<el-tab-pane label="动态参数" name="many">
					<el-button
						type="primary"
						:disabled="btnFlag"
						@click="addVisible = true"
						>添加参数</el-button
					>
					<el-table :data="manyList" border stripe>
						<!-- 展开列表 -->
						<el-table-column type="expand">
							<template slot-scope="sp">
								<el-tag
									:key="item"
									v-for="item in sp.row.attr_vals"
									closable
									:disabled-transitions="false"
									@close="handleInputConfirm(sp.row, item)"
									>{{ item }}
								</el-tag>
								<el-input
									style="width: 100px"
									class="input-new-tag"
									v-if="sp.row.inputVisible"
									v-model="sp.row.inputValue"
									ref="saveTagInput"
									size="small"
									@keyup.enter.native="
										handleInputConfirm(sp.row)
									"
									@blur="handleInputConfirm(sp.row)"
								>
								</el-input>
								<el-button
									v-else
									class="button-new-tag"
									size="small"
									@click="showInput(sp.row)"
									>+ New Tag</el-button
								>
							</template>
						</el-table-column>

						<!-- 列表 -->
						<el-table-column
							type="index"
							label="#"
						></el-table-column>
						<el-table-column
							label="名字"
							prop="attr_name"
						></el-table-column>
						<el-table-column label="操作">
							<template slot-scope="sp">
								<el-button type="primary" @click="editParams(sp.row)">修改</el-button>
							<el-button type="danger" @click="delParams(sp.row.attr_id)">删除</el-button>
							</template>
						</el-table-column>
					</el-table>
				</el-tab-pane>
				<el-tab-pane label="静态属性" name="only">
					<el-button type="primary" :disabled="btnFlag" @click="addVisible = true"
						>添加属性</el-button
					>
					<el-table :data="onlyList" border stripe>
						<el-table-column
							type="index"
							label="#"
						></el-table-column>
						<el-table-column
							label="名字"
							prop="attr_name"
						></el-table-column>
						<el-table-column label="操作">
							<template slot-scope="sp">
								<el-button type="primary" @click="editParams(sp.row)">修改</el-button>
							<el-button type="danger" @click="delParams(sp.row.attr_id)">删除</el-button>
							</template>
						</el-table-column>
					</el-table>
				</el-tab-pane>
			</el-tabs>
		</el-card>

		<!-- 添加参数 -->
		<el-dialog title="添加参数" :visible.sync="addVisible" @close="addClose">
			<el-form
				:model="addForm"
				label-width="80px"
				ref="addFormRef"
				:rules="addFormRules"
			>
				<el-form-item label="参数名称" prop="attr_name">
					<el-input v-model="addForm.attr_name"></el-input>
				</el-form-item>
				<el-form-item label="参数分类">
					<el-select
						v-model="addForm.attr_sel"
						placeholder="请选择参数分类"
						@change="attrselChange"
					>
						<el-option label="动态参数" value="many"></el-option>
						<el-option label="静态参数" value="only"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="参数属性" prop="attr_vals">
					<el-input v-model="addForm.attr_vals"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="addVisible = false">取 消</el-button>
				<el-button type="primary" @click="addParams">确 定</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
export default {
	data() {
		return {
			editId:'',
			editFlag:false,
			flag: true,
			addVisible: false,
			manyList: [],
			onlyList: [],
			activeName: 'many',
			btnFlag: true,
			props: {
				label: 'cat_name',
				value: 'cat_id',
				children: 'children',
			},
			parentCates: [],
			selectId: [],
			queryInfo: {
				//记录查询内容，每页条数，当前页码，用于请求数据
				query: '',
				pagesize: 10,
				pagenum: 1,
			},
			addForm: {
				attr_name: '',
				attr_vals: '',
				attr_sel: 'many',
			},
			addFormRules: {
				//添加用户时表单的验证规则
				attr_name: [
					{
						required: true,
						message: '参数名不能为空',
						trigger: 'blur',
					},
				],
				attr_vals: [
					{
						validator: (rule, value, callback) => {
							if (this.flag && !value) {
								callback(new Error('参数属性不能为空'))
								return false
							} else {
								callback()
								return true
							}
						},
						message: '参数属性不能为空',
						trigger: 'blur',
					},
				],
			},
		}
	},
	methods: {
		getParamsList() {
			this.$axios({
				method: 'get',
				url: 'categories',
			}).then((res) => {
				this.parentCates = res.data
			})
		},
		handleChange(e) {
			if (e.length > 0) {
				this.btnFlag = false
				this.getParamsById()
			} else {
				this.btnFlag = true
			}
		},
		handleClick() {
			//选项卡点击事件
			this.addForm.attr_sel = this.activeName
			this.flag=this.addForm.attr_sel=='many'?true:false
			this.getParamsById()
		},
		getParamsById() {
			this.$axios({
				method: 'get',
				url: `categories/${
					this.selectId[this.selectId.length - 1]
				}/attributes`,
				params: {
					sel: this.activeName,
				},
			}).then((res) => {
				res.data.forEach((item) => {
					item.attr_vals = item.attr_vals.split(',')
					item.inputVisible = false
					item.inputValue = ''
				})
				this[`${this.activeName}List`] = res.data
			})
		},
		handleInputConfirm(item, curitem) {
			if (curitem) {
				var index = item.attr_vals.findIndex((im) => {
					return im == curitem
				})
				item.attr_vals.splice(index, 1)
			}
			// 标签的修改确定
			if (!item.inputValue && !curitem) {
				return
			} else if (item.inputValue) {
				item.attr_vals.push(item.inputValue)
			}
			item.inputVisible = false
			let id = this.selectId[this.selectId.length - 1]
			let attrId = item.attr_id
			let cs = {
				attr_name: item.attr_name,
				attr_sel: item.attr_sel,
				attr_vals: item.attr_vals.join(' '),
			}
			this.$axios({
				method: 'put',
				url: `categories/${id}/attributes/${attrId}`,
				data: cs,
			}).then((res) => {
				if (res.meta.status === 200) {
					this.$message.success('更新成功')
				}
			})
			item.inputValue = ''
		},
		showInput(item) {
			item.inputVisible = true
			this.$nextTick((_) => {
				//文本框显示焦点聚集
				this.$refs.saveTagInput.$refs.input.focus()
			})
		},
		addParams() {
			/* 修改分支 */
			if(this.editId){
				this.$axios({
					method:'put',
					url:`categories/${this.selectId[this.selectId.length - 1]}/attributes/${this.editId.attr_id}`,
					data:this.addForm
				}).then(res=>{
					if(res.meta.status===200){
					this.getParamsById()
					this.addVisible = false
					this.$message.success(res.meta.msg)
					}else{
						this.$message.error(res.meta.msg)
					}
				})
				return
			}
			// 增加分支
			this.$refs.addFormRef.validate((valid) => {
				if (valid) {
					this.$axios.post(`categories/${this.selectId[this.selectId.length - 1]}/attributes`,
					 this.addForm).then((res) => {
						if(res.meta.status===201){
							this.$message.success('添加成功')
							this.addVisible = false
							this.getParamsById()
						}else{
							this.$message.error(res.meta.msg)
						}
					 })
				}
				return false
			})
		},
		attrselChange(){
			this.flag=this.addForm.attr_sel=='many'?true:false
		},
		delParams(curId){
			this.$axios({
				method:'delete',
				url:`categories/${this.selectId[this.selectId.length - 1]}/attributes/${curId}`
			}).then(res=>{
				if(res.meta.status===200){
					this.$message.success('删除成功')
					this.getParamsById()
				}else{
					this.$message.success('删除失败')
				}
			})
		},
		addClose(){
			this.$refs.addFormRef.resetFields()
			this.addForm.attr_sel = this.activeName
			this.editFlag = false
			this.editId = ''
		},
		editParams(row){
			this.addVisible = true
			this.editFlag = true
			this.editId = row
			this.addForm.attr_name = this.editId.attr_name
			this.addForm.attr_vals = this.editId.attr_vals.join(',')
		},
	},
	mounted() {
		this.getParamsList()
	},
	computed: {
		isOk() {
			return this.addForm.attr_sel == 'many' ? true : false
		},
	},
}
</script>

<style scoped>
.el-tag + .el-tag {
	margin-left: 10px;
}
.button-new-tag {
	margin-left: 10px;
	height: 32px;
	line-height: 30px;
	padding-top: 0;
	padding-bottom: 0;
}
.input-new-tag {
	width: 90px;
	margin-left: 10px;
	vertical-align: bottom;
}
</style>
