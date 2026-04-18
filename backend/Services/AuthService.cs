using System;
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
        public AuthResultDto Register(RegisterDto dto)
        {
            var existingUser = _context.Users.FirstOrDefault(x => x.Email == dto.Email);

            if (existingUser != null)
            {
                return new AuthResultDto
                {
                    Success = false,
                    Message = "Email already exists"
                };
            }

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                Pass = HashPassword(dto.Password)
                
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return new AuthResultDto
            {
                Success = true,
                Message = "User registered successfully"
            };
        }

        // =========================
        // LOGIN
        // =========================
        public AuthResultDto Login(LoginDto dto)
        {
            var user = _context.Users.FirstOrDefault(x => x.Email == dto.Email);

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
                    Token = token
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
                return BCrypt.Net.BCrypt.Verify(password, hash);
            }
            catch
            {
                return false;
            }
        }
    }
}