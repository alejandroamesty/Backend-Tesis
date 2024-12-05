-- Insert predefined Admin user

DO $$
BEGIN
  	IF NOT EXISTS (SELECT * FROM users WHERE email = 'admin@localhost') THEN
	INSERT INTO users (username, fname, lname, email, password) VALUES ('admin', 'Admin', 'Admin', 'admin@localhost.com', 'b7458c58185ae609c2e5c058252b4225b7458c58185ae609c2e5c058252b4225b7458c58185ae609c2e5c058252b4225b7458c58185ae609c2e5c058252b4225:12dd43e56a47140b74a99bb35be4a1a711eefe2627d236c97a4a3d7f6a93a2fe');
	END IF;
END $$;

-- Insert post_categories
--categories: Post, Report
DO $$
BEGIN
	IF NOT EXISTS (SELECT * FROM post_categories WHERE name = 'Post') THEN
	INSERT INTO post_categories (name) VALUES ('Post');
	END IF;
	IF NOT EXISTS (SELECT * FROM post_categories WHERE name = 'Report') THEN
	INSERT INTO post_categories (name) VALUES ('Report');
	END IF;
END $$;
