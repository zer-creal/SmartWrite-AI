// 直接设置环境变量
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://ffimtwavaymppcdndvon.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'sb_publishable_uAT5aVlxoHdCmdJQm-a8Aw_pWc5MC1r';

// 导入 supabase 模块
const { supabase } = require('./src/lib/supabase.js');

// 测试创建文档
const testCreateDocument = async () => {
  try {
    console.log('Testing document creation...');
    const { data, error } = await supabase
      .from('documents')
      .insert({
        title: '测试文档',
        content: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('Create document failed:', error);
    } else {
      console.log('Create document successful:', data);
    }
  } catch (error) {
    console.error('Create document error:', error);
  }
};

testCreateDocument();