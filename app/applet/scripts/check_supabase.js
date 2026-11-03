
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mgxcguiqjncopdvowoae.supabase.co';
const supabaseAnonKey = 'sb_publishable_RShzlB7g0gKLbDQIU2VlyQ_-RmhLKhY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const tables = [
  'servicos',
  'profissionais',
  'clientes',
  'produtos',
  'agendamentos',
  'caixa_status',
  'transacoes_caixa',
  'conversas',
  'mensagens',
  'configuracoes_salao',
  'perfis'
];

async function runVerification() {
  console.log("=== INICIANDO VERIFICAÇÃO DE CONSULTAS SELECT NO SUPABASE ===");
  console.log(`URL do Projeto: ${supabaseUrl}`);
  console.log(`Chave Pública: ${supabaseAnonKey.substring(0, 15)}...`);
  console.log("-------------------------------------------------------------");

  const results = {};

  for (const table of tables) {
    try {
      const { data, count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact' });

      if (error) {
        results[table] = {
          status: 'ERRO',
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        };
      } else {
        results[table] = {
          status: 'SUCESSO',
          count: count !== null ? count : (data ? data.length : 0),
          dataPreview: data && data.length > 0 ? data.slice(0, 2) : []
        };
      }
    } catch (err) {
      results[table] = {
        status: 'EXCEÇÃO',
        message: err.message || String(err)
      };
    }
  }

  console.log(JSON.stringify(results, null, 2));
  console.log("=============================================================");
}

runVerification();
