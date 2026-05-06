// supabase/functions/smart-reminders/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { analyzeAdherence } from './adherence-analyzer.ts';
import { sendFcmPush } from './fcm-client.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')!;
const fcmServiceAccountJson = Deno.env.get('FCM_SERVICE_ACCOUNT_JSON')!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

Deno.serve(async (_req) => {
  try {
    await processAllUsers();
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error('smart-reminders error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
});

async function processAllUsers() {
  // Obtener usuarios distintos con treatments activos
  const { data: users, error } = await supabase
    .from('treatments')
    .select('user_id')
    .eq('active', true);

  if (error) throw error;
  if (!users || users.length === 0) return;

  const uniqueUserIds = [...new Set(users.map((u) => u.user_id))];

  for (const userId of uniqueUserIds) {
    try {
      await processUser(userId);
    } catch (err) {
      // Un usuario que falla no detiene al resto
      console.error(`Error procesando usuario ${userId}:`, err);
    }
  }
}

async function processUser(userId: string) {
  const today = new Date().toISOString().split('T')[0];

  // 1. Verificar límites diarios
  const { data: sentToday } = await supabase
    .from('notification_log')
    .select('type')
    .eq('user_id', userId)
    .gte('sent_at', `${today}T00:00:00Z`);

  const sentTypes = (sentToday ?? []).map((r) => r.type);
  const medicationSent = sentTypes.includes('medication');
  const insightSent = sentTypes.includes('insight');
  const redFlagSent = sentTypes.includes('red_flag');

  // Si ya se enviaron medication e insight/red_flag hoy → skip sin llamar a Claude
  if (medicationSent && (insightSent || redFlagSent)) return;

  // 2. Leer treatments activos
  const { data: treatments } = await supabase
    .from('treatments')
    .select('id, name, frequency')
    .eq('user_id', userId)
    .eq('active', true);

  if (!treatments || treatments.length === 0) return;

  // 3. Leer adherencia últimos 14 días
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const { data: adherenceLogs } = await supabase
    .from('adherence_logs')
    .select('date, medications_taken')
    .eq('user_id', userId)
    .gte('date', fourteenDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false });

  // 4. Llamar a Claude
  const analysis = await analyzeAdherence(
    treatments,
    adherenceLogs ?? [],
    sentTypes,
    anthropicApiKey,
  );

  if (!analysis.send) return;

  // 5. Verificar que el tipo analizado no fue enviado ya hoy
  if (analysis.type === 'medication' && medicationSent) return;
  if ((analysis.type === 'insight' || analysis.type === 'red_flag') && (insightSent || redFlagSent)) return;

  // 6. Leer device tokens del usuario
  const { data: tokens } = await supabase
    .from('device_tokens')
    .select('token')
    .eq('user_id', userId);

  if (!tokens || tokens.length === 0) return;

  // 7. Enviar push a cada token
  for (const { token } of tokens) {
    const result = await sendFcmPush(
      token,
      {
        title: 'Aliis',
        body: analysis.message,
        data: {
          type: analysis.type,
          deep_link: analysis.deep_link,
        },
      },
      fcmServiceAccountJson,
    );

    // Eliminar token inválido
    if (result.invalidToken) {
      await supabase.from('device_tokens').delete().eq('token', token);
    }
  }

  // 8. Registrar en notification_log
  await supabase.from('notification_log').insert({
    user_id: userId,
    type: analysis.type,
    message: analysis.message,
  });
}
