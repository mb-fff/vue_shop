<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            clearable
            @clear="getOrdersList()"
            placeholder="请输入内容"
            v-model="queryInfo.query"
          >
            <el-button @click="getOrdersList()" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表区域 -->
      <el-table :data="ordersList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.pay_status==='0' ? 'danger' : 'success'"
            >{{scope.row.pay_status==='0' ? '未付款' : '已付款'}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <!-- 过滤器 -->
          <template slot-scope="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改地址按钮 -->
            <el-button @click="showEditDialog" type="primary" size="mini">
              <i class="el-icon-edit"></i>
            </el-button>
            <!-- 物流进度按钮 -->
            <el-button @click="showPropressBox(scope.row)" type="success" size="mini">
              <i class="el-icon-location"></i>
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 修改地址对话框 -->
      <el-dialog
        title="修改地址"
        :visible.sync="addressDialogVisible"
        width="50%"
        @close="addressDialogClosed"
      >
        <!-- 修改地址的表单 -->
        <el-form
          :model="addressForm"
          :rules="addressFormRules"
          ref="addressFormRef"
          label-width="100px"
        >
          <el-form-item label="省市区(县)" prop="address1">
            <el-cascader :options="cityDate" v-model="addressForm.address1"></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="addressForm.address2"></el-input>
          </el-form-item>
        </el-form>

        <!-- 底部按钮 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addressDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editAdress">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 展示物流进度对话框 -->
      <el-dialog title="物流进度" :visible.sync="progressDialogVisible" width="50%">
        <el-timeline :reverse="false">
          <el-timeline-item
            v-for="(item, index) in progressInfo"
            :key="index"
            :timestamp="item.time"
          >{{item.context}}</el-timeline-item>
        </el-timeline>
      </el-dialog>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5,10,15,20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
import cityData from './citydata.js'
import progressData from './progressData.js'
export default {
  data() {
    return {
      // 查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 订单列表数据
      ordersList: [],
      // 订单总数据条数
      total: 0,

      // 控制修改地址对话框的显示与隐藏
      addressDialogVisible: false,
      // 修改地址的表单
      addressForm: {
        address1: [],
        address2: ''
      },
      // 修改地址的校验规则
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区(县)', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      // 城市数据
      cityDate: cityData,

      // 控制物流进度对话框的显示与隐藏
      progressDialogVisible: false,
      // 物流进度信息
      progressInfo: progressData.data
    }
  },
  created() {
    this.getOrdersList()
  },
  methods: {
    // 根据分页获取对应的订单列表数据
    async getOrdersList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表数据失败')
      }
      // 获取订单列表数据成功
      this.ordersList = res.data.goods
      this.total = res.data.total
      console.log(this.ordersList)
    },
    // 切换一页显示的数据条数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrdersList()
    },
    // 切换页码
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrdersList()
    },

    // 监听修改地址对话框的关闭
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields()
    },
    // 展示修改地址的对话框
    showEditDialog() {
      this.addressDialogVisible = true
    },
    // 确认修改地址
    editAdress() {
      // 预校验
      this.$refs.addressFormRef.validate(valid => {
        if (!valid) {
          return this.$message.error('请检查表格是否填写完整!')
        }
        this.$message.success('修改地址成功')
        this.addressDialogVisible = false
      })
    },

    // 显示物流进度
    async showPropressBox() {
      // const { data: res } = await this.$http.get(`/kuaidi/${id}`)
      // if (res.meta.status !== 200) {
      //   return this.$message.error('获取物流进度失败')
      // }
      // this.$message.success('获取物流进度成功')
      // this.progressInfo = res.data
      // console.log(res.data)
      this.progressDialogVisible = true
      // console.log(this.progressInfo)
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
