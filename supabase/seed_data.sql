
-- Seed Data Script for Nexus CRM
-- Run this in the Supabase SQL Editor to populate your database with sample data.

DO $$
DECLARE
    -- IDs for Team Members
    tm_sarah_id UUID;
    tm_mike_id UUID;
    tm_emily_id UUID;
    tm_david_id UUID;
    
    -- IDs for Leads
    lead_tech_corp_id UUID;
    lead_start_inc_id UUID;
    lead_global_sys_id UUID;
    lead_design_studio_id UUID;
    
    -- IDs for Lead Sheets
    sheet_high_prio_id UUID;
    
    -- IDs for Projects
    proj_redesign_id UUID;
    proj_mobile_app_id UUID;
    
    -- IDs for Tasks
    task_1_id UUID;

BEGIN
    -- 1. Create Lead Sheets
    -- 'All Leads' should already exist from migration, let's add another one
    INSERT INTO public.lead_sheets (name, description, color)
    VALUES ('High Priority', 'Leads that need immediate attention', '#ff4d4d')
    RETURNING id INTO sheet_high_prio_id;

    -- 2. Create Team Members (Employees)
    INSERT INTO public.team_members (name, email, role, avatar_url, utilization)
    VALUES 
    ('Sarah Connor', 'sarah.c@nexus.com', 'Project Manager', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', 75)
    RETURNING id INTO tm_sarah_id;

    INSERT INTO public.team_members (name, email, role, avatar_url, utilization)
    VALUES 
    ('Mike Ross', 'mike.r@nexus.com', 'Developer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', 90)
    RETURNING id INTO tm_mike_id;
    
    INSERT INTO public.team_members (name, email, role, avatar_url, utilization)
    VALUES 
    ('Emily Blunt', 'emily.b@nexus.com', 'Designer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', 45)
    RETURNING id INTO tm_emily_id;

    INSERT INTO public.team_members (name, email, role, avatar_url, utilization)
    VALUES 
    ('David Kim', 'david.k@nexus.com', 'Sales Rep', 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', 60)
    RETURNING id INTO tm_david_id;

    -- 3. Create Leads
    INSERT INTO public.leads (name, email, phone, city, source, status, assigned_to, notes, sheet_id)
    VALUES 
    ('Tech Corp', 'contact@techcorp.com', '+1-555-0101', 'San Francisco', 'Referral', 'qualified', tm_david_id, 'Interested in full ERP overhaul.', sheet_high_prio_id)
    RETURNING id INTO lead_tech_corp_id;

    INSERT INTO public.leads (name, email, phone, city, source, status, assigned_to, notes, sheet_id)
    VALUES 
    ('Startup Inc', 'hello@startup.io', '+1-555-0102', 'Austin', 'Website', 'new', tm_sarah_id, 'Need a landing page ASAP.', NULL)
    RETURNING id INTO lead_start_inc_id;

    INSERT INTO public.leads (name, email, phone, city, source, status, assigned_to, notes, sheet_id)
    VALUES 
    ('Global Systems', 'info@globalsys.net', '+1-555-0103', 'New York', 'LinkedIn', 'contacted', tm_david_id, 'Follow up next week.', sheet_high_prio_id)
    RETURNING id INTO lead_global_sys_id;
    
    INSERT INTO public.leads (name, email, phone, city, source, status, assigned_to, notes, sheet_id)
    VALUES 
    ('Creative Design Studio', 'art@studio.design', '+1-555-0104', 'London', 'Referral', 'converted', tm_sarah_id, 'Converted to project.', NULL)
    RETURNING id INTO lead_design_studio_id;

    -- 4. Create Projects
    INSERT INTO public.projects (name, description, client_id, status, budget, start_date, end_date, progress)
    VALUES 
    ('Website Redesign', 'Complete overhaul of corporate website', lead_design_studio_id, 'active', 15000.00, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days', 45)
    RETURNING id INTO proj_redesign_id;

    INSERT INTO public.projects (name, description, client_id, status, budget, start_date, end_date, progress)
    VALUES 
    ('Mobile App MVP', 'MVP for new delivery service', lead_tech_corp_id, 'on_hold', 25000.00, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '60 days', 20)
    RETURNING id INTO proj_mobile_app_id;

    -- 5. Assign Team to Projects
    INSERT INTO public.project_team (project_id, team_member_id) VALUES (proj_redesign_id, tm_sarah_id);
    INSERT INTO public.project_team (project_id, team_member_id) VALUES (proj_redesign_id, tm_emily_id); -- Designer
    INSERT INTO public.project_team (project_id, team_member_id) VALUES (proj_redesign_id, tm_mike_id);  -- Dev
    
    INSERT INTO public.project_team (project_id, team_member_id) VALUES (proj_mobile_app_id, tm_sarah_id);
    INSERT INTO public.project_team (project_id, team_member_id) VALUES (proj_mobile_app_id, tm_mike_id);

    -- 6. Create Tasks
    INSERT INTO public.tasks (title, description, status, priority, due_date, assignee_id, project_id, position)
    VALUES 
    ('Design Homepage', 'Create Figma mockups for homepage', 'done', 'high', CURRENT_DATE - INTERVAL '2 days', tm_emily_id, proj_redesign_id, 0);

    INSERT INTO public.tasks (title, description, status, priority, due_date, assignee_id, project_id, position)
    VALUES 
    ('Setup React Repo', 'Initialize Vite project and install deps', 'done', 'medium', CURRENT_DATE - INTERVAL '5 days', tm_mike_id, proj_redesign_id, 1);

    INSERT INTO public.tasks (title, description, status, priority, due_date, assignee_id, project_id, position)
    VALUES 
    ('Implement Navbar', 'Responsive navigation bar component', 'in_progress', 'medium', CURRENT_DATE + INTERVAL '2 days', tm_mike_id, proj_redesign_id, 2);

    INSERT INTO public.tasks (title, description, status, priority, due_date, assignee_id, project_id, position)
    VALUES 
    ('Client Review Meeting', 'Review initial designs', 'todo', 'high', CURRENT_DATE + INTERVAL '5 days', tm_sarah_id, proj_redesign_id, 3);

    -- 7. Create Messages (Project Chat)
    INSERT INTO public.messages (project_id, sender_id, content) VALUES (proj_redesign_id, tm_sarah_id, 'Hey team, welcome to the redesign project!');
    INSERT INTO public.messages (project_id, sender_id, content) VALUES (proj_redesign_id, tm_mike_id, 'Thanks Sarah! Repo is set up.');
    INSERT INTO public.messages (project_id, sender_id, content) VALUES (proj_redesign_id, tm_emily_id, 'I will have the designs ready by tomorrow.');

    -- 8. Calendar Events
    INSERT INTO public.calendar_events (title, description, event_date, start_time, end_time, project_id, color)
    VALUES 
    ('Sprint Planning', 'Weekly sprint planning', CURRENT_DATE + INTERVAL '1 day', '10:00:00', '11:00:00', proj_redesign_id, '#79bf21');

    INSERT INTO public.calendar_events (title, description, event_date, start_time, end_time, color)
    VALUES 
    ('Team Lunch', 'Monthly team bonding', CURRENT_DATE + INTERVAL '3 days', '12:30:00', '13:30:00', '#ff9f1c');

    -- 9. Zoom Meeting Days & Attendance
    -- Add a meeting for today
    WITH new_meeting AS (
      INSERT INTO public.zoom_meeting_days (meeting_date, notes)
      VALUES (CURRENT_DATE, 'Daily Standup')
      RETURNING id, meeting_date
    )
    INSERT INTO public.zoom_meeting_attendance (meeting_date, employee_id, status)
    SELECT 
      (SELECT meeting_date FROM new_meeting), 
      tm.id, 
      CASE 
        WHEN tm.id = tm_sarah_id THEN 'present'::public.attendance_status
        WHEN tm.id = tm_mike_id THEN 'present'::public.attendance_status
        ELSE 'absent'::public.attendance_status
      END
    FROM public.team_members tm
    WHERE tm.id IN (tm_sarah_id, tm_mike_id, tm_emily_id, tm_david_id);

END $$;
