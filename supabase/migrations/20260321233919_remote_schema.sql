
  create table "public"."businesses" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "name" text not null,
    "type" text not null,
    "completed_tasks" text[] default '{}'::text[],
    "view_preference" text default 'checklist'::text,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."businesses" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "email" text not null,
    "plan" text default 'free'::text
      );


alter table "public"."profiles" enable row level security;

CREATE UNIQUE INDEX businesses_pkey ON public.businesses USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

alter table "public"."businesses" add constraint "businesses_pkey" PRIMARY KEY using index "businesses_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."businesses" add constraint "businesses_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."businesses" validate constraint "businesses_user_id_fkey";

alter table "public"."businesses" add constraint "businesses_view_preference_check" CHECK ((view_preference = ANY (ARRAY['checklist'::text, 'wizard'::text]))) not valid;

alter table "public"."businesses" validate constraint "businesses_view_preference_check";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_plan_check" CHECK ((plan = ANY (ARRAY['free'::text, 'pro'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_plan_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, plan)
  VALUES (new.id, new.email, 'free');
  RETURN new;
END;
$function$
;

grant delete on table "public"."businesses" to "anon";

grant insert on table "public"."businesses" to "anon";

grant references on table "public"."businesses" to "anon";

grant select on table "public"."businesses" to "anon";

grant trigger on table "public"."businesses" to "anon";

grant truncate on table "public"."businesses" to "anon";

grant update on table "public"."businesses" to "anon";

grant delete on table "public"."businesses" to "authenticated";

grant insert on table "public"."businesses" to "authenticated";

grant references on table "public"."businesses" to "authenticated";

grant select on table "public"."businesses" to "authenticated";

grant trigger on table "public"."businesses" to "authenticated";

grant truncate on table "public"."businesses" to "authenticated";

grant update on table "public"."businesses" to "authenticated";

grant delete on table "public"."businesses" to "service_role";

grant insert on table "public"."businesses" to "service_role";

grant references on table "public"."businesses" to "service_role";

grant select on table "public"."businesses" to "service_role";

grant trigger on table "public"."businesses" to "service_role";

grant truncate on table "public"."businesses" to "service_role";

grant update on table "public"."businesses" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";


  create policy "Admin can view all businesses"
  on "public"."businesses"
  as permissive
  for select
  to public
using (((auth.jwt() ->> 'email'::text) = 'jotoltduk@gmail.com'::text));



  create policy "Users can manage own businesses"
  on "public"."businesses"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Admin can update all profiles"
  on "public"."profiles"
  as permissive
  for update
  to public
using (((auth.jwt() ->> 'email'::text) = 'jotoltduk@gmail.com'::text));



  create policy "Admin can view all profiles"
  on "public"."profiles"
  as permissive
  for select
  to public
using (((auth.jwt() ->> 'email'::text) = 'jotoltduk@gmail.com'::text));



  create policy "Users can view own profile"
  on "public"."profiles"
  as permissive
  for select
  to public
using ((auth.uid() = id));



