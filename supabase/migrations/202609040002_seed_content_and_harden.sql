drop policy if exists "Public can update own subscription" on public.newsletter_subscribers;

insert into public.pages(slug, title, eyebrow, body, seo_title, seo_description, status, sort_order, published_at) values
  ('home', 'Where the future of Food Begins.', 'Kano · Nigeria · 12–14 November 2026', '{"description":"The conference bringing Africa’s agritech ecosystem together to connect, collaborate, exchange ideas and celebrate the technologies and people transforming agriculture across the continent."}', 'AgriTech Fest 2026', 'Africa’s agritech ecosystem meets in Kano, Nigeria.', 'published', 1, now()),
  ('about', 'About AgriTech Fest', 'The big idea', '{"description":"AgriTech Fest connects farmers, founders, researchers, investors, policymakers and students around practical ideas that can move agriculture forward."}', 'About AgriTech Fest', 'Meet the people building the future of African agriculture.', 'published', 2, now()),
  ('get-involved', 'Get Involved', 'Join the ecosystem', '{"description":"There is more than one way to be part of AgriTech Fest."}', 'Get involved · AgriTech Fest', 'Join AgriTech Fest as a startup, exhibitor, sponsor, partner or media organisation.', 'published', 3, now())
on conflict (slug) do nothing;

insert into public.speakers(name, job_title, organisation, bio, category, is_keynote, status, sort_order) values
  ('Dr. Amina Bello', 'Keynote', 'Federal Ministry of Agriculture', 'Policy and delivery across food systems.', 'government', true, 'published', 1),
  ('Musa Ibrahim', 'Founder', 'FarmSense Africa', 'Building field tools for smallholders.', 'founders', true, 'published', 2),
  ('Fatima Yusuf', 'Investor', 'AgriVentures', 'Backing climate-smart agri-tech.', 'investors', true, 'published', 3),
  ('Prof. Tunde Adeyemi', 'Research Lead', 'BUK', 'Agronomy, precision systems and farmer trials.', 'researchers', false, 'published', 4),
  ('Nkechi Okafor', 'Founder', 'ColdChain Labs', 'Post-harvest logistics and market access.', 'founders', false, 'published', 5),
  ('Engr. Saleh Garba', 'Government Speaker', 'Kano State', 'Mechanisation, infrastructure and scale.', 'government', false, 'published', 6);

insert into public.exhibitors(name, category, booth, description, website_url, review_status, is_public) values
  ('AgroDrone Systems', 'technology', 'A12', 'Drone mapping, crop monitoring and spraying.', 'https://agrodrones.example', 'approved', true),
  ('FarmLink Equipment', 'equipment', 'B04', 'Smallholder machinery and fabrication.', 'https://farmlink.example', 'approved', true),
  ('SeedForward', 'inputs', 'C09', 'Improved seeds and crop inputs.', 'https://seedforward.example', 'approved', true),
  ('HarvestPay', 'finance', 'D02', 'Credit, insurance and payment tools.', 'https://harvestpay.example', 'approved', true),
  ('ColdStore Pro', 'processing', 'E11', 'Cold-chain and storage solutions.', 'https://coldstore.example', 'approved', true),
  ('SoilLab Africa', 'research', 'F07', 'Testing, diagnostics and advisory.', 'https://soillab.example', 'approved', true),
  ('GreenPulse Startup', 'startup', 'G15', 'Farm management software for youth-led farms.', 'https://greenpulse.example', 'approved', true);

insert into public.partners(name, tier, status, sort_order) values
  ('Sterling Bank', 'Headline Partner', 'published', 1),
  ('MTN', 'Official Partner', 'published', 2),
  ('e360 Africa', 'Supporting Partner', 'published', 3),
  ('Kano State', 'Supporting Partner', 'published', 4),
  ('BUK', 'Ecosystem Partner', 'published', 5),
  ('Agro Innovate', 'Ecosystem Partner', 'published', 6);
