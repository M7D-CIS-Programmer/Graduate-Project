using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using aabu_project.Models;
using aabu_project.Dtos;
using aabu_project.Data;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;

namespace aabu_project.Services
{
    public class AuthService
    {
        private readonly IConfiguration _configuration;
        private readonly MyDbContext _context;

        public AuthService(IConfiguration configuration, MyDbContext context)
        {
            _configuration = configuration;
            _context = context;
        }

        // =========================
        // REGISTER
        // =========================
        public async Task<AuthResultDto> Register(UserCreateDto dto)
        {
            // Normalize email
            var normalizedEmail = dto.Email.Trim().ToLower();
            var existingUser = await _context.Users.FirstOrDefaultAsync(x => x.Email.ToLower() == normalizedEmail);

            if (existingUser != null)
            {
                return new AuthResultDto
                {
                    Success = false,
                    Message = "Email already exists"
                };
            }

            // Normalize RoleName
            var normalizedRole = dto.RoleName.Trim();
            if (string.Equals(normalizedRole, "Company", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(normalizedRole, "Employer", StringComparison.OrdinalIgnoreCase))
            {
                normalizedRole = "Employer";
            }
            else if (string.Equals(normalizedRole, "Job Seeker", StringComparison.OrdinalIgnoreCase) ||
                     string.Equals(normalizedRole, "JobSeeker", StringComparison.OrdinalIgnoreCase))
            {
                normalizedRole = "Job Seeker";
            }

            var user = new User
            {
                Name = dto.Name,
                Email = normalizedEmail,
                Pass = HashPassword(dto.Pass),
                Location = dto.Location,
                Phone = dto.Phone,
                Website = dto.Website,
                Description = dto.Description,
                Industry = dto.Industry,
                Status = "Active",
                SearchKey = aabu_project.Utilities.SearchUtility.GenerateSearchKey(dto.Name, dto.Industry, dto.Location, dto.Description),
                Roles = new List<Role> { new Role { RoleName = normalizedRole } }
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Generate JWT token
            var token = GenerateJwtToken(user);

            return new AuthResultDto
            {
                Success = true,
                Message = "User registered successfully",
                Token = token,
                User = new AuthResponseDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Role = normalizedRole,
                    Location = user.Location,
                    Phone = user.Phone,
                    Website = user.Website,
                    Description = user.Description,
                    Industry = user.Industry,
                    ProfilePicture = user.ProfilePicture,
                    CreatedAt = user.CreatedAt,
                    Token = token,
                    FollowerCount = 0,
                    AppliedJobs = new List<JobResponseDto>()
                }
            };
        }

        // =========================
        // LOGIN
        // =========================
        public AuthResultDto Login(LoginDto dto)
        {
            var user = _context.Users
                .Include(u => u.Followers)
                .Include(u => u.Applications)
                    .ThenInclude(a => a.Job)
                        .ThenInclude(j => j.Category)
                .Include(u => u.Applications)
                    .ThenInclude(a => a.Job)
                        .ThenInclude(j => j.User)
                            .ThenInclude(u => u.Followers)
                .Include(u => u.Roles)
                .FirstOrDefault(x => x.Email == dto.Email);

            if (user == null)
            {
                return new AuthResultDto
                {
                    Success = false,
                    Message = "Invalid email or password"
                };
            }

            var isValidPassword = VerifyPassword(dto.Password, user.Pass);

            if (!isValidPassword)
            {
                return new AuthResultDto
                {
                    Success = false,
                    Message = "Invalid email or password"
                };
            }

            var token = GenerateJwtToken(user);

            return new AuthResultDto
            {
                Success = true,
                Message = "Login successful",
                Token = token,
                User = new AuthResponseDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Role = user.Roles.FirstOrDefault()?.RoleName,
                    ProfilePicture = user.ProfilePicture,
                    FollowerCount = user.Followers?.Count ?? 0,
                    CreatedAt = user.CreatedAt,
                    Token = token,
                    AppliedJobs = user.Applications.Select(a => new JobResponseDto
                    {
                        Id = a.Job.Id,
                        UserId = a.Job.UserId,
                        Title = a.Job.Title,
                        Description = a.Job.Description,
                        Type = a.Job.Type,
                        WorkMode = a.Job.WorkMode,
                        Responsibilities = a.Job.Responsibilities,
                        Requirements = a.Job.Requirements,
                        CategoryId = a.Job.CategoryId,
                        IsSalaryNegotiable = a.Job.IsSalaryNegotiable,
                        SalaryMin = a.Job.SalaryMin,
                        SalaryMax = a.Job.SalaryMax,
                        Features = a.Job.Features,
                        Status = a.Job.Status,
                        Location = a.Job.Location,
                        Company = a.Job.Company,
                        PostedDate = a.Job.PostedDate,
                        User = new UserDto(
                            a.Job.User.Id,
                            a.Job.User.Name,
                            a.Job.User.Email,
                            a.Job.User.Location,
                            a.Job.User.Website,
                            a.Job.User.Phone,
                            a.Job.User.Description,
                            a.Job.User.LinkedIn,
                            a.Job.User.Github,
                            a.Job.User.Status,
                            a.Job.User.Roles.FirstOrDefault()?.RoleName,
                            a.Job.User.CreatedAt,
                            0,
                            a.Job.User.Industry,
                            a.Job.User.ProfilePicture,
                            a.Job.User.Followers?.Count ?? 0
                        ),
                        Category = new CategoryResponseDto
                        {
                            Id = a.Job.Category.Id,
                            Name = a.Job.Category.Name
                        }
                    }).ToList()
                }
            };
        }

        // =========================
        // JWT GENERATION (your original)
        // =========================
        public string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey is not configured");
            var issuer = jwtSettings["Issuer"] ?? "insightcv";
            var audience = jwtSettings["Audience"] ?? "insightcv-users";
            var expirationMinutes = int.Parse(jwtSettings["ExpirationMinutes"] ?? "1440");

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name),
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // =========================
        // PASSWORD HASHING
        // =========================
        public string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public bool VerifyPassword(string password, string hash)
        {
            try
            {
                // Check if it's a BCrypt hash (starts with $2a$, $2b$, or $2y$)
                if (hash.StartsWith("$2a$") || hash.StartsWith("$2b$") || hash.StartsWith("$2y$"))
                {
                    return BCrypt.Net.BCrypt.Verify(password, hash);
                }
                
                // Fallback for seeded plain-text passwords in development
                return password == hash;
            }
            catch
            {
                // If verification fails or format is wrong, return false
                return false;
            }
        }
    }
}