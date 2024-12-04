# 使用 Node.js 官方镜像，并指定版本 18.18.0
FROM node:18.18.0

# 设置工作目录
WORKDIR /app

# 将 package.json 和 package-lock.json 复制到容器中
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制所有其他文件
COPY . .

# 构建 Next.js 应用（如果有自定义构建步骤）
RUN npm run build

# 设置环境变量，Next.js 默认运行在 3000 端口
ENV PORT 3000

# 启动 Next.js 应用
CMD ["npm", "start"]
