USE testCV;
GO

-- 1. Clean up existing data from all tables in correct dependency order
-- Using EXEC('') inside dynamic check ensures the script parses and runs successfully 
-- even if some tables do not exist in your current database schema.
IF OBJECT_ID('dbo.SavedJobs', 'U') IS NOT NULL EXEC('DELETE FROM dbo.SavedJobs');
IF OBJECT_ID('dbo.FollowCompanies', 'U') IS NOT NULL EXEC('DELETE FROM dbo.FollowCompanies');
IF OBJECT_ID('dbo.Messages', 'U') IS NOT NULL EXEC('DELETE FROM dbo.Messages');
IF OBJECT_ID('dbo.ContactMessages', 'U') IS NOT NULL EXEC('DELETE FROM dbo.ContactMessages');
IF OBJECT_ID('dbo.ApplicationJobs', 'U') IS NOT NULL EXEC('DELETE FROM dbo.ApplicationJobs');
IF OBJECT_ID('dbo.Notifications', 'U') IS NOT NULL EXEC('DELETE FROM dbo.Notifications');
IF OBJECT_ID('dbo.Skills', 'U') IS NOT NULL EXEC('DELETE FROM dbo.Skills');
IF OBJECT_ID('dbo.Educations', 'U') IS NOT NULL EXEC('DELETE FROM dbo.Educations');
IF OBJECT_ID('dbo.Experiences', 'U') IS NOT NULL EXEC('DELETE FROM dbo.Experiences');
IF OBJECT_ID('dbo.Resumes', 'U') IS NOT NULL EXEC('DELETE FROM dbo.Resumes');
IF OBJECT_ID('dbo.Jobs', 'U') IS NOT NULL EXEC('DELETE FROM dbo.Jobs');
IF OBJECT_ID('dbo.Roles', 'U') IS NOT NULL EXEC('DELETE FROM dbo.Roles');
IF OBJECT_ID('dbo.Departments', 'U') IS NOT NULL EXEC('DELETE FROM dbo.Departments');
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL EXEC('DELETE FROM dbo.Users');
GO

