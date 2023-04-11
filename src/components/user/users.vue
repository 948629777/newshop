<template>
	<div class="main">
		<!-- 逐级导航区域 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }"
				>首页</el-breadcrumb-item
			>
			<el-breadcrumb-item>用户管理</el-breadcrumb-item>
			<el-breadcrumb-item>用户列表</el-breadcrumb-item>
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
						@clear="getUserList"
					>
						<el-button
							slot="append"
							icon="el-icon-search"
							@click="getUserList"
						></el-button>
					</el-input>
				</el-col>
				<el-col :span="4">
					<el-button type="primary" @click="addDialogVisible = true"
						>添加用户</el-button
					>
				</el-col>
			</el-row>

			<!-- 用户列表区域 -->
			<el-table :data="userlist" border stripe>
				<el-table-column type="index"></el-table-column>
				<el-table-column label="姓名" prop="username"></el-table-column>
				<el-table-column label="邮箱" prop="email"></el-table-column>
				<el-table-column label="电话" prop="mobile"></el-table-column>
				<el-table-column
					label="角色"
					prop="role_name"
				></el-table-column>
				<el-table-column label="状态">
					<template slot-scope="scope">
						<el-switch
							v-model="scope.row.mg_state"
							@change="userStateChanged(scope.row)"
						>
						</el-switch>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="180px">
					<template slot-scope="scope">
						<!-- 修改按钮 -->
						<el-button
							type="primary"
							icon="el-icon-edit"
							size="mini"
							@click="showEditDialog(scope.row)"
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
							content="分配角色"
							placement="top"
							:enterable="false"
						>
							<el-button
								type="warning"
								icon="el-icon-setting"
								size="mini"
								@click="setRole(scope.row)"
							></el-button>
						</el-tooltip>
					</template>
				</el-table-column>
			</el-table>

			<!-- 分页区域 -->
			<el-pagination
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
				:current-page="queryInfo.pagenum"
				:page-sizes="[1, 2, 5, 10]"
				:page-size="queryInfo.pagesize"
				layout="total, sizes, prev, pager, next, jumper"
				:total="total"
			>
			</el-pagination>
		</el-card>

		<!-- 添加用户的对话框 -->
		<el-dialog
			title="添加用户"
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
				<el-form-item label="用户名" prop="username">
					<el-input v-model="addForm.username"></el-input>
				</el-form-item>
				<el-form-item label="密码" prop="password">
					<el-input v-model="addForm.password"></el-input>
				</el-form-item>
				<el-form-item label="邮箱" prop="email">
					<el-input v-model="addForm.email"></el-input>
				</el-form-item>
				<el-form-item label="手机" prop="mobile">
					<el-input v-model="addForm.mobile"></el-input>
				</el-form-item>
			</el-form>
			<!-- 底部区域 -->
			<span slot="footer" class="dialog-footer">
				<el-button @click="addDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addUser">确 定</el-button>
			</span>
		</el-dialog>

		<!-- 修改用户的对话框 -->
		<el-dialog
			title="修改用户"
			:visible.sync="editDialogVisible"
			width="50%"
			@close="editDialogClosed"
		>
			<el-form
				:model="editForm"
				:rules="editFormRules"
				ref="editFormRef"
				label-width="70px"
			>
				<el-form-item label="用户名">
					<el-input v-model="editForm.username" disabled></el-input>
				</el-form-item>
				<el-form-item label="邮箱" prop="email">
					<el-input v-model="editForm.email"></el-input>
				</el-form-item>
				<el-form-item label="手机" prop="mobile">
					<el-input v-model="editForm.mobile"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="editUserInfo"
					>确 定</el-button
				>
			</span>
		</el-dialog>

		<!-- 分配角色的对话框 -->
		<el-dialog
			title="分配角色"
			:visible.sync="setRoleDialogVisible"
			width="50%"
			@close="setRoleDialogClosed"
		>
			<div>
				<p>当前的用户：{{ userInfo.username }}</p>
				<p>当前的角色：{{ userInfo.role_name }}</p>
				<p>
					分配新角色：
					<el-select v-model="selectedRoleId" placeholder="请选择">
						<el-option
							v-for="item in rolesList"
							:key="item.id"
							:label="item.roleName"
							:value="item.id"
						>
						</el-option>
					</el-select>
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
			rolesList: [
				//用户角色列表
			],
			queryInfo: {
				//记录查询内容，每页条数，当前页码，用于请求数据
				query: '',
				pagesize: 10,
				pagenum: 1,
			},
			addForm: {
				//添加用户时收集的表单数据
				username: '',
				password: '',
				email: '',
				mobile: '',
			},
			editForm: {
				//修改框的表单
				username: '',
				email: '',
				mobile: '',
				id: '',
			},
			addFormRules: {
				//添加用户时表单的验证规则
				username: [
					{
						required: true,
						message: '用户名不能为空',
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
				email: [
					{
						required: true,
						message: '邮箱不能为空',
						trigger: 'blur',
					},
					{pattern:/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(.[a-zA-Z0-9_-]+)+$/,message:'邮箱不合法',trigger:'blur'}
				],
				mobile: [
					{
						required: true,
						message: '手机号不能为空',
						trigger: 'blur',
					},
					// {pattern:/^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/,message:'手机号不合法',trigger:'blur'}
				],
			},
			editFormRules: {
				//修改框的表单验证规则
				username: [
					{
						required: true,
						message: '用户名不能为空',
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
				password: [
					{
						required: true,
						message: '密码不能为空',
						trigger: 'blur',
					},
					{
						min: 3,
						max: 16,
						message: '长度在 3 到 16 个字符',
						trigger: 'blur',
					},
					// {pattern:/^\w+$ 或 ^\w{3,20}$/,message:'密码不合法',trigger:'blur'}
				],
				email: [
					{
						required: true,
						message: '邮箱不能为空',
						trigger: 'blur',
					},
					// {pattern:/^\w+([-+.]\w+)@\w+([-.]\w+).\w+([-.]\w+)*$/,message:'邮箱不合法',trigger:'blur'}
				],
				mobile: [
					{
						required: true,
						message: '手机号不能为空',
						trigger: 'blur',
					},
					// {pattern:/^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/,message:'手机号不合法',trigger:'blur'}
				],
			},
			userInfo: {
				//分配角色框表单
				username: '',
				role_name: '',
				id: '',
			},
			userlist: [//用户列表数据

			],
			total: 1,
			editDialogVisible: false, //修改切换
			selectedRoleId: '', //打开分配框时当前选择用户将分配的角色ID
			setRoleDialogVisible: false, //分配角色
			addDialogVisible: false, //添加切换
		}
	},
	methods: {
		addUser() {
			//添加用户框确定提交触发
			this.$axios({
				//发送post请求
				method: 'post',
				url: `users`,
				data: this.addForm,
			}).then(() => {
				this.getUserList()
				this.addDialogVisible = false
			})
		},
		showEditDialog(obj) {
			//列表中的修改按钮事件
			this.editDialogVisible = true
			this.editForm.username = obj.username
			this.editForm.mobile = obj.mobile
			this.editForm.email = obj.email
			this.editForm.id = obj.id
		},
		editUserInfo() {
			//修改框的确定按钮
			this.$axios({
				//发送put请求
				method: 'put',
				url: `users/${this.editForm.id}`,
				data: {
					email: this.editForm.email,
					mobile: this.editForm.mobile,
				},
			}).then((res) => {
				this.getUserList()
				this.editDialogVisible = false
			})
		},
		setRoleDialogClosed() {
			//分配角色框关闭事件
			this.userInfo.username = ''
			this.userInfo.role_name = ''
			this.selectedRoleId = ''
			this.userInfo.id = ''
		},
		saveRoleInfo() {
			//确定分配角色事件
			this.$axios({
				//发送put请求
				method: 'put',
				url: `users/${this.userInfo.id}/role`,
				data: {
					rid: this.selectedRoleId,
				},
			}).then((res) => {
				this.setRoleDialogVisible = false
				this.getUserList()
			})
		},
		setRole(obj) {
			//列表中分配角色按钮点击事件
			this.userInfo.username = obj.username
			this.userInfo.role_name = obj.role_name
			this.setRoleDialogVisible = true
			this.userInfo.id = obj.id
		},
		removeUserById(id) {
			//删除用户
			// 二次确认
			this.$confirm('此操作将永久删除该用户, 是否继续?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
			})
				.then(() => {
					this.$axios({
						method: 'delete',
						url: `users/${id}`,
					}).then(() => {//确定进入分支
						this.$message({
							type: 'success',
							message: '删除成功!',
						})
						this.getUserList()
					})
				}).catch(() => {
					this.$message({//取消进入分支
						type: 'info',
						message: '已取消删除',
					})
				})
		},
		userStateChanged(curItem) {
			//用户状态发生改变
			this.$axios({
				method: 'put',
				url: `users/${curItem.id}/state/${curItem.mg_state}`,
			})
		},
		editDialogClosed() {
			//修改用户框关闭时触发的事件editFormRef
      this.$refs.editFormRef.resetFields()
		},
		open2() {
			// 更新数据提示消息
			this.$message({
				message: '数据更新成功',
				type: 'success',
				duration: 2000,
			})
		},
		getUserList() {
			//请求用户列表
			this.$axios({
				method: 'get',
				url: 'users',
				params: this.queryInfo,
			}).then((res) => {
				this.total = res.data.total
				this.userlist = res.data.users
				this.open2()
			})
		},
		handleSizeChange(e) {
			//每页显示条数发生变化时请求数据
			this.queryInfo.pagesize = e
			this.getUserList()
		},
		handleCurrentChange(e) {
			//页码发生变化时请求数据
			this.queryInfo.pagenum = e
			this.getUserList()
		},
		addDialogClosed() {
			//添加框关闭触发事件清空文本框
      this.$refs.addFormRef.resetFields()
		},
	},
	mounted() {
		this.getUserList()
		this.$axios({
			//获取角色列表
			method: 'get',
			url: `roles`,
		}).then((res) => {
			this.rolesList = res.data
		})
	},
}
</script>

<style scoped>
	.main{
		overflow-y: scroll;
		overflow-x: hidden;
		height: 500px;
	}
</style>
