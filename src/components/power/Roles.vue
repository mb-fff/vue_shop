<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddRoleDialog()">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开项 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom',i1===0 ? 'bdtop' : '','vcenter']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环 嵌套渲染二级权限 -->
                <el-row
                  :class="['bdbottom',i2===0 ? 'bdtop' : '','vcenter']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 渲染二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                      type="success"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                      type="warning"
                      :class="['bdbottom',i3===0 ? 'bdtop' : '']"
                      v-for="(item3,i3) in item2.children"
                      :key="item3.id"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button
              @click="showEditRoleById(scope.row.id)"
              type="primary"
              icon="el-icon-edit"
              size="mini"
            >编辑</el-button>
            <!-- 删除按钮 -->
            <el-button
              @click="removeRoleById(scope.row.id)"
              type="danger"
              icon="el-icon-delete"
              size="mini"
            >删除</el-button>
            <!-- 分配权限按钮 -->
            <el-button
              @click="showSetRightDialog(scope.row)"
              type="warning"
              icon="el-icon-setting"
              size="mini"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色的对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed()">
      <!-- 标题 -->
      <span slot="title" class="dialog-title">添加角色</span>
      <!-- 内容主体区 -->
      <el-form
        :model="addRolesForm"
        :rules="addRolesFormRules"
        ref="addRolesFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoleInfo()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色的对话框 -->
    <el-dialog
      title="修改角色"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed()"
    >
      <!-- 标题 -->
      <span slot="title" class="dialog-title">修改角色</span>
      <!-- 内容主体区 -->
      <el-form
        :model="editRolesForm"
        :rules="editRolesFormRules"
        ref="editRolesFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表数据
      rolelist: [],

      // 控制添加角色对话框的显示与隐藏
      addDialogVisible: false,
      // 添加角色表单数据
      addRolesForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色表单验证规则
      addRolesFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在2-10个字符之间', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在3-10个字符之间', trigger: 'blur' }
        ]
      },

      // 控制修改角色对话框显示与隐藏
      editDialogVisible: false,
      // 查询到的角色信息
      editRolesForm: {},
      // 修改角色表单验证规则
      editRolesFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在2-10个字符之间', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在3-10个字符之间', trigger: 'blur' }
        ]
      },

      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 所有权限数据
      rightslist: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点Id值数组
      defKeys: [],
      // 角色的id
      roleId: ''
    }
  },
  created() {
    // 获取角色列表数据
    this.getRolesList()
  },
  methods: {
    // 声明获取角色列表数据方法
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      // 获取成功
      this.rolelist = res.data
    },

    // 显示添加角色对话框
    showAddRoleDialog() {
      this.addDialogVisible = true
    },
    // 点击确定，添加角色
    addRoleInfo() {
      // 预校验
      this.$refs.addRolesFormRef.validate(async valid => {
        // 预校验失败,return
        if (!valid) return
        // 发起添加角色的数据请求
        const { data: res } = await this.$http.post('roles', this.addRolesForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败')
        }
        // 添加角色成功
        // 关闭对话框
        this.addDialogVisible = false
        // 刷新数据列表
        this.getRolesList()
        // 提示修改成功
        this.$message.success('添加角色成功')
      })
    },
    // 监听添加角色对话框的关闭
    addDialogClosed() {
      this.$refs.addRolesFormRef.resetFields()
    },

    // 显示编辑角色对话框
    async showEditRoleById(id) {
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色信息失败')
      }
      // 查询角色信息成功
      this.editRolesForm = res.data
      // 修改角色对话框显示
      this.editDialogVisible = true
    },
    // 监听编辑角色对话框的关闭
    editDialogClosed() {
      this.$refs.editRolesFormRef.resetFields()
    },
    // 点击确定按钮，修改角色信息
    editRoleInfo() {
      // 预校验
      this.$refs.editRolesFormRef.validate(async (valid) => {
        if (!valid) return
        // 发起修改角色信息的数据请求
        const { data: res } = await this.$http.put(`roles/${this.editRolesForm.roleId}`, {
          roleName: this.editRolesForm.roleName,
          roleDesc: this.editRolesForm.roleDesc
        })
        if (res.meta.status !== 200) {
          return this.$message.error('更新角色失败')
        }
        // 更新角色信息成功
        // 关闭对话框
        this.editDialogVisible = false
        // 刷新数据列表
        this.getRolesList()
        // 提示修改成功
        this.$message.success('更新角色信息成功')
      })
    },

    // 删除角色
    async removeRoleById(id) {
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户确认删除，则返回值为字符串confirm
      // 如果用户取消删除，则返回值为字符串cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      // 确认删除
      const { data: res } = await this.$http.delete(`roles/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      // 删除成功
      this.$message.success('删除成功')
      // 更新用户列表
      this.getRolesList()
    },

    // 根据id删除对应的权限
    async removeRightById(role, rightId) {
      // 弹框提示用户是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户确认删除，则返回值为字符串confirm
      // 如果用户取消删除，则返回值为字符串cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      // 确认删除
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      // 删除成功
      this.$message.success('删除成功')

      // 不建议更新用户列表，性能损耗太大
      // this.getRolesList()

      // 更新当前的role即可
      role.children = res.data
    },

    // 显示分配权限对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      // 获取所有权限数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      }
      // 获取权限数据成功
      // 将获取到的所有权限数据保存到data中
      this.rightslist = res.data
      // 递归获取三级节点的id,默认勾选权限
      this.getLeafKeys(role, this.defKeys)
      // 弹出对话框
      this.setRightDialogVisible = true
    },
    // 通过递归的形式,获取角色下所有三级权限的id,并保存到 defkeys 数组中
    getLeafKeys(node, arr) {
      // 如果当前node不包含children属性,则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 监听分配对话框的关闭
    setRightDialogClosed() {
      this.defKeys = [] // 对话框关闭,重置默认选中的节点Id值数组
    },
    // 点击确定,为角色分配权限
    async allotRights() {
      // getCheckedKeys:返回目前被选中的节点的 key 所组成的数组
      // getHalfCheckedKeys:返回目前半选中的节点的 key 所组成的数组
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')

      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: idStr
      })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      // 分配权限成功
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
// 上边框线
.bdtop {
  border-top: 1px solid #eee;
}
// 下边框线
.bdbottom {
  border-bottom: 1px solid #eee;
}
/* 纵向对齐 */
.vcenter {
  display: flex;
  align-items: center;
}
</style>