-- 2. Users (20 rows)
SET IDENTITY_INSERT Users ON;
INSERT INTO Users (Id, Name, Email, Pass, Location, Phone, Status, Industry, Description, LinkedIn, Github, CreatedAt) VALUES
(1, 'Ahmad Al-Hassan', 'ahmad@example.com', 'password123', 'Amman, Jordan', '+962791234567', 'Active', 'Software', 'Senior software engineer.', 'linkedin.com/in/ahmad', 'github.com/ahmad', SYSDATETIMEOFFSET()),
(2, 'Sara Malik', 'sara@example.com', 'password123', 'Irbid, Jordan', '+962782345678', 'Active', 'Design', 'Creative UI/UX designer.', 'linkedin.com/in/sara', 'github.com/sara', SYSDATETIMEOFFSET()),
(3, 'Tech Corp', 'hr@techcorp.com', 'password123', 'Amman, Jordan', '+962773333333', 'Active', 'Technology', 'Leading tech company in Amman.', '', '', SYSDATETIMEOFFSET()),
(4, 'Omar Khalid', 'omar@example.com', 'password123', 'Zarqa, Jordan', '+962793456789', 'Active', 'Marketing', 'Digital marketing specialist.', 'linkedin.com/in/omar', '', SYSDATETIMEOFFSET()),
(5, 'Laila Majnun', 'laila@example.com', 'password123', 'Amman, Jordan', '+962791112223', 'Active', 'Education', 'Passionate teacher.', '', '', SYSDATETIMEOFFSET()),
(6, 'Jordanian Solutions', 'info@jordansolutions.com', 'password123', 'Aqaba, Jordan', '+962781234567', 'Active', 'Finance', 'Finance solutions in Aqaba.', '', '', SYSDATETIMEOFFSET()),
(7, 'Yousef Ali', 'yousef@example.com', 'password123', 'Salt, Jordan', '+962771234567', 'Active', 'Healthcare', 'Experienced nurse.', '', '', SYSDATETIMEOFFSET()),
(8, 'Health Jordan', 'careers@healthjordan.com', 'password123', 'Amman, Jordan', '+962794444444', 'Active', 'Healthcare', 'Top healthcare provider.', '', '', SYSDATETIMEOFFSET()),
(9, 'Nour Hassan', 'nour@example.com', 'password123', 'Madaba, Jordan', '+962785555555', 'Active', 'Engineering', 'Civil engineer.', '', '', SYSDATETIMEOFFSET()),
(10, 'Constructo Jordan', 'hr@constructo.com', 'password123', 'Zarqa, Jordan', '+962775555555', 'Active', 'Construction', 'Building the future of Jordan.', '', '', SYSDATETIMEOFFSET()),
(11, 'Zaid Tariq', 'zaid@example.com', 'password123', 'Mafraq, Jordan', '+962796666666', 'Active', 'Retail', 'Retail manager.', '', '', SYSDATETIMEOFFSET()),
(12, 'Retail Jordan', 'jobs@retailjordan.com', 'password123', 'Amman, Jordan', '+962787777777', 'Active', 'Retail', 'Biggest retail chain in Jordan.', '', '', SYSDATETIMEOFFSET()),
(13, 'Fatima Saeed', 'fatima@example.com', 'password123', 'Jerash, Jordan', '+962778888888', 'Active', 'Hospitality', 'Hotel manager.', '', '', SYSDATETIMEOFFSET()),
(14, 'Jordanian Luxury Hotels', 'hr@luxuryhotels.com', 'password123', 'Aqaba, Jordan', '+962798888889', 'Active', 'Hospitality', '5-star hotels in Aqaba.', '', '', SYSDATETIMEOFFSET()),
(15, 'Kareem Nabil', 'kareem@example.com', 'password123', 'Ajloun, Jordan', '+962789999990', 'Active', 'Logistics', 'Supply chain expert.', '', '', SYSDATETIMEOFFSET()),
(16, 'Jordan Fast Track', 'info@fasttrack.com', 'password123', 'Amman, Jordan', '+962779999999', 'Active', 'Logistics', 'Fast delivery.', '', '', SYSDATETIMEOFFSET()),
(17, 'Hala Mahmoud', 'hala@example.com', 'password123', 'Karak, Jordan', '+962790000001', 'Active', 'Media', 'Journalist.', '', '', SYSDATETIMEOFFSET()),
(18, 'Amman Media Group', 'hr@mediagroup.com', 'password123', 'Amman, Jordan', '+962780000002', 'Active', 'Media', 'News network in Jordan.', '', '', SYSDATETIMEOFFSET()),
(19, 'Tariq Ziad', 'tariqz@example.com', 'password123', 'Tafilah, Jordan', '+962770000003', 'Active', 'IT', 'System Admin.', '', '', SYSDATETIMEOFFSET()),
(20, 'Admin System', 'admin@example.com', 'admin123', 'Amman, Jordan', '+962790000004', 'Active', 'Administration', 'System Administrator.', '', '', SYSDATETIMEOFFSET());
SET IDENTITY_INSERT Users OFF;
GO

-- 3. Roles (20 rows)
SET IDENTITY_INSERT Roles ON;
INSERT INTO Roles (Id, UserId, RoleName) VALUES
(1, 1, 'Job Seeker'),
(2, 2, 'Job Seeker'),
(3, 3, 'Company'),
(4, 4, 'Job Seeker'),
(5, 5, 'Job Seeker'),
(6, 6, 'Company'),
(7, 7, 'Job Seeker'),
(8, 8, 'Company'),
(9, 9, 'Job Seeker'),
(10, 10, 'Company'),
(11, 11, 'Job Seeker'),
(12, 12, 'Company'),
(13, 13, 'Job Seeker'),
(14, 14, 'Company'),
(15, 15, 'Job Seeker'),
(16, 16, 'Company'),
(17, 17, 'Job Seeker'),
(18, 18, 'Company'),
(19, 19, 'Job Seeker'),
(20, 20, 'Admin');
SET IDENTITY_INSERT Roles OFF;
GO

