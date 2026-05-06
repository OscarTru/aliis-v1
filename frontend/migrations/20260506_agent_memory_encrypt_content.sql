-- frontend/migrations/20260506_agent_memory_encrypt_content.sql
-- Migra agent_memory.content de jsonb a text para almacenar ciphertext AES-256-GCM.
-- Las filas existentes se truncan a '{}' encriptado (se regeneran en el siguiente ciclo).

-- 1. Cambiar tipo de columna
alter table agent_memory
  alter column content type text using content::text;

-- 2. Eliminar el default jsonb (ya no aplica)
alter table agent_memory
  alter column content drop default;

-- 3. Limpiar filas existentes — el ciphertext se generará desde la app.
--    Dejamos un marcador literal para que decrypt() lo detecte y retorne {}.
update agent_memory set content = 'legacy';

-- 4. NOT NULL sigue aplicando
alter table agent_memory
  alter column content set not null;
