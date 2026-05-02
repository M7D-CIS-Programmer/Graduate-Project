using Microsoft.AspNetCore.Mvc;
using aabu_project.Dtos;
using aabu_project.Services;
using aabu_project.Models;
using Microsoft.EntityFrameworkCore;

namespace aabu_project.Controllers

{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserCreateDto dto)
        {
            var result = await _authService.Register(dto);
            if (!result.Success)
                return BadRequest(new { message = result.Message });

            return Ok(result);
        }

        [HttpPost("login")]
        public IActionResult Login(LoginDto dto)
        {
            var result = _authService.Login(dto);
            if (!result.Success)
                return Unauthorized(result.Message);

            return Ok(result);
        }
    }
}