-- 4. Departments (20 rows)
SET IDENTITY_INSERT Departments ON;
INSERT INTO Departments (Id, Name, CreatedAt, UserId) VALUES
(1, 'Technology', SYSDATETIMEOFFSET(), NULL),
(2, 'Design', SYSDATETIMEOFFSET(), NULL),
(3, 'Marketing', SYSDATETIMEOFFSET(), NULL),
(4, 'Finance', SYSDATETIMEOFFSET(), NULL),
(5, 'Healthcare', SYSDATETIMEOFFSET(), NULL),
(6, 'Engineering', SYSDATETIMEOFFSET(), NULL),
(7, 'Sales', SYSDATETIMEOFFSET(), NULL),
(8, 'Human Resources', SYSDATETIMEOFFSET(), NULL),
(9, 'Customer Support', SYSDATETIMEOFFSET(), NULL),
(10, 'Operations', SYSDATETIMEOFFSET(), NULL),
(11, 'Legal', SYSDATETIMEOFFSET(), NULL),
(12, 'Product Management', SYSDATETIMEOFFSET(), NULL),
(13, 'Quality Assurance', SYSDATETIMEOFFSET(), NULL),
(14, 'Research and Development', SYSDATETIMEOFFSET(), NULL),
(15, 'Logistics', SYSDATETIMEOFFSET(), NULL),
(16, 'Administration', SYSDATETIMEOFFSET(), NULL),
(17, 'Public Relations', SYSDATETIMEOFFSET(), NULL),
(18, 'Data Science', SYSDATETIMEOFFSET(), NULL),
(19, 'Security', SYSDATETIMEOFFSET(), NULL),
(20, 'Education', SYSDATETIMEOFFSET(), NULL);
SET IDENTITY_INSERT Departments OFF;
GO

