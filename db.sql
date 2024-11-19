CREATE SCHEMA IF NOT EXISTS "public";

CREATE SEQUENCE "public".chat_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE "public".chat_member_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE "public".chat_message_chat_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE "public".chat_message_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE "public".chat_message_message_content_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE "public".coordinates_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE "public".message_content_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE "public".post_category_id_seq AS integer START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE "public".post_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE "public".post_images_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE "public".post_replies_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE "public".post_videos_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE "public".private_chat_chat_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE "public".private_chat_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE "public".saved_posts_post_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE "public".saved_posts_user_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE "public".users_id_seq AS integer START WITH 1 INCREMENT BY 1;

CREATE  TABLE "public".chat ( 
	id                   bigserial  NOT NULL  ,
	description          text    ,
	created_at           timestamp DEFAULT CURRENT_TIMESTAMP   ,
	CONSTRAINT pk_chat PRIMARY KEY ( id )
 );

CREATE  TABLE "public".coordinates ( 
	id                   bigserial  NOT NULL  ,
	x                    double precision DEFAULT 0   ,
	y                    double precision DEFAULT 0   ,
	CONSTRAINT pk_coordinates PRIMARY KEY ( id )
 );

CREATE  TABLE "public".message_content ( 
	id                   bigserial  NOT NULL  ,
	content_type         text  NOT NULL  ,
	content              text  NOT NULL  ,
	CONSTRAINT pk_message_content PRIMARY KEY ( id )
 );

CREATE  TABLE "public".post_categories ( 
	id                   integer DEFAULT nextval('post_category_id_seq'::regclass) NOT NULL  ,
	name                 text  NOT NULL  ,
	CONSTRAINT pk_post_category PRIMARY KEY ( id )
 );

CREATE  TABLE "public".private_chat ( 
	id                   bigserial  NOT NULL  ,
	chat_id              bigserial  NOT NULL  ,
	CONSTRAINT pk_private_chat PRIMARY KEY ( id )
 );

CREATE  TABLE "public".users ( 
	id                   serial  NOT NULL  ,
	username             text  NOT NULL  ,
	image                text    ,
	fname                text  NOT NULL  ,
	lname                text  NOT NULL  ,
	biography            text    ,
	email                text  NOT NULL  ,
	"password"           text  NOT NULL  ,
	address              text    ,
	birth_date           timestamp(3)    ,
	CONSTRAINT users_pkey PRIMARY KEY ( id )
 );

CREATE UNIQUE INDEX users_username_key ON "public".users ( username );

CREATE UNIQUE INDEX users_email_key ON "public".users ( email );

CREATE  TABLE "public".chat_member ( 
	id                   bigserial  NOT NULL  ,
	user_id              bigint  NOT NULL  ,
	chat_id              bigint  NOT NULL  ,
	CONSTRAINT pk_chat_member PRIMARY KEY ( id )
 );

CREATE  TABLE "public".chat_message ( 
	id                   bigserial  NOT NULL  ,
	user_id              bigint  NOT NULL  ,
	chat_id              bigserial  NOT NULL  ,
	message_content_id   bigserial  NOT NULL  ,
	CONSTRAINT pk_chat_message PRIMARY KEY ( id )
 );

CREATE  TABLE "public".posts ( 
	id                   bigint DEFAULT nextval('post_id_seq'::regclass) NOT NULL  ,
	user_id              integer  NOT NULL  ,
	coordinates_id       bigint    ,
	category_id          integer  NOT NULL  ,
	caption              text    ,
	post_date            timestamp DEFAULT CURRENT_TIMESTAMP   ,
	likes                integer DEFAULT 0   ,
	content              text    ,
	CONSTRAINT pk_post PRIMARY KEY ( id )
 );

CREATE  TABLE "public".saved_posts ( 
	user_id              bigserial  NOT NULL  ,
	post_id              bigserial  NOT NULL  ,
	CONSTRAINT pk_saved_posts PRIMARY KEY ( user_id, post_id )
 );

CREATE  TABLE "public".user_followers ( 
	user_id              bigint  NOT NULL  ,
	user_follower        bigint  NOT NULL  ,
	CONSTRAINT pk_user_follower PRIMARY KEY ( user_id, user_follower )
 );

CREATE  TABLE "public".post_images ( 
	post_id              integer  NOT NULL  ,
	image                text  NOT NULL  ,
	id                   bigserial  NOT NULL  ,
	CONSTRAINT pk_post_images PRIMARY KEY ( id )
 );

CREATE  TABLE "public".post_likes ( 
	post_id              integer  NOT NULL  ,
	user_id              integer  NOT NULL  ,
	CONSTRAINT pk_post_likes PRIMARY KEY ( post_id, user_id )
 );

CREATE  TABLE "public".post_replies ( 
	id                   bigserial  NOT NULL  ,
	post_id              integer  NOT NULL  ,
	user_id              integer  NOT NULL  ,
	parent_reply_id      integer    ,
	content              text  NOT NULL  ,
	created_at           timestamp DEFAULT CURRENT_TIMESTAMP   ,
	CONSTRAINT pk_post_replies PRIMARY KEY ( id )
 );

CREATE  TABLE "public".post_videos ( 
	post_id              integer  NOT NULL  ,
	video                text  NOT NULL  ,
	id                   bigserial  NOT NULL  ,
	CONSTRAINT pk_post_videos PRIMARY KEY ( id )
 );

ALTER TABLE "public".chat_member ADD CONSTRAINT fk_chat_member_users FOREIGN KEY ( user_id ) REFERENCES "public".users( id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public".chat_member ADD CONSTRAINT fk_chat_member_chat FOREIGN KEY ( chat_id ) REFERENCES "public".chat( id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public".chat_message ADD CONSTRAINT fk_chat_message_chat FOREIGN KEY ( chat_id ) REFERENCES "public".chat( id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public".chat_message ADD CONSTRAINT fk_chat_message_users FOREIGN KEY ( user_id ) REFERENCES "public".users( id );

ALTER TABLE "public".chat_message ADD CONSTRAINT fk_chat_message FOREIGN KEY ( message_content_id ) REFERENCES "public".message_content( id ) ON DELETE CASCADE ON UPDATE CASCADE;

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

ALTER TABLE "public".private_chat ADD CONSTRAINT fk_private_chat_chat FOREIGN KEY ( chat_id ) REFERENCES "public".chat( id );

ALTER TABLE "public".saved_posts ADD CONSTRAINT fk_saved_posts_posts FOREIGN KEY ( post_id ) REFERENCES "public".posts( id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public".saved_posts ADD CONSTRAINT fk_saved_posts_users FOREIGN KEY ( user_id ) REFERENCES "public".users( id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public".user_followers ADD CONSTRAINT fk_user_follower_users_muser FOREIGN KEY ( user_id ) REFERENCES "public".users( id ) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public".user_followers ADD CONSTRAINT fk_user_follower_users_fuser FOREIGN KEY ( user_follower ) REFERENCES "public".users( id ) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TRIGGER adjust_likes_count AFTER INSERT OR DELETE ON public.post_likes FOR EACH ROW EXECUTE FUNCTION update_likes_count();

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
