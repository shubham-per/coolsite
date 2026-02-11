-- Run this SQL in your Supabase SQL Editor to add the FAQ window
-- Go to: Supabase Dashboard > SQL Editor > New Query

INSERT INTO windows (key, label, type, show_on_desktop, show_in_home, order_desktop, order_home, is_hidden, is_archived)
VALUES ('faq', 'FAQ', 'builtIn', true, true, 7, 6, false, false)
ON CONFLICT (key) DO UPDATE SET
  show_on_desktop = true,
  show_in_home = true,
  is_hidden = false,
  is_archived = false;