-- 5. Jobs (20 rows)
SET IDENTITY_INSERT Jobs ON;
INSERT INTO Jobs (Id, UserId, Title, Description, Type, WorkMode, Responsibilities, Requirements, DepartmentId, IsSalaryNegotiable, SalaryMin, SalaryMax, Status, Location, Company, PostedDate, ViewsCount) VALUES
(1, 3, 'Senior React Developer', 'Build amazing UIs.', 'Full Time', 'Remote', 'Develop React apps.', '5+ years React', 1, 0, 120000, 160000, 'Active', 'Amman, Jordan', 'Tech Corp', SYSDATETIMEOFFSET(), 0),
(2, 3, 'UI/UX Designer', 'Design clean interfaces.', 'Full Time', 'On-site', 'Create wireframes.', '3+ years experience', 2, 0, 100000, 140000, 'Active', 'Irbid, Jordan', 'Tech Corp', SYSDATETIMEOFFSET(), 0),
(3, 3, 'Backend .NET Developer', 'Develop scalable APIs.', 'Full Time', 'Hybrid', 'Design RESTful APIs.', '4+ years .NET', 1, 0, 110000, 150000, 'Active', 'Amman, Jordan', 'Tech Corp', SYSDATETIMEOFFSET(), 0),
(4, 6, 'Financial Analyst', 'Analyze financial data.', 'Full Time', 'On-site', 'Prepare reports.', 'CFA or CPA preferred', 4, 0, 95000, 130000, 'Active', 'Aqaba, Jordan', 'Jordanian Solutions', SYSDATETIMEOFFSET(), 0),
(5, 6, 'Accountant', 'Manage accounts.', 'Full Time', 'On-site', 'Bookkeeping.', '2+ years experience', 4, 0, 60000, 80000, 'Active', 'Aqaba, Jordan', 'Jordanian Solutions', SYSDATETIMEOFFSET(), 0),
(6, 8, 'Registered Nurse', 'Patient care.', 'Full Time', 'On-site', 'Assist doctors.', 'Nursing degree', 5, 0, 70000, 90000, 'Active', 'Amman, Jordan', 'Health Jordan', SYSDATETIMEOFFSET(), 0),
(7, 8, 'Surgeon', 'Perform surgeries.', 'Full Time', 'On-site', 'Operations.', 'Medical degree', 5, 0, 200000, 300000, 'Active', 'Amman, Jordan', 'Health Jordan', SYSDATETIMEOFFSET(), 0),
(8, 10, 'Civil Engineer', 'Manage construction.', 'Full Time', 'On-site', 'Site management.', 'Engineering degree', 6, 0, 90000, 120000, 'Active', 'Zarqa, Jordan', 'Constructo Jordan', SYSDATETIMEOFFSET(), 0),
(9, 10, 'Project Manager', 'Lead projects.', 'Full Time', 'Hybrid', 'Project planning.', 'PMP certification', 6, 0, 120000, 150000, 'Active', 'Zarqa, Jordan', 'Constructo Jordan', SYSDATETIMEOFFSET(), 0),
(10, 12, 'Store Manager', 'Manage retail store.', 'Full Time', 'On-site', 'Staff management.', '3+ years retail', 7, 0, 50000, 70000, 'Active', 'Amman, Jordan', 'Retail Jordan', SYSDATETIMEOFFSET(), 0),
(11, 12, 'Sales Associate', 'Customer service.', 'Part Time', 'On-site', 'Assist customers.', 'None', 7, 0, 30000, 40000, 'Active', 'Amman, Jordan', 'Retail Jordan', SYSDATETIMEOFFSET(), 0),
(12, 14, 'Hotel Manager', 'Manage hotel ops.', 'Full Time', 'On-site', 'Guest satisfaction.', 'Hospitality degree', 16, 0, 100000, 140000, 'Active', 'Aqaba, Jordan', 'Jordanian Luxury Hotels', SYSDATETIMEOFFSET(), 0),
(13, 14, 'Receptionist', 'Front desk duties.', 'Full Time', 'On-site', 'Check-in guests.', 'Good communication', 16, 0, 40000, 50000, 'Active', 'Aqaba, Jordan', 'Jordanian Luxury Hotels', SYSDATETIMEOFFSET(), 0),
(14, 16, 'Logistics Coordinator', 'Coordinate shipments.', 'Full Time', 'On-site', 'Track deliveries.', '2+ years logistics', 15, 0, 60000, 80000, 'Active', 'Amman, Jordan', 'Jordan Fast Track', SYSDATETIMEOFFSET(), 0),
(15, 16, 'Truck Driver', 'Deliver goods.', 'Full Time', 'On-site', 'Drive trucks.', 'Valid license', 15, 0, 40000, 60000, 'Active', 'Amman, Jordan', 'Jordan Fast Track', SYSDATETIMEOFFSET(), 0),
(16, 18, 'Journalist', 'Write news articles.', 'Full Time', 'Hybrid', 'Investigative reporting.', 'Journalism degree', 17, 0, 70000, 90000, 'Active', 'Amman, Jordan', 'Amman Media Group', SYSDATETIMEOFFSET(), 0),
(17, 18, 'Video Editor', 'Edit news videos.', 'Full Time', 'Remote', 'Video editing.', 'Premiere Pro', 17, 0, 60000, 80000, 'Active', 'Amman, Jordan', 'Amman Media Group', SYSDATETIMEOFFSET(), 0),
(18, 3, 'Data Scientist', 'Analyze big data.', 'Full Time', 'Remote', 'Build ML models.', 'Python, ML', 18, 0, 130000, 170000, 'Active', 'Amman, Jordan', 'Tech Corp', SYSDATETIMEOFFSET(), 0),
(19, 3, 'Security Analyst', 'Maintain security.', 'Full Time', 'Hybrid', 'Monitor threats.', 'Cybersecurity certs', 19, 0, 100000, 140000, 'Active', 'Amman, Jordan', 'Tech Corp', SYSDATETIMEOFFSET(), 0),
(20, 3, 'DevOps Engineer', 'CI/CD pipelines.', 'Full Time', 'Remote', 'Cloud infrastructure.', 'AWS, Docker', 1, 0, 120000, 160000, 'Active', 'Amman, Jordan', 'Tech Corp', SYSDATETIMEOFFSET(), 0);
SET IDENTITY_INSERT Jobs OFF;
GO

