-- 为 documents 表启用 RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 允许已登录用户插入数据，且插入的数据 user_id 必须等于当前用户 ID
CREATE POLICY "Users can insert their own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 允许已登录用户查询自己的数据
CREATE POLICY "Users can view their own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id);

-- 允许已登录用户更新自己的数据
CREATE POLICY "Users can update their own documents" ON documents
  FOR UPDATE USING (auth.uid() = user_id);

-- 允许已登录用户删除自己的数据
CREATE POLICY "Users can delete their own documents" ON documents
  FOR DELETE USING (auth.uid() = user_id);

-- 检查 documents 表的 user_id 字段默认值
ALTER TABLE documents ALTER COLUMN user_id SET DEFAULT auth.uid();
