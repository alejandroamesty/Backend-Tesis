CREATE SCHEMA IF NOT EXISTS "public";


CREATE OR REPLACE FUNCTION public.update_likes_count()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- For an INSERT on post_likes, increase the likes count
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET likes = likes + 1 WHERE id = NEW.post_id;
    -- For a DELETE on post_likes, decrease the likes count
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET likes = likes - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$function$
;


CREATE OR REPLACE FUNCTION public.uuid_generate_v1()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v1$function$
;

CREATE OR REPLACE FUNCTION public.uuid_generate_v1mc()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v1mc$function$
;

CREATE OR REPLACE FUNCTION public.uuid_generate_v3(namespace uuid, name text)
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v3$function$
;

CREATE OR REPLACE FUNCTION public.uuid_generate_v4()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v4$function$
;

CREATE OR REPLACE FUNCTION public.uuid_generate_v5(namespace uuid, name text)
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v5$function$
;

CREATE OR REPLACE FUNCTION public.uuid_nil()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_nil$function$
;

CREATE OR REPLACE FUNCTION public.uuid_ns_dns()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_dns$function$
;

CREATE OR REPLACE FUNCTION public.uuid_ns_oid()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_oid$function$
;

CREATE OR REPLACE FUNCTION public.uuid_ns_url()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_url$function$
;

CREATE OR REPLACE FUNCTION public.uuid_ns_x500()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_x500$function$
;

CREATE  TABLE "public".chats ( 
	id                   uuid DEFAULT uuid_generate_v4() NOT NULL  ,
	description          text    ,
	created_at           timestamp DEFAULT CURRENT_TIMESTAMP   ,
	private_chat         boolean DEFAULT true   ,
	CONSTRAINT pk_chat PRIMARY KEY ( id )
 );

CREATE  TABLE "public".coordinates ( 
	id                   uuid DEFAULT uuid_generate_v4()  NOT NULL  ,
	x                    double precision DEFAULT 0   ,
	y                    double precision DEFAULT 0   ,
	CONSTRAINT pk_coordinates PRIMARY KEY ( id )
 );

CREATE  TABLE "public".post_categories ( 
	id                   uuid DEFAULT uuid_generate_v4() NOT NULL  ,
	name                 text  NOT NULL  ,
	CONSTRAINT pk_post_category PRIMARY KEY ( id )
 );

CREATE  TABLE "public".users ( 
	id                   uuid DEFAULT uuid_generate_v4()  NOT NULL  ,
	username             text  NOT NULL  ,
	image                text    ,
	fname                text  NOT NULL  ,
	lname                text  NOT NULL  ,
	biography            text    ,
	email                text  NOT NULL  ,
	"password"           text  NOT NULL  ,
	address              text    ,
	birth_date           timestamp(3)    ,
	deleted_at           timestamp(3)    ,
	CONSTRAINT users_pkey PRIMARY KEY ( id )
 );

CREATE UNIQUE INDEX users_username_key ON "public".users ( username );

CREATE UNIQUE INDEX users_email_key ON "public".users ( email );

CREATE  TABLE "public".chat_members ( 
	id                   uuid DEFAULT uuid_generate_v4() NOT NULL  ,
	user_id              uuid  NOT NULL  ,
	chat_id              uuid  NOT NULL  ,
	CONSTRAINT pk_chat_member PRIMARY KEY ( id ),
	CONSTRAINT unq_chat_member UNIQUE ( user_id, chat_id ) 
 );

CREATE  TABLE "public".chat_messages ( 
	id                   uuid DEFAULT uuid_generate_v4() NOT NULL  ,
	user_id              uuid  NOT NULL  ,
	chat_id              uuid NOT NULL  ,
	content_type         integer DEFAULT 1   ,
	content              text  NOT NULL  ,
	created_at           timestamp DEFAULT CURRENT_TIMESTAMP   ,
	CONSTRAINT pk_chat_message PRIMARY KEY ( id )
 );

CREATE  TABLE "public".communities ( 
	id                   uuid DEFAULT uuid_generate_v4()  NOT NULL  ,
	owner_id             uuid  NOT NULL  ,
	chat_id              uuid  NOT NULL  ,
	image                text    ,
	name                 text  NOT NULL  ,
	description          text    ,
	private_community    boolean DEFAULT false   ,
	CONSTRAINT pk_communities PRIMARY KEY ( id )
 );

CREATE  TABLE "public".events ( 
	id                   uuid DEFAULT uuid_generate_v4()  NOT NULL  ,
	community_id         uuid  NOT NULL  ,
	event_location       uuid    ,
	name                 text  NOT NULL  ,
	description          text    ,
	event_date           timestamp    ,
	cancelled			boolean DEFAULT false   ,
	CONSTRAINT pk_events PRIMARY KEY ( id )
 );

CREATE  TABLE "public".posts ( 
	id                   uuid DEFAULT uuid_generate_v4() NOT NULL  ,
	user_id              uuid  NOT NULL  ,
	coordinates_id       uuid    ,
	category_id          uuid  NOT NULL  ,
	caption              text    ,
	post_date            timestamp DEFAULT CURRENT_TIMESTAMP   ,
	likes                integer DEFAULT 0   ,
	content              text    ,
	CONSTRAINT pk_post PRIMARY KEY ( id )
 );