-- 6. Resumes (20 rows)
SET IDENTITY_INSERT Resumes ON;
INSERT INTO Resumes (Id, UserId, Name, Email, Phone, Location, Bio) VALUES
(1, 1, 'Ahmad Al-Hassan', 'ahmad@example.com', '+962791234567', 'Amman, Jordan', 'Passionate software engineer.'),
(2, 2, 'Sara Malik', 'sara@example.com', '+962782345678', 'Irbid, Jordan', 'Creative designer.'),
(3, 4, 'Omar Khalid', 'omar@example.com', '+962793456789', 'Zarqa, Jordan', 'Marketing professional.'),
(4, 5, 'Laila Majnun', 'laila@example.com', '+962791112223', 'Amman, Jordan', 'Dedicated educator.'),
(5, 7, 'Yousef Ali', 'yousef@example.com', '+962771234567', 'Salt, Jordan', 'Caring nurse.'),
(6, 9, 'Nour Hassan', 'nour@example.com', '+962785555555', 'Madaba, Jordan', 'Detail-oriented engineer.'),
(7, 11, 'Zaid Tariq', 'zaid@example.com', '+962796666666', 'Mafraq, Jordan', 'Experienced manager.'),
(8, 13, 'Fatima Saeed', 'fatima@example.com', '+962778888888', 'Jerash, Jordan', 'Hospitality expert.'),
(9, 15, 'Kareem Nabil', 'kareem@example.com', '+962789999990', 'Ajloun, Jordan', 'Logistics specialist.'),
(10, 17, 'Hala Mahmoud', 'hala@example.com', '+962790000001', 'Karak, Jordan', 'Truth-seeking journalist.'),
(11, 19, 'Tariq Ziad', 'tariqz@example.com', '+962770000003', 'Tafilah, Jordan', 'Efficient System Admin.'),
(12, 1, 'Ahmad Alternative', 'ahmad2@example.com', '+962791234567', 'Amman, Jordan', 'Alternative resume.'),
(13, 2, 'Sara Portfolio', 'sara2@example.com', '+962782345678', 'Irbid, Jordan', 'Portfolio focus.'),
(14, 4, 'Omar SEO', 'omar2@example.com', '+962793456789', 'Zarqa, Jordan', 'SEO focus.'),
(15, 5, 'Laila Tutor', 'laila2@example.com', '+962791112223', 'Amman, Jordan', 'Tutoring focus.'),
(16, 7, 'Yousef ER', 'yousef2@example.com', '+962771234567', 'Salt, Jordan', 'ER experience.'),
(17, 9, 'Nour Architect', 'nour2@example.com', '+962785555555', 'Madaba, Jordan', 'Architect focus.'),
(18, 11, 'Zaid Sales', 'zaid2@example.com', '+962796666666', 'Mafraq, Jordan', 'Sales focus.'),
(19, 13, 'Fatima Event', 'fatima2@example.com', '+962778888888', 'Jerash, Jordan', 'Event planning.'),
(20, 15, 'Kareem Supply', 'kareem2@example.com', '+962789999990', 'Ajloun, Jordan', 'Supply chain focus.');
SET IDENTITY_INSERT Resumes OFF;
GO
