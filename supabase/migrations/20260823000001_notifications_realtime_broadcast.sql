-- Supabase Realtime: Broadcast from Database for notifications.
-- Mirrors the working Dashboard setup (function + trigger + messages RLS).
-- Requires Supabase Realtime (realtime.broadcast_changes / realtime.messages).
-- Does not apply on vanilla Postgres without the Realtime extension.

create or replace function public.broadcast_notification_changes()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
as $$
begin
  perform realtime.broadcast_changes(
    'notifications:' || coalesce(new.user_id, old.user_id)::text,
    tg_op,
    tg_op,
    tg_table_name,
    tg_table_schema,
    new,
    old
  );
  return null;
end;
$$;

drop trigger if exists notifications_broadcast_trigger on public.notifications;

create trigger notifications_broadcast_trigger
  after insert or update or delete on public.notifications
  for each row
  execute function public.broadcast_notification_changes();

revoke all on function public.broadcast_notification_changes()
  from public, anon, authenticated;

drop policy if exists "Allow listening for broadcasts for authenticated users only"
  on realtime.messages;

drop policy if exists "notifications_select_own_topic"
  on realtime.messages;

create policy "Allow listening for broadcasts for authenticated users only"
  on realtime.messages
  for select
  to authenticated
  using (
    realtime.messages.extension = 'broadcast'
  );

-- =============================================================================
-- Passo a passo: criar pelo painel do Supabase (Dashboard)
-- =============================================================================
--
-- Pré-requisito: tabela public.notifications já existir (migration anterior).
--
-- 1) Function (Database → Functions → Create a new function)
--    - Schema: public
--    - Name: broadcast_notification_changes
--    - Return type: trigger (não void)
--    - Arguments: nenhum
--    - Definition (corpo plpgsql):
--
--        begin
--          perform realtime.broadcast_changes(
--            'notifications:' || coalesce(new.user_id, old.user_id)::text,
--            tg_op,
--            tg_op,
--            tg_table_name,
--            tg_table_schema,
--            new,
--            old
--          );
--          return null;
--        end;
--
--    - Advanced settings:
--        Language: plpgsql
--        Behavior: volatile
--        Type of Security: SECURITY DEFINER
--
-- 2) Trigger (Database → Triggers → New trigger)
--    - Name: notifications_broadcast_trigger
--    - Table: public.notifications
--    - Events: Insert, Update, Delete
--    - Trigger type: After the event
--    - Orientation: Row
--    - Function: public.broadcast_notification_changes
--
-- 3) Policy (Realtime → Policies → Create policy)
--    - Template: "Allow listening for broadcasts for authenticated users only"
--    - Policy Name: Allow listening for broadcasts for authenticated users only
--    - Table: messages.realtime
--    - Command: SELECT
--    - Target Roles: authenticated
--    - using (gerado pelo template):
--        realtime.messages.extension = 'broadcast'
--
-- 4) Cliente (já no app): canal privado notifications:<userId>, setAuth(),
--    listeners broadcast INSERT/UPDATE. Inspector (opcional): role authenticated,
--    channel notifications:<uuid>, private = on.
--
-- Nota: não use Database Triggers genéricos da UI para "ativar realtime" sem
-- a function acima. Postgres puro (sem Supabase Realtime) não suporta
-- realtime.broadcast_changes / realtime.messages.
