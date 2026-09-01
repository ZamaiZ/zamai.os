alter table public.muscle_groups
  add column icon_svg text;

alter table public.muscle_groups
  add constraint muscle_groups_icon_svg_len_chk
  check (
    icon_svg is null
    or char_length(icon_svg) between 1 and 32768
  );
