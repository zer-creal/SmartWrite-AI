import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });
import { supabase } from './supabase.js';

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
