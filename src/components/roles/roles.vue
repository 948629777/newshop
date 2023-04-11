<template>
	<div class="main">
		<!-- 逐级导航区域 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }"
				>首页</el-breadcrumb-item
			>
			<el-breadcrumb-item>权限管理</el-breadcrumb-item>
			<el-breadcrumb-item>角色列表</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 搜索与添加区域 -->
		<el-row :gutter="20">
			<el-col :span="8">
				<el-input
					placeholder="请输入查询的id"
					v-model.number="queryInfo"
					clearable
					@clear="getRolesList"
				>
					<el-button
						slot="append"
						icon="el-icon-search"
						@click="getSearchRolesList"
					></el-button>
				</el-input>
			</el-col>
			<el-col :span="4">
				<el-button type="primary" @click="addDialogVisible = true"
					>添加角色</el-button
				>
			</el-col>
		</el-row>

		<!-- 角色列表区域 -->
		<el-table
			:data="rolesList"
			border
			stripe
			ref="table"
			@expand-change="expandChange"
		>
			<!-- 展开列表 -->
			<el-table-column type="expand">
				<template slot-scope="props">
					<el-row
						:span="12"
						v-for="item in props.row.children"
						:key="item.id"
					>
						<el-col :span="6"
							><el-tag
								@close="handleClose(props.row, item.id)"
								closable
								>{{ item.authName }}</el-tag
							></el-col
						>
						<el-col :span="18">
							<el-row
								v-for="eritem in item.children"
								:key="eritem.id"
							>
								<el-col :span="8">
									<el-tag
										type="success"
										@close="
											handleClose(props.row, eritem.id)
										"
										closable
										>{{ eritem.authName }}</el-tag
									>
								</el-col>
								<el-col :span="16">
									<el-tag
										type="danger"
										v-for="sanitem in eritem.children"
										:key="sanitem.id"
										@close="
											handleClose(props.row, sanitem.id)
										"
										closable
										>{{ sanitem.authName }}</el-tag
									>
								</el-col>
							</el-row>
						</el-col>
					</el-row>
				</template>
			</el-table-column>
			<!-- 正常表格 -->
			<el-table-column type="index"></el-table-column>
			<el-table-column label="ID" prop="id"></el-table-column>
			<el-table-column label="角色" prop="roleName"></el-table-column>
			<el-table-column label="角色描述" prop="roleDesc"></el-table-column>
			<el-table-column label="操作" width="240px">
				<template slot-scope="scope">
					<!-- 修改按钮 -->
					<el-button
						type="primary"
						icon="el-icon-edit"
						size="mini"
						@click="addUser(scope.row)"
					></el-button>
					<!-- 删除按钮 -->
					<el-button
						type="danger"
						icon="el-icon-delete"
						size="mini"
						@click="removeUserById(scope.row.id)"
					></el-button>
					<!-- 分配角色按钮 -->
					<el-tooltip
						effect="dark"
						content="设置权限"
						placement="top"
						:enterable="false"
					>
						<el-button
							type="warning"
							icon="el-icon-setting"
							size="mini"
							@click="setRole(scope.row)"
							>修改权限</el-button
						>
					</el-tooltip>
				</template>
			</el-table-column>
		</el-table>

		<!-- 添加用户的对话框 -->
		<el-dialog
			:title="title"
			:visible.sync="addDialogVisible"
			width="50%"
			@close="addDialogClosed"
		>
			<!-- 内容主体区域 -->
			<el-form
				:model="addForm"
				:rules="addFormRules"
				ref="addFormRef"
				label-width="70px"
			>
				<el-form-item label="角色名" prop="roleName">
					<el-input
						v-model="addForm.roleName"
						:disabled="editDis"
					></el-input>
				</el-form-item>
				<el-form-item label="角色描述" prop="roleDesc">
					<el-input
						v-model="addForm.roleDesc"
						:clearable="true"
					></el-input>
				</el-form-item>
			</el-form>
			<!-- 底部区域 -->
			<span slot="footer" class="dialog-footer">
				<el-button @click="addDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addUser">确 定</el-button>
			</span>
		</el-dialog>

		<!-- 分配权限的对话框 -->
		<el-dialog
			title="分配角色权限"
			:visible.sync="setRoleDialogVisible"
			width="50%"
			@close="setRoleDialogClosed"
		>
			<div>
				<p>当前的角色：{{ userInfo.roleName }}</p>
				<p>当前的角色ID：{{ userInfo.id }}</p>
				<p>
					分配新权限：
					<el-tree
						:data="rightsList"
						show-checkbox
						icon-class="el-icon-setting"
						:default-checked-keys="checkedNodes"
						node-key="id"
						ref="treendoes"
						highlight-current
						:props="defaultProps"
					>
					</el-tree>
				</p>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button @click="setRoleDialogVisible = false"
					>取 消</el-button
				>
				<el-button type="primary" @click="saveRoleInfo"
					>确 定</el-button
				>
			</span>
		</el-dialog>
	</div>