CREATE  TABLE "public".saved_posts ( 
	user_id              uuid  NOT NULL  ,
	post_id              uuid  NOT NULL  ,
	CONSTRAINT pk_saved_posts PRIMARY KEY ( user_id, post_id )
 );

CREATE  TABLE "public".user_followers ( 
	user_id              uuid  NOT NULL  ,
	user_follower        uuid  NOT NULL  ,
	CONSTRAINT pk_user_follower PRIMARY KEY ( user_id, user_follower )
 );

CREATE  TABLE "public".post_images ( 
	id                   uuid DEFAULT uuid_generate_v4()  NOT NULL  ,
	post_id              uuid  NOT NULL  ,
	image                text  NOT NULL  ,
	CONSTRAINT pk_post_images PRIMARY KEY ( id )
 );

CREATE  TABLE "public".post_likes ( 
	post_id              uuid  NOT NULL  ,
	user_id              uuid  NOT NULL  ,
	CONSTRAINT pk_post_likes PRIMARY KEY ( post_id, user_id )
 );

CREATE  TABLE "public".post_replies ( 
	id                   uuid DEFAULT uuid_generate_v4()  NOT NULL  ,
	post_id              uuid  NOT NULL  ,
	user_id              uuid  NOT NULL  ,
	parent_reply_id      uuid    ,
	content              text  NOT NULL  ,
	created_at           timestamp DEFAULT CURRENT_TIMESTAMP   ,
	CONSTRAINT pk_post_replies PRIMARY KEY ( id )
 );

CREATE  TABLE "public".post_videos ( 
	id                   uuid DEFAULT uuid_generate_v4()  NOT NULL  ,
	post_id              uuid  NOT NULL  ,
	video                text  NOT NULL  ,
	CONSTRAINT pk_post_videos PRIMARY KEY ( id )
 );

ALTER TABLE "public".chat_members ADD CONSTRAINT fk_chat_member_users FOREIGN KEY ( user_id ) REFERENCES "public".users( id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public".chat_members ADD CONSTRAINT fk_chat_member_chat FOREIGN KEY ( chat_id ) REFERENCES "public".chats( id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public".chat_messages ADD CONSTRAINT fk_chat_message_chat FOREIGN KEY ( chat_id ) REFERENCES "public".chats( id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public".chat_messages ADD CONSTRAINT fk_chat_message_users FOREIGN KEY ( user_id ) REFERENCES "public".users( id );

ALTER TABLE "public".communities ADD CONSTRAINT fk_communities_users FOREIGN KEY ( owner_id ) REFERENCES "public".users( id ) ON DELETE SET NULL ON UPDATE SET NULL;

ALTER TABLE "public".communities ADD CONSTRAINT fk_communities_chats FOREIGN KEY ( chat_id ) REFERENCES "public".chats( id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public".events ADD CONSTRAINT fk_events_communities FOREIGN KEY ( community_id ) REFERENCES "public".communities( id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public".events ADD CONSTRAINT fk_events_coordinates FOREIGN KEY ( event_location ) REFERENCES "public".coordinates( id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public".post_images ADD CONSTRAINT fk_post_images_posts FOREIGN KEY ( post_id ) REFERENCES "public".posts( id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public".post_likes ADD CONSTRAINT fk_post_likes_users FOREIGN KEY ( user_id ) REFERENCES "public".users( id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public".post_likes ADD CONSTRAINT fk_post_likes_post FOREIGN KEY ( post_id ) REFERENCES "public".posts( id );

ALTER TABLE "public".post_replies ADD CONSTRAINT fk_post_replies_users FOREIGN KEY ( user_id ) REFERENCES "public".users( id );

ALTER TABLE "public".post_replies ADD CONSTRAINT fk_post_replies_posts FOREIGN KEY ( post_id ) REFERENCES "public".posts( id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public".post_replies ADD CONSTRAINT fk_post_replies_post_replies FOREIGN KEY ( parent_reply_id ) REFERENCES "public".post_replies( id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public".post_videos ADD CONSTRAINT fk_post_videos_post_likes FOREIGN KEY ( post_id ) REFERENCES "public".posts( id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public".posts ADD CONSTRAINT fk_post_users FOREIGN KEY ( user_id ) REFERENCES "public".users( id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public".posts ADD CONSTRAINT fk_posts_post_category FOREIGN KEY ( category_id ) REFERENCES "public".post_categories( id ) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public".posts ADD CONSTRAINT fk_posts_coordinates FOREIGN KEY ( coordinates_id ) REFERENCES "public".coordinates( id ) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public".saved_posts ADD CONSTRAINT fk_saved_posts_posts FOREIGN KEY ( post_id ) REFERENCES "public".posts( id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public".saved_posts ADD CONSTRAINT fk_saved_posts_users FOREIGN KEY ( user_id ) REFERENCES "public".users( id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public".user_followers ADD CONSTRAINT fk_user_follower_users_muser FOREIGN KEY ( user_id ) REFERENCES "public".users( id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public".user_followers ADD CONSTRAINT fk_user_follower_users_fuser FOREIGN KEY ( user_follower ) REFERENCES "public".users( id ) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TRIGGER adjust_likes_count AFTER INSERT OR DELETE ON public.post_likes FOR EACH ROW EXECUTE FUNCTION update_likes_count();
