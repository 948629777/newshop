<template>
	<div>
		<!-- 逐级导航区域 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }"
				>首页</el-breadcrumb-item
			>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item :to="{ path: '/home/goods' }"
				>商品分类</el-breadcrumb-item
			>
			<el-breadcrumb-item>添加商品</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片视图区域 -->
		<el-card>
			<!-- 搜索与添加区域 -->
			<el-row :gutter="20">
				<el-col :span="24">
					<el-alert
						center
						title="添加商品信息"
						type="info"
						show-icon
						:closable="false"
					></el-alert>
				</el-col>
			</el-row>
			<el-steps :active="+active" finish-status="success">
				<el-step title="基本信息"></el-step>
				<el-step title="商品参数"></el-step>
				<el-step title="商品属性"></el-step>
				<el-step title="商品图片"></el-step>
				<el-step title="商品内容"></el-step>
				<el-step title="完成"></el-step>
			</el-steps>
			<!-- 选项卡 -->
			<el-form
				:model="addForm"
				:rules="addFormRules"
				ref="addFormRef"
				label-width="80px"
			>
				<el-tabs :tab-position="tabPosition" v-model="active"> 
					<el-tab-pane label="基本信息"
						>基本信息
						<el-form-item label="商品名称" prop="goods_name">
							<el-input v-model="addForm.goods_name"></el-input>
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
						<el-form-item label="商品分类" prop="goods_cat">
							<el-cascader
								:options="parentCates"
								clearable
								v-model="selectId"
								:props="props"
								@change="handleChange"
								ref="cascaderChecked"
							></el-cascader>
						</el-form-item>
					</el-tab-pane>
					<el-tab-pane label="商品参数">
						<el-form-item
							:label="item.attr_name"
							v-for="item in manyList"
							:key="item.attr_id"
						>
							<el-checkbox-group
								v-model="item.attr_vals"
								size="small"
							>
								<el-checkbox
									:label="item1"
									:key="item1.attr_id"
									v-for="item1 in item.attr_vals"
								></el-checkbox>
							</el-checkbox-group>
						</el-form-item>
					</el-tab-pane>
					<el-tab-pane label="商品属性">
						<el-form-item
							:label="item.attr_name"
							v-for="item in onlyList"
							:key="item.attr_id"
						>
							<el-input v-model="item.attr_vals"></el-input>
						</el-form-item>
					</el-tab-pane>
					<el-tab-pane label="商品图片">
						<el-upload
							class="upload-demo"
							:action="uploadUrl"
							:on-preview="handlePreview"
							:on-remove="handleRemove"
							:on-success = 'handleSuccess'
							:file-list="fileList"
							:headers="headers"
							list-type="picture"
						>
							<el-button size="small" type="primary"
								>点击上传</el-button
							>
							<div slot="tip" class="el-upload__tip">
								只能上传jpg/png文件，且不超过500kb
							</div>
						</el-upload>
					</el-tab-pane>
					<el-tab-pane label="商品内容">
						<quill-editor v-model="addForm.goods_introduce">
							
						</quill-editor>
						<el-button type="primary" @click="addSubmit">
							确定
						</el-button>
					</el-tab-pane>
					<el-tab-pane label="完成">完成</el-tab-pane>
				</el-tabs>
			</el-form>
		</el-card>


		<el-dialog
  title="图片预览"
  :visible.sync="imgVisible"
  width="30%">
  <img :src="imgurl">
</el-dialog>
	</div>
</template>

<script>
export default {
	data() {
		return {
			imgurl:'',
			imgVisible:false,
			headers:{
  				Authorization:sessionStorage.getItem('shopToken')
			},
			// 上传路径
			uploadUrl:'http://127.0.0.1:8888/api/private/v1/upload',
			fileList:[//文件列表

			],
			manyAttrs: [],
			selectId: '',
			manyList: [],
			onlyList: [],
			activeName: 'many',
			props: {
				label: 'cat_name',
				value: 'cat_id',
				children: 'children',
			},
			parentCates: [],
			selectNodes: [],
			active: '0',
			tabPosition: 'left',
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
		}
	},
	methods: {
		// tabChange(newTabs, oldTabs) {
		// 	// return false
		// 	if(oldTabs){
		// 		this.next(+newTabs+1)
		// 	}
		// },
		// next(index) {
		// 	this.active = index
		// },
		handleChange(e) {
			//选中的节点转化为字符串并赋给提交表单
			this.addForm.goods_cat = e.join(',')
			if(e.length==0){
			    this.$message.error('必须选择分类')
			    this.addForm.goods_cat = ''
			}
			this.getParamsById('many')
			this.getParamsById('only')
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
		getParamsById(name) {
			this.$axios({
				method: 'get',
				url: `categories/${
					this.selectId[this.selectId.length - 1]
				}/attributes`,
				params: {
					sel: name,
				},
			}).then((res) => {
				if (name == 'many') {
					res.data.forEach((item) => {
						item.attr_vals = item.attr_vals.split(',')
						item.inputVisible = false
						item.inputValue = ''
					})
				}
				this[`${name}List`] = res.data
			})
		},
		handlePreview(file){
			// 图片预览事件
			this.imgVisible = true
			this.imgurl = file.response.data.url
		},
		handleRemove(file,fileList){
			// 图片删除事件
			console.log(file,fileList);
		},
		handleSuccess(response, file, fileList){
			// 图片上传成功
			var arr = []
			fileList.forEach((item,index)=>{
				arr[index]={pic:item.response.data.tmp_path}
			})
			this.addForm.pics = arr
		},
		addSubmit(){
			// 添加提交
			this.$axios({
				method: 'post',
				url: 'goods',
				data: this.addForm,
			}).then((res) => {
				console.log(res)
				if (res.meta.status == 200 || res.meta.status == 201) {
					this.$message.success(res.meta.msg)
					this.$router.push('/home/goods')
				} else {
					this.$message.error(res.meta.msg)
				}
			})
		}
	},
	mounted() {
		this.getRightsList()
	},
}
</script>

<style scoped></style>
