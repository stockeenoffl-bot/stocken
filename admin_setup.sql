-- Run this script in the Supabase SQL Editor to make an account an Admin.
-- Replace 'YOUR_EMAIL@DOMAIN.COM' with the email address you signed up with on your TradeHub app.

UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'Stockenofficial@gmail.com';

-- After running this, simply log out and log back in on your platform, and you will see the full Admin Sidebar and Edit options.