</template>

<script>
export default {
	data: function () {
		return {
			// 用户名编辑开关
			editDis: false,
			// 标题
			title: '添加用户',
			rolesList: [
				//用户角色列表
			],
			rightsList: [], //权限列表
			queryInfo: '', //查询内容
			setRoleDialogVisible: false, //分配角色
			addDialogVisible: false, //添加切换
			addForm: {
				//添加用户时收集的表单数据
				roleName: '',
				roleDesc: '',
				id: '',
			},
			addFormRules: {
				//添加用户时表单的验证规则
				roleName: [
					{
						required: true,
						message: '角色名不能为空',
						trigger: 'blur',
					},
					{
						min: 3,
						max: 12,
						message: '长度在 3 到 12 个字符',
						trigger: 'blur',
					},
					// {pattern:/^[\u4E00-\u9FA5A-Za-z0-9_]+$/,message:'用户名不合法',trigger:'blur'}
				],
				roleDesc: [
					{
						required: false,
						message: '角色描述为空',
						trigger: 'blur',
					},
					{
						min: 3,
						max: 12,
						message: '长度在 3 到 12 个字符',
						trigger: 'blur',
					},
					// {pattern:/^[\u4E00-\u9FA5A-Za-z0-9_]+$/,message:'用户名不合法',trigger:'blur'}
				],
			},
			userInfo: {
				//分配角色框使用的数据
				username: '',
				role_name: '',
			},
			userlist: [],
			defaultProps: {
				children: 'children',
				label: 'authName',
				value: 'id',
			},
			checkedNodes: [],
		}
	},
	methods: {
		getRolesList() {
			//请求角色列表
			this.$axios({
				//获取角色列表
				method: 'get',
				url: `roles`,
			}).then((res) => {
				this.rolesList = res.data
				this.open2()
			})
		},
		addDialogClosed() {
			//添加框关闭触发事件清空文本框
			this.$refs.addFormRef.resetFields()
			this.editDis = false
		},
		addUser(obj) {
			// 修改分支
			if (obj.id) {
				this.addForm.roleDesc = obj.roleDesc
				this.addForm.roleName = obj.roleName
				this.addForm.id = obj.id
				this.editDis = true
				this.addDialogVisible = true
				return
			}
			// id值不为空代表此时为修改
			if (this.addForm.id) {
				this.$axios({
					method: 'put',
					url: 'roles/' + this.addForm.id,
					data: {
						roleName: this.addForm.roleName,
						roleDesc: this.addForm.roleDesc,
					},
				}).then((res) => {
					this.getRolesList()
					this.addDialogVisible = false
				})
				return
			}
			//添加用户框确定提交触发
			this.$axios({
				method: 'post',
				url: 'roles',
				data: {
					roleName: this.addForm.roleName,
					roleDesc: this.addForm.roleDesc,
				},
			}).then((res) => {
				this.getRolesList()
				this.addDialogVisible = false
			})
		},
		handleClose(currentRow, rightsId) {
			//展开列表标签关闭时触发的事件  删除权限
			// 确认框
			this.$confirm('此操作将永久删除该角色此项权限, 是否继续?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
			})
				.then(() => {
					this.$axios({
						//发送删除请求
						method: 'delete',
						url: `roles/${currentRow.id}/rights/${rightsId}`,
					}).then((res) => {
						if (res.meta.status == 200) {
							this.$message({
								type: 'success',
								message: '删除权限成功',
							})
							currentRow.children = res.data
						} else {
							this.$message({
								type: 'error',
								message: '删除权限失败:' + res.meta.msg,
							})
						}
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
		setRoleDialogClosed() {
			//分配权限框关闭事件
			this.$refs.treendoes.setCheckedKeys([]) //清空选中节点
			this.userInfo.username = ''
			this.userInfo.role_name = ''
			this.userInfo.id = ''
		},
		setRole(obj) {
			//列表中分配权限按钮点击事件
			function getId(obj) {
				//提取当前点击角色的权限id
				var idarr = []
				if (obj.children) {
					obj.children.forEach((item) => {
						if (item.children) {
							idarr = idarr.concat(getId(item))
						} else {
							idarr.push(item.id)
						}
					})
				}
				return idarr
			}
			this.checkedNodes = getId(obj)
			this.userInfo.roleName = obj.roleName
			this.userInfo.roleDesc = obj.roleDesc
			this.setRoleDialogVisible = true
			this.userInfo.id = obj.id
		},
		saveRoleInfo() {
			//确定分配权限事件
			this.$confirm('您即将修改该角色的权限, 是否继续?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
			})
				.then(() => {
                    let checkArr = this.$refs.treendoes.getCheckedKeys().concat(this.$refs.treendoes.getHalfCheckedKeys())
					this.$axios({
						method: `post`,
						url: `roles/${this.userInfo.id}/rights`,
						data: {
							rids: checkArr.join(','),
						},
					}).then((res) => {
						//确定进入分支
						this.$message({
							type: 'success',
							message: '修改成功!',
						})
						this.setRoleDialogVisible = false
						this.getRolesList()
					})
				})
				.catch(() => {
					this.$message({
						//取消进入分支
						type: 'info',
						message: '已取消修改',
					})
				})
		},
		getSearchRolesList() {
			// 搜索角色
			if (this.queryInfo.length == 0) return
			this.$axios({
				method: 'get',
				url: 'roles/' + this.queryInfo,
			}).then((res) => {
				this.rolesList = [
					{
						id: res.data.roleId,
						roleName: res.data.roleName,
						roleDesc: res.data.roleDesc,
					},
				]
				this.open2()
			})
		},
		removeUserById(id) {
			//删除用户
			// 二次确认
			this.$confirm('此操作将永久删除该角色, 是否继续?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
			})
				.then(() => {
					this.$axios({
						method: 'delete',
						url: `roles/${id}`,
					}).then((res) => {
						//确定进入分支
						this.$message({
							type: 'success',
							message: '删除成功!',
						})
						this.getRolesList()
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
		open2() {
			// a=消息，b=弹框类型
			this.$message({
				message: '数据更新成功',
				type: 'success',
				duration: 2000,
			})
		},
		expandChange(e, a) {
			//表格展开行只展开单行
			if (a.length <= 1) return
			a.forEach((item) => {
				this.$refs.table.toggleRowExpansion(item, false)
			})
			this.$refs.table.toggleRowExpansion(e, true)
		},
	},
	mounted() {
		this.getRolesList()
		this.$axios({
			//获取权限列表
			method: 'get',
			url: 'rights/tree',
		}).then((res) => {
			this.rightsList = res.data
		})
	},
}
</script>

<style lang="less" scoped>
.el-row {
	margin: 15px 0;
}
.el-tag {
	margin: 0 15px;
}
.cell {
	text-align: center;
}
/* .main{
	overflow-y: scroll;
	overflow-x: hidden;
	height: 500px;
} */
</style>
