using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Text;
using aabu_project.Data;
using aabu_project.Services;
using aabu_project.Dtos;
using aabu_project.Filters;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<MyDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register AuthService
builder.Services.AddScoped<AuthService>();

// In-memory cache used by CVAnalysisService to avoid duplicate Gemini calls
builder.Services.AddMemoryCache();

// Local analysis engine — singleton, loads job_roles.json once at startup
builder.Services.AddSingleton<CvLocalAnalyzer>();

// CVAnalysisService — typed HttpClient; IMemoryCache + CvLocalAnalyzer injected automatically
builder.Services.AddHttpClient<ICVAnalysisService, CVAnalysisService>();

// InterviewService — typed HttpClient + IMemoryCache for session state
builder.Services.AddHttpClient<IInterviewService, InterviewService>();

// SupportService — platform-focused AI chatbot with response caching
builder.Services.AddHttpClient<ISupportService, SupportService>();

// ── GeminiResumeService ───────────────────────────────────────────────────────
// Named HttpClient with a generous timeout (Gemini on Free Tier can be slow)
// and pre-set Accept header.  IHttpClientFactory handles socket pooling.
builder.Services.AddHttpClient(GeminiResumeService.HttpClientName, client =>
{
    client.Timeout = TimeSpan.FromSeconds(90);           // Free Tier can lag
    client.DefaultRequestHeaders.Add("Accept", "application/json");
});
builder.Services.AddScoped<IGeminiResumeService, GeminiResumeService>();
// ─────────────────────────────────────────────────────────────────────────────

// JWT Configuration
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? "your-super-secret-key-change-this-in-production-min-32-chars";
var issuer = jwtSettings["Issuer"] ?? "insightcv";
var audience = jwtSettings["Audience"] ?? "insightcv-users";

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
        };
    });

// Register the suspension check filter so it can be resolved via DI
builder.Services.AddScoped<CheckSuspendedFilter>();

// Add services to the container.
builder.Services.AddControllers(options =>
    {
        // Apply the suspension check globally — any authenticated request from a
        // suspended user is rejected with 403 ACCOUNT_SUSPENDED before the action runs.
        options.Filters.AddService<CheckSuspendedFilter>();
    })
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy => policy
            .WithOrigins("http://localhost:8080", "http://127.0.0.1:8080", "http://localhost:5173")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

var app = builder.Build();
app.UseCors("AllowReact");


app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

// Add Authentication & Authorization middleware
app.UseAuthentication();
app.UseAuthorization();
app.UseStaticFiles();
app.MapControllers();

app.Run();
